import { Image as ImageIcon, Save, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useMediaUploader } from '@/shared/hooks/useMediaUploader';
import type { MediaItem } from '@/shared/lib/api';
import { useTranslation } from '@/shared/lib/i18n';
import { CATEGORIES } from './constants';

type EditEntryModalProps = {
	isOpen: boolean;
	editText: string;
	editCategory: string;
	editMedia: MediaItem[];
	userId: string;
	isSaving: boolean;
	onClose: () => void;
	onTextChange: (text: string) => void;
	onCategoryChange: (category: string) => void;
	onMediaChange: (media: MediaItem[]) => void;
	onSave: () => void;
};

/**
 * Edit Entry Modal Component
 * Modal for editing diary entry with media support
 */
export function EditEntryModal({
	isOpen,
	editText,
	editCategory,
	editMedia,
	userId,
	isSaving,
	onClose,
	onTextChange,
	onCategoryChange,
	onMediaChange,
	onSave,
}: EditEntryModalProps) {
	const { t } = useTranslation();
	const [localMedia, setLocalMedia] = useState<MediaItem[]>(editMedia);

	// Media uploader hook
	const { selectAndUploadMedia, uploadedMedia, isUploading } = useMediaUploader();

	// Sync localMedia with editMedia when modal opens
	useEffect(() => {
		if (isOpen) {
			console.log('[EditEntryModal] Modal opened, editMedia:', editMedia);
			setLocalMedia(editMedia);
		}
	}, [isOpen, editMedia]);

	// Sync uploaded media with localMedia
	useEffect(() => {
		if (uploadedMedia.length > 0) {
			const newMedia = [...localMedia, ...uploadedMedia];
			setLocalMedia(newMedia);
			onMediaChange(newMedia);
		}
	}, [uploadedMedia, localMedia, onMediaChange]);

	if (!isOpen) {
		return null;
	}

	// Handle media upload
	const handleAddMedia = async () => {
		try {
			await selectAndUploadMedia(userId);
			toast.success('Фото загружено!');
		} catch (error) {
			console.error('Error uploading media:', error);
			toast.error('Не удалось загрузить фото');
		}
	};

	// Handle media removal
	const handleRemoveMedia = (index: number) => {
		const newMedia = localMedia.filter((_, i) => i !== index);
		setLocalMedia(newMedia);
		onMediaChange(newMedia);
		toast.success('Фото удалено');
	};

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
					<h3 className="font-semibold! text-[18px]! text-foreground">Редактировать запись</h3>
					<button
						type="button"
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
						<label
							className="mb-2 block font-medium! text-[13px]! text-muted-foreground"
							htmlFor="edit-entry-text"
						>
							{t('entry_text', 'Текст записи')}
						</label>
						<textarea
							id="edit-entry-text"
							className="w-full resize-none rounded-[12px] border border-border bg-muted px-4 py-3 text-[15px]! text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent disabled:opacity-50"
							disabled={isSaving}
							onChange={(e) => onTextChange(e.target.value)}
							placeholder={t('describe_achievement', 'Опишите ваше достижение...')}
							rows={6}
							value={editText}
						/>
					</div>

					{/* Media Section */}
					<div>
						<label
							className="mb-2 block font-medium! text-[13px]! text-muted-foreground"
							htmlFor="edit-entry-photo"
						>
							Фото
						</label>

						{/* Existing Media */}
						{localMedia.length > 0 && (
							<div className="mb-3 space-y-2">
								{localMedia.map((media, index) => (
									<div
										className="relative overflow-hidden rounded-[12px] border border-border"
										key={media.id || index}
									>
										<img
											alt={`Uploaded media ${index + 1}`}
											className="h-32 w-full object-cover"
											src={media.url}
										/>
										<button
											className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
											onClick={() => handleRemoveMedia(index)}
											type="button"
										>
											<Trash2 className="h-4 w-4" strokeWidth={2} />
										</button>
									</div>
								))}
							</div>
						)}

						{/* Add Media Button */}
						<button
							className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-dashed border-border bg-muted/50 px-4 py-3 text-[14px]! text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
							disabled={isSaving || isUploading}
							onClick={handleAddMedia}
							type="button"
						>
							<ImageIcon className="h-4 w-4" strokeWidth={2} />
							{isUploading ? 'Загрузка...' : 'Добавить фото'}
						</button>
					</div>

					{/* Category Select */}
					<div>
						<label
							className="mb-2 block font-medium! text-[13px]! text-muted-foreground"
							htmlFor="edit-entry-category"
						>
							Категория
						</label>
						<select
							id="edit-entry-category"
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
							type="button"
							className="flex-1 rounded-[12px] bg-muted px-4 py-3 font-medium! text-[15px]! text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
							disabled={isSaving}
							onClick={() => !isSaving && onClose()}
						>
							{t('history.edit.cancel', 'Отмена')}
						</button>
						<button
							type="button"
							className="flex flex-1 items-center justify-center gap-2 rounded-[12px] bg-accent px-4 py-3 font-medium! text-[15px]! text-white transition-colors hover:bg-accent/90 disabled:opacity-50"
							disabled={isSaving || !editText.trim()}
							onClick={onSave}
						>
							{isSaving ? (
								t('history.edit.saving', 'Сохранение...')
							) : (
								<>
									<Save className="h-4 w-4" strokeWidth={2} />
									{t('history.edit.save', 'Сохранить')}
								</>
							)}
						</button>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
