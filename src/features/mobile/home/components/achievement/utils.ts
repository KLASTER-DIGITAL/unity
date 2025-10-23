import type { DiaryEntry } from "@/shared/lib/api";
import { getCategoryTranslation, type Language } from "@/shared/lib/i18n";
import { GRADIENTS, DEFAULT_MOTIVATIONS } from "./constants";
import type { AchievementCard } from "./types";

/**
 * Achievement Home Screen - Utility functions
 */

// Функция получения дефолтных мотиваций с учетом языка
export function getDefaultMotivations(language: string): AchievementCard[] {
  return DEFAULT_MOTIVATIONS[language] || DEFAULT_MOTIVATIONS['ru'];
}

// Функция для конвертации DiaryEntry в AchievementCard
export function entryToCard(entry: DiaryEntry, index: number, userLanguage: Language = 'ru'): AchievementCard {
  const gradientList = GRADIENTS[entry.sentiment] || GRADIENTS.positive;
  const gradient = gradientList[index % gradientList.length];
  
  const entryDate = new Date(entry.createdAt);
  const localeMap: Record<Language, string> = {
    ru: 'ru-RU',
    en: 'en-US',
    es: 'es-ES',
    de: 'de-DE',
    fr: 'fr-FR',
    zh: 'zh-CN',
    ja: 'ja-JP'
  };
  const dateFormatter = new Intl.DateTimeFormat(localeMap[userLanguage] || 'ru-RU', { 
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  // Используем aiSummary как title, если доступно
  const title = entry.aiSummary || getCategoryTranslation(entry.category || "Achievement", userLanguage);
  
  // Используем aiInsight как description, если доступно
  const description = entry.aiInsight || entry.text;
  
  return {
    id: entry.id,
    date: dateFormatter.format(entryDate),
    title,
    description,
    gradient,
    isMarked: false,
    category: entry.category,
    sentiment: entry.sentiment
  };
}

