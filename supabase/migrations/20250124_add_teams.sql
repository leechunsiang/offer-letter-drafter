-- =====================================================
-- TEAM COLLABORATION - DATABASE MIGRATION
-- =====================================================
-- Run this SQL script in your Supabase SQL Editor
-- to add team collaboration features
-- =====================================================

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'user')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create team_invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  inviter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invitee_email text NOT NULL CHECK (invitee_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  invitee_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'user')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '7 days')
);

-- Add team_id to existing tables
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE templates ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE company_settings ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_invite_code ON teams(invite_code);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitee_email ON team_invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invitee_id ON team_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_candidates_team_id ON candidates(team_id);
CREATE INDEX IF NOT EXISTS idx_templates_team_id ON templates(team_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_team_id ON company_settings(team_id);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view teams they are members of" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team owners can update their teams" ON teams;
DROP POLICY IF EXISTS "Team owners can delete their teams" ON teams;

DROP POLICY IF EXISTS "Users can view team members of their teams" ON team_members;
DROP POLICY IF EXISTS "Team owners can add members" ON team_members;
DROP POLICY IF EXISTS "Team owners and admins can remove members" ON team_members;

DROP POLICY IF EXISTS "Users can view own candidates" ON candidates;
DROP POLICY IF EXISTS "Users can insert own candidates" ON candidates;
DROP POLICY IF EXISTS "Users can update own candidates" ON candidates;
DROP POLICY IF EXISTS "Users can delete own candidates" ON candidates;

DROP POLICY IF EXISTS "Users can view own templates" ON templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON templates;
DROP POLICY IF EXISTS "Users can update own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON templates;

DROP POLICY IF EXISTS "Users can view own settings" ON company_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON company_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON company_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON company_settings;

-- RLS Policies for teams
CREATE POLICY "Users can view teams they are members of" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams" ON teams
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update their teams" ON teams
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete their teams" ON teams
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for team_members
CREATE POLICY "Users can view team members of their teams" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can add members" ON team_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team owners and admins can remove members" ON team_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for team_invitations
CREATE POLICY "Users can view invitations for their teams or addressed to them" ON team_invitations
  FOR SELECT USING (
    invitee_id = auth.uid() OR
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_invitations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team admins and owners can create invitations" ON team_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_invitations.team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Invitees can update their invitations" ON team_invitations
  FOR UPDATE USING (
    invitee_id = auth.uid() OR
    invitee_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Team owners can delete invitations" ON team_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_invitations.team_id
      AND teams.owner_id = auth.uid()
    )
  );

-- Update RLS Policies for candidates to use teams
CREATE POLICY "Team members can view team candidates" ON candidates
  FOR SELECT USING (
    team_id IS NULL AND auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = candidates.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can insert candidates" ON candidates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = candidates.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update team candidates" ON candidates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = candidates.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can delete team candidates" ON candidates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = candidates.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Update RLS Policies for templates to use teams
CREATE POLICY "Team members can view team templates" ON templates
  FOR SELECT USING (
    team_id IS NULL AND auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = templates.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can insert templates" ON templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = templates.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update team templates" ON templates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = templates.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can delete team templates" ON templates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = templates.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Update RLS Policies for company_settings to use teams
CREATE POLICY "Team members can view team settings" ON company_settings
  FOR SELECT USING (
    team_id IS NULL AND auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = company_settings.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can insert settings" ON company_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = company_settings.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update team settings" ON company_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = company_settings.team_id
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can delete team settings" ON company_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = company_settings.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Update trigger for teams
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to auto-delete expired invitations
CREATE OR REPLACE FUNCTION delete_expired_invitations()
RETURNS void AS $$
BEGIN
  DELETE FROM team_invitations
  WHERE status = 'pending'
  AND expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create function to generate unique invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to auto-add owner as team member after team creation
CREATE OR REPLACE FUNCTION add_owner_to_team()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add owner as team member
DROP TRIGGER IF EXISTS add_owner_to_team_trigger ON teams;
CREATE TRIGGER add_owner_to_team_trigger
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_to_team();

-- Create function to set invitee_id when user accepts invitation
CREATE OR REPLACE FUNCTION match_invitation_to_user()
RETURNS TRIGGER AS $$
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

-- Create trigger to match invitations to users
DROP TRIGGER IF EXISTS match_invitation_to_user_trigger ON team_invitations;
CREATE TRIGGER match_invitation_to_user_trigger
  BEFORE INSERT OR UPDATE ON team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION match_invitation_to_user();
