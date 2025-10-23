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
    if (navigator.permissions && navigator.permissions.query) {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
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
 */
export const triggerHapticFeedback = (pattern: number | number[] = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

