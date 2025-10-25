import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Splash screen для PWA
 * Показывается только при запуске установленного приложения в standalone режиме
 */
export function PWASplash() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Проверяем standalone режим
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] bg-gradient-to-br from-accent via-blue-500 to-blue-600 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center"
          >
            {/* Icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 bg-white/20 backdrop-blur-xl rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <span className="text-[64px]">🏆</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white text-[32px]! font-semibold! tracking-tight mb-2"
            >
              Дневник Достижений
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-[16px]! font-normal!"
            >
              Фиксируйте успехи каждый день
            </motion.p>

            {/* Loading indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex justify-center gap-2"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-2 h-2 bg-white/80 rounded-full"
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
