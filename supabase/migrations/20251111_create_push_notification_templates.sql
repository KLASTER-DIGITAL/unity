-- Create push_notification_templates table
-- Migration: 20251111_create_push_notification_templates
-- Description: Система управления шаблонами уведомлений с разделением Free/Premium

-- ============================================================================
-- 1. PUSH NOTIFICATION TEMPLATES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS push_notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template identification
  type TEXT NOT NULL UNIQUE CHECK (type IN (
    'daily_reminder',
    'weekly_motivation',
    'goal_reminder',
    'streak_milestone',
    'achievement_unlocked',
    'entry_created',
    'trial_expiry_reminder',
    'subscription_expired',
    'custom'
  )),
  
  -- Template content (default language - Russian)
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT DEFAULT '/icon-192.png',
  
  -- Premium features
  is_premium_only BOOLEAN DEFAULT false,
  is_ai_enabled BOOLEAN DEFAULT false,
  
  -- Variables support (for dynamic content)
  -- Example: ["user_name", "streak_count", "achievement_title"]
  variables TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- i18n support (7 languages: ru, en, es, de, fr, zh, ja)
  translations JSONB DEFAULT '{}'::jsonb,
  -- Example: {
  --   "en": {"title": "Daily Reminder", "body": "Don't forget to write..."},
  --   "es": {"title": "Recordatorio diario", "body": "No olvides escribir..."},
  --   ...
  -- }
  
  -- AI personalization settings (for Premium templates)
  ai_settings JSONB DEFAULT '{}'::jsonb,
  -- Example: {
  --   "tone": "motivational",
  --   "use_behavior_analysis": true,
  --   "use_mood_analysis": true,
  --   "max_length": 120
  -- }
  
  -- Metadata
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- ============================================================================
-- 2. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_templates_type ON push_notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_is_premium ON push_notification_templates(is_premium_only);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON push_notification_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON push_notification_templates(created_at DESC);

-- ============================================================================
-- 3. RLS POLICIES
-- ============================================================================
ALTER TABLE push_notification_templates ENABLE ROW LEVEL SECURITY;

-- Super admins can read all templates
CREATE POLICY "Super admins can read all templates"
ON push_notification_templates FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND profiles.role = 'super_admin'
  )
);

-- Super admins can insert templates
CREATE POLICY "Super admins can insert templates"
ON push_notification_templates FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND profiles.role = 'super_admin'
  )
);

-- Super admins can update templates
CREATE POLICY "Super admins can update templates"
ON push_notification_templates FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND profiles.role = 'super_admin'
  )
);

-- Super admins can delete templates
CREATE POLICY "Super admins can delete templates"
ON push_notification_templates FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid())
    AND profiles.role = 'super_admin'
  )
);

-- ============================================================================
-- 4. TRIGGER FOR UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_push_notification_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_push_notification_templates_updated_at
BEFORE UPDATE ON push_notification_templates
FOR EACH ROW
EXECUTE FUNCTION update_push_notification_templates_updated_at();

-- ============================================================================
-- 5. SEED DEFAULT TEMPLATES
-- ============================================================================
-- FREE templates (доступны всем пользователям)
INSERT INTO push_notification_templates (type, title, body, icon, is_premium_only, is_ai_enabled, variables, translations, description)
VALUES
  -- Daily Reminder (FREE)
  (
    'daily_reminder',
    '📝 Время записать достижения!',
    'Не забудьте записать свои достижения за сегодня',
    '/icon-192.png',
    false,
    false,
    ARRAY[]::TEXT[],
    '{
      "en": {"title": "📝 Time to write achievements!", "body": "Don''t forget to write your achievements for today"},
      "es": {"title": "📝 ¡Hora de escribir logros!", "body": "No olvides escribir tus logros de hoy"},
      "de": {"title": "📝 Zeit, Erfolge aufzuschreiben!", "body": "Vergiss nicht, deine Erfolge von heute aufzuschreiben"},
      "fr": {"title": "📝 Il est temps d''écrire vos réalisations!", "body": "N''oubliez pas d''écrire vos réalisations d''aujourd''hui"},
      "zh": {"title": "📝 记录成就的时间到了！", "body": "别忘了记录今天的成就"},
      "ja": {"title": "📝 成果を記録する時間です！", "body": "今日の成果を記録することを忘れないでください"}
    }'::jsonb,
    'Ежедневное напоминание о записи достижений (FREE)'
  )
