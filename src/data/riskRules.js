export const demoRiskRules = [
  {
    id: "R001",
    description: "Customer is a Politically Exposed Person (PEP)",
    condition: (data) => data.pep === "Yes",
    score: 40,
  },
  {
    id: "R002",
    description: "Source of Funds is Business Proceeds",
    condition: (data) => data.sourceOfFunds === "Business Proceeds",
    score: 20,
  },
  {
    id: "R003",
    description: "Nationality is in high-risk list",
    condition: (data) => ["North Korea", "Iran", "Syria"].includes(data.nationality),
    score: 25,
  },
  {
    id: "R004",
    description: "Non Face to Face onboarding",
    condition: (data) => data.channel === "Non Face to Face",
    score: 15,
  },
];
