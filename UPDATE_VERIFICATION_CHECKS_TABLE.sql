-- Update customer_verification_checks table to support new questions and N/A answers
-- This ensures the table can handle all the new due diligence questions

-- Check if table exists, if not create it
CREATE TABLE IF NOT EXISTS public.customer_verification_checks (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  customer_id uuid NOT NULL,
  check_type character varying(100) NOT NULL,
  check_question text NOT NULL,
  answer character varying(10) NOT NULL, -- 'yes', 'no', or 'n/a'
  notes text NULL,
  checked_by uuid NULL,
  checked_at timestamp without time zone NULL DEFAULT now(),
  created_at timestamp without time zone NULL DEFAULT now(),
  updated_at timestamp without time zone NULL DEFAULT now(),
  
  CONSTRAINT customer_verification_checks_pkey PRIMARY KEY (id),
  CONSTRAINT customer_verification_checks_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT customer_verification_checks_checked_by_fkey 
    FOREIGN KEY (checked_by) REFERENCES users(id)
) TABLESPACE pg_default;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_verification_checks_customer_id 
  ON public.customer_verification_checks USING btree (customer_id) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_verification_checks_type 
  ON public.customer_verification_checks USING btree (check_type) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_verification_checks_checked_by 
  ON public.customer_verification_checks USING btree (checked_by) TABLESPACE pg_default;

-- If the table already exists, ensure the answer column can handle 'n/a'
-- The VARCHAR(10) should already be sufficient, but we'll add a check constraint
-- to explicitly allow 'yes', 'no', and 'n/a'
DO $$
BEGIN
  -- Add check constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'customer_verification_checks_answer_check'
  ) THEN
    ALTER TABLE public.customer_verification_checks
    ADD CONSTRAINT customer_verification_checks_answer_check 
    CHECK (answer IN ('yes', 'no', 'n/a'));
  END IF;
END $$;

-- Ensure check_type column is large enough for all new question keys
-- (VARCHAR(100) should be sufficient, but we'll verify)
-- Example keys: 'googleSearchAdverseMedia', 'directorsShareholdersScreened', 
-- 'beneficialOwnerIdentityVerified', 'bodyCorporateFullName', etc.

-- Add comment to document the answer values
COMMENT ON COLUMN public.customer_verification_checks.answer IS 
  'Answer to the verification check question. Valid values: yes, no, n/a';

COMMENT ON COLUMN public.customer_verification_checks.check_type IS 
  'Unique identifier for the verification check question (e.g., googleSearchAdverseMedia, directorsShareholdersScreened)';

COMMENT ON COLUMN public.customer_verification_checks.check_question IS 
  'Full text of the verification check question';

