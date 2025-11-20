#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const supabaseKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODkxNTY3MSwiZXhwIjoyMDQ0NDkxNjcxfQ.Y5p3yqHwUQGJbJPQZ_EYdJLqJZQJYqJZQJYqJZQJYqI';

const supabase = createClient(supabaseUrl, supabaseKey);

// Все переводы разбиты на части
const translations = [
	// Support Section
	{ lang: 'ru', key: 'settings.support.title', value: 'Поддержка' },
	{ lang: 'en', key: 'settings.support.title', value: 'Support' },
	{ lang: 'kk', key: 'settings.support.title', value: 'Қолдау' },
	{ lang: 'es', key: 'settings.support.title', value: 'Soporte' },
	{ lang: 'de', key: 'settings.support.title', value: 'Unterstützung' },
	{ lang: 'fr', key: 'settings.support.title', value: 'Support' },
	{ lang: 'zh', key: 'settings.support.title', value: '支持' },
	{ lang: 'ja', key: 'settings.support.title', value: 'サポート' },
	{ lang: 'ka', key: 'settings.support.title', value: 'მხარდაჭერა' },

	{ lang: 'ru', key: 'settings.support.contact', value: 'Связаться с поддержкой' },
	{ lang: 'en', key: 'settings.support.contact', value: 'Contact support' },
	{ lang: 'kk', key: 'settings.support.contact', value: 'Қолдау қызметіне хабарласу' },
	{ lang: 'es', key: 'settings.support.contact', value: 'Contactar soporte' },
	{ lang: 'de', key: 'settings.support.contact', value: 'Support kontaktieren' },
	{ lang: 'fr', key: 'settings.support.contact', value: 'Contacter le support' },
	{ lang: 'zh', key: 'settings.support.contact', value: '联系支持' },
	{ lang: 'ja', key: 'settings.support.contact', value: 'サポートに連絡' },
	{ lang: 'ka', key: 'settings.support.contact', value: 'მხარდაჭერის დაკავშირება' },

	{ lang: 'ru', key: 'settings.support.write_us', value: 'Напишите нам' },
	{ lang: 'en', key: 'settings.support.write_us', value: 'Write to us' },
	{ lang: 'kk', key: 'settings.support.write_us', value: 'Бізге жазыңыз' },
	{ lang: 'es', key: 'settings.support.write_us', value: 'Escríbenos' },
	{ lang: 'de', key: 'settings.support.write_us', value: 'Schreiben Sie uns' },
	{ lang: 'fr', key: 'settings.support.write_us', value: 'Écrivez-nous' },
	{ lang: 'zh', key: 'settings.support.write_us', value: '写信给我们' },
	{ lang: 'ja', key: 'settings.support.write_us', value: 'お問い合わせ' },
	{ lang: 'ka', key: 'settings.support.write_us', value: 'დაგვწერეთ ჩვენ' },

	{ lang: 'ru', key: 'settings.support.rate_app', value: 'Оценить приложение' },
	{ lang: 'en', key: 'settings.support.rate_app', value: 'Rate app' },
	{ lang: 'kk', key: 'settings.support.rate_app', value: 'Қолданбаны бағалау' },
	{ lang: 'es', key: 'settings.support.rate_app', value: 'Calificar app' },
	{ lang: 'de', key: 'settings.support.rate_app', value: 'App bewerten' },
	{ lang: 'fr', key: 'settings.support.rate_app', value: 'Évaluer app' },
	{ lang: 'zh', key: 'settings.support.rate_app', value: '评价应用' },
	{ lang: 'ja', key: 'settings.support.rate_app', value: 'アプリを評価' },
	{ lang: 'ka', key: 'settings.support.rate_app', value: 'აპლიკაციის შეფასება' },

	{ lang: 'ru', key: 'settings.support.share_feedback', value: 'Поделитесь отзывом' },
	{ lang: 'en', key: 'settings.support.share_feedback', value: 'Share feedback' },
	{ lang: 'kk', key: 'settings.support.share_feedback', value: 'Пікір қалдырыңыз' },
	{ lang: 'es', key: 'settings.support.share_feedback', value: 'Compartir opinión' },
	{ lang: 'de', key: 'settings.support.share_feedback', value: 'Feedback teilen' },
	{ lang: 'fr', key: 'settings.support.share_feedback', value: 'Partager avis' },
	{ lang: 'zh', key: 'settings.support.share_feedback', value: '分享反馈' },
	{ lang: 'ja', key: 'settings.support.share_feedback', value: 'フィードバックを共有' },
	{ lang: 'ka', key: 'settings.support.share_feedback', value: 'გაზიარება გამოხმაურება' },

	{ lang: 'ru', key: 'settings.support.report_bug', value: 'Сообщить об ошибке' },
	{ lang: 'en', key: 'settings.support.report_bug', value: 'Report bug' },
	{ lang: 'kk', key: 'settings.support.report_bug', value: 'Қате туралы хабарлау' },
	{ lang: 'es', key: 'settings.support.report_bug', value: 'Reportar error' },
	{ lang: 'de', key: 'settings.support.report_bug', value: 'Fehler melden' },
	{ lang: 'fr', key: 'settings.support.report_bug', value: 'Signaler bug' },
	{ lang: 'zh', key: 'settings.support.report_bug', value: '报告错误' },
	{ lang: 'ja', key: 'settings.support.report_bug', value: 'バグを報告' },
	{ lang: 'ka', key: 'settings.support.report_bug', value: 'შეცდომის მოხსენება' },

	{ lang: 'ru', key: 'settings.support.help_improve', value: 'Помогите улучшить приложение' },
	{ lang: 'en', key: 'settings.support.help_improve', value: 'Help improve app' },
	{ lang: 'kk', key: 'settings.support.help_improve', value: 'Қолданбаны жақсартуға көмектесіңіз' },
	{ lang: 'es', key: 'settings.support.help_improve', value: 'Ayuda a mejorar app' },
	{ lang: 'de', key: 'settings.support.help_improve', value: 'App verbessern helfen' },
	{ lang: 'fr', key: 'settings.support.help_improve', value: 'Aider à améliorer app' },
	{ lang: 'zh', key: 'settings.support.help_improve', value: '帮助改进应用' },
	{ lang: 'ja', key: 'settings.support.help_improve', value: 'アプリ改善を手伝う' },
	{ lang: 'ka', key: 'settings.support.help_improve', value: 'დაეხმარეთ აპლიკაციის გაუმჯობესებას' },

	{ lang: 'ru', key: 'settings.support.faq', value: 'FAQ' },
	{ lang: 'en', key: 'settings.support.faq', value: 'FAQ' },
	{ lang: 'kk', key: 'settings.support.faq', value: 'Жиі қойылатын сұрақтар' },
	{ lang: 'es', key: 'settings.support.faq', value: 'Preguntas frecuentes' },
	{ lang: 'de', key: 'settings.support.faq', value: 'Häufige Fragen' },
	{ lang: 'fr', key: 'settings.support.faq', value: 'Questions fréquentes' },
	{ lang: 'zh', key: 'settings.support.faq', value: '常见问题' },
	{ lang: 'ja', key: 'settings.support.faq', value: 'よくある質問' },
	{ lang: 'ka', key: 'settings.support.faq', value: 'ხშირად დასმული კითხვები' },

	{ lang: 'ru', key: 'settings.support.faq_description', value: 'Часто задаваемые вопросы' },
	{ lang: 'en', key: 'settings.support.faq_description', value: 'Frequently asked questions' },
	{ lang: 'kk', key: 'settings.support.faq_description', value: 'Жиі қойылатын сұрақтар' },
	{ lang: 'es', key: 'settings.support.faq_description', value: 'Preguntas frecuentes' },
	{ lang: 'de', key: 'settings.support.faq_description', value: 'Häufig gestellte Fragen' },
	{ lang: 'fr', key: 'settings.support.faq_description', value: 'Questions fréquemment posées' },
	{ lang: 'zh', key: 'settings.support.faq_description', value: '常见问题解答' },
	{ lang: 'ja', key: 'settings.support.faq_description', value: 'よくある質問' },
	{ lang: 'ka', key: 'settings.support.faq_description', value: 'ხშირად დასმული კითხვები' },

	{ lang: 'ru', key: 'settings.support.install_app', value: 'Установить приложение' },
	{ lang: 'en', key: 'settings.support.install_app', value: 'Install app' },
	{ lang: 'kk', key: 'settings.support.install_app', value: 'Қолданбаны орнату' },
	{ lang: 'es', key: 'settings.support.install_app', value: 'Instalar app' },
	{ lang: 'de', key: 'settings.support.install_app', value: 'App installieren' },
	{ lang: 'fr', key: 'settings.support.install_app', value: 'Installer app' },
	{ lang: 'zh', key: 'settings.support.install_app', value: '安装应用' },
	{ lang: 'ja', key: 'settings.support.install_app', value: 'アプリをインストール' },
	{ lang: 'ka', key: 'settings.support.install_app', value: 'აპლიკაციის დაყენება' },

	{ lang: 'ru', key: 'settings.support.pwa_to_home', value: 'PWA на главный экран' },
	{ lang: 'en', key: 'settings.support.pwa_to_home', value: 'PWA to home screen' },
	{ lang: 'kk', key: 'settings.support.pwa_to_home', value: 'PWA басты экранға' },
	{ lang: 'es', key: 'settings.support.pwa_to_home', value: 'PWA a pantalla principal' },
	{ lang: 'de', key: 'settings.support.pwa_to_home', value: 'PWA zum Startbildschirm' },
	{ lang: 'fr', key: 'settings.support.pwa_to_home', value: 'PWA sur écran accueil' },
	{ lang: 'zh', key: 'settings.support.pwa_to_home', value: 'PWA到主屏幕' },
	{ lang: 'ja', key: 'settings.support.pwa_to_home', value: 'PWAをホーム画面に' },
	{ lang: 'ka', key: 'settings.support.pwa_to_home', value: 'PWA მთავარ ეკრანზე' },
];

async function insertTranslations() {
	console.log(`📊 Начинаю добавление ${translations.length} переводов...`);

	let successCount = 0;
	let errorCount = 0;

	// Вставляем по одному для надежности
	for (const t of translations) {
		const { error } = await supabase.from('translations').upsert(
			{
				lang_code: t.lang,
				translation_key: t.key,
				translation_value: t.value,
				is_ai_translated: false,
				updated_at: new Date().toISOString(),
			},
			{
				onConflict: 'lang_code,translation_key',
			}
		);

		if (error) {
			console.error(`❌ Ошибка для ${t.key} (${t.lang}):`, error.message);
			errorCount++;
		} else {
			successCount++;
			if (successCount % 10 === 0) {
				console.log(`✅ Добавлено ${successCount}/${translations.length}...`);
			}
		}
	}

	console.log(`\n✅ Успешно: ${successCount}`);
	console.log(`❌ Ошибок: ${errorCount}`);
	console.log(`\n🔄 Обновите страницу в браузере (Ctrl+R)`);
}

insertTranslations().catch(console.error);
