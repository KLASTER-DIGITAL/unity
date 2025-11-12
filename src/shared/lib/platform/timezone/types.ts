/**
 * Platform Adapter: Timezone Detection
 *
 * Автоматическое определение часового пояса пользователя
 * БЕЗ ручного выбора (лучшая практика UX)
 *
 * Web: Intl.DateTimeFormat().resolvedOptions().timeZone
 * React Native: expo-localization getCalendars()[0].timeZone
 */

export interface TimezoneInfo {
	/**
	 * IANA timezone identifier
	 * Примеры: "Europe/Moscow", "America/New_York", "Asia/Tokyo"
	 */
	timezone: string;

	/**
	 * UTC offset в минутах
	 * Примеры: 180 (UTC+3), -300 (UTC-5), 540 (UTC+9)
	 */
	offsetMinutes: number;

	/**
	 * Человекочитаемое название
	 * Примеры: "Moscow Standard Time", "Eastern Standard Time"
	 */
	displayName: string;

	/**
	 * Использует ли DST (летнее время)
	 */
	usesDST: boolean;
}

export interface TimezoneAdapter {
	/**
	 * Получить текущий timezone пользователя
	 * АВТОМАТИЧЕСКИ определяет без запроса разрешений
	 */
	getCurrentTimezone(): Promise<TimezoneInfo>;

	/**
	 * Проверить поддержку автоопределения timezone
	 */
	isSupported(): boolean;

	/**
	 * Получить список популярных timezone для fallback
	 */
	getCommonTimezones(): string[];
}
