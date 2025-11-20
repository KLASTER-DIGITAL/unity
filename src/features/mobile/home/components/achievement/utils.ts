import type { DiaryEntry } from '@/shared/lib/api';
import { getCategoryTranslation, type Language } from '@/shared/lib/i18n';
import { GRADIENTS, UNIQUE_GRADIENTS } from './constants';
import type { AchievementCard } from './types';

/**
 * Achievement Home Screen - Utility functions
 */

// ❌ DEPRECATED: Use useDefaultMotivations() hook instead
// Функция получения дефолтных мотиваций с учетом языка
// Оставлена для обратной совместимости с Edge Function
export function getDefaultMotivations(language: string): AchievementCard[] {
	// Fallback для Edge Function - возвращаем базовые карточки
	// В PWA используйте useDefaultMotivations() hook для переводов
	return [
		{
			id: 'default_1',
			date: 'Start today',
			title: 'Today is a great time',
			description:
				'Write down a small victory — this is the first step to recognizing your achievements.',
			gradient: 'from-(gradient-positive-1-start) to-(gradient-positive-1-end)',
			isMarked: false,
		},
		{
			id: 'default_2',
			date: 'Daily tip',
			title: 'Even one thought makes the day meaningful',
			description:
				"You don't have to write a lot — one phrase can change your perspective on the day.",
			gradient: 'from-(gradient-positive-3-start) to-(gradient-positive-3-end)',
			isMarked: false,
		},
		{
			id: 'default_3',
			date: 'Motivation',
			title: 'Write down a moment of gratitude',
			description:
				'Feel the lightness when you notice the good in your life. This is the path to happiness.',
			gradient: 'from-(gradient-positive-4-start) to-(gradient-positive-4-end)',
			isMarked: false,
		},
	];
}

/**
 * Получает уникальный градиент для карточки на основе индекса
 * Каждая карточка получает свой уникальный градиент из UNIQUE_GRADIENTS
 * Если индекс превышает количество градиентов - используем fallback на основе sentiment
 */
export function getGradientByIndex(index: number, sentiment: string = 'positive'): string {
	// Используем уникальные градиенты для первых 8 карточек
	if (index < UNIQUE_GRADIENTS.length) {
		return UNIQUE_GRADIENTS[index];
	}

	// Fallback: используем градиенты на основе sentiment
	const gradientList = GRADIENTS[sentiment as keyof typeof GRADIENTS] || GRADIENTS.positive;
	return gradientList[index % gradientList.length];
}

// Функция для конвертации DiaryEntry в AchievementCard
export function entryToCard(
	entry: DiaryEntry,
	index: number,
	userLanguage: Language = 'ru'
): AchievementCard {
	// ✅ НОВОЕ: Используем уникальные градиенты на основе индекса
	const gradient = getGradientByIndex(index, entry.sentiment);

	const entryDate = new Date(entry.createdAt);
	const localeMap: Record<Language, string> = {
		ru: 'ru-RU',
		en: 'en-US',
		es: 'es-ES',
		de: 'de-DE',
		fr: 'fr-FR',
		zh: 'zh-CN',
		ja: 'ja-JP',
		kk: 'kk-KZ',
		ka: 'ka-GE',
	};
	const locale = localeMap[userLanguage] || `${userLanguage}-${userLanguage.toUpperCase()}`;
	const dateFormatter = new Intl.DateTimeFormat(locale, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});

	// Используем aiSummary как title, если доступно
	const title =
		entry.aiSummary || getCategoryTranslation(entry.category || 'Achievement', userLanguage);

	// Используем aiInsight как description, если доступно
	const description = entry.aiInsight || entry.text;

	return {
		id: entry.id,
		date: dateFormatter.format(entryDate),
		title,
		description,
		gradient,
		isMarked: false,
		category: entry.category,
		sentiment: entry.sentiment,
	};
}
