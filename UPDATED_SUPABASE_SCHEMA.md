# AML Platform - Updated Supabase Database Schema

## Overview

This updated schema supports the complete workflow described for the AML Platform, including KYC management, case creation, screening logs, transaction monitoring, and comprehensive audit trails.

## Updated Database Schema

### 1. Core Tables (Updated)

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

#### Customers Table (Updated)
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
    kyc_status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected', 'Under Review'
    kyc_remarks TEXT,
    due_diligence_level VARCHAR(20) DEFAULT 'Standard', -- 'Standard', 'Enhanced', 'Simplified'
    status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Inactive', 'Suspended'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_customers_core_system_id ON customers(core_system_id);
CREATE INDEX idx_customers_risk_level ON customers(risk_level);
CREATE INDEX idx_customers_kyc_status ON customers(kyc_status);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_customers_created_at ON customers(created_at);
```

#### Customer Verification Checks Table
```sql
CREATE TABLE customer_verification_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    check_type VARCHAR(100) NOT NULL, -- 'adverseMedia', 'sanctionsMatch', 'sourceOfFunds', etc.
    check_question TEXT NOT NULL,
    answer VARCHAR(10) NOT NULL, -- 'yes' or 'no'
    notes TEXT,
    checked_by UUID REFERENCES users(id),
    checked_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for verification checks
CREATE INDEX idx_verification_checks_customer_id ON customer_verification_checks(customer_id);
CREATE INDEX idx_verification_checks_type ON customer_verification_checks(check_type);
CREATE INDEX idx_verification_checks_checked_by ON customer_verification_checks(checked_by);
```

#### Customer Risk Overrides Table
```sql
CREATE TABLE customer_risk_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    original_risk_level VARCHAR(20) NOT NULL,
    original_risk_score INTEGER NOT NULL,
    override_risk_level VARCHAR(20) NOT NULL,
    override_reason TEXT NOT NULL,
    overridden_by UUID REFERENCES users(id),
    overridden_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for risk overrides
CREATE INDEX idx_risk_overrides_customer_id ON customer_risk_overrides(customer_id);
CREATE INDEX idx_risk_overrides_overridden_by ON customer_risk_overrides(overridden_by);
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

### 2. KYC Management Tables

#### KYC Details Table
```sql
CREATE TABLE kyc_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    due_diligence_level VARCHAR(20) NOT NULL, -- 'Standard', 'Enhanced', 'Simplified'
    background_check_questions JSONB, -- Store background check questions and answers
    supporting_documents JSONB, -- Store document references
    kyc_status VARCHAR(20) NOT NULL, -- 'Pending', 'Approved', 'Rejected', 'Under Review'
    kyc_remarks TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kyc_details_customer_id ON kyc_details(customer_id);
CREATE INDEX idx_kyc_details_status ON kyc_details(kyc_status);
```

#### KYC Status Logs Table
```sql
CREATE TABLE kyc_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    remarks TEXT,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kyc_status_logs_customer_id ON kyc_status_logs(customer_id);
CREATE INDEX idx_kyc_status_logs_changed_at ON kyc_status_logs(changed_at);
```

### 3. Risk Management Tables (Updated)

#### Risk Profile Overrides Table
```sql
CREATE TABLE risk_profile_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    original_risk_level VARCHAR(20) NOT NULL,
    override_risk_level VARCHAR(20) NOT NULL,
    justification TEXT NOT NULL,
    overridden_by UUID REFERENCES users(id),
    overridden_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_risk_profile_overrides_customer_id ON risk_profile_overrides(customer_id);
CREATE INDEX idx_risk_profile_overrides_overridden_at ON risk_profile_overrides(overridden_at);
```

### 4. Transaction Monitoring Tables (Updated)

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

### 5. Screening Tables (Updated)

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

#### Screening Logs Table
```sql
CREATE TABLE screening_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    screening_type VARCHAR(20) NOT NULL, -- 'Instant', 'Ongoing'
    search_criteria JSONB NOT NULL,
    results JSONB,
    risk_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Completed', -- 'Pending', 'Completed', 'Failed'
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_screening_logs_customer_id ON screening_logs(customer_id);
CREATE INDEX idx_screening_logs_type ON screening_logs(screening_type);
CREATE INDEX idx_screening_logs_status ON screening_logs(status);
CREATE INDEX idx_screening_logs_created_at ON screening_logs(created_at);
```

