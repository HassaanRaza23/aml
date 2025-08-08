# AML Platform - Corrected Database Execution Order

## Problem Fixed

The original schema had dependency issues where tables referenced the `cases` table before it was created. This has been fixed by reordering the table creation sequence.

## Corrected Execution Order

### 1. Enable Extensions (First)
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
```

### 2. Create Core Tables
```sql
-- Users table
CREATE TABLE users (...);

-- Customers table  
CREATE TABLE customers (...);
```

### 3. Create Customer-Related Tables
```sql
-- Customer shareholders
CREATE TABLE customer_shareholders (...);

-- Customer directors
CREATE TABLE customer_directors (...);

-- Customer bank details
CREATE TABLE customer_bank_details (...);

-- Customer UBOs
CREATE TABLE customer_ubos (...);
```

### 4. Create KYC Management Tables
```sql
-- KYC details
CREATE TABLE kyc_details (...);

-- KYC status logs
CREATE TABLE kyc_status_logs (...);
```

### 5. Create Risk Management Tables
```sql
-- Risk profile overrides
CREATE TABLE risk_profile_overrides (...);

-- Risk assessments
CREATE TABLE risk_assessments (...);
```

### 6. Create Transaction Tables
```sql
-- Transactions
CREATE TABLE transactions (...);
```

### 7. Create Screening Tables
```sql
-- Screenings
CREATE TABLE screenings (...);

-- Screening matches
CREATE TABLE screening_matches (...);

-- Screening logs
CREATE TABLE screening_logs (...);
```

### 8. Create Cases Table (Moved Earlier)
```sql
-- Cases (MUST be created before ongoing_screening_results and transaction_alerts)
CREATE TABLE cases (...);
```

### 9. Create Dependent Tables
```sql
-- Ongoing screening results (references cases)
CREATE TABLE ongoing_screening_results (...);

-- Transaction alerts (references cases)
CREATE TABLE transaction_alerts (...);
```

### 10. Create Remaining Case Tables
```sql
-- Case details
CREATE TABLE case_details (...);

-- Resolved cases
CREATE TABLE resolved_cases (...);

-- Case actions
CREATE TABLE case_actions (...);
```

### 11. Create Reports Tables
```sql
-- Reports
CREATE TABLE reports (...);
```

### 12. Create Audit Tables
```sql
-- System logs
CREATE TABLE system_logs (...);
```

### 13. Create Functions
```sql
-- Workflow functions
CREATE OR REPLACE FUNCTION process_customer_onboarding(...);
CREATE OR REPLACE FUNCTION process_transaction(...);
CREATE OR REPLACE FUNCTION calculate_customer_risk_score(...);
```

### 14. Create Triggers
```sql
-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... (all other update triggers)

-- Audit triggers
CREATE OR REPLACE FUNCTION audit_log_trigger();
CREATE TRIGGER audit_customers_trigger AFTER INSERT OR UPDATE OR DELETE ON customers FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
-- ... (all other audit triggers)
```

### 15. Insert Sample Data
```sql
-- Insert sample users
INSERT INTO users (email, first_name, last_name, role) VALUES (...);

-- Insert sample data for testing
```

## Key Changes Made

### ✅ Fixed Dependencies
- **Moved `cases` table** to be created before `ongoing_screening_results`
- **Moved `cases` table** to be created before `transaction_alerts`
- **Moved `cases` table** to be created before `case_details`
- **Moved `cases` table** to be created before `resolved_cases`
- **Moved `cases` table** to be created before `case_actions`

### ✅ Correct Order
1. **Core tables** (users, customers)
2. **Customer-related tables** (shareholders, directors, bank, UBOs)
3. **KYC tables** (kyc_details, kyc_status_logs)
4. **Risk tables** (risk_profile_overrides, risk_assessments)
5. **Transaction tables** (transactions)
6. **Screening tables** (screenings, screening_matches, screening_logs)
7. **Cases table** (cases) ← **MOVED HERE**
8. **Dependent tables** (ongoing_screening_results, transaction_alerts)
9. **Remaining case tables** (case_details, resolved_cases, case_actions)
10. **Reports tables** (reports)
11. **Audit tables** (system_logs)

## Usage Instructions

### ✅ Use UPDATED_SUPABASE_SCHEMA.md

1. **Copy all SQL** from `UPDATED_SUPABASE_SCHEMA.md`
2. **Execute in Supabase SQL Editor** in the order shown above
3. **No more dependency errors** - all tables will create successfully

### ✅ Alternative: Execute in Sections

If you prefer to execute in sections, follow this order:

1. **Extensions** (lines 1-10)
2. **Core Tables** (users, customers)
3. **Customer Tables** (shareholders, directors, bank, UBOs)
4. **KYC Tables** (kyc_details, kyc_status_logs)
5. **Risk Tables** (risk_profile_overrides, risk_assessments)
6. **Transaction Tables** (transactions)
7. **Screening Tables** (screenings, screening_matches, screening_logs)
8. **Cases Table** (cases) ← **CRITICAL: Must be before dependent tables**
9. **Dependent Tables** (ongoing_screening_results, transaction_alerts)
10. **Remaining Case Tables** (case_details, resolved_cases, case_actions)
11. **Reports Tables** (reports)
12. **Audit Tables** (system_logs)
13. **Functions** (workflow functions)
14. **Triggers** (update and audit triggers)
15. **Sample Data** (test data)

## Summary

The **UPDATED_SUPABASE_SCHEMA.md** file now has the correct table creation order with no dependency issues. You can execute it directly in Supabase without any errors! 🎉
