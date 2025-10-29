/**
 * Offline Platform Adapter Types
 * 
 * Defines interfaces for offline storage across Web and React Native platforms.
 * 
 * @author UNITY Team
 * @date 2025-10-28
 */

/**
 * Pending entry for offline storage
 */
export interface PendingEntry {
  id: string;
  userId: string;
  text: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  category?: string;
  mood?: string;
  media?: any[];
  tags?: string[];
  createdAt: string;
  syncStatus: 'pending' | 'syncing' | 'failed';
  retryCount: number;
  lastError?: string;
}

/**
 * Cached entry for offline access
 */
export interface CachedEntry {
  id: string;
  userId: string;
  data: any;
  cachedAt: string;
  expiresAt?: string;
}

/**
 * Sync queue item
 */
export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: string;
  data: any;
  createdAt: string;
  retryCount: number;
}

/**
 * Offline storage adapter interface
 * 
 * Platform-agnostic interface for offline storage operations.
 * Implementations:
 * - Web: IndexedDB
 * - React Native: SQLite + AsyncStorage
 */
export interface OfflineStorageAdapter {
  /**
   * Initialize storage
   */
  initialize(): Promise<void>;

  /**
   * Add pending entry
   */
  addPendingEntry(entry: PendingEntry): Promise<void>;

  /**
   * Get all pending entries
   */
  getPendingEntries(userId: string): Promise<PendingEntry[]>;

  /**
   * Update pending entry
   */
  updatePendingEntry(entry: PendingEntry): Promise<void>;

  /**
   * Delete pending entry
   */
  deletePendingEntry(id: string): Promise<void>;

  /**
   * Add cached entry
   */
  addCachedEntry(entry: CachedEntry): Promise<void>;

  /**
   * Get cached entries
   */
  getCachedEntries(userId: string): Promise<CachedEntry[]>;

  /**
   * Clear all offline data
   */
  clearAll(): Promise<void>;

  /**
   * Get storage size (in bytes)
   */
  getStorageSize(): Promise<number>;
}

/**
 * Media storage adapter interface
 * 
 * Platform-agnostic interface for media file storage.
 * Implementations:
 * - Web: Cache API / IndexedDB
 * - React Native: File System (Expo FileSystem)
 */
export interface MediaStorageAdapter {
  /**
   * Save media file
   */
  saveMedia(userId: string, file: File | { uri: string; type: string; name: string }): Promise<string>;

  /**
   * Get media file
   */
  getMedia(path: string): Promise<string | null>;

  /**
   * Delete media file
   */
  deleteMedia(path: string): Promise<void>;

  /**
   * Get media storage size
   */
  getMediaSize(): Promise<number>;

  /**
   * Clear all media
   */
  clearAllMedia(): Promise<void>;
}

/**
 * Network detection adapter interface
 * 
 * Platform-agnostic interface for network status detection.
 * Implementations:
 * - Web: navigator.onLine + online/offline events
 * - React Native: NetInfo
 */
export interface NetworkAdapter {
  /**
   * Check if online
   */
  isOnline(): Promise<boolean>;

  /**
   * Add network status listener
   */
  addListener(callback: (isOnline: boolean) => void): () => void;
}

