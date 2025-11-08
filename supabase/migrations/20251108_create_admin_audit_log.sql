-- ============================================
-- Admin Audit Log Table
-- ============================================
-- Tracks all critical actions performed by super_admin
-- For security, compliance, and debugging purposes
--
-- @author UNITY Team
-- @date 2025-11-08

-- Create admin_audit_log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Action details
  action TEXT NOT NULL, -- e.g., 'user.create', 'user.delete', 'role.change', 'settings.update'
  category TEXT NOT NULL, -- e.g., 'users', 'settings', 'system', 'translations'
  
  -- Who performed the action
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL, -- Denormalized for faster queries
  
  -- What was affected
  target_id UUID, -- ID of affected resource (user, setting, etc.)
  target_type TEXT, -- Type of affected resource (e.g., 'user', 'setting', 'language')
  
  -- Additional context
  details JSONB, -- Flexible field for action-specific data
  ip_address TEXT, -- IP address of the user
  user_agent TEXT, -- Browser/client info
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Index for filtering by user
CREATE INDEX idx_admin_audit_log_user_id ON admin_audit_log(user_id);

-- Index for filtering by action
CREATE INDEX idx_admin_audit_log_action ON admin_audit_log(action);

-- Index for filtering by category
CREATE INDEX idx_admin_audit_log_category ON admin_audit_log(category);

-- Index for filtering by date (most common query)
CREATE INDEX idx_admin_audit_log_created_at ON admin_audit_log(created_at DESC);

-- Composite index for user + date queries
CREATE INDEX idx_admin_audit_log_user_date ON admin_audit_log(user_id, created_at DESC);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only super_admin can read audit logs
CREATE POLICY "Super admin can read audit logs"
  ON admin_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Policy: Only super_admin can insert audit logs (via Edge Functions)
CREATE POLICY "Super admin can insert audit logs"
  ON admin_audit_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Policy: No one can update or delete audit logs (immutable)
-- This ensures audit trail integrity

-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE admin_audit_log IS 'Audit log for all critical admin actions. Immutable for security.';
COMMENT ON COLUMN admin_audit_log.action IS 'Action performed (e.g., user.create, role.change)';
COMMENT ON COLUMN admin_audit_log.category IS 'Category of action (users, settings, system, translations)';
COMMENT ON COLUMN admin_audit_log.user_id IS 'ID of user who performed the action';
COMMENT ON COLUMN admin_audit_log.user_email IS 'Email of user (denormalized for performance)';
COMMENT ON COLUMN admin_audit_log.target_id IS 'ID of affected resource';
COMMENT ON COLUMN admin_audit_log.target_type IS 'Type of affected resource';
COMMENT ON COLUMN admin_audit_log.details IS 'Additional context (JSONB)';
COMMENT ON COLUMN admin_audit_log.ip_address IS 'IP address of the user';
COMMENT ON COLUMN admin_audit_log.user_agent IS 'Browser/client information';

-- ============================================
-- Example Audit Log Entries
-- ============================================

-- Example 1: User creation
-- INSERT INTO admin_audit_log (action, category, user_id, user_email, target_id, target_type, details, ip_address)
-- VALUES ('user.create', 'users', 'admin-uuid', 'admin@example.com', 'new-user-uuid', 'user', 
--   '{"email": "newuser@example.com", "role": "user"}', '192.168.1.1');

-- Example 2: Role change
-- INSERT INTO admin_audit_log (action, category, user_id, user_email, target_id, target_type, details, ip_address)
-- VALUES ('role.change', 'users', 'admin-uuid', 'admin@example.com', 'user-uuid', 'user',
--   '{"old_role": "user", "new_role": "premium"}', '192.168.1.1');

-- Example 3: Settings update
-- INSERT INTO admin_audit_log (action, category, user_id, user_email, target_id, target_type, details, ip_address)
-- VALUES ('settings.update', 'system', 'admin-uuid', 'admin@example.com', NULL, 'settings',
--   '{"setting": "max_entries_per_day", "old_value": 10, "new_value": 20}', '192.168.1.1');

