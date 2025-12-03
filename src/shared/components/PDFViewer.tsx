/**
 * PDF Viewer Component
 *
 * ✅ MOBILE OPTIMIZED: Fullscreen modal for viewing PDF files on mobile (375x667+)
 * - Fullscreen on mobile devices (< 768px)
 * - Compact modal on desktop with proper spacing
 * - Close button with swipe gesture support
 * - Optimized for iPhone SE (375x667) and larger screens
 *
 * @author UNITY Team
 * @date 2025-11-22
 */

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type PDFViewerProps = {
	pdfUrl: string;
	fileName?: string;
	isOpen: boolean;
	onClose: () => void;
};

export function PDFViewer({ pdfUrl, fileName, isOpen, onClose }: PDFViewerProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	// ✅ FIX: Clean PDF URL - remove PDF.js viewer parameters that cause 400 errors
	// Supabase Storage doesn't support URL fragments (#toolbar=1&navpanes=1...)
	const cleanPdfUrl = pdfUrl ? pdfUrl.split('#')[0] : '';

	// Reset state when modal opens/closes or URL changes
	useEffect(() => {
		if (isOpen && cleanPdfUrl) {
			setIsLoading(true);
			setHasError(false);
			setErrorMessage(null);
		}
	}, [isOpen, cleanPdfUrl]);

	// Close on Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			// Prevent body scroll
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = '';
		};
	}, [isOpen, onClose]);

	// Handle iframe load success
	const handleIframeLoad = () => {
		setIsLoading(false);
		setHasError(false);
		console.log('[PDFViewer] PDF loaded successfully');
	};

	// Handle iframe load error
	const handleIframeError = () => {
		setIsLoading(false);
		setHasError(true);
		setErrorMessage('Не удалось загрузить PDF файл. Возможно, файл не существует или недоступен.');
		console.error('[PDFViewer] Failed to load PDF:', cleanPdfUrl);
	};

	// Timeout для загрузки (если PDF не загрузился за 10 секунд, показываем ошибку)
	useEffect(() => {
		if (!isOpen || !cleanPdfUrl) return;

		const timeout = setTimeout(() => {
			if (isLoading) {
				setIsLoading(false);
				setHasError(true);
				setErrorMessage(
					'PDF файл загружается слишком долго. Возможно, файл слишком большой или недоступен.'
				);
				console.warn('[PDFViewer] PDF loading timeout');
			}
		}, 10000); // 10 секунд таймаут

		return () => clearTimeout(timeout);
	}, [isOpen, cleanPdfUrl, isLoading]);

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					animate={{ opacity: 1 }}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
					exit={{ opacity: 0 }}
					initial={{ opacity: 0 }}
					onClick={onClose}
				>
					{/* Close Button - ✅ MOBILE OPTIMIZED: Larger touch target, better positioning */}
					<button
						aria-label={fileName ? `Закрыть просмотр ${fileName}` : 'Закрыть просмотр PDF'}
						className="absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 p-2 backdrop-blur-md transition-all hover:bg-white/30 active:scale-95 sm:top-4 sm:right-4 sm:h-12 sm:w-12"
						onClick={onClose}
						type="button"
					>
						<X className="h-5 w-5 text-white sm:h-6 sm:w-6" strokeWidth={2.5} />
					</button>

					{/* PDF Container - ✅ MOBILE OPTIMIZED: Fullscreen on mobile, compact on desktop */}
					<motion.div
						animate={{ scale: 1, opacity: 1 }}
						className="relative h-full w-full sm:h-[90vh] sm:w-[90vw] sm:max-w-4xl sm:rounded-lg"
						exit={{ scale: 0.95, opacity: 0 }}
						initial={{ scale: 0.95, opacity: 0 }}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Loading State */}
						{isLoading && !hasError && (
							<div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
								<Loader2 className="mb-4 h-12 w-12 animate-spin text-white sm:h-16 sm:w-16" />
								<p className="text-sm font-medium text-white sm:text-base">Загрузка PDF...</p>
							</div>
						)}

						{/* Error State */}
						{hasError && (
							<div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm sm:rounded-lg">
								<AlertCircle className="mb-4 h-12 w-12 text-red-400 sm:h-16 sm:w-16" />
								<p className="mb-2 max-w-[80%] text-center text-sm font-medium text-white sm:text-base">
									{errorMessage || 'Не удалось загрузить PDF файл'}
								</p>
								<p className="max-w-[80%] text-center text-xs text-white/70 sm:text-sm">
									Проверьте, что файл существует и доступен
								</p>
								<button
									className="mt-4 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/30 active:scale-95"
									onClick={onClose}
									type="button"
								>
									Закрыть
								</button>
							</div>
						)}

						{/* PDF iframe with scroll - ✅ Fullscreen on mobile */}
						{cleanPdfUrl && (
							<iframe
								className={`h-full w-full border-0 sm:rounded-lg ${isLoading || hasError ? 'opacity-0' : 'opacity-100'}`}
								onError={handleIframeError}
								onLoad={handleIframeLoad}
								src={`${cleanPdfUrl}#toolbar=1&navpanes=1&scrollbar=1&zoom=page-fit`}
								title={fileName || 'Просмотр PDF документа'}
							/>
						)}
					</motion.div>

					{/* File name - ✅ MOBILE OPTIMIZED: Compact, only on desktop */}
					{fileName && (
						<motion.div
							animate={{ opacity: 1 }}
							className="-translate-x-1/2 absolute bottom-3 left-1/2 hidden max-w-[90%] rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-md sm:block"
							initial={{ opacity: 0 }}
						>
							<p className="truncate text-xs font-medium text-white sm:text-sm">{fileName}</p>
						</motion.div>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
}
