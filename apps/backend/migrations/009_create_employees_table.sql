-- Drop old employees table and recreate with correct structure
DROP TABLE IF EXISTS employees CASCADE;

-- Create employees table with correct structure
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  national_id VARCHAR(50),
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  department VARCHAR(100),
  position VARCHAR(100),
  hire_date DATE NOT NULL,
  salary DECIMAL(15, 2) NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_hire_date ON employees(hire_date);
