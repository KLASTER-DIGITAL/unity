-- Migration: Create user_reports table for caching AI reports
-- Date: 2025-11-17
-- Purpose: Cache weekly/monthly AI reports per user (snapshot of stats + AI text)
-- Refs: docs/new/reports-review-and-plan.md, docs/unity-roadmap-tasks.md

-- =============================================================
-- 1. USER REPORTS TABLE
-- =============================================================

CREATE TABLE IF NOT EXISTS user_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL,           -- 'weekly' | 'monthly' (future: 'yearly')
  period_key TEXT NOT NULL,            -- e.g. '2025-11', '2025-W45'
  language TEXT NOT NULL,              -- e.g. 'ru', 'en'
  is_premium BOOLEAN NOT NULL,         -- was report generated with premium features
  stats JSONB NOT NULL,                -- snapshot of numeric stats for the period
  ai_summary TEXT NULL,                -- main AI summary text
  ai_insights JSONB NULL,              -- array of insights / recommendations
  pdf_url TEXT NULL,                   -- link to generated PDF, if any
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, period_type, period_key)
);

COMMENT ON TABLE user_reports IS 'Cached weekly/monthly AI reports for each user (stats snapshot + AI text + PDF link)';
COMMENT ON COLUMN user_reports.user_id IS 'User ID (auth.users.id)';
COMMENT ON COLUMN user_reports.period_type IS 'Report type: weekly, monthly (optionally yearly in the future)';
COMMENT ON COLUMN user_reports.period_key IS 'Report period key, e.g. 2025-11 or 2025-W45';
COMMENT ON COLUMN user_reports.language IS 'Language code of the report (e.g. ru, en, es)';
COMMENT ON COLUMN user_reports.is_premium IS 'Whether premium-only features were used to generate this report';
COMMENT ON COLUMN user_reports.stats IS 'JSON snapshot of statistics for the report period';
COMMENT ON COLUMN user_reports.ai_summary IS 'Main AI-generated summary text for the period';
COMMENT ON COLUMN user_reports.ai_insights IS 'AI-generated insights and recommendations (JSON array)';
COMMENT ON COLUMN user_reports.pdf_url IS 'URL to generated PDF report, if available';

-- =============================================================
-- 2. ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- Users can view only their own reports
CREATE POLICY "Users can view own reports"
  ON user_reports
  FOR SELECT
  USING (user_id = auth.uid());

-- Super admin can view all reports
CREATE POLICY "Super admin can view all reports"
  ON user_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

-- Note: insert/update/delete are intentionally left without policies so that
-- only service role / backend edge functions can modify reports.

-- =============================================================
-- 3. UPDATED_AT TRIGGER
-- =============================================================

CREATE TRIGGER trigger_user_reports_updated_at
  BEFORE UPDATE ON user_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

