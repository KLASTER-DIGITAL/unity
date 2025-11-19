-- Migration: Add User Cabinet Missing Translations - Part 5 (Settings - Additional & Support)
-- Date: 2025-11-19
-- Description: Добавляет недостающие переводы для разделов Additional и Support

-- ============================================================================
-- PART 6: SETTINGS - ADDITIONAL SECTION
-- ============================================================================

INSERT INTO translations (lang_code, translation_key, translation_value) VALUES
-- Russian
('ru', 'settings.additional.title', 'Дополнительно'),
('ru', 'settings.additional.language', 'Язык'),
('ru', 'settings.additional.first_day_of_week', 'Первый день недели'),
('ru', 'settings.additional.sunday', 'Воскресенье'),
('ru', 'settings.additional.export_data', 'Экспортировать данные'),
('ru', 'settings.additional.import_data', 'Импортировать данные'),
('ru', 'settings.additional.restore_from_file', 'Восстановить из файла'),
('ru', 'settings.additional.delete_all_data', 'Удалить все данные'),
('ru', 'settings.additional.irreversible_action', 'Необратимое действие'),

-- English
('en', 'settings.additional.title', 'Additional'),
('en', 'settings.additional.language', 'Language'),
('en', 'settings.additional.first_day_of_week', 'First day of week'),
('en', 'settings.additional.sunday', 'Sunday'),
('en', 'settings.additional.export_data', 'Export data'),
('en', 'settings.additional.import_data', 'Import data'),
('en', 'settings.additional.restore_from_file', 'Restore from file'),
('en', 'settings.additional.delete_all_data', 'Delete all data'),
('en', 'settings.additional.irreversible_action', 'Irreversible action'),

-- Spanish
('es', 'settings.additional.title', 'Adicional'),
('es', 'settings.additional.language', 'Idioma'),
('es', 'settings.additional.first_day_of_week', 'Primer día de la semana'),
('es', 'settings.additional.sunday', 'Domingo'),
('es', 'settings.additional.export_data', 'Exportar datos'),
('es', 'settings.additional.import_data', 'Importar datos'),
('es', 'settings.additional.restore_from_file', 'Restaurar desde archivo'),
('es', 'settings.additional.delete_all_data', 'Eliminar todos los datos'),
('es', 'settings.additional.irreversible_action', 'Acción irreversible'),

-- German
('de', 'settings.additional.title', 'Zusätzlich'),
('de', 'settings.additional.language', 'Sprache'),
('de', 'settings.additional.first_day_of_week', 'Erster Tag der Woche'),
('de', 'settings.additional.sunday', 'Sonntag'),
('de', 'settings.additional.export_data', 'Daten exportieren'),
('de', 'settings.additional.import_data', 'Daten importieren'),
('de', 'settings.additional.restore_from_file', 'Aus Datei wiederherstellen'),
('de', 'settings.additional.delete_all_data', 'Alle Daten löschen'),
('de', 'settings.additional.irreversible_action', 'Unumkehrbare Aktion'),

-- French
('fr', 'settings.additional.title', 'Supplémentaire'),
('fr', 'settings.additional.language', 'Langue'),
('fr', 'settings.additional.first_day_of_week', 'Premier jour de la semaine'),
('fr', 'settings.additional.sunday', 'Dimanche'),
('fr', 'settings.additional.export_data', 'Exporter les données'),
('fr', 'settings.additional.import_data', 'Importer les données'),
('fr', 'settings.additional.restore_from_file', 'Restaurer à partir du fichier'),
('fr', 'settings.additional.delete_all_data', 'Supprimer toutes les données'),
('fr', 'settings.additional.irreversible_action', 'Action irréversible'),

-- Chinese
('zh', 'settings.additional.title', '附加'),
('zh', 'settings.additional.language', '语言'),
('zh', 'settings.additional.first_day_of_week', '一周的第一天'),
('zh', 'settings.additional.sunday', '星期日'),
('zh', 'settings.additional.export_data', '导出数据'),
('zh', 'settings.additional.import_data', '导入数据'),
('zh', 'settings.additional.restore_from_file', '从文件恢复'),
('zh', 'settings.additional.delete_all_data', '删除所有数据'),
('zh', 'settings.additional.irreversible_action', '不可逆操作'),

-- Japanese
('ja', 'settings.additional.title', '追加'),
('ja', 'settings.additional.language', '言語'),
('ja', 'settings.additional.first_day_of_week', '週の最初の日'),
('ja', 'settings.additional.sunday', '日曜日'),
('ja', 'settings.additional.export_data', 'データをエクスポート'),
('ja', 'settings.additional.import_data', 'データをインポート'),
('ja', 'settings.additional.restore_from_file', 'ファイルから復元'),
('ja', 'settings.additional.delete_all_data', 'すべてのデータを削除'),
('ja', 'settings.additional.irreversible_action', '元に戻せない操作'),

