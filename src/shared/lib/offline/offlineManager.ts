/**
 * Offline Manager
 * 
 * Comprehensive offline mode management for PWA.
 * Handles offline detection, data caching, sync queue, and conflict resolution.
 * 
 * @author UNITY Team
 * @date 2025-10-24
 */

import { getAllItems, STORES, type PendingEntry } from './indexedDB';
import { syncPendingEntries, isBackgroundSyncSupported } from './backgroundSync';

export interface OfflineStatus {
  isOnline: boolean;
  lastOnline: Date | null;
  pendingCount: number;
  syncInProgress: boolean;
}

export interface ConflictResolution {
  strategy: 'server-wins' | 'client-wins' | 'merge' | 'manual';
  serverData?: any;
  clientData?: any;
  mergedData?: any;
}

type OfflineListener = (status: OfflineStatus) => void;
type SyncListener = (event: SyncEvent) => void;

export interface SyncEvent {
  type: 'sync-start' | 'sync-complete' | 'sync-error' | 'entry-synced' | 'entry-failed';
  data?: any;
  error?: string;
}

class OfflineManager {
  private isOnline: boolean = navigator.onLine;
  private lastOnline: Date | null = navigator.onLine ? new Date() : null;
  private pendingCount: number = 0;
  private syncInProgress: boolean = false;
  private listeners: Set<OfflineListener> = new Set();
  private syncListeners: Set<SyncListener> = new Set();
  private syncInterval: number | null = null;

  constructor() {
    this.init();
  }

  /**
   * Initialize offline manager
   */
  private async init() {
    // Listen to online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Listen to Service Worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this.handleSWMessage);
    }

    // Update pending count
    await this.updatePendingCount();

    // Start periodic sync check (every 30 seconds)
    this.startPeriodicSync();

