/**
 * Haptics Platform Adapter - Type Definitions
 *
 * Provides cross-platform haptic feedback types:
 * - Web: Vibration API
 * - Native: expo-haptics
 *
 * @module platform/haptics/types
 */

/**
 * Haptic feedback intensity types
 */
export type HapticFeedbackType =
	| 'light' // Легкое касание (для обычных кнопок, карточек)
	| 'medium' // Среднее касание (для важных действий)
	| 'heavy' // Сильное касание (для критических действий)
	| 'success' // Успешное действие
	| 'warning' // Предупреждение
	| 'error'; // Ошибка

/**
 * Haptic feedback options
 */
export interface HapticOptions {
	/**
	 * Whether haptic feedback is enabled
	 * Can be controlled by user settings
	 */
	enabled?: boolean;

	/**
	 * Custom vibration pattern (web only)
	 * Array of vibration durations in milliseconds
	 * Example: [100, 50, 100] - vibrate 100ms, pause 50ms, vibrate 100ms
	 */
	pattern?: number[];

	/**
	 * Custom vibration duration (web only)
	 * Duration in milliseconds
	 */
	duration?: number;
}

/**
 * Haptic adapter interface
 */
export interface HapticAdapter {
	/**
	 * Trigger haptic feedback
	 *
	 * @param type - Type of haptic feedback
	 * @param options - Optional haptic options
	 *
	 * @example
	 * ```typescript
	 * // Light feedback for button press
	 * haptics.trigger('light');
	 *
	 * // Success feedback with custom options
	 * haptics.trigger('success', { enabled: true });
	 *
	 * // Custom vibration pattern
	 * haptics.trigger('medium', { pattern: [10, 50, 10] });
	 * ```
	 */
	trigger(type: HapticFeedbackType, options?: HapticOptions): Promise<void>;

	/**
	 * Check if haptic feedback is supported on this device
	 *
	 * @returns True if haptic feedback is supported
	 */
	isSupported(): boolean;

	/**
	 * Enable or disable haptic feedback globally
	 *
	 * @param enabled - Whether to enable haptic feedback
	 */
	setEnabled(enabled: boolean): Promise<void>;

	/**
	 * Get current haptic feedback enabled state
	 *
	 * @returns True if haptic feedback is enabled
	 */
	isEnabled(): Promise<boolean>;
}

/**
 * Haptic feedback patterns for different types
 */
export const HAPTIC_PATTERNS: Record<HapticFeedbackType, number | number[]> = {
	light: 10, // 10ms vibration
	medium: 20, // 20ms vibration
	heavy: 30, // 30ms vibration
	success: [10, 50, 10], // Short-pause-short pattern
	warning: [20, 100, 20], // Medium-pause-medium pattern
	error: [30, 100, 30, 100, 30], // Heavy-pause-heavy-pause-heavy pattern
};

/**
 * Storage key for haptic feedback enabled state
 */
export const HAPTIC_STORAGE_KEY = 'haptic_feedback_enabled';
