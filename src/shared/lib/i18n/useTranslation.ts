import { useTranslationContext } from './TranslationProvider';

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
    t,
    changeLanguage,
    currentLanguage,
    isLoading,
    error,
    isLoaded,
    refreshTranslations,
    
    // Дополнительные удобные методы
    hasTranslation: (key: string) => {
      const cache = state.cache.get(currentLanguage);
      return !!(cache?.translations[key]);
    },
    
    getAvailableLanguages: () => {
      return Array.from(state.cache.keys());
    },
    
    isLanguageLoaded: (language: string) => {
      return state.cache.has(language);
    }
  };
};