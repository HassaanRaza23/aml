-- Update Existing Customers Table and Create Detail Tables
-- This approach modifies the existing table instead of creating a new one

-- Step 1: Remove person-specific columns and add new fields to existing customers table
ALTER TABLE public.customers 
DROP COLUMN IF EXISTS first_name,
DROP COLUMN IF EXISTS last_name,
DROP COLUMN IF EXISTS alias,
DROP COLUMN IF EXISTS date_of_birth,
DROP COLUMN IF EXISTS nationality,
DROP COLUMN IF EXISTS id_type,
DROP COLUMN IF EXISTS id_number,
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS country_of_residence,
DROP COLUMN IF EXISTS occupation,
DROP COLUMN IF EXISTS source_of_wealth,
DROP COLUMN IF EXISTS source_of_funds,
DROP COLUMN IF EXISTS pep_status,
DROP COLUMN IF EXISTS dual_nationality,
DROP COLUMN IF EXISTS po_box,
DROP COLUMN IF EXISTS gender,
DROP COLUMN IF EXISTS employer,
DROP COLUMN IF EXISTS profession,
DROP COLUMN IF EXISTS issue_date,
DROP COLUMN IF EXISTS expiry_date,
DROP COLUMN IF EXISTS country_of_birth,
DROP COLUMN IF EXISTS residency_status,
DROP COLUMN IF EXISTS is_dual_nationality;

-- Add new transaction fields
ALTER TABLE public.customers 
ADD COLUMN transaction_amount_limit decimal(15,2) NULL,
ADD COLUMN transaction_limit decimal(15,2) NULL;

-- Step 2: Create natural_person_details table
CREATE TABLE public.natural_person_details (
  customer_id uuid NOT NULL,
  profession character varying(100) NULL,
  firstName character varying(100) NULL,
  lastName character varying(100) NULL,
  alias character varying(100) NULL,
  dateOfBirth date NULL,
  nationality character varying(3) NULL,
  residencyStatus character varying(50) NULL,
  idType character varying(50) NULL,
  idNumber character varying(100) NULL,
  issueDate date NULL,
  expiryDate date NULL,
  isDualNationality boolean NULL DEFAULT false,
  dualNationality character varying(3) NULL,
  dualPassportNumber character varying(100) NULL,
  dualPassportIssueDate date NULL,
  dualPassportExpiryDate date NULL,
  countryOfBirth character varying(3) NULL,
  address text NULL,
  city character varying(100) NULL,
  occupation character varying(100) NULL,
  sourceOfWealth character varying(100) NULL,
  pep character varying(10) NULL,
  sourceOfFunds character varying(100) NULL,
  poBox character varying(50) NULL,
  gender character varying(10) NULL,
  employer character varying(100) NULL,
  
  CONSTRAINT natural_person_details_pkey PRIMARY KEY (customer_id),
  CONSTRAINT natural_person_details_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Step 3: Create legal_entity_details table
CREATE TABLE public.legal_entity_details (
  customer_id uuid NOT NULL,
  businessActivity text NULL, -- JSON array for multiple selections
  legalName character varying(255) NULL,
  alias character varying(100) NULL,
  dateOfIncorporation date NULL,
  countryOfIncorporation character varying(3) NULL,
  licenseType character varying(100) NULL,
  licenseNumber character varying(100) NULL,
  licenseIssueDate date NULL,
  licenseExpiryDate date NULL,
  registeredOfficeAddress text NULL,
  city character varying(100) NULL,
  countriesSourceOfFunds text NULL, -- JSON array for multiple selections
  managementCompany character varying(255) NULL,
  countriesOfOperation text NULL, -- JSON array for multiple selections
  jurisdiction character varying(100) NULL,
  sourceOfFunds character varying(100) NULL,
  residencyStatus character varying(50) NULL,
  licensingAuthority text NULL,
  trn character varying(100) NULL,
  licenseCategory text NULL, -- JSON array for multiple selections
  addressExpiryDate date NULL,
  
  CONSTRAINT legal_entity_details_pkey PRIMARY KEY (customer_id),
  CONSTRAINT legal_entity_details_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Step 4: Create essential indexes for new tables
CREATE INDEX IF NOT EXISTS idx_natural_person_first_name ON public.natural_person_details USING btree (firstName) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_natural_person_last_name ON public.natural_person_details USING btree (lastName) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_natural_person_nationality ON public.natural_person_details USING btree (nationality) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_legal_entity_legal_name ON public.legal_entity_details USING btree (legalName) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_legal_entity_license_number ON public.legal_entity_details USING btree (licenseNumber) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_legal_entity_trn ON public.legal_entity_details USING btree (trn) TABLESPACE pg_default;

-- Step 5: Add new indexes for customers table
CREATE INDEX IF NOT EXISTS idx_customers_transaction_amount_limit ON public.customers USING btree (transaction_amount_limit) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_customers_transaction_limit ON public.customers USING btree (transaction_limit) TABLESPACE pg_default;

-- Step 6: Add column comments for documentation
COMMENT ON TABLE public.natural_person_details IS 'Natural person specific customer details';
COMMENT ON TABLE public.legal_entity_details IS 'Legal entity specific customer details';

COMMENT ON COLUMN public.customers.transaction_amount_limit IS 'Maximum transaction amount limit';
COMMENT ON COLUMN public.customers.transaction_limit IS 'Total transaction limit';

COMMENT ON COLUMN public.legal_entity_details.businessActivity IS 'JSON array of business activities';
COMMENT ON COLUMN public.legal_entity_details.countriesOfOperation IS 'JSON array of countries where entity operates';
COMMENT ON COLUMN public.legal_entity_details.countriesSourceOfFunds IS 'JSON array of countries source of funds';
COMMENT ON COLUMN public.legal_entity_details.licenseCategory IS 'JSON array of license categories';
COMMENT ON COLUMN public.legal_entity_details.jurisdiction IS 'JSON array of jurisdictions';

-- Database schema update completed successfully!
-- Your existing customers table is now cleaned up and contains only:
-- - Core business fields (customer_type, email, phone, channel, transaction_product, etc.)
-- - Risk and KYC fields
-- - Audit fields (created_by, created_at, updated_at, updated_by)
-- - New transaction limit fields
-- 
-- All person-specific data is now in natural_person_details table
-- All entity-specific data is now in legal_entity_details table