#### Ongoing Screening Results Table
```sql
CREATE TABLE ongoing_screening_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    screening_date DATE NOT NULL,
    matches_found JSONB, -- Store all matches found
    risk_score INTEGER DEFAULT 0,
    case_created BOOLEAN DEFAULT false,
    case_id UUID REFERENCES cases(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ongoing_screening_results_customer_id ON ongoing_screening_results(customer_id);
CREATE INDEX idx_ongoing_screening_results_date ON ongoing_screening_results(screening_date);
CREATE INDEX idx_ongoing_screening_results_case_created ON ongoing_screening_results(case_created);
```

### 5. Case Management Tables (Updated)

#### Cases Table (Updated)
```sql
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    case_type VARCHAR(50) NOT NULL, -- 'Risk Assessment', 'Screening Match', 'Transaction Alert'
    priority VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    status VARCHAR(20) DEFAULT 'Open', -- 'Open', 'In Progress', 'Under Review', 'Closed', 'Resolved'
    assigned_to UUID REFERENCES users(id),
    description TEXT,
    source_module VARCHAR(50), -- 'Customer Onboarding', 'Screening', 'Transaction Monitoring'
    source_record_id UUID, -- ID of the record that triggered the case
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_customer_id ON cases(customer_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_priority ON cases(priority);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_source_module ON cases(source_module);
```

### 6. Transaction Monitoring Tables (Updated)

#### Transaction Alerts Table (Updated)
```sql
CREATE TABLE transaction_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    description TEXT,
    status VARCHAR(20) DEFAULT 'Open', -- 'Open', 'In Progress', 'Resolved', 'Closed'
    assigned_to UUID REFERENCES users(id),
    case_id UUID REFERENCES cases(id), -- Link to case if created
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id)
);

CREATE INDEX idx_transaction_alerts_transaction_id ON transaction_alerts(transaction_id);
CREATE INDEX idx_transaction_alerts_status ON transaction_alerts(status);
CREATE INDEX idx_transaction_alerts_severity ON transaction_alerts(severity);
CREATE INDEX idx_transaction_alerts_case_id ON transaction_alerts(case_id);
```

### 6. Risk Management Tables (Updated)

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

### 7. Case Management Tables (Updated)

#### Case Details Table
```sql
CREATE TABLE case_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    status_update VARCHAR(20) NOT NULL,
    comments TEXT,
    supporting_documents JSONB, -- Store document references
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_case_details_case_id ON case_details(case_id);
CREATE INDEX idx_case_details_updated_at ON case_details(updated_at);
```

#### Resolved Cases Table
```sql
CREATE TABLE resolved_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id),
    resolution_type VARCHAR(50) NOT NULL, -- 'Approved', 'Rejected', 'Escalated', 'Closed'
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP DEFAULT NOW(),
    resolution_documents JSONB -- Store resolution documents
);

CREATE INDEX idx_resolved_cases_case_id ON resolved_cases(case_id);
CREATE INDEX idx_resolved_cases_resolution_type ON resolved_cases(resolution_type);
CREATE INDEX idx_resolved_cases_resolved_at ON resolved_cases(resolved_at);
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

### 8. Reports Tables (Updated)

#### Reports Table (Updated)
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_number VARCHAR(50) UNIQUE NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- 'Suspicious Transaction Report', 'Screening Match Report', 'goAML XML Report'
    customer_id UUID REFERENCES customers(id),
    report_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'Draft', -- 'Draft', 'Generated', 'Submitted', 'Approved'
    file_url VARCHAR(500),
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT NOW(),
    submitted_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP
);

CREATE INDEX idx_reports_report_number ON reports(report_number);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_customer_id ON reports(customer_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(generated_at);
```

### 9. Comprehensive Audit Logs Table

