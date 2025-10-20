-- Set super_admin role for diary@leadshunter.biz
-- Migration: 20251020_set_super_admin_role

-- Update role for the super admin user
UPDATE profiles
SET role = 'super_admin'
WHERE email = 'diary@leadshunter.biz';

-- Verify the update
SELECT id, email, role, created_at
FROM profiles
WHERE email = 'diary@leadshunter.biz';

