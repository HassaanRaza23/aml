import { supabase, handleSupabaseError, getCurrentUser, dbHelpers } from '../config/supabase'

export const alertService = {
  // Get alerts with filtering and pagination
  getAlerts: async (page = 1, limit = 50, filters = {}) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock alert list (Supabase not configured)')
        
        // Return mock alert data
        const mockAlerts = [
          {
            id: 'mock-alert-1',
            transaction_id: 'mock-transaction-1',
            alert_type: 'High Risk Transaction',
            severity: 'High',
            description: 'Transaction flagged with risk score 85. Amount: USD 50,000',
            status: 'Open',
            created_at: new Date().toISOString(),
            transactions: {
              id: 'mock-transaction-1',
              amount: '50000',
              transaction_type: 'Credit',
              currency: 'USD',
              customer_id: 'mock-customer-1',
              customers: {
                id: 'mock-customer-1',
                first_name: 'John',
                last_name: 'Doe'
              }
            }
          },
          {
            id: 'mock-alert-2',
            transaction_id: 'mock-transaction-2',
            alert_type: 'Suspicious Pattern',
            severity: 'Medium',
            description: 'Transaction flagged with risk score 65. Amount: USD 1,500',
            status: 'In Progress',
            created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            transactions: {
              id: 'mock-transaction-2',
              amount: '1500',
              transaction_type: 'Debit',
              currency: 'USD',
              customer_id: 'mock-customer-2',
              customers: {
                id: 'mock-customer-2',
                first_name: 'Jane',
                last_name: 'Smith'
              }
            }
          }
        ]
        
        return { 
          success: true,
          data: mockAlerts, 
          count: mockAlerts.length 
        }
      }
      
      console.log('🔗 Fetching alerts from real Supabase database...')
      
      let query = supabase
        .from('transaction_alerts')
        .select(`
          *,
          transactions (
            id,
            amount,
            transaction_type,
            currency,
            customer_id,
            customers (
              id,
              first_name,
              last_name
            )
          )
        `)
      
      console.log('🔍 Base query created, adding filters...')
      
      // Add filters
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.alert_type) {
        query = query.eq('alert_type', filters.alert_type)
      }
      
      if (filters.risk_score) {
        query = query.gte('risk_score', filters.risk_score)
      }
      
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }
      
      // Add pagination
      const from = (page - 1) * limit
      const to = from + limit - 1
      query = query.range(from, to)
      
      // Add ordering
      query = query.order('created_at', { ascending: false })
      
      console.log('🔍 Executing query...')
      const { data: alerts, error, count } = await query
      
      console.log('📊 Query result:', { alerts, error, count })
      
      if (error) {
        console.error('Supabase query error:', error)
        return { 
          success: false, 
          error: error.message || 'Failed to fetch alerts'
        }
      }
      
      console.log(`✅ Successfully fetched ${alerts?.length || 0} alerts`)
      return { 
        success: true,
        data: alerts || [], 
        count: count || 0
      }
    } catch (error) {
      console.error('Error fetching alerts:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to fetch alerts'
      }
    }
  },

  // Get alert by ID
  getAlertById: async (id) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock alert details (Supabase not configured)')
        
        // Return mock alert data
        const mockAlert = {
          id: id,
          transaction_id: 'mock-transaction-1',
          alert_type: 'High Risk Transaction',
          severity: 'High',
          description: 'Transaction flagged with risk score 85. Amount: USD 50,000',
          status: 'Open',
          created_at: new Date().toISOString(),
          transactions: {
            id: 'mock-transaction-1',
            amount: '50000',
            transaction_type: 'Credit',
            currency: 'USD',
            customer_id: 'mock-customer-1',
            customers: {
              id: 'mock-customer-1',
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@example.com'
            }
          }
        }
        
        return mockAlert
      }
      
      console.log('🔗 Fetching alert details from real Supabase database...')
      console.log('🔍 Alert ID:', id)
      
      const { data: alert, error } = await supabase
        .from('transaction_alerts')
        .select(`
          *,
          transactions (
            *,
            customers (
              id,
              first_name,
              last_name,
              email
            )
          )
        `)
        .eq('id', id)
        .single()
      
      console.log('📊 Query result:', { alert, error })
      
      if (error) {
        console.error('Supabase query error:', error)
        throw new Error(error.message || 'Failed to fetch alert details')
      }
      
      if (!alert) {
        console.error('No alert found with ID:', id)
        throw new Error('Alert not found')
      }
      
      console.log('✅ Alert details fetched successfully:', alert)
      return alert
    } catch (error) {
      console.error('Error fetching alert details:', error)
      throw new Error(error.message || 'Failed to fetch alert details')
    }
  },

  // Update alert status
  updateAlertStatus: async (alertId, status, remarks = '') => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock alert status update (Supabase not configured)')
        console.log(`🔧 Mock: Alert ${alertId} status updated to ${status}`)
        return { success: true, message: 'Alert status updated successfully' }
      }
      
      console.log('🔗 Updating alert status in real Supabase database...')
      console.log('🔍 Alert ID:', alertId, 'New Status:', status, 'Remarks:', remarks)
      
      const user = await getCurrentUser()
      
      const updatePayload = {
        status: status
      }
      
      // Update description if remarks are provided
      if (remarks && remarks.trim()) {
        updatePayload.description = remarks.trim()
      }
      
      // Set resolved fields if status is Resolved or Closed
      if (status === 'Resolved' || status === 'Closed') {
        updatePayload.resolved_at = new Date().toISOString()
        updatePayload.resolved_by = user.id
      }
      
      console.log('📊 Update payload:', updatePayload)
      
      const { data, error } = await supabase
        .from('transaction_alerts')
        .update(updatePayload)
        .eq('id', alertId)
        .select()
        .single()
      
      console.log('📊 Update result:', { data, error })
      
      if (error) {
        console.error('Supabase update error:', error)
        throw new Error(error.message || 'Failed to update alert status')
      }
      
      console.log('✅ Alert status updated successfully:', data)
      return { success: true, data }
    } catch (error) {
      console.error('Error updating alert status:', error)
      throw new Error(error.message || 'Failed to update alert status')
    }
  },

  // Mark alert as read
  markAlertAsRead: async (alertId) => {
    try {
      const user = await getCurrentUser()
      
      const updatePayload = {
        read_at: new Date().toISOString(),
        read_by: user.id,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      return await dbHelpers.update('transaction_alerts', alertId, updatePayload)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Mark multiple alerts as read
  markAlertsAsRead: async (alertIds) => {
    try {
      const user = await getCurrentUser()
      
      const updatePromises = alertIds.map(alertId => 
        alertService.markAlertAsRead(alertId)
      )
      
      await Promise.all(updatePromises)
      
      return { success: true, message: `${alertIds.length} alerts marked as read` }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Create alert
  createAlert: async (alertData) => {
    try {
      const user = await getCurrentUser()
      
      const alertPayload = {
        ...alertData,
        status: 'Open',
        created_by: user.id,
        created_at: new Date().toISOString()
      }
      
      return await dbHelpers.insert('transaction_alerts', alertPayload)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get alert statistics
  getAlertStats: async () => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock alert stats (Supabase not configured)')
        
        // Return mock statistics
        const mockStats = {
          total: 2,
          byStatus: {
            Open: 1,
            'In Progress': 1,
            Resolved: 0,
            Closed: 0
          },
          byType: {
            'High Risk Transaction': 1,
            'Manual Flag': 0,
            'Suspicious Pattern': 1
          },
          unread: 2,
          highRisk: 1,
          averageRiskScore: 75
        }
        
        return mockStats
      }
      
      console.log('🔗 Fetching alert statistics from real Supabase database...')
      
      const { data: alerts, error } = await supabase
        .from('transaction_alerts')
        .select('*')
      
      if (error) {
        console.error('Supabase query error:', error)
        throw new Error(error.message || 'Failed to fetch alert statistics')
      }
      
      const stats = {
        total: alerts?.length || 0,
        byStatus: {
          Open: alerts?.filter(a => a.status === 'Open').length || 0,
          'In Progress': alerts?.filter(a => a.status === 'In Progress').length || 0,
          Resolved: alerts?.filter(a => a.status === 'Resolved').length || 0,
          Closed: alerts?.filter(a => a.status === 'Closed').length || 0
        },
        byType: {
          'High Risk Transaction': alerts?.filter(a => a.alert_type === 'High Risk Transaction').length || 0,
          'Manual Flag': alerts?.filter(a => a.alert_type === 'Manual Flag').length || 0,
          'Suspicious Pattern': alerts?.filter(a => a.alert_type === 'Suspicious Pattern').length || 0
        },
        unread: alerts?.filter(a => !a.read_at).length || 0,
        highRisk: alerts?.filter(a => a.risk_score >= 70).length || 0,
        averageRiskScore: alerts?.reduce((sum, a) => sum + (a.risk_score || 0), 0) / (alerts?.length || 1) || 0
      }
      
      return stats
    } catch (error) {
      console.error('Error fetching alert statistics:', error)
      throw new Error(error.message || 'Failed to fetch alert statistics')
    }
  },

  // Get alerts by customer
  getAlertsByCustomer: async (customerId, page = 1, limit = 50) => {
    try {
      const options = {
        page,
        limit,
        filters: { customer_id: customerId },
        orderBy: { column: 'created_at', ascending: false }
      }
      
      const result = await dbHelpers.list('transaction_alerts', options)
      return result
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get unread alerts count
  getUnreadAlertsCount: async () => {
    try {
      const { data: alerts, error } = await supabase
        .from('transaction_alerts')
        .select('id')
        .is('read_at', null)
        .eq('status', 'Open')
      
      if (error) handleSupabaseError(error)
      return alerts?.length || 0
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get recent alerts
  getRecentAlerts: async (limit = 10) => {
    try {
      const { data: alerts, error } = await supabase
        .from('transaction_alerts')
        .select(`
          *,
          transactions (
            id,
            amount,
            transaction_type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) handleSupabaseError(error)
      return alerts
    } catch (error) {
      handleSupabaseError(error)
    }
  },



  // Create alerts for flagged transactions that don't have alerts
  createAlertsForFlaggedTransactions: async () => {
    try {
      console.log('🔍 Creating alerts for flagged transactions...')
      
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        console.log('🔧 Mock mode - no real database')
        return { success: true, message: 'Mock mode - no real database operations' }
      }
      
      // Get flagged transactions
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
      const alertsToCreate = transactionsNeedingAlerts.map(tx => {
        const severity = tx.risk_score >= 80 ? 'Critical' : tx.risk_score >= 60 ? 'High' : 'Medium'
        return {
          transaction_id: tx.id,
          alert_type: 'High Risk Transaction',
          severity: severity,
          description: `Transaction flagged with risk score ${tx.risk_score}. Amount: ${tx.currency} ${parseFloat(tx.amount).toLocaleString()}`,
          status: 'Open',
          created_at: new Date().toISOString()
        }
      })
      
      console.log('📊 Creating alerts:', alertsToCreate)
      
      const { data: createdAlerts, error: createError } = await supabase
        .from('transaction_alerts')
        .insert(alertsToCreate)
        .select()
      
      if (createError) {
        console.error('Error creating alerts:', createError)
        return { success: false, error: createError.message }
      }
      
      console.log(`✅ Created ${createdAlerts?.length || 0} alerts for flagged transactions`)
      return { 
        success: true, 
        message: `Created ${createdAlerts?.length || 0} alerts for flagged transactions`,
        createdCount: createdAlerts?.length || 0
      }
      
    } catch (error) {
      console.error('Error creating alerts for flagged transactions:', error)
      return { success: false, error: error.message }
    }
  }
}
