import { MoreVertical, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { MediaPreview } from '@/features/mobile/media';
import { AIAnalysisBlock } from '@/shared/components/ui/AIAnalysisBlock';
import type { DiaryEntry } from '@/shared/lib/api';
import { useTranslation } from '@/shared/lib/i18n';
import { CATEGORY_ICONS, getCategoryTranslationKey, SENTIMENT_COLORS } from './constants';
import { formatEntryDate } from './utils';

type EntryCardProps = {
	entry: DiaryEntry;
	index: number;
	onOpenActions: (entry: DiaryEntry) => void;
};

/**
 * Entry Card Component
 * Displays a single diary entry
 */
export function EntryCard({ entry, index, onOpenActions }: EntryCardProps) {
	const { t, currentLanguage } = useTranslation();

	// ✅ SAFETY: Case-insensitive category icon lookup with fallback for custom categories
	const getCategoryIcon = (category: string) => {
		if (!category) {
			return Sparkles; // Empty category fallback
		}

		// Try exact match first
		if (CATEGORY_ICONS[category]) {
			return CATEGORY_ICONS[category];
		}

		// Try case-insensitive match for default categories
		const matchedKey = Object.keys(CATEGORY_ICONS).find(
			(key) => key.toLowerCase() === category.toLowerCase()
		);

		if (matchedKey && CATEGORY_ICONS[matchedKey]) {
			return CATEGORY_ICONS[matchedKey];
		}

		// Fallback to Sparkles for custom user categories
		return Sparkles;
	};

	const CategoryIcon = getCategoryIcon(entry.category);
	const entryDate = new Date(entry.createdAt);
	const dateStr = formatEntryDate(entryDate, currentLanguage);

	// ✅ Get translated category name
	const categoryTranslationKey = getCategoryTranslationKey(entry.category);
	const categoryName = categoryTranslationKey
		? t(categoryTranslationKey, entry.category)
		: entry.category; // Fallback to original name for custom categories

	return (
		<motion.div
			animate={{ opacity: 1, y: 0 }}
			className="rounded-[16px] border border-border bg-card p-4 transition-all duration-300 hover:shadow-md"
			exit={{ opacity: 0, x: -100 }}
			initial={{ opacity: 0, y: 20 }}
			key={entry.id}
			transition={{ delay: index * 0.05 }}
		>
			<div className="mb-3 flex items-start justify-between">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-accent/10">
						<CategoryIcon className="h-5 w-5 text-accent" strokeWidth={2} />
					</div>
					<div>
						<p className="font-semibold! text-[14px]! text-foreground dark:text-white">
							{categoryName}
						</p>
						<p className="text-[12px]! text-muted-foreground">{dateStr}</p>
					</div>
				</div>

				<button
					type="button"
					className="rounded-[6px] p-1 transition-colors hover:bg-accent/10"
					onClick={() => onOpenActions(entry)}
				>
					<MoreVertical className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
				</button>
			</div>

			{/* Media Preview */}
			{entry.media && entry.media.length > 0 && (
				<div className="mb-3">
					<MediaPreview
						editable={false}
						layout={entry.media.length > 1 ? 'row' : 'grid'}
						media={entry.media}
					/>
				</div>
			)}

			{/* Текст записи - 14px */}
			<p className="mb-3 text-[14px]! text-foreground leading-[21px] font-medium dark:text-white">
				{entry.text}
			</p>

			{/* AI Анализ - ПЕРЕМЕСТИЛИ ПОД ТЕКСТ */}
			{entry.aiReply && (
				<div className="mb-3">
					<AIAnalysisBlock aiReply={entry.aiReply} variant="compact" />
				</div>
			)}

			{/* Категория и теги - МИНИМАЛЬНЫЙ РАЗМЕР 8px С УВЕЛИЧЕННЫМ PADDING */}
			<div className="flex flex-wrap items-center gap-1.5">
				<span
					className={`rounded-[6px] border px-3 py-1.5 font-medium! ${SENTIMENT_COLORS[entry.sentiment]} border-current/30`}
					style={{ fontSize: '8px' }}
				>
					{entry.sentiment === 'positive'
						? t('entry.sentiment.positive', '😊 Позитив')
						: entry.sentiment === 'neutral'
							? t('entry.sentiment.neutral', '😐 Нейтрал')
							: t('entry.sentiment.negative', '😔 Грусть')}
				</span>
				{(entry.tags || []).map((tag) => (
					<span
						className="rounded-[4px] border border-muted-foreground/20 bg-muted/50 px-3 py-1.5 text-muted-foreground/70 dark:border-muted-foreground/30"
						key={tag}
						style={{ fontSize: '8px' }}
					>
						#{tag}
					</span>
				))}
			</div>
		</motion.div>
	);
}
