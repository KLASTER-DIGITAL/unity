-- ============================================================================
-- CHECK ANALYTICS DATA
-- ============================================================================
-- Проверка данных для аналитики Push Notifications

-- 1. Проверить push_campaigns
SELECT 
  'push_campaigns' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
  COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_count,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
FROM push_campaigns;

-- 2. Проверить push_notification_analytics
SELECT 
  'push_notification_analytics' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
  COUNT(CASE WHEN status = 'opened' THEN 1 END) as opened_count,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count
FROM push_notification_analytics;

-- 3. Проверить usage события
SELECT 
  'usage' as table_name,
  operation_type,
  COUNT(*) as count
FROM usage
WHERE operation_type LIKE 'push_%'
GROUP BY operation_type
ORDER BY count DESC;

-- 4. Проверить последние кампании
SELECT 
  id,
  title,
  status,
  total_recipients,
  total_sent,
  total_delivered,
  total_opened,
  total_failed,
  created_at
FROM push_campaigns
ORDER BY created_at DESC
LIMIT 5;

-- 5. Проверить аналитику за последние 7 дней
SELECT 
  DATE(created_at) as date,
  COUNT(*) FILTER (WHERE operation_type = 'push_delivered') as delivered,
  COUNT(*) FILTER (WHERE operation_type = 'push_opened') as opened,
  COUNT(*) FILTER (WHERE operation_type = 'push_closed') as closed
FROM usage
WHERE operation_type IN ('push_delivered', 'push_opened', 'push_closed')
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

