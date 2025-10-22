-- Create api_services table for managing API integrations
CREATE TABLE IF NOT EXISTS api_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  api_key TEXT,
  api_url TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE api_services ENABLE ROW LEVEL SECURITY;

-- Only super_admin can read api_services
CREATE POLICY "Super admin can read api_services"
  ON api_services
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Only super_admin can insert api_services
CREATE POLICY "Super admin can insert api_services"
  ON api_services
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Only super_admin can update api_services
CREATE POLICY "Super admin can update api_services"
  ON api_services
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Only super_admin can delete api_services
CREATE POLICY "Super admin can delete api_services"
  ON api_services
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_api_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER api_services_updated_at
  BEFORE UPDATE ON api_services
  FOR EACH ROW
  EXECUTE FUNCTION update_api_services_updated_at();

-- Insert OpenAI as the first service
INSERT INTO api_services (name, display_name, description, api_key, api_url, is_active, config)
SELECT 
  'openai',
  'OpenAI API',
  'OpenAI GPT models for AI analysis and translations',
  value,
  'https://api.openai.com/v1',
  true,
  jsonb_build_object(
    'models', jsonb_build_array('gpt-4o-mini', 'gpt-4o'),
    'default_model', 'gpt-4o-mini'
  )
FROM admin_settings
WHERE key = 'openai_api_key'
ON CONFLICT (name) DO NOTHING;

-- Add comment
COMMENT ON TABLE api_services IS 'Stores API service configurations for external integrations';

