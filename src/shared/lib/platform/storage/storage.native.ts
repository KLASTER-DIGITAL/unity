/**
 * Native Storage Adapter for React Native
 * 
 * Uses @react-native-async-storage/async-storage for persistent storage
 * 
 * @module platform/storage/native
 */

import type { StorageAdapter } from '../storage';

/**
 * React Native storage adapter using AsyncStorage
 *
 * Note: This implementation uses dynamic import to avoid bundling
 * AsyncStorage in web builds. The actual AsyncStorage will be
 * imported at runtime when running on React Native.
 */
export class NativeStorageAdapter implements StorageAdapter {
  private asyncStorage: any = null;
  private initialized: boolean = false;

  /**
   * Initialize AsyncStorage (lazy loading)
   */
  private async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if we're in a React Native environment
      if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
        // Dynamic import to avoid bundling in web
        // @ts-expect-error - @react-native-async-storage/async-storage is not installed in PWA build
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        this.asyncStorage = AsyncStorage.default;
        this.initialized = true;
      } else {
        throw new Error('AsyncStorage is only available in React Native environment');
      }
    } catch (error) {
      console.error('Failed to load AsyncStorage:', error);
      throw new Error('AsyncStorage is not available. Make sure @react-native-async-storage/async-storage is installed.');
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      await this.init();
      return await this.asyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.init();
      await this.asyncStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.init();
      await this.asyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.init();
      await this.asyncStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      await this.init();
      return await this.asyncStorage.getAllKeys();
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    try {
      await this.init();
      return await this.asyncStorage.multiGet(keys);
    } catch (error) {
      console.error('AsyncStorage multiGet error:', error);
      return keys.map(key => [key, null]);
    }
  }

  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    try {
      await this.init();
      await this.asyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('AsyncStorage multiSet error:', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await this.init();
      await this.asyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('AsyncStorage multiRemove error:', error);
      throw error;
    }
  }
}

