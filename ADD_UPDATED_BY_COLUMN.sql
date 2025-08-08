-- Add updated_by column to customers table
ALTER TABLE customers ADD COLUMN updated_by UUID REFERENCES users(id);

-- Create index for updated_by column
CREATE INDEX idx_customers_updated_by ON customers(updated_by);
