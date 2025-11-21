/**
 * Утилита для определения правильного текста для выполненных достижений
 * На основе типа условия определяет: "Вы создали", "Вы выполнили", "Вы отметили"
 */

import type { TranslationFunction } from '@/shared/lib/i18n/types/TranslationKeys';

export type AchievementConditionType =
	| 'entries_count'
	| 'streak_days'
	| 'longest_streak'
	| 'achievements_count'
	| 'category_count'
	| 'sentiment_negative_count'
	| 'mood_variety'
	| 'days_since_first_entry'
	| 'all_categories'
	| 'comeback_after_days';

/**
 * Определяет тип условия достижения по его ID
 */
export function getConditionTypeFromId(achievementId: string): AchievementConditionType | null {
	// Достижения по количеству записей
	if (achievementId.startsWith('entries_') || achievementId === 'first_entry') {
		return 'entries_count';
	}

	// Достижения по серии дней
	if (achievementId.startsWith('streak_')) {
		return 'streak_days';
	}

	// Достижения по количеству достижений (is_achievement)
	if (achievementId.startsWith('achievements_')) {
		return 'achievements_count';
	}

	// Достижения по категориям
	if (achievementId.startsWith('category_')) {
		return 'category_count';
	}

	// Достижения по настроению
	if (achievementId.includes('mood') || achievementId.includes('sentiment')) {
		return 'mood_variety';
	}

	// Достижения по дням с первой записи
	if (achievementId.includes('days_since') || achievementId.includes('comeback')) {
		return 'days_since_first_entry';
	}

	return null;
}

/**
 * Получает правильный текст для выполненных достижений
 * @param achievementId - ID достижения
 * @param t - функция перевода
 * @returns Текст типа "Вы создали", "Вы выполнили", "Вы отметили"
 */
export function getEarnedText(achievementId: string, t: TranslationFunction): string {
	const conditionType = getConditionTypeFromId(achievementId);

	switch (conditionType) {
		case 'entries_count':
		case 'category_count':
			// Для записей: "Вы создали"
			return t('achievements.earned.created', 'Вы создали');
		case 'streak_days':
		case 'longest_streak':
		case 'days_since_first_entry':
		case 'mood_variety':
		case 'sentiment_negative_count':
		case 'all_categories':
		case 'comeback_after_days':
			// Для серий и других активностей: "Вы выполнили"
			return t('achievements.earned.completed', 'Вы выполнили');
		case 'achievements_count':
			// Для достижений (is_achievement): "Вы отметили"
			return t('achievements.earned.marked', 'Вы отметили');
		default:
			// Fallback: "Выполнено"
			return t('achievements.earned.default', 'Выполнено');
	}
}
