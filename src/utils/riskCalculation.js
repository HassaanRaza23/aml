import { riskRules } from '../data/riskRules'

// Calculate risk score based on customer data
export const calculateRiskScore = (customerData) => {
  let totalScore = 0
  const triggeredRules = []

  // Apply risk rules
  riskRules.forEach(rule => {
    if (rule.condition(customerData)) {
      totalScore += rule.score
      triggeredRules.push({
        id: rule.id,
        name: rule.name,
        score: rule.score,
        category: rule.category
      })
    }
  })

  // Additional risk factors
  if (customerData.pep === 'Yes') {
    totalScore += 40
  }

  if (customerData.nationality && ['IR', 'KP', 'CU', 'VE'].includes(customerData.nationality)) {
    totalScore += 30 // High-risk countries
  }

  if (customerData.occupation && ['Politician', 'Government Official', 'Military'].includes(customerData.occupation)) {
    totalScore += 25
  }

  if (customerData.sourceOfWealth && ['Unknown', 'Cash Business'].includes(customerData.sourceOfWealth)) {
    totalScore += 20
  }

  if (customerData.sourceOfFunds && ['Unknown', 'Cash'].includes(customerData.sourceOfFunds)) {
    totalScore += 15
  }

  // Age factor
  if (customerData.dateOfBirth) {
    const age = new Date().getFullYear() - new Date(customerData.dateOfBirth).getFullYear()
    if (age < 25 || age > 70) {
      totalScore += 10
    }
  }

  // Ensure score is between 0 and 100
  return Math.min(Math.max(totalScore, 0), 100)
}

// Get risk level based on score
export const getRiskLevel = (score) => {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Medium'
  return 'Low'
}

// Get triggered rules
export const getTriggeredRules = (customerData) => {
  const triggeredRules = []
  
  riskRules.forEach(rule => {
    if (rule.condition(customerData)) {
      triggeredRules.push({
        id: rule.id,
        name: rule.name,
        score: rule.score,
        category: rule.category
      })
    }
  })

  return triggeredRules
}

// Calculate risk score with detailed breakdown
export const calculateRiskScoreWithBreakdown = (customerData) => {
  const score = calculateRiskScore(customerData)
  const level = getRiskLevel(score)
  const triggeredRules = getTriggeredRules(customerData)

  return {
    score,
    level,
    triggeredRules,
    breakdown: {
      totalScore: score,
      ruleCount: triggeredRules.length,
      categories: triggeredRules.reduce((acc, rule) => {
        acc[rule.category] = (acc[rule.category] || 0) + rule.score
        return acc
      }, {})
    }
  }
}
