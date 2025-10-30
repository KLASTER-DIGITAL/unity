/**
 * i18n Platform Adapter - React Native Implementation
 *
 * Uses expo-localization for device language detection
 */

import * as Localization from "expo-localization";
import {
	type I18nPlatformAdapter,
	type LocaleInfo,
	RTL_LANGUAGES,
	SUPPORTED_LANGUAGES,
	type SupportedLanguage,
} from "../../../../src/shared/lib/platform/i18n/types";

class I18nNativeAdapter implements I18nPlatformAdapter {
	/**
	 * Get device language using expo-localization
	 */
	getDeviceLanguage(): string {
		try {
			// Get device locale (e.g., 'en-US', 'ru-RU')
			const deviceLocale = Localization.locale;

			if (!deviceLocale) {
				return "en";
			}

			// Extract language code (e.g., 'en-US' -> 'en')
			const languageCode = deviceLocale.split("-")[0].toLowerCase();

			// Check if supported
			if (this.isLanguageSupported(languageCode)) {
				return languageCode;
			}

			// Fallback to English
			return "en";
		} catch (error) {
			console.error("[i18n Native] Error getting device language:", error);
			return "en";
		}
	}

	/**
	 * Get list of preferred languages from device
	 * Uses expo-localization.locales
	 */
	getPreferredLanguages(): string[] {
		try {
			const locales = Localization.locales;

			if (!locales || locales.length === 0) {
				return ["en"];
			}

			return locales
				.map((locale) => {
					// Extract language code from locale object
					const languageCode = locale.languageCode?.toLowerCase();
					return (
						languageCode || locale.languageTag?.split("-")[0].toLowerCase()
					);
				})
				.filter((lang): lang is string => !!lang)
				.filter((lang, index, self) => self.indexOf(lang) === index) // Remove duplicates
				.filter((lang) => this.isLanguageSupported(lang));
		} catch (error) {
			console.error("[i18n Native] Error getting preferred languages:", error);
			return ["en"];
		}
	}

	/**
	 * Check if language is supported
	 */
	isLanguageSupported(language: string): boolean {
		return SUPPORTED_LANGUAGES.includes(language as SupportedLanguage);
	}

	/**
	 * Get locale information using expo-localization
	 */
	getLocaleInfo(): LocaleInfo {
		try {
			const deviceLocale = Localization.locale || "en-US";
			const [language, region] = deviceLocale.split("-");
			const languageCode = language.toLowerCase();

			return {
				language: languageCode,
				region: region?.toUpperCase(),
				locale: deviceLocale,
				direction: this.getTextDirection(languageCode),
				currency: Localization.currency || this.getCurrencyForRegion(region),
				timezone: Localization.timezone || "UTC",
			};
		} catch (error) {
			console.error("[i18n Native] Error getting locale info:", error);
			return {
				language: "en",
				locale: "en-US",
				direction: "ltr",
			};
		}
	}

	/**
	 * Get text direction for language
	 */
	private getTextDirection(language: string): "ltr" | "rtl" {
		return RTL_LANGUAGES.includes(language as any) ? "rtl" : "ltr";
	}

	/**
	 * Get currency code for region (fallback if expo-localization doesn't provide)
	 */
	private getCurrencyForRegion(region?: string): string | undefined {
		if (!region) return;

		const currencyMap: Record<string, string> = {
			US: "USD",
			RU: "RUB",
			EU: "EUR",
			GB: "GBP",
			JP: "JPY",
			CN: "CNY",
			IN: "INR",
			BR: "BRL",
			CA: "CAD",
			AU: "AUD",
			MX: "MXN",
			KR: "KRW",
			TR: "TRY",
			SA: "SAR",
			AE: "AED",
			CH: "CHF",
			SE: "SEK",
			NO: "NOK",
			DK: "DKK",
			PL: "PLN",
			CZ: "CZK",
			HU: "HUF",
			RO: "RON",
			BG: "BGN",
			HR: "HRK",
			RS: "RSD",
			UA: "UAH",
			BY: "BYN",
			KZ: "KZT",
			UZ: "UZS",
			GE: "GEL",
			AM: "AMD",
			AZ: "AZN",
			TJ: "TJS",
			KG: "KGS",
			TM: "TMT",
			MD: "MDL",
			LT: "EUR",
			LV: "EUR",
			EE: "EUR",
			FI: "EUR",
			AT: "EUR",
			BE: "EUR",
			NL: "EUR",
			DE: "EUR",
			FR: "EUR",
			IT: "EUR",
			ES: "EUR",
			PT: "EUR",
			GR: "EUR",
			IE: "EUR",
			LU: "EUR",
			MT: "EUR",
			CY: "EUR",
			SK: "EUR",
			SI: "EUR",
		};

		return currencyMap[region.toUpperCase()];
	}
}

// Export singleton instance
export const i18nAdapter = new I18nNativeAdapter();
