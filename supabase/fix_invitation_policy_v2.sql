-- Fix Team Invitation RLS Policy V2
-- Run this SQL in your Supabase SQL Editor

-- The issue is that the RLS policy "Users can view invitations..." tries to query `auth.users`
-- to check if the `invitee_email` matches the current user's email.
-- Regular users cannot read `auth.users`, so this throws a "permission denied" error.
-- The fix is to use `auth.jwt() ->> 'email'` to get the current user's email from the session token.

-- 1. Drop the problematic policy
DROP POLICY IF EXISTS "Users can view invitations for their teams or addressed to them" ON team_invitations;

-- 2. Create the fixed policy
CREATE POLICY "Users can view invitations for their teams or addressed to them" ON team_invitations
  FOR SELECT USING (
    -- Check if the invitation is for the current user's ID
    invitee_id = auth.uid() OR
    -- Check if the invitation is for the current user's email (using JWT claim instead of table lookup)
    invitee_email = (auth.jwt() ->> 'email') OR
    -- Check if the user is an admin/owner of the team
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_invitations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

-- Also fix the update policy just in case
DROP POLICY IF EXISTS "Invitees can update their invitations" ON team_invitations;

CREATE POLICY "Invitees can update their invitations" ON team_invitations
  FOR UPDATE USING (
    invitee_id = auth.uid() OR
    invitee_email = (auth.jwt() ->> 'email')
  );
