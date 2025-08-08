-- Add missing columns to customers table to match onboarding form fields

-- Add profession field
ALTER TABLE customers ADD COLUMN profession VARCHAR(100);

-- Add issue_date and expiry_date for ID documents
ALTER TABLE customers ADD COLUMN issue_date DATE;
ALTER TABLE customers ADD COLUMN expiry_date DATE;

-- Add country_of_birth field
ALTER TABLE customers ADD COLUMN country_of_birth VARCHAR(3);

-- Add residency_status field
ALTER TABLE customers ADD COLUMN residency_status VARCHAR(50);

-- Add is_dual_nationality boolean field
ALTER TABLE customers ADD COLUMN is_dual_nationality BOOLEAN DEFAULT false;

-- Add indexes for new columns
CREATE INDEX idx_customers_profession ON customers(profession);
CREATE INDEX idx_customers_country_of_birth ON customers(country_of_birth);
CREATE INDEX idx_customers_residency_status ON customers(residency_status);
CREATE INDEX idx_customers_is_dual_nationality ON customers(is_dual_nationality);
