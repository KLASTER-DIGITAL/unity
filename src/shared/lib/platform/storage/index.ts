/**
 * Storage Platform Adapter
 *
 * Provides cross-platform storage functionality:
 * - Web: localStorage
 * - Native: AsyncStorage
 *
 * @module platform/storage
 */

import { Platform } from '../index';
import { WebStorageAdapter } from './storage.web';

// Re-export StorageAdapter interface from main storage file
export type { StorageAdapter } from '../storage';

/**
 * Universal storage instance
 * Automatically selects the appropriate storage adapter based on platform
 *
 * Note: NativeStorageAdapter is imported dynamically to avoid bundling
 * @react-native-async-storage/async-storage in web builds
 */
export const storage = Platform.select({
  web: new WebStorageAdapter(),
  native: new WebStorageAdapter(), // Placeholder - will be replaced with NativeStorageAdapter in RN
  default: new WebStorageAdapter(),
});

