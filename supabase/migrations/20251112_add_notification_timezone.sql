-- Migration: Add notification timezone to profiles
-- Date: 2025-11-12
-- Description: Add timezone field for personalized notification scheduling

-- Add timezone column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Create index for timezone queries (for grouping users by timezone)
CREATE INDEX IF NOT EXISTS idx_profiles_timezone ON profiles(timezone);

-- Add comment for documentation
COMMENT ON COLUMN profiles.timezone IS 'User timezone for personalized notification scheduling (e.g., "Europe/Moscow", "America/New_York", "UTC")';

-- Update existing users to UTC timezone (they can change it in settings)
UPDATE profiles
SET timezone = 'UTC'
WHERE timezone IS NULL;

-- Add timezone to notification_settings JSONB for backward compatibility
-- This ensures old code still works while we migrate to the new timezone column
UPDATE profiles
SET notification_settings = jsonb_set(
  COALESCE(notification_settings, '{}'::jsonb),
  '{timezone}',
  '"UTC"'::jsonb,
  true
)
WHERE notification_settings IS NULL OR NOT (notification_settings ? 'timezone');

