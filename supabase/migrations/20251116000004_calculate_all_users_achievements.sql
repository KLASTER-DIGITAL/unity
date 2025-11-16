-- Calculate achievements for all existing users
-- This is a one-time migration to populate user_achievements table

DO $$
DECLARE
  v_user RECORD;
  v_total_users INTEGER;
  v_processed INTEGER := 0;
BEGIN
  -- Count total users
  SELECT COUNT(*) INTO v_total_users FROM auth.users;
  
  RAISE NOTICE 'Starting achievements calculation for % users', v_total_users;
  
  -- Loop through all users
  FOR v_user IN 
    SELECT id, email FROM auth.users
  LOOP
    -- Calculate achievements for this user
    PERFORM calculate_user_achievements(v_user.id);
    
    v_processed := v_processed + 1;
    
    -- Log progress every 10 users
    IF v_processed % 10 = 0 THEN
      RAISE NOTICE 'Processed % / % users', v_processed, v_total_users;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Achievements calculation completed for % users', v_processed;
END $$;

-- Verify results
SELECT 
  COUNT(DISTINCT user_id) as total_users_with_achievements,
  COUNT(*) as total_achievement_records,
  COUNT(*) FILTER (WHERE earned_at IS NOT NULL) as total_earned,
  COUNT(*) FILTER (WHERE earned_at IS NULL) as total_in_progress
FROM user_achievements;

