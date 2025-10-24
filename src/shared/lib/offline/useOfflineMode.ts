/**
 * useOfflineMode Hook
 * 
 * React hook for managing offline mode in components.
 * Provides offline status, sync control, and event handling.
 * 
 * @author UNITY Team
 * @date 2025-10-24
 */

import { useState, useEffect, useCallback } from 'react';
import { offlineManager, type OfflineStatus, type SyncEvent } from './offlineManager';

export interface UseOfflineModeReturn {
  // Status
  isOnline: boolean;
  lastOnline: Date | null;
  pendingCount: number;
  syncInProgress: boolean;
  
  // Actions
  sync: () => Promise<void>;
  clearOfflineData: () => Promise<void>;
  
  // Events
  lastSyncEvent: SyncEvent | null;
}

/**
 * Hook for managing offline mode
 */
export function useOfflineMode(): UseOfflineModeReturn {
  const [status, setStatus] = useState<OfflineStatus>(offlineManager.getStatus());
  const [lastSyncEvent, setLastSyncEvent] = useState<SyncEvent | null>(null);

  useEffect(() => {
    // Subscribe to status changes
    const unsubscribeStatus = offlineManager.addListener((newStatus) => {
      setStatus(newStatus);
    });

    // Subscribe to sync events
    const unsubscribeSync = offlineManager.addSyncListener((event) => {
      setLastSyncEvent(event);
    });

    // Cleanup
    return () => {
      unsubscribeStatus();
      unsubscribeSync();
    };
  }, []);

  const sync = useCallback(async () => {
    await offlineManager.sync();
  }, []);

  const clearOfflineData = useCallback(async () => {
    await offlineManager.clearOfflineData();
  }, []);

  return {
    isOnline: status.isOnline,
    lastOnline: status.lastOnline,
    pendingCount: status.pendingCount,
    syncInProgress: status.syncInProgress,
    sync,
    clearOfflineData,
    lastSyncEvent,
  };
}

