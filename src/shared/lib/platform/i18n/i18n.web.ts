/**
 * i18n Platform Adapter - Web Implementation
 *
 * Uses browser APIs (navigator.language, navigator.languages)
 */

import {
	type I18nPlatformAdapter,
	type LocaleInfo,
	RTL_LANGUAGES,
	SUPPORTED_LANGUAGES,
	type SupportedLanguage,
} from './types';

class I18nWebAdapter implements I18nPlatformAdapter {
	/**
	 * Get device/browser language
	 * Uses navigator.language with fallback to 'en'
	 */
	getDeviceLanguage(): string {
		if (typeof navigator === 'undefined') {
			return 'en';
		}

		const browserLanguage = navigator.language || (navigator as any).userLanguage;

		if (!browserLanguage) {
			return 'en';
		}

		// Extract language code (e.g., 'en-US' -> 'en')
		const languageCode = browserLanguage.split('-')[0].toLowerCase();

		// Check if supported
		if (this.isLanguageSupported(languageCode)) {
			return languageCode;
		}

		// Fallback to English
		return 'en';
	}

	/**
	 * Get list of preferred languages from browser
	 * Uses navigator.languages with fallback to navigator.language
	 */
	getPreferredLanguages(): string[] {
		if (typeof navigator === 'undefined') {
			return ['en'];
		}

		const languages = navigator.languages || [navigator.language];

		return languages
			.map((lang) => lang.split('-')[0].toLowerCase())
			.filter((lang, index, self) => self.indexOf(lang) === index) // Remove duplicates
			.filter((lang) => this.isLanguageSupported(lang));
	}

	/**
	 * Check if language is supported
	 */
	isLanguageSupported(language: string): boolean {
		return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
	}

	/**
	 * Get locale information
	 */
	getLocaleInfo(): LocaleInfo {
		if (typeof navigator === 'undefined') {
			return {
				language: 'en',
				locale: 'en-US',
				direction: 'ltr',
			};
		}

		const browserLanguage = navigator.language || 'en-US';
		const [language, region] = browserLanguage.split('-');
		const languageCode = language.toLowerCase();

		return {
			language: languageCode,
			region: region?.toUpperCase(),
			locale: browserLanguage,
			direction: this.getTextDirection(languageCode),
			currency: this.getCurrencyForRegion(region),
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		};
	}

	/**
	 * Get text direction for language
	 */
	private getTextDirection(language: string): 'ltr' | 'rtl' {
		return RTL_LANGUAGES.includes(language as any) ? 'rtl' : 'ltr';
	}

	/**
	 * Get currency code for region
	 */
	private getCurrencyForRegion(region?: string): string | undefined {
		if (!region) {
			return;
		}

		const currencyMap: Record<string, string> = {
			US: 'USD',
			RU: 'RUB',
			EU: 'EUR',
			GB: 'GBP',
			JP: 'JPY',
			CN: 'CNY',
			IN: 'INR',
			BR: 'BRL',
			CA: 'CAD',
			AU: 'AUD',
			MX: 'MXN',
			KR: 'KRW',
			TR: 'TRY',
			SA: 'SAR',
			AE: 'AED',
			CH: 'CHF',
			SE: 'SEK',
			NO: 'NOK',
			DK: 'DKK',
			PL: 'PLN',
			CZ: 'CZK',
			HU: 'HUF',
			RO: 'RON',
			BG: 'BGN',
			HR: 'HRK',
			RS: 'RSD',
			UA: 'UAH',
			BY: 'BYN',
			KZ: 'KZT',
			UZ: 'UZS',
			GE: 'GEL',
			AM: 'AMD',
			AZ: 'AZN',
			TJ: 'TJS',
			KG: 'KGS',
			TM: 'TMT',
			MD: 'MDL',
			LT: 'EUR',
			LV: 'EUR',
			EE: 'EUR',
			FI: 'EUR',
			AT: 'EUR',
			BE: 'EUR',
			NL: 'EUR',
			DE: 'EUR',
			FR: 'EUR',
			IT: 'EUR',
			ES: 'EUR',
			PT: 'EUR',
			GR: 'EUR',
			IE: 'EUR',
			LU: 'EUR',
			MT: 'EUR',
			CY: 'EUR',
			SK: 'EUR',
			SI: 'EUR',
		};

		return currencyMap[region.toUpperCase()];
	}
}

// Export singleton instance
export const i18nAdapter = new I18nWebAdapter();
