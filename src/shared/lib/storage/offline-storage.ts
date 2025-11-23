/**
 * Offline Storage - Platform Entry Point
 *
 * Conditionally exports the correct implementation based on platform.
 * - Web: Uses offline-storage.web.ts (IndexedDB via localforage)
 * - Native: Uses offline-storage.native.ts (FileSystem + AsyncStorage)
 */

export * from './offline-storage.web';
export * from './types';
