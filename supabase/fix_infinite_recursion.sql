-- Fix infinite recursion in RLS policies by using a SECURITY DEFINER function
-- Run this in Supabase SQL Editor

-- 1. Create a secure function to check team membership
-- This runs with elevated privileges (SECURITY DEFINER) to bypass RLS recursion
CREATE OR REPLACE FUNCTION public.is_team_member(lookup_team_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = lookup_team_id
    AND user_id = auth.uid()
  );
END;
$$;

-- 2. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;

-- 3. Recreate policies using the safe function

-- Policy for teams: View teams where I am owner OR a member
CREATE POLICY "Users can view teams they are members of" ON teams
  FOR SELECT USING (
    owner_id = auth.uid() OR is_team_member(id)
  );

-- Policy for team_members: View members of teams where I am a member
CREATE POLICY "Users can view team members of their teams" ON team_members
  FOR SELECT USING (
    is_team_member(team_id)
  );

-- 4. Ensure other policies are safe (re-applying the team creation fix just in case)
DROP FUNCTION IF EXISTS add_owner_to_team() CASCADE;
CREATE OR REPLACE FUNCTION add_owner_to_team()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS add_owner_to_team_trigger ON teams;
CREATE TRIGGER add_owner_to_team_trigger
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_to_team();
