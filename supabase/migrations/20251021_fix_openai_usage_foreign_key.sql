-- Migration: Fix openai_usage foreign key relationship
-- Date: 2025-10-21
-- Description: Add foreign key constraint from openai_usage.user_id to profiles.id

-- Drop existing foreign key if it exists (to auth.users)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'openai_usage_user_id_fkey' 
        AND table_name = 'openai_usage'
    ) THEN
        ALTER TABLE openai_usage DROP CONSTRAINT openai_usage_user_id_fkey;
    END IF;
END $$;

-- Add foreign key constraint to profiles table
ALTER TABLE openai_usage
ADD CONSTRAINT openai_usage_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add comment
COMMENT ON CONSTRAINT openai_usage_user_id_fkey ON openai_usage IS 'Foreign key to profiles table for user information';

