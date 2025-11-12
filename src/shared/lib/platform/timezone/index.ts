/**
 * Platform Adapter: Timezone Detection
 *
 * Автоматическое определение часового пояса пользователя
 * БЕЗ ручного выбора (лучшая практика UX)
 *
 * Web: Intl.DateTimeFormat().resolvedOptions().timeZone
 * React Native: expo-localization getCalendars()[0].timeZone
 */

export { timezoneAdapter } from './timezone.web';
export * from './types';
