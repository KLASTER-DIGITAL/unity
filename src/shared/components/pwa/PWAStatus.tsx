import { Smartphone } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';

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
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
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
          animate={{ opacity: 1, y: 0 }}
          className="-translate-x-1/2 fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
          exit={{ opacity: 0, y: -100 }}
          initial={{ opacity: 0, y: -100 }}
        >
          <div className="flex items-center gap-3 rounded-xl bg-accent p-4 text-accent-foreground shadow-2xl">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold! text-[14px]!">Приложение установлено!</p>
              <p className="font-normal! text-[12px]! opacity-90">
                Теперь вы можете использовать его оффлайн
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default PWAStatus;
