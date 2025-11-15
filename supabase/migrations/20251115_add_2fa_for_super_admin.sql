-- Migration: Add 2FA (Two-Factor Authentication) for super_admin
-- Date: 2025-11-15
-- Description: Add TOTP-based 2FA for super_admin role

-- Add 2FA columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT[],
ADD COLUMN IF NOT EXISTS two_factor_verified_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN profiles.two_factor_enabled IS 'Whether 2FA is enabled for this user (only for super_admin)';
COMMENT ON COLUMN profiles.two_factor_secret IS 'TOTP secret key (encrypted, only for super_admin)';
COMMENT ON COLUMN profiles.two_factor_backup_codes IS 'Array of backup codes for 2FA recovery (hashed)';
COMMENT ON COLUMN profiles.two_factor_verified_at IS 'Timestamp when 2FA was last verified';

-- Create index for 2FA queries
CREATE INDEX IF NOT EXISTS idx_profiles_two_factor_enabled ON profiles(two_factor_enabled) WHERE two_factor_enabled = true;

-- Create table for 2FA verification attempts (rate limiting)
CREATE TABLE IF NOT EXISTS public.two_factor_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_two_factor_attempts_user_created ON two_factor_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_two_factor_attempts_created ON two_factor_attempts(created_at);

-- RLS policies for two_factor_attempts
ALTER TABLE public.two_factor_attempts ENABLE ROW LEVEL SECURITY;

-- Only super_admin can read their own attempts
CREATE POLICY "super_admin_can_read_own_2fa_attempts"
ON public.two_factor_attempts
FOR SELECT
USING (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
);

-- RPC function to check 2FA rate limit
CREATE OR REPLACE FUNCTION public.check_2fa_rate_limit(
    p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_failed_attempts INTEGER;
    v_last_attempt_time TIMESTAMPTZ;
    v_block_until TIMESTAMPTZ;
    v_window_minutes INTEGER := 15;
    v_max_attempts INTEGER := 5;
    v_block_minutes INTEGER := 30;
BEGIN
    -- Count failed attempts in the last window_minutes
    SELECT COUNT(*), MAX(created_at)
    INTO v_failed_attempts, v_last_attempt_time
    FROM two_factor_attempts
    WHERE user_id = p_user_id
      AND success = false
      AND created_at > NOW() - (v_window_minutes || ' minutes')::INTERVAL;

    -- If >= max_attempts, check if block period has expired
    IF v_failed_attempts >= v_max_attempts THEN
        v_block_until := v_last_attempt_time + (v_block_minutes || ' minutes')::INTERVAL;
        
        IF NOW() < v_block_until THEN
            -- Still blocked
            RETURN jsonb_build_object(
                'is_blocked', true,
                'failed_attempts', v_failed_attempts,
                'attempts_remaining', 0,
                'block_until', v_block_until,
                'window_minutes', v_window_minutes,
                'max_attempts', v_max_attempts
            );
        ELSE
            -- Block expired, reset counter
            v_failed_attempts := 0;
        END IF;
    END IF;

    -- Not blocked
    RETURN jsonb_build_object(
        'is_blocked', false,
        'failed_attempts', v_failed_attempts,
        'attempts_remaining', v_max_attempts - v_failed_attempts,
        'block_until', NULL,
        'window_minutes', v_window_minutes,
        'max_attempts', v_max_attempts
    );
END;
$$;

-- RPC function to record 2FA attempt
CREATE OR REPLACE FUNCTION public.record_2fa_attempt(
    p_user_id UUID,
    p_code TEXT,
    p_success BOOLEAN,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert attempt record
    INSERT INTO two_factor_attempts (user_id, code, success, ip_address, user_agent)
    VALUES (p_user_id, p_code, p_success, p_ip_address, p_user_agent);

    -- Update two_factor_verified_at if successful
    IF p_success THEN
        UPDATE profiles
        SET two_factor_verified_at = NOW()
        WHERE id = p_user_id;
    END IF;

    -- Cleanup old records (older than 24 hours)
    DELETE FROM two_factor_attempts
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_2fa_rate_limit(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_2fa_attempt(UUID, TEXT, BOOLEAN, TEXT, TEXT) TO authenticated;

