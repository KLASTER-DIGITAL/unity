/**
 * Universal Storage Adapter for UNITY-v2
 *
 * Provides cross-platform storage interface that works on both
 * Web (localStorage) and React Native (AsyncStorage)
 *
 * @author UNITY Team
 * @date 2025-01-18
 */

import { storage as platformStorage } from './storage/index';

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
 * Universal storage instance
 * Re-exported from platform/storage for backward compatibility
 */
export const storage: StorageAdapter = platformStorage;

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
