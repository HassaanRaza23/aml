-- Migration: Create Normalized Customer Tables
-- Date: 2024
-- Description: Convert wide customers table to normalized 3-table structure

-- Step 1: Create new normalized tables

-- 1. Core customers table (clean and focused)
CREATE TABLE public.customers_new (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  customer_type character varying(20) NOT NULL,
  email character varying(255) NULL,
  phone character varying(50) NULL,
  channel character varying(50) NULL,
  transaction_product character varying(100) NULL,
  transaction_amount_limit decimal(15,2) NULL,
  transaction_limit decimal(15,2) NULL,
  risk_score integer NULL DEFAULT 0,
  risk_level character varying(20) NULL DEFAULT 'Low',
  kyc_status character varying(20) NULL DEFAULT 'Pending',
  kyc_remarks text NULL,
  due_diligence_level character varying(20) NULL DEFAULT 'Standard',
  status character varying(20) NULL DEFAULT 'Active',
  created_by uuid NULL,
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  updated_by uuid NULL,
  
  CONSTRAINT customers_new_pkey PRIMARY KEY (id),
  CONSTRAINT customers_new_created_by_fkey FOREIGN KEY (created_by) REFERENCES users (id),
  CONSTRAINT customers_new_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users (id)
) TABLESPACE pg_default;

-- 2. Natural Person details table (exact form field order)
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
  CONSTRAINT natural_person_details_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers_new (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- 3. Legal Entity details table (exact form field order)
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
  CONSTRAINT legal_entity_details_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers_new (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Step 2: Create indexes for performance

-- Core customers table indexes (Essential)
CREATE INDEX IF NOT EXISTS idx_customers_new_customer_type ON public.customers_new USING btree (customer_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_customers_new_email ON public.customers_new USING btree (email) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_customers_new_kyc_status ON public.customers_new USING btree (kyc_status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_customers_new_status ON public.customers_new USING btree (status) TABLESPACE pg_default;

-- Natural person details indexes (Essential)
CREATE INDEX IF NOT EXISTS idx_natural_person_first_name ON public.natural_person_details USING btree (firstName) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_natural_person_last_name ON public.natural_person_details USING btree (lastName) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_natural_person_nationality ON public.natural_person_details USING btree (nationality) TABLESPACE pg_default;

-- Legal entity details indexes (Essential)
CREATE INDEX IF NOT EXISTS idx_legal_entity_legal_name ON public.legal_entity_details USING btree (legalName) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_legal_entity_license_number ON public.legal_entity_details USING btree (licenseNumber) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_legal_entity_trn ON public.legal_entity_details USING btree (trn) TABLESPACE pg_default;

-- Step 3: Create audit trigger for new customers table
CREATE TRIGGER audit_customers_new_trigger
AFTER INSERT OR DELETE OR UPDATE ON customers_new FOR EACH ROW
EXECUTE FUNCTION audit_log_trigger();

-- Step 4: Add column comments for documentation
COMMENT ON TABLE public.customers_new IS 'Core customer table with business relationship data';
COMMENT ON TABLE public.natural_person_details IS 'Natural person specific customer details';
COMMENT ON TABLE public.legal_entity_details IS 'Legal entity specific customer details';

COMMENT ON COLUMN public.customers_new.customer_type IS 'Type of customer: Natural Person or Legal Entity';
COMMENT ON COLUMN public.customers_new.email IS 'Customer contact email';
COMMENT ON COLUMN public.customers_new.phone IS 'Customer contact phone';
COMMENT ON COLUMN public.customers_new.channel IS 'Business channel for customer';
COMMENT ON COLUMN public.customers_new.transaction_product IS 'Transaction product offered to customer';
COMMENT ON COLUMN public.customers_new.transaction_amount_limit IS 'Maximum transaction amount limit';
COMMENT ON COLUMN public.customers_new.transaction_limit IS 'Total transaction limit';

COMMENT ON COLUMN public.legal_entity_details.businessActivity IS 'JSON array of business activities';
COMMENT ON COLUMN public.legal_entity_details.countriesOfOperation IS 'JSON array of countries where entity operates';
COMMENT ON COLUMN public.legal_entity_details.countriesSourceOfFunds IS 'JSON array of countries source of funds';
COMMENT ON COLUMN public.legal_entity_details.licenseCategory IS 'JSON array of license categories';
COMMENT ON COLUMN public.legal_entity_details.jurisdiction IS 'JSON array of jurisdictions';

-- Database schema creation completed successfully!
-- Ready to use with your onboarding forms!
