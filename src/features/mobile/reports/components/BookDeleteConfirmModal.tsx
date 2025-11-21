/**
 * Book Delete Confirmation Modal
 *
 * Modal for confirming book deletion, following the same pattern as DeleteConfirmModal
 *
 * @author UNITY Team
 * @date 2025-11-21
 */

import { AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from '@/shared/lib/i18n';

type BookDeleteConfirmModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	bookTitle?: string;
	isFinal?: boolean;
};

export function BookDeleteConfirmModal({
	isOpen,
	onClose,
	onConfirm,
	bookTitle,
	isFinal = false,
}: BookDeleteConfirmModalProps) {
	const { t } = useTranslation();

	if (!isOpen) {
		return null;
	}

	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	const displayTitle = t('books.delete_confirm_title', 'Удалить книгу?');
	const displayMessage = isFinal ? (
		<>
			{t('books.delete_confirm_final', 'Это действие нельзя отменить. Книга')}{' '}
			<strong>"{bookTitle || t('books.untitled', 'Без названия')}"</strong>{' '}
			{t('books.delete_confirm_final_pdf', 'и PDF файл будут удалены навсегда.')}
		</>
	) : (
		<>
			{t('books.delete_confirm_draft', 'Черновик')}{' '}
			<strong>"{bookTitle || t('books.untitled', 'Без названия')}"</strong>{' '}
			{t(
				'books.delete_confirm_draft_text',
				'будет удален. Вы сможете создать новую книгу в любое время.'
			)}
		</>
	);

	return (
		<AnimatePresence>
			{/* Backdrop */}
			<motion.div
				animate={{ opacity: 1 }}
				className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
				exit={{ opacity: 0 }}
				initial={{ opacity: 0 }}
				onClick={onClose}
			/>

			{/* Modal */}
			<motion.div
				animate={{ opacity: 1, scale: 1 }}
				className="fixed left-1/2 top-1/2 z-modal mx-auto w-[90%] max-w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-border bg-card p-6 shadow-xl transition-colors duration-300"
				exit={{ opacity: 0, scale: 0.9 }}
				initial={{ opacity: 0, scale: 0.9 }}
				onClick={(e) => e.stopPropagation()}
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
							{t('books.cancel', 'Отмена')}
						</button>
						<button
							className="flex-1 rounded-[12px] bg-red-500 px-4 py-3 font-medium! text-[15px]! text-white transition-colors hover:bg-red-600"
							onClick={handleConfirm}
							type="button"
						>
							{t('books.delete_action', 'Удалить')}
						</button>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
