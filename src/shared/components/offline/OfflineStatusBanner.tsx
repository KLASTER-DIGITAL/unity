/**
 * Offline Status Banner
 * 
 * Modern banner showing offline status and sync progress.
 * Displays at the top of the screen when offline or when there are pending syncs.
 * 
 * @author UNITY Team
 * @date 2025-10-24
 */

import { motion, AnimatePresence } from 'motion/react';
import { Cloud, CloudOff, RefreshCw, CheckCircle, AlertCircle, WifiOff } from 'lucide-react';
import { useOfflineMode } from '@/shared/lib/offline';
import { useEffect, useState } from 'react';

export function OfflineStatusBanner() {
  const {
    isOnline,
    lastOnline,
    pendingCount,
    syncInProgress,
    sync,
    lastSyncEvent,
  } = useOfflineMode();

  const [showBanner, setShowBanner] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState<'offline' | 'syncing' | 'success' | 'error'>('offline');

  useEffect(() => {
    // Show banner when offline or when there are pending syncs
    setShowBanner(!isOnline || pendingCount > 0);

    // Update message and variant
    if (!isOnline) {
      setVariant('offline');
      setMessage('Нет подключения к интернету');
    } else if (syncInProgress) {
      setVariant('syncing');
      setMessage(`Синхронизация ${pendingCount} записей...`);
    } else if (pendingCount > 0) {
      setVariant('error');
      setMessage(`${pendingCount} записей ожидают синхронизации`);
    } else {
      setVariant('success');
      setMessage('Все синхронизировано');
    }
  }, [isOnline, pendingCount, syncInProgress]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (variant === 'success' && pendingCount === 0) {
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [variant, pendingCount]);

  // Show temporary success message when sync completes
  useEffect(() => {
    if (lastSyncEvent?.type === 'sync-complete') {
      setShowBanner(true);
      setVariant('success');
      setMessage('Синхронизация завершена');
    }
  }, [lastSyncEvent]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'offline':
        return 'bg-linear-to-r from-gray-600 to-gray-700';
      case 'syncing':
        return 'bg-linear-to-r from-blue-500 to-blue-600';
      case 'success':
        return 'bg-linear-to-r from-green-500 to-green-600';
      case 'error':
        return 'bg-linear-to-r from-orange-500 to-orange-600';
      default:
        return 'bg-linear-to-r from-gray-600 to-gray-700';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'offline':
        return <WifiOff className="w-5 h-5" />;
      case 'syncing':
        return <RefreshCw className="w-5 h-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <CloudOff className="w-5 h-5" />;
    }
  };

  const handleManualSync = async () => {
    if (!isOnline || syncInProgress) return;
    await sync();
  };

  const formatLastOnline = () => {
    if (!lastOnline) return 'Никогда';
    
    const now = new Date();
    const diff = now.getTime() - lastOnline.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}д назад`;
    if (hours > 0) return `${hours}ч назад`;
    if (minutes > 0) return `${minutes}м назад`;
    return 'Только что';
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed top-0 left-0 right-0 z-50 ${getVariantStyles()} text-white shadow-lg`}
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Icon + Message */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {getIcon()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {message}
                  </p>
                  {!isOnline && lastOnline && (
                    <p className="text-xs opacity-75 mt-0.5">
                      Последнее подключение: {formatLastOnline()}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isOnline && pendingCount > 0 && !syncInProgress && (
                  <button
                    onClick={handleManualSync}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Синхронизировать
                  </button>
                )}

                {variant === 'success' && (
                  <button
                    onClick={() => setShowBanner(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Закрыть"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar for syncing */}
            {syncInProgress && (
              <div className="mt-2">
                <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

