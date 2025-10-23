-- ============================================================================
-- PWA Test Data Migration
-- ============================================================================
-- Создаёт реалистичные тестовые данные для PWA функциональности:
-- 1. PWA Settings в admin_settings
-- 2. PWA установки для пользователей (pwa_installed = true)
-- 3. Push подписки для активных пользователей
-- 4. Push уведомления история (отправленные уведомления)
-- 5. Usage события (delivered, opened, closed)
-- 6. VAPID Keys для Web Push API
-- ============================================================================

-- 1. Добавляем PWA Settings
INSERT INTO admin_settings (key, value, category, metadata, created_at, updated_at)
VALUES (
  'pwa_settings',
  '{
    "enableNotifications": true,
    "enableOfflineMode": true,
    "enableInstallPrompt": true,
    "installPromptTiming": "after_visits",
    "installPromptVisitsCount": 3,
    "installPromptDelayMinutes": 5,
    "installPromptLocation": "both",
    "installPromptTitle": "pwa.install.title",
    "installPromptDescription": "pwa.install.description",
    "installPromptButtonText": "pwa.install.button",
    "installPromptSkipText": "pwa.install.skip"
  }',
  'pwa',
  '{"description": "PWA configuration settings for install prompt and features"}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- 2. Генерируем VAPID Keys (тестовые, для production нужно сгенерировать реальные)
