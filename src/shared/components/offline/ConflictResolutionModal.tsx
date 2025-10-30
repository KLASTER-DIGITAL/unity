/**
 * Conflict Resolution Modal
 *
 * UI для ручного разрешения конфликтов при синхронизации offline данных.
 * Показывает server vs client данные и позволяет выбрать стратегию разрешения.
 *
 * @author UNITY Team
 * @date 2025-10-28
 */

import { AlertTriangle, GitMerge, Server, Smartphone, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '@/shared/components/ui/button';
import type { ConflictResolution } from '@/shared/lib/offline/offlineManager';

type ConflictResolutionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  conflict: {
    id: string;
    serverData: any;
    clientData: any;
    field: string;
  } | null;
  onResolve: (resolution: ConflictResolution) => void;
};

export function ConflictResolutionModal({
  isOpen,
  onClose,
  conflict,
  onResolve,
}: ConflictResolutionModalProps) {
  if (!conflict) {
    return null;
  }

  const handleResolve = (strategy: ConflictResolution['strategy']) => {
    let resolution: ConflictResolution;

    switch (strategy) {
      case 'server-wins':
        resolution = {
          strategy: 'server-wins',
          serverData: conflict.serverData,
          clientData: conflict.clientData,
        };
        break;
      case 'client-wins':
        resolution = {
          strategy: 'client-wins',
          serverData: conflict.serverData,
          clientData: conflict.clientData,
        };
        break;
      case 'merge':
        // Простое слияние - берем client данные, но сохраняем server metadata
        resolution = {
          strategy: 'merge',
          serverData: conflict.serverData,
          clientData: conflict.clientData,
          mergedData: {
            ...conflict.serverData,
            ...conflict.clientData,
          },
        };
        break;
      default:
        resolution = {
          strategy: 'server-wins',
          serverData: conflict.serverData,
          clientData: conflict.clientData,
        };
    }

    onResolve(resolution);
    onClose();
  };

  const formatData = (data: any) => {
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-modal-backdrop bg-black/50"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="modal-bottom-sheet z-modal mx-auto max-w-md overflow-y-auto border-border border-t bg-card p-modal transition-colors duration-300"
            exit={{ opacity: 0, y: 100 }}
            initial={{ opacity: 0, y: 100 }}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-responsive-sm">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <h3 className="text-foreground text-title-2">Конфликт синхронизации</h3>
              </div>
              <button
                className="rounded-full p-1 transition-colors hover:bg-accent/10"
                onClick={onClose}
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>

            {/* Description */}
            <p className="mb-6 text-footnote text-muted-foreground">
              Обнаружены различия между локальными и серверными данными. Выберите какую версию
              сохранить.
            </p>

            {/* Server Data */}
            <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-footnote text-foreground">Данные с сервера</h4>
              </div>
              <div className="rounded border border-border bg-card p-3">
                <pre className="whitespace-pre-wrap break-words text-caption-1 text-foreground">
                  {formatData(conflict.serverData)}
                </pre>
              </div>
            </div>

            {/* Client Data */}
            <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-green-600" />
                <h4 className="font-semibold text-footnote text-foreground">Локальные данные</h4>
              </div>
              <div className="rounded border border-border bg-card p-3">
                <pre className="whitespace-pre-wrap break-words text-caption-1 text-foreground">
                  {formatData(conflict.clientData)}
                </pre>
              </div>
            </div>

            {/* Resolution Buttons */}
            <div className="space-y-3">
              <Button
                className="w-full justify-start border-blue-500/20 hover:bg-blue-500/5"
                onClick={() => handleResolve('server-wins')}
                variant="outline"
              >
                <Server className="mr-2 h-4 w-4 text-blue-600" />
                <div className="flex-1 text-left">
                  <div className="font-medium text-footnote">Использовать серверные данные</div>
                  <div className="text-caption-1 text-muted-foreground">
                    Локальные изменения будут отменены
                  </div>
                </div>
              </Button>

              <Button
                className="w-full justify-start border-green-500/20 hover:bg-green-500/5"
                onClick={() => handleResolve('client-wins')}
                variant="outline"
              >
                <Smartphone className="mr-2 h-4 w-4 text-green-600" />
                <div className="flex-1 text-left">
                  <div className="font-medium text-footnote">Использовать локальные данные</div>
                  <div className="text-caption-1 text-muted-foreground">
                    Серверные данные будут перезаписаны
                  </div>
                </div>
              </Button>

              <Button
                className="w-full justify-start border-purple-500/20 hover:bg-purple-500/5"
                onClick={() => handleResolve('merge')}
                variant="outline"
              >
                <GitMerge className="mr-2 h-4 w-4 text-purple-600" />
                <div className="flex-1 text-left">
                  <div className="font-medium text-footnote">Объединить данные</div>
                  <div className="text-caption-1 text-muted-foreground">
                    Попытаться объединить обе версии
                  </div>
                </div>
              </Button>
            </div>

            {/* Warning */}
            <div className="mt-4 rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600" />
                <p className="text-caption-1 text-orange-600">
                  Выбранное действие нельзя будет отменить. Убедитесь что выбрали правильную версию
                  данных.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
