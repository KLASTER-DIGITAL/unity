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

import { CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect } from 'react';

type SyncCompletionModalProps = {
  isOpen: boolean;
  syncedCount: number;
  onClose: () => void;
};

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
export function SyncCompletionModal({ isOpen, syncedCount, onClose }: SyncCompletionModalProps) {
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
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            className="mx-4 w-full max-w-sm rounded-2xl bg-card p-8 shadow-xl"
            exit={{ scale: 0.9, opacity: 0 }}
            initial={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              {/* Success icon with animation */}
              <motion.div
                animate={{ scale: 1 }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500"
                initial={{ scale: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
              >
                <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
              </motion.div>

              {/* Title */}
              <motion.h3
                animate={{ opacity: 1, y: 0 }}
                className="font-semibold text-foreground text-xl"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.2 }}
              >
                Синхронизация завершена
              </motion.h3>

              {/* Description */}
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="text-muted-foreground"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.3 }}
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
