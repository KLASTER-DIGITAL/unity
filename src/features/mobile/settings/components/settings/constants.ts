/**
 * Constants for Settings Screen
 */

import type { Language } from "./types";

// Default avatar URL
export const DEFAULT_AVATAR_URL = 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-5.png';

// Default languages (fallback if API fails)
export const DEFAULT_LANGUAGES: Language[] = [
  { code: 'ru', name: 'Russian', native_name: 'Русский', flag: '🇷🇺', is_active: true },
  { code: 'en', name: 'English', native_name: 'English', flag: '🇺🇸', is_active: true },
  { code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸', is_active: true },
  { code: 'de', name: 'German', native_name: 'Deutsch', flag: '🇩🇪', is_active: true },
  { code: 'fr', name: 'French', native_name: 'Français', flag: '🇫🇷', is_active: true },
  { code: 'zh', name: 'Chinese', native_name: '中文', flag: '🇨🇳', is_active: true },
  { code: 'ja', name: 'Japanese', native_name: '日本語', flag: '🇯🇵', is_active: true },
];

