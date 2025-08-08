# AML Platform - Supabase Database Setup Guide

## Overview

This guide will help you set up the complete database schema for the AML Platform using Supabase. We'll create all necessary tables, relationships, and configurations.

## Prerequisites

1. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
2. **Project Creation** - Create a new Supabase project
3. **Database Access** - Get your database connection details

## Database Schema Setup

### 1. Enable Required Extensions

First, enable the necessary PostgreSQL extensions in your Supabase project:

```sql
-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSONB for flexible data storage
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";
```

### 2. Create Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'analyst',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Create index for email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### Customers Table
```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    core_system_id VARCHAR(50) UNIQUE,
    customer_type VARCHAR(20) NOT NULL, -- 'Natural Person', 'Legal Entities'
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    alias VARCHAR(100),
    date_of_birth DATE,
    nationality VARCHAR(3),
    id_type VARCHAR(50),
    id_number VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country_of_residence VARCHAR(3),
    occupation VARCHAR(100),
    source_of_wealth VARCHAR(100),
    source_of_funds VARCHAR(100),
    pep_status VARCHAR(10) DEFAULT 'No', -- 'Yes', 'No'
    dual_nationality VARCHAR(3),
    channel VARCHAR(50), -- 'Face to Face', 'Non Face to Face'
    po_box VARCHAR(50),
    gender VARCHAR(10),
    employer VARCHAR(100),
    transaction_product VARCHAR(100),
    risk_score INTEGER DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'Low', -- 'Low', 'Medium', 'High'
    status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Inactive', 'Suspended'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_customers_core_system_id ON customers(core_system_id);
CREATE INDEX idx_customers_risk_level ON customers(risk_level);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_created_at ON customers(created_at);
```

#### Customer Shareholders Table
```sql
CREATE TABLE customer_shareholders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    entity_type VARCHAR(20) NOT NULL, -- 'Natural Person', 'Legal Entities', 'Trust'
    full_name VARCHAR(255),
    alias VARCHAR(100),
    nationality VARCHAR(3),
    country_of_residence VARCHAR(3),
    date_of_birth DATE,
    place_of_birth VARCHAR(3),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    source_of_funds VARCHAR(100),
    source_of_wealth VARCHAR(100),
    occupation VARCHAR(100),
    expected_income_range VARCHAR(100),
    pep_status VARCHAR(10),
    shareholding_percentage DECIMAL(5,2),
    dual_nationality VARCHAR(3),
    is_director BOOLEAN DEFAULT false,
    is_ubo BOOLEAN DEFAULT false,
    -- Legal Entity specific fields
    legal_name VARCHAR(255),
    date_of_incorporation DATE,
    country_of_incorporation VARCHAR(3),
    entity_class VARCHAR(20), -- 'Class A', 'Class B'
    license_type VARCHAR(100),
    license_number VARCHAR(100),
    license_issue_date DATE,
    license_expiry_date DATE,
    business_activity VARCHAR(100),
    countries_of_operation VARCHAR(3)[],
    registered_office_address TEXT,
    countries_source_of_funds VARCHAR(3)[],
    -- Trust specific fields
    trust_name VARCHAR(255),
    trust_registered VARCHAR(10), -- 'Yes', 'No'
    trust_type VARCHAR(50), -- 'Discretionary', 'Charitable', 'Purpose'
    jurisdiction_of_law VARCHAR(3),
    registered_address TEXT,
    trustee_name VARCHAR(255),
    trustee_type VARCHAR(20), -- 'Natural Person', 'Legal Entities'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customer_shareholders_customer_id ON customer_shareholders(customer_id);
CREATE INDEX idx_customer_shareholders_entity_type ON customer_shareholders(entity_type);
```

#### Customer Directors Table
```sql
CREATE TABLE customer_directors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    alias VARCHAR(100),
    last_name VARCHAR(100),
    country_of_residence VARCHAR(3),
    nationality VARCHAR(3),
    date_of_birth DATE,
    phone VARCHAR(50),
    place_of_birth VARCHAR(3),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    occupation VARCHAR(100),
    pep_status VARCHAR(10),
    is_ceo BOOLEAN DEFAULT false,
    is_representative BOOLEAN DEFAULT false,
    dual_nationality VARCHAR(3),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customer_directors_customer_id ON customer_directors(customer_id);
```

