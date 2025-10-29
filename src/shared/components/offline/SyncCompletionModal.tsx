/**
 * Sync Completion Modal
 * 
 * Full-screen modal shown after successful offline sync completion.
 * Auto-closes after 2 seconds.
 * 
 * Features:
 * - Success checkmark animation
 * - Synced count display
 * - Auto-close after 2 seconds
 * - Smooth fade in/out animation
 * 
 * @author UNITY Team
 * @date 2025-10-28
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle } from 'lucide-react';

interface SyncCompletionModalProps {
  isOpen: boolean;
  syncedCount: number;
  onClose: () => void;
}

/**
 * Sync Completion Modal Component
 * 
 * Usage:
 * ```tsx
 * const [showSyncComplete, setShowSyncComplete] = useState(false);
 * const [syncedCount, setSyncedCount] = useState(0);
 * 
 * // When sync completes
 * setSyncedCount(3);
 * setShowSyncComplete(true);
 * 
 * <SyncCompletionModal
 *   isOpen={showSyncComplete}
 *   syncedCount={syncedCount}
 *   onClose={() => setShowSyncComplete(false)}
 * />
 * ```
 */
export function SyncCompletionModal({
  isOpen,
  syncedCount,
  onClose,
}: SyncCompletionModalProps) {
  // Auto-close after 2 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-modal bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-card p-8 rounded-2xl shadow-xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              {/* Success icon with animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
              </motion.div>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-semibold text-foreground"
              >
                Синхронизация завершена
              </motion.h3>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground"
              >
                {syncedCount === 1
                  ? '1 запись успешно синхронизирована'
                  : `${syncedCount} записей успешно синхронизировано`}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

