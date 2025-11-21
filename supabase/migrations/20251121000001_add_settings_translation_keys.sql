-- Migration: Add Settings Screen translation keys
-- Date: 2025-11-21
-- Description: Add missing translation keys for Settings Screen sections (Notifications, Themes, Security, Offline, Additional, Support)

-- Insert translation keys for all active languages
-- Languages: ru, en, es, de, fr, zh, ja, kk, ka

-- ============================================
-- NOTIFICATIONS SECTION (15 keys)
-- ============================================

-- settings.notifications.title
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.notifications.title', 'Уведомления', NOW(), NOW(), false, false),
  ('en', 'settings.notifications.title', 'Notifications', NOW(), NOW(), false, false),
  ('es', 'settings.notifications.title', 'Notificaciones', NOW(), NOW(), false, false),
  ('de', 'settings.notifications.title', 'Benachrichtigungen', NOW(), NOW(), false, false),
  ('fr', 'settings.notifications.title', 'Notifications', NOW(), NOW(), false, false),
  ('zh', 'settings.notifications.title', '通知', NOW(), NOW(), false, false),
  ('ja', 'settings.notifications.title', '通知', NOW(), NOW(), false, false),
  ('kk', 'settings.notifications.title', 'Хабарландырулар', NOW(), NOW(), false, false),
  ('ka', 'settings.notifications.title', 'შეტყობინებები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- notifications.daily_reminder.description
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'notifications.daily_reminder.description', 'Напоминания о записях', NOW(), NOW(), false, false),
  ('en', 'notifications.daily_reminder.description', 'Reminders about entries', NOW(), NOW(), false, false),
  ('es', 'notifications.daily_reminder.description', 'Recordatorios sobre entradas', NOW(), NOW(), false, false),
  ('de', 'notifications.daily_reminder.description', 'Erinnerungen an Einträge', NOW(), NOW(), false, false),
  ('fr', 'notifications.daily_reminder.description', 'Rappels sur les entrées', NOW(), NOW(), false, false),
  ('zh', 'notifications.daily_reminder.description', '关于条目的提醒', NOW(), NOW(), false, false),
  ('ja', 'notifications.daily_reminder.description', 'エントリに関するリマインダー', NOW(), NOW(), false, false),
  ('kk', 'notifications.daily_reminder.description', 'Жазбалар туралы еске салулар', NOW(), NOW(), false, false),
  ('ka', 'notifications.daily_reminder.description', 'ჩანაწერების შეხსენებები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- dailyReminders
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'dailyReminders', 'Ежедневные напоминания', NOW(), NOW(), false, false),
  ('en', 'dailyReminders', 'Daily reminders', NOW(), NOW(), false, false),
  ('es', 'dailyReminders', 'Recordatorios diarios', NOW(), NOW(), false, false),
  ('de', 'dailyReminders', 'Tägliche Erinnerungen', NOW(), NOW(), false, false),
  ('fr', 'dailyReminders', 'Rappels quotidiens', NOW(), NOW(), false, false),
  ('zh', 'dailyReminders', '每日提醒', NOW(), NOW(), false, false),
  ('ja', 'dailyReminders', '毎日のリマインダー', NOW(), NOW(), false, false),
  ('kk', 'dailyReminders', 'Күнделікті еске салулар', NOW(), NOW(), false, false),
  ('ka', 'dailyReminders', 'ყოველდღიური შეხსენებები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- notifications.weekly_report.description
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'notifications.weekly_report.description', 'Статистика за неделю', NOW(), NOW(), false, false),
  ('en', 'notifications.weekly_report.description', 'Weekly statistics', NOW(), NOW(), false, false),
  ('es', 'notifications.weekly_report.description', 'Estadísticas semanales', NOW(), NOW(), false, false),
  ('de', 'notifications.weekly_report.description', 'Wöchentliche Statistiken', NOW(), NOW(), false, false),
  ('fr', 'notifications.weekly_report.description', 'Statistiques hebdomadaires', NOW(), NOW(), false, false),
  ('zh', 'notifications.weekly_report.description', '每周统计', NOW(), NOW(), false, false),
  ('ja', 'notifications.weekly_report.description', '週間統計', NOW(), NOW(), false, false),
  ('kk', 'notifications.weekly_report.description', 'Апталық статистика', NOW(), NOW(), false, false),
  ('ka', 'notifications.weekly_report.description', 'ყოველკვირეული სტატისტიკა', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- weeklyReports
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'weeklyReports', 'Еженедельные отчеты', NOW(), NOW(), false, false),
  ('en', 'weeklyReports', 'Weekly reports', NOW(), NOW(), false, false),
  ('es', 'weeklyReports', 'Informes semanales', NOW(), NOW(), false, false),
  ('de', 'weeklyReports', 'Wöchentliche Berichte', NOW(), NOW(), false, false),
  ('fr', 'weeklyReports', 'Rapports hebdomadaires', NOW(), NOW(), false, false),
  ('zh', 'weeklyReports', '每周报告', NOW(), NOW(), false, false),
  ('ja', 'weeklyReports', '週間レポート', NOW(), NOW(), false, false),
  ('kk', 'weeklyReports', 'Апталық есептер', NOW(), NOW(), false, false),
  ('ka', 'weeklyReports', 'ყოველკვირეული ანგარიშები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- notifications.achievements.description
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'notifications.achievements.description', 'Уведомления о наградах', NOW(), NOW(), false, false),
  ('en', 'notifications.achievements.description', 'Achievement notifications', NOW(), NOW(), false, false),
  ('es', 'notifications.achievements.description', 'Notificaciones de logros', NOW(), NOW(), false, false),
  ('de', 'notifications.achievements.description', 'Erfolgsbenachrichtigungen', NOW(), NOW(), false, false),
  ('fr', 'notifications.achievements.description', 'Notifications de réalisations', NOW(), NOW(), false, false),
  ('zh', 'notifications.achievements.description', '成就通知', NOW(), NOW(), false, false),
  ('ja', 'notifications.achievements.description', '実績通知', NOW(), NOW(), false, false),
  ('kk', 'notifications.achievements.description', 'Жетістіктер туралы хабарландырулар', NOW(), NOW(), false, false),
  ('ka', 'notifications.achievements.description', 'მიღწევების შეტყობინებები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- newAchievements
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'newAchievements', 'Новые достижения', NOW(), NOW(), false, false),
  ('en', 'newAchievements', 'New achievements', NOW(), NOW(), false, false),
  ('es', 'newAchievements', 'Nuevos logros', NOW(), NOW(), false, false),
  ('de', 'newAchievements', 'Neue Erfolge', NOW(), NOW(), false, false),
  ('fr', 'newAchievements', 'Nouvelles réalisations', NOW(), NOW(), false, false),
  ('zh', 'newAchievements', '新成就', NOW(), NOW(), false, false),
  ('ja', 'newAchievements', '新しい実績', NOW(), NOW(), false, false),
  ('kk', 'newAchievements', 'Жаңа жетістіктер', NOW(), NOW(), false, false),
  ('ka', 'newAchievements', 'ახალი მიღწევები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- notifications.motivational.description
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'notifications.motivational.description', 'Мотивационные карточки', NOW(), NOW(), false, false),
  ('en', 'notifications.motivational.description', 'Motivational cards', NOW(), NOW(), false, false),
  ('es', 'notifications.motivational.description', 'Tarjetas motivacionales', NOW(), NOW(), false, false),
  ('de', 'notifications.motivational.description', 'Motivationskarten', NOW(), NOW(), false, false),
  ('fr', 'notifications.motivational.description', 'Cartes motivationnelles', NOW(), NOW(), false, false),
  ('zh', 'notifications.motivational.description', '激励卡片', NOW(), NOW(), false, false),
  ('ja', 'notifications.motivational.description', 'モチベーションカード', NOW(), NOW(), false, false),
  ('kk', 'notifications.motivational.description', 'Мотивациялық карточкалар', NOW(), NOW(), false, false),
  ('ka', 'notifications.motivational.description', 'მოტივაციური ბარათები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- motivationalMessages
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'motivationalMessages', 'Мотивационные сообщения', NOW(), NOW(), false, false),
  ('en', 'motivationalMessages', 'Motivational messages', NOW(), NOW(), false, false),
  ('es', 'motivationalMessages', 'Mensajes motivacionales', NOW(), NOW(), false, false),
  ('de', 'motivationalMessages', 'Motivationsnachrichten', NOW(), NOW(), false, false),
  ('fr', 'motivationalMessages', 'Messages motivationnels', NOW(), NOW(), false, false),
  ('zh', 'motivationalMessages', '激励消息', NOW(), NOW(), false, false),
  ('ja', 'motivationalMessages', 'モチベーションメッセージ', NOW(), NOW(), false, false),
  ('kk', 'motivationalMessages', 'Мотивациялық хабарламалар', NOW(), NOW(), false, false),
  ('ka', 'motivationalMessages', 'მოტივაციური შეტყობინებები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- ============================================
-- THEMES SECTION (12 keys)
-- ============================================

-- settings.themes.basic_themes
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.themes.basic_themes', 'Базовые темы', NOW(), NOW(), false, false),
  ('en', 'settings.themes.basic_themes', 'Basic themes', NOW(), NOW(), false, false),
  ('es', 'settings.themes.basic_themes', 'Temas básicos', NOW(), NOW(), false, false),
  ('de', 'settings.themes.basic_themes', 'Grundthemen', NOW(), NOW(), false, false),
  ('fr', 'settings.themes.basic_themes', 'Thèmes de base', NOW(), NOW(), false, false),
  ('zh', 'settings.themes.basic_themes', '基本主题', NOW(), NOW(), false, false),
  ('ja', 'settings.themes.basic_themes', '基本テーマ', NOW(), NOW(), false, false),
  ('kk', 'settings.themes.basic_themes', 'Негізгі тақырыптар', NOW(), NOW(), false, false),
  ('ka', 'settings.themes.basic_themes', 'ძირითადი თემები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.themes.premium_themes
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.themes.premium_themes', 'Premium темы', NOW(), NOW(), false, false),
  ('en', 'settings.themes.premium_themes', 'Premium themes', NOW(), NOW(), false, false),
  ('es', 'settings.themes.premium_themes', 'Temas premium', NOW(), NOW(), false, false),
  ('de', 'settings.themes.premium_themes', 'Premium-Themen', NOW(), NOW(), false, false),
  ('fr', 'settings.themes.premium_themes', 'Thèmes premium', NOW(), NOW(), false, false),
  ('zh', 'settings.themes.premium_themes', '高级主题', NOW(), NOW(), false, false),
  ('ja', 'settings.themes.premium_themes', 'プレミアムテーマ', NOW(), NOW(), false, false),
  ('kk', 'settings.themes.premium_themes', 'Премиум тақырыптар', NOW(), NOW(), false, false),
  ('ka', 'settings.themes.premium_themes', 'პრემიუმ თემები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.themes.no_schemes_available
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.themes.no_schemes_available', 'Нет доступных цветовых схем для этой темы', NOW(), NOW(), false, false),
  ('en', 'settings.themes.no_schemes_available', 'No color schemes available for this theme', NOW(), NOW(), false, false),
  ('es', 'settings.themes.no_schemes_available', 'No hay esquemas de color disponibles para este tema', NOW(), NOW(), false, false),
  ('de', 'settings.themes.no_schemes_available', 'Keine Farbschemata für dieses Thema verfügbar', NOW(), NOW(), false, false),
  ('fr', 'settings.themes.no_schemes_available', 'Aucun schéma de couleurs disponible pour ce thème', NOW(), NOW(), false, false),
  ('zh', 'settings.themes.no_schemes_available', '此主题没有可用的配色方案', NOW(), NOW(), false, false),
  ('ja', 'settings.themes.no_schemes_available', 'このテーマに利用可能なカラースキームがありません', NOW(), NOW(), false, false),
  ('kk', 'settings.themes.no_schemes_available', 'Бұл тақырып үшін қолжетімді түс схемалары жоқ', NOW(), NOW(), false, false),
  ('ka', 'settings.themes.no_schemes_available', 'ამ თემისთვის ფერის სქემები არ არის ხელმისაწვდომი', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- Theme names (from ColorSchemeCard - these are already in theme definitions, but adding for completeness)
-- Note: Theme names are usually stored in theme definitions, but we can add them here for i18n support
-- Skipping individual theme names as they are handled by theme system

-- ============================================
-- SECURITY SECTION (6 keys)
-- ============================================

-- settings.security.title
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.security.title', 'Безопасность', NOW(), NOW(), false, false),
  ('en', 'settings.security.title', 'Security', NOW(), NOW(), false, false),
  ('es', 'settings.security.title', 'Seguridad', NOW(), NOW(), false, false),
  ('de', 'settings.security.title', 'Sicherheit', NOW(), NOW(), false, false),
  ('fr', 'settings.security.title', 'Sécurité', NOW(), NOW(), false, false),
  ('zh', 'settings.security.title', '安全', NOW(), NOW(), false, false),
  ('ja', 'settings.security.title', 'セキュリティ', NOW(), NOW(), false, false),
  ('kk', 'settings.security.title', 'Қауіпсіздік', NOW(), NOW(), false, false),
  ('ka', 'settings.security.title', 'უსაფრთხოება', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.security.requires_premium
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.security.requires_premium', 'Требуется премиум', NOW(), NOW(), false, false),
  ('en', 'settings.security.requires_premium', 'Premium required', NOW(), NOW(), false, false),
  ('es', 'settings.security.requires_premium', 'Se requiere premium', NOW(), NOW(), false, false),
  ('de', 'settings.security.requires_premium', 'Premium erforderlich', NOW(), NOW(), false, false),
  ('fr', 'settings.security.requires_premium', 'Premium requis', NOW(), NOW(), false, false),
  ('zh', 'settings.security.requires_premium', '需要高级版', NOW(), NOW(), false, false),
  ('ja', 'settings.security.requires_premium', 'プレミアムが必要', NOW(), NOW(), false, false),
  ('kk', 'settings.security.requires_premium', 'Премиум қажет', NOW(), NOW(), false, false),
  ('ka', 'settings.security.requires_premium', 'პრემიუმი საჭიროა', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.security.auto_backup
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.security.auto_backup', 'Автоматическое резервирование', NOW(), NOW(), false, false),
  ('en', 'settings.security.auto_backup', 'Automatic backup', NOW(), NOW(), false, false),
  ('es', 'settings.security.auto_backup', 'Respaldo automático', NOW(), NOW(), false, false),
  ('de', 'settings.security.auto_backup', 'Automatische Sicherung', NOW(), NOW(), false, false),
  ('fr', 'settings.security.auto_backup', 'Sauvegarde automatique', NOW(), NOW(), false, false),
  ('zh', 'settings.security.auto_backup', '自动备份', NOW(), NOW(), false, false),
  ('ja', 'settings.security.auto_backup', '自動バックアップ', NOW(), NOW(), false, false),
  ('kk', 'settings.security.auto_backup', 'Автоматты резервтік көшіру', NOW(), NOW(), false, false),
  ('ka', 'settings.security.auto_backup', 'ავტომატური მარქაფი', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.offline.premium_feature (used in SecuritySection)
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.offline.premium_feature', 'Премиум функция', NOW(), NOW(), false, false),
  ('en', 'settings.offline.premium_feature', 'Premium feature', NOW(), NOW(), false, false),
  ('es', 'settings.offline.premium_feature', 'Función premium', NOW(), NOW(), false, false),
  ('de', 'settings.offline.premium_feature', 'Premium-Funktion', NOW(), NOW(), false, false),
  ('fr', 'settings.offline.premium_feature', 'Fonction premium', NOW(), NOW(), false, false),
  ('zh', 'settings.offline.premium_feature', '高级功能', NOW(), NOW(), false, false),
  ('ja', 'settings.offline.premium_feature', 'プレミアム機能', NOW(), NOW(), false, false),
  ('kk', 'settings.offline.premium_feature', 'Премиум функция', NOW(), NOW(), false, false),
  ('ka', 'settings.offline.premium_feature', 'პრემიუმ ფუნქცია', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- ============================================
-- OFFLINE SECTION (already partially covered)
-- ============================================

-- settings.offline.title
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.offline.title', 'Offline режим', NOW(), NOW(), false, false),
  ('en', 'settings.offline.title', 'Offline mode', NOW(), NOW(), false, false),
  ('es', 'settings.offline.title', 'Modo sin conexión', NOW(), NOW(), false, false),
  ('de', 'settings.offline.title', 'Offline-Modus', NOW(), NOW(), false, false),
  ('fr', 'settings.offline.title', 'Mode hors ligne', NOW(), NOW(), false, false),
  ('zh', 'settings.offline.title', '离线模式', NOW(), NOW(), false, false),
  ('ja', 'settings.offline.title', 'オフラインモード', NOW(), NOW(), false, false),
  ('kk', 'settings.offline.title', 'Офлайн режимі', NOW(), NOW(), false, false),
  ('ka', 'settings.offline.title', 'ოფლაინ რეჟიმი', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.offline.enable
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.offline.enable', 'Включить offline режим', NOW(), NOW(), false, false),
  ('en', 'settings.offline.enable', 'Enable offline mode', NOW(), NOW(), false, false),
  ('es', 'settings.offline.enable', 'Activar modo sin conexión', NOW(), NOW(), false, false),
  ('de', 'settings.offline.enable', 'Offline-Modus aktivieren', NOW(), NOW(), false, false),
  ('fr', 'settings.offline.enable', 'Activer le mode hors ligne', NOW(), NOW(), false, false),
  ('zh', 'settings.offline.enable', '启用离线模式', NOW(), NOW(), false, false),
  ('ja', 'settings.offline.enable', 'オフラインモードを有効にする', NOW(), NOW(), false, false),
  ('kk', 'settings.offline.enable', 'Офлайн режимін қосу', NOW(), NOW(), false, false),
  ('ka', 'settings.offline.enable', 'ოფლაინ რეჟიმის ჩართვა', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.offline.settings
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.offline.settings', 'Настройки offline', NOW(), NOW(), false, false),
  ('en', 'settings.offline.settings', 'Offline settings', NOW(), NOW(), false, false),
  ('es', 'settings.offline.settings', 'Configuración sin conexión', NOW(), NOW(), false, false),
  ('de', 'settings.offline.settings', 'Offline-Einstellungen', NOW(), NOW(), false, false),
  ('fr', 'settings.offline.settings', 'Paramètres hors ligne', NOW(), NOW(), false, false),
  ('zh', 'settings.offline.settings', '离线设置', NOW(), NOW(), false, false),
  ('ja', 'settings.offline.settings', 'オフライン設定', NOW(), NOW(), false, false),
  ('kk', 'settings.offline.settings', 'Офлайн баптаулар', NOW(), NOW(), false, false),
  ('ka', 'settings.offline.settings', 'ოფლაინ პარამეტრები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- ============================================
-- ADDITIONAL SECTION (15 keys)
-- ============================================

-- settings.additional.title
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.additional.title', 'Дополнительно', NOW(), NOW(), false, false),
  ('en', 'settings.additional.title', 'Additional', NOW(), NOW(), false, false),
  ('es', 'settings.additional.title', 'Adicional', NOW(), NOW(), false, false),
  ('de', 'settings.additional.title', 'Zusätzlich', NOW(), NOW(), false, false),
  ('fr', 'settings.additional.title', 'Supplémentaire', NOW(), NOW(), false, false),
  ('zh', 'settings.additional.title', '附加', NOW(), NOW(), false, false),
  ('ja', 'settings.additional.title', '追加', NOW(), NOW(), false, false),
  ('kk', 'settings.additional.title', 'Қосымша', NOW(), NOW(), false, false),
  ('ka', 'settings.additional.title', 'დამატებითი', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.additional.language
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.additional.language', 'Язык', NOW(), NOW(), false, false),
  ('en', 'settings.additional.language', 'Language', NOW(), NOW(), false, false),
  ('es', 'settings.additional.language', 'Idioma', NOW(), NOW(), false, false),
  ('de', 'settings.additional.language', 'Sprache', NOW(), NOW(), false, false),
  ('fr', 'settings.additional.language', 'Langue', NOW(), NOW(), false, false),
  ('zh', 'settings.additional.language', '语言', NOW(), NOW(), false, false),
  ('ja', 'settings.additional.language', '言語', NOW(), NOW(), false, false),
  ('kk', 'settings.additional.language', 'Тіл', NOW(), NOW(), false, false),
  ('ka', 'settings.additional.language', 'ენა', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.additional.monday
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.additional.monday', 'Понедельник', NOW(), NOW(), false, false),
  ('en', 'settings.additional.monday', 'Monday', NOW(), NOW(), false, false),
  ('es', 'settings.additional.monday', 'Lunes', NOW(), NOW(), false, false),
  ('de', 'settings.additional.monday', 'Montag', NOW(), NOW(), false, false),
  ('fr', 'settings.additional.monday', 'Lundi', NOW(), NOW(), false, false),
  ('zh', 'settings.additional.monday', '星期一', NOW(), NOW(), false, false),
  ('ja', 'settings.additional.monday', '月曜日', NOW(), NOW(), false, false),
  ('kk', 'settings.additional.monday', 'Дүйсенбі', NOW(), NOW(), false, false),
  ('ka', 'settings.additional.monday', 'ორშაბათი', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.additional.sunday
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.additional.sunday', 'Воскресенье', NOW(), NOW(), false, false),
  ('en', 'settings.additional.sunday', 'Sunday', NOW(), NOW(), false, false),
  ('es', 'settings.additional.sunday', 'Domingo', NOW(), NOW(), false, false),
  ('de', 'settings.additional.sunday', 'Sonntag', NOW(), NOW(), false, false),
  ('fr', 'settings.additional.sunday', 'Dimanche', NOW(), NOW(), false, false),
  ('zh', 'settings.additional.sunday', '星期日', NOW(), NOW(), false, false),
  ('ja', 'settings.additional.sunday', '日曜日', NOW(), NOW(), false, false),
  ('kk', 'settings.additional.sunday', 'Жексенбі', NOW(), NOW(), false, false),
  ('ka', 'settings.additional.sunday', 'კვირა', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.additional.first_day_of_week
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.additional.first_day_of_week', 'Первый день недели', NOW(), NOW(), false, false),
  ('en', 'settings.additional.first_day_of_week', 'First day of week', NOW(), NOW(), false, false),
  ('es', 'settings.additional.first_day_of_week', 'Primer día de la semana', NOW(), NOW(), false, false),
  ('de', 'settings.additional.first_day_of_week', 'Erster Tag der Woche', NOW(), NOW(), false, false),
  ('fr', 'settings.additional.first_day_of_week', 'Premier jour de la semaine', NOW(), NOW(), false, false),
  ('zh', 'settings.additional.first_day_of_week', '一周的第一天', NOW(), NOW(), false, false),
  ('ja', 'settings.additional.first_day_of_week', '週の最初の日', NOW(), NOW(), false, false),
  ('kk', 'settings.additional.first_day_of_week', 'Аптаның бірінші күні', NOW(), NOW(), false, false),
  ('ka', 'settings.additional.first_day_of_week', 'კვირის პირველი დღე', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.additional.export_data
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.additional.export_data', 'Экспортировать данные', NOW(), NOW(), false, false),
  ('en', 'settings.additional.export_data', 'Export data', NOW(), NOW(), false, false),
  ('es', 'settings.additional.export_data', 'Exportar datos', NOW(), NOW(), false, false),
  ('de', 'settings.additional.export_data', 'Daten exportieren', NOW(), NOW(), false, false),
  ('fr', 'settings.additional.export_data', 'Exporter les données', NOW(), NOW(), false, false),
  ('zh', 'settings.additional.export_data', '导出数据', NOW(), NOW(), false, false),
  ('ja', 'settings.additional.export_data', 'データをエクスポート', NOW(), NOW(), false, false),
  ('kk', 'settings.additional.export_data', 'Деректерді экспорттау', NOW(), NOW(), false, false),
  ('ka', 'settings.additional.export_data', 'მონაცემების ექსპორტი', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.additional.import_data
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.additional.import_data', 'Импортировать данные', NOW(), NOW(), false, false),
  ('en', 'settings.additional.import_data', 'Import data', NOW(), NOW(), false, false),
  ('es', 'settings.additional.import_data', 'Importar datos', NOW(), NOW(), false, false),
  ('de', 'settings.additional.import_data', 'Daten importieren', NOW(), NOW(), false, false),
  ('fr', 'settings.additional.import_data', 'Importer les données', NOW(), NOW(), false, false),
  ('zh', 'settings.additional.import_data', '导入数据', NOW(), NOW(), false, false),
  ('ja', 'settings.additional.import_data', 'データをインポート', NOW(), NOW(), false, false),
  ('kk', 'settings.additional.import_data', 'Деректерді импорттау', NOW(), NOW(), false, false),
  ('ka', 'settings.additional.import_data', 'მონაცემების იმპორტი', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.additional.restore_from_file
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.additional.restore_from_file', 'Восстановить из файла', NOW(), NOW(), false, false),
  ('en', 'settings.additional.restore_from_file', 'Restore from file', NOW(), NOW(), false, false),
  ('es', 'settings.additional.restore_from_file', 'Restaurar desde archivo', NOW(), NOW(), false, false),
  ('de', 'settings.additional.restore_from_file', 'Aus Datei wiederherstellen', NOW(), NOW(), false, false),
  ('fr', 'settings.additional.restore_from_file', 'Restaurer depuis un fichier', NOW(), NOW(), false, false),
  ('zh', 'settings.additional.restore_from_file', '从文件恢复', NOW(), NOW(), false, false),
  ('ja', 'settings.additional.restore_from_file', 'ファイルから復元', NOW(), NOW(), false, false),
  ('kk', 'settings.additional.restore_from_file', 'Файлдан қалпына келтіру', NOW(), NOW(), false, false),
  ('ka', 'settings.additional.restore_from_file', 'ფაილიდან აღდგენა', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.additional.delete_all_data
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.additional.delete_all_data', 'Удалить все данные', NOW(), NOW(), false, false),
  ('en', 'settings.additional.delete_all_data', 'Delete all data', NOW(), NOW(), false, false),
  ('es', 'settings.additional.delete_all_data', 'Eliminar todos los datos', NOW(), NOW(), false, false),
  ('de', 'settings.additional.delete_all_data', 'Alle Daten löschen', NOW(), NOW(), false, false),
  ('fr', 'settings.additional.delete_all_data', 'Supprimer toutes les données', NOW(), NOW(), false, false),
  ('zh', 'settings.additional.delete_all_data', '删除所有数据', NOW(), NOW(), false, false),
  ('ja', 'settings.additional.delete_all_data', 'すべてのデータを削除', NOW(), NOW(), false, false),
  ('kk', 'settings.additional.delete_all_data', 'Барлық деректерді жою', NOW(), NOW(), false, false),
  ('ka', 'settings.additional.delete_all_data', 'ყველა მონაცემის წაშლა', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.additional.irreversible_action
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.additional.irreversible_action', 'Необратимое действие', NOW(), NOW(), false, false),
  ('en', 'settings.additional.irreversible_action', 'Irreversible action', NOW(), NOW(), false, false),
  ('es', 'settings.additional.irreversible_action', 'Acción irreversible', NOW(), NOW(), false, false),
  ('de', 'settings.additional.irreversible_action', 'Unwiderrufliche Aktion', NOW(), NOW(), false, false),
  ('fr', 'settings.additional.irreversible_action', 'Action irréversible', NOW(), NOW(), false, false),
  ('zh', 'settings.additional.irreversible_action', '不可逆操作', NOW(), NOW(), false, false),
  ('ja', 'settings.additional.irreversible_action', '元に戻せない操作', NOW(), NOW(), false, false),
  ('kk', 'settings.additional.irreversible_action', 'Қайтымсыз әрекет', NOW(), NOW(), false, false),
  ('ka', 'settings.additional.irreversible_action', 'უკუქცევადი მოქმედება', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- ============================================
-- SUPPORT SECTION (10 keys)
-- ============================================

-- settings.support.title
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.support.title', 'Поддержка', NOW(), NOW(), false, false),
  ('en', 'settings.support.title', 'Support', NOW(), NOW(), false, false),
  ('es', 'settings.support.title', 'Soporte', NOW(), NOW(), false, false),
  ('de', 'settings.support.title', 'Support', NOW(), NOW(), false, false),
  ('fr', 'settings.support.title', 'Support', NOW(), NOW(), false, false),
  ('zh', 'settings.support.title', '支持', NOW(), NOW(), false, false),
  ('ja', 'settings.support.title', 'サポート', NOW(), NOW(), false, false),
  ('kk', 'settings.support.title', 'Қолдау', NOW(), NOW(), false, false),
  ('ka', 'settings.support.title', 'მხარდაჭერა', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.support.contact
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.support.contact', 'Связаться с поддержкой', NOW(), NOW(), false, false),
  ('en', 'settings.support.contact', 'Contact support', NOW(), NOW(), false, false),
  ('es', 'settings.support.contact', 'Contactar con soporte', NOW(), NOW(), false, false),
  ('de', 'settings.support.contact', 'Support kontaktieren', NOW(), NOW(), false, false),
  ('fr', 'settings.support.contact', 'Contacter le support', NOW(), NOW(), false, false),
  ('zh', 'settings.support.contact', '联系支持', NOW(), NOW(), false, false),
  ('ja', 'settings.support.contact', 'サポートに連絡', NOW(), NOW(), false, false),
  ('kk', 'settings.support.contact', 'Қолдаумен байланысу', NOW(), NOW(), false, false),
  ('ka', 'settings.support.contact', 'მხარდაჭერასთან დაკავშირება', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.support.write_us
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.support.write_us', 'Напишите нам', NOW(), NOW(), false, false),
  ('en', 'settings.support.write_us', 'Write to us', NOW(), NOW(), false, false),
  ('es', 'settings.support.write_us', 'Escríbenos', NOW(), NOW(), false, false),
  ('de', 'settings.support.write_us', 'Schreiben Sie uns', NOW(), NOW(), false, false),
  ('fr', 'settings.support.write_us', 'Écrivez-nous', NOW(), NOW(), false, false),
  ('zh', 'settings.support.write_us', '给我们写信', NOW(), NOW(), false, false),
  ('ja', 'settings.support.write_us', 'お問い合わせ', NOW(), NOW(), false, false),
  ('kk', 'settings.support.write_us', 'Бізге жазыңыз', NOW(), NOW(), false, false),
  ('ka', 'settings.support.write_us', 'დაგვიწერეთ', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.support.rate_app
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.support.rate_app', 'Оценить приложение', NOW(), NOW(), false, false),
  ('en', 'settings.support.rate_app', 'Rate the app', NOW(), NOW(), false, false),
  ('es', 'settings.support.rate_app', 'Calificar la aplicación', NOW(), NOW(), false, false),
  ('de', 'settings.support.rate_app', 'App bewerten', NOW(), NOW(), false, false),
  ('fr', 'settings.support.rate_app', 'Noter l''application', NOW(), NOW(), false, false),
  ('zh', 'settings.support.rate_app', '评价应用', NOW(), NOW(), false, false),
  ('ja', 'settings.support.rate_app', 'アプリを評価', NOW(), NOW(), false, false),
  ('kk', 'settings.support.rate_app', 'Қолданбаны бағалау', NOW(), NOW(), false, false),
  ('ka', 'settings.support.rate_app', 'აპლიკაციის შეფასება', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.support.share_feedback
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.support.share_feedback', 'Поделитесь отзывом', NOW(), NOW(), false, false),
  ('en', 'settings.support.share_feedback', 'Share feedback', NOW(), NOW(), false, false),
  ('es', 'settings.support.share_feedback', 'Compartir comentarios', NOW(), NOW(), false, false),
  ('de', 'settings.support.share_feedback', 'Feedback teilen', NOW(), NOW(), false, false),
  ('fr', 'settings.support.share_feedback', 'Partager les commentaires', NOW(), NOW(), false, false),
  ('zh', 'settings.support.share_feedback', '分享反馈', NOW(), NOW(), false, false),
  ('ja', 'settings.support.share_feedback', 'フィードバックを共有', NOW(), NOW(), false, false),
  ('kk', 'settings.support.share_feedback', 'Пікірлермен бөлісу', NOW(), NOW(), false, false),
  ('ka', 'settings.support.share_feedback', 'გამოხმაურების გაზიარება', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.support.report_bug
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.support.report_bug', 'Сообщить об ошибке', NOW(), NOW(), false, false),
  ('en', 'settings.support.report_bug', 'Report a bug', NOW(), NOW(), false, false),
  ('es', 'settings.support.report_bug', 'Reportar un error', NOW(), NOW(), false, false),
  ('de', 'settings.support.report_bug', 'Fehler melden', NOW(), NOW(), false, false),
  ('fr', 'settings.support.report_bug', 'Signaler un bug', NOW(), NOW(), false, false),
  ('zh', 'settings.support.report_bug', '报告错误', NOW(), NOW(), false, false),
  ('ja', 'settings.support.report_bug', 'バグを報告', NOW(), NOW(), false, false),
  ('kk', 'settings.support.report_bug', 'Қате туралы хабарлау', NOW(), NOW(), false, false),
  ('ka', 'settings.support.report_bug', 'შეცდომის შეტყობინება', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.support.help_improve
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.support.help_improve', 'Помогите улучшить приложение', NOW(), NOW(), false, false),
  ('en', 'settings.support.help_improve', 'Help improve the app', NOW(), NOW(), false, false),
  ('es', 'settings.support.help_improve', 'Ayuda a mejorar la aplicación', NOW(), NOW(), false, false),
  ('de', 'settings.support.help_improve', 'Helfen Sie, die App zu verbessern', NOW(), NOW(), false, false),
  ('fr', 'settings.support.help_improve', 'Aidez à améliorer l''application', NOW(), NOW(), false, false),
  ('zh', 'settings.support.help_improve', '帮助改进应用', NOW(), NOW(), false, false),
  ('ja', 'settings.support.help_improve', 'アプリの改善にご協力ください', NOW(), NOW(), false, false),
  ('kk', 'settings.support.help_improve', 'Қолданбаны жақсартуға көмектесіңіз', NOW(), NOW(), false, false),
  ('ka', 'settings.support.help_improve', 'დაგვეხმარეთ აპლიკაციის გაუმჯობესებაში', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.support.feedback_error
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.support.feedback_error', 'Не удалось открыть форму обратной связи', NOW(), NOW(), false, false),
  ('en', 'settings.support.feedback_error', 'Failed to open feedback form', NOW(), NOW(), false, false),
  ('es', 'settings.support.feedback_error', 'No se pudo abrir el formulario de comentarios', NOW(), NOW(), false, false),
  ('de', 'settings.support.feedback_error', 'Feedback-Formular konnte nicht geöffnet werden', NOW(), NOW(), false, false),
  ('fr', 'settings.support.feedback_error', 'Impossible d''ouvrir le formulaire de commentaires', NOW(), NOW(), false, false),
  ('zh', 'settings.support.feedback_error', '无法打开反馈表单', NOW(), NOW(), false, false),
  ('ja', 'settings.support.feedback_error', 'フィードバックフォームを開けませんでした', NOW(), NOW(), false, false),
  ('kk', 'settings.support.feedback_error', 'Пікірлер формасын ашу мүмкін болмады', NOW(), NOW(), false, false),
  ('ka', 'settings.support.feedback_error', 'გამოხმაურების ფორმის გახსნა ვერ მოხერხდა', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.support.faq
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.support.faq', 'FAQ', NOW(), NOW(), false, false),
  ('en', 'settings.support.faq', 'FAQ', NOW(), NOW(), false, false),
  ('es', 'settings.support.faq', 'Preguntas frecuentes', NOW(), NOW(), false, false),
  ('de', 'settings.support.faq', 'FAQ', NOW(), NOW(), false, false),
  ('fr', 'settings.support.faq', 'FAQ', NOW(), NOW(), false, false),
  ('zh', 'settings.support.faq', '常见问题', NOW(), NOW(), false, false),
  ('ja', 'settings.support.faq', 'よくある質問', NOW(), NOW(), false, false),
  ('kk', 'settings.support.faq', 'Жиі қойылатын сұрақтар', NOW(), NOW(), false, false),
  ('ka', 'settings.support.faq', 'ხშირად დასმული კითხვები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.support.faq_description
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.support.faq_description', 'Часто задаваемые вопросы', NOW(), NOW(), false, false),
  ('en', 'settings.support.faq_description', 'Frequently asked questions', NOW(), NOW(), false, false),
  ('es', 'settings.support.faq_description', 'Preguntas frecuentes', NOW(), NOW(), false, false),
  ('de', 'settings.support.faq_description', 'Häufig gestellte Fragen', NOW(), NOW(), false, false),
  ('fr', 'settings.support.faq_description', 'Questions fréquemment posées', NOW(), NOW(), false, false),
  ('zh', 'settings.support.faq_description', '常见问题', NOW(), NOW(), false, false),
  ('ja', 'settings.support.faq_description', 'よくある質問', NOW(), NOW(), false, false),
  ('kk', 'settings.support.faq_description', 'Жиі қойылатын сұрақтар', NOW(), NOW(), false, false),
  ('ka', 'settings.support.faq_description', 'ხშირად დასმული კითხვები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.support.install_app
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.support.install_app', 'Установить приложение', NOW(), NOW(), false, false),
  ('en', 'settings.support.install_app', 'Install app', NOW(), NOW(), false, false),
  ('es', 'settings.support.install_app', 'Instalar aplicación', NOW(), NOW(), false, false),
  ('de', 'settings.support.install_app', 'App installieren', NOW(), NOW(), false, false),
  ('fr', 'settings.support.install_app', 'Installer l''application', NOW(), NOW(), false, false),
  ('zh', 'settings.support.install_app', '安装应用', NOW(), NOW(), false, false),
  ('ja', 'settings.support.install_app', 'アプリをインストール', NOW(), NOW(), false, false),
  ('kk', 'settings.support.install_app', 'Қолданбаны орнату', NOW(), NOW(), false, false),
  ('ka', 'settings.support.install_app', 'აპლიკაციის დაყენება', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- settings.support.pwa_to_home
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'settings.support.pwa_to_home', 'PWA на главный экран', NOW(), NOW(), false, false),
  ('en', 'settings.support.pwa_to_home', 'PWA to home screen', NOW(), NOW(), false, false),
  ('es', 'settings.support.pwa_to_home', 'PWA a la pantalla de inicio', NOW(), NOW(), false, false),
  ('de', 'settings.support.pwa_to_home', 'PWA zum Startbildschirm', NOW(), NOW(), false, false),
  ('fr', 'settings.support.pwa_to_home', 'PWA sur l''écran d''accueil', NOW(), NOW(), false, false),
  ('zh', 'settings.support.pwa_to_home', 'PWA 到主屏幕', NOW(), NOW(), false, false),
  ('ja', 'settings.support.pwa_to_home', 'ホーム画面にPWA', NOW(), NOW(), false, false),
  ('kk', 'settings.support.pwa_to_home', 'PWA басты экранға', NOW(), NOW(), false, false),
  ('ka', 'settings.support.pwa_to_home', 'PWA მთავარ ეკრანზე', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

-- ============================================
-- ADDITIONAL: themes key (used in SettingsScreen.tsx line 264)
-- ============================================

-- themes (used in SettingsScreen.tsx)
INSERT INTO translations (lang_code, translation_key, translation_value, created_at, updated_at, is_ai_translated, needs_review)
VALUES
  ('ru', 'themes', 'Темы оформления', NOW(), NOW(), false, false),
  ('en', 'themes', 'Themes', NOW(), NOW(), false, false),
  ('es', 'themes', 'Temas', NOW(), NOW(), false, false),
  ('de', 'themes', 'Themen', NOW(), NOW(), false, false),
  ('fr', 'themes', 'Thèmes', NOW(), NOW(), false, false),
  ('zh', 'themes', '主题', NOW(), NOW(), false, false),
  ('ja', 'themes', 'テーマ', NOW(), NOW(), false, false),
  ('kk', 'themes', 'Тақырыптар', NOW(), NOW(), false, false),
  ('ka', 'themes', 'თემები', NOW(), NOW(), false, false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET
  translation_value = EXCLUDED.translation_value,
  updated_at = NOW();

