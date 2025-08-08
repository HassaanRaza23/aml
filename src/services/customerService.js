import { supabase, handleSupabaseError, getCurrentUser, dbHelpers } from '../config/supabase'
import { calculateRiskScore } from '../utils/riskCalculation'

export const customerService = {
  // Create a new customer
  createCustomer: async (customerData) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock customer creation (Supabase not configured)')
        
        // Calculate risk score
        const riskScore = calculateRiskScore(customerData)
        const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low'
        
        // Create mock customer data
        const mockCustomer = {
          id: 'mock-' + Date.now(),
          ...customerData,
          risk_score: riskScore,
          risk_level: riskLevel,
          kyc_status: 'Pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        return { 
          success: true, 
          data: mockCustomer,
          message: 'Customer created successfully (Mock Mode)'
        }
      }
      
      console.log('🔗 Creating customer in real Supabase database...')
      
      // Real Supabase implementation
      const user = await getCurrentUser()
      
      // Prepare customer payload
      const customerPayload = {
        ...customerData,
        created_by: user.id || null, // Make it optional if no user
        updated_by: user.id || null, // Add updated_by field
        created_at: new Date().toISOString()
      }
      
      // Insert customer
      const customer = await dbHelpers.insert('customers', customerPayload)
      
      // Calculate risk score
      const riskScore = calculateRiskScore(customerData)
      const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low'
      
      // Update customer with risk score
      await dbHelpers.update('customers', customer.id, {
        risk_score: riskScore,
        risk_level: riskLevel
      })
      
      // Insert related data if provided
      if (customerData.shareholders && customerData.shareholders.length > 0) {
        const shareholdersData = customerData.shareholders.map(shareholder => ({
          customer_id: customer.id,
          ...shareholder
        }))
        await supabase.from('customer_shareholders').insert(shareholdersData)
      }
      
      if (customerData.directors && customerData.directors.length > 0) {
        const directorsData = customerData.directors.map(director => ({
          customer_id: customer.id,
          ...director
        }))
        await supabase.from('customer_directors').insert(directorsData)
      }
      
      if (customerData.bank_details && customerData.bank_details.length > 0) {
        const bankDetailsData = customerData.bank_details.map(bank => ({
          customer_id: customer.id,
          ...bank
        }))
        await supabase.from('customer_bank_details').insert(bankDetailsData)
      }
      
      if (customerData.ubos && customerData.ubos.length > 0) {
        const ubosData = customerData.ubos.map(ubo => ({
          customer_id: customer.id,
          ...ubo
        }))
        await supabase.from('customer_ubos').insert(ubosData)
      }
      
      return { 
        success: true, 
        data: { ...customer, risk_score: riskScore, risk_level: riskLevel },
        message: 'Customer created successfully'
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to create customer'
      }
    }
  },

  // Get customers with pagination and filtering
  getCustomers: async (page = 1, limit = 50, filters = {}) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock customer list (Supabase not configured)')
        
        // Return mock customer data
        const mockCustomers = [
          {
            id: 'mock-1',
            first_name: 'John',
            last_name: 'Doe',
            customer_type: 'Natural Person',
            email: 'john.doe@example.com',
            risk_score: 25,
            risk_level: 'Low',
            kyc_status: 'Pending',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-2',
            first_name: 'Jane',
            last_name: 'Smith',
            customer_type: 'Natural Person',
            email: 'jane.smith@example.com',
            risk_score: 65,
            risk_level: 'Medium',
            kyc_status: 'Approved',
            created_at: new Date().toISOString()
          }
        ]
        
        return { 
          success: true,
          data: mockCustomers, 
          count: mockCustomers.length 
        }
      }
      
      console.log('🔗 Fetching customers from real Supabase database...')
      
      const options = {
        page,
        limit,
        filters,
        orderBy: { column: 'created_at', ascending: false }
      }
      
      const result = await dbHelpers.list('customers', options)
      return { 
        success: true,
        data: result.data || result,
        count: result.count || (result.data ? result.data.length : 0)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to fetch customers'
      }
    }
  },

  // Get customer by ID with all related data
  getCustomerById: async (id) => {
    try {
      const { data: customer, error } = await supabase
        .from('customers')
        .select(`
          *,
          customer_shareholders(*),
          customer_directors(*),
          customer_bank_details(*),
          customer_ubos(*)
        `)
        .eq('id', id)
        .single()
      
      if (error) handleSupabaseError(error)
      return customer
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update customer
  updateCustomer: async (id, updateData) => {
    try {
      const user = await getCurrentUser()
      
      const updatePayload = {
        ...updateData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      // Recalculate risk score if customer data changed
      if (updateData.risk_score === undefined) {
        const customer = await customerService.getCustomerById(id)
        const riskScore = calculateRiskScore({ ...customer, ...updateData })
        const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low'
        updatePayload.risk_score = riskScore
        updatePayload.risk_level = riskLevel
      }
      
      const result = await dbHelpers.update('customers', id, updatePayload)
      return { success: true, data: result, message: 'Customer updated successfully' }
    } catch (error) {
      console.error('Error updating customer:', error)
      return { success: false, error: error.message || 'Failed to update customer' }
    }
  },

  // Update KYC status
  updateKYCStatus: async (customerId, kycData) => {
    try {
      const user = await getCurrentUser()
      
      // Update KYC details
      const kycPayload = {
        customer_id: customerId,
        ...kycData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      // Check if KYC record exists
      const { data: existingKYC } = await supabase
        .from('kyc_details')
        .select('id')
        .eq('customer_id', customerId)
        .single()
      
      if (existingKYC) {
        await dbHelpers.update('kyc_details', existingKYC.id, kycPayload)
      } else {
        await dbHelpers.insert('kyc_details', kycPayload)
      }
      
      // Log KYC status change
      await supabase.from('kyc_status_logs').insert({
        customer_id: customerId,
        status: kycData.status,
        reason: kycData.reason || '',
        updated_by: user.id,
        created_at: new Date().toISOString()
      })
      
      return { success: true, message: 'KYC status updated successfully' }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update risk profile
  updateRiskProfile: async (customerId, riskData) => {
    try {
      const user = await getCurrentUser()
      
      const riskPayload = {
        customer_id: customerId,
        ...riskData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      // Check if risk override exists
      const { data: existingRisk } = await supabase
        .from('risk_profile_overrides')
        .select('id')
        .eq('customer_id', customerId)
        .single()
      
      if (existingRisk) {
        await dbHelpers.update('risk_profile_overrides', existingRisk.id, riskPayload)
      } else {
        await dbHelpers.insert('risk_profile_overrides', riskPayload)
      }
      
      return { success: true, message: 'Risk profile updated successfully' }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get customer statistics
  getCustomerStats: async () => {
    try {
      const { data: totalCustomers } = await supabase
        .from('customers')
        .select('id', { count: 'exact' })
      
      const { data: riskDistribution } = await supabase
        .from('customers')
        .select('risk_level')
      
      const stats = {
        total: totalCustomers?.length || 0,
        byRiskLevel: {
          Low: riskDistribution?.filter(c => c.risk_level === 'Low').length || 0,
          Medium: riskDistribution?.filter(c => c.risk_level === 'Medium').length || 0,
          High: riskDistribution?.filter(c => c.risk_level === 'High').length || 0
        },
        byStatus: {
          Active: riskDistribution?.filter(c => c.status === 'Active').length || 0,
          Inactive: riskDistribution?.filter(c => c.status === 'Inactive').length || 0
        }
      }
      
      return stats
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Search customers
  searchCustomers: async (searchTerm, filters = {}) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock customer search (Supabase not configured)')
        
        // Return mock customer data that matches search term
        const mockCustomers = [
          {
            id: 'mock-1',
            first_name: 'John',
            last_name: 'Doe',
            customer_type: 'Natural Person',
            email: 'john.doe@example.com',
            risk_score: 25,
            risk_level: 'Low',
            kyc_status: 'Pending',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-2',
            first_name: 'Jane',
            last_name: 'Smith',
            customer_type: 'Natural Person',
            email: 'jane.smith@example.com',
            risk_score: 65,
            risk_level: 'Medium',
            kyc_status: 'Approved',
            created_at: new Date().toISOString()
          },
          {
            id: 'mock-3',
            first_name: 'Michael',
            last_name: 'Johnson',
            customer_type: 'Legal Entities',
            email: 'michael.johnson@example.com',
            risk_score: 85,
            risk_level: 'High',
            kyc_status: 'Under Review',
            created_at: new Date().toISOString()
          }
        ]
        
        // Filter mock customers based on search term
        const filteredCustomers = mockCustomers.filter(customer => 
          customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        
        return { 
          success: true,
          data: filteredCustomers
        }
      }
      
      console.log('🔗 Searching customers in real Supabase database...')
      
      let query = supabase
        .from('customers')
        .select('*')
        .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      
      // Add additional filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value)
        }
      })
      
      const { data: customers, error } = await query
      
      if (error) {
        console.error('Supabase search error:', error)
        return { success: false, error: error.message }
      }
      
      return { 
        success: true,
        data: customers || []
      }
    } catch (error) {
      console.error('Error searching customers:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to search customers'
      }
    }
  },

  // Re-evaluate risk scores for all customers
  reEvaluateAllRiskScores: async () => {
    try {
      console.log('🔄 Starting risk score re-evaluation for all customers...')
      
      // Get all customers
      const result = await customerService.getCustomers(1, 1000) // Get all customers
      if (!result.success) {
        return { success: false, error: result.error }
      }
      
      const customers = result.data
      let updatedCount = 0
      let errorCount = 0
      
      // Re-evaluate each customer
      for (const customer of customers) {
        try {
          // Calculate new risk score with updated rules
          const riskScore = calculateRiskScore(customer)
          const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low'
          
          // Update customer with new risk score
          await customerService.updateCustomer(customer.id, {
            risk_score: riskScore,
            risk_level: riskLevel
          })
          
          updatedCount++
        } catch (error) {
          console.error(`Error updating customer ${customer.id}:`, error)
          errorCount++
        }
      }
      
      console.log(`✅ Risk re-evaluation completed: ${updatedCount} updated, ${errorCount} errors`)
      
      return { 
        success: true, 
        message: `Re-evaluated ${updatedCount} customers successfully`,
        updatedCount,
        errorCount
      }
    } catch (error) {
      console.error('Error in risk re-evaluation:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to re-evaluate risk scores'
      }
    }
  },

  // Re-evaluate risk score for a single customer
  reEvaluateCustomerRiskScore: async (customerId) => {
    try {
      const customer = await customerService.getCustomerById(customerId)
      if (!customer) {
        return { success: false, error: 'Customer not found' }
      }
      
      // Calculate new risk score with updated rules
      const riskScore = calculateRiskScore(customer)
      const riskLevel = riskScore >= 70 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low'
      
      // Update customer with new risk score
      await customerService.updateCustomer(customerId, {
        risk_score: riskScore,
        risk_level: riskLevel
      })
      
      return { 
        success: true, 
        message: 'Risk score updated successfully',
        data: { risk_score: riskScore, risk_level: riskLevel }
      }
    } catch (error) {
      console.error('Error re-evaluating customer risk score:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to re-evaluate risk score'
      }
    }
  }
}
