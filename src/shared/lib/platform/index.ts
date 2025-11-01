/**
 * Platform Abstraction Layer for UNITY-v2
 *
 * Provides cross-platform utilities and adapters for Web and React Native
 *
 * @author UNITY Team
 * @date 2025-01-18
 */

// Platform detection
import {
	Platform,
	PlatformConstants,
	PlatformDev,
	PlatformFeatures,
	type PlatformSpecific,
	type PlatformType,
} from './detection';

export {
	Platform,
	PlatformConstants,
	PlatformFeatures,
	PlatformDev,
	type PlatformType,
	type PlatformSpecific,
};

// Haptics adapter
export {
	HAPTIC_PATTERNS,
	HAPTIC_STORAGE_KEY,
	type HapticAdapter,
	type HapticFeedbackType,
	type HapticOptions,
	HapticUtils,
	haptics,
} from './haptics';
// Media adapter
export {
	type MediaAdapter,
	MediaUtils,
	media,
} from './media';
// Navigation adapter
export {
	type NavigationAdapter,
	type NavigationOptions,
	NavigationUtils,
	navigation,
	type RouteParams,
} from './navigation';
// React Native readiness checker
export {
	checkReactNativeReadiness,
	ReactNativeReadinessChecker,
	type ReadinessCheckResult,
	type ReadinessReport,
} from './react-native-readiness';
// Storage adapter
export {
	type StorageAdapter,
	StorageKeys,
	StorageUtils,
	storage,
} from './storage';

/**
 * Platform abstraction utilities
 */
export const PlatformUtils = {
	/**
	 * Get platform-specific file path separator
	 */
	get pathSeparator(): string {
		return Platform.value('/', '/', '/');
	},

	/**
	 * Get platform-specific line ending
	 */
	get lineEnding(): string {
		return Platform.value('\n', '\n', '\n');
	},

	/**
	 * Check if platform supports feature
	 */
	supportsFeature(feature: keyof typeof PlatformFeatures): boolean {
		return PlatformFeatures[feature];
	},

	/**
	 * Get platform-specific constant
	 */
	getConstant<K extends keyof typeof PlatformConstants>(key: K): (typeof PlatformConstants)[K] {
		return PlatformConstants[key];
	},
};

/**
 * Re-export commonly used platform utilities
 */
export { Platform as default } from './detection';
