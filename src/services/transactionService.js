import { supabase, handleSupabaseError, getCurrentUser, dbHelpers } from '../config/supabase'
import { transactionRules } from '../data/transactionRules'

// Calculate transaction risk score using file-based rules
const calculateTransactionRisk = (transactionData) => {
  console.log('🔍 Calculating risk score for transaction data:', transactionData)
  
  // Extract risk assessment data if it exists
  const riskData = transactionData.risk_assessment_data || {}
  
  // Create a flattened data object for rule evaluation
  const ruleData = {
    ...transactionData,
    destination_country: riskData.destination_country,
    source_of_funds: riskData.source_of_funds,
    purpose: riskData.purpose,
    is_unusual_pattern: riskData.is_unusual_pattern,
    involves_third_party: riskData.involves_third_party,
    is_structuring: riskData.is_structuring,
    involves_pep: riskData.involves_pep,
    involves_sanctioned_entity: riskData.involves_sanctioned_entity,
    frequency: riskData.frequency
  }
  
  console.log('🔍 Key fields for rules:')
  console.log('  - amount:', ruleData.amount, '(type:', typeof ruleData.amount, ')')
  console.log('  - transaction_type:', ruleData.transaction_type)
  console.log('  - destination_country:', ruleData.destination_country)
  console.log('  - involves_third_party:', ruleData.involves_third_party)
  
  let score = 0
  const triggeredRules = []
  
  transactionRules.forEach(rule => {
    const isTriggered = rule.condition(ruleData)
    if (isTriggered) {
      score += rule.score
      triggeredRules.push({ name: rule.name, score: rule.score })
      console.log(`✅ Rule triggered: ${rule.name} (+${rule.score} points)`)
    } else {
      console.log(`❌ Rule not triggered: ${rule.name}`)
    }
  })
  
  const finalScore = Math.min(score, 100) // Cap at 100
  console.log(`📊 Risk calculation complete: ${score} points, capped to ${finalScore}`)
  console.log('🎯 Triggered rules:', triggeredRules)
  
  return finalScore
}

