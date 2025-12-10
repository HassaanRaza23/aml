-- Migration: Change risk_score column from INTEGER to NUMERIC to support decimal values
-- Date: 2025-12-05
-- Description: Allows storing decimal risk scores (e.g., 2.5, 2.33) instead of rounding to integers

-- Change risk_score column type from INTEGER to NUMERIC(5,2)
-- NUMERIC(5,2) allows values from -999.99 to 999.99 (5 total digits, 2 after decimal)
-- This is sufficient for risk scores which range from 0 to 5
ALTER TABLE public.customers 
ALTER COLUMN risk_score TYPE NUMERIC(5,2) USING risk_score::NUMERIC(5,2);

-- Update any NULL values to 0
UPDATE public.customers 
SET risk_score = 0 
WHERE risk_score IS NULL;

-- Add a check constraint to ensure risk_score is between 0 and 5
ALTER TABLE public.customers 
ADD CONSTRAINT risk_score_range_check 
CHECK (risk_score >= 0 AND risk_score <= 5);

-- Add comment to document the change
COMMENT ON COLUMN public.customers.risk_score IS 'Risk score calculated from risk rules (0-5, supports decimal values)';

