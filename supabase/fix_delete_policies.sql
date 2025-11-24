-- Fix RLS policies to allow deletion of candidates, templates, and teams
-- Run this SQL in your Supabase SQL Editor

-- =====================================================
-- CANDIDATES
-- =====================================================
DROP POLICY IF EXISTS "Users can delete own candidates" ON candidates;
DROP POLICY IF EXISTS "Team members can delete team candidates" ON candidates;

CREATE POLICY "Users can delete candidates" ON candidates
  FOR DELETE USING (
    -- Allow deleting personal items
    (team_id IS NULL AND auth.uid() = user_id) OR 
    -- Allow team owner to delete (robust check for cascade)
    EXISTS ( 
      SELECT 1 FROM teams
      WHERE teams.id = candidates.team_id
      AND teams.owner_id = auth.uid()
    ) OR
    -- Allow team admins/members to delete
    EXISTS ( 
      SELECT 1 FROM team_members
      WHERE team_members.team_id = candidates.team_id
      AND team_members.user_id = auth.uid()
      -- Optionally restrict to admins/owners if desired, but keeping it broad for now as per original intent
      -- AND team_members.role IN ('owner', 'admin') 
    )
  );

-- =====================================================
-- TEMPLATES
-- =====================================================
DROP POLICY IF EXISTS "Users can delete own templates" ON templates;
DROP POLICY IF EXISTS "Team members can delete team templates" ON templates;

CREATE POLICY "Users can delete templates" ON templates
  FOR DELETE USING (
    -- Allow deleting personal items
    (team_id IS NULL AND auth.uid() = user_id) OR 
    -- Allow team owner to delete
    EXISTS ( 
      SELECT 1 FROM teams
      WHERE teams.id = templates.team_id
      AND teams.owner_id = auth.uid()
    ) OR
    -- Allow team members to delete
    EXISTS ( 
      SELECT 1 FROM team_members
      WHERE team_members.team_id = templates.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- =====================================================
-- COMPANY SETTINGS
-- =====================================================
DROP POLICY IF EXISTS "Users can delete own settings" ON company_settings;
DROP POLICY IF EXISTS "Team members can delete team settings" ON company_settings;

CREATE POLICY "Users can delete settings" ON company_settings
  FOR DELETE USING (
    -- Allow deleting personal items
    (team_id IS NULL AND auth.uid() = user_id) OR 
    -- Allow team owner to delete
    EXISTS ( 
      SELECT 1 FROM teams
      WHERE teams.id = company_settings.team_id
      AND teams.owner_id = auth.uid()
    ) OR
    -- Allow team members to delete
    EXISTS ( 
      SELECT 1 FROM team_members
      WHERE team_members.team_id = company_settings.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- =====================================================
-- TEAMS
-- =====================================================
-- Ensure team owners can delete their teams
DROP POLICY IF EXISTS "Team owners can delete their teams" ON teams;

CREATE POLICY "Team owners can delete their teams" ON teams
  FOR DELETE USING (
    auth.uid() = owner_id
  );

-- =====================================================
-- TEAM MEMBERS
-- =====================================================
-- Ensure owners can remove members (and themselves if needed, though usually they delete the team)
DROP POLICY IF EXISTS "Team owners and admins can remove members" ON team_members;

CREATE POLICY "Team owners and admins can remove members" ON team_members
  FOR DELETE USING (
    -- Allow owner to remove anyone
    EXISTS (
      SELECT 1 FROM teams
      WHERE teams.id = team_members.team_id
      AND teams.owner_id = auth.uid()
    ) OR
    -- Allow admins to remove members (but maybe not other admins/owners? keeping simple for now)
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'admin')
    )
  );
