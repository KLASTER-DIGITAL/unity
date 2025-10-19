/**
 * Platform Detection System for UNITY-v2
 * 
 * Provides universal platform detection and selection utilities
 * for cross-platform compatibility (Web/React Native)
 * 
 * @author UNITY Team
 * @date 2025-01-18
 */

export type PlatformType = 'web' | 'native';

export interface PlatformSpecific<T> {
  web?: T;
  native?: T;
  default?: T;
}

/**
 * Platform detection and selection utilities
 */
export const Platform = {
  /**
   * Current platform type
   */
  get OS(): PlatformType {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      return 'web';
    }
    
    // Check for React Native environment
    if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      return 'native';
    }
    
    // Default to web for SSR/Node environments
    return 'web';
  },

  /**
   * Check if running on web platform
   */
  get isWeb(): boolean {
    return this.OS === 'web';
  },

  /**
   * Check if running on native platform (React Native)
   */
  get isNative(): boolean {
    return this.OS === 'native';
  },

  /**
   * Check if DOM APIs are available
   */
  get hasDOMAPI(): boolean {
    return typeof window !== 'undefined' && 
           typeof document !== 'undefined' && 
           typeof localStorage !== 'undefined';
  },

  /**
   * Check if running in browser
   */
  get isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.location !== 'undefined';
  },

  /**
   * Check if running in PWA mode
   */
  get isPWA(): boolean {
    if (!this.isBrowser) return false;
    
    // Check if running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    // Check if launched from home screen (iOS)
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    return isStandalone || isIOSStandalone;
  },

  /**
   * Select platform-specific implementation
   * 
   * @param specifics - Platform-specific implementations
   * @returns Selected implementation based on current platform
   * 
   * @example
   * ```typescript
   * const storage = Platform.select({
   *   web: new WebStorage(),
   *   native: new AsyncStorage(),
   *   default: new MemoryStorage()
   * });
   * ```
   */
  select<T>(specifics: PlatformSpecific<T>): T {
    if (this.isWeb && specifics.web !== undefined) {
      return specifics.web;
    }
    
    if (this.isNative && specifics.native !== undefined) {
      return specifics.native;
    }
    
    if (specifics.default !== undefined) {
      return specifics.default;
    }
    
    throw new Error(
      `No implementation found for platform "${this.OS}". ` +
      `Available: ${Object.keys(specifics).join(', ')}`
    );
  },

  /**
   * Execute platform-specific code
   * 
   * @param specifics - Platform-specific functions
   * 
   * @example
   * ```typescript
   * Platform.execute({
   *   web: () => console.log('Running on web'),
   *   native: () => console.log('Running on React Native'),
   *   default: () => console.log('Running on unknown platform')
   * });
   * ```
   */
  execute(specifics: PlatformSpecific<() => void>): void {
    const fn = this.select(specifics);
    if (typeof fn === 'function') {
      fn();
    }
  },

  /**
   * Get platform-specific value with fallback
   * 
   * @param webValue - Value for web platform
   * @param nativeValue - Value for native platform
   * @param defaultValue - Fallback value
   * @returns Platform-specific value
   */
  value<T>(webValue: T, nativeValue: T, defaultValue?: T): T {
    return this.select({
      web: webValue,
      native: nativeValue,
      default: defaultValue ?? webValue
    });
  }
};

/**
 * Platform-specific constants
 */
export const PlatformConstants = {
  /**
   * Maximum file size for uploads (bytes)
   */
  MAX_FILE_SIZE: Platform.value(
    50 * 1024 * 1024, // 50MB for web
    20 * 1024 * 1024, // 20MB for native
    10 * 1024 * 1024  // 10MB default
  ),

  /**
   * Supported image formats
   */
  SUPPORTED_IMAGE_FORMATS: Platform.value(
    ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], // Web
    ['image/jpeg', 'image/png'], // Native
    ['image/jpeg', 'image/png']  // Default
  ),

  /**
   * Supported video formats
   */
  SUPPORTED_VIDEO_FORMATS: Platform.value(
    ['video/mp4', 'video/webm', 'video/ogg'], // Web
    ['video/mp4'], // Native
    ['video/mp4']  // Default
  ),

  /**
   * Animation duration (ms)
   */
  ANIMATION_DURATION: Platform.value(
    300, // Web
    250, // Native (slightly faster for better feel)
    300  // Default
  ),

  /**
   * Touch feedback delay (ms)
   */
  TOUCH_FEEDBACK_DELAY: Platform.value(
    0,   // Web (no delay)
    50,  // Native (haptic feedback)
    0    // Default
  )
};

/**
 * Platform-specific feature detection
 */
export const PlatformFeatures = {
  /**
   * Check if haptic feedback is supported
   */
  get hasHapticFeedback(): boolean {
    return Platform.value(
      false, // Web (not widely supported)
      true,  // Native (React Native has haptic feedback)
      false  // Default
    );
  },

  /**
   * Check if camera is available
   */
  get hasCamera(): boolean {
    if (Platform.isWeb) {
      return navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices;
    }
    
    if (Platform.isNative) {
      return true; // Assume camera is available in React Native
    }
    
    return false;
  },

  /**
   * Check if geolocation is available
   */
  get hasGeolocation(): boolean {
    return 'geolocation' in navigator;
  },

  /**
   * Check if push notifications are supported
   */
  get hasPushNotifications(): boolean {
    if (Platform.isWeb) {
      return 'serviceWorker' in navigator && 'PushManager' in window;
    }
    
    if (Platform.isNative) {
      return true; // React Native has push notifications
    }
    
    return false;
  },

  /**
   * Check if offline storage is available
   */
  get hasOfflineStorage(): boolean {
    if (Platform.isWeb) {
      return 'localStorage' in window && 'indexedDB' in window;
    }
    
    if (Platform.isNative) {
      return true; // React Native has AsyncStorage
    }
    
    return false;
  }
};

/**
 * Development utilities
 */
export const PlatformDev = {
  /**
   * Log platform information
   */
  logPlatformInfo(): void {
    console.group('🔍 Platform Detection');
    console.log('Platform:', Platform.OS);
    console.log('Is Web:', Platform.isWeb);
    console.log('Is Native:', Platform.isNative);
    console.log('Has DOM API:', Platform.hasDOMAPI);
    console.log('Is Browser:', Platform.isBrowser);
    console.log('Is PWA:', Platform.isPWA);
    console.log('Features:', {
      camera: PlatformFeatures.hasCamera,
      haptic: PlatformFeatures.hasHapticFeedback,
      geolocation: PlatformFeatures.hasGeolocation,
      pushNotifications: PlatformFeatures.hasPushNotifications,
      offlineStorage: PlatformFeatures.hasOfflineStorage
    });
    console.groupEnd();
  }
};

// Auto-log platform info in development
if (process.env.NODE_ENV === 'development') {
  PlatformDev.logPlatformInfo();
}
