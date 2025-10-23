/**
 * Offline Sync Indicator
 * 
 * Shows pending offline entries and sync status.
 * Displays at the top of the screen when there are pending syncs.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';
import {
  getPendingEntries,
  syncPendingEntries,
  retryFailedEntry,
  deleteFailedEntry,
  type PendingEntry,
} from '@/shared/lib/offline/backgroundSync';

interface OfflineSyncIndicatorProps {
  userId: string;
}

export function OfflineSyncIndicator({ userId }: OfflineSyncIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingEntries, setPendingEntries] = useState<PendingEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Load pending entries
  const loadPendingEntries = async () => {
    try {
      const entries = await getPendingEntries(userId);
      setPendingEntries(entries);
    } catch (error) {
      console.error('[OfflineSyncIndicator] Failed to load pending entries:', error);
    }
  };

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      loadPendingEntries();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial pending entries
    loadPendingEntries();

    // Listen for sync events from Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'ENTRY_SYNCED' || event.data.type === 'ENTRY_SYNC_FAILED') {
          loadPendingEntries();
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId]);

  // Manual sync
  const handleManualSync = async () => {
    if (!isOnline) {
      return;
    }

    setIsSyncing(true);
    try {
      await syncPendingEntries();
      await loadPendingEntries();
    } catch (error) {
      console.error('[OfflineSyncIndicator] Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Retry failed entry
  const handleRetry = async (entryId: string) => {
    try {
      await retryFailedEntry(entryId);
      await loadPendingEntries();
    } catch (error) {
      console.error('[OfflineSyncIndicator] Retry failed:', error);
    }
  };

  // Delete failed entry
  const handleDelete = async (entryId: string) => {
    try {
      await deleteFailedEntry(entryId);
      await loadPendingEntries();
    } catch (error) {
      console.error('[OfflineSyncIndicator] Delete failed:', error);
    }
  };

  const pendingCount = pendingEntries.filter(e => e.syncStatus === 'pending').length;
  const failedCount = pendingEntries.filter(e => e.syncStatus === 'failed').length;
  const syncingCount = pendingEntries.filter(e => e.syncStatus === 'syncing').length;

  // Don't show if no pending entries
  if (pendingEntries.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
      >
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Cloud className="w-5 h-5" />
              ) : (
                <CloudOff className="w-5 h-5" />
              )}
              
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {isOnline ? 'Синхронизация...' : 'Вы офлайн'}
                </span>
                <span className="text-xs opacity-90">
                  {pendingCount > 0 && `${pendingCount} записей ожидают`}
                  {syncingCount > 0 && ` • ${syncingCount} синхронизируются`}
                  {failedCount > 0 && ` • ${failedCount} ошибок`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOnline && (
                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                </button>
              )}
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                {showDetails ? <X className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Details panel */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {pendingEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white/10 rounded-lg p-3 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {entry.text.substring(0, 50)}
                          {entry.text.length > 50 && '...'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {entry.syncStatus === 'pending' && (
                            <span className="text-xs opacity-75 flex items-center gap-1">
                              <Cloud className="w-3 h-3" />
                              Ожидает
                            </span>
                          )}
                          {entry.syncStatus === 'syncing' && (
                            <span className="text-xs opacity-75 flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              Синхронизация...
                            </span>
                          )}
                          {entry.syncStatus === 'failed' && (
                            <span className="text-xs opacity-75 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Ошибка ({entry.retryCount}/3)
                            </span>
                          )}
                        </div>
                        {entry.lastError && (
                          <p className="text-xs opacity-75 mt-1">
                            {entry.lastError}
                          </p>
                        )}
                      </div>

                      {entry.syncStatus === 'failed' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleRetry(entry.id)}
                            className="p-1.5 hover:bg-white/20 rounded transition-colors"
                            title="Повторить"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-1.5 hover:bg-white/20 rounded transition-colors"
                            title="Удалить"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

