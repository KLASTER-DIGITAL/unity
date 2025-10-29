/**
 * Offline Mode Badge
 * 
 * Compact badge showing offline mode status and pending sync count.
 * Displays at the top center of the screen when offline or when there are pending syncs.
 * 
 * Features:
 * - Shows "Offline Mode" text with 📴 icon
 * - Displays pending sync count in a pill
 * - Smooth fade in/out animation
 * - Auto-hides when online and no pending syncs
 * 
 * @author UNITY Team
 * @date 2025-10-28
 */

import { motion, AnimatePresence } from 'motion/react';
import { CloudOff } from 'lucide-react';
import { useOfflineMode } from '@/shared/lib/offline';

/**
 * Offline Mode Badge Component
 * 
 * Usage:
 * ```tsx
 * <OfflineModeBadge />
 * ```
 */
export function OfflineModeBadge() {
  const { isOnline, pendingCount } = useOfflineMode();

  // Show badge when offline OR when there are pending syncs
  const shouldShow = !isOnline || pendingCount > 0;

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed top-2 left-1/2 -translate-x-1/2 z-50 max-w-md"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted text-muted-foreground rounded-full shadow-lg text-xs font-medium transition-colors duration-300">
          {/* Icon */}
          <CloudOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />

          {/* Text */}
          <span className="whitespace-nowrap">Offline Mode</span>

          {/* Pending count pill */}
          {pendingCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-1.5 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-semibold transition-colors duration-300"
              aria-label={`${pendingCount} записей ожидают синхронизации`}
            >
              {pendingCount}
            </motion.span>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

