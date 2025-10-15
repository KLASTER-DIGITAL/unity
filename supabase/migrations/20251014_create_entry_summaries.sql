-- Migration: Create entry_summaries table for token optimization
-- Created: 2025-10-14
-- Purpose: Store AI-generated summaries to reduce OpenAI API token usage

-- Create entry_summaries table
CREATE TABLE IF NOT EXISTS entry_summaries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_id UUID REFERENCES diary_entries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    summary_json JSONB NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_entry_summaries_user_id ON entry_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_entry_summaries_entry_id ON entry_summaries(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_summaries_created_at ON entry_summaries(created_at DESC);

-- Add RLS policies
ALTER TABLE entry_summaries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own summaries
CREATE POLICY "Users can view own summaries"
    ON entry_summaries
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own summaries
CREATE POLICY "Users can insert own summaries"
    ON entry_summaries
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own summaries
CREATE POLICY "Users can update own summaries"
    ON entry_summaries
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own summaries
CREATE POLICY "Users can delete own summaries"
    ON entry_summaries
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE entry_summaries IS 'Stores AI-generated summaries of diary entries for token optimization';
COMMENT ON COLUMN entry_summaries.id IS 'Unique identifier for the summary';
COMMENT ON COLUMN entry_summaries.entry_id IS 'Reference to the diary entry';
COMMENT ON COLUMN entry_summaries.user_id IS 'Reference to the user who owns this summary';
COMMENT ON COLUMN entry_summaries.summary_json IS 'JSON object containing: text, insight, mood, sentiment, contexts, tags, achievements, keywords, excerpt, confidence';
COMMENT ON COLUMN entry_summaries.tokens_used IS 'Number of OpenAI tokens used to generate this summary';
COMMENT ON COLUMN entry_summaries.created_at IS 'Timestamp when the summary was created';
COMMENT ON COLUMN entry_summaries.updated_at IS 'Timestamp when the summary was last updated';

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_entry_summaries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER entry_summaries_updated_at
    BEFORE UPDATE ON entry_summaries
    FOR EACH ROW
    EXECUTE FUNCTION update_entry_summaries_updated_at();

