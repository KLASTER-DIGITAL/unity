/**
 * Offline Mode Helpers
 * 
 * Helper functions for offline mode access control and validation.
 * 
 * @author UNITY Team
 * @date 2025-10-28
 */

/**
 * Result of offline mode access check
 */
export interface OfflineModeAccessCheck {
  allowed: boolean;
  reason?: 'premium_required' | 'disabled' | 'not_authenticated';
  message?: string;
}

/**
 * User data interface for offline mode check
 */
export interface UserDataForOfflineCheck {
  profile?: {
    isPremium?: boolean;
    offlineEnabled?: boolean;
  };
  isPremium?: boolean;
  offlineEnabled?: boolean;
}

/**
 * Check if user can use offline mode
 * 
 * Requirements:
 * 1. User must be authenticated
 * 2. User must have Premium subscription
 * 3. User must have offline mode enabled in settings
 * 
 * @param userData - User data object
 * @returns Access check result
 * 
 * @example
 * ```typescript
 * const check = canUseOfflineMode(userData);
 * 
 * if (!check.allowed) {
 *   if (check.reason === 'premium_required') {
 *     // Show premium modal
 *     setShowPremium(true);
 *   } else {
 *     // Show info toast
 *     toast.info(check.message);
 *   }
 *   return;
 * }
 * 
 * // User can use offline mode
 * await saveEntryOffline(userId, text, options);
 * ```
 */
export function canUseOfflineMode(
  userData: UserDataForOfflineCheck | null | undefined
): OfflineModeAccessCheck {
  // Check 1: User must be authenticated
  if (!userData) {
    return {
      allowed: false,
      reason: 'not_authenticated',
      message: 'Войдите в систему для использования offline режима',
    };
  }

  // Extract isPremium and offlineEnabled from userData
  // Support both userData.profile.isPremium and userData.isPremium
  const isPremium = userData.profile?.isPremium ?? userData.isPremium ?? false;
  const offlineEnabled = userData.profile?.offlineEnabled ?? userData.offlineEnabled ?? false;

  // Check 2: User must have Premium subscription
  if (!isPremium) {
    return {
      allowed: false,
      reason: 'premium_required',
      message: 'Offline режим доступен только для Premium подписчиков',
    };
  }

  // Check 3: User must have offline mode enabled in settings
  if (!offlineEnabled) {
    return {
      allowed: false,
      reason: 'disabled',
      message: 'Включите Offline режим в настройках',
    };
  }

  // All checks passed
  return {
    allowed: true,
  };
}

/**
 * Get user-friendly message for offline mode access denial
 * 
 * @param check - Access check result
 * @returns User-friendly message
 */
export function getOfflineModeAccessMessage(check: OfflineModeAccessCheck): string {
  if (check.allowed) {
    return 'Offline режим активен';
  }

  return check.message || 'Offline режим недоступен';
}

/**
 * Check if offline mode should show premium modal
 * 
 * @param check - Access check result
 * @returns True if should show premium modal
 */
export function shouldShowPremiumModal(check: OfflineModeAccessCheck): boolean {
  return !check.allowed && check.reason === 'premium_required';
}

