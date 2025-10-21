/**
 * i18n Helper Functions
 * 
 * Utility functions for translation-related tasks
 */

import { Language } from './types';

/**
 * Get translation for diary entry category
 * @param category - Category key (family, work, finance, etc.)
 * @param language - Language code (default: 'ru')
 * @returns Translated category name
 */
export function getCategoryTranslation(category: string, language: Language = 'ru'): string {
  const categoryTranslations: Record<Language, Record<string, string>> = {
    ru: {
      family: 'Семья',
      work: 'Работа',
      finance: 'Финансы',
      gratitude: 'Благодарность',
      health: 'Здоровье',
      personalDevelopment: 'Личное развитие',
      creativity: 'Творчество',
      relationships: 'Отношения'
    },
    en: {
      family: 'Family',
      work: 'Work',
      finance: 'Finance',
      gratitude: 'Gratitude',
      health: 'Health',
      personalDevelopment: 'Personal Development',
      creativity: 'Creativity',
      relationships: 'Relationships'
    },
    es: {
      family: 'Familia',
      work: 'Trabajo',
      finance: 'Finanzas',
      gratitude: 'Gratitud',
      health: 'Salud',
      personalDevelopment: 'Desarrollo Personal',
      creativity: 'Creatividad',
      relationships: 'Relaciones'
    },
    de: {
      family: 'Familie',
      work: 'Arbeit',
      finance: 'Finanzen',
      gratitude: 'Dankbarkeit',
      health: 'Gesundheit',
      personalDevelopment: 'Persönliche Entwicklung',
      creativity: 'Kreativität',
      relationships: 'Beziehungen'
    },
    fr: {
      family: 'Famille',
      work: 'Travail',
      finance: 'Finances',
      gratitude: 'Gratitude',
      health: 'Santé',
      personalDevelopment: 'Développement Personnel',
      creativity: 'Créativité',
      relationships: 'Relations'
    },
    zh: {
      family: '家庭',
      work: '工作',
      finance: '财务',
      gratitude: '感恩',
      health: '健康',
      personalDevelopment: '个人发展',
      creativity: '创造力',
      relationships: '关系'
    },
    ja: {
      family: '家族',
      work: '仕事',
      finance: '財務',
      gratitude: '感謝',
      health: '健康',
      personalDevelopment: '自己啓発',
      creativity: '創造性',
      relationships: '人間関係'
    }
  };

  const translations = categoryTranslations[language] || categoryTranslations.ru;
  return translations[category] || category;
}

