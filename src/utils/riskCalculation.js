import { supabase } from '../config/supabase'
import { countries } from '../data/countries'

// Create a map from country code to country name (uppercase for matching)
const countryCodeToName = new Map()
countries.forEach(country => {
  countryCodeToName.set(country.code.toUpperCase(), country.name.toUpperCase())
})

// Helper: map full name sanction match count (0–5) to label used by rules
// 5 of 5 fields match  -> "Full name match"
// 3–4 of 5 fields      -> "Partial name match"
// 0–2 of 5 fields      -> "No name match"
const getFullNameSanctionLabel = (matchCount) => {
  const count = Number(matchCount) || 0
  if (count >= 5) return 'Full name match'
  if (count >= 3) return 'Partial name match'
  return 'No name match'
}

// Field mappings: Customer field -> Risk Category name
const NATURAL_PERSON_FIELD_MAPPING = {
  // Main customer type + sanction screening
  customerType: 'CUSTOMER TYPE',
  fullNameSanctionMatch: 'Full Name Sanction',
  profession: 'BUSINESS ACTIVITY',
  nationality: 'Nationality',
  residencyStatus: 'RESIDENCY STATUS',
  isDualNationality: 'Dual Nationality',
  dualNationality: 'Dual Nationality Countries',
  occupation: 'BUSINESS ACTIVITY',
  pep: 'PEP',
  countryOfBirth: 'Country Of Birth',
  sourceOfFunds: 'SOURCE OF FUND',
  countryOfResidence: 'Country Of Residence',
}

const LEGAL_ENTITY_FIELD_MAPPING = {
  // Main customer type + sanction screening
  customerType: 'CUSTOMER TYPE',
  fullNameSanctionMatch: 'Full Name Sanction',
  businessActivity: 'BUSINESS ACTIVITY',
  countryOfIncorporation: 'Country Of Incorporation',
  licenseType: 'LICENSE TYPE',
  countriesSourceOfFunds: 'Countries Source Of Funds',
  countriesOfOperation: 'OPERATION COUNTRIES',
  jurisdiction: 'JURISDICTION',
  sourceOfFunds: 'SOURCE OF FUND',
  residencyStatus: 'RESIDENCY STATUS',
  licenseCategory: 'LICENSE CATEGORY',
}

const SHAREHOLDER_NATURAL_PERSON_FIELD_MAPPING = {
  // Shareholder-level sanction screening
  fullNameSanctionMatch: 'Full Name Sanction',
  countryOfResidence: 'Country Of Residence',
  nationality: 'Nationality',
  placeOfBirth: 'Country Of Birth',
  isDualNationality: 'Dual Nationality',
  dualNationality: 'Dual Nationality Countries',
  occupation: 'BUSINESS ACTIVITY',
  pep: 'PEP',
  sourceOfFunds: 'SOURCE OF FUND',
}

const SHAREHOLDER_LEGAL_ENTITY_FIELD_MAPPING = {
  // Shareholder-level sanction screening
  fullNameSanctionMatch: 'Full Name Sanction',
  businessActivity: 'BUSINESS ACTIVITY',
  countryOfIncorporation: 'Country Of Incorporation',
  licenseType: 'LICENSE TYPE',
  countriesSourceOfFunds: 'Countries Source Of Funds',
  countriesOfOperation: 'OPERATION COUNTRIES',
  sourceOfFunds: 'SOURCE OF FUND',
}

// Get relevant categories for a customer type
const getRelevantCategories = (customerType, includeShareholderCategories = false) => {
  const categories = new Set()
  
  if (customerType === 'Natural Person') {
    Object.values(NATURAL_PERSON_FIELD_MAPPING).forEach(cat => categories.add(cat))
    // Always include CUSTOMER TYPE so we can apply rules based on main customer type
    categories.add('CUSTOMER TYPE')
    if (includeShareholderCategories) {
      Object.values(SHAREHOLDER_NATURAL_PERSON_FIELD_MAPPING).forEach(cat => categories.add(cat))
      Object.values(SHAREHOLDER_LEGAL_ENTITY_FIELD_MAPPING).forEach(cat => categories.add(cat))
    }
  } else if (customerType === 'Legal Entities') {
    Object.values(LEGAL_ENTITY_FIELD_MAPPING).forEach(cat => categories.add(cat))
    Object.values(SHAREHOLDER_NATURAL_PERSON_FIELD_MAPPING).forEach(cat => categories.add(cat))
    Object.values(SHAREHOLDER_LEGAL_ENTITY_FIELD_MAPPING).forEach(cat => categories.add(cat))
    categories.add('CUSTOMER TYPE')
  }
  
  return Array.from(categories)
}

