-- Migration: Add User Cabinet Missing Translations - Part 1 (Home & Navigation)
-- Date: 2025-11-19
-- Description: Добавляет недостающие переводы для кабинета пользователя (Часть 1)

-- ============================================================================
-- PART 1: HOME SCREEN & NAVIGATION
-- ============================================================================

-- Home Screen translations
INSERT INTO translations (lang_code, translation_key, translation_value) VALUES
-- Russian
('ru', 'home.recent_entries', 'Лента последних записей'),
('ru', 'home.view_all', 'Смотреть все'),
('ru', 'home.greeting', 'Привет'),
('ru', 'home.question', 'Какие твои победы сегодня?'),
('ru', 'home.daysInRow', 'Дней подряд'),
('ru', 'home.inputQuestion', 'Что хорошего произошло сегодня?'),

-- English
('en', 'home.recent_entries', 'Recent Entries Feed'),
('en', 'home.view_all', 'View All'),
('en', 'home.greeting', 'Hello'),
('en', 'home.question', 'What are your wins today?'),
('en', 'home.daysInRow', 'Days in a row'),
('en', 'home.inputQuestion', 'What good happened today?'),

-- Spanish
('es', 'home.recent_entries', 'Feed de entradas recientes'),
('es', 'home.view_all', 'Ver todo'),
('es', 'home.greeting', 'Hola'),
('es', 'home.question', '¿Cuáles son tus victorias hoy?'),
('es', 'home.daysInRow', 'Días seguidos'),
('es', 'home.inputQuestion', '¿Qué bueno pasó hoy?'),

-- German
('de', 'home.recent_entries', 'Feed der letzten Einträge'),
('de', 'home.view_all', 'Alle anzeigen'),
('de', 'home.greeting', 'Hallo'),
('de', 'home.question', 'Was sind deine Erfolge heute?'),
('de', 'home.daysInRow', 'Tage hintereinander'),
('de', 'home.inputQuestion', 'Was Gutes ist heute passiert?'),

-- French
('fr', 'home.recent_entries', 'Flux des dernières entrées'),
('fr', 'home.view_all', 'Voir tout'),
('fr', 'home.greeting', 'Bonjour'),
('fr', 'home.question', 'Quelles sont tes victoires aujourd''hui?'),
('fr', 'home.daysInRow', 'Jours d''affilée'),
('fr', 'home.inputQuestion', 'Qu''est-ce qui s''est bien passé aujourd''hui?'),

-- Chinese
('zh', 'home.recent_entries', '最近条目动态'),
('zh', 'home.view_all', '查看全部'),
('zh', 'home.greeting', '你好'),
('zh', 'home.question', '今天有什么胜利？'),
('zh', 'home.daysInRow', '连续天数'),
('zh', 'home.inputQuestion', '今天发生了什么好事？'),

-- Japanese
('ja', 'home.recent_entries', '最近のエントリーフィード'),
('ja', 'home.view_all', 'すべて表示'),
('ja', 'home.greeting', 'こんにちは'),
('ja', 'home.question', '今日の勝利は何ですか？'),
('ja', 'home.daysInRow', '連続日数'),
('ja', 'home.inputQuestion', '今日何か良いことがありましたか？'),

-- Georgian
('ka', 'home.recent_entries', 'ბოლო ჩანაწერების ლენტა'),
('ka', 'home.view_all', 'ყველას ნახვა'),
('ka', 'home.greeting', 'გამარჯობა'),
('ka', 'home.question', 'რა არის შენი გამარჯვებები დღეს?'),
('ka', 'home.daysInRow', 'დღეები ზედიზედ'),
('ka', 'home.inputQuestion', 'რა კარგი მოხდა დღეს?'),

-- Kazakh
('kk', 'home.recent_entries', 'Соңғы жазбалар таспасы'),
('kk', 'home.view_all', 'Барлығын көру'),
('kk', 'home.greeting', 'Сәлем'),
('kk', 'home.question', 'Бүгін қандай жеңістеріңіз бар?'),
('kk', 'home.daysInRow', 'Күн қатарынан'),
('kk', 'home.inputQuestion', 'Бүгін не жақсы болды?')

ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

