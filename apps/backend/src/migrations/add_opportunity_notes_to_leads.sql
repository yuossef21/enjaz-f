-- Add opportunity_notes column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS opportunity_notes TEXT;

-- Add comment to the column
COMMENT ON COLUMN leads.opportunity_notes IS 'Notes added by quality manager when marking lead as opportunity';
