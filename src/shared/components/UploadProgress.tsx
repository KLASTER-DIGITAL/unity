import { CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { LottieLoadingIndicator } from './LottieLoadingIndicator';

type UploadProgressProps = {
	fileName: string;
	progress: number;
	status: 'processing' | 'uploading' | 'success' | 'error';
	error?: string;
};

export function UploadProgress({ fileName, progress, status, error }: UploadProgressProps) {
	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="rounded-lg border border-border bg-card p-4 shadow-lg dark:border-border dark:bg-card"
			exit={{ opacity: 0, y: -20 }}
			initial={{ opacity: 0, y: 20 }}
		>
			<div className="flex items-center gap-3">
				{/* Status Icon */}
				<div className="shrink-0">
					{(status === 'processing' || status === 'uploading') && (
						<LottieLoadingIndicator size="sm" />
					)}
					{status === 'success' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
					{status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
				</div>

				{/* File Info */}
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium text-foreground text-sm dark:text-white">{fileName}</p>
					<p className="text-muted-foreground text-xs dark:text-muted-foreground">
						{status === 'processing' && 'Обработка...'}
						{status === 'uploading' && 'Загрузка...'}
						{status === 'success' && 'Загружено'}
						{status === 'error' && (error || 'Ошибка')}
					</p>
				</div>

				{/* Progress */}
				{(status === 'processing' || status === 'uploading') && (
					<div className="shrink-0 font-medium text-muted-foreground text-xs dark:text-muted-foreground">
						{progress}%
					</div>
				)}
			</div>

			{/* Progress Bar */}
			{/* ✅ FIX: Added max-w-full to prevent progress bar overflow */}
			{(status === 'processing' || status === 'uploading') && (
				<div className="mt-2 h-1 max-w-full overflow-hidden rounded-full bg-muted dark:bg-muted">
					<motion.div
						// ✅ FIX: Clamp progress between 0-100
						animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
						className="h-full bg-blue-500"
						initial={{ width: 0 }}
						transition={{ duration: 0.3 }}
					/>
				</div>
			)}
		</motion.div>
	);
}
