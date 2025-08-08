import { supabase, handleSupabaseError, getCurrentUser, dbHelpers } from '../config/supabase'

// Generate case number
const generateCaseNumber = () => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `CASE-${timestamp}-${random}`
}

export const caseService = {
  // Create a new case
  createCase: async (caseData) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock case creation (Supabase not configured)')
        
        const caseNumber = generateCaseNumber()
        
        // Create mock case data
        const mockCase = {
          id: 'mock-case-' + Date.now(),
          ...caseData,
          case_number: caseNumber,
          status: caseData.status || 'Open',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        
        console.log('📋 Mock case created:', mockCase)
        
        return mockCase
      }
      
      console.log('🔗 Creating case in real Supabase database...')
      
      const user = await getCurrentUser()
      
      const caseNumber = generateCaseNumber()
      
      const casePayload = {
        ...caseData,
        case_number: caseNumber,
        status: caseData.status || 'Open',
        created_by: user.id,
        created_at: new Date().toISOString()
      }
      
      const caseRecord = await dbHelpers.insert('cases', casePayload)
      
      return caseRecord
    } catch (error) {
      console.error('Error creating case:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to create case'
      }
    }
  },

  // Get cases with filtering and pagination
  getCases: async (page = 1, limit = 50, filters = {}) => {
    try {
      let query = supabase
        .from('cases')
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
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      
      if (filters.risk_level) {
        query = query.eq('risk_level', filters.risk_level)
      }
      
      if (filters.case_type) {
        query = query.eq('case_type', filters.case_type)
      }
      
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to)
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
      
      const { data: cases, error, count } = await query
      
      if (error) handleSupabaseError(error)
      return { data: cases, count }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get case by ID with all related data
  getCaseById: async (id) => {
    try {
      const { data: caseRecord, error } = await supabase
        .from('cases')
        .select(`
          *,
          customers (*),
          case_details (*),
          case_actions (*)
        `)
        .eq('id', id)
        .single()
      
      if (error) handleSupabaseError(error)
      return caseRecord
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update case
  updateCase: async (id, updateData) => {
    try {
      const user = await getCurrentUser()
      
      const updatePayload = {
        ...updateData,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      return await dbHelpers.update('cases', id, updatePayload)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Assign case
  assignCase: async (caseId, assignedTo, notes = '') => {
    try {
      const user = await getCurrentUser()
      
      const updatePayload = {
        assigned_to: assignedTo,
        assigned_at: new Date().toISOString(),
        assigned_by: user.id,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      const caseRecord = await dbHelpers.update('cases', caseId, updatePayload)
      
      // Add case action
      await caseService.addCaseAction(caseId, {
        action_type: 'Assignment',
        description: `Case assigned to ${assignedTo}`,
        notes: notes
      })
      
      return caseRecord
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Add case action
  addCaseAction: async (caseId, actionData) => {
    try {
      // Check if Supabase is properly configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        // Mock implementation for development
        console.log('🔧 Using mock case action creation (Supabase not configured)')
        
        // Create mock case action data
        const mockAction = {
          id: 'mock-action-' + Date.now(),
          case_id: caseId,
          ...actionData,
          created_at: new Date().toISOString()
        }
        
        console.log('📝 Mock case action created:', mockAction)
        
        return mockAction
      }
      
      console.log('🔗 Creating case action in real Supabase database...')
      
      const user = await getCurrentUser()
      
      const actionPayload = {
        case_id: caseId,
        ...actionData,
        created_by: user.id,
        created_at: new Date().toISOString()
      }
      
      return await dbHelpers.insert('case_actions', actionPayload)
    } catch (error) {
      console.error('Error creating case action:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to create case action'
      }
    }
  },

  // Update case status
  updateCaseStatus: async (caseId, status, notes = '') => {
    try {
      const user = await getCurrentUser()
      
      const updatePayload = {
        status: status,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      if (status === 'Resolved') {
        updatePayload.resolved_at = new Date().toISOString()
      }
      
      const caseRecord = await dbHelpers.update('cases', caseId, updatePayload)
      
      // Add case action
      await caseService.addCaseAction(caseId, {
        action_type: 'Status Change',
        description: `Case status changed to ${status}`,
        notes: notes
      })
      
      return caseRecord
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Resolve case
  resolveCase: async (caseId, resolutionData) => {
    try {
      const user = await getCurrentUser()
      
      // Update case status
      await caseService.updateCaseStatus(caseId, 'Resolved')
      
      // Add resolution details
      const resolutionPayload = {
        case_id: caseId,
        resolution_type: resolutionData.resolution_type,
        resolution_details: resolutionData.resolution_details,
        outcome: resolutionData.outcome,
        created_by: user.id,
        created_at: new Date().toISOString()
      }
      
      await dbHelpers.insert('resolved_cases', resolutionPayload)
      
      return { success: true, message: 'Case resolved successfully' }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get case actions
  getCaseActions: async (caseId) => {
    try {
      const { data: actions, error } = await supabase
        .from('case_actions')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true })
      
      if (error) handleSupabaseError(error)
      return actions
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get case statistics
  getCaseStats: async () => {
    try {
      const { data: cases } = await supabase
        .from('cases')
        .select('*')
      
      const stats = {
        total: cases?.length || 0,
        byStatus: {
          Open: cases?.filter(c => c.status === 'Open').length || 0,
          'In Progress': cases?.filter(c => c.status === 'In Progress').length || 0,
          Resolved: cases?.filter(c => c.status === 'Resolved').length || 0,
          Closed: cases?.filter(c => c.status === 'Closed').length || 0
        },
        byRiskLevel: {
          Low: cases?.filter(c => c.risk_level === 'Low').length || 0,
          Medium: cases?.filter(c => c.risk_level === 'Medium').length || 0,
          High: cases?.filter(c => c.risk_level === 'High').length || 0
        },
        byType: {
          Screening: cases?.filter(c => c.case_type === 'Screening').length || 0,
          Transaction: cases?.filter(c => c.case_type === 'Transaction').length || 0,
          KYC: cases?.filter(c => c.case_type === 'KYC').length || 0
        },
        averageResolutionTime: 0 // Calculate based on resolved cases
      }
      
      return stats
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get cases by customer
  getCasesByCustomer: async (customerId, page = 1, limit = 50) => {
    try {
      const options = {
        page,
        limit,
        filters: { customer_id: customerId },
        orderBy: { column: 'created_at', ascending: false }
      }
      
      const result = await dbHelpers.list('cases', options)
      return result
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get cases by assigned user
  getCasesByAssignedUser: async (userId, page = 1, limit = 50) => {
    try {
      const options = {
        page,
        limit,
        filters: { assigned_to: userId },
        orderBy: { column: 'created_at', ascending: false }
      }
      
      const result = await dbHelpers.list('cases', options)
      return result
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}
