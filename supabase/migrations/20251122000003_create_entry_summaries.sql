-- Migration: Update entry_summaries table for AI optimization
-- Created: 2025-11-22
-- Purpose: Add new fields to entry_summaries for Context Engine

-- Add new columns if they don't exist
ALTER TABLE entry_summaries
ADD COLUMN IF NOT EXISTS short_summary TEXT,
ADD COLUMN IF NOT EXISTS insight TEXT,
ADD COLUMN IF NOT EXISTS mood TEXT,
ADD COLUMN IF NOT EXISTS topics TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS persons TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS has_achievement BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_entry_summaries_topics ON entry_summaries USING GIN (topics);
CREATE INDEX IF NOT EXISTS idx_entry_summaries_persons ON entry_summaries USING GIN (persons);

-- Add RLS policies
ALTER TABLE entry_summaries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "entry_summaries_select_policy" ON entry_summaries;
DROP POLICY IF EXISTS "entry_summaries_insert_policy" ON entry_summaries;
DROP POLICY IF EXISTS "entry_summaries_update_policy" ON entry_summaries;
DROP POLICY IF EXISTS "entry_summaries_delete_policy" ON entry_summaries;

-- Policy: Users can only see their own summaries
CREATE POLICY "entry_summaries_select_policy"
    ON entry_summaries
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own summaries
CREATE POLICY "entry_summaries_insert_policy"
    ON entry_summaries
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own summaries
CREATE POLICY "entry_summaries_update_policy"
    ON entry_summaries
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own summaries
CREATE POLICY "entry_summaries_delete_policy"
    ON entry_summaries
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_entry_summaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS entry_summaries_updated_at ON entry_summaries;

-- Create trigger to call the function
CREATE TRIGGER entry_summaries_updated_at
    BEFORE UPDATE ON entry_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_entry_summaries_updated_at();

-- Add comments for documentation
COMMENT ON TABLE entry_summaries IS 'AI-generated summaries of entries to optimize token usage (90% savings)';
COMMENT ON COLUMN entry_summaries.id IS 'Unique identifier for the summary';
COMMENT ON COLUMN entry_summaries.entry_id IS 'Reference to the original entry';
COMMENT ON COLUMN entry_summaries.user_id IS 'Reference to the user who owns this summary';
COMMENT ON COLUMN entry_summaries.short_summary IS 'AI-generated short summary (200-300 chars)';
COMMENT ON COLUMN entry_summaries.insight IS 'Key insight or meaning extracted by AI';
COMMENT ON COLUMN entry_summaries.mood IS 'AI-determined emotional state (joy, calm, anxiety, etc.)';
COMMENT ON COLUMN entry_summaries.topics IS 'Topics/themes extracted by AI (array of strings)';
COMMENT ON COLUMN entry_summaries.persons IS 'People mentioned in entry (for Context Engine, e.g., ["Карина", "Арина", "семья"])';
COMMENT ON COLUMN entry_summaries.has_achievement IS 'Whether this entry contains an achievement';
COMMENT ON COLUMN entry_summaries.excerpt IS 'Best quote or excerpt from the entry';
COMMENT ON COLUMN entry_summaries.tokens_used IS 'Number of OpenAI tokens used to generate this summary';
COMMENT ON COLUMN entry_summaries.created_at IS 'Timestamp when the summary was created';
COMMENT ON COLUMN entry_summaries.updated_at IS 'Timestamp when the summary was last updated';

