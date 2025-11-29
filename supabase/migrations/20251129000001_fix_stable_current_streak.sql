-- Fix unstable current_streak calculation in achievements
-- Problem: Old logic gave different results depending on whether there was an entry today
-- Solution: Streak is active if last entry was today OR yesterday, count consecutive days backwards

CREATE OR REPLACE FUNCTION calculate_user_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_achievement RECORD;
  v_total_entries INTEGER;
  v_achievements_count INTEGER;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_category_counts JSONB;
  v_progress INTEGER;
  v_condition_type TEXT;
  v_condition_value INTEGER;
  v_category_name TEXT;
  v_category_count INTEGER;
  v_days_since_first_entry INTEGER;
BEGIN
  -- Get basic user stats
  SELECT COUNT(*) INTO v_total_entries 
  FROM entries 
  WHERE user_id = p_user_id;
  
  SELECT COUNT(*) INTO v_achievements_count 
  FROM entries 
  WHERE user_id = p_user_id AND is_achievement = true;
  
  -- ✅ FIX: Calculate current streak (STABLE version)
  -- Streak is active if last entry was today OR yesterday
  -- Count consecutive days backwards from the most recent entry
  WITH daily_entries AS (
    SELECT DISTINCT DATE(created_at) as entry_date
    FROM entries
    WHERE user_id = p_user_id
    ORDER BY entry_date DESC
  ),
  most_recent AS (
    SELECT entry_date FROM daily_entries LIMIT 1
  ),
  streak_calc AS (
    SELECT 
      entry_date,
      entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date DESC))::INTEGER AS streak_group
    FROM daily_entries
    WHERE entry_date >= (SELECT entry_date FROM most_recent) - INTERVAL '1000 days' -- Reasonable limit
  )
  SELECT 
    CASE 
      -- Streak is active only if most recent entry was today or yesterday
      WHEN (SELECT entry_date FROM most_recent) >= CURRENT_DATE - INTERVAL '1 day' THEN
        (SELECT COUNT(*) 
         FROM streak_calc 
         WHERE streak_group = (SELECT streak_group FROM streak_calc ORDER BY entry_date DESC LIMIT 1))
      ELSE 0
    END
  INTO v_current_streak;
  
  -- Calculate longest streak (unchanged, already stable)
  WITH daily_entries AS (
    SELECT DISTINCT DATE(created_at) as entry_date
    FROM entries
    WHERE user_id = p_user_id
    ORDER BY entry_date
  ),
  streak_calc AS (
    SELECT 
      entry_date,
      entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date))::INTEGER AS streak_group
    FROM daily_entries
  )
  SELECT COALESCE(MAX(streak_length), 0) INTO v_longest_streak
  FROM (
    SELECT COUNT(*) as streak_length
    FROM streak_calc
    GROUP BY streak_group
  ) streaks;
  
  -- Get category counts (entries.category is TEXT, not FK)
  SELECT jsonb_object_agg(category_name, entry_count) INTO v_category_counts
  FROM (
    SELECT e.category as category_name, COUNT(e.id) as entry_count
    FROM entries e
    WHERE e.user_id = p_user_id AND e.category IS NOT NULL
    GROUP BY e.category
  ) category_stats;
  
  -- Calculate days since first entry
  SELECT COALESCE(EXTRACT(DAY FROM (NOW() - MIN(created_at)))::INTEGER, 0) INTO v_days_since_first_entry
  FROM entries
  WHERE user_id = p_user_id;
  
  -- Loop through all enabled achievements
  FOR v_achievement IN 
    SELECT * FROM achievements_catalog WHERE is_enabled = true
  LOOP
    v_progress := 0;
    v_condition_type := v_achievement.condition->>'type';
    v_condition_value := (v_achievement.condition->>'value')::INTEGER;
    
    -- Calculate progress based on condition type
    CASE v_condition_type
      WHEN 'entries_count' THEN
        v_progress := LEAST(100, FLOOR((v_total_entries::NUMERIC / v_condition_value::NUMERIC) * 100));
        
      WHEN 'achievements_count' THEN
        v_progress := LEAST(100, FLOOR((v_achievements_count::NUMERIC / v_condition_value::NUMERIC) * 100));
        
      WHEN 'streak_days' THEN
        v_progress := LEAST(100, FLOOR((v_current_streak::NUMERIC / v_condition_value::NUMERIC) * 100));
        
      WHEN 'longest_streak' THEN
        v_progress := LEAST(100, FLOOR((v_longest_streak::NUMERIC / v_condition_value::NUMERIC) * 100));
        
      WHEN 'category_count' THEN
        v_category_name := v_achievement.condition->>'category';
        v_category_count := COALESCE((v_category_counts->>v_category_name)::INTEGER, 0);
        v_progress := LEAST(100, FLOOR((v_category_count::NUMERIC / v_condition_value::NUMERIC) * 100));
        
      WHEN 'days_since_first_entry' THEN
        v_progress := LEAST(100, FLOOR((v_days_since_first_entry::NUMERIC / v_condition_value::NUMERIC) * 100));
        
      ELSE
        -- Unknown condition type, skip
        CONTINUE;
    END CASE;
    
    -- Upsert achievement progress (only if progress > 0)
    IF v_progress > 0 THEN
      INSERT INTO user_achievements (user_id, achievement_id, progress, earned_at)
      VALUES (
        p_user_id, 
        v_achievement.id, 
        v_progress,
        CASE WHEN v_progress >= 100 THEN NOW() ELSE NULL END
      )
      ON CONFLICT (user_id, achievement_id)
      DO UPDATE SET 
        progress = EXCLUDED.progress,
        earned_at = CASE 
          WHEN EXCLUDED.progress >= 100 AND user_achievements.earned_at IS NULL THEN NOW()
          ELSE user_achievements.earned_at
        END,
        updated_at = NOW();
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION calculate_user_achievements(UUID) TO authenticated;

-- Comment
COMMENT ON FUNCTION calculate_user_achievements(UUID) IS 'Enhanced achievements calculation with STABLE current_streak logic. Streak is active only if last entry was today or yesterday, preventing fluctuations.';
