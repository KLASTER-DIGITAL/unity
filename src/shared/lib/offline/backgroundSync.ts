/**
 * Background Sync API
 * 
 * Handles offline entry creation and automatic synchronization when online.
 * Uses IndexedDB for storage and Service Worker Background Sync API.
 */

import { createEntry } from '@/shared/lib/api';
import {
  addItem,
  getItem,
  getAllItems,
  updateItem,
  deleteItem,
  STORES,
  type PendingEntry,
} from './indexedDB';

const SYNC_TAG = 'sync-entries';
const MAX_RETRY_COUNT = 3;

/**
 * Check if Background Sync is supported
 */
export function isBackgroundSyncSupported(): boolean {
  return 'serviceWorker' in navigator && 'SyncManager' in window;
}

/**
 * Save entry offline for later sync
 */
export async function saveEntryOffline(
  userId: string,
  text: string,
  options: {
    sentiment?: 'positive' | 'neutral' | 'negative';
    category?: string;
    mood?: string;
    media?: any[];
    tags?: string[];
  } = {}
): Promise<PendingEntry> {
  const pendingEntry: PendingEntry = {
    id: crypto.randomUUID(),
    userId,
    text,
    sentiment: options.sentiment,
    category: options.category,
    mood: options.mood,
    media: options.media,
    tags: options.tags,
    createdAt: new Date().toISOString(),
    syncStatus: 'pending',
    retryCount: 0,
  };

  console.log('[BackgroundSync] Saving entry offline:', pendingEntry);

  // Save to IndexedDB
  await addItem(STORES.PENDING_ENTRIES, pendingEntry);

  // Register sync if supported
  if (isBackgroundSyncSupported()) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(SYNC_TAG);
      console.log('[BackgroundSync] Sync registered successfully');
    } catch (error) {
      console.error('[BackgroundSync] Failed to register sync:', error);
      // Fallback: try to sync immediately
      await syncPendingEntries();
    }
  } else {
    console.warn('[BackgroundSync] Background Sync not supported, will sync manually');
    // Fallback: try to sync immediately
    await syncPendingEntries();
  }

  return pendingEntry;
}

/**
 * Sync all pending entries
 */
export async function syncPendingEntries(): Promise<{
  synced: number;
  failed: number;
  pending: number;
}> {
  console.log('[BackgroundSync] Starting sync of pending entries...');

  const pendingEntries = await getAllItems<PendingEntry>(STORES.PENDING_ENTRIES);
  console.log(`[BackgroundSync] Found ${pendingEntries.length} pending entries`);

  let synced = 0;
  let failed = 0;

  for (const entry of pendingEntries) {
    // Skip if already syncing or exceeded retry limit
    if (entry.syncStatus === 'syncing') {
      console.log(`[BackgroundSync] Entry ${entry.id} is already syncing, skipping`);
      continue;
    }

    if (entry.retryCount >= MAX_RETRY_COUNT) {
      console.log(`[BackgroundSync] Entry ${entry.id} exceeded retry limit, marking as failed`);
      failed++;
      continue;
    }

    try {
      // Mark as syncing
      entry.syncStatus = 'syncing';
      await updateItem(STORES.PENDING_ENTRIES, entry);

      console.log(`[BackgroundSync] Syncing entry ${entry.id}...`);

      // Create entry in Supabase
      const savedEntry = await createEntry({
        userId: entry.userId,
        text: entry.text,
        sentiment: entry.sentiment,
        category: entry.category,
        mood: entry.mood,
        media: entry.media,
        tags: entry.tags,
      });

      console.log(`[BackgroundSync] Entry ${entry.id} synced successfully:`, savedEntry);

      // Delete from pending entries
      await deleteItem(STORES.PENDING_ENTRIES, entry.id);
      synced++;

      // Notify app about successful sync
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'ENTRY_SYNCED',
          entryId: entry.id,
          savedEntry,
        });
      }
    } catch (error) {
      console.error(`[BackgroundSync] Failed to sync entry ${entry.id}:`, error);

      // Update retry count and error
      entry.syncStatus = 'failed';
      entry.retryCount++;
      entry.lastError = error instanceof Error ? error.message : 'Unknown error';
      await updateItem(STORES.PENDING_ENTRIES, entry);

      failed++;

      // Notify app about failed sync
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'ENTRY_SYNC_FAILED',
          entryId: entry.id,
          error: entry.lastError,
        });
      }
    }
  }

  const remaining = await getAllItems<PendingEntry>(STORES.PENDING_ENTRIES);
  const pending = remaining.length;

  console.log(`[BackgroundSync] Sync complete: ${synced} synced, ${failed} failed, ${pending} pending`);

  return { synced, failed, pending };
}

/**
 * Get all pending entries for a user
 */
export async function getPendingEntries(userId: string): Promise<PendingEntry[]> {
  const allPending = await getAllItems<PendingEntry>(STORES.PENDING_ENTRIES);
  return allPending.filter(entry => entry.userId === userId);
}

/**
 * Get pending entries count for a user
 */
export async function getPendingEntriesCount(userId: string): Promise<number> {
  const pending = await getPendingEntries(userId);
  return pending.length;
}

/**
 * Retry failed entry sync
 */
export async function retryFailedEntry(entryId: string): Promise<void> {
  const entry = await getItem<PendingEntry>(STORES.PENDING_ENTRIES, entryId);
  
  if (!entry) {
    throw new Error(`Entry ${entryId} not found`);
  }

  if (entry.syncStatus !== 'failed') {
    throw new Error(`Entry ${entryId} is not in failed state`);
  }

  // Reset retry count and status
  entry.syncStatus = 'pending';
  entry.retryCount = 0;
  entry.lastError = undefined;
  await updateItem(STORES.PENDING_ENTRIES, entry);

  console.log(`[BackgroundSync] Retrying entry ${entryId}...`);

  // Trigger sync
  await syncPendingEntries();
}

/**
 * Delete failed entry
 */
export async function deleteFailedEntry(entryId: string): Promise<void> {
  const entry = await getItem<PendingEntry>(STORES.PENDING_ENTRIES, entryId);
  
  if (!entry) {
    throw new Error(`Entry ${entryId} not found`);
  }

  await deleteItem(STORES.PENDING_ENTRIES, entryId);
  console.log(`[BackgroundSync] Deleted failed entry ${entryId}`);
}

/**
 * Initialize background sync
 * Call this on app startup
 */
export async function initBackgroundSync(): Promise<void> {
  console.log('[BackgroundSync] Initializing...');

  // Check if online
  if (!navigator.onLine) {
    console.log('[BackgroundSync] App is offline, will sync when online');
    return;
  }

  // Try to sync pending entries
  try {
    await syncPendingEntries();
  } catch (error) {
    console.error('[BackgroundSync] Failed to sync on init:', error);
  }

  // Listen for online event
  window.addEventListener('online', async () => {
    console.log('[BackgroundSync] App is online, syncing pending entries...');
    try {
      await syncPendingEntries();
    } catch (error) {
      console.error('[BackgroundSync] Failed to sync on online event:', error);
    }
  });

  // Listen for messages from Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'BACKGROUND_SYNC_COMPLETE') {
        console.log('[BackgroundSync] Background sync completed:', event.data);
      }
    });
  }

  console.log('[BackgroundSync] Initialized successfully');
}

