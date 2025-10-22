-- Add PWA tracking columns to profiles table
-- Migration: 20251022_add_pwa_tracking_columns

-- Add pwa_installed column (boolean, default false)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS pwa_installed BOOLEAN DEFAULT false;

-- Add last_active column (timestamp with timezone)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ;

-- Create index for last_active for performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_active 
ON profiles(last_active DESC);

-- Create index for pwa_installed for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_pwa_installed 
ON profiles(pwa_installed) 
WHERE pwa_installed = true;

-- Add comment
COMMENT ON COLUMN profiles.pwa_installed IS 'Whether user has installed PWA';
COMMENT ON COLUMN profiles.last_active IS 'Last time user was active in the app';