// Cache for risk rules
const ruleCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const IS_DEV = process.env.NODE_ENV === 'development'

// Fetch risk rules from database (with caching and optimized query)
const fetchRiskRules = async (customerType, includeShareholderCategories = false, forceRefresh = false) => {
  try {
    const relevantCategoryNames = getRelevantCategories(customerType, includeShareholderCategories)
    
    if (relevantCategoryNames.length === 0) {
      return []
    }
    
    const cacheKey = `${customerType}_${includeShareholderCategories ? 'with_sh' : 'no_sh'}`
    const cached = ruleCache.get(cacheKey)
    const now = Date.now()
    
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_TTL) {
      return cached.rules
    }
    
    // Optimized: Single query with JOIN to fetch categories and rules together
    const { data: categories, error: categoriesError } = await supabase
      .from('risk_categories')
      .select('id, name')
      .eq('rule_type', 'ONBOARDING')
      .in('name', relevantCategoryNames)
    
    if (categoriesError) throw categoriesError
    if (!categories || categories.length === 0) {
      return []
    }
    
    const categoryIds = categories.map(cat => cat.id)
    const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]))
    
    // Fetch rules with pagination
    let allRules = []
    let from = 0
    const pageSize = 1000
    let hasMore = true
    
    while (hasMore) {
      const { data: rulesPage, error: rulesError } = await supabase
        .from('risk_rules')
        .select('*')
        .eq('is_active', true)
        .in('category_id', categoryIds)
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
    
    // Format rules with category names
    const formattedRules = allRules.map(rule => ({
      id: rule.id,
      categoryId: rule.category_id,
      categoryName: categoryMap.get(rule.category_id) || 'Uncategorized',
      ruleText: rule.rule_text,
      riskScore: rule.risk_score,
      riskLogic: rule.risk_logic,
    }))
    
    // Cache the results
    ruleCache.set(cacheKey, {
      rules: formattedRules,
      timestamp: now,
    })
    
    return formattedRules
  } catch (error) {
    console.error('Error fetching risk rules:', error)
    return []
  }
}

