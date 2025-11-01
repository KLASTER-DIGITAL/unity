/**
 * Utility functions for checking and handling permissions
 */

/**
 * Check microphone permission status
 * @returns Permission status: 'granted', 'denied', or 'prompt'
 */
export const checkMicrophonePermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
	try {
		// Check Permissions API
		if (navigator.permissions?.query) {
			const result = await navigator.permissions.query({
				name: 'microphone' as PermissionName,
			});
			return result.state as 'granted' | 'denied' | 'prompt';
		}
	} catch (error) {
		console.log('Permissions API not available:', error);
	}

	// Fallback - try to get access
	return 'prompt';
};

/**
 * Trigger haptic feedback if supported
 * @param pattern Vibration pattern (number or array of numbers)
 * Note: Executes asynchronously to avoid blocking event handlers
 */
export const triggerHapticFeedback = (pattern: number | number[] = 50) => {
	// Execute vibration in next tick to avoid blocking event handlers
	setTimeout(() => {
		if (typeof navigator !== 'undefined' && navigator.vibrate) {
			try {
				navigator.vibrate(pattern);
			} catch (error) {
				// Silently fail - vibration is not critical
				console.debug('Vibration failed:', error);
			}
		}
	}, 0);
};
