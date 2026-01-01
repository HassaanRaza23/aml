-- Drop and recreate transactions table from scratch with all new fields
-- This script will remove all existing data and columns, then create a fresh table

-- Step 1: Drop the existing transactions table (this will also drop dependent objects like indexes and foreign keys)
DROP TABLE IF EXISTS transactions CASCADE;

-- Step 2: Recreate the transactions table with all new fields
CREATE TABLE transactions (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Customer and director references
    customer_id UUID NOT NULL REFERENCES customers(id),
    director_id UUID REFERENCES customer_directors(id),
    
    -- Basic transaction information
    transaction_type VARCHAR(50),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    
    -- Account information
    source_account VARCHAR(255),
    destination_account VARCHAR(255),
    
    -- Report and action fields
    description_of_report TEXT NOT NULL,
    action_taken_by_reporting_entity TEXT NOT NULL,
    internal_reference_number VARCHAR(100) NOT NULL,
    
    -- Transaction details
    transaction_product VARCHAR(100) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    source_of_funds VARCHAR(100) NOT NULL,
    transaction_purpose VARCHAR(100) NOT NULL,
    
    -- Financial details
    rate DECIMAL(15,4) NOT NULL,
    invoice_amount DECIMAL(15,2) NOT NULL,
    amount_lc DECIMAL(15,2),
    estimated_amount DECIMAL(15,2),
    
    -- Item information
    item_type VARCHAR(100) NOT NULL,
    item_size VARCHAR(100),
    item_unit VARCHAR(50),
    
    -- Status and codes
    status_code VARCHAR(50) NOT NULL,
    status_comments TEXT,
    
    -- Beneficiary information
    beneficiary_name VARCHAR(255),
    beneficiary_comments TEXT,
    
    -- Additional fields
    late_deposit VARCHAR(10),
    branch VARCHAR(100),
    indemnified_for_repatriation VARCHAR(10),
    executed_by VARCHAR(50),
    
    -- Carrier information
    carrier_name VARCHAR(255),
    carrier_details TEXT,
    
    -- STR/ISTR flag
    is_str_istr BOOLEAN DEFAULT FALSE,
    
    -- Reason and description (required fields at bottom)
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- System fields
    risk_score INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected', 'Normal', 'Flagged', 'Blocked'
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_director_id ON transactions(director_id);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_risk_score ON transactions(risk_score);
CREATE INDEX idx_transactions_internal_reference_number ON transactions(internal_reference_number);
CREATE INDEX idx_transactions_transaction_product ON transactions(transaction_product);
CREATE INDEX idx_transactions_payment_mode ON transactions(payment_mode);
CREATE INDEX idx_transactions_status_code ON transactions(status_code);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Step 4: Add column comments for documentation
COMMENT ON TABLE transactions IS 'Comprehensive transaction records with all reporting fields';
COMMENT ON COLUMN transactions.customer_id IS 'Reference to the customer';
COMMENT ON COLUMN transactions.director_id IS 'Director/Representative ID for legal entity transactions';
COMMENT ON COLUMN transactions.description_of_report IS 'Description of the transaction report';
COMMENT ON COLUMN transactions.action_taken_by_reporting_entity IS 'Action taken by the reporting entity';
COMMENT ON COLUMN transactions.internal_reference_number IS 'Internal reference number for the transaction';
COMMENT ON COLUMN transactions.transaction_product IS 'Product type for the transaction';
COMMENT ON COLUMN transactions.payment_mode IS 'Payment mode (Cash Transaction, Bank Transfer, etc.)';
COMMENT ON COLUMN transactions.channel IS 'Transaction channel (Face to Face, Non Face to Face)';
COMMENT ON COLUMN transactions.source_of_funds IS 'Source of funds for the transaction';
COMMENT ON COLUMN transactions.transaction_purpose IS 'Purpose of the transaction';
COMMENT ON COLUMN transactions.rate IS 'Exchange rate for the transaction';
COMMENT ON COLUMN transactions.invoice_amount IS 'Invoice amount';
COMMENT ON COLUMN transactions.item_type IS 'Type of item in the transaction';
COMMENT ON COLUMN transactions.status_code IS 'Status code of the transaction';
COMMENT ON COLUMN transactions.reason IS 'Reason for the transaction';
COMMENT ON COLUMN transactions.is_str_istr IS 'Whether this is a STR/ISTR transaction';
COMMENT ON COLUMN transactions.status IS 'Transaction status: Pending (awaiting approval), Approved, Rejected, Normal, Flagged, Blocked';
COMMENT ON COLUMN transactions.approved_by IS 'User who approved or rejected the transaction';
COMMENT ON COLUMN transactions.approved_at IS 'Timestamp when transaction was approved or rejected';
COMMENT ON COLUMN transactions.rejection_reason IS 'Reason provided when transaction is rejected';