ON CONFLICT (type) DO NOTHING;

  ,
  -- Goal Reminder (FREE)
  (
    'goal_reminder',
    '🎯 Проверьте свои цели',
    'Как продвигается работа над вашими целями?',
    '/icon-192.png',
    false,
    false,
    ARRAY[]::TEXT[],
    '{
      "en": {"title": "🎯 Check your goals", "body": "How is your progress on your goals?"},
      "es": {"title": "🎯 Revisa tus objetivos", "body": "¿Cómo va tu progreso en tus objetivos?"},
      "de": {"title": "🎯 Überprüfen Sie Ihre Ziele", "body": "Wie ist Ihr Fortschritt bei Ihren Zielen?"},
      "fr": {"title": "🎯 Vérifiez vos objectifs", "body": "Comment progresse votre travail sur vos objectifs?"},
      "zh": {"title": "🎯 检查你的目标", "body": "你的目标进展如何？"},
      "ja": {"title": "🎯 目標を確認してください", "body": "目標の進捗状況はいかがですか？"}
    }'::jsonb,
    'Напоминание о проверке целей (FREE)'
  ),

  -- Entry Created (FREE)
  (
    'entry_created',
    '✅ Запись сохранена!',
    'Ваша запись успешно добавлена в дневник',
    '/icon-192.png',
    false,
    false,
    ARRAY[]::TEXT[],
    '{
      "en": {"title": "✅ Entry saved!", "body": "Your entry has been successfully added to the diary"},
      "es": {"title": "✅ ¡Entrada guardada!", "body": "Tu entrada se ha añadido correctamente al diario"},
      "de": {"title": "✅ Eintrag gespeichert!", "body": "Ihr Eintrag wurde erfolgreich zum Tagebuch hinzugefügt"},
      "fr": {"title": "✅ Entrée enregistrée!", "body": "Votre entrée a été ajoutée avec succès au journal"},
      "zh": {"title": "✅ 记录已保存！", "body": "您的记录已成功添加到日记中"},
      "ja": {"title": "✅ エントリーが保存されました！", "body": "エントリーが日記に正常に追加されました"}
    }'::jsonb,
    'Уведомление о создании записи (FREE)'
  ),

  -- Weekly Motivation (PREMIUM with AI)
  (
    'weekly_motivation',
    '🌟 Еженедельная мотивация',
    'Продолжайте в том же духе! Вы делаете отличную работу',
    '/icon-192.png',
    true,
    true,
    ARRAY['user_name', 'entries_count', 'streak_count']::TEXT[],
    '{
      "en": {"title": "🌟 Weekly Motivation", "body": "Keep it up! You are doing great work"},
      "es": {"title": "🌟 Motivación semanal", "body": "¡Sigue así! Estás haciendo un gran trabajo"},
      "de": {"title": "🌟 Wöchentliche Motivation", "body": "Weiter so! Sie machen großartige Arbeit"},
      "fr": {"title": "🌟 Motivation hebdomadaire", "body": "Continuez comme ça! Vous faites un excellent travail"},
      "zh": {"title": "🌟 每周激励", "body": "继续保持！你做得很好"},
      "ja": {"title": "🌟 週間モチベーション", "body": "その調子で！素晴らしい仕事をしています"}
    }'::jsonb,
    'Еженедельная мотивация с AI персонализацией (PREMIUM)'
  ),

  -- Streak Milestone (PREMIUM with AI)
  (
    'streak_milestone',
    '🔥 Новый рекорд!',
    'Поздравляем! Вы достигли {streak_count} дней подряд!',
    '/icon-192.png',
    true,
    true,
    ARRAY['user_name', 'streak_count', 'milestone_emoji']::TEXT[],
    '{
      "en": {"title": "🔥 New Record!", "body": "Congratulations! You have reached {streak_count} days in a row!"},
      "es": {"title": "🔥 ¡Nuevo récord!", "body": "¡Felicitaciones! ¡Has alcanzado {streak_count} días seguidos!"},
      "de": {"title": "🔥 Neuer Rekord!", "body": "Glückwunsch! Sie haben {streak_count} Tage in Folge erreicht!"},
      "fr": {"title": "🔥 Nouveau record!", "body": "Félicitations! Vous avez atteint {streak_count} jours d''affilée!"},
      "zh": {"title": "🔥 新纪录！", "body": "恭喜！你已经连续{streak_count}天了！"},
      "ja": {"title": "🔥 新記録！", "body": "おめでとうございます！{streak_count}日連続を達成しました！"}
    }'::jsonb,
    'Уведомление о достижении streak milestone с AI персонализацией (PREMIUM)'
  ),

  -- Achievement Unlocked (PREMIUM with AI)
  (
    'achievement_unlocked',
    '🎉 Новое достижение!',
    'Поздравляем! Вы достигли: {achievement_title}',
    '/icon-192.png',
    true,
    true,
    ARRAY['user_name', 'achievement_title']::TEXT[],
    '{
      "en": {"title": "🎉 New Achievement!", "body": "Congratulations! You have achieved: {achievement_title}"},
      "es": {"title": "🎉 ¡Nuevo logro!", "body": "¡Felicitaciones! Has logrado: {achievement_title}"},
      "de": {"title": "🎉 Neue Errungenschaft!", "body": "Glückwunsch! Sie haben erreicht: {achievement_title}"},
      "fr": {"title": "🎉 Nouvelle réalisation!", "body": "Félicitations! Vous avez atteint: {achievement_title}"},
      "zh": {"title": "🎉 新成就！", "body": "恭喜！你已经达成：{achievement_title}"},
      "ja": {"title": "🎉 新しい実績！", "body": "おめでとうございます！達成しました：{achievement_title}"}
    }'::jsonb,
    'Уведомление о разблокировке достижения с AI персонализацией (PREMIUM)'
  ),

  -- Trial Expiry Reminder (FREE)
  (
    'trial_expiry_reminder',
    '⏰ Trial заканчивается через 3 дня',
    'Ваш Premium trial заканчивается {expiry_date}. Оформите подписку чтобы сохранить доступ!',
    '/icon-192.png',
    false,
    false,
    ARRAY['expiry_date']::TEXT[],
    '{
      "en": {"title": "⏰ Trial ends in 3 days", "body": "Your Premium trial ends on {expiry_date}. Subscribe to keep access!"},
      "es": {"title": "⏰ La prueba termina en 3 días", "body": "Tu prueba Premium termina el {expiry_date}. ¡Suscríbete para mantener el acceso!"},
      "de": {"title": "⏰ Testversion endet in 3 Tagen", "body": "Ihre Premium-Testversion endet am {expiry_date}. Abonnieren Sie, um den Zugang zu behalten!"},
      "fr": {"title": "⏰ L''essai se termine dans 3 jours", "body": "Votre essai Premium se termine le {expiry_date}. Abonnez-vous pour conserver l''accès!"},
      "zh": {"title": "⏰ 试用期将在3天后结束", "body": "您的高级试用期将于{expiry_date}结束。订阅以保持访问权限！"},
      "ja": {"title": "⏰ トライアルは3日後に終了します", "body": "プレミアムトライアルは{expiry_date}に終了します。アクセスを維持するには購読してください！"}
    }'::jsonb,
    'Напоминание об окончании trial (FREE)'
  ),

  -- Subscription Expired (FREE)
  (
    'subscription_expired',
    '❌ Premium подписка истекла',
    'Ваша Premium подписка истекла. Оформите новую подписку чтобы продолжить пользоваться Premium функциями!',
    '/icon-192.png',
    false,
    false,
    ARRAY[]::TEXT[],
    '{
      "en": {"title": "❌ Premium subscription expired", "body": "Your Premium subscription has expired. Subscribe again to continue using Premium features!"},
      "es": {"title": "❌ Suscripción Premium expirada", "body": "Tu suscripción Premium ha expirado. ¡Suscríbete de nuevo para seguir usando las funciones Premium!"},
      "de": {"title": "❌ Premium-Abonnement abgelaufen", "body": "Ihr Premium-Abonnement ist abgelaufen. Abonnieren Sie erneut, um Premium-Funktionen weiterhin zu nutzen!"},
      "fr": {"title": "❌ Abonnement Premium expiré", "body": "Votre abonnement Premium a expiré. Abonnez-vous à nouveau pour continuer à utiliser les fonctionnalités Premium!"},
      "zh": {"title": "❌ 高级订阅已过期", "body": "您的高级订阅已过期。再次订阅以继续使用高级功能！"},
      "ja": {"title": "❌ プレミアムサブスクリプションが期限切れです", "body": "プレミアムサブスクリプションが期限切れになりました。プレミアム機能を引き続き使用するには、再度購読してください！"}
    }'::jsonb,
    'Уведомление об истечении подписки (FREE)'
  )
ON CONFLICT (type) DO NOTHING;

-- Add comment
COMMENT ON TABLE push_notification_templates IS 'Шаблоны push уведомлений с поддержкой Free/Premium и AI персонализации';

