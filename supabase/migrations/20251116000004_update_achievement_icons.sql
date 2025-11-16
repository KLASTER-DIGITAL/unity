-- =====================================================
-- UPDATE ACHIEVEMENT ICONS TO LUCIDE NAMES
-- =====================================================
-- Version: 1.0
-- Date: 2025-11-16
-- Description: Обновление иконок достижений с emoji на Lucide icon names
-- Refs: src/features/mobile/achievements/components/AchievementsScreen.tsx

-- =====================================================
-- COMMON ACHIEVEMENTS
-- =====================================================

UPDATE achievements_catalog SET icon = 'Sparkles' WHERE id = 'first_entry';
UPDATE achievements_catalog SET icon = 'Star' WHERE id = 'entries_5';
UPDATE achievements_catalog SET icon = 'BookOpen' WHERE id = 'entries_10';
UPDATE achievements_catalog SET icon = 'Flame' WHERE id = 'streak_3';
UPDATE achievements_catalog SET icon = 'Flame' WHERE id = 'streak_7';
UPDATE achievements_catalog SET icon = 'Home' WHERE id = 'category_family_5';
UPDATE achievements_catalog SET icon = 'Dumbbell' WHERE id = 'category_health_5';
UPDATE achievements_catalog SET icon = 'BookOpen' WHERE id = 'category_work_5';

-- =====================================================
-- RARE ACHIEVEMENTS
-- =====================================================

UPDATE achievements_catalog SET icon = 'Target' WHERE id = 'entries_25';
UPDATE achievements_catalog SET icon = 'Trophy' WHERE id = 'entries_50';
UPDATE achievements_catalog SET icon = 'Zap' WHERE id = 'streak_14';
UPDATE achievements_catalog SET icon = 'Calendar' WHERE id = 'streak_30';
UPDATE achievements_catalog SET icon = 'Star' WHERE id = 'achievements_5';
UPDATE achievements_catalog SET icon = 'Medal' WHERE id = 'achievements_10';
UPDATE achievements_catalog SET icon = 'Heart' WHERE id = 'category_family_20';
UPDATE achievements_catalog SET icon = 'Dumbbell' WHERE id = 'category_health_20';
UPDATE achievements_catalog SET icon = 'Heart' WHERE id = 'category_gratitude_10';

-- =====================================================
-- EPIC ACHIEVEMENTS
-- =====================================================

UPDATE achievements_catalog SET icon = 'Trophy' WHERE id = 'entries_100';
UPDATE achievements_catalog SET icon = 'Award' WHERE id = 'entries_250';
UPDATE achievements_catalog SET icon = 'Flame' WHERE id = 'streak_60';
UPDATE achievements_catalog SET icon = 'TrendingUp' WHERE id = 'streak_90';
UPDATE achievements_catalog SET icon = 'Medal' WHERE id = 'achievements_25';
UPDATE achievements_catalog SET icon = 'Trophy' WHERE id = 'achievements_50';
UPDATE achievements_catalog SET icon = 'Home' WHERE id = 'category_family_50';
UPDATE achievements_catalog SET icon = 'Dumbbell' WHERE id = 'category_health_50';
UPDATE achievements_catalog SET icon = 'BookOpen' WHERE id = 'category_work_50';

-- =====================================================
-- LEGENDARY ACHIEVEMENTS
-- =====================================================

UPDATE achievements_catalog SET icon = 'Rocket' WHERE id = 'entries_500';
UPDATE achievements_catalog SET icon = 'Crown' WHERE id = 'entries_1000';
UPDATE achievements_catalog SET icon = 'Flame' WHERE id = 'streak_180';
UPDATE achievements_catalog SET icon = 'Crown' WHERE id = 'streak_365';
UPDATE achievements_catalog SET icon = 'Crown' WHERE id = 'achievements_100';
UPDATE achievements_catalog SET icon = 'Crown' WHERE id = 'achievements_250';
UPDATE achievements_catalog SET icon = 'Home' WHERE id = 'category_family_100';
UPDATE achievements_catalog SET icon = 'Zap' WHERE id = 'category_health_100';
UPDATE achievements_catalog SET icon = 'Sparkles' WHERE id = 'category_gratitude_50';
UPDATE achievements_catalog SET icon = 'Lightbulb' WHERE id = 'all_categories';
UPDATE achievements_catalog SET icon = 'Gift' WHERE id = 'year_complete';

-- =====================================================
-- SPECIAL ACHIEVEMENTS
-- =====================================================

UPDATE achievements_catalog SET icon = 'Heart' WHERE id = 'honest_difficult_day';
UPDATE achievements_catalog SET icon = 'Sparkles' WHERE id = 'emotional_balance';
UPDATE achievements_catalog SET icon = 'TrendingUp' WHERE id = 'comeback_7';
UPDATE achievements_catalog SET icon = 'Rocket' WHERE id = 'comeback_30';

