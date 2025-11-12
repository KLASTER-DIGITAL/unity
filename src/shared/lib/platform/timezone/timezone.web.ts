/**
 * Platform Adapter: Timezone Detection (Web)
 *
 * Использует Intl.DateTimeFormat API для автоопределения timezone
 * Поддержка: 99% современных браузеров (Chrome 24+, Firefox 29+, Safari 10+)
 */

import type { TimezoneAdapter, TimezoneInfo } from './types';

/**
 * Список популярных timezone для fallback
 * Отсортированы по количеству пользователей
 */
const COMMON_TIMEZONES = [
	'UTC',
	'Europe/Moscow', // UTC+3
	'America/New_York', // UTC-5
	'America/Los_Angeles', // UTC-8
	'Europe/London', // UTC+0
	'Europe/Paris', // UTC+1
	'Asia/Tokyo', // UTC+9
	'Asia/Shanghai', // UTC+8
	'Asia/Dubai', // UTC+4
	'Australia/Sydney', // UTC+10
	'America/Chicago', // UTC-6
	'America/Denver', // UTC-7
	'Asia/Kolkata', // UTC+5:30
	'America/Sao_Paulo', // UTC-3
	'Africa/Cairo', // UTC+2
];

/**
 * Проверяет использует ли timezone DST (летнее время)
 */
function checkDST(timezone: string): boolean {
	try {
		const jan = new Date(2024, 0, 1); // Январь
		const jul = new Date(2024, 6, 1); // Июль

		const janOffset = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'short',
		})
			.formatToParts(jan)
			.find((part) => part.type === 'timeZoneName')?.value;

		const julOffset = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'short',
		})
			.formatToParts(jul)
			.find((part) => part.type === 'timeZoneName')?.value;

		// Если offset разный зимой и летом → используется DST
		return janOffset !== julOffset;
	} catch {
		return false;
	}
}

/**
 * Получает UTC offset в минутах для timezone
 */
function getOffsetMinutes(timezone: string): number {
	try {
		const now = new Date();
		const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
		const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
		return Math.round((tzDate.getTime() - utcDate.getTime()) / 60000);
	} catch {
		return 0;
	}
}

/**
 * Получает человекочитаемое название timezone
 */
function getDisplayName(timezone: string): string {
	try {
		const formatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'long',
		});
		const parts = formatter.formatToParts(new Date());
		return parts.find((part) => part.type === 'timeZoneName')?.value || timezone;
	} catch {
		return timezone;
	}
}

class WebTimezoneAdapter implements TimezoneAdapter {
	getCurrentTimezone(): Promise<TimezoneInfo> {
		try {
			// Используем Intl.DateTimeFormat для автоопределения
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

			if (!timezone) {
				throw new Error('Timezone not available');
			}

			const offsetMinutes = getOffsetMinutes(timezone);
			const displayName = getDisplayName(timezone);
			const usesDST = checkDST(timezone);

			console.log('[Timezone Web] Auto-detected:', {
				timezone,
				offsetMinutes,
				displayName,
				usesDST,
			});

			return Promise.resolve({
				timezone,
				offsetMinutes,
				displayName,
				usesDST,
			});
		} catch (error) {
			console.error('[Timezone Web] Auto-detection failed:', error);

			// Fallback: UTC
			return Promise.resolve({
				timezone: 'UTC',
				offsetMinutes: 0,
				displayName: 'Coordinated Universal Time',
				usesDST: false,
			});
		}
	}

	isSupported(): boolean {
		try {
			// Проверяем поддержку Intl.DateTimeFormat
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			return Boolean(timezone);
		} catch {
			return false;
		}
	}

	getCommonTimezones(): string[] {
		return COMMON_TIMEZONES;
	}
}

export const timezoneAdapter = new WebTimezoneAdapter();
