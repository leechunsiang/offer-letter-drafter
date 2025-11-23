-- Add user_id column to existing tables
ALTER TABLE candidates 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE templates 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE company_settings 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_candidates_user_id ON candidates(user_id);
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_company_settings_user_id ON company_settings(user_id);

-- Enable Row Level Security
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for candidates
CREATE POLICY "Users can view own candidates" ON candidates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own candidates" ON candidates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own candidates" ON candidates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own candidates" ON candidates
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for templates
CREATE POLICY "Users can view own templates" ON templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for company_settings
CREATE POLICY "Users can view own settings" ON company_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON company_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON company_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON company_settings
  FOR DELETE USING (auth.uid() = user_id);