// Extract option label from rule text
const extractOptionLabel = (ruleText) => {
  const match = ruleText.match(/^(.+?)\s*\(/)
  return match ? match[1].trim() : ruleText.trim()
}

// Pre-process rule: extract and normalize label once
const preprocessRule = (rule) => {
  const optionLabel = extractOptionLabel(rule.ruleText)
  const normalizedLabel = optionLabel.trim().toLowerCase().replace(/\s+/g, ' ')
  return {
    ...rule,
    normalizedLabel,
    originalLabel: optionLabel.trim(),
  }
}

// Pre-normalize field value (country code conversion, string normalization)
const preprocessFieldValue = (fieldValue, categoryName) => {
  if (!fieldValue) return null
  
  if (Array.isArray(fieldValue)) {
    return fieldValue.map(v => preprocessFieldValue(v, categoryName)).filter(v => v !== null)
  }
  
  let normalized = String(fieldValue).trim().toLowerCase().replace(/\s+/g, ' ')
  
  // Handle country code to country name conversion
  const countryCategories = [
    'Nationality', 'Country Of Birth', 'Country Of Residence', 
    'Dual Nationality Countries', 'Country Of Incorporation', 
    'Countries Source Of Funds', 'OPERATION COUNTRIES'
  ]
  if (countryCategories.includes(categoryName) && fieldValue.length === 2 && /^[A-Z]{2}$/i.test(fieldValue)) {
    const countryName = countryCodeToName.get(fieldValue.toUpperCase())
    if (countryName) {
      normalized = countryName.toLowerCase()
    }
  }
  
  return normalized
}

// Get field value from data (handles camelCase, snake_case, arrays, JSON)
const getFieldValue = (data, fieldName) => {
  // Special handling for isDualNationality
  if (fieldName === 'isDualNationality' || fieldName === 'is_dual_nationality') {
    let value = data[fieldName] ?? data[fieldName.toLowerCase()] ?? 
                data[fieldName.replace(/([A-Z])/g, '_$1').toLowerCase()] ?? false
    
    if (value === true || value === 'true' || value === 'True' || 
        value === 'YES' || value === 'Yes' || value === 'yes' || value === 1) {
      return 'Yes'
    }
    return 'No'
  }
  
  // Try camelCase, lowercase, then snake_case
  let value = data[fieldName] ?? 
              data[fieldName.toLowerCase()] ?? 
              data[fieldName.replace(/([A-Z])/g, '_$1').toLowerCase()]
  
  if (value === undefined || value === null) return undefined
  
  // Handle arrays - return as is
  if (Array.isArray(value)) {
    // Filter out empty values
    const filtered = value.filter(v => v !== null && v !== undefined && v !== '')
    return filtered.length > 0 ? filtered : undefined
  }
  
  // Try parsing JSON strings
  if (typeof value === 'string' && value.trim() !== '') {
    // Check if it looks like JSON
    const trimmed = value.trim()
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          // Filter out empty values
          const filtered = parsed.filter(v => v !== null && v !== undefined && v !== '')
          return filtered.length > 0 ? filtered : undefined
        }
      } catch (e) {
        // Not valid JSON, continue to other parsing methods
      }
    }
    
    // Handle comma-separated strings for array fields
    const arrayFields = ['businessActivity', 'countriesSourceOfFunds', 'countriesOfOperation', 'licenseCategory']
    if (arrayFields.includes(fieldName) && trimmed.includes(',')) {
      const split = trimmed.split(',').map(v => v.trim()).filter(v => v !== '')
      return split.length > 0 ? split : undefined
    }
  }
  
  return value
}

// Match normalized field value to pre-processed rule
const matchesRule = (normalizedFieldValue, preprocessedRule) => {
  if (!normalizedFieldValue) return false
  
  if (Array.isArray(normalizedFieldValue)) {
    return normalizedFieldValue.some(value => matchesRule(value, preprocessedRule))
  }
  
  return normalizedFieldValue === preprocessedRule.normalizedLabel
}

// Map risk score to risk level
const getRiskLevelFromScore = (score) => {
  if (score >= 0 && score <= 1) return 'Low'
  if (score > 1 && score <= 2) return 'Medium Low'
  if (score > 2 && score <= 3) return 'Medium'
  if (score > 3 && score <= 4) return 'Medium High'
  if (score > 4 && score <= 5) return 'High'
  return 'Low'
}

// Build indexed rule lookup: Map<categoryName, Map<normalizedValue, rule[]>>
const buildRuleIndex = (rules) => {
  const index = new Map()
  
  for (const rule of rules) {
    const preprocessed = preprocessRule(rule)
    const categoryName = rule.categoryName
    
    if (!index.has(categoryName)) {
      index.set(categoryName, new Map())
    }
    
    const categoryIndex = index.get(categoryName)
    const normalizedValue = preprocessed.normalizedLabel
    
    if (!categoryIndex.has(normalizedValue)) {
      categoryIndex.set(normalizedValue, [])
    }
    
    categoryIndex.get(normalizedValue).push(preprocessed)
  }
  
  return index
}

