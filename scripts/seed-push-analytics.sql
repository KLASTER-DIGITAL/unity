-- ============================================================================
-- SEED PUSH ANALYTICS DATA
-- ============================================================================
-- Создание тестовых данных для демонстрации аналитики Push Notifications

-- 1. Создать тестовые кампании (последние 30 дней)
INSERT INTO push_campaigns (
  title,
  body,
  target_segment,
  status,
  total_recipients,
  total_sent,
  total_delivered,
  total_opened,
  total_failed,
  created_by,
  created_at,
  sent_at
)
SELECT
  'Тестовая кампания #' || i,
  'Это тестовое уведомление для демонстрации аналитики',
  'all', -- target_segment
  CASE
    WHEN i <= 8 THEN 'sent'
    WHEN i = 9 THEN 'scheduled'
    ELSE 'draft'
  END,
  -- total_recipients (случайное число от 50 до 200)
  50 + floor(random() * 150)::int,
  -- total_sent (90-100% от recipients для sent кампаний)
  CASE WHEN i <= 8 THEN (50 + floor(random() * 150)::int) * (0.9 + random() * 0.1) ELSE 0 END,
  -- total_delivered (85-95% от sent)
  CASE WHEN i <= 8 THEN ((50 + floor(random() * 150)::int) * (0.9 + random() * 0.1)) * (0.85 + random() * 0.1) ELSE 0 END,
  -- total_opened (30-50% от delivered)
  CASE WHEN i <= 8 THEN (((50 + floor(random() * 150)::int) * (0.9 + random() * 0.1)) * (0.85 + random() * 0.1)) * (0.3 + random() * 0.2) ELSE 0 END,
  -- total_failed (5-10% от sent)
  CASE WHEN i <= 8 THEN ((50 + floor(random() * 150)::int) * (0.9 + random() * 0.1)) * (0.05 + random() * 0.05) ELSE 0 END,
  -- created_by (первый super_admin)
  (SELECT id FROM profiles WHERE role = 'super_admin' LIMIT 1),
  -- created_at (последние 30 дней)
  NOW() - (i * interval '3 days'),
  -- sent_at (для sent кампаний)
  CASE WHEN i <= 8 THEN NOW() - (i * interval '3 days') + interval '1 hour' ELSE NULL END
FROM generate_series(1, 10) AS i
ON CONFLICT DO NOTHING;

-- 2. Создать детальную аналитику для каждой кампании
-- Берём первые 3 sent кампании и создаём детальные записи
WITH campaigns AS (
  SELECT id, total_sent, total_delivered, total_opened, total_failed
  FROM push_campaigns
  WHERE status = 'sent'
  ORDER BY created_at DESC
  LIMIT 3
),
users AS (
  SELECT id FROM profiles WHERE role = 'user' LIMIT 20
)
INSERT INTO push_notification_analytics (
  campaign_id,
  user_id,
  status,
  sent_at,
  delivered_at,
  opened_at,
  failed_at,
  error_message,
  device_type,
  browser,
  os
)
SELECT 
  c.id,
  u.id,
  -- Статус (85% delivered, 10% failed, 5% pending)
  CASE 
    WHEN random() < 0.85 THEN 'delivered'
    WHEN random() < 0.95 THEN 'failed'
    ELSE 'pending'
  END,
  -- sent_at
  NOW() - interval '2 days' + (random() * interval '1 hour'),
  -- delivered_at (только для delivered)
  CASE WHEN random() < 0.85 THEN NOW() - interval '2 days' + (random() * interval '1 hour') + interval '5 seconds' ELSE NULL END,
  -- opened_at (30% от delivered)
  CASE WHEN random() < 0.85 AND random() < 0.3 THEN NOW() - interval '2 days' + (random() * interval '1 hour') + interval '1 minute' ELSE NULL END,
  -- failed_at (только для failed)
  CASE WHEN random() >= 0.85 AND random() < 0.95 THEN NOW() - interval '2 days' + (random() * interval '1 hour') + interval '10 seconds' ELSE NULL END,
  -- error_message (только для failed)
  CASE WHEN random() >= 0.85 AND random() < 0.95 THEN 'Push subscription expired' ELSE NULL END,
  -- device_type
  (ARRAY['mobile', 'desktop', 'tablet'])[floor(random() * 3 + 1)],
  -- browser
  (ARRAY['Chrome', 'Firefox', 'Safari', 'Edge'])[floor(random() * 4 + 1)],
  -- os
  (ARRAY['Windows', 'macOS', 'Linux', 'Android', 'iOS'])[floor(random() * 5 + 1)]
FROM campaigns c
CROSS JOIN users u
WHERE random() < 0.7 -- Не все пользователи получают уведомления
LIMIT 150;

-- 3. Обновить счётчики в кампаниях на основе реальных данных
UPDATE push_campaigns pc
SET 
  total_sent = (SELECT COUNT(*) FROM push_notification_analytics WHERE campaign_id = pc.id),
  total_delivered = (SELECT COUNT(*) FROM push_notification_analytics WHERE campaign_id = pc.id AND status = 'delivered'),
  total_opened = (SELECT COUNT(*) FROM push_notification_analytics WHERE campaign_id = pc.id AND opened_at IS NOT NULL),
  total_failed = (SELECT COUNT(*) FROM push_notification_analytics WHERE campaign_id = pc.id AND status = 'failed')
WHERE status = 'sent';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Проверить созданные кампании
SELECT 
  id,
  title,
  status,
  total_recipients,
  total_sent,
  total_delivered,
  total_opened,
  total_failed,
  ROUND(100.0 * total_delivered / NULLIF(total_sent, 0), 1) as delivery_rate,
  ROUND(100.0 * total_opened / NULLIF(total_delivered, 0), 1) as open_rate,
  created_at
FROM push_campaigns
ORDER BY created_at DESC;

-- Проверить аналитику
SELECT 
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN opened_at IS NOT NULL THEN 1 END) as opened_count
FROM push_notification_analytics
GROUP BY status;

