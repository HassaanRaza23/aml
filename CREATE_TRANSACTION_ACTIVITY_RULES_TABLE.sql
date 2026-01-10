-- Create transaction_activity_rules table
-- This table stores rules that can be triggered when a transaction is created

CREATE TABLE transaction_activity_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_number INTEGER NOT NULL UNIQUE, -- Auto-generated, increments from 1
    transaction_type VARCHAR(100), -- Transaction Type (from dropdown)
    parameter VARCHAR(100), -- Parameter (from dropdown)
    count_match_type VARCHAR(50), -- Count Match Type (from dropdown: equals, greater than, less than, etc.)
    transaction_count VARCHAR(100), -- Transaction Count (text input)
    threshold_match_type VARCHAR(50), -- Threshold Match Type (from dropdown)
    threshold VARCHAR(100), -- Threshold value (text input)
    frequency VARCHAR(50), -- Frequency (from dropdown)
    is_active BOOLEAN DEFAULT true, -- Active/Inactive
    activity_rule_score INTEGER NOT NULL, -- Activity Rule Score
    rule_display_name VARCHAR(255) NOT NULL, -- Rule Display Name
    rule_description TEXT, -- Rule Description
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on rule_number for faster lookups
CREATE INDEX idx_transaction_activity_rules_rule_number ON transaction_activity_rules(rule_number);

-- Create index on is_active for filtering active rules
CREATE INDEX idx_transaction_activity_rules_is_active ON transaction_activity_rules(is_active);

-- Create index on transaction_type for filtering
CREATE INDEX idx_transaction_activity_rules_transaction_type ON transaction_activity_rules(transaction_type);

-- Add comments for documentation
COMMENT ON TABLE transaction_activity_rules IS 'Rules that can be triggered when a transaction is created';
COMMENT ON COLUMN transaction_activity_rules.rule_number IS 'Auto-generated rule number, increments from 1';
COMMENT ON COLUMN transaction_activity_rules.count_match_type IS 'Match type for transaction count (e.g., equals, greater than, less than)';
COMMENT ON COLUMN transaction_activity_rules.threshold_match_type IS 'Match type for threshold comparison';
COMMENT ON COLUMN transaction_activity_rules.activity_rule_score IS 'Risk score assigned when this rule is triggered';

-- Create sequence for auto-generating rule numbers starting from 1
CREATE SEQUENCE transaction_activity_rule_number_seq START 1;

-- Function to auto-generate rule_number
CREATE OR REPLACE FUNCTION generate_transaction_activity_rule_number()
RETURNS INTEGER AS $$
DECLARE
    next_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(rule_number), 0) + 1 INTO next_number
    FROM transaction_activity_rules;
    RETURN next_number;
END;
$$ LANGUAGE plpgsql;

