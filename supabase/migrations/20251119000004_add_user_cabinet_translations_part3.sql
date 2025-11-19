-- Migration: Add User Cabinet Missing Translations - Part 3 (Reports)
-- Date: 2025-11-19
-- Description: Добавляет недостающие переводы для раздела Reports

-- ============================================================================
-- PART 3: REPORTS SCREEN
-- ============================================================================

INSERT INTO translations (lang_code, translation_key, translation_value) VALUES
-- Russian
('ru', 'reports.open_reports', 'Открыть отчёты'),
('ru', 'reports.report_for', 'Отчет за'),
('ru', 'reports.personal_analysis', 'Персональный анализ от AI'),
('ru', 'reports_books_description', 'Создавай книги на основе дневника и возвращайся к ним в любой момент на своей полке.'),

-- English
('en', 'reports.open_reports', 'Open Reports'),
('en', 'reports.report_for', 'Report for'),
('en', 'reports.personal_analysis', 'Personal AI Analysis'),
('en', 'reports_books_description', 'Create books based on your diary and return to them anytime on your shelf.'),

-- Spanish
('es', 'reports.open_reports', 'Abrir informes'),
('es', 'reports.report_for', 'Informe de'),
('es', 'reports.personal_analysis', 'Análisis personal de IA'),
('es', 'reports_books_description', 'Crea libros basados en tu diario y vuelve a ellos en cualquier momento en tu estante.'),

-- German
('de', 'reports.open_reports', 'Berichte öffnen'),
('de', 'reports.report_for', 'Bericht für'),
('de', 'reports.personal_analysis', 'Persönliche KI-Analyse'),
('de', 'reports_books_description', 'Erstelle Bücher basierend auf deinem Tagebuch und kehre jederzeit zu ihnen in deinem Regal zurück.'),

-- French
('fr', 'reports.open_reports', 'Ouvrir les rapports'),
('fr', 'reports.report_for', 'Rapport pour'),
('fr', 'reports.personal_analysis', 'Analyse personnelle par IA'),
('fr', 'reports_books_description', 'Créez des livres basés sur votre journal et revenez-y à tout moment sur votre étagère.'),

-- Chinese
('zh', 'reports.open_reports', '打开报告'),
('zh', 'reports.report_for', '报告'),
('zh', 'reports.personal_analysis', 'AI个人分析'),
('zh', 'reports_books_description', '根据您的日记创建书籍，并随时在您的书架上返回它们。'),

-- Japanese
('ja', 'reports.open_reports', 'レポートを開く'),
('ja', 'reports.report_for', 'レポート'),
('ja', 'reports.personal_analysis', 'AIパーソナル分析'),
('ja', 'reports_books_description', '日記に基づいて本を作成し、いつでも本棚に戻ることができます。'),

-- Georgian
('ka', 'reports.open_reports', 'ანგარიშების გახსნა'),
('ka', 'reports.report_for', 'ანგარიში'),
('ka', 'reports.personal_analysis', 'პერსონალური AI ანალიზი'),
('ka', 'reports_books_description', 'შექმენით წიგნები თქვენი დღიურის საფუძველზე და დაბრუნდით მათ ნებისმიერ დროს თქვენს თაროზე.'),

-- Kazakh
('kk', 'reports.open_reports', 'Есептерді ашу'),
('kk', 'reports.report_for', 'Есеп'),
('kk', 'reports.personal_analysis', 'AI жеке талдау'),
('kk', 'reports_books_description', 'Күнделігіңіз негізінде кітаптар жасаңыз және оларға кез келген уақытта сөреңізден оралыңыз.')

ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

