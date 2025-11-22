import type { LucideIcon } from 'lucide-react';
import { Briefcase, DollarSign, Heart, Sparkles, Users } from 'lucide-react';

/**
 * Category icons mapping
 */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
	Другое: Sparkles,
	Семья: Users,
	Работа: Briefcase,
	Финансы: DollarSign,
	Благодарность: Heart,
	Здоровье: Sparkles,
	'Личное развитие': Sparkles,
	Обучение: Sparkles,
	Творчество: Sparkles,
	Отношения: Heart,
};

/**
 * Category translation keys mapping
 * Maps Russian category names to translation keys
 */
export const CATEGORY_TRANSLATION_KEYS: { [key: string]: string } = {
	Другое: 'category.other',
	Семья: 'category.family',
	Работа: 'category.work',
	Финансы: 'category.finance',
	Благодарность: 'category.gratitude',
	Здоровье: 'category.health',
	'Личное развитие': 'category.personal_growth',
	Обучение: 'category.development',
	Творчество: 'category.creativity',
	Отношения: 'category.relationships',
};

/**
 * Get translation key for a category name
 * Supports case-insensitive lookup
 */
export function getCategoryTranslationKey(categoryName: string): string | null {
	if (!categoryName) return null;

	// Try exact match first
	if (CATEGORY_TRANSLATION_KEYS[categoryName]) {
		return CATEGORY_TRANSLATION_KEYS[categoryName];
	}

	// Try case-insensitive match
	const matchedKey = Object.keys(CATEGORY_TRANSLATION_KEYS).find(
		(key) => key.toLowerCase() === categoryName.toLowerCase()
	);

	return matchedKey ? CATEGORY_TRANSLATION_KEYS[matchedKey] : null;
}

/**
 * Sentiment colors mapping
 */
export const SENTIMENT_COLORS = {
	positive: 'bg-(--ios-green)/10 text-(--ios-green)',
	neutral: 'bg-(--ios-blue)/10 text-(--ios-blue)',
	negative: 'bg-(--ios-orange)/10 text-(--ios-orange)',
};

/**
 * Available categories (deprecated - use translation keys instead)
 * @deprecated Use getCategoryTranslationKey() and t() for translated names
 */
export const CATEGORIES = [
	'Другое',
	'Семья',
	'Работа',
	'Финансы',
	'Благодарность',
	'Здоровье',
	'Личное развитие',
	'Творчество',
	'Отношения',
];
