/**
 * IndexedDB Utilities for Offline Storage
 * 
 * Provides a simple API for storing and retrieving data in IndexedDB.
 * Used for offline entries, pending syncs, and cached data.
 */

const DB_NAME = 'unity-diary-offline';
const DB_VERSION = 1;

// Store names
export const STORES = {
  PENDING_ENTRIES: 'pending_entries',
  CACHED_ENTRIES: 'cached_entries',
  SYNC_QUEUE: 'sync_queue',
} as const;

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

export interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  storeName: string;
  data: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

/**
 * Initialize IndexedDB database
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[IndexedDB] Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[IndexedDB] Database opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('[IndexedDB] Upgrading database schema...');

      // Create pending_entries store
      if (!db.objectStoreNames.contains(STORES.PENDING_ENTRIES)) {
        const pendingStore = db.createObjectStore(STORES.PENDING_ENTRIES, { keyPath: 'id' });
        pendingStore.createIndex('userId', 'userId', { unique: false });
        pendingStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        pendingStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log('[IndexedDB] Created pending_entries store');
      }

      // Create cached_entries store
      if (!db.objectStoreNames.contains(STORES.CACHED_ENTRIES)) {
        const cachedStore = db.createObjectStore(STORES.CACHED_ENTRIES, { keyPath: 'id' });
        cachedStore.createIndex('userId', 'userId', { unique: false });
        cachedStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log('[IndexedDB] Created cached_entries store');
      }

      // Create sync_queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncStore.createIndex('type', 'type', { unique: false });
        console.log('[IndexedDB] Created sync_queue store');
      }
    };
  });
}

/**
 * Add item to store
 */
export async function addItem<T>(storeName: string, item: T): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);

    request.onsuccess = () => {
      console.log(`[IndexedDB] Added item to ${storeName}:`, item);
      resolve();
    };

    request.onerror = () => {
      console.error(`[IndexedDB] Failed to add item to ${storeName}:`, request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get item from store by ID
 */
export async function getItem<T>(storeName: string, id: string): Promise<T | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      console.error(`[IndexedDB] Failed to get item from ${storeName}:`, request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all items from store
 */
export async function getAllItems<T>(storeName: string): Promise<T[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error(`[IndexedDB] Failed to get all items from ${storeName}:`, request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Update item in store
 */
export async function updateItem<T>(storeName: string, item: T): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => {
      console.log(`[IndexedDB] Updated item in ${storeName}:`, item);
      resolve();
    };

    request.onerror = () => {
      console.error(`[IndexedDB] Failed to update item in ${storeName}:`, request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Delete item from store
 */
export async function deleteItem(storeName: string, id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log(`[IndexedDB] Deleted item from ${storeName}:`, id);
      resolve();
    };

    request.onerror = () => {
      console.error(`[IndexedDB] Failed to delete item from ${storeName}:`, request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get items by index
 */
export async function getItemsByIndex<T>(
  storeName: string,
  indexName: string,
  value: any
): Promise<T[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      console.error(`[IndexedDB] Failed to get items by index from ${storeName}:`, request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Clear all items from store
 */
export async function clearStore(storeName: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => {
      console.log(`[IndexedDB] Cleared store ${storeName}`);
      resolve();
    };

    request.onerror = () => {
      console.error(`[IndexedDB] Failed to clear store ${storeName}:`, request.error);
      reject(request.error);
    };

    transaction.oncomplete = () => {
      db.close();
    };
  });
}

