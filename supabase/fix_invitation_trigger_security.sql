-- Fix Team Invitation Trigger Permissions
-- Run this SQL in your Supabase SQL Editor

-- The issue is that the trigger function `match_invitation_to_user` tries to query `auth.users`
-- but regular users don't have permission to read that table.
-- We need to make the function `SECURITY DEFINER` so it runs with the privileges of the function creator (postgres).

-- 1. Drop the existing trigger first to be safe (though replacing function usually works, better to be clean)
DROP TRIGGER IF EXISTS match_invitation_to_user_trigger ON team_invitations;

-- 2. Recreate the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION match_invitation_to_user()
RETURNS TRIGGER 
SECURITY DEFINER -- This is the key fix
SET search_path = public -- Best practice for security definer functions
AS $$
BEGIN
  -- If invitee_id is not set, try to match by email
  IF NEW.invitee_id IS NULL THEN
    NEW.invitee_id := (
      SELECT id FROM auth.users
      WHERE email = NEW.invitee_email
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recreate the trigger
CREATE TRIGGER match_invitation_to_user_trigger
  BEFORE INSERT OR UPDATE ON team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION match_invitation_to_user();
