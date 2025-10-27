/**
 * i18n API Module
 * 
 * Main module for internationalization functionality.
 * Provides hooks and utilities for translations.
 * 
 * Architecture:
 * - i18n-types.ts: Type definitions (120 lines)
 * - ../i18n/fallback.ts: Fallback translations (654 lines)
 * - i18n.ts: Hooks and utilities (60 lines) ← YOU ARE HERE
 * 
 * Total: 834 lines → split into 3 files (avg 278 lines/file)
 * Original: 710 lines in 1 file
 * 
 * @module i18n
 */

import { useState, useEffect } from 'react';
import type { Language, Translations } from './i18n-types';
import { fallbackTranslations } from '../i18n/fallback';

// Re-export types for convenience
export type { Language, Translations } from './i18n-types';

// Хук для получения переводов
export function useTranslations(language: Language = 'ru'): Translations {
  const [translations, setTranslations] = useState<Translations>(fallbackTranslations[language] as Translations);
  const [_isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setIsLoading(true);
        // const dynamicTranslations = await translationsApi.getTranslations(language);
        // Заглушка - будет заменено на работу с Edge Function
        
        // Используем fallback переводы пока не реализован Edge Function
        setTranslations(fallbackTranslations[language] as Translations);
      } catch (error) {
        console.error('Error loading translations:', error);
        // Используем fallback переводы в случае ошибки
        setTranslations(fallbackTranslations[language] as Translations);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  return translations;
}

// Функция для получения перевода категории
export function getCategoryTranslation(category: string, language: Language = 'ru'): string {
  const translations = fallbackTranslations[language] as Translations;
  
  switch (category) {
    case 'family': return translations.family;
    case 'work': return translations.work;
    case 'finance': return translations.finance;
    case 'gratitude': return translations.gratitude;
    case 'health': return translations.health;
    case 'personalDevelopment': return translations.personalDevelopment;
    case 'creativity': return translations.creativity;
    case 'relationships': return translations.relationships;
    default: return category;
  }
}
