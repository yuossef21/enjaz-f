-- Fix foreign key constraint for invoices.customer_id
-- This allows deleting customers even if they have invoices

-- Drop the existing foreign key constraint
ALTER TABLE invoices
DROP CONSTRAINT IF EXISTS invoices_customer_id_fkey;

-- Add the constraint back with ON DELETE SET NULL
ALTER TABLE invoices
ADD CONSTRAINT invoices_customer_id_fkey
FOREIGN KEY (customer_id)
REFERENCES customers(id)
ON DELETE SET NULL;
