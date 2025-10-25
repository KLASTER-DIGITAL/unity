import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw, X } from "lucide-react";

/**
 * Компонент показывает уведомление когда доступно обновление приложения
 */
export function PWAUpdatePrompt() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleServiceWorkerUpdate = (registration: ServiceWorkerRegistration) => {
      // Если есть ожидающий Service Worker
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowUpdate(true);
      }

      // Слушаем изменения состояния
      if (registration.installing) {
        registration.installing.addEventListener('statechange', (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(sw);
            setShowUpdate(true);
          }
        });
      }
    };

    // Проверяем существующую регистрацию
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        handleServiceWorkerUpdate(registration);
        
        // Проверяем обновления каждые 60 секунд
        setInterval(() => {
          registration.update();
        }, 60000);
      }
    });

    // Слушаем событие обновления контроллера
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!isUpdating) {
        window.location.reload();
      }
    });
  }, [isUpdating]);

  const handleUpdate = () => {
    if (!waitingWorker) return;
    
    setIsUpdating(true);
    
    // Отправляем сообщение новому Service Worker для активации
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    
    setShowUpdate(false);
  };

  const handleSkip = () => {
    setShowUpdate(false);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)]"
        >
          <div className="bg-card border border-border rounded-xl shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <RefreshCw className="w-5 h-5 text-accent" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-foreground text-[15px]! font-semibold! mb-1">
                  Доступно обновление
                </h3>
                <p className="text-muted-foreground text-[13px]! font-normal! mb-3">
                  Новая версия приложения готова к установке
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdate}
                    disabled={isUpdating}
                    className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground rounded-[var(--radius-lg)] py-2 px-4 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-[13px]! font-semibold!">
                      {isUpdating ? 'Обновление...' : 'Обновить'}
                    </span>
                  </button>
                  <button
                    onClick={handleSkip}
                    className="px-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default PWAUpdatePrompt;
