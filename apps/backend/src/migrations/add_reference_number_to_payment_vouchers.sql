-- Add missing reference_number column to payment_vouchers table
ALTER TABLE payment_vouchers ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100);

-- Add employee_id column to payment_vouchers table
ALTER TABLE payment_vouchers ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id);

-- Add comments to the columns
COMMENT ON COLUMN payment_vouchers.reference_number IS 'Reference number for the payment (check number, transfer reference, etc.)';
COMMENT ON COLUMN payment_vouchers.employee_id IS 'Employee receiving the payment';
