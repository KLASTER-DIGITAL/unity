-- Add missing translations for dates, times, and hardcoded texts
-- Part 1: Time-related translations (just_now, yesterday, hours_ago, days_ago, weeks_ago)
-- Part 2: Entry sentiment translations (positive, neutral, negative)
-- Part 3: Period translations (week, month, year)
-- Part 4: Achievement category titles
-- Total: ~150 translations (25 keys × 8 languages - kk already has some)

-- ============================================================================
-- PART 1: TIME-RELATED TRANSLATIONS
-- ============================================================================

INSERT INTO translations (lang_code, translation_key, translation_value) VALUES
-- Russian
('ru', 'time.just_now', 'Только что'),
('ru', 'time.yesterday', 'Вчера'),
('ru', 'time.hours_ago', '{{count}} ч назад'),
('ru', 'time.days_ago', '{{count}} дн назад'),
('ru', 'time.weeks_ago', '{{count}} нед назад'),

-- English
('en', 'time.just_now', 'Just now'),
('en', 'time.yesterday', 'Yesterday'),
('en', 'time.hours_ago', '{{count}} h ago'),
('en', 'time.days_ago', '{{count}} d ago'),
('en', 'time.weeks_ago', '{{count}} w ago'),

-- Spanish
('es', 'time.just_now', 'Justo ahora'),
('es', 'time.yesterday', 'Ayer'),
('es', 'time.hours_ago', 'Hace {{count}} h'),
('es', 'time.days_ago', 'Hace {{count}} d'),
('es', 'time.weeks_ago', 'Hace {{count}} sem'),

-- German
('de', 'time.just_now', 'Gerade eben'),
('de', 'time.yesterday', 'Gestern'),
('de', 'time.hours_ago', 'Vor {{count}} Std'),
('de', 'time.days_ago', 'Vor {{count}} T'),
('de', 'time.weeks_ago', 'Vor {{count}} W'),

-- French
('fr', 'time.just_now', 'À l''instant'),
('fr', 'time.yesterday', 'Hier'),
('fr', 'time.hours_ago', 'Il y a {{count}} h'),
('fr', 'time.days_ago', 'Il y a {{count}} j'),
('fr', 'time.weeks_ago', 'Il y a {{count}} sem'),

-- Chinese
('zh', 'time.just_now', '刚刚'),
('zh', 'time.yesterday', '昨天'),
('zh', 'time.hours_ago', '{{count}}小时前'),
('zh', 'time.days_ago', '{{count}}天前'),
('zh', 'time.weeks_ago', '{{count}}周前'),

-- Japanese
('ja', 'time.just_now', 'たった今'),
('ja', 'time.yesterday', '昨日'),
('ja', 'time.hours_ago', '{{count}}時間前'),
('ja', 'time.days_ago', '{{count}}日前'),
('ja', 'time.weeks_ago', '{{count}}週間前'),

-- Georgian
('ka', 'time.just_now', 'ახლახან'),
('ka', 'time.yesterday', 'გუშინ'),
('ka', 'time.hours_ago', '{{count}} სთ წინ'),
('ka', 'time.days_ago', '{{count}} დღის წინ'),
('ka', 'time.weeks_ago', '{{count}} კვირის წინ'),

-- Kazakh
('kk', 'time.just_now', 'Жаңа ғана'),
('kk', 'time.yesterday', 'Кеше'),
('kk', 'time.hours_ago', '{{count}} сағат бұрын'),
('kk', 'time.days_ago', '{{count}} күн бұрын'),
('kk', 'time.weeks_ago', '{{count}} апта бұрын')

ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- ============================================================================
-- PART 2: ENTRY SENTIMENT TRANSLATIONS
-- ============================================================================

INSERT INTO translations (lang_code, translation_key, translation_value) VALUES
-- Russian
('ru', 'entry.sentiment.positive', '😊 Позитив'),
('ru', 'entry.sentiment.neutral', '😐 Нейтрал'),
('ru', 'entry.sentiment.negative', '😔 Грусть'),

-- English
('en', 'entry.sentiment.positive', '😊 Positive'),
('en', 'entry.sentiment.neutral', '😐 Neutral'),
('en', 'entry.sentiment.negative', '😔 Sad'),

-- Spanish
('es', 'entry.sentiment.positive', '😊 Positivo'),
('es', 'entry.sentiment.neutral', '😐 Neutral'),
('es', 'entry.sentiment.negative', '😔 Triste'),

-- German
('de', 'entry.sentiment.positive', '😊 Positiv'),
('de', 'entry.sentiment.neutral', '😐 Neutral'),
('de', 'entry.sentiment.negative', '😔 Traurig'),

-- French
('fr', 'entry.sentiment.positive', '😊 Positif'),
('fr', 'entry.sentiment.neutral', '😐 Neutre'),
('fr', 'entry.sentiment.negative', '😔 Triste'),

-- Chinese
('zh', 'entry.sentiment.positive', '😊 积极'),
('zh', 'entry.sentiment.neutral', '😐 中性'),
('zh', 'entry.sentiment.negative', '😔 悲伤'),

-- Japanese
('ja', 'entry.sentiment.positive', '😊 ポジティブ'),
('ja', 'entry.sentiment.neutral', '😐 ニュートラル'),
('ja', 'entry.sentiment.negative', '😔 悲しい'),