#### System Logs Table
```sql
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL, -- 'Customer', 'Screening', 'Transaction', 'Case', 'Report', 'KYC'
    table_name VARCHAR(50),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_module ON system_logs(module);
CREATE INDEX idx_system_logs_table_name ON system_logs(table_name);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
```

### 9. Workflow Functions

#### Customer Onboarding Function
```sql
CREATE OR REPLACE FUNCTION process_customer_onboarding(
    customer_data JSONB,
    shareholder_data JSONB DEFAULT NULL,
    director_data JSONB DEFAULT NULL,
    bank_data JSONB DEFAULT NULL,
    ubo_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    customer_id UUID;
    risk_score INTEGER;
    risk_level VARCHAR(20);
    case_id UUID;
BEGIN
    -- Insert customer data
    INSERT INTO customers (
        core_system_id, customer_type, first_name, last_name, alias,
        date_of_birth, nationality, id_type, id_number, email, phone,
        address, city, country_of_residence, occupation, source_of_wealth,
        source_of_funds, pep_status, dual_nationality, channel, po_box,
        gender, employer, transaction_product, created_by
    )
    VALUES (
        customer_data->>'core_system_id',
        customer_data->>'customer_type',
        customer_data->>'first_name',
        customer_data->>'last_name',
        customer_data->>'alias',
        (customer_data->>'date_of_birth')::DATE,
        customer_data->>'nationality',
        customer_data->>'id_type',
        customer_data->>'id_number',
        customer_data->>'email',
        customer_data->>'phone',
        customer_data->>'address',
        customer_data->>'city',
        customer_data->>'country_of_residence',
        customer_data->>'occupation',
        customer_data->>'source_of_wealth',
        customer_data->>'source_of_funds',
        customer_data->>'pep_status',
        customer_data->>'dual_nationality',
        customer_data->>'channel',
        customer_data->>'po_box',
        customer_data->>'gender',
        customer_data->>'employer',
        customer_data->>'transaction_product',
        (customer_data->>'created_by')::UUID
    )
    RETURNING id INTO customer_id;
    
    -- Calculate risk score
    SELECT calculate_customer_risk_score(customer_id) INTO risk_score;
    
    -- Get risk level
    SELECT risk_level INTO risk_level FROM customers WHERE id = customer_id;
    
    -- Create case if risk level is Medium or High
    IF risk_level IN ('Medium', 'High') THEN
        INSERT INTO cases (
            case_number, customer_id, case_type, priority, status,
            description, source_module, source_record_id, created_by
        )
        VALUES (
            'CASE-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' || LPAD((SELECT COUNT(*) + 1 FROM cases WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW()))::TEXT, 4, '0'),
            customer_id,
            'Risk Assessment',
            CASE WHEN risk_level = 'High' THEN 'High' ELSE 'Medium' END,
            'Open',
            'Case created due to ' || risk_level || ' risk level during customer onboarding',
            'Customer Onboarding',
            customer_id,
            (customer_data->>'created_by')::UUID
        )
        RETURNING id INTO case_id;
    END IF;
    
    -- Insert shareholder data if provided
    IF shareholder_data IS NOT NULL THEN
        INSERT INTO customer_shareholders (
            customer_id, entity_type, full_name, alias, nationality,
            country_of_residence, date_of_birth, place_of_birth, phone,
            email, address, source_of_funds, source_of_wealth, occupation,
            expected_income_range, pep_status, shareholding_percentage,
            dual_nationality, is_director, is_ubo
        )
        VALUES (
            customer_id,
            shareholder_data->>'entity_type',
            shareholder_data->>'full_name',
            shareholder_data->>'alias',
            shareholder_data->>'nationality',
            shareholder_data->>'country_of_residence',
            (shareholder_data->>'date_of_birth')::DATE,
            shareholder_data->>'place_of_birth',
            shareholder_data->>'phone',
            shareholder_data->>'email',
            shareholder_data->>'address',
            shareholder_data->>'source_of_funds',
            shareholder_data->>'source_of_wealth',
            shareholder_data->>'occupation',
            shareholder_data->>'expected_income_range',
            shareholder_data->>'pep_status',
            (shareholder_data->>'shareholding_percentage')::DECIMAL,
            shareholder_data->>'dual_nationality',
            (shareholder_data->>'is_director')::BOOLEAN,
            (shareholder_data->>'is_ubo')::BOOLEAN
        );
    END IF;
    
    -- Insert director data if provided
    IF director_data IS NOT NULL THEN
        INSERT INTO customer_directors (
            customer_id, first_name, alias, last_name, country_of_residence,
            nationality, date_of_birth, phone, place_of_birth, email,
            address, city, occupation, pep_status, is_ceo, is_representative,
            dual_nationality
        )
        VALUES (
            customer_id,
            director_data->>'first_name',
            director_data->>'alias',
            director_data->>'last_name',
            director_data->>'country_of_residence',
            director_data->>'nationality',
            (director_data->>'date_of_birth')::DATE,
            director_data->>'phone',
            director_data->>'place_of_birth',
            director_data->>'email',
            director_data->>'address',
            director_data->>'city',
            director_data->>'occupation',
            director_data->>'pep_status',
            (director_data->>'is_ceo')::BOOLEAN,
            (director_data->>'is_representative')::BOOLEAN,
            director_data->>'dual_nationality'
        );
    END IF;
    
    -- Insert bank data if provided
    IF bank_data IS NOT NULL THEN
        INSERT INTO customer_bank_details (
            customer_id, bank_name, alias, account_type, currency,
            bank_account_details, account_number, iban, swift,
            mode_of_signatory, internet_banking, bank_signatories
        )
        VALUES (
            customer_id,
            bank_data->>'bank_name',
            bank_data->>'alias',
            bank_data->>'account_type',
            bank_data->>'currency',
            bank_data->>'bank_account_details',
            bank_data->>'account_number',
            bank_data->>'iban',
            bank_data->>'swift',
            bank_data->>'mode_of_signatory',
            bank_data->>'internet_banking',
            bank_data->>'bank_signatories'
        );
    END IF;
    
    -- Insert UBO data if provided
    IF ubo_data IS NOT NULL THEN
        INSERT INTO customer_ubos (
            customer_id, ubo_name, ubo_type, nationality, country_of_residence,
            date_of_birth, place_of_birth, id_type, id_number, phone,
            email, address, city, occupation, source_of_wealth, source_of_funds,
            pep_status, ownership_percentage, control_percentage, relationship_to_customer,
            is_director, is_shareholder, legal_entity_name, date_of_incorporation,
            country_of_incorporation, registration_number, business_activity, registered_address
        )
        VALUES (
            customer_id,
            ubo_data->>'ubo_name',
            ubo_data->>'ubo_type',
            ubo_data->>'nationality',
            ubo_data->>'country_of_residence',
            (ubo_data->>'date_of_birth')::DATE,
            ubo_data->>'place_of_birth',
            ubo_data->>'id_type',
            ubo_data->>'id_number',
            ubo_data->>'phone',
            ubo_data->>'email',
            ubo_data->>'address',
            ubo_data->>'city',
            ubo_data->>'occupation',
            ubo_data->>'source_of_wealth',
            ubo_data->>'source_of_funds',
            ubo_data->>'pep_status',
            (ubo_data->>'ownership_percentage')::DECIMAL,
            (ubo_data->>'control_percentage')::DECIMAL,
            ubo_data->>'relationship_to_customer',
            (ubo_data->>'is_director')::BOOLEAN,
            (ubo_data->>'is_shareholder')::BOOLEAN,
            ubo_data->>'legal_entity_name',
            (ubo_data->>'date_of_incorporation')::DATE,
            ubo_data->>'country_of_incorporation',
            ubo_data->>'registration_number',
            ubo_data->>'business_activity',
            ubo_data->>'registered_address'
        );
    END IF;
    
    RETURN customer_id;
END;
$$ LANGUAGE plpgsql;
```

