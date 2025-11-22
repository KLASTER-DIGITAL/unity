// ✅ REACT NATIVE READY: Use Platform Adapter for animations

import { Image as ImageIcon, Mic, Send } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { MediaPreview } from '@/features/mobile/media';
import { DragDropZone } from '@/shared/components/DragDropZone';
import { useCategoriesForUI } from '@/shared/hooks/useCategories';
import type { UploadedMedia } from '@/shared/hooks/useMediaUploader';
import { useTranslation } from '@/shared/lib/i18n';
import { motion } from '@/shared/lib/platform/animation';
import { AddCategoryModal } from './AddCategoryModal';
import { triggerHapticFeedback } from './PermissionUtils';

type InputAreaProps = {
	inputText: string;
	selectedCategory: string | null;
	isUploading: boolean;
	uploadProgress: number;
	uploadedMedia: UploadedMedia[];
	userId: string;
	textareaRef: React.RefObject<HTMLTextAreaElement | null>;
	onInputChange: (value: string) => void;
	onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	onVoiceClick: () => void;
	onMediaUpload: () => void;
	onSendMessage: () => void;
	onFilesDropped: (files: File[]) => void;
	onRemoveMedia: (index: number) => void;
	onMediaClick: (index: number) => void;
	onCategoryToggle: (categoryId: string) => void;
};

/**
 * Input Area Component
 * Main input area with voice, text, media upload, and send buttons
 */
