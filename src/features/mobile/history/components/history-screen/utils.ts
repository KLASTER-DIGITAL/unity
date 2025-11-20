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
	// For Kazakh and Georgian, use manual formatting since browser locales may not support them
	if (locale === 'kk' || locale === 'ka') {
		const months =
			locale === 'kk'
				? [
						'қаңтар',
						'ақпан',
						'наурыз',
						'сәуір',
						'мамыр',
						'маусым',
						'шілде',
						'тамыз',
						'қыркүйек',
						'қазан',
						'қараша',
						'желтоқсан',
					]
				: [
						'იანვარი',
						'თებერვალი',
						'მარტი',
						'აპრილი',
						'მაისი',
						'ივნისი',
						'ივლისი',
						'აგვისტო',
						'სექტემბერი',
						'ოქტომბერი',
						'ნოემბერი',
						'დეკემბერი',
					];

		const day = date.getDate();
		const month = months[date.getMonth()];
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');

		return locale === 'kk'
			? `${day} ${month} ${hours}:${minutes}`
			: `${day} ${month} ${hours}:${minutes}`;
	}

	// For other languages, use browser's Intl.DateTimeFormat
	const localeFormatted = `${locale}-${locale.toUpperCase()}`;

	return new Intl.DateTimeFormat(localeFormatted, {
		day: 'numeric',
		month: 'long',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}