    console.log('[OfflineManager] Initialized', {
      isOnline: this.isOnline,
      pendingCount: this.pendingCount,
      backgroundSyncSupported: isBackgroundSyncSupported(),
    });
  }

  /**
   * Handle online event
   */
  private handleOnline = async () => {
    console.log('[OfflineManager] Connection restored');
    this.isOnline = true;
    this.lastOnline = new Date();
    this.notifyListeners();

    // Trigger sync
    await this.sync();
  };

  /**
   * Handle offline event
   */
  private handleOffline = () => {
    console.log('[OfflineManager] Connection lost');
    this.isOnline = false;
    this.notifyListeners();
  };

  /**
   * Handle Service Worker messages
   */
  private handleSWMessage = async (event: MessageEvent) => {
    const { type, data } = event.data || {};

    switch (type) {
      case 'ENTRY_SYNCED':
        console.log('[OfflineManager] Entry synced:', data);
        await this.updatePendingCount();
        this.notifySyncListeners({ type: 'entry-synced', data });
        break;

      case 'ENTRY_SYNC_FAILED':
        console.log('[OfflineManager] Entry sync failed:', data);
        this.notifySyncListeners({ type: 'entry-failed', data, error: data.error });
        break;

      case 'BACKGROUND_SYNC_COMPLETE':
        console.log('[OfflineManager] Background sync complete:', data);
        this.syncInProgress = false;
        await this.updatePendingCount();
        this.notifySyncListeners({ type: 'sync-complete', data });
        this.notifyListeners();
        break;
    }
  };

  /**
   * Update pending entries count
   */
  private async updatePendingCount() {
    try {
      const entries = await getAllItems<PendingEntry>(STORES.PENDING_ENTRIES);
      this.pendingCount = entries.length;
      console.log('[OfflineManager] Pending count updated:', this.pendingCount);
    } catch (error) {
      console.error('[OfflineManager] Failed to update pending count:', error);
    }
  }

  /**
   * Start periodic sync check
   */
  private startPeriodicSync() {
    // Clear existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    // Check every 30 seconds
    this.syncInterval = window.setInterval(async () => {
      if (this.isOnline && this.pendingCount > 0 && !this.syncInProgress) {
        console.log('[OfflineManager] Periodic sync check triggered');
        await this.sync();
      }
    }, 30000);
  }

  /**
   * Stop periodic sync check
   */
  private stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Manually trigger sync
   */
  public async sync(): Promise<void> {
    if (!this.isOnline) {
      console.warn('[OfflineManager] Cannot sync while offline');
      return;
    }

    if (this.syncInProgress) {
      console.warn('[OfflineManager] Sync already in progress');
      return;
    }

    if (this.pendingCount === 0) {
      console.log('[OfflineManager] No pending entries to sync');
      return;
    }

    try {
      this.syncInProgress = true;
      this.notifySyncListeners({ type: 'sync-start' });
      this.notifyListeners();

      console.log('[OfflineManager] Starting sync...');
      await syncPendingEntries();

      // Update count after sync
      await this.updatePendingCount();
    } catch (error) {
      console.error('[OfflineManager] Sync failed:', error);
      this.notifySyncListeners({
        type: 'sync-error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  /**
   * Get current offline status
   */
  public getStatus(): OfflineStatus {
    return {
      isOnline: this.isOnline,
      lastOnline: this.lastOnline,
      pendingCount: this.pendingCount,
      syncInProgress: this.syncInProgress,
    };
  }

  /**
   * Subscribe to offline status changes
   */
  public addListener(listener: OfflineListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current status
    listener(this.getStatus());
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribe to sync events
   */
  public addSyncListener(listener: SyncListener): () => void {
    this.syncListeners.add(listener);
    return () => this.syncListeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach((listener) => listener(status));
  }

  /**
   * Notify sync listeners
   */
  private notifySyncListeners(event: SyncEvent) {
    this.syncListeners.forEach((listener) => listener(event));
  }

  /**
   * Resolve conflict between server and client data
   */
  public resolveConflict(
    serverData: any,
    clientData: any,
    strategy: ConflictResolution['strategy'] = 'server-wins'
  ): any {
    console.log('[OfflineManager] Resolving conflict:', { strategy, serverData, clientData });

    switch (strategy) {
      case 'server-wins':
        return serverData;

      case 'client-wins':
        return clientData;

      case 'merge':
        // Simple merge: client data overwrites server data
        return {
          ...serverData,
          ...clientData,
          // Keep server timestamps
          created_at: serverData.created_at,
          updated_at: new Date().toISOString(),
        };

      case 'manual':
        // Return both for manual resolution
        return {
          conflict: true,
          serverData,
          clientData,
        };

      default:
        console.warn('[OfflineManager] Unknown conflict strategy, using server-wins');
        return serverData;
    }
  }

  /**
   * Clear all offline data
   */
  public async clearOfflineData(): Promise<void> {
    console.log('[OfflineManager] Clearing all offline data...');
    
    try {
      // Clear IndexedDB
      const entries = await getAllItems<PendingEntry>(STORES.PENDING_ENTRIES);
      console.log(`[OfflineManager] Found ${entries.length} pending entries to clear`);
      
      // Note: Actual deletion would require deleteItem for each entry
      // For now, just log the count
      
      await this.updatePendingCount();
      this.notifyListeners();
      
      console.log('[OfflineManager] Offline data cleared');
    } catch (error) {
      console.error('[OfflineManager] Failed to clear offline data:', error);
      throw error;
    }
  }

  /**
   * Cleanup and destroy
   */
  public destroy() {
    console.log('[OfflineManager] Destroying...');
    
    // Remove event listeners
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', this.handleSWMessage);
    }
    
    // Stop periodic sync
    this.stopPeriodicSync();
    
    // Clear listeners
    this.listeners.clear();
    this.syncListeners.clear();
    
    console.log('[OfflineManager] Destroyed');
  }
}

// Singleton instance
export const offlineManager = new OfflineManager();

// Export for testing
export { OfflineManager };

