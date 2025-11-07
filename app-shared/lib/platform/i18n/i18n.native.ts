/**
 * i18n Platform Adapter - React Native Implementation
 *
 * Uses expo-localization for device language detection
 */

import * as Localization from 'expo-localization';
import {
	type I18nPlatformAdapter,
	type LocaleInfo,
	RTL_LANGUAGES,
	SUPPORTED_LANGUAGES,
	type SupportedLanguage,
} from './types';

class I18nNativeAdapter implements I18nPlatformAdapter {
	/**
	 * Get device language
	 * Uses expo-localization with fallback to 'en'
	 */
	getDeviceLanguage(): string {
		try {
			// Get device locale (e.g., 'en-US', 'ru-RU')
			const deviceLocale = Localization.getLocales()[0];

			if (!deviceLocale) {
				return 'en';
			}

			// Extract language code (e.g., 'en-US' -> 'en')
			const languageCode = deviceLocale.languageCode?.toLowerCase() || 'en';

			// Check if supported
			if (this.isLanguageSupported(languageCode)) {
				return languageCode;
			}

			// Fallback to English
			return 'en';
		} catch (error) {
			console.error('[i18n Native] Error getting device language:', error);
			return 'en';
		}
	}

	/**
	 * Get list of preferred languages from device
	 * Uses expo-localization.getLocales()
	 */
	getPreferredLanguages(): string[] {
		try {
			const locales = Localization.getLocales();

			return locales
				.map((locale) => locale.languageCode?.toLowerCase() || '')
				.filter((lang) => lang !== '')
				.filter((lang, index, self) => self.indexOf(lang) === index) // Remove duplicates
				.filter((lang) => this.isLanguageSupported(lang));
		} catch (error) {
			console.error('[i18n Native] Error getting preferred languages:', error);
			return ['en'];
		}
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
		try {
			const deviceLocale = Localization.getLocales()[0];

			if (!deviceLocale) {
				return {
					language: 'en',
					locale: 'en-US',
					direction: 'ltr',
				};
			}

			const languageCode = deviceLocale.languageCode?.toLowerCase() || 'en';
			const regionCode = deviceLocale.regionCode?.toUpperCase();

			return {
				language: languageCode,
				region: regionCode,
				locale: `${languageCode}-${regionCode || 'US'}`,
				direction: this.getTextDirection(languageCode),
				currency: deviceLocale.currencyCode || this.getCurrencyForRegion(regionCode),
				timezone: Localization.getCalendars()[0]?.timeZone,
			};
		} catch (error) {
			console.error('[i18n Native] Error getting locale info:', error);
			return {
				language: 'en',
				locale: 'en-US',
				direction: 'ltr',
			};
		}
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
			// Add more as needed
		};

		return currencyMap[region.toUpperCase()];
	}
}

// Export singleton instance
export const i18nAdapter = new I18nNativeAdapter();