#### Customer Bank Details Table
```sql
CREATE TABLE customer_bank_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    bank_name VARCHAR(255),
    alias VARCHAR(100),
    account_type VARCHAR(20), -- 'call', 'fixed', 'current'
    currency VARCHAR(3),
    bank_account_details TEXT,
    account_number VARCHAR(100),
    iban VARCHAR(100),
    swift VARCHAR(50),
    mode_of_signatory VARCHAR(20), -- 'single', 'dual'
    internet_banking VARCHAR(10), -- 'Yes', 'No'
    bank_signatories VARCHAR(50), -- 'Signatory 1', 'Signatory 2'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customer_bank_details_customer_id ON customer_bank_details(customer_id);
```

#### Customer UBO (Ultimate Beneficial Owner) Table
```sql
CREATE TABLE customer_ubos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    ubo_name VARCHAR(255) NOT NULL,
    ubo_type VARCHAR(20) NOT NULL, -- 'Natural Person', 'Legal Entity'
    nationality VARCHAR(3),
    country_of_residence VARCHAR(3),
    date_of_birth DATE,
    place_of_birth VARCHAR(3),
    id_type VARCHAR(50),
    id_number VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    occupation VARCHAR(100),
    source_of_wealth VARCHAR(100),
    source_of_funds VARCHAR(100),
    pep_status VARCHAR(10) DEFAULT 'No',
    ownership_percentage DECIMAL(5,2),
    control_percentage DECIMAL(5,2),
    relationship_to_customer VARCHAR(100), -- 'Owner', 'Director', 'Shareholder', 'Other'
    is_director BOOLEAN DEFAULT false,
    is_shareholder BOOLEAN DEFAULT false,
    -- Legal Entity specific fields
    legal_entity_name VARCHAR(255),
    date_of_incorporation DATE,
    country_of_incorporation VARCHAR(3),
    registration_number VARCHAR(100),
    business_activity VARCHAR(100),
    registered_address TEXT,
    -- Additional UBO specific fields
    risk_score INTEGER DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'Low',
    screening_status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Completed', 'Failed'
    screening_results JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customer_ubos_customer_id ON customer_ubos(customer_id);
CREATE INDEX idx_customer_ubos_type ON customer_ubos(ubo_type);
CREATE INDEX idx_customer_ubos_risk_level ON customer_ubos(risk_level);
CREATE INDEX idx_customer_ubos_screening_status ON customer_ubos(screening_status);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    transaction_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    source_account VARCHAR(100),
    destination_account VARCHAR(100),
    description TEXT,
    risk_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Normal', -- 'Normal', 'Flagged', 'Blocked'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_risk_score ON transactions(risk_score);
```

#### Transaction Alerts Table
```sql
CREATE TABLE transaction_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    description TEXT,
    status VARCHAR(20) DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id)
);

CREATE INDEX idx_transaction_alerts_transaction_id ON transaction_alerts(transaction_id);
CREATE INDEX idx_transaction_alerts_status ON transaction_alerts(status);
CREATE INDEX idx_transaction_alerts_severity ON transaction_alerts(severity);
```

#### Screenings Table
```sql
CREATE TABLE screenings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    screening_type VARCHAR(20) NOT NULL, -- 'Instant', 'Ongoing'
    search_criteria JSONB NOT NULL,
    results JSONB,
    risk_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Completed', 'Failed'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_screenings_customer_id ON screenings(customer_id);
CREATE INDEX idx_screenings_type ON screenings(screening_type);
CREATE INDEX idx_screenings_status ON screenings(status);
CREATE INDEX idx_screenings_created_at ON screenings(created_at);
```

#### Screening Matches Table
```sql
CREATE TABLE screening_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    screening_id UUID REFERENCES screenings(id) ON DELETE CASCADE,
    match_type VARCHAR(50) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    match_score INTEGER NOT NULL,
    source VARCHAR(100) NOT NULL, -- 'Dow Jones', 'Thomson Reuters', 'World-Check', etc.
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_screening_matches_screening_id ON screening_matches(screening_id);
CREATE INDEX idx_screening_matches_source ON screening_matches(source);
CREATE INDEX idx_screening_matches_score ON screening_matches(match_score);
```



#### Risk Assessments Table
```sql
CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    risk_score INTEGER NOT NULL,
    risk_level VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High'
    triggered_rules JSONB,
    assessment_date TIMESTAMP NOT NULL,
    next_review_date TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_risk_assessments_customer_id ON risk_assessments(customer_id);
CREATE INDEX idx_risk_assessments_level ON risk_assessments(risk_level);
CREATE INDEX idx_risk_assessments_date ON risk_assessments(assessment_date);
```

