/**
 * Re-export i18n utilities from original location
 * This allows gradual migration without breaking existing imports
 */

export * from '../../../components/i18n/TranslationProvider';
export * from '../../../components/i18n/TranslationManager';
export * from '../../../components/i18n/useTranslation';
export * from '../../../components/i18n/LanguageSelector';

// Re-export old i18n utilities (useTranslations function)
export * from '../../../utils/i18n';