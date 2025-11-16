-- =====================================================
-- ACHIEVEMENTS CATALOG SEED DATA
-- =====================================================
-- Version: 1.0
-- Date: 2025-11-16
-- Description: Базовый каталог достижений для UNITY
-- Refs: docs/new/achievements-review-and-plan.md

-- =====================================================
-- COMMON ACHIEVEMENTS (Обычные)
-- =====================================================

INSERT INTO achievements_catalog (id, name, description, icon, rarity, condition) VALUES
-- Первые шаги
('first_entry', 'Первые шаги', 'Создай свою первую запись', '✨', 'common', '{"type": "entries_count", "operator": ">=", "value": 1}'),
('entries_5', 'Начало пути', 'Создай 5 записей', '📝', 'common', '{"type": "entries_count", "operator": ">=", "value": 5}'),
('entries_10', 'Привычка формируется', 'Создай 10 записей', '📚', 'common', '{"type": "entries_count", "operator": ">=", "value": 10}'),

-- Серия дней (Прогресс)
('streak_3', 'Три дня подряд', 'Создавай записи 3 дня подряд', '🔥', 'common', '{"type": "streak_days", "operator": ">=", "value": 3}'),
('streak_7', 'Неделя силы', 'Создавай записи 7 дней подряд', '💪', 'common', '{"type": "streak_days", "operator": ">=", "value": 7}'),

-- Категории (базовые)
('category_family_5', 'Семейные ценности', 'Создай 5 записей о семье', '👨‍👩‍👧', 'common', '{"type": "category_count", "category": "Семья", "operator": ">=", "value": 5}'),
('category_health_5', 'Забота о себе', 'Создай 5 записей о здоровье', '💪', 'common', '{"type": "category_count", "category": "Здоровье", "operator": ">=", "value": 5}'),
('category_work_5', 'Профессиональный рост', 'Создай 5 записей о работе', '💼', 'common', '{"type": "category_count", "category": "Работа", "operator": ">=", "value": 5}');

-- =====================================================
-- RARE ACHIEVEMENTS (Редкие)
-- =====================================================

INSERT INTO achievements_catalog (id, name, description, icon, rarity, condition) VALUES
-- Количество записей
('entries_25', 'Четверть сотни', 'Создай 25 записей', '🎯', 'rare', '{"type": "entries_count", "operator": ">=", "value": 25}'),
('entries_50', 'Полсотни побед', 'Создай 50 записей', '🏆', 'rare', '{"type": "entries_count", "operator": ">=", "value": 50}'),

-- Серия дней
('streak_14', 'Две недели силы', 'Создавай записи 14 дней подряд', '⚡', 'rare', '{"type": "streak_days", "operator": ">=", "value": 14}'),
('streak_30', 'Месяц постоянства', 'Создавай записи 30 дней подряд', '🌟', 'rare', '{"type": "streak_days", "operator": ">=", "value": 30}'),

-- Достижения (is_achievement)
('achievements_5', 'Пять побед', 'Отметь 5 достижений', '⭐', 'rare', '{"type": "achievements_count", "operator": ">=", "value": 5}'),
('achievements_10', 'Десять побед', 'Отметь 10 достижений', '🌠', 'rare', '{"type": "achievements_count", "operator": ">=", "value": 10}'),

-- Категории (продвинутые)
('category_family_20', 'Семья - главное', 'Создай 20 записей о семье', '❤️', 'rare', '{"type": "category_count", "category": "Семья", "operator": ">=", "value": 20}'),
('category_health_20', 'Здоровый образ жизни', 'Создай 20 записей о здоровье', '🏃', 'rare', '{"type": "category_count", "category": "Здоровье", "operator": ">=", "value": 20}'),
('category_gratitude_10', 'Благодарное сердце', 'Создай 10 записей благодарности', '🙏', 'rare', '{"type": "category_count", "category": "Благодарность", "operator": ">=", "value": 10}');

-- =====================================================
-- EPIC ACHIEVEMENTS (Эпические)
-- =====================================================

INSERT INTO achievements_catalog (id, name, description, icon, rarity, condition) VALUES
-- Количество записей
('entries_100', 'Сотня историй', 'Создай 100 записей', '💯', 'epic', '{"type": "entries_count", "operator": ">=", "value": 100}'),
('entries_250', 'Четверть тысячи', 'Создай 250 записей', '🎖️', 'epic', '{"type": "entries_count", "operator": ">=", "value": 250}'),

