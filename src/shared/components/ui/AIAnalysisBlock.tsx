/**
 * AI Analysis Block Component
 *
 * Переиспользуемый компонент для отображения AI анализа записей.
 * Используется в:
 * - RecentEntriesFeed (лента на главном экране)
 * - EntryCard (раздел История)
 * - EntryDetailModal (модальное окно с деталями)
 *
 * ВАЖНО: Компонент НЕ генерирует AI контент, только отображает существующий entry.aiReply из БД
 */

import { Sparkles } from 'lucide-react';

type AIAnalysisBlockProps = {
	aiReply: string;
	variant?: 'compact' | 'full';
	className?: string;
};

export function AIAnalysisBlock({
	aiReply,
	variant = 'compact',
	className = '',
}: AIAnalysisBlockProps) {
	if (!aiReply) {
		return null;
	}

	if (variant === 'compact') {
		// Компактная версия для карточек в ленте и истории
		return (
			<div
				className={`relative h-[100px] w-full overflow-hidden rounded-[12px] border border-accent/20 bg-accent/5 p-2 ${className}`}
			>
				<div className="mb-1 flex items-center gap-1">
					<Sparkles className="h-3 w-3 text-accent" strokeWidth={2} />
				</div>
				<p
					className="wrap-break-word line-clamp-4 text-muted-foreground leading-snug"
					style={{ fontSize: '14px', fontWeight: '300' }}
				>
					{aiReply}
				</p>
				{/* Градиент затухания */}
				<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-6 bg-linear-to-t from-accent/5 via-accent/5 to-transparent" />
			</div>
		);
	}

	// Полная версия для модального окна
	return (
		<div className={`rounded-[16px] border border-accent/20 bg-accent/5 p-4 ${className}`}>
			<div className="mb-2 flex items-center gap-2">
				<Sparkles className="h-4 w-4 text-accent" strokeWidth={2} />
			</div>
			<p className="text-[14px] text-muted-foreground leading-relaxed italic">{aiReply}</p>
		</div>
	);
}
