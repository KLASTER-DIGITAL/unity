// ✅ REACT NATIVE READY: Use Platform Adapter for animations
import { motion, AnimatedPresence } from "@/shared/lib/platform/animation";
import { CloudOff, Cloud } from "lucide-react";

interface SuccessModalProps {
  isOpen: boolean;
  userName?: string;
  isOffline?: boolean;
}

/**
 * Success modal shown after entry is saved
 * Features:
 * - Animated backdrop
 * - Success icon with spring animation
 * - User name personalization
 * - AI processing message
 * - Offline mode indicator
 */
export function SuccessModal({ isOpen, userName = "Анна", isOffline = false }: SuccessModalProps) {
  return (
    <AnimatedPresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-modal-backdrop backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-modal bg-card rounded-[24px] p-modal shadow-2xl border border-border transition-colors duration-300"
            style={{ width: '300px', minHeight: '230px' }}
          >
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-responsive-md">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <svg className="w-8 h-8 text-(--ios-green)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            </div>

            {/* Text */}
            <h3 className="text-center text-[18px]! font-semibold! text-foreground mb-2">
              Отлично {userName}!<br />Ваша запись сохранена! 🎉
            </h3>
            <p className="text-center text-[14px]! text-muted-foreground">
              {isOffline
                ? "Запись будет синхронизирована когда появится интернет"
                : "AI обрабатывает запись и создает мотивационную карточку..."
              }
            </p>

            {/* Offline Indicator */}
            {isOffline && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/10 rounded-lg border border-orange-500/20"
              >
                <CloudOff className="h-4 w-4 text-orange-600" />
                <span className="text-[12px]! text-orange-600 font-medium">
                  Сохранено offline
                </span>
              </motion.div>
            )}

            {/* Online Indicator (optional) */}
            {!isOffline && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 rounded-lg border border-green-500/20"
              >
                <Cloud className="h-4 w-4 text-green-600" />
                <span className="text-[12px]! text-green-600 font-medium">
                  Синхронизировано
                </span>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatedPresence>
  );
}

