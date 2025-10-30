import { Pause, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { UploadStatus } from '../hooks/useMediaUploader';
import { UploadProgress } from './UploadProgress';

interface QueueItem extends UploadStatus {
	id: string;
	file: File;
}

type UploadQueueProps = {
	queue: QueueItem[];
	onPause?: (id: string) => void;
	onResume?: (id: string) => void;
	onCancel?: (id: string) => void;
	onClearCompleted?: () => void;
};

export function UploadQueue({
	queue,
	onPause,
	onResume: _onResume,
	onCancel,
	onClearCompleted,
}: UploadQueueProps) {
	if (queue.length === 0) {
		return null;
	}

	const completedCount = queue.filter((item) => item.status === 'success').length;
	const errorCount = queue.filter((item) => item.status === 'error').length;
	const activeCount = queue.filter(
		(item) => item.status === 'processing' || item.status === 'uploading'
	).length;

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="fixed right-4 bottom-20 z-40 w-80 max-w-[calc(100vw-2rem)]"
			exit={{ opacity: 0, y: 20 }}
			initial={{ opacity: 0, y: 20 }}
		>
			<div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xl dark:border-border dark:bg-card">
				{/* Header */}
				<div className="flex items-center justify-between border-border border-b p-3 dark:border-border">
					<div className="flex items-center gap-2">
						<h3 className="font-semibold text-foreground text-sm dark:text-white">
							Загрузка файлов
						</h3>
						<div className="flex items-center gap-1 text-muted-foreground text-xs">
							{activeCount > 0 && (
								<span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-600">
									{activeCount} активных
								</span>
							)}
							{completedCount > 0 && (
								<span className="rounded bg-green-100 px-1.5 py-0.5 text-green-600">
									{completedCount} готово
								</span>
							)}
							{errorCount > 0 && (
								<span className="rounded bg-red-100 px-1.5 py-0.5 text-red-600">
									{errorCount} ошибок
								</span>
							)}
						</div>
					</div>

					{/* Clear completed button */}
					{completedCount > 0 && onClearCompleted && (
						<button
							className="text-muted-foreground text-xs hover:text-foreground dark:hover:text-gray-300"
							onClick={onClearCompleted}
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
								animate={{ opacity: 1, height: 'auto' }}
								className="border-gray-100 border-b last:border-b-0 dark:border-border"
								exit={{ opacity: 0, height: 0 }}
								initial={{ opacity: 0, height: 0 }}
								key={item.id}
								layout
							>
								<div className="p-3">
									<div className="flex items-start gap-2">
										{/* Progress component */}
										<div className="min-w-0 flex-1">
											<UploadProgress
												error={item.error}
												fileName={item.fileName}
												progress={item.progress}
												status={item.status}
											/>
										</div>

										{/* Action buttons */}
										<div className="flex items-center gap-1">
											{/* Pause/Resume button */}
											{(item.status === 'processing' || item.status === 'uploading') && onPause && (
												<button
													aria-label="Pause"
													className="rounded p-1.5 transition-colors hover:bg-muted dark:hover:bg-muted"
													onClick={() => onPause(item.id)}
												>
													<Pause className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
												</button>
											)}

											{/* Cancel/Remove button */}
											{onCancel && (
												<button
													aria-label="Cancel"
													className="rounded p-1.5 transition-colors hover:bg-red-100 dark:hover:bg-red-900/20"
													onClick={() => onCancel(item.id)}
												>
													{item.status === 'success' || item.status === 'error' ? (
														<X className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
													) : (
														<Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
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
