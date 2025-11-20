-- Add missing Kazakh (kk) translations for Settings Screen
-- This migration adds translations for:
-- 1. Notifications section
-- 2. Themes section (basic and premium themes)
-- 3. Security section
-- 4. Offline section
-- 5. Personalization section
-- 6. Additional section
-- 7. Support section

-- Notifications Section
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('kk', 'settings.notifications.title', 'Хабарландырулар', false),
('kk', 'dailyReminders', 'Күнделікті еске салулар', false),
('kk', 'notifications.daily_reminder.description', 'Жазбалар туралы еске салулар', false),
('kk', 'weeklyReports', 'Апталық есептер', false),
('kk', 'notifications.weekly_report.description', 'Апта статистикасы', false),
('kk', 'newAchievements', 'Жаңа жетістіктер', false),
('kk', 'notifications.achievements.description', 'Марапаттар туралы хабарландырулар', false),
('kk', 'motivationalMessages', 'Мотивациялық хабарламалар', false),
('kk', 'notifications.motivational.description', 'Мотивациялық карточкалар', false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET translation_value = EXCLUDED.translation_value;

-- Themes Section
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('kk', 'themes', 'Тақырыптар', false),
('kk', 'settings.themes.basic_themes', 'Негізгі тақырыптар', false),
('kk', 'settings.themes.premium_themes', 'Premium тақырыптар', false),
('kk', 'themes.light.name', 'Ашық', false),
('kk', 'themes.light.description', 'Классикалық ашық тақырып', false),
('kk', 'themes.dark.name', 'Қараңғы', false),
('kk', 'themes.dark.description', 'Классикалық қараңғы тақырып', false),
('kk', 'themes.sunset.name', 'Күн батысы', false),
('kk', 'themes.sunset.description', 'Жылы қызғылт-сары түстер', false),
('kk', 'themes.ocean.name', 'Мұхит', false),
('kk', 'themes.ocean.description', 'Терең көк-көгілдір түстер', false),
('kk', 'themes.forest.name', 'Орман', false),
('kk', 'themes.forest.description', 'Табиғи жасыл түстер', false),
('kk', 'themes.sakura.name', 'Сакура', false),
('kk', 'themes.sakura.description', 'Нәзік қызғылт түстер', false),
('kk', 'themes.night.name', 'Түн', false),
('kk', 'themes.night.description', 'Терең қараңғы түстер', false),
('kk', 'themes.coffee.name', 'Кофе', false),
('kk', 'themes.coffee.description', 'Жылы қоңыр түстер', false),
('kk', 'themes.lavender.name', 'Лаванда', false),
('kk', 'themes.lavender.description', 'Нәзік күлгін түстер', false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET translation_value = EXCLUDED.translation_value;

-- Security Section
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('kk', 'settings.security.title', 'Қауіпсіздік', false),
('kk', 'settings.security.auto_backup', 'Автоматты сақтық көшірме', false),
('kk', 'settings.security.requires_premium', 'Premium қажет', false),
('kk', 'settings.offline.premium_feature', 'Premium функциясы', false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET translation_value = EXCLUDED.translation_value;

-- Offline Section
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('kk', 'settings.offline.title', 'Offline режимі', false),
('kk', 'settings.offline.enable', 'Offline режимін қосу', false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET translation_value = EXCLUDED.translation_value;

-- Personalization Section
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('kk', 'settings.personalization.title', 'Персонализация', false),
('kk', 'settings.personalization.my_categories', 'Менің санаттарым', false),
('kk', 'settings.personalization.manage_categories', 'Жазба санаттарын басқару', false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET translation_value = EXCLUDED.translation_value;

-- Additional Section
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('kk', 'settings.additional.title', 'Қосымша', false),
('kk', 'settings.additional.language', 'Тіл', false),
('kk', 'settings.additional.first_day_of_week', 'Аптаның бірінші күні', false),
('kk', 'settings.additional.sunday', 'Жексенбі', false),
('kk', 'settings.additional.monday', 'Дүйсенбі', false),
('kk', 'settings.additional.export_data', 'Деректерді экспорттау', false),
('kk', 'settings.additional.import_data', 'Деректерді импорттау', false),
('kk', 'settings.additional.restore_from_file', 'Файлдан қалпына келтіру', false),
('kk', 'settings.additional.delete_all_data', 'Барлық деректерді жою', false),
('kk', 'settings.additional.irreversible_action', 'Қайтарылмайтын әрекет', false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET translation_value = EXCLUDED.translation_value;

-- Support Section
INSERT INTO translations (lang_code, translation_key, translation_value, is_ai_translated) VALUES
('kk', 'settings.support.title', 'Қолдау', false),
('kk', 'settings.support.contact', 'Қолдау қызметіне хабарласу', false),
('kk', 'settings.support.write_us', 'Бізге жазыңыз', false),
('kk', 'settings.support.rate_app', 'Қолданбаны бағалау', false),
('kk', 'settings.support.share_feedback', 'Пікір бөлісу', false),
('kk', 'settings.support.report_bug', 'Қате туралы хабарлау', false),
('kk', 'settings.support.help_improve', 'Қолданбаны жақсартуға көмектесіңіз', false),
('kk', 'settings.support.faq', 'FAQ', false),
('kk', 'settings.support.frequently_asked', 'Жиі қойылатын сұрақтар', false),
('kk', 'settings.support.install_app', 'Қолданбаны орнату', false),
('kk', 'settings.support.pwa_to_home', 'PWA басты экранға', false)
ON CONFLICT (lang_code, translation_key) DO UPDATE SET translation_value = EXCLUDED.translation_value;

