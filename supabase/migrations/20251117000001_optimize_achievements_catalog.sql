-- =====================================================
-- Achievements Catalog Optimization
-- =====================================================
-- Date: 2025-11-17
-- Description: Optimize achievements catalog by removing duplicates and adding missing categories
-- Changes:
--   1. Remove 7 redundant achievements (entries_5, entries_25, entries_250, streak_60, streak_90, achievements_25, achievements_250)
--   2. Add 8 new achievements for missing categories (Финансы, Личное развитие, Творчество, Отношения)
-- Result: 39 → 47 achievements (better balance and coverage)

-- =====================================================
-- Step 1: Remove redundant achievements
-- =====================================================

-- Remove redundant entries_count achievements (keep: 1, 10, 50, 100, 500, 1000)
DELETE FROM public.achievements_catalog WHERE id IN ('entries_5', 'entries_25', 'entries_250');

-- Remove redundant streak_days achievements (keep: 3, 7, 14, 30, 180, 365)
DELETE FROM public.achievements_catalog WHERE id IN ('streak_60', 'streak_90');

-- Remove redundant achievements_count achievements (keep: 5, 10, 50, 100)
DELETE FROM public.achievements_catalog WHERE id IN ('achievements_25', 'achievements_250');

-- =====================================================
-- Step 2: Add missing category achievements
-- =====================================================

-- Финансы (Finance)
INSERT INTO public.achievements_catalog (id, name, description, icon, rarity, condition)
VALUES
  (
    'category_finance_5',
    'Финансовая осознанность',
    'Создай 5 записей о финансах',
    '💰',
    'common',
    '{"type": "category_count", "operator": ">=", "value": 5, "category": "Финансы"}'::jsonb
  ),
  (
    'category_finance_20',
    'Финансовый контроль',
    'Создай 20 записей о финансах',
    '💰',
    'rare',
    '{"type": "category_count", "operator": ">=", "value": 20, "category": "Финансы"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  rarity = EXCLUDED.rarity,
  condition = EXCLUDED.condition,
  is_enabled = true,
  updated_at = NOW();

-- Личное развитие (Personal Growth)
INSERT INTO public.achievements_catalog (id, name, description, icon, rarity, condition)
VALUES
  (
    'category_growth_5',
    'Путь развития',
    'Создай 5 записей о личном развитии',
    '🌱',
    'common',
    '{"type": "category_count", "operator": ">=", "value": 5, "category": "Личное развитие"}'::jsonb
  ),
  (
    'category_growth_20',
    'Мастер роста',
    'Создай 20 записей о личном развитии',
    '🌱',
    'rare',
    '{"type": "category_count", "operator": ">=", "value": 20, "category": "Личное развитие"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  rarity = EXCLUDED.rarity,
  condition = EXCLUDED.condition,
  is_enabled = true,
  updated_at = NOW();

-- Творчество (Creativity)
INSERT INTO public.achievements_catalog (id, name, description, icon, rarity, condition)
VALUES
  (
    'category_creativity_5',
    'Творческий старт',
    'Создай 5 записей о творчестве',
    '🎨',
    'common',
    '{"type": "category_count", "operator": ">=", "value": 5, "category": "Творчество"}'::jsonb
  ),
  (
    'category_creativity_20',
    'Творческая душа',
    'Создай 20 записей о творчестве',
    '🎨',
    'rare',
    '{"type": "category_count", "operator": ">=", "value": 20, "category": "Творчество"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  rarity = EXCLUDED.rarity,
  condition = EXCLUDED.condition,
  is_enabled = true,
  updated_at = NOW();

-- Отношения (Relationships)
INSERT INTO public.achievements_catalog (id, name, description, icon, rarity, condition)
VALUES
  (
    'category_relationships_5',
    'Связи важны',
    'Создай 5 записей об отношениях',
    '💞',
    'common',
    '{"type": "category_count", "operator": ">=", "value": 5, "category": "Отношения"}'::jsonb
  ),
  (
    'category_relationships_20',
    'Мастер отношений',
    'Создай 20 записей об отношениях',
    '💞',
    'rare',
    '{"type": "category_count", "operator": ">=", "value": 20, "category": "Отношения"}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  rarity = EXCLUDED.rarity,
  condition = EXCLUDED.condition,
  is_enabled = true,
  updated_at = NOW();

-- =====================================================
-- Verification
-- =====================================================

-- Check total count (should be 47)
DO $$
DECLARE
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM public.achievements_catalog WHERE is_enabled = true;
  RAISE NOTICE 'Total achievements: %', total_count;
  
  IF total_count != 47 THEN
    RAISE WARNING 'Expected 47 achievements, got %', total_count;
  END IF;
END $$;

