-- Fix RLS policies to allow team creation trigger to work
-- Run this SQL in your Supabase SQL Editor

-- Make the trigger function run with SECURITY DEFINER to bypass RLS
DROP FUNCTION IF EXISTS add_owner_to_team() CASCADE;
CREATE OR REPLACE FUNCTION add_owner_to_team()
RETURNS TRIGGER 
SECURITY DEFINER  -- This makes the function run with the privileges of the function owner
SET search_path = public
AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS add_owner_to_team_trigger ON teams;
CREATE TRIGGER add_owner_to_team_trigger
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_to_team();