INSERT INTO admin_settings (key, value, category, metadata, created_at, updated_at)
VALUES
  (
    'vapid_public_key',
    'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U',
    'pwa',
    '{"description": "VAPID public key for Web Push API"}'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'vapid_private_key',
    'UUxI4O8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls',
    'pwa',
    '{"description": "VAPID private key for Web Push API (keep secret!)"}'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (key) DO UPDATE
SET
  value = EXCLUDED.value,
  updated_at = NOW();

-- 3. Помечаем 8 из 15 пользователей как установивших PWA
-- Берём пользователей с наибольшей активностью (last_active)
WITH active_users AS (
  SELECT id
  FROM profiles
  WHERE role = 'user'
  ORDER BY last_active DESC NULLS LAST
  LIMIT 8
)
UPDATE profiles
SET 
  pwa_installed = true,
  updated_at = NOW()
WHERE id IN (SELECT id FROM active_users);

-- 4. Создаём push подписки для 6 из 8 пользователей с PWA
-- (2 пользователя установили PWA, но не подписались на push)
WITH pwa_users AS (
  SELECT id, email
  FROM profiles
  WHERE pwa_installed = true
  ORDER BY last_active DESC NULLS LAST
  LIMIT 6
)
INSERT INTO push_subscriptions (
  user_id,
  endpoint,
  p256dh_key,
  auth_key,
  browser_info,
  is_active,
  created_at,
  updated_at
)
SELECT 
  id,
  'https://fcm.googleapis.com/fcm/send/' || gen_random_uuid()::text,
  encode(gen_random_bytes(65), 'base64'),
  encode(gen_random_bytes(16), 'base64'),
  jsonb_build_object(
    'name', (ARRAY['Chrome', 'Firefox', 'Safari', 'Edge'])[floor(random() * 4 + 1)],
    'version', (floor(random() * 20 + 100))::text,
    'os', (ARRAY['Windows', 'macOS', 'Linux', 'Android', 'iOS'])[floor(random() * 5 + 1)]
  ),
  true,
  NOW() - (random() * interval '30 days'),
  NOW()
FROM pwa_users
ON CONFLICT (user_id) DO NOTHING;

-- 5. Создаём историю отправленных push уведомлений (последние 30 дней)
-- Генерируем 15 отправок с разными датами
INSERT INTO push_notifications_history (
  title,
  body,
  icon,
  total_sent,
  total_delivered,
  total_opened,
  total_failed,
  sent_at,
  created_at
)
SELECT 
  (ARRAY[
    'Новое достижение! 🎉',
    'Время записать успех дня',
    'Не забудьте про цели',
    'Мотивация дня',
    'Ваш прогресс за неделю'
  ])[floor(random() * 5 + 1)],
  (ARRAY[
    'Поздравляем! Вы достигли новой цели',
    'Запишите свои достижения за сегодня',
    'Проверьте свои цели на неделю',
    'Вы на правильном пути! Продолжайте',
    'Посмотрите статистику за последние 7 дней'
  ])[floor(random() * 5 + 1)],
  '/icon-192.png',
  6, -- total_sent (6 подписчиков)
  floor(random() * 2 + 5)::int, -- total_delivered (5-6)
  floor(random() * 3 + 2)::int, -- total_opened (2-4)
  floor(random() * 2)::int, -- total_failed (0-1)
  NOW() - (i || ' days')::interval,
  NOW() - (i || ' days')::interval
FROM generate_series(1, 15) AS i;

-- 6. Создаём usage события для push уведомлений
-- Генерируем события delivered, opened, closed за последние 30 дней
WITH pwa_users AS (
  SELECT id
  FROM profiles
  WHERE pwa_installed = true
  LIMIT 6
),
event_types AS (
  SELECT unnest(ARRAY['push_delivered', 'push_opened', 'push_closed']) AS event_type
),
dates AS (
  SELECT generate_series(
    NOW() - interval '30 days',
    NOW(),
    interval '2 days'
  ) AS event_date
)
INSERT INTO usage (
  user_id,
  operation_type,
  metadata,
  created_at
)
SELECT 
  u.id,
  et.event_type,
  jsonb_build_object(
    'notification_id', gen_random_uuid()::text,
    'browser_info', jsonb_build_object(
      'name', (ARRAY['Chrome', 'Firefox', 'Safari', 'Edge'])[floor(random() * 4 + 1)],
      'version', (floor(random() * 20 + 100))::text,
      'os', (ARRAY['Windows', 'macOS', 'Linux', 'Android', 'iOS'])[floor(random() * 5 + 1)]
    ),
    'timestamp', d.event_date
  ),
  d.event_date
FROM pwa_users u
CROSS JOIN event_types et
CROSS JOIN dates d
WHERE 
  -- Не все события происходят для всех пользователей
  random() > 0.3
  -- opened и closed только если было delivered
  AND (
    et.event_type = 'push_delivered'
    OR (et.event_type IN ('push_opened', 'push_closed') AND random() > 0.5)
  )
ORDER BY d.event_date DESC
LIMIT 200; -- Ограничиваем до 200 событий

-- 7. Добавляем события подписки на push для пользователей с подписками
INSERT INTO usage (
  user_id,
  operation_type,
  metadata,
  created_at
)
SELECT 
  ps.user_id,
  'push_subscribed',
  jsonb_build_object(
    'browser_info', ps.browser_info,
    'timestamp', ps.created_at
  ),
  ps.created_at
FROM push_subscriptions ps
WHERE ps.is_active = true
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Verification Queries (для проверки)
-- ============================================================================

-- Проверяем PWA settings
-- SELECT key, value FROM admin_settings WHERE key = 'pwa_settings';

-- Проверяем VAPID keys
-- SELECT key FROM admin_settings WHERE key IN ('vapid_public_key', 'vapid_private_key');

-- Проверяем PWA установки
-- SELECT COUNT(*) as pwa_installs FROM profiles WHERE pwa_installed = true;

-- Проверяем push подписки
-- SELECT COUNT(*) as push_subscriptions FROM push_subscriptions WHERE is_active = true;

-- Проверяем историю push уведомлений
-- SELECT COUNT(*) as notifications_sent FROM push_notifications_history;

-- Проверяем usage события
-- SELECT operation_type, COUNT(*) as count 
-- FROM usage 
-- WHERE operation_type LIKE 'push_%' 
-- GROUP BY operation_type 
-- ORDER BY count DESC;

-- ============================================================================
-- Expected Results:
-- - pwa_settings: 1 record
-- - VAPID keys: 2 records
-- - PWA installs: 8 users
-- - Push subscriptions: 6 users
-- - Notifications sent: 15 records
-- - Usage events: ~200 records (delivered, opened, closed, subscribed)
-- ============================================================================

