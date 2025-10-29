import { AnimatePresence, motion } from "motion/react";
import { X, CloudOff, RefreshCw, AlertTriangle, Database, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { SettingsRow, SettingsSection } from "../../SettingsRow";
import { useOfflineMode } from "@/shared/lib/offline";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface OfflineSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: any;
}

type ConflictStrategy = 'server-wins' | 'client-wins' | 'merge' | 'manual';

export function OfflineSettingsModal({ isOpen, onClose, t }: OfflineSettingsModalProps) {
  const { 
    isOnline, 
    pendingCount, 
    syncInProgress, 
    sync, 
    clearOfflineData 
  } = useOfflineMode();

  // Local state для настроек
  const [autoSync, setAutoSync] = useState(true);
  const [conflictStrategy, setConflictStrategy] = useState<ConflictStrategy>('server-wins');
  const [cacheSizeLimit, setCacheSizeLimit] = useState(100); // MB

  // Load settings from localStorage
  useEffect(() => {
    if (isOpen) {
      const savedAutoSync = localStorage.getItem('offline_auto_sync');
      const savedStrategy = localStorage.getItem('offline_conflict_strategy');
      const savedCacheLimit = localStorage.getItem('offline_cache_limit');

      if (savedAutoSync !== null) setAutoSync(savedAutoSync === 'true');
      if (savedStrategy) setConflictStrategy(savedStrategy as ConflictStrategy);
      if (savedCacheLimit) setCacheSizeLimit(parseInt(savedCacheLimit));
    }
  }, [isOpen]);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('offline_auto_sync', autoSync.toString());
    localStorage.setItem('offline_conflict_strategy', conflictStrategy);
    localStorage.setItem('offline_cache_limit', cacheSizeLimit.toString());
    toast.success("Настройки сохранены");
  };

  const handleAutoSyncChange = (checked: boolean) => {
    setAutoSync(checked);
    localStorage.setItem('offline_auto_sync', checked.toString());
  };

  const handleConflictStrategyChange = (strategy: ConflictStrategy) => {
    setConflictStrategy(strategy);
    localStorage.setItem('offline_conflict_strategy', strategy);
  };

  const handleManualSync = async () => {
    try {
      await sync();
      toast.success("Синхронизация завершена");
    } catch (error) {
      toast.error("Ошибка синхронизации");
      console.error('[OfflineSettings] Sync error:', error);
    }
  };

  const handleClearOfflineData = async () => {
    if (confirm("Вы уверены? Все несинхронизированные данные будут удалены.")) {
      try {
        await clearOfflineData();
        toast.success("Offline данные очищены");
      } catch (error) {
        toast.error("Ошибка очистки данных");
        console.error('[OfflineSettings] Clear error:', error);
      }
    }
  };

  const getConflictStrategyDescription = (strategy: ConflictStrategy) => {
    switch (strategy) {
      case 'server-wins':
        return 'Данные с сервера имеют приоритет';
      case 'client-wins':
        return 'Локальные данные имеют приоритет';
      case 'merge':
        return 'Автоматическое объединение данных';
      case 'manual':
        return 'Ручное разрешение конфликтов';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-modal-backdrop"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="modal-bottom-sheet z-modal bg-card p-modal max-w-md mx-auto overflow-y-auto border-t border-border transition-colors duration-300"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-responsive-sm">
                <CloudOff className="h-6 w-6 text-[var(--ios-purple)]" />
                <h3 className="text-title-2 text-foreground">
                  {t.offlineSettings || "Настройки Offline"}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Status */}
            <div className="mb-6 p-4 bg-accent/5 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-footnote text-muted-foreground">Статус подключения:</span>
                <span className={`text-footnote font-semibold ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
                  {isOnline ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-footnote text-muted-foreground">Ожидают синхронизации:</span>
                <span className="text-footnote font-semibold text-foreground">
                  {pendingCount} записей
                </span>
              </div>
            </div>

            {/* Auto Sync */}
            <SettingsSection title="Синхронизация">
              <SettingsRow
                icon={RefreshCw}
                iconColor="text-[var(--ios-blue)]"
                iconBgColor="bg-[var(--ios-blue)]/10"
                title="Автоматическая синхронизация"
                description="Синхронизировать при появлении сети"
                rightElement="switch"
                switchChecked={autoSync}
                onSwitchChange={handleAutoSyncChange}
              />
            </SettingsSection>

            {/* Conflict Resolution */}
            <SettingsSection title="Разрешение конфликтов">
              <div className="space-y-2">
                {(['server-wins', 'client-wins', 'merge', 'manual'] as ConflictStrategy[]).map((strategy) => (
                  <button
                    key={strategy}
                    onClick={() => handleConflictStrategyChange(strategy)}
                    className={`w-full p-3 rounded-lg border transition-colors text-left ${
                      conflictStrategy === strategy
                        ? 'border-[var(--ios-blue)] bg-[var(--ios-blue)]/5'
                        : 'border-border hover:bg-accent/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {conflictStrategy === strategy && (
                            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center transition-colors duration-300">
                              <div className="w-2 h-2 rounded-full bg-primary-foreground transition-colors duration-300" />
                            </div>
                          )}
                          <span className="text-footnote font-medium text-foreground">
                            {strategy === 'server-wins' && 'Приоритет сервера'}
                            {strategy === 'client-wins' && 'Приоритет клиента'}
                            {strategy === 'merge' && 'Автоматическое слияние'}
                            {strategy === 'manual' && 'Ручное разрешение'}
                          </span>
                        </div>
                        <p className="text-caption-1 text-muted-foreground mt-1 ml-6">
                          {getConflictStrategyDescription(strategy)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </SettingsSection>

            {/* Actions */}
            <div className="space-y-3 mt-6">
              {/* Manual Sync */}
              <Button
                onClick={handleManualSync}
                disabled={syncInProgress || pendingCount === 0}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncInProgress ? 'animate-spin' : ''}`} />
                {syncInProgress ? 'Синхронизация...' : `Синхронизировать сейчас (${pendingCount})`}
              </Button>

              {/* Clear Offline Data */}
              <Button
                onClick={handleClearOfflineData}
                variant="outline"
                className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Очистить offline данные
              </Button>
            </div>

            {/* Warning */}
            <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-caption-1 text-orange-600">
                  Offline режим использует локальное хранилище браузера. 
                  Не очищайте данные браузера, чтобы не потерять несинхронизированные записи.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

