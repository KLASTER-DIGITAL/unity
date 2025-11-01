/**
 * Haptics Platform Adapter
 *
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation (Vibration API)
 * - React Native build (/app/): Uses /app-shared/lib/platform/haptics.native.ts (expo-haptics)
 *
 * @module platform/haptics
 */

import { HapticUtils, WebHapticAdapter } from './haptics.web';
import type { HapticAdapter } from './types';

// Re-export types
export type { HapticAdapter, HapticFeedbackType, HapticOptions } from './types';
export { HAPTIC_PATTERNS, HAPTIC_STORAGE_KEY } from './types';

/**
 * Universal haptics instance
 * PWA build: ONLY web implementation (Vibration API)
 * React Native build: Uses expo-haptics from /app-shared/lib/platform/haptics.native.ts
 */
export const haptics: HapticAdapter = new WebHapticAdapter();

/**
 * Export utility functions
 */
export { HapticUtils };
