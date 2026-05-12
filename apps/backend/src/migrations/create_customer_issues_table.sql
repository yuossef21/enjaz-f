-- Create customer_issues table
CREATE TABLE IF NOT EXISTS customer_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  issue_description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'unresolved')),
  notes TEXT,
  resolution_notes TEXT,
  created_by UUID REFERENCES users(id),
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_customer_issues_status ON customer_issues(status);
CREATE INDEX idx_customer_issues_created_by ON customer_issues(created_by);
CREATE INDEX idx_customer_issues_created_at ON customer_issues(created_at);
CREATE INDEX idx_customer_issues_phone ON customer_issues(phone);

-- Add comments
COMMENT ON TABLE customer_issues IS 'Customer issues and complaints tracking';
COMMENT ON COLUMN customer_issues.customer_name IS 'Name of the customer';
COMMENT ON COLUMN customer_issues.phone IS 'Customer phone number';
COMMENT ON COLUMN customer_issues.issue_description IS 'Description of the issue';
COMMENT ON COLUMN customer_issues.status IS 'Issue status: pending, resolved, unresolved';
COMMENT ON COLUMN customer_issues.notes IS 'Initial notes from the employee who created the issue';
COMMENT ON COLUMN customer_issues.resolution_notes IS 'Notes from the reviewer who resolved/reviewed the issue';
COMMENT ON COLUMN customer_issues.created_by IS 'User who created the issue';
COMMENT ON COLUMN customer_issues.resolved_by IS 'User who resolved the issue';
COMMENT ON COLUMN customer_issues.resolved_at IS 'Timestamp when the issue was resolved';
