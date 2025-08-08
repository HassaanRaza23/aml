import { supabase, handleSupabaseError, getCurrentUser, dbHelpers } from '../config/supabase'
import { comprehensiveScreeningMock } from '../mocks'

export const screeningService = {
  // Perform instant screening
  performInstantScreening: async (customerId, searchCriteria) => {
    try {
      const user = await getCurrentUser()
      
      // Create screening record
      const screeningPayload = {
        customer_id: customerId, // Can be null for instant screening
        screening_type: 'Instant',
        status: 'In Progress',
        search_criteria: searchCriteria,
        created_by: user.id,
        created_at: new Date().toISOString()
      }
      
      const screening = await dbHelpers.insert('screenings', screeningPayload)
      
      // Prepare customer data for screening
      const customerData = customerId ? await dbHelpers.get('customers', customerId) : null
      
      // Perform screening using mock API
      const screeningResult = await comprehensiveScreeningMock.performInstantScreening({
        customerId: customerId,
        fullName: customerData ? (customerData.first_name + ' ' + customerData.last_name) : searchCriteria.fullName,
        nationality: customerData ? customerData.nationality : searchCriteria.nationality,
        entityType: customerData ? customerData.entity_type : searchCriteria.entityType,
        ...searchCriteria
      })
      
      // Update screening record with results
      await dbHelpers.update('screenings', screening.id, {
        results: screeningResult.results,
        status: 'Completed',
        completed_at: new Date().toISOString(),
        risk_score: screeningResult.overallRiskScore || 0
      })
      
      // Insert screening matches
      if (screeningResult.results) {
        const allMatches = [
          ...screeningResult.results.dowjones || [],
          ...screeningResult.results.sanctions || [],
          ...screeningResult.results.centralBank || [],
          ...screeningResult.results.companyWhitelist || [],
          ...screeningResult.results.companyBlacklist || [],
          ...screeningResult.results.uaeList || []
        ]
        
        if (allMatches.length > 0) {
          const matchesData = allMatches.map(match => ({
            screening_id: screening.id,
            customer_id: customerId, // Can be null for instant screening
            match_id: match.id,
            match_name: match.name,
            match_source: match.source,
            match_score: match.score,
            match_type: match.recordType,
            match_country: match.country,
            match_details: match
          }))
          
          await supabase.from('screening_matches').insert(matchesData)
        }
      }
      
      // Log screening activity
      await supabase.from('screening_logs').insert({
        screening_id: screening.id,
        customer_id: customerId, // Can be null for instant screening
        action: 'Instant Screening Completed',
        details: `Screening completed with ${screeningResult.totalMatches} matches`,
        created_by: user.id,
        created_at: new Date().toISOString()
      })
      
      return { ...screening, ...screeningResult }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Start ongoing screening
  startOngoingScreening: async (customerId, frequency = 'Daily') => {
    try {
      const user = await getCurrentUser()
      
      const screeningPayload = {
        customer_id: customerId,
        screening_type: 'Ongoing',
        status: 'Active',
        frequency: frequency,
        created_by: user.id,
        created_at: new Date().toISOString()
      }
      
      const screening = await dbHelpers.insert('screenings', screeningPayload)
      
      return screening
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get screening history
  getScreeningHistory: async (customerId, page = 1, limit = 50) => {
    try {
      const options = {
        page,
        limit,
        filters: { customer_id: customerId },
        orderBy: { column: 'created_at', ascending: false }
      }
      
      const result = await dbHelpers.list('screenings', options)
      return result
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get screening results
  getScreeningResults: async (screeningId) => {
    try {
      const { data: screening, error } = await supabase
        .from('screenings')
        .select(`
          *,
          screening_matches(*)
        `)
        .eq('id', screeningId)
        .single()
      
      if (error) handleSupabaseError(error)
      return screening
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Update screening status
  updateScreeningStatus: async (screeningId, status, notes = '') => {
    try {
      const user = await getCurrentUser()
      
      const updatePayload = {
        status: status,
        notes: notes,
        updated_by: user.id,
        updated_at: new Date().toISOString()
      }
      
      if (status === 'Completed') {
        updatePayload.completed_at = new Date().toISOString()
      }
      
      return await dbHelpers.update('screenings', screeningId, updatePayload)
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get screening statistics
  getScreeningStats: async () => {
    try {
      const { data: screenings } = await supabase
        .from('screenings')
        .select('*')
      
      const { data: matches } = await supabase
        .from('screening_matches')
        .select('*')
      
      const stats = {
        total: screenings?.length || 0,
        byType: {
          Instant: screenings?.filter(s => s.screening_type === 'Instant').length || 0,
          Ongoing: screenings?.filter(s => s.screening_type === 'Ongoing').length || 0
        },
        byStatus: {
          'In Progress': screenings?.filter(s => s.status === 'In Progress').length || 0,
          'Completed': screenings?.filter(s => s.status === 'Completed').length || 0,
          'Active': screenings?.filter(s => s.status === 'Active').length || 0
        },
        totalMatches: matches?.length || 0,
        averageRiskScore: screenings?.reduce((sum, s) => sum + (s.risk_score || 0), 0) / (screenings?.length || 1) || 0
      }
      
      return stats
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get ongoing screening results
  getOngoingScreeningResults: async (customerId) => {
    try {
      const { data: results, error } = await supabase
        .from('ongoing_screening_results')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return results
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Perform batch screening
  performBatchScreening: async (customerIds, searchCriteria = {}) => {
    try {
      const user = await getCurrentUser()
      const results = []
      
      for (const customerId of customerIds) {
        const result = await screeningService.performInstantScreening(customerId, searchCriteria)
        results.push(result)
      }
      
      return {
        success: true,
        totalProcessed: customerIds.length,
        results: results,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      handleSupabaseError(error)
    }
  },

  // Get screening logs
  getScreeningLogs: async (filters = {}) => {
    try {
      const options = {
        filters,
        orderBy: { column: 'created_at', ascending: false }
      }
      
      const result = await dbHelpers.list('screening_logs', options)
      return result
    } catch (error) {
      handleSupabaseError(error)
    }
  }
}
