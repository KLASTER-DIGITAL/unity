/**
 * Navigation Platform Adapter
 * 
 * Provides cross-platform navigation functionality:
 * - Web: window.history API
 * - Native: @react-navigation/native
 * 
 * @module platform/navigation
 */

import { Platform } from '../index';
import { WebNavigationAdapter } from './navigation.web';

// Re-export types from main navigation file
export type { NavigationAdapter, NavigationOptions } from '../navigation';

/**
 * Universal navigation instance
 * Automatically selects the appropriate adapter based on platform
 * 
 * Note: NativeNavigationAdapter is not imported to avoid bundling
 * @react-navigation/native in web builds
 */
export const navigation = Platform.select({
  web: new WebNavigationAdapter(),
  native: new WebNavigationAdapter(), // Placeholder - will be replaced with NativeNavigationAdapter in RN
  default: new WebNavigationAdapter(),
});

