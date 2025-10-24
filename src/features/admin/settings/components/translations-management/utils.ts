import type { Translation, Language, MissingTranslation, TranslationStats } from './types';

/**
 * Filter translations by language and search query
 */
export function filterTranslations(
  translations: Translation[],
  selectedLanguage: string,
  searchQuery: string
): Translation[] {
  return translations
    .filter(t => t.lang_code === selectedLanguage)
    .filter(t => 
      searchQuery === '' || 
      t.translation_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.translation_value.toLowerCase().includes(searchQuery.toLowerCase())
    );
}

/**
 * Calculate translation statistics
 */
export function calculateStats(
  translations: Translation[],
  languages: Language[],
  missingKeys: MissingTranslation[]
): TranslationStats {
  const uniqueKeys = [...new Set(translations.map(t => t.translation_key))];
  
  return {
    totalKeys: uniqueKeys.length,
    totalTranslations: translations.length,
    missingCount: missingKeys.reduce((sum, mk) => sum + mk.languages.length, 0),
    completeness: languages.length > 0 
      ? Math.round((translations.length / (uniqueKeys.length * languages.length)) * 100)
      : 0
  };
}

