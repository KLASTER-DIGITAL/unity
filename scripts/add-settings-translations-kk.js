#!/usr/bin/env node

/**
 * Add missing Kazakh (kk) translations for Settings Screen
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_SERVICE_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA1ODY5NCwiZXhwIjoyMDc1NjM0Njk0fQ.Tzl9W5L7GrqZPxV2Hg7CKUvWSS7jPk4EeQGlapYOCDY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const translations = [
	// Notifications Section
	{
		lang_code: 'kk',
		translation_key: 'settings.notifications.title',
		translation_value: 'Хабарландырулар',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'dailyReminders',
		translation_value: 'Күнделікті еске салулар',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'notifications.daily_reminder.description',
		translation_value: 'Жазбалар туралы еске салулар',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'weeklyReports',
		translation_value: 'Апталық есептер',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'notifications.weekly_report.description',
		translation_value: 'Апта статистикасы',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'newAchievements',
		translation_value: 'Жаңа жетістіктер',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'notifications.achievements.description',
		translation_value: 'Марапаттар туралы хабарландырулар',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'motivationalMessages',
		translation_value: 'Мотивациялық хабарламалар',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'notifications.motivational.description',
		translation_value: 'Мотивациялық карточкалар',
		is_ai_translated: false,
	},

	// Themes Section
	{
		lang_code: 'kk',
		translation_key: 'themes',
		translation_value: 'Тақырыптар',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.themes.basic_themes',
		translation_value: 'Негізгі тақырыптар',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.themes.premium_themes',
		translation_value: 'Premium тақырыптар',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.light.name',
		translation_value: 'Ашық',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.light.description',
		translation_value: 'Классикалық ашық тақырып',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.dark.name',
		translation_value: 'Қараңғы',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.dark.description',
		translation_value: 'Классикалық қараңғы тақырып',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.sunset.name',
		translation_value: 'Күн батысы',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.sunset.description',
		translation_value: 'Жылы қызғылт-сары түстер',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.ocean.name',
		translation_value: 'Мұхит',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.ocean.description',
		translation_value: 'Терең көк-көгілдір түстер',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.forest.name',
		translation_value: 'Орман',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.forest.description',
		translation_value: 'Табиғи жасыл түстер',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.sakura.name',
		translation_value: 'Сакура',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.sakura.description',
		translation_value: 'Нәзік қызғылт түстер',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.night.name',
		translation_value: 'Түн',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.night.description',
		translation_value: 'Терең қараңғы түстер',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.coffee.name',
		translation_value: 'Кофе',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.coffee.description',
		translation_value: 'Жылы қоңыр түстер',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.lavender.name',
		translation_value: 'Лаванда',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'themes.lavender.description',
		translation_value: 'Нәзік күлгін түстер',
		is_ai_translated: false,
	},

	// Security Section
	{
		lang_code: 'kk',
		translation_key: 'settings.security.title',
		translation_value: 'Қауіпсіздік',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.security.auto_backup',
		translation_value: 'Автоматты сақтық көшірме',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.security.requires_premium',
		translation_value: 'Premium қажет',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.offline.premium_feature',
		translation_value: 'Premium функциясы',
		is_ai_translated: false,
	},

	// Offline Section
	{
		lang_code: 'kk',
		translation_key: 'settings.offline.title',
		translation_value: 'Offline режимі',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.offline.enable',
		translation_value: 'Offline режимін қосу',
		is_ai_translated: false,
	},

	// Personalization Section
	{
		lang_code: 'kk',
		translation_key: 'settings.personalization.title',
		translation_value: 'Персонализация',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.personalization.my_categories',
		translation_value: 'Менің санаттарым',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.personalization.manage_categories',
		translation_value: 'Жазба санаттарын басқару',
		is_ai_translated: false,
	},

	// Additional Section
	{
		lang_code: 'kk',
		translation_key: 'settings.additional.title',
		translation_value: 'Қосымша',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.additional.language',
		translation_value: 'Тіл',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.additional.first_day_of_week',
		translation_value: 'Аптаның бірінші күні',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.additional.sunday',
		translation_value: 'Жексенбі',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.additional.monday',
		translation_value: 'Дүйсенбі',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.additional.export_data',
		translation_value: 'Деректерді экспорттау',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.additional.import_data',
		translation_value: 'Деректерді импорттау',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.additional.restore_from_file',
		translation_value: 'Файлдан қалпына келтіру',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.additional.delete_all_data',
		translation_value: 'Барлық деректерді жою',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.additional.irreversible_action',
		translation_value: 'Қайтарылмайтын әрекет',
		is_ai_translated: false,
	},

	// Support Section
	{
		lang_code: 'kk',
		translation_key: 'settings.support.title',
		translation_value: 'Қолдау',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.support.contact',
		translation_value: 'Қолдау қызметіне хабарласу',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.support.write_us',
		translation_value: 'Бізге жазыңыз',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.support.rate_app',
		translation_value: 'Қолданбаны бағалау',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.support.share_feedback',
		translation_value: 'Пікір бөлісу',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.support.report_bug',
		translation_value: 'Қате туралы хабарлау',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.support.help_improve',
		translation_value: 'Қолданбаны жақсартуға көмектесіңіз',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.support.faq',
		translation_value: 'FAQ',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.support.frequently_asked',
		translation_value: 'Жиі қойылатын сұрақтар',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.support.install_app',
		translation_value: 'Қолданбаны орнату',
		is_ai_translated: false,
	},
	{
		lang_code: 'kk',
		translation_key: 'settings.support.pwa_to_home',
		translation_value: 'PWA басты экранға',
		is_ai_translated: false,
	},
];

async function main() {
	console.log(`[ADD-SETTINGS-TRANSLATIONS] Adding ${translations.length} translations`);

	try {
		// Upsert translations (insert or update if exists)
		const { data, error } = await supabase
			.from('translations')
			.upsert(translations, {
				onConflict: 'lang_code,translation_key',
			})
			.select();

		if (error) {
			console.error('[ADD-SETTINGS-TRANSLATIONS] ❌ Error:', error);
			process.exit(1);
		}

		console.log('[ADD-SETTINGS-TRANSLATIONS] ✅ Added/updated translations:', data.length);
		console.log('[ADD-SETTINGS-TRANSLATIONS] ✅ Done!');
	} catch (error) {
		console.error('[ADD-SETTINGS-TRANSLATIONS] ❌ Unexpected error:', error);
		process.exit(1);
	}
}

main();
