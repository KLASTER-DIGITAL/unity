/**
 * Утилита для отслеживания первого запуска приложения
 * Используется для показа логотипа Lottie только один раз при первом открытии
 */

const FIRST_LAUNCH_KEY = 'unity_first_launch_completed';

/**
 * Проверяет, был ли уже показан логотип при первом запуске
 */
export function hasShownLogoBefore(): boolean {
	if (typeof window === 'undefined') {
		return false;
	}

	try {
		const value = localStorage.getItem(FIRST_LAUNCH_KEY);
		return value === 'true';
	} catch (error) {
		console.warn('[firstLaunch] Failed to check first launch:', error);
		return false;
	}
}

/**
 * Отмечает, что логотип был показан (после завершения онбординга)
 */
export function markLogoAsShown(): void {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		localStorage.setItem(FIRST_LAUNCH_KEY, 'true');
	} catch (error) {
		console.warn('[firstLaunch] Failed to mark logo as shown:', error);
	}
}

/**
 * Сбрасывает флаг первого запуска (для тестирования)
 */
export function resetFirstLaunch(): void {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		localStorage.removeItem(FIRST_LAUNCH_KEY);
	} catch (error) {
		console.warn('[firstLaunch] Failed to reset first launch:', error);
	}
}


