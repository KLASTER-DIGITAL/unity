import { Edit, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { DiaryEntry } from '@/shared/lib/api';

type EntryActionsModalProps = {
	entry: DiaryEntry | null;
	onClose: () => void;
	onEdit: (entry: DiaryEntry) => void;
	onDelete: (entryId: string) => void;
};

/**
 * Entry Actions Modal Component
 * Modal for entry actions (edit, delete)
 */
export function EntryActionsModal({ entry, onClose, onEdit, onDelete }: EntryActionsModalProps) {
	if (!entry) {
		return null;
	}

	return (
		<AnimatePresence>
			<motion.div
				animate={{ opacity: 1 }}
				className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
				exit={{ opacity: 0 }}
				initial={{ opacity: 0 }}
				onClick={onClose}
			/>

			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="modal-bottom-sheet z-modal mx-auto max-h-[85vh] max-w-md overflow-y-auto border-border border-t bg-card p-modal transition-colors duration-300"
				exit={{ opacity: 0, y: 100 }}
				initial={{ opacity: 0, y: 100 }}
			>
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-semibold! text-[18px]! text-foreground">Действия</h3>
					<button
						className="rounded-full p-1 transition-colors hover:bg-accent/10"
						onClick={onClose}
					>
						<X className="h-5 w-5 text-foreground" strokeWidth={2} />
					</button>
				</div>

				<div className="space-y-2">
					<button
						className="flex w-full items-center gap-3 rounded-[12px] p-3 text-foreground transition-colors hover:bg-accent/10"
						onClick={() => onEdit(entry)}
					>
						<Edit className="h-5 w-5" strokeWidth={2} />
						<span className="font-medium! text-[15px]!">Редактировать</span>
					</button>

					<button
						className="flex w-full items-center gap-3 rounded-[12px] p-3 text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
						onClick={() => onDelete(entry.id)}
					>
						<Trash2 className="h-5 w-5" strokeWidth={2} />
						<span className="font-medium! text-[15px]!">Удалить запись</span>
					</button>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
