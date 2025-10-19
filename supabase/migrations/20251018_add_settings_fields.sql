-- Migration: Add Settings Fields to Profiles Table
-- Date: 2025-10-18
-- Description: Add new fields for SettingsScreen functionality (themes, premium, biometric, backup, privacy)

-- Add new columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'default' CHECK (theme IN ('default', 'dark', 'light', 'sunset', 'ocean', 'forest')),
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS backup_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS first_day_of_week TEXT DEFAULT 'monday' CHECK (first_day_of_week IN ('monday', 'sunday')),
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}'::jsonb;

-- Create index for theme queries
CREATE INDEX IF NOT EXISTS idx_profiles_theme ON profiles(theme);

-- Create index for premium users
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON profiles(is_premium);

-- Update notification_settings structure (add new fields if not exist)
-- This is a data migration to ensure all users have the new notification_settings structure
UPDATE profiles
SET notification_settings = jsonb_set(
  COALESCE(notification_settings, '{}'::jsonb),
  '{dailyReminder}',
  'false'::jsonb,
  true
)
WHERE notification_settings IS NULL OR NOT (notification_settings ? 'dailyReminder');

UPDATE profiles
SET notification_settings = jsonb_set(
  notification_settings,
  '{weeklyReport}',
  'false'::jsonb,
  true
)
WHERE NOT (notification_settings ? 'weeklyReport');

UPDATE profiles
SET notification_settings = jsonb_set(
  notification_settings,
  '{achievements}',
  'false'::jsonb,
  true
)
WHERE NOT (notification_settings ? 'achievements');

UPDATE profiles
SET notification_settings = jsonb_set(
  notification_settings,
  '{motivational}',
  'false'::jsonb,
  true
)
WHERE NOT (notification_settings ? 'motivational');

-- Add comment to document the new fields
COMMENT ON COLUMN profiles.theme IS 'User selected theme: default, dark, light, sunset (premium), ocean (premium), forest (premium)';
COMMENT ON COLUMN profiles.is_premium IS 'Premium subscription status';
COMMENT ON COLUMN profiles.biometric_enabled IS 'Biometric authentication enabled (WebAuthn)';
COMMENT ON COLUMN profiles.backup_enabled IS 'Auto-backup to Supabase Storage enabled (premium feature)';
COMMENT ON COLUMN profiles.first_day_of_week IS 'First day of week for calendar: monday or sunday';
COMMENT ON COLUMN profiles.privacy_settings IS 'Privacy settings JSON: {biometric: boolean, autoBackup: boolean}';

-- Update RLS policies (if needed)
-- Ensure users can update their own settings
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

