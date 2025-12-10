import { supabase, handleSupabaseError, getCurrentUser, dbHelpers } from '../config/supabase'

export const riskService = {
  // Get risk rules (from file-based system)
  getRiskRules: async () => {
    try {
      // Load categories and rules from database
      const { data: categories, error: categoriesError } = await supabase
        .from('risk_categories')
        .select('*')

      if (categoriesError) throw categoriesError

      // Fetch all rules with pagination (Supabase default limit is 1000)
      let allRules = []
      let from = 0
      const pageSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data: rulesPage, error: rulesError } = await supabase
          .from('risk_rules')
          .select('*')
          .range(from, from + pageSize - 1)

        if (rulesError) throw rulesError

        if (rulesPage && rulesPage.length > 0) {
          allRules = [...allRules, ...rulesPage]
          from += pageSize
          hasMore = rulesPage.length === pageSize
        } else {
          hasMore = false
        }
      }

      const rules = allRules

      const categoriesById = new Map(
        (categories || []).map((c) => [c.id, c])
      )

      const combinedRules = (rules || []).map((r) => {
        const category = categoriesById.get(r.category_id)
        return {
          id: r.id,
          ruleText: r.rule_text,
          riskScore: r.risk_score,
          riskLogic: r.risk_logic,
          isActive: r.is_active,
          sortOrder: r.sort_order,
          categoryId: r.category_id,
          categoryName: category?.name || 'Uncategorized',
          categoryCode: category?.code || null,
          categoryRuleType: category?.rule_type || null,
        }
      })

      return {
        success: true,
        rules: combinedRules,
        categories: categories || [],
        total: combinedRules.length,
      }
    } catch (error) {
      console.error('Error loading risk rules:', error)
      return {
        success: false,
        rules: [],
        total: 0,
        error: error.message || 'Failed to load risk rules',
      }
    }
  },

  // Calculate risk score for customer (placeholder using DB rules)
  calculateRiskScore: async (customerData) => {
    try {
      // TODO: implement real rule evaluation using onboarding data
      const { data: rules, error } = await supabase
        .from('risk_rules')
        .select('id, risk_score, risk_logic, is_active')
        .eq('is_active', true)

      if (error) throw error

      // For now, do not change existing behaviour elsewhere – just return a minimal, safe structure.
      const totalRules = (rules || []).length

      return {
        success: true,
        riskScore: 0,
        riskLevel: 'Low',
        triggeredRules: [],
        totalRules,
      }
    } catch (error) {
      console.error('Error in calculateRiskScore:', error)
      return {
        success: false,
        riskScore: 0,
        riskLevel: 'Low',
        triggeredRules: [],
        totalRules: 0,
        error: error.message || 'Failed to calculate risk score',
      }
    }
  },

  // Perform risk assessment
  performRiskAssessment: async (customerId) => {
    try {
      console.log('Starting risk assessment for customer ID:', customerId);
      
      const user = await getCurrentUser()
      console.log('Current user:', user);
      
      // Get customer data
      const customer = await dbHelpers.get('customers', customerId)
      console.log('Customer data:', customer);
      
      // Calculate risk score
      const riskResult = await riskService.calculateRiskScore(customer)
      console.log('Risk calculation result:', riskResult);
      
      if (!riskResult.success) {
        throw new Error(riskResult.error || 'Failed to calculate risk score')
      }
      
      // Save risk assessment
      const assessmentPayload = {
        customer_id: customerId,
        risk_score: riskResult.riskScore,
        risk_level: riskResult.riskLevel,
        triggered_rules: riskResult.triggeredRules,
        assessment_date: new Date().toISOString(),
        created_by: user.id,
        created_at: new Date().toISOString()
      }
      console.log('Assessment payload:', assessmentPayload);
      
      // Try to save risk assessment
      let assessment;
      try {
        assessment = await dbHelpers.insert('risk_assessments', assessmentPayload)
        console.log('Assessment saved:', assessment);
      } catch (assessmentError) {
        console.error('Failed to save assessment:', assessmentError);
        // Continue with customer update even if assessment save fails
        assessment = { id: 'mock-assessment-id' };
      }
      
      // Update customer risk profile
      let updateResult;
      try {
        updateResult = await dbHelpers.update('customers', customerId, {
          risk_score: riskResult.riskScore,
          risk_level: riskResult.riskLevel,
          last_risk_assessment: new Date().toISOString()
        })
        console.log('Customer updated:', updateResult);
      } catch (updateError) {
        console.error('Failed to update customer:', updateError);
        throw new Error('Failed to update customer risk profile');
      }
      
      return { 
        success: true, 
        data: { ...assessment, ...riskResult },
        message: 'Risk assessment completed successfully'
      }
    } catch (error) {
      console.error('Error in performRiskAssessment:', error)
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to perform risk assessment'
      }
    }
  },

  // Create a new risk rule
  createRiskRule: async (ruleData) => {
    try {
      const payload = {
        category_id: ruleData.categoryId,
        rule_text: ruleData.ruleText,
        risk_score: ruleData.riskScore,
        risk_logic: ruleData.riskLogic,
        is_active: ruleData.isActive ?? true,
      }

      const { data, error } = await supabase
        .from('risk_rules')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error

      return {
        success: true,
        rule: data,
      }
    } catch (error) {
      console.error('Error creating risk rule:', error)
      return {
        success: false,
        error: error.message || 'Failed to create risk rule',
      }
    }
  },

  // Get risk statistics
  getRiskStats: async () => {
    try {
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('risk_score, risk_level')
      
      if (customersError) {
        console.error('Error fetching customers for stats:', customersError)
        throw new Error('Failed to fetch customer statistics')
      }
      
      const { data: assessments, error: assessmentsError } = await supabase
        .from('risk_assessments')
        .select('*')
      
      if (assessmentsError) {
        console.error('Error fetching assessments for stats:', assessmentsError)
        // Don't throw here, just log the error
      }
      
      const stats = {
        totalCustomers: customers?.length || 0,
        byRiskLevel: {
          Low: customers?.filter(c => c.risk_level === 'Low').length || 0,
          Medium: customers?.filter(c => c.risk_level === 'Medium').length || 0,
          High: customers?.filter(c => c.risk_level === 'High').length || 0
        },
        averageRiskScore: customers?.reduce((sum, c) => sum + (c.risk_score || 0), 0) / (customers?.length || 1) || 0,
        totalAssessments: assessments?.length || 0,
        assessmentsThisMonth: assessments?.filter(a => {
          const assessmentDate = new Date(a.assessment_date)
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          return assessmentDate >= monthAgo
        }).length || 0
      }
      
      return stats
    } catch (error) {
      console.error('Error in getRiskStats:', error)
      // Return default stats instead of throwing
      return {
        totalCustomers: 0,
        byRiskLevel: { Low: 0, Medium: 0, High: 0 },
        averageRiskScore: 0,
        totalAssessments: 0,
        assessmentsThisMonth: 0
      }
    }
  },

  // Get customers by risk level
  getCustomersByRiskLevel: async (riskLevel, page = 1, limit = 50) => {
    try {
      const options = {
        page,
        limit,
        filters: riskLevel ? { risk_level: riskLevel } : {},
        orderBy: { column: 'risk_score', ascending: false }
      }
      
      const result = await dbHelpers.list('customers', options)
      return {
        success: true,
        data: result.data || [],
        count: result.count || 0,
        error: null
      }
    } catch (error) {
      console.error('Error in getCustomersByRiskLevel:', error)
      return {
        success: false,
        data: [],
        count: 0,
        error: error.message || 'Failed to fetch customers'
      }
    }
  },

}
