-- Add custom_content and feedback columns to candidates table
ALTER TABLE candidates 
ADD COLUMN IF NOT EXISTS custom_content TEXT,
ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Drop the existing check constraint for status
ALTER TABLE candidates 
DROP CONSTRAINT IF EXISTS candidates_status_check;

-- Add new check constraint with updated statuses
ALTER TABLE candidates 
ADD CONSTRAINT candidates_status_check 
CHECK (status IN ('Pending', 'Generated', 'Submitted', 'Approved', 'Rejected'));
