import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from '@/shared/lib/i18n';

type BookDeleteConfirmModalProps = {
	bookTitle: string;
	isFinal?: boolean;
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

/**
 * Book Delete Confirmation Modal Component
 * Модальное окно подтверждения удаления книги
 */
export function BookDeleteConfirmModal({
	bookTitle,
	isFinal,
	isOpen,
	onClose,
	onConfirm,
}: BookDeleteConfirmModalProps) {
	const { t } = useTranslation();

	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	const displayTitle = isFinal
		? t('books.delete.final.title', 'Удалить готовую книгу?')
		: t('books.delete.draft.title', 'Удалить черновик?');

	const displayMessage = isFinal
		? t(
				'books.delete.final.message',
				'Книга "{title}" будет удалена без возможности восстановления',
				{ title: bookTitle }
			)
		: t(
				'books.delete.draft.message',
				'Черновик "{title}" будет удален без возможности восстановления',
				{ title: bookTitle }
			);

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						key="backdrop"
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={onClose}
					/>

					{/* Modal */}
					<motion.div
						key="modal"
						animate={{ opacity: 1, scale: 1 }}
						className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-modal mx-auto w-[90%] max-w-[320px] rounded-[24px] border border-border bg-card p-6 shadow-xl transition-colors duration-300"
						exit={{ opacity: 0, scale: 0.9 }}
						initial={{ opacity: 0, scale: 0.9 }}
					>
						<div className="flex flex-col items-center gap-4 text-center">
							{/* Icon */}
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
								<AlertTriangle className="h-8 w-8 text-red-500" strokeWidth={2} />
							</div>

							{/* Title */}
							<h3 className="font-semibold! text-[20px]! text-foreground">{displayTitle}</h3>

							{/* Message */}
							<p className="text-[15px]! text-muted-foreground">{displayMessage}</p>

							{/* Buttons */}
							<div className="flex w-full gap-3 pt-2">
								<button
									className="flex-1 rounded-[12px] bg-muted px-4 py-3 font-medium! text-[15px]! text-foreground transition-colors hover:bg-muted/80"
									onClick={onClose}
									type="button"
								>
									{t('books.delete.cancel', 'Отмена')}
								</button>
								<button
									className="flex-1 rounded-[12px] bg-red-500 px-4 py-3 font-medium! text-[15px]! text-white transition-colors hover:bg-red-600"
									onClick={handleConfirm}
									type="button"
								>
									{t('books.delete.confirm', 'Удалить')}
								</button>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
