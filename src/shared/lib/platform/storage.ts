/**
 * Universal Storage Adapter for UNITY-v2
 * 
 * Provides cross-platform storage interface that works on both
 * Web (localStorage) and React Native (AsyncStorage)
 * 
 * @author UNITY Team
 * @date 2025-01-18
 */

import { Platform } from './detection';

/**
 * Universal storage interface
 */
export interface StorageAdapter {
  /**
   * Get item from storage
   * @param key - Storage key
   * @returns Promise resolving to stored value or null
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Set item in storage
   * @param key - Storage key
   * @param value - Value to store
   * @returns Promise resolving when operation completes
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Remove item from storage
   * @param key - Storage key
   * @returns Promise resolving when operation completes
   */
  removeItem(key: string): Promise<void>;

  /**
   * Clear all items from storage
   * @returns Promise resolving when operation completes
   */
  clear(): Promise<void>;

  /**
   * Get all keys from storage
   * @returns Promise resolving to array of keys
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Get multiple items from storage
   * @param keys - Array of storage keys
   * @returns Promise resolving to array of [key, value] pairs
   */
  multiGet(keys: string[]): Promise<Array<[string, string | null]>>;

  /**
   * Set multiple items in storage
   * @param keyValuePairs - Array of [key, value] pairs
   * @returns Promise resolving when operation completes
   */
  multiSet(keyValuePairs: Array<[string, string]>): Promise<void>;

  /**
   * Remove multiple items from storage
   * @param keys - Array of storage keys
   * @returns Promise resolving when operation completes
   */
  multiRemove(keys: string[]): Promise<void>;
}

/**
 * Web storage adapter using localStorage
 */
class WebStorageAdapter implements StorageAdapter {
  private isAvailable(): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      
      // Test localStorage availability
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage not available:', error);
      return false;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (!this.isAvailable()) return null;
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Storage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (!this.isAvailable()) {
        console.warn('localStorage not available, skipping setItem');
        return;
      }
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Storage setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (!this.isAvailable()) return;
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage removeItem error:', error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      if (!this.isAvailable()) return;
      localStorage.clear();
    } catch (error) {
      console.error('Storage clear error:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      if (!this.isAvailable()) return [];
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Storage getAllKeys error:', error);
      return [];
    }
  }

  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    try {
      if (!this.isAvailable()) return keys.map(key => [key, null]);
      
      return keys.map(key => [key, localStorage.getItem(key)]);
    } catch (error) {
      console.error('Storage multiGet error:', error);
      return keys.map(key => [key, null]);
    }
  }

  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    try {
      if (!this.isAvailable()) return;
      
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (error) {
      console.error('Storage multiSet error:', error);
      throw error;
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      if (!this.isAvailable()) return;
      
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Storage multiRemove error:', error);
      throw error;
    }
  }
}

/**
 * React Native storage adapter (placeholder for AsyncStorage)
 * This will be implemented when migrating to React Native
 */
class NativeStorageAdapter implements StorageAdapter {
  async getItem(_key: string): Promise<string | null> {
    // TODO: Implement with React Native AsyncStorage
    console.warn('NativeStorageAdapter not implemented yet');
    return null;
  }

  async setItem(_key: string, _value: string): Promise<void> {
    // TODO: Implement with React Native AsyncStorage
    console.warn('NativeStorageAdapter not implemented yet');
  }

  async removeItem(_key: string): Promise<void> {
    // TODO: Implement with React Native AsyncStorage
    console.warn('NativeStorageAdapter not implemented yet');
  }

  async clear(): Promise<void> {
    // TODO: Implement with React Native AsyncStorage
    console.warn('NativeStorageAdapter not implemented yet');
  }

  async getAllKeys(): Promise<string[]> {
    // TODO: Implement with React Native AsyncStorage
    console.warn('NativeStorageAdapter not implemented yet');
    return [];
  }

  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    // TODO: Implement with React Native AsyncStorage
    console.warn('NativeStorageAdapter not implemented yet');
    return keys.map(key => [key, null]);
  }

  async multiSet(_keyValuePairs: Array<[string, string]>): Promise<void> {
    // TODO: Implement with React Native AsyncStorage
    console.warn('NativeStorageAdapter not implemented yet');
  }

  async multiRemove(_keys: string[]): Promise<void> {
    // TODO: Implement with React Native AsyncStorage
    console.warn('NativeStorageAdapter not implemented yet');
  }
}

/**
 * Memory storage adapter (fallback)
 */
class MemoryStorageAdapter implements StorageAdapter {
  private storage = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.storage.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.storage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }

  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    return keys.map(key => [key, this.storage.get(key) ?? null]);
  }

  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    keyValuePairs.forEach(([key, value]) => {
      this.storage.set(key, value);
    });
  }

  async multiRemove(keys: string[]): Promise<void> {
    keys.forEach(key => {
      this.storage.delete(key);
    });
  }
}

/**
 * Universal storage instance
 * Automatically selects the appropriate storage adapter based on platform
 */
export const storage: StorageAdapter = Platform.select({
  web: new WebStorageAdapter(),
  native: new NativeStorageAdapter(),
  default: new MemoryStorageAdapter()
});

/**
 * Typed storage utilities for common operations
 */
export const StorageUtils = {
  /**
   * Store JSON object
   */
  async setJSON<T>(key: string, value: T): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      await storage.setItem(key, jsonString);
    } catch (error) {
      console.error('Failed to store JSON:', error);
      throw error;
    }
  },

  /**
   * Retrieve JSON object
   */
  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await storage.getItem(key);
      if (!jsonString) return null;
      
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('Failed to retrieve JSON:', error);
      return null;
    }
  },

  /**
   * Store boolean value
   */
  async setBoolean(key: string, value: boolean): Promise<void> {
    await storage.setItem(key, value.toString());
  },

  /**
   * Retrieve boolean value
   */
  async getBoolean(key: string): Promise<boolean | null> {
    const value = await storage.getItem(key);
    if (value === null) return null;
    return value === 'true';
  },

  /**
   * Store number value
   */
  async setNumber(key: string, value: number): Promise<void> {
    await storage.setItem(key, value.toString());
  },

  /**
   * Retrieve number value
   */
  async getNumber(key: string): Promise<number | null> {
    const value = await storage.getItem(key);
    if (value === null) return null;
    
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
};

/**
 * Storage keys constants
 */
export const StorageKeys = {
  // User preferences
  LANGUAGE: 'unity_language',
  THEME: 'unity_theme',
  NOTIFICATIONS_ENABLED: 'unity_notifications_enabled',
  
  // App state
  ONBOARDING_COMPLETED: 'unity_onboarding_completed',
  LAST_SYNC: 'unity_last_sync',
  OFFLINE_ENTRIES: 'unity_offline_entries',
  
  // Cache
  TRANSLATIONS_CACHE: 'unity_translations_cache',
  USER_PROFILE_CACHE: 'unity_user_profile_cache',
  
  // PWA
  PWA_INSTALL_PROMPTED: 'unity_pwa_install_prompted',
  PWA_INSTALLED: 'unity_pwa_installed',
  
  // Performance
  PERFORMANCE_METRICS: 'unity_performance_metrics'
} as const;
