import { motion, AnimatePresence } from 'motion/react';
import { X, Pause, Play, Trash2 } from 'lucide-react';
import { UploadProgress } from './UploadProgress';
import type { UploadStatus } from '../hooks/useMediaUploader';

interface QueueItem extends UploadStatus {
  id: string;
  file: File;
}

interface UploadQueueProps {
  queue: QueueItem[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onClearCompleted?: () => void;
}

export function UploadQueue({
  queue,
  onPause,
  onResume,
  onCancel,
  onClearCompleted
}: UploadQueueProps) {
  if (queue.length === 0) return null;

  const completedCount = queue.filter(item => item.status === 'success').length;
  const errorCount = queue.filter(item => item.status === 'error').length;
  const activeCount = queue.filter(item => 
    item.status === 'processing' || item.status === 'uploading'
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 right-4 z-40 w-80 max-w-[calc(100vw-2rem)]"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Загрузка файлов
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {activeCount > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">
                  {activeCount} активных
                </span>
              )}
              {completedCount > 0 && (
                <span className="px-1.5 py-0.5 bg-green-100 text-green-600 rounded">
                  {completedCount} готово
                </span>
              )}
              {errorCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
                  {errorCount} ошибок
                </span>
              )}
            </div>
          </div>

          {/* Clear completed button */}
          {completedCount > 0 && onClearCompleted && (
            <button
              onClick={onClearCompleted}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Очистить
            </button>
          )}
        </div>

        {/* Queue items */}
        <div className="max-h-96 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {queue.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="p-3">
                  <div className="flex items-start gap-2">
                    {/* Progress component */}
                    <div className="flex-1 min-w-0">
                      <UploadProgress
                        fileName={item.fileName}
                        progress={item.progress}
                        status={item.status}
                        error={item.error}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      {/* Pause/Resume button */}
                      {(item.status === 'processing' || item.status === 'uploading') && (
                        <>
                          {onPause && (
                            <button
                              onClick={() => onPause(item.id)}
                              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                              aria-label="Pause"
                            >
                              <Pause className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          )}
                        </>
                      )}

                      {/* Cancel/Remove button */}
                      {onCancel && (
                        <button
                          onClick={() => onCancel(item.id)}
                          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                          aria-label="Cancel"
                        >
                          {item.status === 'success' || item.status === 'error' ? (
                            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

