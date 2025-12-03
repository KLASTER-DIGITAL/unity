/**
 * Book Creation Success Modal
 *
 * Shows success message after book is created with option to go to library
 *
 * @author UNITY Team
 * @date 2025-11-21
 */

import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from '@/shared/lib/i18n';

export type BookCreationSuccessModalProps = {
	isOpen: boolean;
	onGoToLibrary: () => void;
	onClose?: () => void;
};

export function BookCreationSuccessModal({
	isOpen,
	onGoToLibrary,
	onClose,
}: BookCreationSuccessModalProps) {
	const { t } = useTranslation();

	// Confetti effect when modal opens
	useEffect(() => {
		if (isOpen) {
			const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			if (!prefersReducedMotion) {
				confetti({
					particleCount: 100,
					spread: 70,
					origin: { y: 0.6 },
					colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB'],
				});
			}
		}
	}, [isOpen]);

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={onClose}
					/>

					{/* Modal */}
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="fixed left-1/2 top-1/2 z-[70] w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-2xl transition-colors duration-300 sm:p-8"
						exit={{ opacity: 0, scale: 0.9 }}
						initial={{ opacity: 0, scale: 0.9 }}
						onClick={(e) => e.stopPropagation()}
						transition={{ type: 'spring', stiffness: 260, damping: 24 }}
					>
						<div className="flex flex-col items-center gap-4 text-center">
							{/* Success Icon */}
							<motion.div
								animate={{ scale: 1 }}
								className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 sm:h-20 sm:w-20"
								initial={{ scale: 0 }}
								transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 24 }}
							>
								<CheckCircle2 className="h-8 w-8 text-green-500 sm:h-10 sm:w-10" strokeWidth={2} />
							</motion.div>

							{/* Title */}
							<motion.h2
								animate={{ opacity: 1, y: 0 }}
								className="text-xl font-semibold text-foreground sm:text-2xl"
								initial={{ opacity: 0, y: 10 }}
								transition={{ delay: 0.3 }}
							>
								{t('books.success.title', 'Книга создана! 🎉')}
							</motion.h2>

							{/* Description */}
							<motion.p
								animate={{ opacity: 1, y: 0 }}
								className="text-muted-foreground text-sm sm:text-base"
								initial={{ opacity: 0, y: 10 }}
								transition={{ delay: 0.4 }}
							>
								{t(
									'books.success.message',
									'Черновик книги создан. На следующем шаге ты сможешь отредактировать его и сохранить финальную PDF‑версию для скачивания или сразу перейти к полке книг.'
								)}
							</motion.p>

							{/* Actions */}
							<motion.div
								animate={{ opacity: 1, y: 0 }}
								className="mt-2 flex w-full flex-col gap-3 sm:flex-row"
								initial={{ opacity: 0, y: 10 }}
								transition={{ delay: 0.5 }}
							>
								{onClose && (
									<Button
										className="w-full"
										onClick={onClose}
										size="lg"
										style={{ minHeight: '44px' }}
										variant="outline"
									>
										{t('books.success.go_to_library', 'Перейти на полку книг')}
									</Button>
								)}
								<Button
									className="w-full"
									onClick={onGoToLibrary}
									size="lg"
									style={{ minHeight: '44px' }}
								>
									<BookOpen className="mr-2 h-4 w-4" />
									{t('books.success.go_to_editor', 'Открыть редактор книги')}
								</Button>
							</motion.div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
