-- Fix RLS policy to allow users to join teams via invitation

-- 1. Drop existing policy if it exists (to be safe, though we are adding a new specific one)
DROP POLICY IF EXISTS "Users can join team with valid invitation" ON team_members;

-- 2. Create the policy
CREATE POLICY "Users can join team with valid invitation" ON team_members
  FOR INSERT WITH CHECK (
    -- User is adding themselves
    auth.uid() = user_id AND
    -- And they have a valid pending invitation
    EXISTS (
      SELECT 1 FROM team_invitations
      WHERE team_invitations.team_id = team_members.team_id
      AND team_invitations.status = 'pending'
      AND (
        -- Check by email (since invitee_id might be null in invitation)
        team_invitations.invitee_email = (auth.jwt() ->> 'email')
        OR
        -- Or check by ID if it was set
        team_invitations.invitee_id = auth.uid()
      )
    )
  );
