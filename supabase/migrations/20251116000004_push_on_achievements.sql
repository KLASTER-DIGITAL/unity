-- ============================================================================
-- Push Notifications для Achievements
-- ============================================================================
-- Дата: 2025-11-16
-- Описание: Database trigger и webhook для отправки push при получении достижений
-- 
-- Типы push:
-- 1. achievement_unlocked - когда progress достигает 100% (новое достижение)
-- 2. achievement_near - когда progress достигает 70-90% (близко к достижению)
--
-- ============================================================================

-- ============================================================================
-- 1. FUNCTION для отправки webhook при изменении достижений
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_achievement_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_webhook_url TEXT;
  v_service_key TEXT;
  v_should_notify BOOLEAN := FALSE;
  v_notification_type TEXT;
BEGIN
  -- Получаем URL webhook и service key из настроек
  v_webhook_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/push-on-achievement';
  v_service_key := current_setting('app.settings.service_role_key', true);

  -- Определяем нужно ли отправлять уведомление
  IF TG_OP = 'INSERT' THEN
    -- Новая запись: проверяем прогресс
    IF NEW.progress >= 100 THEN
      v_should_notify := TRUE;
      v_notification_type := 'achievement_unlocked';
    ELSIF NEW.progress >= 70 AND NEW.progress < 100 THEN
      v_should_notify := TRUE;
      v_notification_type := 'achievement_near';
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Обновление: проверяем изменение прогресса
    IF OLD.progress < 100 AND NEW.progress >= 100 THEN
      -- Достижение только что получено
      v_should_notify := TRUE;
      v_notification_type := 'achievement_unlocked';
    ELSIF OLD.progress < 70 AND NEW.progress >= 70 AND NEW.progress < 100 THEN
      -- Прогресс достиг 70-90%
      v_should_notify := TRUE;
      v_notification_type := 'achievement_near';
    END IF;
  END IF;

  -- Отправляем webhook если нужно
  IF v_should_notify THEN
    PERFORM net.http_post(
      url := v_webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'record', row_to_json(NEW),
        'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        'notification_type', v_notification_type
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 2. TRIGGER на user_achievements
-- ============================================================================

-- Удаляем старый trigger если существует
DROP TRIGGER IF EXISTS trigger_notify_achievement_progress ON user_achievements;

-- Создаем новый trigger
CREATE TRIGGER trigger_notify_achievement_progress
  AFTER INSERT OR UPDATE ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION notify_achievement_progress();

-- ============================================================================
-- 3. КОММЕНТАРИИ
-- ============================================================================

COMMENT ON FUNCTION notify_achievement_progress() IS 'Отправляет webhook в push-on-achievement Edge Function при получении достижений или прогрессе 70-90%';
COMMENT ON TRIGGER trigger_notify_achievement_progress ON user_achievements IS 'Триггер для отправки push уведомлений при изменении прогресса достижений';

-- ============================================================================
-- 4. WEBHOOK CONFIGURATION (создается вручную через Supabase Dashboard)
-- ============================================================================

-- Webhook Name: push_on_achievement
-- Table: user_achievements
-- Events: INSERT, UPDATE
-- Type: HTTP Request
-- Method: POST
-- URL: https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-on-achievement
-- Headers:
--   Content-Type: application/json
--   Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
--
-- Примечание: Webhook создается автоматически через trigger выше,
-- но можно также создать через Dashboard для дополнительного контроля