export const transactionService = {
  // Create a new transaction
  createTransaction: async (transactionData) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock transaction creation (Supabase not configured)')
        
        // Calculate risk score using transaction rules
        console.log('🔍 About to calculate risk score...')
        const riskScore = calculateTransactionRisk(transactionData)
        console.log('📊 Calculated risk score:', riskScore)
        
        const status = riskScore > 50 ? 'Flagged' : 'Normal'
        console.log('📊 Transaction status:', status)
        
        // Create mock transaction data
        const mockTransaction = {
          id: 'mock-transaction-' + Date.now(),
          customer_id: transactionData.customer_id,
          transaction_type: transactionData.transaction_type,
          amount: transactionData.amount,
          currency: transactionData.currency,
          transaction_date: transactionData.transaction_date,
          source_account: transactionData.source_account,
          destination_account: transactionData.destination_account,
          description: transactionData.description,
          risk_score: riskScore,
          status: status,
          created_by: 'mock-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log('📊 Mock transaction created:', mockTransaction)
        console.log('📊 Mock transaction risk score:', mockTransaction.risk_score)
        console.log('📊 Mock transaction status:', mockTransaction.status)
        
        // Create mock alert if transaction is flagged
        if (status === 'Flagged') {
          console.log('🚨 Creating mock alert for flagged transaction...')
          const mockAlert = {
            id: 'mock-alert-' + Date.now(),
            transaction_id: mockTransaction.id,
            customer_id: transactionData.customer_id,
            alert_type: 'High Risk Transaction',
            risk_score: riskScore,
            status: 'Open',
            reason: `Transaction flagged with risk score ${riskScore}`,
            notes: 'Automatically flagged by system',
            created_by: 'mock-user-id',
            created_at: new Date().toISOString()
          }
          console.log('✅ Mock alert created:', mockAlert)
        }
        
        return mockTransaction
      }
      
      console.log('🔗 Creating transaction in real Supabase database...')
      
      const user = await getCurrentUser()
      
      // Calculate risk score
      const riskScore = calculateTransactionRisk(transactionData)
      const status = riskScore > 50 ? 'Flagged' : 'Normal'
      
      // Extract only the columns that exist in the transactions table
      const { risk_assessment_data, ...dbTransactionData } = transactionData
      
      // Create payload with only the exact columns that exist in the transactions table
      const transactionPayload = {
        customer_id: dbTransactionData.customer_id,
        transaction_type: dbTransactionData.transaction_type,
        amount: dbTransactionData.amount,
        currency: dbTransactionData.currency,
        transaction_date: dbTransactionData.transaction_date,
        source_account: dbTransactionData.source_account,
        destination_account: dbTransactionData.destination_account,
        description: dbTransactionData.description,
        risk_score: riskScore,
        status: status,
        created_by: user.id,
        created_at: new Date().toISOString()
        // Note: transactions table doesn't have updated_by column
      }
      
      console.log('📊 Transaction payload being sent to database:', transactionPayload)
      
      // Use direct Supabase insert to avoid audit trigger issues
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert(transactionPayload)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error inserting transaction:', error)
        throw new Error('Failed to create transaction')
      }
      
      console.log('📊 Real transaction created:', transaction)
      console.log('📊 Real transaction risk score:', transaction.risk_score)
      console.log('📊 Real transaction status:', transaction.status)
      
      // Create alert if transaction is flagged
      if (status === 'Flagged') {
        console.log('🚨 Creating alert for flagged transaction...')
        const alertData = {
          transaction_id: transaction.id,
          alert_type: 'High Risk Transaction',
          severity: riskScore >= 80 ? 'Critical' : riskScore >= 60 ? 'High' : 'Medium',
          description: `Transaction flagged with risk score ${riskScore}. Amount: ${transactionData.currency} ${parseFloat(transactionData.amount).toLocaleString()}`,
          status: 'Open',
          created_at: new Date().toISOString()
        }
        
        const { data: alert, error: alertError } = await supabase
          .from('transaction_alerts')
          .insert(alertData)
          .select()
          .single()
        
        if (alertError) {
          console.error('❌ Error creating alert:', alertError)
        } else {
          console.log('✅ Alert created successfully:', alert)
        }
      }
      
      return transaction
    } catch (error) {
      console.error('Error creating transaction:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to create transaction'
      }
    }
  },

  // Get transactions with filtering and pagination
  getTransactions: async (page = 1, limit = 50, filters = {}) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock transaction list (Supabase not configured)')
        
        // Return mock transaction data
        const mockTransactions = [
          {
            id: 'mock-transaction-1',
            customer_id: 'mock-customer-1',
            transaction_type: 'Credit',
            amount: '5000',
            currency: 'USD',
            transaction_date: new Date().toISOString(),
            source_account: 'John Doe',
            destination_account: 'Jane Smith',
            description: 'Payment for services',
            risk_score: 20,
            status: 'Normal',
            created_by: 'mock-user-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            customers: {
              id: 'mock-customer-1',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com'
            }
          }
        ]
        
        return { 
          success: true,
          data: mockTransactions, 
          count: mockTransactions.length 
        }
      }
      
      console.log('🔗 Fetching transactions from real Supabase database...')
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          customers (
            id,
            first_name,
            last_name,
            email
          )
        `)
      
      // Add filters
      if (filters.search) {
        query = query.or(`customers.first_name.ilike.%${filters.search}%,customers.last_name.ilike.%${filters.search}%`)
      }
      
      if (filters.date_from) {
        query = query.gte('transaction_date', filters.date_from)
      }
      
      if (filters.date_to) {
        query = query.lte('transaction_date', filters.date_to)
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.risk_score) {
        query = query.gte('risk_score', filters.risk_score)
      }
      
      // Add pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)
      
      // Add ordering
      query = query.order('created_at', { ascending: false })
      
      const { data: transactions, error, count } = await query
      
      if (error) {
        console.error('Supabase query error:', error)
        return { 
          success: false, 
          error: error.message || 'Failed to fetch transactions'
        }
      }
      
      return { 
        success: true,
        data: transactions || [], 
        count: count || 0
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to fetch transactions'
      }
    }
  },

  // Get transaction by ID
  getTransactionById: async (id) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock transaction details (Supabase not configured)')
        
        // Return mock transaction data
        const mockTransaction = {
          id: id,
          customer_id: 'mock-customer-1',
          transaction_type: 'Credit',
          amount: '5000',
          currency: 'USD',
          transaction_date: new Date().toISOString(),
          source_account: 'John Doe',
          destination_account: 'Jane Smith',
          description: 'Payment for services',
          risk_score: 20,
          status: 'Normal',
          created_by: 'mock-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          customers: {
            id: 'mock-customer-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            risk_level: 'Low'
          },
          transaction_alerts: []
        }
        
        return mockTransaction
      }
      
      console.log('🔗 Fetching transaction details from real Supabase database...')
      
      const { data: transaction, error } = await supabase
        .from('transactions')
        .select(`
          *,
          customers (*),
          transaction_alerts (*)
        `)
        .eq('id', id)
        .single()
      
      if (error) {
        console.error('Supabase query error:', error)
        throw new Error(error.message || 'Failed to fetch transaction details')
      }
      
      return transaction
    } catch (error) {
      console.error('Error fetching transaction details:', error)
      throw new Error(error.message || 'Failed to fetch transaction details')
    }
  },

  // Update transaction
  updateTransaction: async (id, updateData) => {
    try {
      const user = await getCurrentUser()
      
      const updatePayload = {
        ...updateData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      // Recalculate risk score if transaction data changed
      if (updateData.risk_score === undefined) {
        const transaction = await transactionService.getTransactionById(id)
        const riskScore = calculateTransactionRisk({ ...transaction, ...updateData })
        const status = riskScore > 50 ? 'Flagged' : 'Normal'
        updatePayload.risk_score = riskScore
        updatePayload.status = status
      }
      
      return await dbHelpers.update('transactions', id, updatePayload)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Flag transaction
  flagTransaction: async (id, reason = 'Manual flag') => {
    try {
      const user = await getCurrentUser()
      
      const updatePayload = {
        status: 'Flagged',
        flag_reason: reason,
        flagged_by: user.id,
        flagged_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      const transaction = await dbHelpers.update('transactions', id, updatePayload)
      
      // Create alert
      await supabase.from('transaction_alerts').insert({
        transaction_id: id,
        customer_id: transaction.customer_id,
        alert_type: 'Manual Flag',
        risk_score: transaction.risk_score,
        status: 'Open',
        reason: reason,
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      
      return transaction
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Block transaction
  blockTransaction: async (id, reason = 'Manual block') => {
    try {
      const user = await getCurrentUser()
      
      const updatePayload = {
        status: 'Blocked',
        block_reason: reason,
        blocked_by: user.id,
        blocked_at: new Date().toISOString(),
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      return await dbHelpers.update('transactions', id, updatePayload)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get transaction alerts
  getTransactionAlerts: async (filters = {}) => {
    try {
      const options = {
        filters,
        orderBy: { column: 'created_at', ascending: false }
      }
      
      const result = await dbHelpers.list('transaction_alerts', options)
      return result
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update alert status
  updateAlertStatus: async (alertId, status, notes = '') => {
    try {
      const user = await getCurrentUser()
      
      const updatePayload = {
        status: status,
        notes: notes,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      if (status === 'Resolved') {
        updatePayload.resolved_at = new Date().toISOString()
      }
      
      return await dbHelpers.update('transaction_alerts', alertId, updatePayload)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get transaction statistics
  getTransactionStats: async () => {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
      
      const { data: alerts } = await supabase
        .from('transaction_alerts')
        .select('*')
      
      const stats = {
        total: transactions?.length || 0,
        byStatus: {
          Normal: transactions?.filter(t => t.status === 'Normal').length || 0,
          Flagged: transactions?.filter(t => t.status === 'Flagged').length || 0,
          Blocked: transactions?.filter(t => t.status === 'Blocked').length || 0
        },
        byRiskLevel: {
          Low: transactions?.filter(t => t.risk_score < 40).length || 0,
          Medium: transactions?.filter(t => t.risk_score >= 40 && t.risk_score < 70).length || 0,
          High: transactions?.filter(t => t.risk_score >= 70).length || 0
        },
        totalAlerts: alerts?.length || 0,
        openAlerts: alerts?.filter(a => a.status === 'Open').length || 0,
        totalAmount: transactions?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0,
        averageRiskScore: transactions?.reduce((sum, t) => sum + (t.risk_score || 0), 0) / (transactions?.length || 1) || 0
      }
      
      return stats
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get transactions by customer
  getTransactionsByCustomer: async (customerId, page = 1, limit = 50) => {
    try {
      const options = {
        page,
        limit,
        filters: { customer_id: customerId },
        orderBy: { column: 'created_at', ascending: false }
      }
      
      const result = await dbHelpers.list('transactions', options)
      return result
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Create alerts for existing flagged transactions (utility function)
  createAlertsForExistingFlaggedTransactions: async () => {
    try {
      console.log('🔍 Checking for existing flagged transactions without alerts...')
      
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        console.log('🔧 Mock mode: Skipping alert creation for existing transactions')
        return { success: true, message: 'Mock mode - no real database operations' }
      }
      
      // Get all flagged transactions
      const { data: flaggedTransactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'Flagged')
      
      if (txError) {
        console.error('Error fetching flagged transactions:', txError)
        return { success: false, error: txError.message }
      }
      
      console.log(`📊 Found ${flaggedTransactions?.length || 0} flagged transactions`)
      
      // Get existing alerts to avoid duplicates
      const { data: existingAlerts, error: alertError } = await supabase
        .from('transaction_alerts')
        .select('transaction_id')
      
      if (alertError) {
        console.error('Error fetching existing alerts:', alertError)
        return { success: false, error: alertError.message }
      }
      
      const existingAlertTransactionIds = existingAlerts?.map(alert => alert.transaction_id) || []
      console.log(`📊 Found ${existingAlertTransactionIds.length} existing alerts`)
      
      // Find flagged transactions without alerts
      const transactionsNeedingAlerts = flaggedTransactions?.filter(tx => 
        !existingAlertTransactionIds.includes(tx.id)
      ) || []
      
      console.log(`📊 Found ${transactionsNeedingAlerts.length} flagged transactions without alerts`)
      
      if (transactionsNeedingAlerts.length === 0) {
        return { success: true, message: 'All flagged transactions already have alerts' }
      }
      
      // Create alerts for missing transactions
      const user = await getCurrentUser()
      const alertsToCreate = transactionsNeedingAlerts.map(tx => ({
        transaction_id: tx.id,
        customer_id: tx.customer_id,
        alert_type: 'High Risk Transaction',
        risk_score: tx.risk_score,
        status: 'Open',
        reason: `Transaction flagged with risk score ${tx.risk_score}`,
        notes: 'Automatically flagged by system (backfill)',
        created_by: user.id,
        created_at: new Date().toISOString()
      }))
      
      const { data: createdAlerts, error: createError } = await supabase
        .from('transaction_alerts')
        .insert(alertsToCreate)
        .select()
      
      if (createError) {
        console.error('Error creating alerts:', createError)
        return { success: false, error: createError.message }
      }
      
      console.log(`✅ Created ${createdAlerts?.length || 0} alerts for existing flagged transactions`)
      return { 
        success: true, 
        message: `Created ${createdAlerts?.length || 0} alerts for existing flagged transactions`,
        createdCount: createdAlerts?.length || 0
      }
      
    } catch (error) {
      console.error('Error creating alerts for existing transactions:', error)
      return { success: false, error: error.message }
    }
  }
}