#### Transaction Processing Function
```sql
CREATE OR REPLACE FUNCTION process_transaction(
    transaction_data JSONB
)
RETURNS UUID AS $$
DECLARE
    transaction_id UUID;
    risk_score INTEGER := 0;
    alert_id UUID;
    case_id UUID;
BEGIN
    -- Insert transaction
    INSERT INTO transactions (
        customer_id, transaction_type, amount, currency, transaction_date,
        source_account, destination_account, description, created_by
    )
    VALUES (
        (transaction_data->>'customer_id')::UUID,
        transaction_data->>'transaction_type',
        (transaction_data->>'amount')::DECIMAL,
        transaction_data->>'currency',
        (transaction_data->>'transaction_date')::TIMESTAMP,
        transaction_data->>'source_account',
        transaction_data->>'destination_account',
        transaction_data->>'description',
        (transaction_data->>'created_by')::UUID
    )
    RETURNING id INTO transaction_id;
    
    -- Calculate transaction risk score (simplified)
    -- In real implementation, this would check against transaction rules
    IF (transaction_data->>'amount')::DECIMAL > 10000 THEN
        risk_score := risk_score + 30;
    END IF;
    
    -- Update transaction with risk score
    UPDATE transactions 
    SET risk_score = risk_score,
        status = CASE WHEN risk_score > 50 THEN 'Flagged' ELSE 'Normal' END
    WHERE id = transaction_id;
    
    -- Create alert if risk score is high
    IF risk_score > 50 THEN
        INSERT INTO transaction_alerts (
            transaction_id, alert_type, severity, description, status
        )
        VALUES (
            transaction_id,
            'High Risk Transaction',
            CASE WHEN risk_score > 80 THEN 'Critical' WHEN risk_score > 60 THEN 'High' ELSE 'Medium' END,
            'Transaction flagged due to high risk score: ' || risk_score,
            'Open'
        )
        RETURNING id INTO alert_id;
        
        -- Create case for high-risk transactions
        INSERT INTO cases (
            case_number, customer_id, case_type, priority, status,
            description, source_module, source_record_id, created_by
        )
        VALUES (
            'CASE-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' || LPAD((SELECT COUNT(*) + 1 FROM cases WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW()))::TEXT, 4, '0'),
            (transaction_data->>'customer_id')::UUID,
            'Transaction Alert',
            CASE WHEN risk_score > 80 THEN 'High' WHEN risk_score > 60 THEN 'Medium' ELSE 'Low' END,
            'Open',
            'Case created due to high-risk transaction',
            'Transaction Monitoring',
            transaction_id,
            (transaction_data->>'created_by')::UUID
        )
        RETURNING id INTO case_id;
        
        -- Link alert to case
        UPDATE transaction_alerts 
        SET case_id = case_id 
        WHERE id = alert_id;
    END IF;
    
    RETURN transaction_id;
END;
$$ LANGUAGE plpgsql;
```

