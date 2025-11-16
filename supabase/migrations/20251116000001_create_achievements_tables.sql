-- =====================================================
-- ACHIEVEMENTS SYSTEM
-- =====================================================
-- Version: 1.0
-- Date: 2025-11-16
-- Description: Создание таблиц для системы достижений
-- Refs: docs/new/achievements-review-and-plan.md

-- =====================================================
-- 1. ACHIEVEMENTS CATALOG
-- =====================================================
-- Каталог всех возможных достижений в системе
-- Управляется супер-админом через админ-панель

CREATE TABLE IF NOT EXISTS achievements_catalog (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  condition JSONB NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Комментарии для полей
COMMENT ON TABLE achievements_catalog IS 'Каталог всех возможных достижений в системе';
COMMENT ON COLUMN achievements_catalog.id IS 'Уникальный ID достижения (например: first_entry, week_streak_7)';
COMMENT ON COLUMN achievements_catalog.name IS 'Название достижения (например: "Первые шаги")';
COMMENT ON COLUMN achievements_catalog.description IS 'Описание достижения (например: "Создай свою первую запись")';
COMMENT ON COLUMN achievements_catalog.icon IS 'Иконка достижения (emoji или lucide icon name)';
COMMENT ON COLUMN achievements_catalog.rarity IS 'Редкость: common, rare, epic, legendary';
COMMENT ON COLUMN achievements_catalog.condition IS 'JSON условие для получения достижения';
COMMENT ON COLUMN achievements_catalog.is_enabled IS 'Включено ли достижение (можно выключить через админку)';

-- Индексы
CREATE INDEX IF NOT EXISTS idx_achievements_catalog_rarity ON achievements_catalog(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_catalog_enabled ON achievements_catalog(is_enabled) WHERE is_enabled = TRUE;

-- =====================================================
-- 2. USER ACHIEVEMENTS
-- =====================================================
-- Достижения, полученные конкретными пользователями

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES achievements_catalog(id) ON DELETE CASCADE,
  progress INT NOT NULL DEFAULT 100 CHECK (progress >= 0 AND progress <= 100),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

-- Комментарии для полей
COMMENT ON TABLE user_achievements IS 'Достижения, полученные пользователями';
COMMENT ON COLUMN user_achievements.user_id IS 'ID пользователя';
COMMENT ON COLUMN user_achievements.achievement_id IS 'ID достижения из каталога';
COMMENT ON COLUMN user_achievements.progress IS 'Прогресс выполнения (0-100%), 100 = получено';
COMMENT ON COLUMN user_achievements.earned_at IS 'Дата получения достижения (когда progress достиг 100%)';

-- Индексы
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_progress ON user_achievements(progress) WHERE progress < 100;

-- =====================================================
-- 3. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE achievements_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements Catalog: все могут читать активные достижения
CREATE POLICY "Anyone can view enabled achievements"
  ON achievements_catalog
  FOR SELECT
  USING (is_enabled = TRUE);

-- Achievements Catalog: только super_admin может управлять
CREATE POLICY "Super admin can manage achievements catalog"
  ON achievements_catalog
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.role = 'super_admin'
    )
  );

-- User Achievements: пользователи видят только свои достижения
CREATE POLICY "Users can view own achievements"
  ON user_achievements
  FOR SELECT
  USING (user_id = auth.uid());

-- User Achievements: система может создавать/обновлять достижения
CREATE POLICY "System can manage user achievements"
  ON user_achievements
  FOR ALL
  USING (TRUE)
  WITH CHECK (TRUE);

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- Trigger для обновления updated_at
CREATE OR REPLACE FUNCTION update_achievements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_achievements_catalog_updated_at
  BEFORE UPDATE ON achievements_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_achievements_updated_at();

CREATE TRIGGER trigger_user_achievements_updated_at
  BEFORE UPDATE ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_achievements_updated_at();

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Функция для получения прогресса пользователя по всем достижениям
CREATE OR REPLACE FUNCTION get_user_achievements_progress(p_user_id UUID)
RETURNS TABLE (
  achievement_id TEXT,
  name TEXT,
  description TEXT,
  icon TEXT,
  rarity TEXT,
  progress INT,
  earned_at TIMESTAMPTZ,
  is_earned BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ac.id,
    ac.name,
    ac.description,
    ac.icon,
    ac.rarity,
    COALESCE(ua.progress, 0) AS progress,
    ua.earned_at,
    COALESCE(ua.progress, 0) = 100 AS is_earned
  FROM achievements_catalog ac
  LEFT JOIN user_achievements ua ON ua.achievement_id = ac.id AND ua.user_id = p_user_id
  WHERE ac.is_enabled = TRUE
  ORDER BY ac.rarity DESC, ac.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