#### Cases Table
```sql
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    case_type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    status VARCHAR(20) DEFAULT 'Open', -- 'Open', 'In Progress', 'Under Review', 'Closed'
    assigned_to UUID REFERENCES users(id),
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_customer_id ON cases(customer_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_priority ON cases(priority);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
```

#### Case Actions Table
```sql
CREATE TABLE case_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    description TEXT,
    performed_by UUID REFERENCES users(id),
    performed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_case_actions_case_id ON case_actions(case_id);
CREATE INDEX idx_case_actions_type ON case_actions(action_type);
CREATE INDEX idx_case_actions_performed_by ON case_actions(performed_by);
```

#### Reports Table
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_type VARCHAR(50) NOT NULL,
    customer_id UUID REFERENCES customers(id),
    report_data JSONB,
    status VARCHAR(20) DEFAULT 'Draft', -- 'Draft', 'Generated', 'Submitted'
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT NOW(),
    submitted_at TIMESTAMP,
    file_url VARCHAR(500)
);

CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_customer_id ON reports(customer_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(generated_at);
```

#### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 3. Create Row Level Security (RLS) Policies

Enable RLS on all tables and create appropriate policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view all customers" ON customers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all transactions" ON transactions
    FOR ALL USING (auth.role() = 'authenticated');

-- Add more specific policies based on your requirements
```

### 4. Create Functions and Triggers

#### Updated At Trigger Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to tables with updated_at column
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risk_rules_updated_at BEFORE UPDATE ON risk_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Risk Score Calculation Function
```sql
CREATE OR REPLACE FUNCTION calculate_customer_risk_score(customer_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_score INTEGER := 0;
    customer_record RECORD;
BEGIN
    -- Get customer data
    SELECT * INTO customer_record FROM customers WHERE id = customer_uuid;
    
    -- Calculate risk score based on various factors
    -- This is a simplified example - you can expand this logic
    
    -- PEP status
    IF customer_record.pep_status = 'Yes' THEN
        total_score := total_score + 40;
    END IF;
    
    -- Source of funds
    IF customer_record.source_of_funds = 'Business Proceeds' THEN
        total_score := total_score + 20;
    END IF;
    
    -- Channel
    IF customer_record.channel = 'Non Face to Face' THEN
        total_score := total_score + 15;
    END IF;
    
    -- Update customer risk score
    UPDATE customers 
    SET risk_score = total_score,
        risk_level = CASE 
            WHEN total_score >= 80 THEN 'High'
            WHEN total_score >= 40 THEN 'Medium'
            ELSE 'Low'
        END
    WHERE id = customer_uuid;
    
    RETURN total_score;
END;
$$ LANGUAGE plpgsql;
```

### 5. Insert Sample Data

#### Sample Users
```sql
INSERT INTO users (email, first_name, last_name, role) VALUES
('admin@amlplatform.com', 'Admin', 'User', 'admin'),
('analyst@amlplatform.com', 'John', 'Analyst', 'analyst'),
('manager@amlplatform.com', 'Sarah', 'Manager', 'manager');
```

#### Sample Risk Rules
```sql
INSERT INTO risk_rules (name, description, condition_type, condition_value, score_weight) VALUES
('PEP Status', 'Customer is a Politically Exposed Person', 'pep_status', '{"value": "Yes"}', 40),
('Business Source of Funds', 'Source of funds is business proceeds', 'source_of_funds', '{"value": "Business Proceeds"}', 20),
('Non-Face-to-Face Onboarding', 'Customer onboarded through non-face-to-face channel', 'channel', '{"value": "Non Face to Face"}', 15),
('High-Risk Nationality', 'Customer nationality is in high-risk list', 'nationality', '{"values": ["IRN", "PRK", "SYR"]}', 25);
```

### 6. Environment Variables Setup

Add these environment variables to your Supabase project:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# External API Keys (for screening providers)
DOW_JONES_API_KEY=your_dow_jones_key
THOMSON_REUTERS_API_KEY=your_thomson_reuters_key
WORLD_CHECK_API_KEY=your_world_check_key
```

### 7. Database Connection in Frontend

Update your frontend to connect to Supabase:

```javascript
// src/config/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 8. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Next Steps

1. **Execute the SQL scripts** in your Supabase SQL editor
2. **Set up environment variables** in your Supabase project
3. **Install Supabase client** in your React app
4. **Update your frontend** to use Supabase instead of mock data
5. **Test the database** with sample data

This setup provides a complete, production-ready database schema for your AML Platform with proper relationships, indexes, and security policies.
