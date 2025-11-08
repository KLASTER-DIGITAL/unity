/**
 * Constants for Book Creation Wizard
 */

import type { BookLayout, BookStyle } from './types';

/**
 * Style options for book generation
 */
export const STYLE_OPTIONS: Array<{
	value: BookStyle;
	label: string;
	description: string;
	emoji: string;
}> = [
	{
		value: 'warm_family',
		label: 'Теплый семейный',
		description: 'Уютная атмосфера, акцент на семейных ценностях',
		emoji: '🏡',
	},
	{
		value: 'biographical',
		label: 'Биографический',
		description: 'Хронологическое повествование, факты и события',
		emoji: '📖',
	},
	{
		value: 'motivational',
		label: 'Мотивационный',
		description: 'Вдохновляющий стиль, акцент на достижениях',
		emoji: '🚀',
	},
];

/**
 * Layout options for book generation
 */
export const LAYOUT_OPTIONS: Array<{
	value: BookLayout;
	label: string;
	description: string;
	emoji: string;
}> = [
	{
		value: 'photo_text',
		label: 'Фото + текст',
		description: 'Фотографии с подробными описаниями',
		emoji: '📸',
	},
	{
		value: 'text_only',
		label: 'Только текст',
		description: 'Фокус на истории без изображений',
		emoji: '📝',
	},
	{
		value: 'minimal',
		label: 'Минималистичный',
		description: 'Лаконичный дизайн, краткие тексты',
		emoji: '✨',
	},
];

/**
 * Default period: last 30 days
 */
export const DEFAULT_PERIOD_DAYS = 30;

/**
 * Minimum entries required for book generation
 */
export const MIN_ENTRIES_REQUIRED = 5;

/**
 * Free tier book generation limit per month
 */
export const FREE_TIER_LIMIT = 1;
