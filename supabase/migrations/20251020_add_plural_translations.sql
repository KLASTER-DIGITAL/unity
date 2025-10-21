-- Add plural translations for common use cases
-- Migration: 20251020_add_plural_translations.sql
-- Description: Add plural forms for achievements, entries, days, hours, minutes, milestones

-- English plurals (one/other)
INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
-- Achievements
('achievements_one', 'en', '{{count}} achievement'),
('achievements_other', 'en', '{{count}} achievements'),

-- Entries
('entries_one', 'en', '{{count}} entry'),
('entries_other', 'en', '{{count}} entries'),

-- Days
('days_one', 'en', '{{count}} day'),
('days_other', 'en', '{{count}} days'),

-- Hours
('hours_one', 'en', '{{count}} hour'),
('hours_other', 'en', '{{count}} hours'),

-- Minutes
('minutes_one', 'en', '{{count}} minute'),
('minutes_other', 'en', '{{count}} minutes'),

-- Seconds
('seconds_one', 'en', '{{count}} second'),
('seconds_other', 'en', '{{count}} seconds'),

-- Milestones
('milestones_one', 'en', '{{count}} milestone reached'),
('milestones_other', 'en', '{{count}} milestones reached'),

-- Items
('items_one', 'en', '{{count}} item'),
('items_other', 'en', '{{count}} items')

ON CONFLICT (translation_key, lang_code) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- Russian plurals (one/few/many)
INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
-- Achievements
('achievements_one', 'ru', '{{count}} достижение'),
('achievements_few', 'ru', '{{count}} достижения'),
('achievements_many', 'ru', '{{count}} достижений'),

-- Entries
('entries_one', 'ru', '{{count}} запись'),
('entries_few', 'ru', '{{count}} записи'),
('entries_many', 'ru', '{{count}} записей'),

-- Days
('days_one', 'ru', '{{count}} день'),
('days_few', 'ru', '{{count}} дня'),
('days_many', 'ru', '{{count}} дней'),

-- Hours
('hours_one', 'ru', '{{count}} час'),
('hours_few', 'ru', '{{count}} часа'),
('hours_many', 'ru', '{{count}} часов'),

-- Minutes
('minutes_one', 'ru', '{{count}} минута'),
('minutes_few', 'ru', '{{count}} минуты'),
('minutes_many', 'ru', '{{count}} минут'),

-- Seconds
('seconds_one', 'ru', '{{count}} секунда'),
('seconds_few', 'ru', '{{count}} секунды'),
('seconds_many', 'ru', '{{count}} секунд'),

-- Milestones
('milestones_one', 'ru', 'Достигнута {{count}} веха'),
('milestones_few', 'ru', 'Достигнуты {{count}} вехи'),
('milestones_many', 'ru', 'Достигнуто {{count}} вех'),

-- Items
('items_one', 'ru', '{{count}} элемент'),
('items_few', 'ru', '{{count}} элемента'),
('items_many', 'ru', '{{count}} элементов')

ON CONFLICT (translation_key, lang_code) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- Spanish plurals (one/other)
INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
-- Achievements
('achievements_one', 'es', '{{count}} logro'),
('achievements_other', 'es', '{{count}} logros'),

-- Entries
('entries_one', 'es', '{{count}} entrada'),
('entries_other', 'es', '{{count}} entradas'),

-- Days
('days_one', 'es', '{{count}} día'),
('days_other', 'es', '{{count}} días'),

-- Hours
('hours_one', 'es', '{{count}} hora'),
('hours_other', 'es', '{{count}} horas'),

-- Minutes
('minutes_one', 'es', '{{count}} minuto'),
('minutes_other', 'es', '{{count}} minutos'),

-- Seconds
('seconds_one', 'es', '{{count}} segundo'),
('seconds_other', 'es', '{{count}} segundos'),

-- Milestones
('milestones_one', 'es', '{{count}} hito alcanzado'),
('milestones_other', 'es', '{{count}} hitos alcanzados'),

-- Items
('items_one', 'es', '{{count}} elemento'),
('items_other', 'es', '{{count}} elementos')

ON CONFLICT (translation_key, lang_code) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- German plurals (one/other)
INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
-- Achievements
('achievements_one', 'de', '{{count}} Erfolg'),
('achievements_other', 'de', '{{count}} Erfolge'),

-- Entries
('entries_one', 'de', '{{count}} Eintrag'),
('entries_other', 'de', '{{count}} Einträge'),

-- Days
('days_one', 'de', '{{count}} Tag'),
('days_other', 'de', '{{count}} Tage'),

