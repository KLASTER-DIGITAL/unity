import { Image as ImageIcon, Upload, Video } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { type DragEvent, useCallback, useState } from 'react';

type DragDropZoneProps = {
	onFilesSelected: (files: File[]) => void;
	accept?: string;
	maxFiles?: number;
	disabled?: boolean;
	children?: React.ReactNode;
};

export function DragDropZone({
	onFilesSelected,
	accept = 'image/*,video/*',
	maxFiles = 10,
	disabled = false,
	children,
}: DragDropZoneProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [_dragCounter, setDragCounter] = useState(0);

	const handleDragEnter = useCallback(
		(e: DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();

			if (disabled) {
				return;
			}

			setDragCounter((prev) => prev + 1);

			if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
				setIsDragging(true);
			}
		},
		[disabled]
	);

	const handleDragLeave = useCallback(
		(e: DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();

			if (disabled) {
				return;
			}

			setDragCounter((prev) => {
				const newCounter = prev - 1;
				if (newCounter === 0) {
					setIsDragging(false);
				}
				return newCounter;
			});
		},
		[disabled]
	);

	const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleDrop = useCallback(
		(e: DragEvent<HTMLDivElement>) => {
			e.preventDefault();
			e.stopPropagation();

			if (disabled) {
				return;
			}

			setIsDragging(false);
			setDragCounter(0);

			const files = Array.from(e.dataTransfer.files);

			if (files.length === 0) {
				return;
			}

			// Filter by accept type
			const acceptedFiles = files.filter((file) => {
				if (accept === 'image/*,video/*') {
					return file.type.startsWith('image/') || file.type.startsWith('video/');
				}
				if (accept === 'image/*') {
					return file.type.startsWith('image/');
				}
				if (accept === 'video/*') {
					return file.type.startsWith('video/');
				}
				return true;
			});

			// Limit number of files
			const limitedFiles = acceptedFiles.slice(0, maxFiles);

			if (limitedFiles.length > 0) {
				onFilesSelected(limitedFiles);
			}
		},
		[disabled, accept, maxFiles, onFilesSelected]
	);

	return (
		<div
			className="relative"
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			{children}

			{/* Drag Overlay */}
			<AnimatePresence>
				{isDragging && (
					<motion.div
						animate={{ opacity: 1 }}
						className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-lg border-2 border-blue-500 border-dashed bg-blue-500/10 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
					>
						<div className="text-center">
							<motion.div
								animate={{ scale: 1 }}
								className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-500"
								initial={{ scale: 0.8 }}
								transition={{
									repeat: Number.POSITIVE_INFINITY,
									duration: 1,
									repeatType: 'reverse',
								}}
							>
								<Upload className="h-8 w-8 text-white" />
							</motion.div>
							<p className="font-semibold text-blue-600 text-lg">Отпустите файлы для загрузки</p>
							<div className="mt-2 flex items-center justify-center gap-2">
								<ImageIcon className="h-4 w-4 text-blue-500" />
								<span className="text-blue-500 text-sm">Фото</span>
								<span className="text-blue-500 text-sm">•</span>
								<Video className="h-4 w-4 text-blue-500" />
								<span className="text-blue-500 text-sm">Видео</span>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