### 10. Triggers for Audit Logging

#### Audit Log Trigger Function
```sql
CREATE OR REPLACE FUNCTION audit_log_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO system_logs (
            user_id, action, module, table_name, record_id, new_values
        )
        VALUES (
            COALESCE(NEW.created_by, NEW.updated_by),
            'INSERT',
            TG_TABLE_NAME,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO system_logs (
            user_id, action, module, table_name, record_id, old_values, new_values
        )
        VALUES (
            COALESCE(NEW.updated_by, NEW.created_by),
            'UPDATE',
            TG_TABLE_NAME,
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO system_logs (
            user_id, action, module, table_name, record_id, old_values
        )
        VALUES (
            OLD.updated_by,
            'DELETE',
            TG_TABLE_NAME,
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to all tables
CREATE TRIGGER audit_customers_trigger AFTER INSERT OR UPDATE OR DELETE ON customers
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_transactions_trigger AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_cases_trigger AFTER INSERT OR UPDATE OR DELETE ON cases
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();

CREATE TRIGGER audit_reports_trigger AFTER INSERT OR UPDATE OR DELETE ON reports
    FOR EACH ROW EXECUTE FUNCTION audit_log_trigger();
```

## Implementation Steps

1. **Execute the SQL scripts** in your Supabase SQL editor in the order provided
2. **Test the functions** with sample data
3. **Update your frontend** to use these functions for data processing
4. **Implement the workflow logic** in your React components

This updated schema now fully supports all the workflows you described, including automatic case creation, comprehensive audit logging, and proper data relationships.
