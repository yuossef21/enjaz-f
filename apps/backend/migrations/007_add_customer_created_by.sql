-- Add created_by column to customers table
ALTER TABLE customers
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for created_by column
CREATE INDEX idx_customers_created_by ON customers(created_by);
