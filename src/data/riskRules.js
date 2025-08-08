export const riskRules = [
  {
    id: "R001",
    name: "PEP Status",
    description: "Customer is a Politically Exposed Person",
    condition: (data) => data.pep === "Yes",
    score: 40,
    category: "PEP"
  },
  {
    id: "R002",
    name: "High-Risk Nationality",
    description: "Customer nationality is from high-risk country",
    condition: (data) => ["IR", "KP", "CU", "VE", "SY"].includes(data.nationality),
    score: 30,
    category: "Nationality"
  },
  {
    id: "R003",
    name: "Non-Face-to-Face Onboarding",
    description: "Customer was onboarded without face-to-face verification",
    condition: (data) => data.channel === "Non Face to Face",
    score: 15,
    category: "Onboarding"
  },
  {
    id: "R004",
    name: "Unknown Source of Funds",
    description: "Source of funds is unknown or unclear",
    condition: (data) => data.sourceOfFunds === "Unknown" || data.sourceOfFunds === "Cash",
    score: 20,
    category: "Source of Funds"
  },
  {
    id: "R005",
    name: "High-Risk Occupation",
    description: "Customer has high-risk occupation",
    condition: (data) => ["Politician", "Government Official", "Military", "Cash Business"].includes(data.occupation),
    score: 25,
    category: "Occupation"
  },
  {
    id: "R006",
    name: "Unknown Source of Wealth",
    description: "Source of wealth is unknown or unclear",
    condition: (data) => data.sourceOfWealth === "Unknown" || data.sourceOfWealth === "Cash Business",
    score: 20,
    category: "Source of Wealth"
  },
  {
    id: "R007",
    name: "Young Customer",
    description: "Customer is under 25 years old",
    condition: (data) => {
      if (!data.dateOfBirth) return false
      const age = new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()
      return age < 25
    },
    score: 10,
    category: "Age"
  },
  {
    id: "R008",
    name: "Elderly Customer",
    description: "Customer is over 70 years old",
    condition: (data) => {
      if (!data.dateOfBirth) return false
      const age = new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()
      return age > 70
    },
    score: 10,
    category: "Age"
  }
];
