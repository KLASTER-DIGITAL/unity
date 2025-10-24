/**
 * Platform Abstraction Layer for UNITY-v2
 * 
 * Provides cross-platform utilities and adapters for Web and React Native
 * 
 * @author UNITY Team
 * @date 2025-01-18
 */

// Platform detection
export {
  Platform,
  PlatformConstants,
  PlatformFeatures,
  PlatformDev,
  type PlatformType,
  type PlatformSpecific
} from './detection';

// Storage adapter
export {
  storage,
  StorageUtils,
  StorageKeys,
  type StorageAdapter
} from './storage';

// Media adapter
export {
  media,
  MediaUtils,
  type MediaAdapter
} from './media';

// Navigation adapter
export {
  navigation,
  NavigationUtils,
  type NavigationAdapter,
  type RouteParams,
  type NavigationOptions
} from './navigation';

// React Native readiness checker
export {
  ReactNativeReadinessChecker,
  checkReactNativeReadiness,
  type ReadinessCheckResult,
  type ReadinessReport
} from './react-native-readiness';

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
  getConstant<K extends keyof typeof PlatformConstants>(key: K): typeof PlatformConstants[K] {
    return PlatformConstants[key];
  }
};

/**
 * Re-export commonly used platform utilities
 */
export { Platform as default } from './detection';
