// Transaction Rules for AML Platform
// These rules are used to assess transaction risk and trigger alerts

export const transactionRules = [
  {
    id: "TR001",
    name: "High Amount Transaction",
    description: "Transaction amount exceeds threshold",
    condition: (data) => parseFloat(data.amount) > 10000,
    score: 30,
    category: "Amount"
  },
  {
    id: "TR002",
    name: "Frequent Transactions",
    description: "Multiple transactions in short time period",
    condition: (data) => data.frequency && data.frequency > 5,
    score: 25,
    category: "Frequency"
  },
  {
    id: "TR003",
    name: "High-Risk Destination",
    description: "Transaction to high-risk country",
    condition: (data) => {
      const highRiskCountries = ['IR', 'KP', 'CU', 'VE', 'SD', 'SY']
      return data.destination_country && highRiskCountries.includes(data.destination_country)
    },
    score: 40,
    category: "Destination"
  },
  {
    id: "TR004",
    name: "Unusual Pattern",
    description: "Transaction pattern differs from customer's normal behavior",
    condition: (data) => data.is_unusual_pattern === true,
    score: 35,
    category: "Pattern"
  },
  {
    id: "TR005",
    name: "Cash Transaction",
    description: "Large cash transaction",
    condition: (data) => data.transaction_type === 'Cash' && parseFloat(data.amount) > 5000,
    score: 45,
    category: "Type"
  },
  {
    id: "TR006",
    name: "Third Party Transaction",
    description: "Transaction involves third party",
    condition: (data) => data.involves_third_party === true,
    score: 20,
    category: "Party"
  },
  {
    id: "TR007",
    name: "Structuring",
    description: "Multiple transactions just below reporting threshold",
    condition: (data) => data.is_structuring === true,
    score: 50,
    category: "Structuring"
  },
  {
    id: "TR008",
    name: "PEP Transaction",
    description: "Transaction involves Politically Exposed Person",
    condition: (data) => data.involves_pep === true,
    score: 60,
    category: "PEP"
  },
  {
    id: "TR009",
    name: "Sanctioned Entity",
    description: "Transaction involves sanctioned entity",
    condition: (data) => data.involves_sanctioned_entity === true,
    score: 80,
    category: "Sanctions"
  },
  {
    id: "TR010",
    name: "Offshore Transaction",
    description: "Transaction to offshore jurisdiction",
    condition: (data) => {
      const offshoreJurisdictions = ['KY', 'VG', 'BS', 'PA', 'SC', 'MU']
      return data.destination_country && offshoreJurisdictions.includes(data.destination_country)
    },
    score: 30,
    category: "Offshore"
  }
]

// Helper function to get rule by ID
export const getTransactionRuleById = (id) => {
  return transactionRules.find(rule => rule.id === id)
}

// Helper function to get rules by category
export const getTransactionRulesByCategory = (category) => {
  return transactionRules.filter(rule => rule.category === category)
}

// Helper function to calculate total risk score for a transaction
export const calculateTransactionRiskScore = (transactionData) => {
  let totalScore = 0
  
  transactionRules.forEach(rule => {
    if (rule.condition(transactionData)) {
      totalScore += rule.score
    }
  })
  
  return Math.min(totalScore, 100) // Cap at 100
}

// Helper function to get triggered rules for a transaction
export const getTriggeredTransactionRules = (transactionData) => {
  return transactionRules.filter(rule => rule.condition(transactionData))
}

// Transaction risk levels
export const TRANSACTION_RISK_LEVELS = {
  LOW: { min: 0, max: 30, label: 'Low' },
  MEDIUM: { min: 31, max: 70, label: 'Medium' },
  HIGH: { min: 71, max: 100, label: 'High' }
}

// Helper function to get risk level from score
export const getTransactionRiskLevel = (score) => {
  if (score <= TRANSACTION_RISK_LEVELS.LOW.max) return TRANSACTION_RISK_LEVELS.LOW.label
  if (score <= TRANSACTION_RISK_LEVELS.MEDIUM.max) return TRANSACTION_RISK_LEVELS.MEDIUM.label
  return TRANSACTION_RISK_LEVELS.HIGH.label
}
