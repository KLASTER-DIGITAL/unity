/**
 * Web Haptics Adapter
 *
 * Uses Vibration API for haptic feedback in web browsers
 *
 * Browser Support:
 * - Chrome/Edge: Full support
 * - Firefox: Full support
 * - Safari iOS: Partial support (requires user interaction)
 * - Safari macOS: No support (no vibration hardware)
 *
 * @module platform/haptics/web
 */

import { storage } from '../storage';
import type { HapticAdapter, HapticFeedbackType, HapticOptions } from './types';
import { HAPTIC_PATTERNS, HAPTIC_STORAGE_KEY } from './types';

/**
 * Web haptics adapter using Vibration API
 */
export class WebHapticAdapter implements HapticAdapter {
	private enabled = true;
	private enabledStateLoaded = false;

	/**
	 * Load haptic enabled state from storage (lazy loading)
	 * Called on first trigger() to avoid blocking constructor
	 */
	private async loadEnabledState(): Promise<void> {
		if (this.enabledStateLoaded) {
			return; // Already loaded
		}

		try {
			const storedValue = await storage.getItem(HAPTIC_STORAGE_KEY);
			if (storedValue !== null) {
				this.enabled = storedValue === 'true';
			}
			this.enabledStateLoaded = true;
		} catch (error) {
			console.warn('[WebHapticAdapter] Failed to load enabled state:', error);
			this.enabledStateLoaded = true; // Mark as loaded even on error
		}
	}

	/**
	 * Check if Vibration API is supported
	 */
	isSupported(): boolean {
		return (
			typeof navigator !== 'undefined' &&
			('vibrate' in navigator || 'mozVibrate' in navigator || 'webkitVibrate' in navigator)
		);
	}

	/**
	 * Trigger haptic feedback
	 * Note: This method is async for interface compatibility, but vibration is triggered synchronously
	 * to avoid blocking event handlers. Call without await for better performance.
	 */
	async trigger(type: HapticFeedbackType, options?: HapticOptions): Promise<void> {
		// Lazy load enabled state on first trigger (non-blocking)
		if (!this.enabledStateLoaded) {
			// Load in background, don't await to avoid blocking
			this.loadEnabledState().catch((error) => {
				console.warn('[WebHapticAdapter] Failed to load enabled state:', error);
			});
		}

		// Check if haptic is enabled (global or per-call)
		const isEnabled = options?.enabled !== undefined ? options.enabled : this.enabled;

		if (!isEnabled) {
			return;
		}

		// Check if Vibration API is supported
		if (!this.isSupported()) {
			return; // Silent return - no need to warn on desktop
		}

		// Execute vibration synchronously (no setTimeout needed - vibration is already fast)
		this.executeVibration(type, options);
	}

	/**
	 * Execute vibration (internal method)
	 */
	private executeVibration(type: HapticFeedbackType, options?: HapticOptions): void {
		try {
			// Get vibration pattern or duration
			let pattern: number | number[];

			if (options?.pattern) {
				// Use custom pattern if provided
				pattern = options.pattern;
			} else if (options?.duration) {
				// Use custom duration if provided
				pattern = options.duration;
			} else {
				// Use predefined pattern for the type
				pattern = HAPTIC_PATTERNS[type];
			}

			// Trigger vibration synchronously (but called from async context)
			if (typeof navigator !== 'undefined' && navigator.vibrate) {
				navigator.vibrate(pattern);
			}
		} catch (error) {
			console.error('[WebHapticAdapter] Error triggering haptic feedback:', error);
		}
	}

	/**
	 * Enable or disable haptic feedback globally
	 */
	async setEnabled(enabled: boolean): Promise<void> {
		this.enabled = enabled;

		try {
			await storage.setItem(HAPTIC_STORAGE_KEY, enabled.toString());
		} catch (error) {
			console.error('[WebHapticAdapter] Failed to save enabled state:', error);
		}
	}

	/**
	 * Get current haptic feedback enabled state
	 */
	async isEnabled(): Promise<boolean> {
		return this.enabled;
	}
}

/**
 * Utility functions for haptic feedback
 */
export class HapticUtils {
	/**
	 * Check if device likely has vibration hardware
	 * (heuristic based on user agent)
	 */
	static hasVibrationHardware(): boolean {
		if (typeof navigator === 'undefined') {
			return false;
		}

		const userAgent = navigator.userAgent.toLowerCase();

		// Mobile devices likely have vibration
		const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
			userAgent
		);

		// Desktop devices (except some laptops) typically don't have vibration
		const isDesktop = /windows|macintosh|linux/i.test(userAgent) && !isMobile;

		return isMobile && !isDesktop;
	}

	/**
	 * Test vibration with a short pulse
	 * Useful for settings UI to let users test haptic feedback
	 */
	static async testVibration(): Promise<boolean> {
		if (typeof navigator === 'undefined' || !navigator.vibrate) {
			return false;
		}

		try {
			return navigator.vibrate(50);
		} catch (error) {
			console.error('[HapticUtils] Test vibration failed:', error);
			return false;
		}
	}

	/**
	 * Cancel any ongoing vibration
	 */
	static cancelVibration(): void {
		if (typeof navigator !== 'undefined' && navigator.vibrate) {
			navigator.vibrate(0);
		}
	}

	/**
	 * Create a custom haptic pattern
	 *
	 * @param pulses - Array of pulse durations in milliseconds
	 * @param pauses - Array of pause durations in milliseconds
	 * @returns Vibration pattern array
	 *
	 * @example
	 * ```typescript
	 * // Create a pattern: vibrate 100ms, pause 50ms, vibrate 100ms
	 * const pattern = HapticUtils.createPattern([100, 100], [50]);
	 * // Result: [100, 50, 100]
	 * ```
	 */
	static createPattern(pulses: number[], pauses: number[]): number[] {
		const pattern: number[] = [];

		for (let i = 0; i < pulses.length; i++) {
			pattern.push(pulses[i]);
			if (i < pauses.length) {
				pattern.push(pauses[i]);
			}
		}

		return pattern;
	}
}
