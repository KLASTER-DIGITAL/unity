-- Migration: Create books_archive table for PDF books
-- Created: 2025-10-14
-- Purpose: Store generated PDF books and their metadata

-- Create books_archive table
CREATE TABLE IF NOT EXISTS books_archive (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    contexts TEXT[] DEFAULT '{}',
    style VARCHAR(50) DEFAULT 'warm_family' CHECK (style IN ('warm_family', 'biographical', 'motivational')),
    layout VARCHAR(50) DEFAULT 'photo_text' CHECK (layout IN ('photo_text', 'text_only', 'minimal')),
    theme VARCHAR(50) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    pdf_url TEXT,
    story_json JSONB,
    metadata JSONB DEFAULT '{}',
    is_draft BOOLEAN DEFAULT true,
    is_final BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_books_archive_user_id ON books_archive(user_id);
CREATE INDEX IF NOT EXISTS idx_books_archive_created_at ON books_archive(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_archive_period ON books_archive(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_books_archive_is_final ON books_archive(is_final);

-- Add RLS policies
ALTER TABLE books_archive ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own books
CREATE POLICY "Users can view own books"
    ON books_archive
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own books
CREATE POLICY "Users can insert own books"
    ON books_archive
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own books
CREATE POLICY "Users can update own books"
    ON books_archive
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Users can delete their own books
CREATE POLICY "Users can delete own books"
    ON books_archive
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE books_archive IS 'Stores generated PDF books and their metadata';
COMMENT ON COLUMN books_archive.id IS 'Unique identifier for the book';
COMMENT ON COLUMN books_archive.user_id IS 'Reference to the user who owns this book';
COMMENT ON COLUMN books_archive.period_start IS 'Start date of the period covered by the book';
COMMENT ON COLUMN books_archive.period_end IS 'End date of the period covered by the book';
COMMENT ON COLUMN books_archive.contexts IS 'Array of contexts/topics included in the book';
COMMENT ON COLUMN books_archive.style IS 'Narrative style: warm_family, biographical, or motivational';
COMMENT ON COLUMN books_archive.layout IS 'Page layout: photo_text, text_only, or minimal';
COMMENT ON COLUMN books_archive.theme IS 'Visual theme: light or dark';
COMMENT ON COLUMN books_archive.pdf_url IS 'URL to the generated PDF file in storage';
COMMENT ON COLUMN books_archive.story_json IS 'JSON object containing the book content: title, prologue, chapters, statistics, epilogue';
COMMENT ON COLUMN books_archive.metadata IS 'Additional metadata: pages, images_count, wordCount, etc.';
COMMENT ON COLUMN books_archive.is_draft IS 'Whether this is a draft (editable)';
COMMENT ON COLUMN books_archive.is_final IS 'Whether this is the final version (PDF generated)';
COMMENT ON COLUMN books_archive.created_at IS 'Timestamp when the book was created';
COMMENT ON COLUMN books_archive.updated_at IS 'Timestamp when the book was last updated';

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_books_archive_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER books_archive_updated_at
    BEFORE UPDATE ON books_archive
    FOR EACH ROW
    EXECUTE FUNCTION update_books_archive_updated_at();

-- Create story_snapshots table for quarterly/yearly aggregations
CREATE TABLE IF NOT EXISTS story_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL, -- Format: '2025-Q3' or '2025'
    aggregated_json JSONB NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for story_snapshots
CREATE INDEX IF NOT EXISTS idx_story_snapshots_user_id ON story_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_story_snapshots_period ON story_snapshots(period);
CREATE INDEX IF NOT EXISTS idx_story_snapshots_created_at ON story_snapshots(created_at DESC);

-- Add RLS policies for story_snapshots
ALTER TABLE story_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
    ON story_snapshots
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots"
    ON story_snapshots
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snapshots"
    ON story_snapshots
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own snapshots"
    ON story_snapshots
    FOR DELETE
    USING (auth.uid() = user_id);

-- Add comments for story_snapshots
COMMENT ON TABLE story_snapshots IS 'Stores aggregated story snapshots for quarters and years to optimize token usage';
COMMENT ON COLUMN story_snapshots.id IS 'Unique identifier for the snapshot';
COMMENT ON COLUMN story_snapshots.user_id IS 'Reference to the user who owns this snapshot';
COMMENT ON COLUMN story_snapshots.period IS 'Period identifier: 2025-Q3 for quarter, 2025 for year';
COMMENT ON COLUMN story_snapshots.aggregated_json IS 'Aggregated story data from multiple entries';
COMMENT ON COLUMN story_snapshots.tokens_used IS 'Number of OpenAI tokens used to generate this snapshot';
COMMENT ON COLUMN story_snapshots.created_at IS 'Timestamp when the snapshot was created';
COMMENT ON COLUMN story_snapshots.updated_at IS 'Timestamp when the snapshot was last updated';

-- Create trigger for story_snapshots
CREATE TRIGGER story_snapshots_updated_at
    BEFORE UPDATE ON story_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION update_books_archive_updated_at();