-- Серия дней
('streak_60', 'Два месяца силы', 'Создавай записи 60 дней подряд', '🔱', 'epic', '{"type": "streak_days", "operator": ">=", "value": 60}'),
('streak_90', 'Квартал постоянства', 'Создавай записи 90 дней подряд', '👑', 'epic', '{"type": "streak_days", "operator": ">=", "value": 90}'),

-- Достижения
('achievements_25', 'Двадцать пять побед', 'Отметь 25 достижений', '🏅', 'epic', '{"type": "achievements_count", "operator": ">=", "value": 25}'),
('achievements_50', 'Пятьдесят побед', 'Отметь 50 достижений', '🥇', 'epic', '{"type": "achievements_count", "operator": ">=", "value": 50}'),

-- Категории (мастер)
('category_family_50', 'Семейный мастер', 'Создай 50 записей о семье', '💝', 'epic', '{"type": "category_count", "category": "Семья", "operator": ">=", "value": 50}'),
('category_health_50', 'Мастер здоровья', 'Создай 50 записей о здоровье', '💎', 'epic', '{"type": "category_count", "category": "Здоровье", "operator": ">=", "value": 50}'),
('category_work_50', 'Профессионал', 'Создай 50 записей о работе', '🎓', 'epic', '{"type": "category_count", "category": "Работа", "operator": ">=", "value": 50}');

-- =====================================================
-- LEGENDARY ACHIEVEMENTS (Легендарные)
-- =====================================================

INSERT INTO achievements_catalog (id, name, description, icon, rarity, condition) VALUES
-- Количество записей
('entries_500', 'Полтысячи историй', 'Создай 500 записей', '🌈', 'legendary', '{"type": "entries_count", "operator": ">=", "value": 500}'),
('entries_1000', 'Тысяча историй', 'Создай 1000 записей', '🦄', 'legendary', '{"type": "entries_count", "operator": ">=", "value": 1000}'),

-- Серия дней
('streak_180', 'Полгода силы', 'Создавай записи 180 дней подряд', '🌠', 'legendary', '{"type": "streak_days", "operator": ">=", "value": 180}'),
('streak_365', 'Год постоянства', 'Создавай записи 365 дней подряд', '🏰', 'legendary', '{"type": "streak_days", "operator": ">=", "value": 365}'),

-- Достижения
('achievements_100', 'Сотня побед', 'Отметь 100 достижений', '🎆', 'legendary', '{"type": "achievements_count", "operator": ">=", "value": 100}'),
('achievements_250', 'Легенда побед', 'Отметь 250 достижений', '🌟', 'legendary', '{"type": "achievements_count", "operator": ">=", "value": 250}'),

-- Категории (легенда)
('category_family_100', 'Легенда семьи', 'Создай 100 записей о семье', '💖', 'legendary', '{"type": "category_count", "category": "Семья", "operator": ">=", "value": 100}'),
('category_health_100', 'Легенда здоровья', 'Создай 100 записей о здоровье', '⚡', 'legendary', '{"type": "category_count", "category": "Здоровье", "operator": ">=", "value": 100}'),
('category_gratitude_50', 'Мастер благодарности', 'Создай 50 записей благодарности', '✨', 'legendary', '{"type": "category_count", "category": "Благодарность", "operator": ">=", "value": 50}'),

-- Особые достижения
('all_categories', 'Мастер всех сфер', 'Создай хотя бы 10 записей в каждой категории', '🎨', 'legendary', '{"type": "all_categories", "operator": ">=", "value": 10}'),
('year_complete', 'Год с UNITY', 'Используй UNITY целый год', '🎂', 'legendary', '{"type": "days_since_first_entry", "operator": ">=", "value": 365}');

-- =====================================================
-- SPECIAL ACHIEVEMENTS (Специальные - эмоции и осознанность)
-- =====================================================

INSERT INTO achievements_catalog (id, name, description, icon, rarity, condition) VALUES
-- Эмоциональная честность
('honest_difficult_day', 'Честность в сложный день', 'Напиши о сложном дне честно', '💙', 'rare', '{"type": "sentiment_negative_count", "operator": ">=", "value": 5}'),
('emotional_balance', 'Эмоциональный баланс', 'Создай 10 записей с разными настроениями', '🌈', 'epic', '{"type": "mood_variety", "operator": ">=", "value": 10}'),

-- Возвращение
('comeback_7', 'Возвращение', 'Вернись к записям после перерыва в 7 дней', '🔄', 'rare', '{"type": "comeback_after_days", "operator": ">=", "value": 7}'),
('comeback_30', 'Великое возвращение', 'Вернись к записям после перерыва в 30 дней', '🌅', 'epic', '{"type": "comeback_after_days", "operator": ">=", "value": 30}');

