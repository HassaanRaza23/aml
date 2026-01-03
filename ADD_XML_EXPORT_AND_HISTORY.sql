-- Add XML export tracking column to transactions table
ALTER TABLE transactions 
ADD COLUMN xml_exported_at TIMESTAMP NULL;

-- Create XML history table to store all XML versions
CREATE TABLE transaction_xml_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    xml_content TEXT NOT NULL,
    generated_at TIMESTAMP DEFAULT NOW(),
    generated_by UUID REFERENCES users(id),
    version_number INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_transactions_xml_exported_at ON transactions(xml_exported_at);
CREATE INDEX idx_xml_history_transaction_id ON transaction_xml_history(transaction_id);
CREATE INDEX idx_xml_history_generated_at ON transaction_xml_history(generated_at);

-- Add comments for documentation
COMMENT ON COLUMN transactions.xml_exported_at IS 'Timestamp when XML file was exported/downloaded. NULL means XML has not been exported yet.';
COMMENT ON TABLE transaction_xml_history IS 'Stores all versions of generated XML files for transactions, allowing regeneration and history tracking';
COMMENT ON COLUMN transaction_xml_history.version_number IS 'Version number of the XML (increments each time XML is regenerated)';
COMMENT ON COLUMN transaction_xml_history.xml_content IS 'The full XML content for this version';
COMMENT ON COLUMN transaction_xml_history.generated_by IS 'User who generated this XML version';

