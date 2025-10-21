import { useTranslationContext } from './TranslationProvider';
import type { TranslationKey, LanguageCode } from './types/TranslationKeys';
import { pluralize } from './pluralization';
import {
  formatDate,
  formatTime,
  formatRelativeTime,
  DATE_FORMATS,
  type DateFormatOptions,
  type RelativeTimeOptions
} from './formatting/DateFormatter';
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatCompact,
  formatFileSize,
  formatDuration,
  NUMBER_FORMATS,
  type NumberFormatOptions
} from './formatting/NumberFormatter';
import {
  isRTL,
  getTextDirection,
  getRTLConfig,
  type TextDirection
} from './rtl/RTLDetector';
import { PerformanceMonitor } from './monitoring/PerformanceMonitor';

/**
 * Hook for accessing translation functionality with TypeScript autocomplete
 *
 * @example
 * const { t, changeLanguage, currentLanguage } = useTranslation();
 *
 * // TypeScript will autocomplete available keys
 * const text = t('welcome_title', 'Welcome');
 *
 * // Change language with type safety
 * await changeLanguage('en');
 */
export const useTranslation = () => {
  const {
    t,
    changeLanguage,
    currentLanguage,
    isLoading,
    error,
    isLoaded,
    state,
    refreshTranslations
  } = useTranslationContext();

  return {
    /**
     * Translation function with autocomplete support
     * @param key - Translation key (autocompleted)
     * @param fallback - Fallback text if translation not found
     */
    t: t as (key: TranslationKey, fallback?: string) => string,

    /**
     * Change current language
     * @param language - Language code (autocompleted)
     */
    changeLanguage: changeLanguage as (language: LanguageCode) => Promise<void>,

    /**
     * Current active language code
     */
    currentLanguage: currentLanguage as LanguageCode,

    isLoading,
    error,
    isLoaded,
    refreshTranslations,

    // Дополнительные удобные методы
    /**
     * Check if translation exists for a key
     */
    hasTranslation: (key: TranslationKey) => {
      const cache = state.cache.get(currentLanguage);
      return !!(cache?.translations[key]);
    },

    /**
     * Get all available language codes
     */
    getAvailableLanguages: () => {
      return Array.from(state.cache.keys()) as LanguageCode[];
    },

    /**
     * Check if a language is loaded in cache
     */
    isLanguageLoaded: (language: LanguageCode) => {
      return state.cache.has(language);
    },

    /**
     * Pluralize a translation based on count
     *
     * @param baseKey - Base translation key (e.g., 'items', 'days')
     * @param count - Number to determine plural form
     * @param fallback - Fallback text if translation not found
     *
     * @example
     * // English: "1 item" / "5 items"
     * t.plural('items', 1) // → "1 item"
     * t.plural('items', 5) // → "5 items"
     *
     * // Russian: "1 день" / "2 дня" / "5 дней"
     * t.plural('days', 1) // → "1 день"
     * t.plural('days', 2) // → "2 дня"
     * t.plural('days', 5) // → "5 дней"
     */
    plural: (baseKey: string, count: number, fallback?: string) => {
      const cache = state.cache.get(currentLanguage);
      const translations = cache?.translations || {};

      return pluralize({
        count,
        language: currentLanguage,
        translations,
        baseKey,
        fallback
      });
    },

    // Date formatting methods
    /**
     * Format a date according to current locale
     *
     * @example
     * t.formatDate(new Date()) // → "Jan 1, 2024" (en) / "1 янв. 2024 г." (ru)
     * t.formatDate(new Date(), { style: 'long' }) // → "January 1, 2024"
     */
    formatDate: (date: Date | string | number, options?: DateFormatOptions) =>
      formatDate(date, currentLanguage, options),

    /**
     * Format time only
     *
     * @example
     * t.formatTime(new Date()) // → "3:30 PM" (en) / "15:30" (ru)
     */
    formatTime: (date: Date | string | number) =>
      formatTime(date, currentLanguage),

    /**
     * Format relative time (time ago)
     *
     * @example
     * t.formatRelativeTime(new Date(Date.now() - 5 * 60 * 1000)) // → "5 minutes ago"
     */
    formatRelativeTime: (date: Date | string | number, options?: RelativeTimeOptions) =>
      formatRelativeTime(date, currentLanguage, options),

    // Number formatting methods
    /**
     * Format a number according to current locale
     *
     * @example
     * t.formatNumber(1234.56) // → "1,234.56" (en) / "1 234,56" (ru)
     */
    formatNumber: (value: number, options?: NumberFormatOptions) =>
      formatNumber(value, currentLanguage, options),

    /**
     * Format currency
     *
     * @example
     * t.formatCurrency(1234.56, 'USD') // → "$1,234.56" (en) / "1 234,56 $" (ru)
     */
    formatCurrency: (value: number, currency?: string) =>
      formatCurrency(value, currentLanguage, currency),

    /**
     * Format percentage
     *
     * @example
     * t.formatPercent(0.85) // → "85%" (en) / "85 %" (ru)
     */
    formatPercent: (value: number) =>
      formatPercent(value, currentLanguage),

    /**
     * Format number with compact notation
     *
     * @example
     * t.formatCompact(1234567) // → "1.2M" (en) / "1,2 млн" (ru)
     */
    formatCompact: (value: number) =>
      formatCompact(value, currentLanguage),

    /**
     * Format file size
     *
     * @example
     * t.formatFileSize(1024 * 1024) // → "1.00 MB"
     */
    formatFileSize: (bytes: number) =>
      formatFileSize(bytes, currentLanguage),

    /**
     * Format duration
     *
     * @example
     * t.formatDuration(3665) // → "1h 1m 5s"
     */
    formatDuration: (seconds: number) =>
      formatDuration(seconds, currentLanguage),

    // Preset formats
    dateFormats: DATE_FORMATS,
    numberFormats: NUMBER_FORMATS,

    // RTL support
    /**
     * Check if current language is RTL
     *
     * @example
     * if (t.isRTL) {
     *   // Apply RTL-specific styles
     * }
     */
    isRTL: isRTL(currentLanguage),

    /**
     * Get text direction for current language
     *
     * @example
     * <div dir={t.direction}>Content</div>
     */
    direction: getTextDirection(currentLanguage) as TextDirection,

    /**
     * Get RTL configuration for current language
     *
     * @example
     * const { isRTL, direction, directionClass } = t.rtlConfig;
     */
    rtlConfig: getRTLConfig(currentLanguage)
  };
};