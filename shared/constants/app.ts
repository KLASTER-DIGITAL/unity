/**
 * App Constants - Shared between PWA and React Native
 *
 * TRULY shared code - NO platform-specific imports
 */

export const APP_NAME = 'UNITY';
export const APP_VERSION = '2.0.0';
export const APP_DESCRIPTION = 'Дневник достижений и саморазвития';

export const SUPPORTED_LANGUAGES = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
] as const;

export const DEFAULT_LANGUAGE = 'ru';

export const THEME_OPTIONS = ['light', 'dark', 'system'] as const;
export const DEFAULT_THEME = 'light';

export const MOOD_SCALE = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 3,
} as const;

export const ENTRY_LIMITS = {
  TITLE_MAX_LENGTH: 100,
  CONTENT_MAX_LENGTH: 10_000,
  TAGS_MAX_COUNT: 10,
  MEDIA_MAX_COUNT: 10,
} as const;
