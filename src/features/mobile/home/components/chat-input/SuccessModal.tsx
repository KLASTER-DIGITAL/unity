// ✅ REACT NATIVE READY: Use Platform Adapter for animations

import { Cloud, CloudOff } from 'lucide-react';
import { AnimatedPresence, motion } from '@/shared/lib/platform/animation';

type SuccessModalProps = {
  isOpen: boolean;
  userName?: string;
  isOffline?: boolean;
};

/**
 * Success modal shown after entry is saved
 * Features:
 * - Animated backdrop
 * - Success icon with spring animation
 * - User name personalization
 * - AI processing message
 * - Offline mode indicator
 */
export function SuccessModal({ isOpen, userName = 'Анна', isOffline = false }: SuccessModalProps) {
  return (
    <AnimatedPresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-modal rounded-[24px] border border-border bg-card p-modal shadow-2xl transition-colors duration-300"
            exit={{ opacity: 0, scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.9 }}
            style={{ width: '300px', minHeight: '230px' }}
          >
            {/* Success Icon */}
            <div className="mx-auto mb-responsive-md flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <motion.div
                animate={{ scale: 1 }}
                initial={{ scale: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <svg
                  className="h-8 w-8 text-(--ios-green)"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                  />
                </svg>
              </motion.div>
            </div>

            {/* Text */}
            <h3 className="mb-2 text-center font-semibold! text-[18px]! text-foreground">
              Отлично {userName}!<br />
              Ваша запись сохранена! 🎉
            </h3>
            <p className="text-center text-[14px]! text-muted-foreground">
              {isOffline
                ? 'Запись будет синхронизирована когда появится интернет'
                : 'AI обрабатывает запись и создает мотивационную карточку...'}
            </p>

            {/* Offline Indicator */}
            {isOffline && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.3 }}
              >
                <CloudOff className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-[12px]! text-orange-600">Сохранено offline</span>
              </motion.div>
            )}

            {/* Online Indicator (optional) */}
            {!isOffline && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.3 }}
              >
                <Cloud className="h-4 w-4 text-green-600" />
                <span className="font-medium text-[12px]! text-green-600">Синхронизировано</span>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatedPresence>
  );
}
