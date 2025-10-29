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
      className="bg-card dark:bg-card rounded-lg p-4 shadow-lg border border-border dark:border-border"
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
          <p className="text-sm font-medium text-foreground dark:text-white truncate">
            {fileName}
          </p>
          <p className="text-xs text-muted-foreground dark:text-muted-foreground">
            {status === 'processing' && 'Обработка...'}
            {status === 'uploading' && 'Загрузка...'}
            {status === 'success' && 'Загружено'}
            {status === 'error' && (error || 'Ошибка')}
          </p>
        </div>

        {/* Progress */}
        {(status === 'processing' || status === 'uploading') && (
          <div className="flex-shrink-0 text-xs font-medium text-muted-foreground dark:text-muted-foreground">
            {progress}%
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {(status === 'processing' || status === 'uploading') && (
        <div className="mt-2 h-1 bg-muted dark:bg-muted rounded-full overflow-hidden">
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

