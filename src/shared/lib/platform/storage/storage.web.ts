/**
 * Web Storage Adapter
 * 
 * Uses localStorage for persistent storage in web browsers
 * 
 * @module platform/storage/web
 */

import type { StorageAdapter } from '../storage';

/**
 * Web storage adapter using localStorage
 */
export class WebStorageAdapter implements StorageAdapter {
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
        throw new Error('localStorage is not available');
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
      if (!this.isAvailable()) {
        return keys.map(key => [key, null]);
      }
      
      return keys.map(key => [key, localStorage.getItem(key)]);
    } catch (error) {
      console.error('Storage multiGet error:', error);
      return keys.map(key => [key, null]);
    }
  }

  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    try {
      if (!this.isAvailable()) {
        throw new Error('localStorage is not available');
      }
      
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