-- Georgian
('ka', 'settings.additional.title', 'დამატებითი'),
('ka', 'settings.additional.language', 'ენა'),
('ka', 'settings.additional.first_day_of_week', 'კვირის პირველი დღე'),
('ka', 'settings.additional.sunday', 'კვირა'),
('ka', 'settings.additional.export_data', 'მონაცემების ექსპორტი'),
('ka', 'settings.additional.import_data', 'მონაცემების იმპორტი'),
('ka', 'settings.additional.restore_from_file', 'ფაილიდან აღდგენა'),
('ka', 'settings.additional.delete_all_data', 'ყველა მონაცემის წაშლა'),
('ka', 'settings.additional.irreversible_action', 'შეუქცევადი მოქმედება'),

-- Kazakh
('kk', 'settings.additional.title', 'Қосымша'),
('kk', 'settings.additional.language', 'Тіл'),
('kk', 'settings.additional.first_day_of_week', 'Аптаның бірінші күні'),
('kk', 'settings.additional.sunday', 'Жексенбі'),
('kk', 'settings.additional.export_data', 'Деректерді экспорттау'),
('kk', 'settings.additional.import_data', 'Деректерді импорттау'),
('kk', 'settings.additional.restore_from_file', 'Файлдан қалпына келтіру'),
('kk', 'settings.additional.delete_all_data', 'Барлық деректерді жою'),
('kk', 'settings.additional.irreversible_action', 'Қайтарылмайтын әрекет')

ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- ============================================================================
-- PART 7: SETTINGS - SUPPORT SECTION
-- ============================================================================

INSERT INTO translations (lang_code, translation_key, translation_value) VALUES
-- Russian
('ru', 'settings.support.rate_app', 'Оценить приложение'),
('ru', 'settings.support.share_feedback', 'Поделитесь отзывом'),
('ru', 'settings.support.report_bug', 'Сообщить об ошибке'),
('ru', 'settings.support.help_improve', 'Помогите улучшить приложение'),
('ru', 'settings.support.faq', 'FAQ'),
('ru', 'settings.support.faq_description', 'Часто задаваемые вопросы'),
('ru', 'settings.support.pwa_to_home', 'PWA на главный экран'),
('ru', 'settings.support.install_app', 'Установить приложение'),

-- English
('en', 'settings.support.rate_app', 'Rate app'),
('en', 'settings.support.share_feedback', 'Share feedback'),
('en', 'settings.support.report_bug', 'Report bug'),
('en', 'settings.support.help_improve', 'Help improve the app'),
('en', 'settings.support.faq', 'FAQ'),
('en', 'settings.support.faq_description', 'Frequently asked questions'),
('en', 'settings.support.pwa_to_home', 'PWA to home screen'),
('en', 'settings.support.install_app', 'Install app'),

-- Spanish
('es', 'settings.support.rate_app', 'Calificar aplicación'),
('es', 'settings.support.share_feedback', 'Compartir comentarios'),
('es', 'settings.support.report_bug', 'Reportar error'),
('es', 'settings.support.help_improve', 'Ayuda a mejorar la aplicación'),
('es', 'settings.support.faq', 'FAQ'),
('es', 'settings.support.faq_description', 'Preguntas frecuentes'),
('es', 'settings.support.pwa_to_home', 'PWA a pantalla de inicio'),
('es', 'settings.support.install_app', 'Instalar aplicación'),

-- German
('de', 'settings.support.rate_app', 'App bewerten'),
('de', 'settings.support.share_feedback', 'Feedback teilen'),
('de', 'settings.support.report_bug', 'Fehler melden'),
('de', 'settings.support.help_improve', 'Helfen Sie, die App zu verbessern'),
('de', 'settings.support.faq', 'FAQ'),
('de', 'settings.support.faq_description', 'Häufig gestellte Fragen'),
('de', 'settings.support.pwa_to_home', 'PWA zum Startbildschirm'),
('de', 'settings.support.install_app', 'App installieren'),

-- French
('fr', 'settings.support.rate_app', 'Évaluer l''application'),
('fr', 'settings.support.share_feedback', 'Partager des commentaires'),
('fr', 'settings.support.report_bug', 'Signaler un bug'),
('fr', 'settings.support.help_improve', 'Aidez à améliorer l''application'),
('fr', 'settings.support.faq', 'FAQ'),
('fr', 'settings.support.faq_description', 'Questions fréquemment posées'),
('fr', 'settings.support.pwa_to_home', 'PWA sur l''écran d''accueil'),
('fr', 'settings.support.install_app', 'Installer l''application'),

-- Chinese
('zh', 'settings.support.rate_app', '评价应用'),
('zh', 'settings.support.share_feedback', '分享反馈'),
('zh', 'settings.support.report_bug', '报告错误'),
('zh', 'settings.support.help_improve', '帮助改进应用'),
('zh', 'settings.support.faq', 'FAQ'),
('zh', 'settings.support.faq_description', '常见问题'),
('zh', 'settings.support.pwa_to_home', 'PWA到主屏幕'),
('zh', 'settings.support.install_app', '安装应用'),

