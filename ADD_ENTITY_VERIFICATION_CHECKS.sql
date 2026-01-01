-- Add entity_type and entity_id columns to customer_verification_checks table
-- This allows storing verification checks for shareholders, UBOs, and directors

-- Add entity_type column (NULL for main customer, 'shareholder', 'ubo', or 'director' for entities)
ALTER TABLE public.customer_verification_checks
ADD COLUMN IF NOT EXISTS entity_type VARCHAR(20) NULL;

-- Add entity_id column (NULL for main customer, UUID of shareholder/UBO/director for entities)
ALTER TABLE public.customer_verification_checks
ADD COLUMN IF NOT EXISTS entity_id UUID NULL;

-- Add comment to document the new columns
COMMENT ON COLUMN public.customer_verification_checks.entity_type IS 
  'Type of entity this check belongs to: NULL for main customer, ''shareholder'', ''ubo'', or ''director'' for related entities';

COMMENT ON COLUMN public.customer_verification_checks.entity_id IS 
  'ID of the entity: references customer_shareholders.id (for shareholders), customer_ubos.id (for UBOs), or customer_directors.id (for directors). NULL for main customer checks';

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_verification_checks_entity_type 
  ON public.customer_verification_checks USING btree (entity_type) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_verification_checks_entity_id 
  ON public.customer_verification_checks USING btree (entity_id) TABLESPACE pg_default;

-- Create composite index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_verification_checks_customer_entity 
  ON public.customer_verification_checks USING btree (customer_id, entity_type, entity_id) TABLESPACE pg_default;

-- Add check constraint to ensure entity_type is valid when provided
ALTER TABLE public.customer_verification_checks
DROP CONSTRAINT IF EXISTS customer_verification_checks_entity_type_check;

ALTER TABLE public.customer_verification_checks
ADD CONSTRAINT customer_verification_checks_entity_type_check 
CHECK (entity_type IS NULL OR entity_type IN ('shareholder', 'ubo', 'director'));

-- Note: We don't add foreign key constraints for entity_id because:
-- 1. It could reference different tables (customer_shareholders, customer_ubos, customer_directors)
-- 2. Supabase doesn't support polymorphic foreign keys
-- 3. Application logic will ensure referential integrity

