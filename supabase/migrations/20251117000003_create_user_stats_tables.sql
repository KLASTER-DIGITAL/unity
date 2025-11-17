-- Migration: Create user_stats_daily and user_stats_monthly tables
-- Date: 2025-11-17
-- Purpose: Server-side aggregated statistics for Reports system
-- Refs: docs/new/reports-review-and-plan.md

-- =============================================================
-- 1. DAILY USER STATS
-- =============================================================

CREATE TABLE IF NOT EXISTS user_stats_daily (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  entries_count INT NOT NULL DEFAULT 0,
  achievements_count INT NOT NULL DEFAULT 0,
  positive_count INT NOT NULL DEFAULT 0,
  neutral_count INT NOT NULL DEFAULT 0,
  negative_count INT NOT NULL DEFAULT 0,
  top_category TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

COMMENT ON TABLE user_stats_daily IS 'Aggregated per-day statistics for each user (entries, mood, achievements, top category)';
COMMENT ON COLUMN user_stats_daily.user_id IS 'User ID (auth.users.id)';
COMMENT ON COLUMN user_stats_daily.date IS 'Calendar date (UTC) for aggregated stats';
COMMENT ON COLUMN user_stats_daily.entries_count IS 'Total entries created on this date';
COMMENT ON COLUMN user_stats_daily.achievements_count IS 'Entries flagged as achievements on this date';
COMMENT ON COLUMN user_stats_daily.positive_count IS 'Entries with positive sentiment on this date';
COMMENT ON COLUMN user_stats_daily.neutral_count IS 'Entries with neutral or unknown sentiment on this date';
COMMENT ON COLUMN user_stats_daily.negative_count IS 'Entries with negative sentiment on this date';
COMMENT ON COLUMN user_stats_daily.top_category IS 'Most frequent category for this day (normalized)';

CREATE INDEX IF NOT EXISTS idx_user_stats_daily_user_date
  ON user_stats_daily(user_id, date DESC);

-- =============================================================
-- 2. MONTHLY USER STATS
-- =============================================================

CREATE TABLE IF NOT EXISTS user_stats_monthly (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL CHECK (month >= 1 AND month <= 12),
  entries_count INT NOT NULL DEFAULT 0,
  achievements_count INT NOT NULL DEFAULT 0,
  avg_mood NUMERIC NULL,
  top_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, year, month)
);

COMMENT ON TABLE user_stats_monthly IS 'Aggregated per-month statistics for each user (entries, achievements, mood, top categories)';
COMMENT ON COLUMN user_stats_monthly.user_id IS 'User ID (auth.users.id)';
COMMENT ON COLUMN user_stats_monthly.year IS 'Calendar year (e.g. 2025)';
COMMENT ON COLUMN user_stats_monthly.month IS 'Calendar month number (1-12)';
COMMENT ON COLUMN user_stats_monthly.entries_count IS 'Total entries created in this month';
COMMENT ON COLUMN user_stats_monthly.achievements_count IS 'Total achievements entries in this month';
COMMENT ON COLUMN user_stats_monthly.avg_mood IS 'Average mood score for month in range [-1, 1]';
COMMENT ON COLUMN user_stats_monthly.top_categories IS 'Top categories for month as JSON array sorted by frequency';

CREATE INDEX IF NOT EXISTS idx_user_stats_monthly_user_period
  ON user_stats_monthly(user_id, year DESC, month DESC);

-- =============================================================
-- 3. ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE user_stats_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats_monthly ENABLE ROW LEVEL SECURITY;

-- Daily stats: user can see only own stats
CREATE POLICY "Users can view own daily stats"
  ON user_stats_daily
  FOR SELECT
  USING (user_id = auth.uid());

-- Monthly stats: user can see only own stats
CREATE POLICY "Users can view own monthly stats"
  ON user_stats_monthly
  FOR SELECT
  USING (user_id = auth.uid());

-- Super admin can view all stats
CREATE POLICY "Super admin can view all daily stats"
  ON user_stats_daily
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can view all monthly stats"
  ON user_stats_monthly
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- =============================================================
-- 4. UPDATED_AT TRIGGERS
-- =============================================================

-- Reuse generic helper that already has fixed search_path
CREATE TRIGGER trigger_user_stats_daily_updated_at
  BEFORE UPDATE ON user_stats_daily
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trigger_user_stats_monthly_updated_at
  BEFORE UPDATE ON user_stats_monthly
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