// Check field against rules and trigger matching ones
// Returns the number of new rules triggered and total score added
const checkFieldAgainstRules = (fieldValue, categoryName, ruleIndex, triggeredRuleIds, triggeredRules, totalScore, triggeredByField = null) => {
  if (!fieldValue) return totalScore
  
  // Normalize the field value first
  const normalizedValue = preprocessFieldValue(fieldValue, categoryName)
  if (!normalizedValue) return totalScore
  
  const categoryRules = ruleIndex.get(categoryName)
  if (!categoryRules) return totalScore
  
  // Handle arrays - check each value individually
  const valuesToCheck = Array.isArray(normalizedValue) ? normalizedValue : [normalizedValue]
  
  // Debug logging in development
  if (IS_DEV && valuesToCheck.length > 1) {
    console.log(`🔍 Checking ${valuesToCheck.length} values for ${categoryName}:`, valuesToCheck)
  }
  
  for (const value of valuesToCheck) {
    // Skip empty values
    if (!value || (typeof value === 'string' && value.trim() === '')) continue
    
    // Ensure value is a string for lookup
    const valueStr = String(value).trim()
    if (!valueStr) continue
    
    // Look up rules for this normalized value
    const matchingRules = categoryRules.get(valueStr) || []
    
    if (IS_DEV) {
      if (matchingRules.length > 0) {
        console.log(`  ✓ Found ${matchingRules.length} matching rules for "${valueStr}"`)
      } else {
        console.log(`  ✗ No matching rules found for "${valueStr}" in category "${categoryName}"`)
        // Log available keys for debugging
        const availableKeys = Array.from(categoryRules.keys()).slice(0, 10)
        console.log(`    Available rule keys (first 10):`, availableKeys)
      }
    }
    
    for (const rule of matchingRules) {
      // Allow the same rule to trigger per-field (and per-shareholder) by using a composite key
      const ruleKey = triggeredByField ? `${rule.id}:${triggeredByField}` : rule.id
      if (!triggeredRuleIds.has(ruleKey)) {
        triggeredRules.push({
          ...rule,
          triggeredByField: triggeredByField || null
        })
        triggeredRuleIds.add(ruleKey)
        totalScore += rule.riskScore
        
        if (IS_DEV) {
          console.log(`    → Triggered rule: ${rule.ruleText} (score: ${rule.riskScore})`)
        }
      } else if (IS_DEV) {
        console.log(`    ⊗ Rule already triggered: ${rule.ruleText}`)
      }
    }
  }
  
  return totalScore
}

// Calculate risk for Natural Person customer
const calculateNaturalPersonRisk = async (customerData) => {
  const rules = await fetchRiskRules('Natural Person', false)
  
  if (rules.length === 0) {
    return { triggeredRules: [], totalScore: 0, averageScore: 0, ruleCount: 0 }
  }
  
  // Build indexed rule lookup for O(1) matching
  const ruleIndex = buildRuleIndex(rules)
  const triggeredRules = []
  const triggeredRuleIds = new Set()
  let totalScore = 0

  // First, apply Full Name Sanction rule for the main customer (if screening result is available)
  // Expectation: another service may set customerData.fullNameSanctionMatchCount (0–5).
  // If it's missing, default to 0 so "No name match" still triggers.
  {
    const rawCount = getFieldValue(customerData, 'fullNameSanctionMatchCount')
    const mainSanctionMatchCount = rawCount !== undefined && rawCount !== null ? rawCount : 0
    const sanctionLabel = getFullNameSanctionLabel(mainSanctionMatchCount)
    totalScore = checkFieldAgainstRules(
      sanctionLabel,
      'Full Name Sanction',
      ruleIndex,
      triggeredRuleIds,
      triggeredRules,
      totalScore,
      'fullNameSanctionMatch'
    )
  }
  
  // Check each field in the mapping
  for (const [fieldName, categoryName] of Object.entries(NATURAL_PERSON_FIELD_MAPPING)) {
    // fullNameSanctionMatch is handled explicitly above using the match-count helper
    if (fieldName === 'fullNameSanctionMatch') continue
    const fieldValue = getFieldValue(customerData, fieldName)
    
    // Always check isDualNationality, other fields only if they have a value
    if (fieldValue || fieldName === 'isDualNationality') {
      // Skip dualNationality if isDualNationality is not Yes
      if (fieldName === 'dualNationality') {
        const isDualNationalityValue = getFieldValue(customerData, 'isDualNationality')
        if (isDualNationalityValue !== 'Yes') {
          continue
        }
      }
      
      totalScore = checkFieldAgainstRules(
        fieldValue,
        categoryName,
        ruleIndex,
        triggeredRuleIds,
        triggeredRules,
        totalScore,
        fieldName
      )
    }
  }
  
  const averageScore = triggeredRules.length > 0 ? totalScore / triggeredRules.length : 0
  
  return { triggeredRules, totalScore, averageScore, ruleCount: triggeredRules.length }
}

