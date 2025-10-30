/**
 * React Native Offline Storage Adapter
 *
 * Uses SQLite for structured data, AsyncStorage for settings, and File System for media.
 *
 * @author UNITY Team
 * @date 2025-10-28
 */

import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

import type {
  CachedEntry,
  MediaStorageAdapter,
  NetworkAdapter,
  OfflineStorageAdapter,
  PendingEntry,
} from './types';

/**
 * React Native Offline Storage Adapter (SQLite + AsyncStorage)
 */
export class NativeOfflineStorageAdapter implements OfflineStorageAdapter {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    try {
      console.log('[NativeOfflineStorage] Initializing SQLite...');

      // Open SQLite database
      this.db = await SQLite.openDatabaseAsync('unity-diary-offline');

      // Create tables
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS pending_entries (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          text TEXT NOT NULL,
          sentiment TEXT,
          category TEXT,
          mood TEXT,
          media TEXT,
          tags TEXT,
          createdAt TEXT NOT NULL,
          syncStatus TEXT NOT NULL,
          retryCount INTEGER NOT NULL,
          lastError TEXT
        );

        CREATE TABLE IF NOT EXISTS cached_entries (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          text TEXT NOT NULL,
          sentiment TEXT,
          category TEXT,
          mood TEXT,
          media TEXT,
          tags TEXT,
          createdAt TEXT NOT NULL,
          cachedAt TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_pending_userId ON pending_entries(userId);
        CREATE INDEX IF NOT EXISTS idx_pending_syncStatus ON pending_entries(syncStatus);
        CREATE INDEX IF NOT EXISTS idx_cached_userId ON cached_entries(userId);
      `);

      console.log('[NativeOfflineStorage] SQLite initialized successfully');
    } catch (error) {
      console.error('[NativeOfflineStorage] Failed to initialize SQLite:', error);
      throw error;
    }
  }

  async addPendingEntry(entry: PendingEntry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('[NativeOfflineStorage] Adding pending entry:', entry.id);

    await this.db.runAsync(
      `INSERT OR REPLACE INTO pending_entries
       (id, userId, text, sentiment, category, mood, media, tags, createdAt, syncStatus, retryCount, lastError)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.userId,
        entry.text,
        entry.sentiment || null,
        entry.category || null,
        entry.mood || null,
        JSON.stringify(entry.media || []),
        JSON.stringify(entry.tags || []),
        entry.createdAt,
        entry.syncStatus,
        entry.retryCount || 0,
        entry.lastError || null,
      ]
    );
  }

  async getPendingEntries(userId: string): Promise<PendingEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('[NativeOfflineStorage] Getting pending entries for user:', userId);

    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM pending_entries WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );

    return result.map((row) => ({
      id: row.id,
      userId: row.userId,
      text: row.text,
      sentiment: row.sentiment,
      category: row.category,
      mood: row.mood,
      media: JSON.parse(row.media || '[]'),
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.createdAt,
      syncStatus: row.syncStatus,
      retryCount: row.retryCount,
      lastError: row.lastError,
    }));
  }

  async updatePendingEntry(entry: PendingEntry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('[NativeOfflineStorage] Updating pending entry:', entry.id);

    await this.db.runAsync(
      `UPDATE pending_entries
       SET syncStatus = ?, retryCount = ?, lastError = ?
       WHERE id = ?`,
      [entry.syncStatus, entry.retryCount || 0, entry.lastError || null, entry.id]
    );
  }

  async deletePendingEntry(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('[NativeOfflineStorage] Deleting pending entry:', id);

    await this.db.runAsync('DELETE FROM pending_entries WHERE id = ?', [id]);
  }

  async addCachedEntry(entry: CachedEntry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('[NativeOfflineStorage] Adding cached entry:', entry.id);

    await this.db.runAsync(
      `INSERT OR REPLACE INTO cached_entries
       (id, userId, text, sentiment, category, mood, media, tags, createdAt, cachedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.userId,
        entry.text,
        entry.sentiment || null,
        entry.category || null,
        entry.mood || null,
        JSON.stringify(entry.media || []),
        JSON.stringify(entry.tags || []),
        entry.createdAt,
        entry.cachedAt,
      ]
    );
  }

  async getCachedEntries(userId: string): Promise<CachedEntry[]> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('[NativeOfflineStorage] Getting cached entries for user:', userId);

    const result = await this.db.getAllAsync<any>(
      'SELECT * FROM cached_entries WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );

    return result.map((row) => ({
      id: row.id,
      userId: row.userId,
      text: row.text,
      sentiment: row.sentiment,
      category: row.category,
      mood: row.mood,
      media: JSON.parse(row.media || '[]'),
      tags: JSON.parse(row.tags || '[]'),
      createdAt: row.createdAt,
      cachedAt: row.cachedAt,
    }));
  }

  async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('[NativeOfflineStorage] Clearing all offline data');

    await this.db.execAsync(`
      DELETE FROM pending_entries;
      DELETE FROM cached_entries;
    `);
  }

  async getStorageSize(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    console.log('[NativeOfflineStorage] Getting storage size');

    const result = await this.db.getFirstAsync<{ size: number }>(
      'SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()'
    );

    return result?.size || 0;
  }
}

/**
 * React Native Media Storage Adapter (Expo FileSystem)
 */
export class NativeMediaStorageAdapter implements MediaStorageAdapter {
  private mediaDir = 'offline-media';

  async saveMedia(
    userId: string,
    file: { uri: string; type: string; name: string }
  ): Promise<string> {
    console.log('[NativeMediaStorage] Saving media:', file.name);

    const dir = `${FileSystem.documentDirectory}${this.mediaDir}/${userId}`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

    const destPath = `${dir}/${file.name}`;
    await FileSystem.copyAsync({ from: file.uri, to: destPath });

    return destPath;
  }

  async getMedia(path: string): Promise<string | null> {
    console.log('[NativeMediaStorage] Getting media:', path);

    const info = await FileSystem.getInfoAsync(path);
    return info.exists ? path : null;
  }

  async deleteMedia(path: string): Promise<void> {
    console.log('[NativeMediaStorage] Deleting media:', path);

    await FileSystem.deleteAsync(path, { idempotent: true });
  }

  async getMediaSize(): Promise<number> {
    console.log('[NativeMediaStorage] Getting media size');

    const dir = `${FileSystem.documentDirectory}${this.mediaDir}`;

    try {
      const files = await FileSystem.readDirectoryAsync(dir);
      let totalSize = 0;

      for (const file of files) {
        const info = await FileSystem.getInfoAsync(`${dir}/${file}`);
        totalSize += info.size || 0;
      }

      return totalSize;
    } catch (error) {
      console.log('[NativeMediaStorage] Directory does not exist yet');
      return 0;
    }
  }

  async clearAllMedia(): Promise<void> {
    console.log('[NativeMediaStorage] Clearing all media');

    const dir = `${FileSystem.documentDirectory}${this.mediaDir}`;
    await FileSystem.deleteAsync(dir, { idempotent: true });
  }
}

/**
 * React Native Network Adapter (NetInfo)
 */
export class NativeNetworkAdapter implements NetworkAdapter {
  async isOnline(): Promise<boolean> {
    console.log('[NativeNetworkAdapter] Checking network status');

    const state = await NetInfo.fetch();
    const isOnline = state.isConnected === true && state.isInternetReachable !== false;

    console.log('[NativeNetworkAdapter] Network status:', {
      isConnected: state.isConnected,
      isInternetReachable: state.isInternetReachable,
      isOnline,
    });

    return isOnline;
  }

  addListener(callback: (isOnline: boolean) => void): () => void {
    console.log('[NativeNetworkAdapter] Adding network listener');

    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected === true && state.isInternetReachable !== false;
      console.log('[NativeNetworkAdapter] Network changed:', {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        isOnline,
      });
      callback(isOnline);
    });

    return unsubscribe;
  }
}

// Export singleton instances
export const offlineStorage = new NativeOfflineStorageAdapter();
export const mediaStorage = new NativeMediaStorageAdapter();
export const networkAdapter = new NativeNetworkAdapter();