-- Japanese
('ja', 'settings.support.rate_app', 'アプリを評価'),
('ja', 'settings.support.share_feedback', 'フィードバックを共有'),
('ja', 'settings.support.report_bug', 'バグを報告'),
('ja', 'settings.support.help_improve', 'アプリの改善にご協力ください'),
('ja', 'settings.support.faq', 'FAQ'),
('ja', 'settings.support.faq_description', 'よくある質問'),
('ja', 'settings.support.pwa_to_home', 'PWAをホーム画面に'),
('ja', 'settings.support.install_app', 'アプリをインストール'),

-- Georgian
('ka', 'settings.support.rate_app', 'აპლიკაციის შეფასება'),
('ka', 'settings.support.share_feedback', 'გაუზიარეთ გამოხმაურება'),
('ka', 'settings.support.report_bug', 'შეცდომის მოხსენება'),
('ka', 'settings.support.help_improve', 'დაგვეხმარეთ აპლიკაციის გაუმჯობესებაში'),
('ka', 'settings.support.faq', 'FAQ'),
('ka', 'settings.support.faq_description', 'ხშირად დასმული კითხვები'),
('ka', 'settings.support.pwa_to_home', 'PWA მთავარ ეკრანზე'),
('ka', 'settings.support.install_app', 'აპლიკაციის დაყენება'),

-- Kazakh
('kk', 'settings.support.rate_app', 'Қолданбаны бағалау'),
('kk', 'settings.support.share_feedback', 'Пікір бөлісу'),
('kk', 'settings.support.report_bug', 'Қате туралы хабарлау'),
('kk', 'settings.support.help_improve', 'Қолданбаны жақсартуға көмектесіңіз'),
('kk', 'settings.support.faq', 'FAQ'),
('kk', 'settings.support.faq_description', 'Жиі қойылатын сұрақтар'),
('kk', 'settings.support.pwa_to_home', 'PWA басты экранға'),
('kk', 'settings.support.install_app', 'Қолданбаны орнату')

ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- ============================================================================
-- PART 8: SETTINGS - PROFILE & PERSONALIZATION
-- ============================================================================

INSERT INTO translations (lang_code, translation_key, translation_value) VALUES
-- Russian
('ru', 'settings.profile.my_diary', 'Мой дневник'),
('ru', 'settings.personalization.title', 'Персонализация'),
('ru', 'settings.personalization.categories', 'Категории'),
('ru', 'settings.personalization.categories_description', 'Настройте категории для записей'),

-- English
('en', 'settings.profile.my_diary', 'My Diary'),
('en', 'settings.personalization.title', 'Personalization'),
('en', 'settings.personalization.categories', 'Categories'),
('en', 'settings.personalization.categories_description', 'Customize categories for entries'),

-- Spanish
('es', 'settings.profile.my_diary', 'Mi Diario'),
('es', 'settings.personalization.title', 'Personalización'),
('es', 'settings.personalization.categories', 'Categorías'),
('es', 'settings.personalization.categories_description', 'Personaliza categorías para entradas'),

-- German
('de', 'settings.profile.my_diary', 'Mein Tagebuch'),
('de', 'settings.personalization.title', 'Personalisierung'),
('de', 'settings.personalization.categories', 'Kategorien'),
('de', 'settings.personalization.categories_description', 'Kategorien für Einträge anpassen'),

-- French
('fr', 'settings.profile.my_diary', 'Mon Journal'),
('fr', 'settings.personalization.title', 'Personnalisation'),
('fr', 'settings.personalization.categories', 'Catégories'),
('fr', 'settings.personalization.categories_description', 'Personnaliser les catégories pour les entrées'),

-- Chinese
('zh', 'settings.profile.my_diary', '我的日记'),
('zh', 'settings.personalization.title', '个性化'),
('zh', 'settings.personalization.categories', '类别'),
('zh', 'settings.personalization.categories_description', '自定义条目类别'),

-- Japanese
('ja', 'settings.profile.my_diary', 'マイダイアリー'),
('ja', 'settings.personalization.title', 'パーソナライゼーション'),
('ja', 'settings.personalization.categories', 'カテゴリー'),
('ja', 'settings.personalization.categories_description', 'エントリーのカテゴリーをカスタマイズ'),

-- Georgian
('ka', 'settings.profile.my_diary', 'ჩემი დღიური'),
('ka', 'settings.personalization.title', 'პერსონალიზაცია'),
('ka', 'settings.personalization.categories', 'კატეგორიები'),
('ka', 'settings.personalization.categories_description', 'მოარგეთ კატეგორიები ჩანაწერებისთვის'),

-- Kazakh
('kk', 'settings.profile.my_diary', 'Менің күнделігім'),
('kk', 'settings.personalization.title', 'Жекелендіру'),
('kk', 'settings.personalization.categories', 'Санаттар'),
('kk', 'settings.personalization.categories_description', 'Жазбалар үшін санаттарды теңшеу')

ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

