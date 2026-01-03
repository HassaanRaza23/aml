import { supabase, handleSupabaseError, getCurrentUser, dbHelpers } from '../config/supabase'
// Note: Transaction risk calculation will be added later when requested
// import { transactionRules } from '../data/transactionRules'

export const transactionService = {
  // Create a new transaction
  createTransaction: async (transactionData) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock transaction creation (Supabase not configured)')
        
        // Create mock transaction data with all fields
        const mockTransaction = {
          id: 'mock-transaction-' + Date.now(),
          customer_id: transactionData.customer_id,
          director_id: transactionData.director_id || null,
          transaction_type: transactionData.transaction_type || transactionData.payment_mode || null,
          amount: transactionData.amount || transactionData.invoice_amount || 0,
          currency: transactionData.currency,
          transaction_date: transactionData.transaction_date || new Date().toISOString(),
          source_account: transactionData.source_account || null,
          destination_account: transactionData.destination_account || null,
          description: transactionData.description || null,
          description_of_report: transactionData.description_of_report || null,
          action_taken_by_reporting_entity: transactionData.action_taken_by_reporting_entity || null,
          internal_reference_number: transactionData.internal_reference_number || null,
          transaction_product: transactionData.transaction_product || null,
          payment_mode: transactionData.payment_mode || null,
          channel: transactionData.channel || null,
          source_of_funds: transactionData.source_of_funds || null,
          transaction_purpose: transactionData.transaction_purpose || null,
          rate: transactionData.rate || null,
          invoice_amount: transactionData.invoice_amount || null,
          item_type: transactionData.item_type || null,
          status_code: transactionData.status_code || null,
          reason: transactionData.reason || null,
          beneficiary_name: transactionData.beneficiary_name || null,
          beneficiary_comments: transactionData.beneficiary_comments || null,
          late_deposit: transactionData.late_deposit || null,
          branch: transactionData.branch || null,
          indemnified_for_repatriation: transactionData.indemnified_for_repatriation || null,
          executed_by: transactionData.executed_by || null,
          amount_lc: transactionData.amount_lc || null,
          estimated_amount: transactionData.estimated_amount || null,
          item_size: transactionData.item_size || null,
          item_unit: transactionData.item_unit || null,
          status_comments: transactionData.status_comments || null,
          carrier_name: transactionData.carrier_name || null,
          carrier_details: transactionData.carrier_details || null,
          is_str_istr: transactionData.is_str_istr || false,
          risk_score: 0, // Risk calculation will be added later
          status: 'Pending', // All new transactions are pending approval
          created_by: 'mock-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log('📊 Mock transaction created:', mockTransaction)
        
        return mockTransaction
      }
      
      console.log('🔗 Creating transaction in real Supabase database...')
      
      const user = await getCurrentUser()
      
      // Extract risk_assessment_data if it exists (for backward compatibility)
      const { risk_assessment_data, ...dbTransactionData } = transactionData
      
      // Create payload with all transaction fields - direct mapping from form data
      const transactionPayload = {
        customer_id: dbTransactionData.customer_id,
        director_id: dbTransactionData.director_id || null,
        transaction_type: dbTransactionData.transaction_type || null,
        amount: dbTransactionData.amount || 0,
        currency: dbTransactionData.currency,
        transaction_date: dbTransactionData.transaction_date || new Date().toISOString(),
        source_account: dbTransactionData.source_account || null,
        destination_account: dbTransactionData.destination_account || null,
        description_of_report: dbTransactionData.description_of_report || null,
        action_taken_by_reporting_entity: dbTransactionData.action_taken_by_reporting_entity || null,
        internal_reference_number: dbTransactionData.internal_reference_number || null,
        transaction_product: dbTransactionData.transaction_product || null,
        payment_mode: dbTransactionData.payment_mode || null,
        channel: dbTransactionData.channel || null,
        source_of_funds: dbTransactionData.source_of_funds || null,
        transaction_purpose: dbTransactionData.transaction_purpose || null,
        rate: dbTransactionData.rate ? parseFloat(dbTransactionData.rate) : null,
        invoice_amount: dbTransactionData.invoice_amount ? parseFloat(dbTransactionData.invoice_amount) : null,
        amount_lc: dbTransactionData.amount_lc ? parseFloat(dbTransactionData.amount_lc) : null,
        estimated_amount: dbTransactionData.estimated_amount ? parseFloat(dbTransactionData.estimated_amount) : null,
        item_type: dbTransactionData.item_type || null,
        item_size: dbTransactionData.item_size || null,
        item_unit: dbTransactionData.item_unit || null,
        status_code: dbTransactionData.status_code || null,
        status_comments: dbTransactionData.status_comments || null,
        beneficiary_name: dbTransactionData.beneficiary_name || null,
        beneficiary_comments: dbTransactionData.beneficiary_comments || null,
        late_deposit: dbTransactionData.late_deposit || null,
        branch: dbTransactionData.branch || null,
        indemnified_for_repatriation: dbTransactionData.indemnified_for_repatriation || null,
        executed_by: dbTransactionData.executed_by || null,
        carrier_name: dbTransactionData.carrier_name || null,
        carrier_details: dbTransactionData.carrier_details || null,
        is_str_istr: dbTransactionData.is_str_istr || false,
        reason: dbTransactionData.reason || null,
        description: dbTransactionData.description || null,
        risk_score: 0, // Default to 0, risk calculation will be added later
        status: 'Pending', // Default status - pending approval
        created_by: user.id,
        created_at: new Date().toISOString()
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
      
      // If search filter is provided, first find matching customer IDs
      let customerIds = null;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        // Search in customers table (email) and detail tables (names)
        const customerIdsSet = new Set();
        
        // Search by email in customers table
        const { data: customersByEmail, error: emailError } = await supabase
          .from('customers')
          .select('id')
          .ilike('email', `%${filters.search}%`)
        
        if (!emailError && customersByEmail) {
          customersByEmail.forEach(c => customerIdsSet.add(c.id));
        }
        
        // Search in natural_person_details
        const { data: npDetails, error: npError } = await supabase
          .from('natural_person_details')
          .select('customer_id')
          .or(`firstname.ilike.%${filters.search}%,lastname.ilike.%${filters.search}%`)
        
        if (!npError && npDetails) {
          npDetails.forEach(d => customerIdsSet.add(d.customer_id));
        }
        
        // Search in legal_entity_details
        const { data: leDetails, error: leError } = await supabase
          .from('legal_entity_details')
          .select('customer_id')
          .or(`legalname.ilike.%${filters.search}%,alias.ilike.%${filters.search}%`)
        
        if (!leError && leDetails) {
          leDetails.forEach(d => customerIdsSet.add(d.customer_id));
        }
        
        if (customerIdsSet.size > 0) {
          customerIds = Array.from(customerIdsSet);
        } else {
          // No matching customers found, return empty result
          return {
            success: true,
            data: [],
            count: 0
          };
        }
      }
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          customers (
            id,
            email,
            customer_type,
            natural_person_details (
              firstname,
              lastname
            ),
            legal_entity_details (
              legalname,
              alias
            )
          )
        `)
      
      // Add filters
      if (customerIds) {
        query = query.in('customer_id', customerIds);
      }
      
      if (filters.dateFrom) {
        query = query.gte('transaction_date', filters.dateFrom)
      }
      
      if (filters.dateTo) {
        query = query.lte('transaction_date', filters.dateTo)
      }
      
      // Handle status filter - support both single status and array of statuses
      if (filters.statusFilter && Array.isArray(filters.statusFilter) && filters.statusFilter.length > 0) {
        // Use 'or' filter for multiple statuses to ensure we get all matches
        if (filters.statusFilter.length === 1) {
          query = query.eq('status', filters.statusFilter[0]);
        } else {
          // Build or filter: status = 'Approved' OR status = 'Rejected'
          // Supabase or syntax: "status.eq.Approved,status.eq.Rejected"
          const orConditions = filters.statusFilter.map(status => `status.eq.${status}`).join(',');
          query = query.or(orConditions);
        }
      } else if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.risk_score) {
        query = query.gte('risk_score', filters.risk_score)
      }
      
      // Filter by XML generation status
      if (filters.xmlGenerated === 'yes') {
        query = query.not('xml_generated_at', 'is', null)
      } else if (filters.xmlGenerated === 'no') {
        query = query.is('xml_generated_at', null)
      }
      
      // Get total count before pagination (with same filters)
      let countQuery = supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
      
      if (customerIds) {
        countQuery = countQuery.in('customer_id', customerIds);
      }
      if (filters.dateFrom) {
        countQuery = countQuery.gte('transaction_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        countQuery = countQuery.lte('transaction_date', filters.dateTo);
      }
      // Handle status filter for count query
      if (filters.statusFilter && Array.isArray(filters.statusFilter) && filters.statusFilter.length > 0) {
        // Use 'or' filter for multiple statuses to ensure we get all matches
        if (filters.statusFilter.length === 1) {
          countQuery = countQuery.eq('status', filters.statusFilter[0]);
        } else {
          // Build or filter: status = 'Approved' OR status = 'Rejected'
          // Supabase or syntax: "status.eq.Approved,status.eq.Rejected"
          const orConditions = filters.statusFilter.map(status => `status.eq.${status}`).join(',');
          countQuery = countQuery.or(orConditions);
        }
      } else if (filters.status) {
        countQuery = countQuery.eq('status', filters.status);
      }
      if (filters.risk_score) {
        countQuery = countQuery.gte('risk_score', filters.risk_score);
      }
      
      // Filter by XML generation status for count
      if (filters.xmlGenerated === 'yes') {
        countQuery = countQuery.not('xml_generated_at', 'is', null)
      } else if (filters.xmlGenerated === 'no') {
        countQuery = countQuery.is('xml_generated_at', null)
      }
      
      const { count: totalCount } = await countQuery;
      
      // Add ordering
      query = query.order('created_at', { ascending: false })
      
      // Add pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)
      
      const { data: transactions, error } = await query
      
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
        count: totalCount || 0
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
          customers (
            id,
            email,
            customer_type,
            natural_person_details (
              firstname,
              lastname
            ),
            legal_entity_details (
              legalname,
              alias
            )
          )
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
      // Note: transactions table doesn't have updated_by column, only created_by
      const updatePayload = {
        ...updateData,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating transaction:', error)
        throw new Error(error.message || 'Failed to update transaction')
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Error updating transaction:', error)
      handleSupabaseError(error)
      throw error
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
        updated_at: new Date().toISOString()
      }
      
      return await dbHelpers.update('transactions', id, updatePayload)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Approve transaction
  approveTransaction: async (id) => {
    try {
      const user = await getCurrentUser()
      
      const updatePayload = {
        status: 'Approved',
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data: transaction, error } = await supabase
        .from('transactions')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error approving transaction:', error)
        throw new Error(error.message || 'Failed to approve transaction')
      }
      
      return transaction
    } catch (error) {
      console.error('Error approving transaction:', error)
      throw new Error(error.message || 'Failed to approve transaction')
    }
  },

  // Reject transaction
  rejectTransaction: async (id, reason = '') => {
    try {
      const user = await getCurrentUser()
      
      const updatePayload = {
        status: 'Rejected',
        rejection_reason: reason,
        approved_by: user.id, // Using approved_by to track who rejected it
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { data: transaction, error } = await supabase
        .from('transactions')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error rejecting transaction:', error)
        throw new Error(error.message || 'Failed to reject transaction')
      }
      
      return transaction
    } catch (error) {
      console.error('Error rejecting transaction:', error)
      throw new Error(error.message || 'Failed to reject transaction')
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
  },

  // Save XML to history
  saveXmlHistory: async (transactionId, xmlContent, notes = '') => {
    try {
      const user = await getCurrentUser()
      
      // Get the latest version number for this transaction
      const { data: latestVersion, error: versionError } = await supabase
        .from('transaction_xml_history')
        .select('version_number')
        .eq('transaction_id', transactionId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()
      
      const nextVersion = latestVersion ? latestVersion.version_number + 1 : 1
      
      const { data, error } = await supabase
        .from('transaction_xml_history')
        .insert({
          transaction_id: transactionId,
          xml_content: xmlContent,
          generated_by: user.id,
          version_number: nextVersion,
          notes: notes || `XML generated - Version ${nextVersion}`
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error saving XML history:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Error saving XML history:', error)
      return { success: false, error: error.message }
    }
  },

  // Get XML history for a transaction
  getXmlHistory: async (transactionId) => {
    try {
      const { data, error } = await supabase
        .from('transaction_xml_history')
        .select(`
          *,
          generated_by_user:users!transaction_xml_history_generated_by_fkey (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('transaction_id', transactionId)
        .order('version_number', { ascending: false })
      
      if (error) {
        console.error('Error fetching XML history:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching XML history:', error)
      return { success: false, error: error.message }
    }
  },

  // Get latest XML for a transaction
  getLatestXml: async (transactionId) => {
    try {
      const { data, error } = await supabase
        .from('transaction_xml_history')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No XML found
          return { success: true, data: null }
        }
        console.error('Error fetching latest XML:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching latest XML:', error)
      return { success: false, error: error.message }
    }
  }
}
