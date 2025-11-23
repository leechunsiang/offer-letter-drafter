-- =====================================================
-- FIX COMPANY SETTINGS DUPLICATES
-- =====================================================

-- 1. Delete duplicate empty rows, keeping the most recent one (or the one with data)
-- This is a bit complex because we want to keep the "best" row.
-- Strategy:
-- a) Identify rows with actual data (non-empty name, etc.)
-- b) If multiple rows have data, keep the most recently updated one.
-- c) If no rows have data, keep the most recently updated empty one.

-- We can use a CTE to rank rows for each user.
WITH ranked_settings AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id 
      ORDER BY 
        -- Prioritize rows with a company name
        (CASE WHEN company_name IS NOT NULL AND company_name != '' THEN 1 ELSE 0 END) DESC,
        -- Then prioritize rows with a logo
        (CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 ELSE 0 END) DESC,
        -- Finally, keep the most recently updated one
        updated_at DESC
    ) as rn
  FROM company_settings
)
DELETE FROM company_settings
WHERE id IN (
  SELECT id FROM ranked_settings WHERE rn > 1
);

-- 2. Add unique constraint to prevent future duplicates
ALTER TABLE company_settings
ADD CONSTRAINT company_settings_user_id_key UNIQUE (user_id);

-- 3. Verify the constraint
-- (This part is just for your information, no action needed)
-- If the above ALTER TABLE succeeded, the constraint is active.
