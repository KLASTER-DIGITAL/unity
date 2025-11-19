-- Migration: Add User Cabinet Missing Translations - Part 2 (Achievements)
-- Date: 2025-11-19
-- Description: Добавляет недостающие переводы для раздела Achievements

-- ============================================================================
-- PART 2: ACHIEVEMENTS SCREEN
-- ============================================================================

INSERT INTO translations (lang_code, translation_key, translation_value) VALUES
-- Russian
('ru', 'achievements.stats.entries', 'Записей'),
('ru', 'achievements.stats.badges', 'Наград'),
('ru', 'achievements.stats.days_streak', 'Дней подряд'),
('ru', 'achievements.stats.record', 'Рекорд'),
('ru', 'achievements.level_progress', 'Прогресс уровня'),
('ru', 'achievements.filter.all', 'Все'),
('ru', 'achievements.filter.earned', 'Заработанные'),

-- English
('en', 'achievements.stats.entries', 'Entries'),
('en', 'achievements.stats.badges', 'Badges'),
('en', 'achievements.stats.days_streak', 'Days Streak'),
('en', 'achievements.stats.record', 'Record'),
('en', 'achievements.level_progress', 'Level Progress'),
('en', 'achievements.filter.all', 'All'),
('en', 'achievements.filter.earned', 'Earned'),

-- Spanish
('es', 'achievements.stats.entries', 'Entradas'),
('es', 'achievements.stats.badges', 'Insignias'),
('es', 'achievements.stats.days_streak', 'Días seguidos'),
('es', 'achievements.stats.record', 'Récord'),
('es', 'achievements.level_progress', 'Progreso de nivel'),
('es', 'achievements.filter.all', 'Todos'),
('es', 'achievements.filter.earned', 'Ganados'),

-- German
('de', 'achievements.stats.entries', 'Einträge'),
('de', 'achievements.stats.badges', 'Abzeichen'),
('de', 'achievements.stats.days_streak', 'Tage-Streak'),
('de', 'achievements.stats.record', 'Rekord'),
('de', 'achievements.level_progress', 'Level-Fortschritt'),
('de', 'achievements.filter.all', 'Alle'),
('de', 'achievements.filter.earned', 'Verdient'),

-- French
('fr', 'achievements.stats.entries', 'Entrées'),
('fr', 'achievements.stats.badges', 'Badges'),
('fr', 'achievements.stats.days_streak', 'Jours d''affilée'),
('fr', 'achievements.stats.record', 'Record'),
('fr', 'achievements.level_progress', 'Progression du niveau'),
('fr', 'achievements.filter.all', 'Tous'),
('fr', 'achievements.filter.earned', 'Gagnés'),

-- Chinese
('zh', 'achievements.stats.entries', '条目'),
('zh', 'achievements.stats.badges', '徽章'),
('zh', 'achievements.stats.days_streak', '连续天数'),
('zh', 'achievements.stats.record', '记录'),
('zh', 'achievements.level_progress', '等级进度'),
('zh', 'achievements.filter.all', '全部'),
('zh', 'achievements.filter.earned', '已获得'),

-- Japanese
('ja', 'achievements.stats.entries', 'エントリー'),
('ja', 'achievements.stats.badges', 'バッジ'),
('ja', 'achievements.stats.days_streak', '連続日数'),
('ja', 'achievements.stats.record', '記録'),
('ja', 'achievements.level_progress', 'レベル進捗'),
('ja', 'achievements.filter.all', 'すべて'),
('ja', 'achievements.filter.earned', '獲得済み'),

-- Georgian
('ka', 'achievements.stats.entries', 'ჩანაწერები'),
('ka', 'achievements.stats.badges', 'ჯილდოები'),
('ka', 'achievements.stats.days_streak', 'დღეები ზედიზედ'),
('ka', 'achievements.stats.record', 'რეკორდი'),
('ka', 'achievements.level_progress', 'დონის პროგრესი'),
('ka', 'achievements.filter.all', 'ყველა'),
('ka', 'achievements.filter.earned', 'მოპოვებული'),

-- Kazakh
('kk', 'achievements.stats.entries', 'Жазбалар'),
('kk', 'achievements.stats.badges', 'Марапаттар'),
('kk', 'achievements.stats.days_streak', 'Күн қатарынан'),
('kk', 'achievements.stats.record', 'Рекорд'),
('kk', 'achievements.level_progress', 'Деңгей прогресі'),
('kk', 'achievements.filter.all', 'Барлығы'),
('kk', 'achievements.filter.earned', 'Алынған')

ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

