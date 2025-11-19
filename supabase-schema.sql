-- =====================================================
-- OFFER LETTER DRAFTER - DATABASE SCHEMA
-- =====================================================
-- Run this SQL script in your Supabase SQL Editor
-- to create all required tables and policies
-- =====================================================

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) > 0),
  email text NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  role text NOT NULL CHECK (length(trim(role)) > 0),
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Generated')),
  offer_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE CHECK (length(trim(name)) > 0),
  content text NOT NULL CHECK (length(trim(content)) > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create company_settings table
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text DEFAULT '',
  company_address text DEFAULT '',
  company_website text DEFAULT '',
  company_phone text DEFAULT '',
  logo_url text DEFAULT '',
  primary_color text DEFAULT '#000000',
  sender_name text DEFAULT '',
  sender_email text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_name ON templates(name);

-- Enable Row Level Security
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "public_candidates_select" ON candidates;
DROP POLICY IF EXISTS "public_candidates_insert" ON candidates;
DROP POLICY IF EXISTS "public_candidates_update" ON candidates;
DROP POLICY IF EXISTS "public_candidates_delete" ON candidates;

DROP POLICY IF EXISTS "public_templates_select" ON templates;
DROP POLICY IF EXISTS "public_templates_insert" ON templates;
DROP POLICY IF EXISTS "public_templates_update" ON templates;
DROP POLICY IF EXISTS "public_templates_delete" ON templates;

DROP POLICY IF EXISTS "public_settings_select" ON company_settings;
DROP POLICY IF EXISTS "public_settings_insert" ON company_settings;
DROP POLICY IF EXISTS "public_settings_update" ON company_settings;
DROP POLICY IF EXISTS "public_settings_delete" ON company_settings;

-- RLS Policies (public access for single-tenant app using anon key)
CREATE POLICY "public_candidates_select" ON candidates FOR SELECT TO anon USING (true);
CREATE POLICY "public_candidates_insert" ON candidates FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_candidates_update" ON candidates FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_candidates_delete" ON candidates FOR DELETE TO anon USING (true);

CREATE POLICY "public_templates_select" ON templates FOR SELECT TO anon USING (true);
CREATE POLICY "public_templates_insert" ON templates FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_templates_update" ON templates FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_templates_delete" ON templates FOR DELETE TO anon USING (true);

CREATE POLICY "public_settings_select" ON company_settings FOR SELECT TO anon USING (true);
CREATE POLICY "public_settings_insert" ON company_settings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "public_settings_update" ON company_settings FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "public_settings_delete" ON company_settings FOR DELETE TO anon USING (true);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_candidates_updated_at ON candidates;
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED INITIAL DATA
-- =====================================================

-- Insert sample candidates
INSERT INTO candidates (name, email, role, status, offer_date) VALUES
  ('John Doe', 'john@example.com', 'Software Engineer', 'Pending', '2023-10-26'),
  ('Jane Smith', 'jane@example.com', 'Product Manager', 'Generated', '2023-10-25')
ON CONFLICT (email) DO NOTHING;

-- Insert sample template
INSERT INTO templates (name, content) VALUES
  ('Standard Offer', 'Dear {{name}},

We are pleased to offer you the position of {{role}} at our company.

Start Date: {{offerDate}}

Sincerely,
HR Team')
ON CONFLICT (name) DO NOTHING;

-- Insert default company settings (only insert if none exist)
INSERT INTO company_settings (company_name, company_address, company_website, company_phone, logo_url, primary_color, sender_name, sender_email)
SELECT '', '', '', '', '', '#000000', '', ''
WHERE NOT EXISTS (SELECT 1 FROM company_settings LIMIT 1);
