-- Migration: Create automatic trial subscription for new users
-- Created: 2025-11-10
-- Purpose: Automatically create 14-day Premium trial for all new users

-- ============================================================================
-- 1. CREATE FUNCTION TO CREATE TRIAL SUBSCRIPTION
-- ============================================================================

CREATE OR REPLACE FUNCTION create_trial_subscription()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create trial subscription for new user
  INSERT INTO subscriptions (
    user_id,
    plan_type,
    status,
    start_date,
    end_date,
    auto_renew,
    payment_method,
    amount,
    currency,
    metadata,
    created_by,
    updated_by
  ) VALUES (
    NEW.id,                                    -- user_id
    'monthly',                                 -- plan_type (trial uses monthly plan)
    'active',                                  -- status (active trial)
    NOW(),                                     -- start_date
    NOW() + INTERVAL '14 days',                -- end_date (14 days trial)
    false,                                     -- auto_renew (trial doesn't auto-renew)
    'promo',                                   -- payment_method (trial is promo)
    0,                                         -- amount (trial is free)
    'USD',                                     -- currency
    jsonb_build_object(
      'is_trial', true,
      'trial_days', 14,
      'created_via', 'auto_trigger',
      'welcome_modal_shown', false
    ),                                         -- metadata
    NEW.id,                                    -- created_by (self)
    NEW.id                                     -- updated_by (self)
  );

  -- Update profile to set is_premium = true
  UPDATE profiles
  SET is_premium = true
  WHERE id = NEW.id;

  -- Log the trial creation
  RAISE NOTICE '✅ Trial subscription created for user: %', NEW.id;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. CREATE TRIGGER ON PROFILES TABLE
-- ============================================================================

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_profile_created_trial ON profiles;

-- Create trigger that fires AFTER INSERT on profiles
CREATE TRIGGER on_profile_created_trial
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_trial_subscription();

-- ============================================================================
-- 3. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION create_trial_subscription() IS 'Automatically creates 14-day Premium trial subscription for new users';
COMMENT ON TRIGGER on_profile_created_trial ON profiles IS 'Triggers trial subscription creation when new profile is created';

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_trial_subscription() TO authenticated;

-- ============================================================================
-- 5. VERIFICATION QUERY (for testing)
-- ============================================================================

-- To verify the trigger works, run this query after creating a new user:
-- SELECT 
--   p.id,
--   p.email,
--   p.is_premium,
--   s.plan_type,
--   s.status,
--   s.start_date,
--   s.end_date,
--   s.metadata
-- FROM profiles p
-- LEFT JOIN subscriptions s ON s.user_id = p.id
-- WHERE p.email = 'test@example.com';

