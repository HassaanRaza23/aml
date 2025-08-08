# AML Platform - Rules and Models Approach

## Overview

Instead of storing risk rules, risk models, and transaction rules in database tables, we're using a file-based approach where these configurations are predefined in JavaScript/JSON files within the software.

## Why File-Based Approach?

### **Advantages:**
1. **Version Control** - Rules can be versioned and tracked in Git
2. **Easy Deployment** - No database migrations needed for rule changes
3. **Performance** - Faster access to rules (no database queries)
4. **Simplicity** - No need to manage rule CRUD operations
5. **Consistency** - Rules are consistent across all environments
6. **Audit Trail** - Rule changes are tracked in Git history

### **Disadvantages:**
1. **No Dynamic Updates** - Rules require code deployment to change
2. **No User Interface** - Cannot modify rules through the application
3. **Limited Flexibility** - Cannot create custom rules per organization

## File Structure

### **Risk Rules** - `src/data/riskRules.js`
```javascript
export const riskRules = [
  {
    id: "R001",
    name: "PEP Status",
    description: "Customer is a Politically Exposed Person",
    condition: (data) => data.pep_status === "Yes",
    score: 40,
    category: "PEP"
  },
  {
    id: "R002", 
    name: "Business Source of Funds",
    description: "Source of funds is business proceeds",
    condition: (data) => data.source_of_funds === "Business Proceeds",
    score: 20,
    category: "Source of Funds"
  },
  {
    id: "R003",
    name: "High-Risk Nationality",
    description: "Customer nationality is in high-risk list",
    condition: (data) => ["IRN", "PRK", "SYR"].includes(data.nationality),
    score: 25,
    category: "Nationality"
  },
  {
    id: "R004",
    name: "Non-Face-to-Face Onboarding",
    description: "Customer onboarded through non-face-to-face channel",
    condition: (data) => data.channel === "Non Face to Face",
    score: 15,
    category: "Onboarding"
  }
];
```

### **Transaction Rules** - `src/data/transactionRules.js`
```javascript
export const transactionRules = [
  {
    id: "TR001",
    name: "High Amount Transaction",
    description: "Transaction amount exceeds threshold",
    condition: (transaction) => transaction.amount > 10000,
    alert_severity: "Medium",
    score: 30,
    category: "Amount"
  },
  {
    id: "TR002",
    name: "Frequent Transactions",
    description: "Multiple transactions in short time period",
    condition: (transaction, customerTransactions) => {
      const recentTransactions = customerTransactions.filter(t => 
        t.transaction_date > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      return recentTransactions.length > 5;
    },
    alert_severity: "High",
    score: 40,
    category: "Frequency"
  },
  {
    id: "TR003",
    name: "High-Risk Destination",
    description: "Transaction destination is in high-risk country",
    condition: (transaction) => {
      const highRiskCountries = ["IRN", "PRK", "SYR", "CUB"];
      return highRiskCountries.includes(transaction.destination_country);
    },
    alert_severity: "Critical",
    score: 50,
    category: "Destination"
  }
];
```

### **Risk Models** - `src/data/riskModels.js`
```javascript
export const riskModels = [
  {
    id: "RM001",
    name: "Standard Risk Model",
    description: "Standard risk assessment model for retail customers",
    rules: ["R001", "R002", "R003", "R004"],
    thresholds: {
      low: 0,
      medium: 40,
      high: 80
    },
    category: "Retail"
  },
  {
    id: "RM002", 
    name: "Enhanced Risk Model",
    description: "Enhanced risk assessment for high-value customers",
    rules: ["R001", "R002", "R003", "R004", "R005", "R006"],
    thresholds: {
      low: 0,
      medium: 30,
      high: 70
    },
    category: "High-Value"
  },
  {
    id: "RM003",
    name: "Corporate Risk Model", 
    description: "Risk assessment model for corporate customers",
    rules: ["R001", "R002", "R003", "R007", "R008"],
    thresholds: {
      low: 0,
      medium: 50,
      high: 90
    },
    category: "Corporate"
  }
];
```

## Usage in Application

### **Risk Calculation Function**
```javascript
import { riskRules } from '../data/riskRules.js';
import { riskModels } from '../data/riskModels.js';

export const calculateRiskScore = (customerData, modelId = 'RM001') => {
  const model = riskModels.find(m => m.id === modelId);
  let totalScore = 0;
  const triggeredRules = [];

  // Apply rules based on selected model
  model.rules.forEach(ruleId => {
    const rule = riskRules.find(r => r.id === ruleId);
    if (rule && rule.condition(customerData)) {
      totalScore += rule.score;
      triggeredRules.push(rule);
    }
  });

  // Determine risk level based on thresholds
  const riskLevel = totalScore >= model.thresholds.high ? 'High' 
                   : totalScore >= model.thresholds.medium ? 'Medium' 
                   : 'Low';

  return {
    score: totalScore,
    level: riskLevel,
    triggeredRules,
    model: model
  };
};
```

### **Transaction Monitoring Function**
```javascript
import { transactionRules } from '../data/transactionRules.js';

export const evaluateTransaction = (transaction, customerTransactions = []) => {
  let totalScore = 0;
  const triggeredRules = [];
  const alerts = [];

  transactionRules.forEach(rule => {
    if (rule.condition(transaction, customerTransactions)) {
      totalScore += rule.score;
      triggeredRules.push(rule);
      
      alerts.push({
        rule_id: rule.id,
        alert_type: rule.name,
        severity: rule.alert_severity,
        description: rule.description,
        score: rule.score
      });
    }
  });

  return {
    risk_score: totalScore,
    triggered_rules: triggeredRules,
    alerts: alerts,
    status: totalScore > 50 ? 'Flagged' : 'Normal'
  };
};
```

## Benefits of This Approach

### **For Development:**
- **Easy Testing** - Rules can be unit tested
- **Type Safety** - TypeScript can provide type checking
- **Code Review** - Rule changes go through code review process
- **Documentation** - Rules are self-documenting in code

### **For Operations:**
- **Predictable** - Rules behave consistently across environments
- **Auditable** - All rule changes are tracked in Git
- **Deployable** - Rule changes are deployed with application
- **Rollback** - Easy to rollback rule changes

### **For Compliance:**
- **Version Control** - Complete history of rule changes
- **Approval Process** - Rule changes require code review
- **Documentation** - Rules are documented in code
- **Testing** - Rules can be thoroughly tested

## Migration Strategy

If you later decide to move to database-stored rules:

1. **Create Database Tables** - Add the rule tables back
2. **Create Admin Interface** - Build UI for rule management
3. **Migration Script** - Move current rules to database
4. **Update Functions** - Modify calculation functions to use database
5. **Testing** - Ensure database rules work same as file rules

## Current Implementation

The current implementation uses file-based rules because:
- **Simplicity** - Easier to implement and maintain
- **Performance** - No database queries for rule evaluation
- **Consistency** - Rules are consistent across all deployments
- **Version Control** - Rule changes are tracked in Git

This approach is suitable for most AML implementations where rules don't change frequently and consistency is more important than dynamic rule management.
