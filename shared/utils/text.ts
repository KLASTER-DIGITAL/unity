/**
 * Text Utils - Shared between PWA and React Native
 *
 * TRULY shared code - NO platform-specific imports
 * Pure functions only
 */

/**
 * Truncate text to max length
 */
export function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return `${text.slice(0, maxLength)}...`;
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
	if (!text) return '';
	return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
	const regex = /#[\wа-яА-ЯёЁ]+/g;
	const matches = text.match(regex);
	return matches ? matches.map((tag) => tag.slice(1)) : [];
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
	return text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
}

/**
 * Count characters in text
 */
export function countCharacters(text: string): number {
	return text.length;
}

/**
 * Remove HTML tags from text
 */
export function stripHtml(html: string): string {
	return html.replace(/<[^>]*>/g, '');
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	};
	return text.replace(/[&<>"']/g, (char) => map[char]);
}
