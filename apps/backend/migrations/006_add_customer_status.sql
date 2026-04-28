-- Add status column to customers table
ALTER TABLE customers
ADD COLUMN status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked'));

-- Create index for status column
CREATE INDEX idx_customers_status ON customers(status);
