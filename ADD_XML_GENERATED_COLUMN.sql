-- Add XML generation tracking column to transactions table
-- This column tracks when XML was generated for GoAML reporting

ALTER TABLE transactions 
ADD COLUMN xml_generated_at TIMESTAMP NULL;

-- Add index for performance when filtering by XML generation status
CREATE INDEX idx_transactions_xml_generated_at ON transactions(xml_generated_at);

-- Add comment for documentation
COMMENT ON COLUMN transactions.xml_generated_at IS 'Timestamp when XML report was generated for GoAML portal. NULL means XML has not been generated yet.';


