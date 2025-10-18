import { motion } from 'motion/react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: 'processing' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function UploadProgress({ fileName, progress, status, error }: UploadProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <div className="flex-shrink-0">
          {status === 'processing' && (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          {status === 'uploading' && (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {fileName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {status === 'processing' && 'Обработка...'}
            {status === 'uploading' && 'Загрузка...'}
            {status === 'success' && 'Загружено'}
            {status === 'error' && (error || 'Ошибка')}
          </p>
        </div>

        {/* Progress */}
        {(status === 'processing' || status === 'uploading') && (
          <div className="flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400">
            {progress}%
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {(status === 'processing' || status === 'uploading') && (
        <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-blue-500"
          />
        </div>
      )}
    </motion.div>
  );
}

