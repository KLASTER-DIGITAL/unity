-- Create mobile_settings table for React Native app configuration
-- This table stores all configurable settings for the mobile app
-- Managed through admin panel, applied via OTA updates

CREATE TABLE IF NOT EXISTS mobile_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- App metadata
  app_name TEXT NOT NULL DEFAULT 'Unity Diary',
  app_version TEXT NOT NULL DEFAULT '2.0.1',
  
  -- Splash Screen configuration
  splash_screen_config JSONB NOT NULL DEFAULT '{
    "backgroundColor": "#FFFFFF",
    "logoUrl": "https://ecuwuzqlwdkkdncampnc.supabase.co/storage/v1/object/public/assets/logo.png",
    "duration": 2000,
    "fadeOutDuration": 500
  }'::jsonb,
  
  -- Onboarding configuration
  onboarding_config JSONB NOT NULL DEFAULT '{
    "enabled": true,
    "screens": [
      {
        "id": "welcome",
        "title": "Добро пожаловать в Unity",
        "description": "Ваш личный дневник с AI помощником",
        "image": "onboarding-1.png"
      },
      {
        "id": "features",
        "title": "Мощные функции",
        "description": "AI анализ, статистика, напоминания",
        "image": "onboarding-2.png"
      },
      {
        "id": "premium",
        "title": "Premium возможности",
        "description": "14 дней бесплатного trial",
        "image": "onboarding-3.png"
      }
    ]
  }'::jsonb,
  
  -- Auth configuration
  auth_config JSONB NOT NULL DEFAULT '{
    "enableEmailAuth": true,
    "enableGoogleAuth": false,
    "enableAppleAuth": false,
    "enableTelegramAuth": false,
    "requireEmailVerification": false,
    "passwordMinLength": 6
  }'::jsonb,
  
  -- Theme configuration
  theme_config JSONB NOT NULL DEFAULT '{
    "defaultTheme": "light",
    "allowDarkMode": true,
    "allowPremiumThemes": true,
    "primaryColor": "#3B82F6",
    "accentColor": "#10B981"
  }'::jsonb,
  
  -- i18n configuration
  i18n_config JSONB NOT NULL DEFAULT '{
    "defaultLanguage": "ru",
    "supportedLanguages": ["ru", "en", "es", "de", "fr", "zh", "ja"],
    "autoDetectLanguage": true,
    "fallbackLanguage": "en"
  }'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mobile_settings_updated_at ON mobile_settings(updated_at DESC);

-- Insert default configuration
INSERT INTO mobile_settings (id, app_name, app_version)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Unity Diary',
  '2.0.1'
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE mobile_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow public read access (mobile app needs to fetch config)
CREATE POLICY "Allow public read access to mobile_settings"
  ON mobile_settings
  FOR SELECT
  USING (true);

-- Only super_admin can update
CREATE POLICY "Only super_admin can update mobile_settings"
  ON mobile_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'super_admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_mobile_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_mobile_settings_updated_at
  BEFORE UPDATE ON mobile_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_mobile_settings_updated_at();

-- Comments
COMMENT ON TABLE mobile_settings IS 'Configuration settings for React Native mobile app, managed through admin panel';
COMMENT ON COLUMN mobile_settings.splash_screen_config IS 'Splash screen settings: backgroundColor, logoUrl, duration, fadeOutDuration';
COMMENT ON COLUMN mobile_settings.onboarding_config IS 'Onboarding screens configuration: enabled, screens array';
COMMENT ON COLUMN mobile_settings.auth_config IS 'Authentication settings: email, Google, Apple, Telegram auth options';
COMMENT ON COLUMN mobile_settings.theme_config IS 'Theme settings: defaultTheme, allowDarkMode, colors';
COMMENT ON COLUMN mobile_settings.i18n_config IS 'Internationalization settings: defaultLanguage, supportedLanguages, autoDetect';

