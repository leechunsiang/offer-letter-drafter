-- Fix multiple default templates issue
-- This script will ensure only ONE template per user is marked as default

-- First, unset all defaults
UPDATE templates 
SET is_default = false 
WHERE is_default = true;

-- Then, for each user, set their first template as default (or you can manually choose which one)
-- This sets the most recently created template as default for each user
WITH ranked_templates AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM templates
)
UPDATE templates
SET is_default = true
FROM ranked_templates
WHERE templates.id = ranked_templates.id 
  AND ranked_templates.rn = 1;

-- Verify: This should return only one default template per user
SELECT user_id, COUNT(*) as default_count
FROM templates 
WHERE is_default = true
GROUP BY user_id;
