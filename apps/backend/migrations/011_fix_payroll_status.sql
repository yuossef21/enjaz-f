-- Fix payroll status values
-- Change 'pending' to 'draft' and update default value

-- Update existing records from 'pending' to 'draft'
UPDATE payroll SET status = 'draft' WHERE status = 'pending';

-- Alter the default value for future records
ALTER TABLE payroll ALTER COLUMN status SET DEFAULT 'draft';
