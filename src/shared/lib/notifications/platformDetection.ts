/**
 * Push Notifications Platform Detection
 *
 * Определяет платформу пользователя и поддержку Push Notifications
 */

export type DevicePlatform = 'ios' | 'android' | 'desktop' | 'unknown';
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'telegram' | 'unknown';

export interface PushPlatformInfo {
	device: DevicePlatform;
	browser: BrowserType;
	isPWA: boolean;
	isTelegram: boolean;
	pushSupported: boolean;
	pushSupportReason: string;
	instructions?: string;
}

/**
 * Проверяет является ли устройство iOS (мобильное)
 */
export function isIOSDevice(): boolean {
	const userAgent = navigator.userAgent;
	const platform = navigator.platform;

	// ВАЖНО: Исключаем Mac (Desktop)
	// Mac может иметь "Mac" в userAgent, но это НЕ iOS
	if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
		return false;
	}

	if (/Mac/.test(platform) && !/iPhone|iPad|iPod/.test(userAgent)) {
		return false;
	}

	// Проверяем только мобильные iOS устройства
	return /iPhone|iPad|iPod/.test(userAgent);
}

/**
 * Проверяет является ли устройство Android
 */
export function isAndroidDevice(): boolean {
	const userAgent = navigator.userAgent;
	return /Android/.test(userAgent);
}

/**
 * Проверяет является ли устройство Desktop Mac
 */
export function isMacDesktop(): boolean {
	const userAgent = navigator.userAgent;
	const platform = navigator.platform;

	return (
		/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent) ||
		(/Mac/.test(platform) && !/iPhone|iPad|iPod/.test(userAgent))
	);
}

/**
 * Проверяет запущено ли приложение как PWA
 */
export function isPWAMode(): boolean {
	// iOS
	if ((window.navigator as { standalone?: boolean }).standalone === true) {
		return true;
	}

	// Android
	if (window.matchMedia('(display-mode: standalone)').matches) {
		return true;
	}

	return false;
}

/**
 * Проверяет открыто ли приложение в Telegram
 */
export function isTelegramApp(): boolean {
	const userAgent = navigator.userAgent;
	return /Telegram/.test(userAgent) || (window as { Telegram?: unknown }).Telegram !== undefined;
}

/**
 * Определяет тип браузера
 */
export function detectBrowser(): BrowserType {
	const userAgent = navigator.userAgent;

	if (isTelegramApp()) {
		return 'telegram';
	}

	if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) {
		return 'chrome';
	}

	if (/Firefox/.test(userAgent)) {
		return 'firefox';
	}

	if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
		return 'safari';
	}

	if (/Edge/.test(userAgent)) {
		return 'edge';
	}

	return 'unknown';
}

/**
 * Определяет тип устройства
 */
export function detectDevice(): DevicePlatform {
	// ВАЖНО: Проверяем в правильном порядке!
	// 1. Сначала проверяем мобильные устройства
	if (isIOSDevice()) {
		return 'ios';
	}

	if (isAndroidDevice()) {
		return 'android';
	}

	// 2. Все остальное - desktop (включая Mac)
	return 'desktop';
}

/**
 * Получает версию iOS
 */
function getIOSVersion(): number | null {
	const match = navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
	if (!match) return null;

	const major = Number.parseInt(match[1], 10);
	const minor = Number.parseInt(match[2], 10);

	return major + minor / 10;
}

/**
 * Проверяет поддержку Push Notifications
 */
export function checkPushSupport(): {
	supported: boolean;
	reason: string;
	instructions?: string;
} {
	const device = detectDevice();
	const pwa = isPWAMode();
	const telegram = isTelegramApp();

	// Telegram - используем Telegram Bot
	if (telegram) {
		return {
			supported: true,
			reason: 'telegram_bot',
			instructions: 'Уведомления будут отправляться через Telegram Bot',
		};
	}

	// iOS - требует PWA
	if (device === 'ios') {
		if (!pwa) {
			return {
				supported: false,
				reason: 'ios_requires_pwa',
				instructions:
					'Для получения уведомлений на iOS установите приложение на Home Screen:\n\n' +
					'1. Нажмите кнопку "Поделиться" (квадрат со стрелкой вверх)\n' +
					'2. Выберите "На экран Домой"\n' +
					'3. Нажмите "Добавить"\n' +
					'4. Откройте приложение через иконку на Home Screen',
			};
		}

		// iOS PWA - проверяем версию iOS
		const iosVersion = getIOSVersion();
		if (iosVersion && iosVersion < 16.4) {
			return {
				supported: false,
				reason: 'ios_version_too_old',
				instructions: 'Обновите iOS до версии 16.4 или выше для поддержки уведомлений',
			};
		}

		return {
			supported: true,
			reason: 'ios_pwa',
		};
	}

	// Android - проверяем наличие Service Worker и PushManager
	if (device === 'android') {
		if (!('serviceWorker' in navigator)) {
			return {
				supported: false,
				reason: 'service_worker_not_supported',
				instructions: 'Ваш браузер не поддерживает Service Worker',
			};
		}

		if (!('PushManager' in window)) {
			return {
				supported: false,
				reason: 'push_manager_not_supported',
				instructions: 'Ваш браузер не поддерживает Push Notifications',
			};
		}

		return {
			supported: true,
			reason: 'android_browser',
		};
	}

	// Desktop - проверяем наличие Service Worker и PushManager
	if (!('serviceWorker' in navigator)) {
		return {
			supported: false,
			reason: 'service_worker_not_supported',
			instructions: 'Ваш браузер не поддерживает Service Worker',
		};
	}

	if (!('PushManager' in window)) {
		return {
			supported: false,
			reason: 'push_manager_not_supported',
			instructions: 'Ваш браузер не поддерживает Push Notifications',
		};
	}

	return {
		supported: true,
		reason: 'desktop_browser',
	};
}

/**
 * Получает полную информацию о платформе для Push Notifications
 */
export function getPushPlatformInfo(): PushPlatformInfo {
	const device = detectDevice();
	const browser = detectBrowser();
	const pwa = isPWAMode();
	const telegram = isTelegramApp();
	const pushSupport = checkPushSupport();

	return {
		device,
		browser,
		isPWA: pwa,
		isTelegram: telegram,
		pushSupported: pushSupport.supported,
		pushSupportReason: pushSupport.reason,
		instructions: pushSupport.instructions,
	};
}
