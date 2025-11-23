-- =====================================================
-- OFFER LETTER DRAFTER - BASE SCHEMA
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

-- Seed initial data
INSERT INTO templates (name, content) VALUES
('Standard Offer', 'Dear {{name}},

We are pleased to offer you the position of {{role}} at our company.

Start Date: {{offerDate}}

Sincerely, HR')
ON CONFLICT (name) DO NOTHING;

INSERT INTO company_settings (company_name, company_address, company_website, company_phone, sender_name, sender_email)
VALUES ('Your Company', '123 Main St', 'www.example.com', '+1234567890', 'HR Manager', 'hr@example.com')
ON CONFLICT DO NOTHING;