// Calculate risk for Legal Entity customer (including shareholders)
const calculateLegalEntityRisk = async (customerData) => {
  const hasShareholders = customerData.shareholders && 
                         Array.isArray(customerData.shareholders) && 
                         customerData.shareholders.length > 0
  
  const rules = await fetchRiskRules('Legal Entities', hasShareholders)
  
  if (rules.length === 0) {
    return { triggeredRules: [], totalScore: 0, averageScore: 0, ruleCount: 0 }
  }
  
  // Build indexed rule lookup for O(1) matching
  const ruleIndex = buildRuleIndex(rules)
  const triggeredRules = []
  const triggeredRuleIds = new Set()
  let totalScore = 0

  // Step 0: Apply Full Name Sanction rule for the main legal entity (if screening result is available)
  // Expectation: another service may set customerData.fullNameSanctionMatchCount (0–5).
  // If it's missing, default to 0 so "No name match" still triggers.
  {
    const rawCount = getFieldValue(customerData, 'fullNameSanctionMatchCount')
    const mainSanctionMatchCount = rawCount !== undefined && rawCount !== null ? rawCount : 0
    const sanctionLabel = getFullNameSanctionLabel(mainSanctionMatchCount)
    totalScore = checkFieldAgainstRules(
      sanctionLabel,
      'Full Name Sanction',
      ruleIndex,
      triggeredRuleIds,
      triggeredRules,
      totalScore,
      'fullNameSanctionMatch'
    )
  }
  
  // Step 1: Check customer-level fields
  for (const [fieldName, categoryName] of Object.entries(LEGAL_ENTITY_FIELD_MAPPING)) {
    // fullNameSanctionMatch is handled explicitly above using the match-count helper
    if (fieldName === 'fullNameSanctionMatch') continue
    const fieldValue = getFieldValue(customerData, fieldName)
    
    if (fieldValue && (Array.isArray(fieldValue) ? fieldValue.length > 0 : true)) {
      totalScore = checkFieldAgainstRules(
        fieldValue,
        categoryName,
        ruleIndex,
        triggeredRuleIds,
        triggeredRules,
        totalScore,
        fieldName
      )
    }
  }
  
  // Step 2: Check shareholders if they exist
  if (hasShareholders) {
    customerData.shareholders.forEach((shareholder, shareholderIndex) => {
      const shareholderType = shareholder.shareholderType || shareholder.type || shareholder.entity_type
      
      // 2.a Apply Full Name Sanction rule for each shareholder (if screening result is available)
      // Expectation: another service may set shareholder.fullNameSanctionMatchCount (0–5).
      // If it's missing, default to 0 so "No name match" still triggers.
      {
        const rawCount = getFieldValue(shareholder, 'fullNameSanctionMatchCount')
        const shSanctionMatchCount = rawCount !== undefined && rawCount !== null ? rawCount : 0
        const sanctionLabel = getFullNameSanctionLabel(shSanctionMatchCount)
        totalScore = checkFieldAgainstRules(
          sanctionLabel,
          'Full Name Sanction',
          ruleIndex,
          triggeredRuleIds,
          triggeredRules,
          totalScore,
          `shareholder.${shareholderIndex}.fullNameSanctionMatch`
        )
      }

      // Check shareholder type
      const customerTypeCategory = 'CUSTOMER TYPE'
      const customerTypeRules = ruleIndex.get(customerTypeCategory)
      if (shareholderType && customerTypeRules) {
        const normalizedType = preprocessFieldValue(shareholderType, customerTypeCategory)
        if (normalizedType) {
          const typeRules = customerTypeRules.get(normalizedType) || []
          for (const rule of typeRules) {
            const ruleKey = `${rule.id}_${shareholderIndex}`
            if (!triggeredRuleIds.has(ruleKey)) {
              triggeredRules.push({
                ...rule,
                triggeredByField: `shareholder.type.${shareholderType}.${shareholderIndex}`
              })
              triggeredRuleIds.add(ruleKey)
              totalScore += rule.riskScore
            }
          }
        }
      }
      
      // Check shareholder fields based on type
      const fieldMapping = shareholderType === 'Natural Person'
        ? SHAREHOLDER_NATURAL_PERSON_FIELD_MAPPING
        : SHAREHOLDER_LEGAL_ENTITY_FIELD_MAPPING
      
      // First check isDualNationality for Natural Person shareholders
      if (shareholderType === 'Natural Person') {
        const isDualNationalityValue = getFieldValue(shareholder, 'isDualNationality')
        totalScore = checkFieldAgainstRules(
          isDualNationalityValue,
          'Dual Nationality',
          ruleIndex,
          triggeredRuleIds,
          triggeredRules,
          totalScore,
          `shareholder.${shareholderIndex}.isDualNationality`
        )
        
        // Check other fields (skip dualNationality if isDualNationality is not Yes)
        for (const [fieldName, categoryName] of Object.entries(fieldMapping)) {
          if (fieldName === 'isDualNationality') continue
          if (fieldName === 'dualNationality' && isDualNationalityValue !== 'Yes') continue
          
          const fieldValue = getFieldValue(shareholder, fieldName)
          if (fieldValue) {
            totalScore = checkFieldAgainstRules(
              fieldValue,
              categoryName,
              ruleIndex,
              triggeredRuleIds,
              triggeredRules,
              totalScore,
              `shareholder.${shareholderIndex}.${fieldName}`
            )
          }
        }
      } else {
        // Legal Entity shareholder - check all fields
        for (const [fieldName, categoryName] of Object.entries(fieldMapping)) {
          const fieldValue = getFieldValue(shareholder, fieldName)
          if (fieldValue && (Array.isArray(fieldValue) ? fieldValue.length > 0 : true)) {
            totalScore = checkFieldAgainstRules(
              fieldValue,
              categoryName,
              ruleIndex,
              triggeredRuleIds,
              triggeredRules,
              totalScore,
              `shareholder.${shareholderIndex}.${fieldName}`
            )
          }
        }
      }
    })
  }
  
  const averageScore = triggeredRules.length > 0 ? totalScore / triggeredRules.length : 0
  
  return { triggeredRules, totalScore, averageScore, ruleCount: triggeredRules.length }
}

