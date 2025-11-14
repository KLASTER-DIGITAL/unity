// ✅ REACT NATIVE READY: Use Platform Adapter for animations

import { Sparkles, X } from 'lucide-react';
import { MediaPreview } from '@/features/mobile/media';
import type { DiaryEntry } from '@/shared/lib/api';
import { AnimatedPresence, motion } from '@/shared/lib/platform/animation';

type EntryDetailModalProps = {
	entry: DiaryEntry | null;
	isOpen: boolean;
	onClose: () => void;
};

export function EntryDetailModal({ entry, isOpen, onClose }: EntryDetailModalProps) {
	if (!entry) {
		return null;
	}

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		return date.toLocaleDateString('ru-RU', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const getSentimentColor = (sentiment: string): string => {
		switch (sentiment) {
			case 'positive':
				return 'bg-(--ios-green)/10 text-(--ios-green)';
			case 'neutral':
				return 'bg-(--ios-blue)/10 text-(--ios-blue)';
			case 'negative':
				return 'bg-(--ios-red)/10 text-(--ios-red)';
			default:
				return 'bg-muted text-foreground';
		}
	};

	const getSentimentLabel = (sentiment: string): string => {
		switch (sentiment) {
			case 'positive':
				return '😊 Позитив';
			case 'neutral':
				return '😐 Нейтрал';
			case 'negative':
				return '😔 Грусть';
			default:
				return 'Неизвестно';
		}
	};

	return (
		<AnimatedPresence>
			{isOpen && (
				<>
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
						animate={{ opacity: 1, y: 0 }}
						className="modal-bottom-sheet z-modal mx-auto max-h-[85vh] max-w-md overflow-y-auto border-border border-t bg-card transition-colors duration-300"
						data-testid="entry-details"
						exit={{ opacity: 0, y: 100 }}
						initial={{ opacity: 0, y: 100 }}
						transition={{ type: 'spring', stiffness: 300, damping: 30 }}
					>
						{/* Header */}
						<div className="mb-6 flex items-center justify-between">
							<h2 className="font-semibold! text-[20px]! text-foreground">Запись</h2>
							<button
								className="rounded-full p-1 transition-colors hover:bg-accent/10"
								onClick={onClose}
							>
								<X className="h-5 w-5 text-foreground" strokeWidth={2} />
							</button>
						</div>

						{/* Date */}
						<div className="mb-4">
							<p className="text-[13px]! text-muted-foreground">{formatDate(entry.createdAt)}</p>
						</div>

						{/* Category & Sentiment - МИНИМАЛЬНЫЙ РАЗМЕР 8px С УВЕЛИЧЕННЫМ PADDING */}
						<div className="mb-4 flex flex-wrap items-center gap-1.5">
							<span
								className={`rounded-full border px-3 py-1.5 font-medium! ${getSentimentColor(entry.sentiment)} border-current/30`}
								style={{ fontSize: '8px' }}
							>
								{getSentimentLabel(entry.sentiment)}
							</span>
							{entry.category && (
								<span
									className="rounded-full border border-muted-foreground/30 bg-muted px-3 py-1.5 text-muted-foreground transition-colors duration-300 dark:border-muted-foreground/50"
									style={{ fontSize: '8px' }}
								>
									{entry.category}
								</span>
							)}
						</div>

						{/* Media Preview */}
						{entry.media && entry.media.length > 0 && (
							<div className="mb-4">
								<MediaPreview media={entry.media} />
							</div>
						)}

						{/* Full Text - Оригинальный текст - 14px */}
						<div className="mb-4">
							<p className="whitespace-pre-wrap text-[14px]! text-foreground leading-[21px] font-medium">
								{entry.text}
							</p>
						</div>

						{/* AI Analysis - ПЕРЕМЕСТИЛИ ПОД ТЕКСТ */}
						{entry.aiReply && (
							<div className="mb-4 rounded-[12px] border border-accent/20 bg-accent/5 p-3 transition-colors duration-300">
								<div className="mb-1.5 flex items-center gap-1.5">
									<Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
								</div>
								<p className="whitespace-pre-wrap text-[13px]! text-muted-foreground leading-[18px] italic">
									{entry.aiReply}
								</p>
							</div>
						)}

						{/* Tags - МИНИМАЛЬНЫЙ РАЗМЕР 8px С УВЕЛИЧЕННЫМ PADDING */}
						{entry.tags && entry.tags.length > 0 && (
							<div className="flex flex-wrap gap-1.5">
								{entry.tags.map((tag) => (
									<span
										className="rounded-[4px] border border-muted-foreground/20 bg-muted/50 px-3 py-1.5 text-muted-foreground/70 transition-colors duration-300 dark:border-muted-foreground/30"
										key={tag}
										style={{ fontSize: '8px' }}
									>
										#{tag}
									</span>
								))}
							</div>
						)}
					</motion.div>
				</>
			)}
		</AnimatedPresence>
	);
}