-- Georgian
('ka', 'entry.sentiment.positive', '😊 პოზიტიური'),
('ka', 'entry.sentiment.neutral', '😐 ნეიტრალური'),
('ka', 'entry.sentiment.negative', '😔 სევდიანი'),

-- Kazakh
('kk', 'entry.sentiment.positive', '😊 Позитив'),
('kk', 'entry.sentiment.neutral', '😐 Бейтарап'),
('kk', 'entry.sentiment.negative', '😔 Қайғы')

ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- ============================================================================
-- PART 3: PERIOD TRANSLATIONS (for reports)
-- ============================================================================

INSERT INTO translations (lang_code, translation_key, translation_value) VALUES
-- Russian
('ru', 'period.weekly', 'Неделя'),
('ru', 'period.monthly', 'Месяц'),
('ru', 'period.yearly', 'Год'),

-- English
('en', 'period.weekly', 'Week'),
('en', 'period.monthly', 'Month'),
('en', 'period.yearly', 'Year'),

-- Spanish
('es', 'period.weekly', 'Semana'),
('es', 'period.monthly', 'Mes'),
('es', 'period.yearly', 'Año'),

-- German
('de', 'period.weekly', 'Woche'),
('de', 'period.monthly', 'Monat'),
('de', 'period.yearly', 'Jahr'),

-- French
('fr', 'period.weekly', 'Semaine'),
('fr', 'period.monthly', 'Mois'),
('fr', 'period.yearly', 'Année'),

-- Chinese
('zh', 'period.weekly', '周'),
('zh', 'period.monthly', '月'),
('zh', 'period.yearly', '年'),

-- Japanese
('ja', 'period.weekly', '週'),
('ja', 'period.monthly', '月'),
('ja', 'period.yearly', '年'),

-- Georgian
('ka', 'period.weekly', 'კვირა'),
('ka', 'period.monthly', 'თვე'),
('ka', 'period.yearly', 'წელი'),

-- Kazakh
('kk', 'period.weekly', 'Апта'),
('kk', 'period.monthly', 'Ай'),
('kk', 'period.yearly', 'Жыл')

ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- ============================================================================
-- PART 4: ACHIEVEMENT CATEGORY TITLES
-- ============================================================================

INSERT INTO translations (lang_code, translation_key, translation_value) VALUES
-- Russian
('ru', 'achievements.category.milestones', 'Вехи'),
('ru', 'achievements.category.streaks', 'Постоянство'),
('ru', 'achievements.category.categories', 'Категории'),
('ru', 'achievements.category.mindfulness', 'Осознанность и эмоции'),
('ru', 'achievements.category.special', 'Особые'),

-- English
('en', 'achievements.category.milestones', 'Milestones'),
('en', 'achievements.category.streaks', 'Streaks'),
('en', 'achievements.category.categories', 'Categories'),
('en', 'achievements.category.mindfulness', 'Mindfulness & Emotions'),
('en', 'achievements.category.special', 'Special'),

-- Spanish
('es', 'achievements.category.milestones', 'Hitos'),
('es', 'achievements.category.streaks', 'Rachas'),
('es', 'achievements.category.categories', 'Categorías'),
('es', 'achievements.category.mindfulness', 'Atención plena y emociones'),
('es', 'achievements.category.special', 'Especiales'),

-- German
('de', 'achievements.category.milestones', 'Meilensteine'),
('de', 'achievements.category.streaks', 'Serien'),
('de', 'achievements.category.categories', 'Kategorien'),
('de', 'achievements.category.mindfulness', 'Achtsamkeit & Emotionen'),
('de', 'achievements.category.special', 'Besondere'),

-- French
('fr', 'achievements.category.milestones', 'Jalons'),
('fr', 'achievements.category.streaks', 'Séries'),
('fr', 'achievements.category.categories', 'Catégories'),
('fr', 'achievements.category.mindfulness', 'Pleine conscience et émotions'),
('fr', 'achievements.category.special', 'Spéciaux'),

-- Chinese
('zh', 'achievements.category.milestones', '里程碑'),
('zh', 'achievements.category.streaks', '连续记录'),
('zh', 'achievements.category.categories', '类别'),
('zh', 'achievements.category.mindfulness', '正念与情绪'),
('zh', 'achievements.category.special', '特殊'),

-- Japanese
('ja', 'achievements.category.milestones', 'マイルストーン'),
('ja', 'achievements.category.streaks', '連続記録'),
('ja', 'achievements.category.categories', 'カテゴリー'),
('ja', 'achievements.category.mindfulness', 'マインドフルネスと感情'),
('ja', 'achievements.category.special', '特別'),

-- Georgian
('ka', 'achievements.category.milestones', 'ეტაპები'),
('ka', 'achievements.category.streaks', 'მუდმივობა'),
('ka', 'achievements.category.categories', 'კატეგორიები'),
('ka', 'achievements.category.mindfulness', 'ცნობიერება და ემოციები'),
('ka', 'achievements.category.special', 'სპეციალური'),

-- Kazakh
('kk', 'achievements.category.milestones', 'Белестер'),
('kk', 'achievements.category.streaks', 'Тұрақтылық'),
('kk', 'achievements.category.categories', 'Санаттар'),
('kk', 'achievements.category.mindfulness', 'Саналылық және эмоциялар'),
('kk', 'achievements.category.special', 'Ерекше')

ON CONFLICT (lang_code, translation_key) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();
