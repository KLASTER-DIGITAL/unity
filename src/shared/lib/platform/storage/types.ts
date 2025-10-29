/**
 * Storage Adapter Types
 *
 * Shared types for storage adapters to avoid circular dependencies
 */

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
   * Get all keys in storage
   * @returns Promise resolving to array of keys
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Get multiple items from storage
   * @param keys - Array of storage keys
   * @returns Promise resolving to array of [key, value] pairs
   */
  multiGet(keys: string[]): Promise<[string, string | null][]>;

  /**
   * Set multiple items in storage
   * @param keyValuePairs - Array of [key, value] pairs
   * @returns Promise resolving when operation completes
   */
  multiSet(keyValuePairs: [string, string][]): Promise<void>;

  /**
   * Remove multiple items from storage
   * @param keys - Array of storage keys
   * @returns Promise resolving when operation completes
   */
  multiRemove(keys: string[]): Promise<void>;
}

