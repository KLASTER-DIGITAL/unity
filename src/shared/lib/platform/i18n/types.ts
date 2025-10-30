/**
 * i18n Platform Adapter Types
 *
 * Shared types for PWA and React Native i18n implementations
 */

export type I18nPlatformAdapter = {
	/**
	 * Get device/browser language
	 * @returns Language code (e.g., 'ru', 'en', 'es')
	 */
	getDeviceLanguage(): string;

	/**
	 * Get list of preferred languages
	 * @returns Array of language codes in order of preference
	 */
	getPreferredLanguages(): string[];

	/**
	 * Check if a specific language is supported
	 * @param language Language code to check
	 * @returns True if language is supported
	 */
	isLanguageSupported(language: string): boolean;

	/**
	 * Get locale information
	 * @returns Locale object with language, region, and other details
	 */
	getLocaleInfo(): LocaleInfo;
};

export type LocaleInfo = {
	/**
	 * Language code (ISO 639-1)
	 * @example 'en', 'ru', 'es'
	 */
	language: string;

	/**
	 * Region/country code (ISO 3166-1 alpha-2)
	 * @example 'US', 'RU', 'ES'
	 */
	region?: string;

	/**
	 * Full locale string
	 * @example 'en-US', 'ru-RU', 'es-ES'
	 */
	locale: string;

	/**
	 * Text direction
	 */
	direction: 'ltr' | 'rtl';

	/**
	 * Currency code (ISO 4217)
	 * @example 'USD', 'RUB', 'EUR'
	 */
	currency?: string;

	/**
	 * Timezone
	 * @example 'America/New_York', 'Europe/Moscow'
	 */
	timezone?: string;
};

/**
 * Supported languages in UNITY-v2
 */
export const SUPPORTED_LANGUAGES = ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * RTL languages
 */
export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'] as const;
export type RTLLanguage = (typeof RTL_LANGUAGES)[number];
