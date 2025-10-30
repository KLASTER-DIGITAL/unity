import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

/**
 * Splash screen для PWA
 * Показывается только при запуске установленного приложения в standalone режиме
 */
export function PWASplash() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Проверяем standalone режим
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Проверяем, первый ли это запуск после установки
    const splashShown = sessionStorage.getItem('pwaSplashShown');

    if (isStandalone && !splashShown) {
      setShowSplash(true);
      sessionStorage.setItem('pwaSplashShown', 'true');

      // Автоматически скрываем через 2 секунды
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-linear-to-br from-accent via-blue-500 to-blue-600"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
            exit={{ scale: 1.2, opacity: 0 }}
            initial={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Icon */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-[32px] bg-white/20 shadow-2xl backdrop-blur-xl"
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            >
              <span className="text-[64px]">🏆</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              animate={{ y: 0, opacity: 1 }}
              className="mb-2 font-semibold! text-[32px]! text-white tracking-tight"
              initial={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.2 }}
            >
              Дневник Достижений
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              animate={{ y: 0, opacity: 1 }}
              className="font-normal! text-[16px]! text-white/90"
              initial={{ y: 20, opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              Фиксируйте успехи каждый день
            </motion.p>

            {/* Loading indicator */}
            <motion.div
              animate={{ opacity: 1 }}
              className="mt-8 flex justify-center gap-2"
              initial={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  className="h-2 w-2 rounded-full bg-white/80"
                  key={i}
                  transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.2,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PWASplash;