// Main risk calculation function
export const calculateRiskScore = async (customerData) => {
  try {
    if (!customerData) {
      return { score: 0, level: 'Low', triggeredRules: [] }
    }
    
    const customerType = customerData.customerType || customerData.customer_type
    
    let result
    if (customerType === 'Natural Person') {
      result = await calculateNaturalPersonRisk(customerData)
    } else if (customerType === 'Legal Entities') {
      result = await calculateLegalEntityRisk(customerData)
    } else {
      return { score: 0, level: 'Low', triggeredRules: [] }
    }
    
    const riskLevel = getRiskLevelFromScore(result.averageScore)
    
    return {
      score: result.averageScore,
      level: riskLevel,
      triggeredRules: result.triggeredRules.map((rule) => ({
        id: rule.id,
        name: rule.ruleText,
        score: rule.riskScore,
        category: rule.categoryName,
        fieldName: rule.triggeredByField || null,
      })),
    }
  } catch (error) {
    console.error('Error calculating risk score:', error)
    return { score: 0, level: 'Low', triggeredRules: [], error: error.message }
  }
}

// Get risk level based on score (for backward compatibility)
export const getRiskLevel = (score) => {
  return getRiskLevelFromScore(score)
}

// Get triggered rules (for backward compatibility)
export const getTriggeredRules = async (customerData) => {
  const result = await calculateRiskScore(customerData)
  return result.triggeredRules || []
}

// Calculate risk score with detailed breakdown (for backward compatibility)
export const calculateRiskScoreWithBreakdown = async (customerData) => {
  const result = await calculateRiskScore(customerData)
  
  return {
    score: result.score,
    level: result.level,
    triggeredRules: result.triggeredRules,
    breakdown: {
      totalScore: result.score,
      ruleCount: result.triggeredRules.length,
      categories: result.triggeredRules.reduce((acc, rule) => {
        acc[rule.category] = (acc[rule.category] || 0) + rule.score
        return acc
      }, {}),
    },
  }
}

// Clear cache (useful for testing or when rules are updated)
export const clearRiskRulesCache = () => {
  ruleCache.clear()
}
