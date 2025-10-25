import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Smartphone } from "lucide-react";

/**
 * Компонент показывает статус PWA:
 * - Успешное обновление Service Worker
 * - Работа в standalone режиме
 */
export function PWAStatus() {
  const [showInstalled, setShowInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Проверяем, запущено ли приложение в standalone режиме
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
    
    setIsStandalone(standalone);

    // Показываем уведомление только при первом запуске в standalone
    if (standalone) {
      const standaloneShown = sessionStorage.getItem('standaloneNotificationShown');
      if (!standaloneShown) {
        setShowInstalled(true);
        sessionStorage.setItem('standaloneNotificationShown', 'true');
        
        // Автоматически скрываем через 3 секунды
        setTimeout(() => {
          setShowInstalled(false);
        }, 3000);
      }
    }

    // Слушаем обновления Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker updated');
        // Можно показать уведомление об обновлении
      });
    }
  }, []);

  return (
    <AnimatePresence>
      {showInstalled && isStandalone && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)]"
        >
          <div className="bg-accent text-accent-foreground rounded-[var(--radius-xl)] shadow-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="!text-[14px] !font-semibold">Приложение установлено!</p>
              <p className="!text-[12px] !font-normal opacity-90">Теперь вы можете использовать его оффлайн</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default PWAStatus;