-- Hours
('hours_one', 'de', '{{count}} Stunde'),
('hours_other', 'de', '{{count}} Stunden'),

-- Minutes
('minutes_one', 'de', '{{count}} Minute'),
('minutes_other', 'de', '{{count}} Minuten'),

-- Seconds
('seconds_one', 'de', '{{count}} Sekunde'),
('seconds_other', 'de', '{{count}} Sekunden'),

-- Milestones
('milestones_one', 'de', '{{count}} Meilenstein erreicht'),
('milestones_other', 'de', '{{count}} Meilensteine erreicht'),

-- Items
('items_one', 'de', '{{count}} Element'),
('items_other', 'de', '{{count}} Elemente')

ON CONFLICT (translation_key, lang_code) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- French plurals (one for 0 and 1, other for rest)
INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
-- Achievements
('achievements_one', 'fr', '{{count}} réussite'),
('achievements_other', 'fr', '{{count}} réussites'),

-- Entries
('entries_one', 'fr', '{{count}} entrée'),
('entries_other', 'fr', '{{count}} entrées'),

-- Days
('days_one', 'fr', '{{count}} jour'),
('days_other', 'fr', '{{count}} jours'),

-- Hours
('hours_one', 'fr', '{{count}} heure'),
('hours_other', 'fr', '{{count}} heures'),

-- Minutes
('minutes_one', 'fr', '{{count}} minute'),
('minutes_other', 'fr', '{{count}} minutes'),

-- Seconds
('seconds_one', 'fr', '{{count}} seconde'),
('seconds_other', 'fr', '{{count}} secondes'),

-- Milestones
('milestones_one', 'fr', '{{count}} jalon atteint'),
('milestones_other', 'fr', '{{count}} jalons atteints'),

-- Items
('items_one', 'fr', '{{count}} élément'),
('items_other', 'fr', '{{count}} éléments')

ON CONFLICT (translation_key, lang_code) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- Chinese plurals (no plurals, always 'other')
INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
('achievements_other', 'zh', '{{count}} 个成就'),
('entries_other', 'zh', '{{count}} 条记录'),
('days_other', 'zh', '{{count}} 天'),
('hours_other', 'zh', '{{count}} 小时'),
('minutes_other', 'zh', '{{count}} 分钟'),
('seconds_other', 'zh', '{{count}} 秒'),
('milestones_other', 'zh', '达到 {{count}} 个里程碑'),
('items_other', 'zh', '{{count}} 个项目')

ON CONFLICT (translation_key, lang_code) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- Japanese plurals (no plurals, always 'other')
INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
('achievements_other', 'ja', '{{count}}個の実績'),
('entries_other', 'ja', '{{count}}件のエントリー'),
('days_other', 'ja', '{{count}}日'),
('hours_other', 'ja', '{{count}}時間'),
('minutes_other', 'ja', '{{count}}分'),
('seconds_other', 'ja', '{{count}}秒'),
('milestones_other', 'ja', '{{count}}個のマイルストーンを達成'),
('items_other', 'ja', '{{count}}個のアイテム')

ON CONFLICT (translation_key, lang_code) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

-- Georgian plurals (one/other)
INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
-- Achievements
('achievements_one', 'ka', '{{count}} მიღწევა'),
('achievements_other', 'ka', '{{count}} მიღწევა'),

-- Entries
('entries_one', 'ka', '{{count}} ჩანაწერი'),
('entries_other', 'ka', '{{count}} ჩანაწერი'),

-- Days
('days_one', 'ka', '{{count}} დღე'),
('days_other', 'ka', '{{count}} დღე'),

-- Hours
('hours_one', 'ka', '{{count}} საათი'),
('hours_other', 'ka', '{{count}} საათი'),

-- Minutes
('minutes_one', 'ka', '{{count}} წუთი'),
('minutes_other', 'ka', '{{count}} წუთი'),

-- Seconds
('seconds_one', 'ka', '{{count}} წამი'),
('seconds_other', 'ka', '{{count}} წამი'),

-- Milestones
('milestones_one', 'ka', 'მიღწეულია {{count}} ეტაპი'),
('milestones_other', 'ka', 'მიღწეულია {{count}} ეტაპი'),

-- Items
('items_one', 'ka', '{{count}} ელემენტი'),
('items_other', 'ka', '{{count}} ელემენტი')

ON CONFLICT (translation_key, lang_code) DO UPDATE
SET translation_value = EXCLUDED.translation_value,
    updated_at = NOW();

