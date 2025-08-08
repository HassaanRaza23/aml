# AML Platform - Complete Table List

## Overview

This document lists all tables included in the **UPDATED_SUPABASE_SCHEMA.md** file. This is the complete, production-ready database schema for the AML Platform.

## Complete Table List

### 1. Core Tables
- ✅ **users** - User management and authentication
- ✅ **customers** - Customer information and profiles (updated with KYC fields)

### 2. Customer-Related Tables
- ✅ **customer_shareholders** - Shareholder details with entity types
- ✅ **customer_directors** - Director/representative information
- ✅ **customer_bank_details** - Banking relationship details
- ✅ **customer_ubos** - Ultimate Beneficial Owner details

### 3. KYC Management Tables
- ✅ **kyc_details** - KYC information and background checks
- ✅ **kyc_status_logs** - KYC status change tracking

### 4. Risk Management Tables
- ✅ **risk_profile_overrides** - Manual risk level overrides
- ✅ **risk_assessments** - Risk assessment results

### 5. Transaction Monitoring Tables
- ✅ **transactions** - Financial transaction records
- ✅ **transaction_alerts** - Transaction alert management

### 6. Screening Tables
- ✅ **screenings** - Screening results and history
- ✅ **screening_matches** - Individual screening matches
- ✅ **screening_logs** - Complete screening audit trail
- ✅ **ongoing_screening_results** - Daily screening results

### 7. Case Management Tables
- ✅ **cases** - Case management (updated with source tracking)
- ✅ **case_details** - Detailed case information
- ✅ **resolved_cases** - Completed cases tracking
- ✅ **case_actions** - Case workflow actions

### 8. Reports Tables
- ✅ **reports** - Generated reports (updated with approval tracking)

### 9. Audit & Logging Tables
- ✅ **system_logs** - Comprehensive audit logging

## Total: 18 Tables

## Missing Tables (Intentionally Excluded)

### ❌ Removed Tables (File-Based Approach)
- **transaction_rules** - Now using file-based rules
- **risk_rules** - Now using file-based rules
- **risk_models** - Now using file-based models

## Table Relationships

### Customer Hierarchy
```
customers
├── customer_shareholders
├── customer_directors
├── customer_bank_details
├── customer_ubos
├── kyc_details
├── risk_assessments
├── transactions
└── screenings
```

### Transaction Flow
```
transactions
├── transaction_alerts
└── cases (if flagged)
```

### Screening Flow
```
screenings
├── screening_matches
├── screening_logs
├── ongoing_screening_results
└── cases (if matches found)
```

### Case Management
```
cases
├── case_details
├── case_actions
└── resolved_cases
```

### Audit Trail
```
system_logs (tracks all table changes)
```

## Key Features Supported

### ✅ Customer Onboarding
- Complete customer registration
- Shareholder, director, bank, UBO details
- Automatic risk assessment
- KYC status management

### ✅ Risk Management
- Dynamic risk scoring
- Manual risk overrides
- Risk assessment tracking
- Risk level management

### ✅ Screening
- Instant screening
- Ongoing screening
- Screening history
- Match tracking

### ✅ Transaction Monitoring
- Transaction recording
- Risk scoring
- Alert generation
- Case creation

### ✅ Case Management
- Case creation and tracking
- Status updates
- Action logging
- Resolution tracking

### ✅ Reporting
- Report generation
- Status tracking
- Approval workflow
- File storage

### ✅ Audit & Compliance
- Complete audit trail
- Activity logging
- Change tracking
- Compliance reporting

## Database Functions Included

### Workflow Functions
- **process_customer_onboarding()** - Complete onboarding workflow
- **process_transaction()** - Transaction processing with alerts
- **calculate_customer_risk_score()** - Risk calculation
- **audit_log_trigger()** - Automatic audit logging

### Triggers
- **update_updated_at_column()** - Automatic timestamp updates
- **audit_log_trigger()** - Comprehensive audit logging

## Execution Order

1. **Enable Extensions** (uuid-ossp, pg_trgm, btree_gin)
2. **Create Core Tables** (users, customers)
3. **Create Customer Tables** (shareholders, directors, bank, UBOs)
4. **Create KYC Tables** (kyc_details, kyc_status_logs)
5. **Create Risk Tables** (risk_profile_overrides, risk_assessments)
6. **Create Transaction Tables** (transactions, transaction_alerts)
7. **Create Screening Tables** (screenings, screening_matches, screening_logs, ongoing_screening_results)
8. **Create Case Tables** (cases, case_details, resolved_cases, case_actions)
9. **Create Report Tables** (reports)
10. **Create Audit Tables** (system_logs)
11. **Create Functions** (workflow functions)
12. **Create Triggers** (audit triggers)
13. **Insert Sample Data** (users, test data)

## File-Based Rules (Not in Database)

### Risk Rules - `src/data/riskRules.js`
- PEP status rules
- Source of funds rules
- Nationality risk rules
- Onboarding channel rules

### Transaction Rules - `src/data/transactionRules.js`
- Amount threshold rules
- Frequency rules
- Destination risk rules
- Pattern detection rules

### Risk Models - `src/data/riskModels.js`
- Standard risk model
- Enhanced risk model
- Corporate risk model

## Summary

The **UPDATED_SUPABASE_SCHEMA.md** file contains a complete, production-ready database schema with:

- ✅ **18 Tables** covering all AML workflows
- ✅ **Complete Relationships** between all entities
- ✅ **Workflow Functions** for automated processing
- ✅ **Audit Logging** for compliance
- ✅ **Performance Indexes** for fast queries
- ✅ **Security Features** with RLS policies

This schema supports the complete AML platform workflow you described, from customer onboarding through screening, monitoring, case management, and reporting.
