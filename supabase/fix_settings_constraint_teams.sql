-- Fix Company Settings Unique Constraint
-- Run this SQL in your Supabase SQL Editor

-- 1. Drop the incorrect unique constraint on user_id
ALTER TABLE company_settings
DROP CONSTRAINT IF EXISTS company_settings_user_id_key;

-- 2. Add the correct unique constraint on team_id
-- This ensures that each team can only have one settings record
ALTER TABLE company_settings
ADD CONSTRAINT company_settings_team_id_key UNIQUE (team_id);

-- 3. (Optional) Clean up any duplicate settings for the same team if they exist
-- This uses a CTE to keep only the most recently updated setting for each team
WITH ranked_settings AS (
  SELECT 
    id,
    team_id,
    ROW_NUMBER() OVER (
      PARTITION BY team_id 
      ORDER BY updated_at DESC
    ) as rn
  FROM company_settings
  WHERE team_id IS NOT NULL
)
DELETE FROM company_settings
WHERE id IN (
  SELECT id FROM ranked_settings WHERE rn > 1
);
