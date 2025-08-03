import { demoRiskRules } from "../data/riskRules";

export const calculateRiskScore = (customerData) => {
  let score = 0;
  let triggeredRules = [];

  demoRiskRules.forEach((rule) => {
    if (rule.condition(customerData)) {
      score += rule.score;
      triggeredRules.push(rule);
    }
  });

  const level = getRiskLevel(score);

  return {
    score,
    level,
    triggeredRules,
  };
};

const getRiskLevel = (score) => {
  if (score >= 80) return "High";
  if (score >= 40) return "Medium";
  return "Low";
};
