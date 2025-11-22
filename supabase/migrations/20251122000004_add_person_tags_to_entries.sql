-- Migration: Add person_tags to entries table for Context Engine
-- Created: 2025-11-22
-- Purpose: Support person-based chapters in books (Context Engine)

-- Add person_tags column to entries
ALTER TABLE entries
ADD COLUMN IF NOT EXISTS person_tags TEXT[] DEFAULT '{}';

-- Create GIN index for fast array searches
CREATE INDEX IF NOT EXISTS idx_entries_person_tags ON entries USING GIN (person_tags);

-- Add comment for documentation
COMMENT ON COLUMN entries.person_tags IS 'People mentioned in entry (for Context Engine, e.g., ["Карина", "Арина", "семья"])';

