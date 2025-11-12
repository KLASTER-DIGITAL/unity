/**
 * Platform Adapter: Timezone Detection (React Native)
 *
 * Использует expo-localization для автоопределения timezone
 * Поддержка: iOS 10+, Android 5.0+
 */

import { getCalendars } from 'expo-localization';
import type {
	TimezoneAdapter,
	TimezoneInfo,
} from '../../../src/shared/lib/platform/timezone/types';

/**
 * Список популярных timezone для fallback
 */
const COMMON_TIMEZONES = [
	'UTC',
	'Europe/Moscow',
	'America/New_York',
	'America/Los_Angeles',
	'Europe/London',
	'Europe/Paris',
	'Asia/Tokyo',
	'Asia/Shanghai',
	'Asia/Dubai',
	'Australia/Sydney',
	'America/Chicago',
	'America/Denver',
	'Asia/Kolkata',
	'America/Sao_Paulo',
	'Africa/Cairo',
];

/**
 * Проверяет использует ли timezone DST
 */
function checkDST(timezone: string): boolean {
	try {
		const jan = new Date(2024, 0, 1);
		const jul = new Date(2024, 6, 1);

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

		return janOffset !== julOffset;
	} catch {
		return false;
	}
}

/**
 * Получает UTC offset в минутах
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
 * Получает человекочитаемое название
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

class NativeTimezoneAdapter implements TimezoneAdapter {
	getCurrentTimezone(): Promise<TimezoneInfo> {
		try {
			// Используем expo-localization для автоопределения
			const calendars = getCalendars();
			const timezone = calendars[0]?.timeZone;

			if (!timezone) {
				throw new Error('Timezone not available');
			}

			const offsetMinutes = getOffsetMinutes(timezone);
			const displayName = getDisplayName(timezone);
			const usesDST = checkDST(timezone);

			console.log('[Timezone Native] Auto-detected:', {
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
			console.error('[Timezone Native] Auto-detection failed:', error);

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
			const calendars = getCalendars();
			return Boolean(calendars[0]?.timeZone);
		} catch {
			return false;
		}
	}

	getCommonTimezones(): string[] {
		return COMMON_TIMEZONES;
	}
}

export const timezoneAdapter = new NativeTimezoneAdapter();
