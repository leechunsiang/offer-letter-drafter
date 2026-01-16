-- Add UPDATE policy for team_members to allow owners and admins to manage roles
-- This fixes the issue where role changes in the UI "do nothing" due to RLS blocks.

-- 1. Drop existing policy if it exists
DROP POLICY IF EXISTS "Team owners and admins can update member roles" ON team_members;

-- 2. Create the update policy
CREATE POLICY "Team owners and admins can update member roles" ON team_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );
