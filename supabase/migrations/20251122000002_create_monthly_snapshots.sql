-- Migration: Create monthly_snapshots table for AI optimization
-- Created: 2025-11-22
-- Purpose: Store aggregated monthly snapshots to optimize token usage in books generation

-- Create monthly_snapshots table
CREATE TABLE IF NOT EXISTS monthly_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Aggregated statistics
    total_entries INTEGER DEFAULT 0,
    active_days INTEGER DEFAULT 0,
    emotions_distribution JSONB DEFAULT '{}',
    streaks JSONB DEFAULT '{}',
    top_topics TEXT[] DEFAULT '{}',
    top_persons TEXT[] DEFAULT '{}',
    achievements_count INTEGER DEFAULT 0,
    
    -- AI-generated summary of significant events
    significant_events JSONB DEFAULT '{}',
    
    -- Token tracking
    tokens_used INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure only one snapshot per user per period
    UNIQUE(user_id, period_start, period_end)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_user_id ON monthly_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_period ON monthly_snapshots(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_user_period ON monthly_snapshots(user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_created_at ON monthly_snapshots(created_at DESC);

-- Add RLS policies
ALTER TABLE monthly_snapshots ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "monthly_snapshots_select_policy" ON monthly_snapshots;
DROP POLICY IF EXISTS "monthly_snapshots_insert_policy" ON monthly_snapshots;
DROP POLICY IF EXISTS "monthly_snapshots_update_policy" ON monthly_snapshots;
DROP POLICY IF EXISTS "monthly_snapshots_delete_policy" ON monthly_snapshots;

-- Policy: Users can only see their own snapshots
CREATE POLICY "monthly_snapshots_select_policy"
    ON monthly_snapshots
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own snapshots
CREATE POLICY "monthly_snapshots_insert_policy"
    ON monthly_snapshots
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own snapshots
CREATE POLICY "monthly_snapshots_update_policy"
    ON monthly_snapshots
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own snapshots
CREATE POLICY "monthly_snapshots_delete_policy"
    ON monthly_snapshots
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_monthly_snapshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS monthly_snapshots_updated_at ON monthly_snapshots;

-- Create trigger to call the function
CREATE TRIGGER monthly_snapshots_updated_at
    BEFORE UPDATE ON monthly_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION update_monthly_snapshots_updated_at();

-- Add comments for documentation
COMMENT ON TABLE monthly_snapshots IS 'Stores aggregated monthly snapshots to optimize AI token usage in books generation';
COMMENT ON COLUMN monthly_snapshots.id IS 'Unique identifier for the snapshot';
COMMENT ON COLUMN monthly_snapshots.user_id IS 'Reference to the user who owns this snapshot';
COMMENT ON COLUMN monthly_snapshots.period_start IS 'Start date of the period (first day of month)';
COMMENT ON COLUMN monthly_snapshots.period_end IS 'End date of the period (last day of month)';
COMMENT ON COLUMN monthly_snapshots.total_entries IS 'Total number of entries in this period';
COMMENT ON COLUMN monthly_snapshots.active_days IS 'Number of days with at least one entry';
COMMENT ON COLUMN monthly_snapshots.emotions_distribution IS 'Distribution of emotions: {"joy": 15, "calm": 10, "anxiety": 5}';
COMMENT ON COLUMN monthly_snapshots.streaks IS 'Streak statistics: {"current": 5, "longest": 12}';
COMMENT ON COLUMN monthly_snapshots.top_topics IS 'Top topics/categories discussed this month';
COMMENT ON COLUMN monthly_snapshots.top_persons IS 'Top people mentioned this month (for Context Engine)';
COMMENT ON COLUMN monthly_snapshots.achievements_count IS 'Number of achievement entries';
COMMENT ON COLUMN monthly_snapshots.significant_events IS 'AI-generated summary of key events: {"summary": "...", "themes": [...]}';
COMMENT ON COLUMN monthly_snapshots.tokens_used IS 'Number of OpenAI tokens used to generate this snapshot';
COMMENT ON COLUMN monthly_snapshots.created_at IS 'Timestamp when the snapshot was created';
COMMENT ON COLUMN monthly_snapshots.updated_at IS 'Timestamp when the snapshot was last updated';

