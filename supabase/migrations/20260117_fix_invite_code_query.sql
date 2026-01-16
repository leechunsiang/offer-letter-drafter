-- =====================================================
-- FIX JOIN TEAM BY INVITE CODE
-- =====================================================

-- Create a secure function to join a team by invite code
-- This bypasses RLS on the teams table for the lookup
DROP FUNCTION IF EXISTS public.join_team_by_invite_code(TEXT);

CREATE OR REPLACE FUNCTION public.join_team_by_invite_code(
  input_invite_code TEXT
)
RETURNS JSONB AS $$
DECLARE
  target_team RECORD;
  current_user_id UUID;
  existing_member RECORD;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Find the team by invite code
  SELECT * INTO target_team
  FROM public.teams
  WHERE teams.invite_code = input_invite_code;

  IF target_team IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- 2. Check if user is already a member
  SELECT * INTO existing_member
  FROM public.team_members
  WHERE team_id = target_team.id
  AND team_members.user_id = current_user_id;

  IF existing_member IS NOT NULL THEN
    RAISE EXCEPTION 'You are already a member of this team';
  END IF;

  -- 3. Add user to team
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (target_team.id, current_user_id, 'user');

  -- 4. Return success and team info
  RETURN jsonb_build_object(
    'id', target_team.id,
    'name', target_team.name,
    'role', 'user'
  );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
