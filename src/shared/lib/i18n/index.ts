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

export * from './TranslationProvider';
export * from './TranslationManager';
export * from './useTranslation';
export * from './LanguageSelector';
export * from './I18nTestComponent';
export * from './TranslationLoader';
export * from './helpers';

// Re-export types
export * from './types';
export * from './types/TranslationKeys';

// Re-export optimizations
export * from './optimizations';

// Re-export pluralization
export * from './pluralization';

// Re-export formatting
export * from './formatting';

// Re-export RTL support
export * from './rtl';