/**
 * Web Offline Storage Adapter
 * 
 * Uses IndexedDB for offline storage on web platform.
 * 
 * @author UNITY Team
 * @date 2025-10-28
 */

import type {
  OfflineStorageAdapter,
  MediaStorageAdapter,
  NetworkAdapter,
  PendingEntry,
  CachedEntry,
} from './types';

const DB_NAME = 'unity-diary-offline';
const DB_VERSION = 1;

const STORES = {
  PENDING_ENTRIES: 'pending_entries',
  CACHED_ENTRIES: 'cached_entries',
  SYNC_QUEUE: 'sync_queue',
} as const;

/**
 * Open IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.PENDING_ENTRIES)) {
        const pendingStore = db.createObjectStore(STORES.PENDING_ENTRIES, { keyPath: 'id' });
        pendingStore.createIndex('userId', 'userId', { unique: false });
        pendingStore.createIndex('syncStatus', 'syncStatus', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.CACHED_ENTRIES)) {
        const cachedStore = db.createObjectStore(STORES.CACHED_ENTRIES, { keyPath: 'id' });
        cachedStore.createIndex('userId', 'userId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Web Offline Storage Adapter (IndexedDB)
 */
export class WebOfflineStorageAdapter implements OfflineStorageAdapter {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = await openDB();
    console.log('[WebOfflineStorage] Initialized IndexedDB');
  }

  async addPendingEntry(entry: PendingEntry): Promise<void> {
    if (!this.db) await this.initialize();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PENDING_ENTRIES], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_ENTRIES);
      const request = store.add(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingEntries(userId: string): Promise<PendingEntry[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PENDING_ENTRIES], 'readonly');
      const store = transaction.objectStore(STORES.PENDING_ENTRIES);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async updatePendingEntry(entry: PendingEntry): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PENDING_ENTRIES], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_ENTRIES);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deletePendingEntry(id: string): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.PENDING_ENTRIES], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_ENTRIES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async addCachedEntry(entry: CachedEntry): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CACHED_ENTRIES], 'readwrite');
      const store = transaction.objectStore(STORES.CACHED_ENTRIES);
      const request = store.add(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedEntries(userId: string): Promise<CachedEntry[]> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.CACHED_ENTRIES], 'readonly');
      const store = transaction.objectStore(STORES.CACHED_ENTRIES);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.initialize();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(
        [STORES.PENDING_ENTRIES, STORES.CACHED_ENTRIES, STORES.SYNC_QUEUE],
        'readwrite'
      );

      const promises = [
        transaction.objectStore(STORES.PENDING_ENTRIES).clear(),
        transaction.objectStore(STORES.CACHED_ENTRIES).clear(),
        transaction.objectStore(STORES.SYNC_QUEUE).clear(),
      ];

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getStorageSize(): Promise<number> {
    if (!this.db) await this.initialize();

    // Estimate storage size by counting entries
    const pendingEntries = await this.getPendingEntries('');
    const cachedEntries = await this.getCachedEntries('');

    // Rough estimate: 1KB per entry
    return (pendingEntries.length + cachedEntries.length) * 1024;
  }
}

/**
 * Web Media Storage Adapter (Cache API)
 */
export class WebMediaStorageAdapter implements MediaStorageAdapter {
  private cacheName = 'unity-media-cache';

  async saveMedia(userId: string, file: File): Promise<string> {
    const cache = await caches.open(this.cacheName);
    const url = `/offline-media/${userId}/${file.name}`;
    
    const response = new Response(file, {
      headers: { 'Content-Type': file.type },
    });

    await cache.put(url, response);
    return url;
  }

  async getMedia(path: string): Promise<string | null> {
    const cache = await caches.open(this.cacheName);
    const response = await cache.match(path);

    if (!response) return null;

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  }

  async deleteMedia(path: string): Promise<void> {
    const cache = await caches.open(this.cacheName);
    await cache.delete(path);
  }

  async getMediaSize(): Promise<number> {
    const cache = await caches.open(this.cacheName);
    const keys = await cache.keys();
    
    let totalSize = 0;
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }

    return totalSize;
  }

  async clearAllMedia(): Promise<void> {
    await caches.delete(this.cacheName);
  }
}

/**
 * Web Network Adapter (navigator.onLine)
 */
export class WebNetworkAdapter implements NetworkAdapter {
  async isOnline(): Promise<boolean> {
    return navigator.onLine;
  }

  addListener(callback: (isOnline: boolean) => void): () => void {
    const onlineHandler = () => callback(true);
    const offlineHandler = () => callback(false);

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }
}

// Export singleton instances
export const offlineStorage = new WebOfflineStorageAdapter();
export const mediaStorage = new WebMediaStorageAdapter();
export const networkAdapter = new WebNetworkAdapter();

