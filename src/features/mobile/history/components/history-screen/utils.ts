import type { DiaryEntry } from '@/shared/lib/api';

/**
 * Filter entries by search query, category, and sentiment
 */
export function filterEntries(
	entries: DiaryEntry[],
	searchQuery: string,
	selectedCategory: string | null,
	selectedSentiment: string | null
): DiaryEntry[] {
	let filtered = [...entries];

	// Поиск по тексту
	if (searchQuery.trim()) {
		filtered = filtered.filter(
			(entry) =>
				entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
				entry.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(entry.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
		);
	}

	// Фильтр по категории
	if (selectedCategory) {
		filtered = filtered.filter((entry) => entry.category === selectedCategory);
	}

	// Фильтр по sentiment
	if (selectedSentiment) {
		filtered = filtered.filter((entry) => entry.sentiment === selectedSentiment);
	}

	return filtered;
}

/**
 * Format entry date
 * @param date - Date to format
 * @param locale - Locale code (e.g., 'ru', 'en', 'kk')
 */
export function formatEntryDate(date: Date, locale = 'ru'): string {
	// Convert locale to proper format (e.g., 'kk' -> 'kk-KZ', 'ka' -> 'ka-GE')
	const localeFormatted =
		locale === 'kk' ? 'kk-KZ' : locale === 'ka' ? 'ka-GE' : `${locale}-${locale.toUpperCase()}`;

	return new Intl.DateTimeFormat(localeFormatted, {
		day: 'numeric',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}
