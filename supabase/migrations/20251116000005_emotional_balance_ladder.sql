-- =====================================================
-- EMOTIONAL BALANCE LADDER - Промежуточные ступени
-- =====================================================
-- Version: 1.0
-- Date: 2025-11-16
-- Description: Добавление мягких достижений для эмоционального баланса
-- 
-- Лестница эмоционального баланса:
-- 1. Первые эмоции (common) - 3 разных настроения
-- 2. Разнообразие чувств (rare) - 6 разных настроений
-- 3. Эмоциональный баланс (epic) - 10 разных настроений (уже существует)
--
-- Refs: docs/new/achievements-review-and-plan.md
-- =====================================================

-- Добавляем промежуточные ступени эмоционального баланса
INSERT INTO public.achievements_catalog (id, name, description, icon, rarity, condition)
VALUES
  -- Common: 3 разных настроения
  (
    'emotional_first_steps',
    'Первые эмоции',
    'Создай записи с 3 разными настроениями',
    '🎭',
    'common',
    '{"type": "mood_variety", "operator": ">=", "value": 3}'::jsonb
  ),
  
  -- Rare: 6 разных настроений
  (
    'emotional_variety',
    'Разнообразие чувств',
    'Создай записи с 6 разными настроениями',
    '🌸',
    'rare',
    '{"type": "mood_variety", "operator": ">=", "value": 6}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  rarity = EXCLUDED.rarity,
  condition = EXCLUDED.condition,
  is_enabled = true,
  updated_at = NOW();

-- Комментарии
COMMENT ON TABLE achievements_catalog IS 'Каталог всех возможных достижений в системе';

