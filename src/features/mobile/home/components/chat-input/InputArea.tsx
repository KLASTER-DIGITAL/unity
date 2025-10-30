// ✅ REACT NATIVE READY: Use Platform Adapter for animations

import { Image as ImageIcon, Mic, Send } from 'lucide-react';
import { MediaPreview } from '@/features/mobile/media';
import { DragDropZone } from '@/shared/components/DragDropZone';
import { useCategoriesForUI } from '@/shared/hooks/useCategories';
import type { UploadedMedia } from '@/shared/hooks/useMediaUploader';
import { motion } from '@/shared/lib/platform/animation';

type InputAreaProps = {
	inputText: string;
	selectedCategory: string | null;
	isRecording: boolean;
	isTranscribing: boolean;
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
	isRecording,
	isTranscribing,
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
	// ✅ Load dynamic categories from database
	const { categories, isLoading } = useCategoriesForUI(userId);

	return (
		<div className="relative">
			{/* Main Input Container with Drag & Drop */}
			<DragDropZone
				disabled={isUploading || !userId || userId === 'anonymous'}
				onFilesSelected={onFilesDropped}
			>
				<div className="relative rounded-[16px] border border-border/20 bg-muted/10 backdrop-blur-md transition-colors duration-300">
					<div className="flex items-end gap-responsive-xs p-2">
						{/* Voice Button */}
						<button
							className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[16px] transition-all ${
								isRecording
									? 'bg-red-500'
									: isTranscribing
										? 'bg-blue-500'
										: 'hover:bg-muted active:scale-95'
							} ${isTranscribing ? 'opacity-50' : ''}`}
							disabled={isTranscribing}
							onClick={onVoiceClick}
						>
							{isTranscribing ? (
								<motion.div
									animate={{ rotate: 360 }}
									className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
									transition={{
										repeat: Number.POSITIVE_INFINITY,
										duration: 1,
										ease: 'linear',
									}}
								/>
							) : (
								<Mic
									className="h-4 w-4"
									style={{
										color: isRecording ? 'white' : 'var(--icon-primary)',
									}}
								/>
							)}
						</button>

						{/* Text Input */}
						<div className="min-w-0 flex-1">
							<textarea
								className="max-h-[100px] w-full resize-none border-none bg-transparent font-normal! text-[14px]! text-foreground leading-[20px] outline-none placeholder:text-muted-foreground/40"
								onChange={(e) => onInputChange(e.target.value)}
								onKeyPress={onKeyPress}
								placeholder="Опиши главную мысль, момент, благодарность"
								ref={textareaRef}
								rows={1}
								style={{
									fontFamily: 'Inter, sans-serif',
								}}
								value={inputText}
							/>
						</div>

						{/* Media Upload Button */}
						<button
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
			<div className="scrollbar-hide mt-3 flex flex-nowrap gap-responsive-xs overflow-x-auto">
				{isLoading ? (
					// Loading skeleton
					<div className="flex gap-responsive-xs">
						{[1, 2, 3, 4, 5].map((i) => (
							<div
								className="h-[32px] w-[80px] shrink-0 animate-pulse rounded-[10px] bg-muted/20"
								key={i}
							/>
						))}
					</div>
				) : (
					categories.map((category) => (
						<button
							className={`flex shrink-0 items-center gap-1.5 rounded-[10px] border px-3 py-1.5 transition-all ${
								selectedCategory === category.id
									? 'border-accent bg-accent/10'
									: 'border-border bg-transparent hover:bg-accent/5 active:scale-95'
							}`}
							key={category.id}
							onClick={() => onCategoryToggle(category.id)}
						>
							<span className="text-[10px]">{category.icon}</span>
							<span
								className="whitespace-nowrap font-light! text-[12px]! text-foreground"
								style={{ fontVariationSettings: "'wdth' 100" }}
							>
								{category.label}
							</span>
						</button>
					))
				)}
			</div>
		</div>
	);
}
