import { supabase, handleSupabaseError, getCurrentUser } from '../config/supabase'

export const transactionActivityRuleService = {
  // Get all transaction activity rules
  getTransactionActivityRules: async () => {
    try {
      const { data, error } = await supabase
        .from('transaction_activity_rules')
        .select('*')
        .order('rule_number', { ascending: true })

      if (error) {
        console.error('Error fetching transaction activity rules:', error)
        throw new Error(error.message || 'Failed to fetch transaction activity rules')
      }

      return {
        success: true,
        data: data || [],
        total: data?.length || 0
      }
    } catch (error) {
      console.error('Error in getTransactionActivityRules:', error)
      return {
        success: false,
        error: error.message || 'Failed to fetch transaction activity rules',
        data: []
      }
    }
  },

  // Get transaction activity rule by ID
  getTransactionActivityRuleById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('transaction_activity_rules')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching transaction activity rule:', error)
        throw new Error(error.message || 'Failed to fetch transaction activity rule')
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Error in getTransactionActivityRuleById:', error)
      return {
        success: false,
        error: error.message || 'Failed to fetch transaction activity rule'
      }
    }
  },

  // Get next rule number
  getNextRuleNumber: async () => {
    try {
      // Get the maximum rule_number and increment by 1
      const { data, error } = await supabase
        .from('transaction_activity_rules')
        .select('rule_number')
        .order('rule_number', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error getting next rule number:', error)
        throw new Error(error.message || 'Failed to get next rule number')
      }

      // If no rules exist, start from 1
      const nextNumber = data ? (data.rule_number + 1) : 1

      return {
        success: true,
        ruleNumber: nextNumber
      }
    } catch (error) {
      console.error('Error in getNextRuleNumber:', error)
      return {
        success: false,
        error: error.message || 'Failed to get next rule number',
        ruleNumber: 1 // Default to 1 on error
      }
    }
  },

  // Create new transaction activity rule
  createTransactionActivityRule: async (ruleData) => {
    try {
      // Get next rule number if not provided
      let ruleNumber = ruleData.rule_number
      if (!ruleNumber) {
        const nextNumberResult = await transactionActivityRuleService.getNextRuleNumber()
        if (nextNumberResult.success) {
          ruleNumber = nextNumberResult.ruleNumber
        } else {
          ruleNumber = 1 // Fallback
        }
      }

      const payload = {
        rule_number: ruleNumber,
        transaction_type: ruleData.transaction_type || null,
        parameter: ruleData.parameter || null,
        count_match_type: ruleData.count_match_type || null,
        transaction_count: ruleData.transaction_count || null, // Keep as text, no parsing
        threshold_match_type: ruleData.threshold_match_type || null,
        threshold: ruleData.threshold || null, // Keep as text, no parsing
        frequency: ruleData.frequency || null,
        is_active: ruleData.is_active !== undefined ? ruleData.is_active : true,
        activity_rule_score: ruleData.activity_rule_score || 0,
        rule_display_name: ruleData.rule_display_name || '',
        rule_description: ruleData.rule_description || null,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('transaction_activity_rules')
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error('Error creating transaction activity rule:', error)
        throw new Error(error.message || 'Failed to create transaction activity rule')
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Error in createTransactionActivityRule:', error)
      return {
        success: false,
        error: error.message || 'Failed to create transaction activity rule'
      }
    }
  },

  // Update transaction activity rule
  updateTransactionActivityRule: async (id, ruleData) => {
    try {
      const payload = {
        ...ruleData,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('transaction_activity_rules')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating transaction activity rule:', error)
        throw new Error(error.message || 'Failed to update transaction activity rule')
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Error in updateTransactionActivityRule:', error)
      return {
        success: false,
        error: error.message || 'Failed to update transaction activity rule'
      }
    }
  },

  // Delete transaction activity rule
  deleteTransactionActivityRule: async (id) => {
    try {
      const { error } = await supabase
        .from('transaction_activity_rules')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting transaction activity rule:', error)
        throw new Error(error.message || 'Failed to delete transaction activity rule')
      }

      return {
        success: true
      }
    } catch (error) {
      console.error('Error in deleteTransactionActivityRule:', error)
      return {
        success: false,
        error: error.message || 'Failed to delete transaction activity rule'
      }
    }
  },

  // Toggle active status
  toggleRuleStatus: async (id, isActive) => {
    try {
      const { data, error } = await supabase
        .from('transaction_activity_rules')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error toggling rule status:', error)
        throw new Error(error.message || 'Failed to toggle rule status')
      }

      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Error in toggleRuleStatus:', error)
      return {
        success: false,
        error: error.message || 'Failed to toggle rule status'
      }
    }
  }
}

