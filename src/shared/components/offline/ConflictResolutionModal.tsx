/**
 * Conflict Resolution Modal
 * 
 * UI для ручного разрешения конфликтов при синхронизации offline данных.
 * Показывает server vs client данные и позволяет выбрать стратегию разрешения.
 * 
 * @author UNITY Team
 * @date 2025-10-28
 */

import { AnimatePresence, motion } from "motion/react";
import { X, Server, Smartphone, GitMerge, AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import type { ConflictResolution } from "@/shared/lib/offline/offlineManager";

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflict: {
    id: string;
    serverData: any;
    clientData: any;
    field: string;
  } | null;
  onResolve: (resolution: ConflictResolution) => void;
}

export function ConflictResolutionModal({
  isOpen,
  onClose,
  conflict,
  onResolve
}: ConflictResolutionModalProps) {
  if (!conflict) return null;

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
    if (typeof data === 'string') return data;
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
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <h3 className="text-title-2 text-foreground">
                  Конфликт синхронизации
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-accent/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Description */}
            <p className="text-footnote text-muted-foreground mb-6">
              Обнаружены различия между локальными и серверными данными. 
              Выберите какую версию сохранить.
            </p>

            {/* Server Data */}
            <div className="mb-4 p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Server className="h-4 w-4 text-blue-600" />
                <h4 className="text-footnote font-semibold text-foreground">
                  Данные с сервера
                </h4>
              </div>
              <div className="bg-card p-3 rounded border border-border">
                <pre className="text-caption-1 text-foreground whitespace-pre-wrap break-words">
                  {formatData(conflict.serverData)}
                </pre>
              </div>
            </div>

            {/* Client Data */}
            <div className="mb-6 p-4 bg-green-500/5 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="h-4 w-4 text-green-600" />
                <h4 className="text-footnote font-semibold text-foreground">
                  Локальные данные
                </h4>
              </div>
              <div className="bg-card p-3 rounded border border-border">
                <pre className="text-caption-1 text-foreground whitespace-pre-wrap break-words">
                  {formatData(conflict.clientData)}
                </pre>
              </div>
            </div>

            {/* Resolution Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleResolve('server-wins')}
                variant="outline"
                className="w-full justify-start border-blue-500/20 hover:bg-blue-500/5"
              >
                <Server className="h-4 w-4 mr-2 text-blue-600" />
                <div className="flex-1 text-left">
                  <div className="text-footnote font-medium">Использовать серверные данные</div>
                  <div className="text-caption-1 text-muted-foreground">
                    Локальные изменения будут отменены
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleResolve('client-wins')}
                variant="outline"
                className="w-full justify-start border-green-500/20 hover:bg-green-500/5"
              >
                <Smartphone className="h-4 w-4 mr-2 text-green-600" />
                <div className="flex-1 text-left">
                  <div className="text-footnote font-medium">Использовать локальные данные</div>
                  <div className="text-caption-1 text-muted-foreground">
                    Серверные данные будут перезаписаны
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleResolve('merge')}
                variant="outline"
                className="w-full justify-start border-purple-500/20 hover:bg-purple-500/5"
              >
                <GitMerge className="h-4 w-4 mr-2 text-purple-600" />
                <div className="flex-1 text-left">
                  <div className="text-footnote font-medium">Объединить данные</div>
                  <div className="text-caption-1 text-muted-foreground">
                    Попытаться объединить обе версии
                  </div>
                </div>
              </Button>
            </div>

            {/* Warning */}
            <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-caption-1 text-orange-600">
                  Выбранное действие нельзя будет отменить. 
                  Убедитесь что выбрали правильную версию данных.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

