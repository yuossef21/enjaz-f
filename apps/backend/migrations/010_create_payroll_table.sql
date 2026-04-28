-- Create payroll table
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL,
  base_salary DECIMAL(15, 2) NOT NULL,
  bonuses DECIMAL(15, 2) DEFAULT 0,
  deductions DECIMAL(15, 2) DEFAULT 0,
  net_salary DECIMAL(15, 2) NOT NULL,
  payment_date DATE,
  payment_method VARCHAR(50), -- 'cash', 'bank_transfer'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid'
  notes TEXT,
  paid_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- Create indexes
CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_payroll_status ON payroll(status);
CREATE INDEX idx_payroll_date ON payroll(year, month);
CREATE INDEX idx_payroll_payment_date ON payroll(payment_date);
