import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Download, Smartphone } from "lucide-react";

interface InstallPromptProps {
  onClose: () => void;
  onInstall: () => void;
}

export function InstallPrompt({ onClose, onInstall }: InstallPromptProps) {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Определяем iOS устройство
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 400, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 400, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-background rounded-t-[32px] md:rounded-[32px] shadow-2xl overflow-hidden w-full md:max-w-md relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors z-10"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>

          {/* Content */}
          <div className="p-8 pt-10 pb-10">
            {/* Icon with animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-accent to-blue-600 rounded-[24px] flex items-center justify-center shadow-xl"
            >
              <span className="text-[48px]">🏆</span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-foreground mb-3 text-[24px]! font-semibold!"
            >
              Добавить на главный экран?
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-muted-foreground text-[15px]! font-normal! mb-8 leading-[1.5]"
            >
              Установите приложение для быстрого доступа к вашему дневнику достижений
            </motion.p>

            {/* Features */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 mb-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[20px]">⚡️</span>
                </div>
                <p className="text-[14px]! font-normal! text-foreground">Мгновенный запуск как нативное приложение</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[20px]">📱</span>
                </div>
                <p className="text-[14px]! font-normal! text-foreground">Работает без интернета</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[20px]">🔔</span>
                </div>
                <p className="text-[14px]! font-normal! text-foreground">Push-уведомления о ваших целях</p>
              </div>
            </motion.div>

            {/* Install Instructions */}
            {isIOS ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-accent/5 rounded-xl p-4 mb-6"
              >
                <p className="text-[13px]! font-normal! text-foreground text-center leading-[1.5]">
                  Нажмите <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/20 rounded-md mx-1">
                    <Download className="w-3 h-3" />
                    Поделиться
                  </span> внизу экрана, затем выберите{" "}
                  <span className="px-2 py-0.5 bg-accent/20 rounded-md mx-1">
                    "На экран Домой"
                  </span>
                </p>
              </motion.div>
            ) : (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={onInstall}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-[var(--radius-lg)] py-4 px-6 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-[16px]! font-semibold!">Установить приложение</span>
              </motion.button>
            )}

            {/* Skip button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={onClose}
              className="w-full mt-3 text-muted-foreground hover:text-foreground transition-colors py-3"
            >
              <span className="text-[14px]! font-normal!">Может быть позже</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
export default InstallPrompt;