export function InputArea({
	inputText,
	selectedCategory,
	isUploading,
	uploadProgress,
	uploadedMedia,
	userId,
	textareaRef,
	onInputChange,
	onKeyPress,
	onVoiceClick,
	onMediaUpload,
	onSendMessage,
	onFilesDropped,
	onRemoveMedia,
	onMediaClick,
	onCategoryToggle,
}: InputAreaProps) {
	const { t } = useTranslation();
	// ✅ Load dynamic categories from database
	const { categories, isLoading, addCategory } = useCategoriesForUI(userId);

	const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
	const [isSavingCategory, setIsSavingCategory] = useState(false);

	const customCategories = categories.filter((cat) => !cat.isDefault);
	const maxCategories = 20;
	const canAddMoreCategories = customCategories.length < maxCategories;

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: legacy flow with multiple validation branches
	const handleAddCategory = async (name: string, icon: string) => {
		const trimmedName = name.trim();

		if (!trimmedName) {
			toast.error('Введите название категории');
			return;
		}

		if (!userId || userId === 'anonymous') {
			toast.error('Войдите в аккаунт, чтобы создавать категории');
			return;
		}

		if (!canAddMoreCategories) {
			toast.error(`Максимум ${maxCategories} пользовательских категорий`);
			return;
		}

		const exists = categories.some((cat) => cat.label.toLowerCase() === trimmedName.toLowerCase());
		if (exists) {
			toast.error('Категория с таким названием уже существует');
			return;
		}

		try {
			setIsSavingCategory(true);
			await addCategory?.({ name: trimmedName, icon });
			// ✅ НЕ нужен refetch - addCategory уже обновляет локальный state
			triggerHapticFeedback();
			toast.success('Категория добавлена');
			setIsAddCategoryOpen(false);
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
			console.error('[InputArea] Error adding category from home screen:', error);
			toast.error(message || 'Ошибка при добавлении категории');
		} finally {
			setIsSavingCategory(false);
		}
	};

	const handleTextareaFocus = () => {
		// Небольшая задержка, чтобы клавиатура успела появиться на мобильных
		setTimeout(() => {
			const element = textareaRef.current;
			if (element && typeof element.scrollIntoView === 'function') {
				try {
					// Центрируем чат над клавиатурой
					(element as HTMLElement).scrollIntoView({
						behavior: 'smooth',
						block: 'center',
					});
				} catch {
					// silently ignore
				}
			}
		}, 200);
	};

	return (
		<div className="relative">
			{/* Main Input Container with Drag & Drop */}
			<DragDropZone
				disabled={isUploading || !userId || userId === 'anonymous'}
				onFilesSelected={onFilesDropped}
			>
				<div className="relative rounded-[16px] border border-border/20 bg-muted/10 backdrop-blur-md transition-colors duration-300">
					<div className="flex items-end gap-responsive-xs p-2">
						{/* Voice Button - открывает Voice Powered Orb */}
						<button
							type="button"
							className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[16px] transition-all hover:bg-muted active:scale-95"
							onClick={onVoiceClick}
						>
							<Mic className="h-4 w-4" style={{ color: 'var(--icon-primary)' }} />
						</button>

						{/* Text Input */}
						<div className="min-w-0 flex-1">
							<textarea
								className="min-h-[60px] max-h-[140px] w-full resize-none border-none bg-transparent font-normal! text-[14px]! text-foreground leading-[20px] outline-none placeholder:text-muted-foreground/40"
								onChange={(e) => onInputChange(e.target.value)}
								onKeyPress={onKeyPress}
								onFocus={handleTextareaFocus}
								placeholder={t(
									'home.input.placeholder',
									'Опиши главную мысль, момент, благодарность'
								)}
								ref={textareaRef}
								rows={3}
								style={{
									fontFamily: 'Inter, sans-serif',
								}}
								value={inputText}
							/>
						</div>

						{/* Media Upload Button */}
						<button
							type="button"
							className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[16px] transition-all ${
								isUploading ? 'cursor-not-allowed opacity-50' : 'hover:bg-muted active:scale-95'
							}`}
							disabled={isUploading}
							onClick={onMediaUpload}
						>
							{isUploading ? (
								<motion.div
									animate={{ rotate: 360 }}
									className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent"
									transition={{
										repeat: Number.POSITIVE_INFINITY,
										duration: 1,
										ease: 'linear',
									}}
								/>
							) : (
								<ImageIcon className="h-4 w-4 text-foreground" />
							)}
						</button>

						{/* Send Button */}
						<button
							type="button"
							className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[16px] transition-all ${
								inputText.trim() || uploadedMedia.length > 0
									? 'hover:bg-muted active:scale-95'
									: 'cursor-not-allowed opacity-40'
							}`}
							disabled={!inputText.trim() && uploadedMedia.length === 0}
							onClick={onSendMessage}
						>
							<Send className="h-4 w-4 text-foreground" />
						</button>
					</div>

					{/* Media Preview */}
					{(uploadedMedia.length > 0 || isUploading) && (
						<div className="mt-2 px-2">
							<MediaPreview
								isUploading={isUploading}
								media={uploadedMedia}
								onImageClick={onMediaClick}
								onRemove={onRemoveMedia}
								uploadProgress={uploadProgress}
							/>
						</div>
					)}
				</div>
			</DragDropZone>

			{/* Categories - horizontal scroll */}
			<div className="scrollbar-hide mt-2 flex flex-nowrap gap-2 overflow-x-auto">
				{isLoading ? (
					// Loading skeleton
					<div className="flex gap-2">
						{[1, 2, 3, 4, 5].map((i) => (
							<div
								className="h-[28px] w-[72px] shrink-0 animate-pulse rounded-[12px] bg-muted/20"
								key={i}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-nowrap items-center gap-2 pr-2">
						{categories.map((category) => (
							<button
								type="button"
								className={`flex shrink-0 items-center gap-1.5 rounded-[12px] border px-3 py-1.5 transition-all ${
									selectedCategory === category.id
										? 'border-accent bg-accent/10 text-foreground'
										: 'border-border/70 bg-transparent text-muted-foreground hover:bg-muted/30 active:scale-95'
								}`}
								key={category.id}
								onClick={() => onCategoryToggle(category.id)}
								style={{ fontSize: '14px' }}
							>
								<span style={{ fontSize: '14px' }}>{category.icon}</span>
								<span
									className="whitespace-nowrap text-muted-foreground"
									style={{
										fontSize: '14px',
										fontWeight: '300',
										fontVariationSettings: "'wdth' 100",
									}}
								>
									{category.label}
								</span>
							</button>
						))}

						<button
							type="button"
							className={`ml-1 flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[12px] border text-[18px] transition-all ${
								canAddMoreCategories && userId && userId !== 'anonymous'
									? 'border-dashed border-border bg-transparent hover:bg-accent/5 active:scale-95'
									: 'cursor-not-allowed border-border/60 bg-muted/40 text-muted-foreground'
							}`}
							disabled={!canAddMoreCategories || !userId || userId === 'anonymous'}
							onClick={() => setIsAddCategoryOpen(true)}
						>
							+
						</button>
					</div>
				)}
			</div>

			{/* Add Category Modal */}
			<AddCategoryModal
				isOpen={isAddCategoryOpen}
				isSaving={isSavingCategory}
				onClose={() => setIsAddCategoryOpen(false)}
				onSave={handleAddCategory}
			/>
		</div>
	);
}
