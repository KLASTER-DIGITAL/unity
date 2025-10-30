/**
 * i18n system - Internationalization utilities
 *
 * Components:
 * - TranslationProvider: Context provider for translations
 * - TranslationManager: Manager for loading and caching translations
 * - useTranslation: Hook for accessing translations
 * - LanguageSelector: Component for selecting language
 * - I18nTestComponent: Test component for i18n
 */

// Re-export formatting
export * from "./formatting";
export * from "./helpers";
export * from "./I18nTestComponent";
export * from "./LanguageSelector";
export * from "./language-detection";
// Re-export optimizations
export * from "./optimizations";
// Re-export pluralization
export * from "./pluralization";
// Re-export RTL support
export * from "./rtl";
export * from "./TranslationLoader";
export * from "./TranslationManager";
export * from "./TranslationProvider";
// Re-export types
export type { Language, Translations } from "./types";
export * from "./types/TranslationKeys";
export * from "./useTranslation";
