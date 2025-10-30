/**
 * Storage Platform Adapter
 *
 * ✅ PWA + React Native Architecture:
 * - PWA build (src/): ONLY web implementation
 * - React Native build (/app/): Uses /app/shared/lib/platform/storage.native.ts
 *
 * @module platform/storage
 */

import { WebStorageAdapter } from './storage.web';
import type { StorageAdapter } from './types';

// Re-export StorageAdapter interface
export type { StorageAdapter } from './types';

/**
 * Universal storage instance
 * PWA build: ONLY web implementation (localStorage)
 * React Native build: Uses AsyncStorage from /app/shared/lib/platform/storage.native.ts
 */
export const storage: StorageAdapter = new WebStorageAdapter();
