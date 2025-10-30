import { Save, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useTranslation } from "@/shared/lib/i18n";
import { CATEGORIES } from "./constants";

type EditEntryModalProps = {
	isOpen: boolean;
	editText: string;
	editCategory: string;
	isSaving: boolean;
	onClose: () => void;
	onTextChange: (text: string) => void;
	onCategoryChange: (category: string) => void;
	onSave: () => void;
};

/**
 * Edit Entry Modal Component
 * Modal for editing diary entry
 */
export function EditEntryModal({
	isOpen,
	editText,
	editCategory,
	isSaving,
	onClose,
	onTextChange,
	onCategoryChange,
	onSave,
}: EditEntryModalProps) {
	const { t } = useTranslation();

	if (!isOpen) {
		return null;
	}

	return (
		<AnimatePresence>
			<motion.div
				animate={{ opacity: 1 }}
				className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
				exit={{ opacity: 0 }}
				initial={{ opacity: 0 }}
				onClick={!isSaving ? onClose : undefined}
			/>

			<motion.div
				animate={{ opacity: 1, y: 0 }}
				className="modal-bottom-sheet z-modal mx-auto max-h-[85vh] max-w-md overflow-y-auto border-border border-t bg-card p-modal transition-colors duration-300"
				exit={{ opacity: 0, y: 100 }}
				initial={{ opacity: 0, y: 100 }}
			>
				<div className="mb-4 flex items-center justify-between">
					<h3 className="font-semibold! text-[18px]! text-foreground">
						Редактировать запись
					</h3>
					<button
						className="rounded-full p-1 transition-colors hover:bg-accent/10 disabled:opacity-50"
						disabled={isSaving}
						onClick={() => !isSaving && onClose()}
					>
						<X className="h-5 w-5 text-foreground" strokeWidth={2} />
					</button>
				</div>

				<div className="space-y-4">
					{/* Text Input */}
					<div>
						<label className="mb-2 block font-medium! text-[13px]! text-muted-foreground">
							{t("entry_text", "Текст записи")}
						</label>
						<textarea
							className="w-full resize-none rounded-[12px] border border-border bg-muted px-4 py-3 text-[15px]! text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent disabled:opacity-50"
							disabled={isSaving}
							onChange={(e) => onTextChange(e.target.value)}
							placeholder={t(
								"describe_achievement",
								"Опишите ваше достижение...",
							)}
							rows={6}
							value={editText}
						/>
					</div>

					{/* Category Select */}
					<div>
						<label className="mb-2 block font-medium! text-[13px]! text-muted-foreground">
							Категория
						</label>
						<select
							className="w-full rounded-[12px] border border-border bg-muted px-4 py-3 text-[15px]! text-foreground outline-none transition-colors focus:border-accent disabled:opacity-50"
							disabled={isSaving}
							onChange={(e) => onCategoryChange(e.target.value)}
							value={editCategory}
						>
							{CATEGORIES.map((category) => (
								<option key={category} value={category}>
									{category}
								</option>
							))}
						</select>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-2">
						<button
							className="flex-1 rounded-[12px] bg-muted px-4 py-3 font-medium! text-[15px]! text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
							disabled={isSaving}
							onClick={() => !isSaving && onClose()}
						>
							Отмена
						</button>
						<button
							className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-accent px-4 py-3 font-medium! text-[15px]! text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
							disabled={isSaving || !editText.trim()}
							onClick={onSave}
						>
							{isSaving ? (
								"Сохранение..."
							) : (
								<>
									<Save className="h-4 w-4" strokeWidth={2} />
									Сохранить
								</>
							)}
						</button>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
