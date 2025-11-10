-- Migration: Fix VAPID Public Key RLS Policy
-- Date: 2025-11-10
-- Description: Разрешить ВСЕМ пользователям читать vapid_public_key из admin_settings
--
-- ПРОБЛЕМА:
-- - Push уведомления НЕ работают для обычных пользователей
-- - Ошибка 406 при запросе vapid_public_key
-- - RLS политика разрешает читать ТОЛЬКО pwa_settings
--
-- РЕШЕНИЕ:
-- - Добавить vapid_public_key в список разрешенных ключей
-- - VAPID public key это публичный ключ, не секрет!
-- - Безопасно разрешить всем пользователям читать его

-- ============================================================================
-- PART 1: Update RLS Policy для admin_settings
-- ============================================================================

-- Удаляем старую политику
DROP POLICY IF EXISTS "admin_settings_select_policy" ON public.admin_settings;

-- Создаем новую политику с vapid_public_key
CREATE POLICY "admin_settings_select_policy" ON public.admin_settings
FOR SELECT TO authenticated
USING (
  -- Super admins могут читать ВСЕ настройки
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'super_admin'
  )
  OR
  -- Обычные пользователи могут читать ТОЛЬКО публичные настройки
  key IN ('pwa_settings', 'vapid_public_key')
);

-- ============================================================================
-- PART 2: Добавить политику для anon пользователей (для PWA)
-- ============================================================================

-- Обновляем политику для anon пользователей
DROP POLICY IF EXISTS "anon_read_pwa_settings" ON public.admin_settings;

CREATE POLICY "anon_read_public_settings" ON public.admin_settings
FOR SELECT TO anon
USING (
  -- Anon пользователи могут читать ТОЛЬКО публичные настройки
  key IN ('pwa_settings', 'vapid_public_key')
);

-- ============================================================================
-- PART 3: Проверка
-- ============================================================================

-- Проверяем что vapid_public_key существует
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM admin_settings WHERE key = 'vapid_public_key'
  ) THEN
    RAISE WARNING 'VAPID public key not found in admin_settings! Please add it manually.';
  ELSE
    RAISE NOTICE 'VAPID public key found in admin_settings ✅';
  END IF;
END $$;

