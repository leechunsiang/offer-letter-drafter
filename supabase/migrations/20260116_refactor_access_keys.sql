-- =====================================================
-- REFACTOR ACCESS KEY SYSTEM (Post-Signup)
-- =====================================================

-- 1. Drop previous trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Drop profiles table (we will use team_members for roles)
DROP TABLE IF EXISTS public.profiles;

-- 3. Create function to claim team ownership
DROP FUNCTION IF EXISTS public.claim_team_ownership(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.claim_team_ownership(
  input_team_id UUID,
  input_access_key TEXT
)
RETURNS JSONB AS $$
DECLARE
  key_role TEXT;
  current_user_id UUID;
  current_role TEXT;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if user is a member of the team
  SELECT role INTO current_role
  FROM public.team_members
  WHERE team_members.team_id = input_team_id
  AND team_members.user_id = current_user_id;

  IF current_role IS NULL THEN
    RAISE EXCEPTION 'You must be a member of the team to claim ownership';
  END IF;

  -- Check key and get role
  SELECT role INTO key_role
  FROM public.access_keys
  WHERE key = input_access_key;

  IF key_role IS NULL THEN
    RAISE EXCEPTION 'Invalid access key';
  END IF;

  IF key_role != 'owner' THEN
    RAISE EXCEPTION 'This access key is not for ownership';
  END IF;

  -- Update role to owner
  UPDATE public.team_members
  SET role = 'owner'
  WHERE team_members.team_id = input_team_id
  AND team_members.user_id = current_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Ownership claimed successfully'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
