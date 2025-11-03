import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight } from 'lucide-react';
import { AIAnalysisBlock } from '@/shared/components/ui/AIAnalysisBlock';
import { Badge } from '@/shared/components/ui/badge';
import { useEntries } from '@/shared/hooks/useEntries';
import type { DiaryEntry } from '@/shared/lib/api';
import type { Language } from '@/shared/lib/i18n';

type RecentEntriesFeedProps = {
	userData?: any;
	language?: Language;
	onEntryClick?: (entry: DiaryEntry) => void;
	onViewAllClick?: () => void;
	refreshTrigger?: number; // ✅ DEPRECATED: Больше не нужен, используем Supabase Realtime
};

export function RecentEntriesFeed({
	userData,
	language: _language = 'ru',
	onEntryClick,
	onViewAllClick,
	refreshTrigger: _refreshTrigger, // ✅ Оставляем для обратной совместимости, но не используем
}: RecentEntriesFeedProps) {
	const [emblaRef] = useEmblaCarousel({
		align: 'start',
		containScroll: 'trimSnaps',
		dragFree: true,
	});

	// ✅ FIX: Используем useEntries hook с Supabase Realtime
	// Автоматическое обновление UI при INSERT/UPDATE/DELETE в таблице entries
	const userId = userData?.user?.id || userData?.id;
	console.log('[RecentEntriesFeed] 🔑 userId:', userId);
	console.log('[RecentEntriesFeed] 📦 userData:', userData);

	const { entries, isLoading } = useEntries(userId, 3); // Загружаем только последние 3

	console.log('[RecentEntriesFeed] 📊 Loaded entries:', entries.length);
	if (entries.length > 0) {
		console.log('[RecentEntriesFeed] 📝 First entry text:', entries[0]?.text);
	}

	const formatTimeAgo = (dateString: string): string => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
		const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
		const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

		if (diffInMinutes < 1) {
			return 'Только что';
		}
		if (diffInMinutes < 60) {
			return `${diffInMinutes} мин назад`;
		}
		if (diffInHours < 24) {
			return `${diffInHours} ч назад`;
		}
		if (diffInDays === 0) {
			return 'Сегодня';
		}
		if (diffInDays === 1) {
			return 'Вчера';
		}
		if (diffInDays < 7) {
			return `${diffInDays} дн назад`;
		}

		return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
	};

	const getCategoryEmoji = (category: string): string => {
		const emojiMap: Record<string, string> = {
			Работа: '💼',
			Спорт: '⚽',
			Здоровье: '🏃',
			Семья: '👨‍👩‍👧',
			Друзья: '👥',
			Путешествия: '✈️',
			Хобби: '🎨',
			Чтение: '📚',
			Обучение: '📖',
			'Личное развитие': '🌱',
			Финансы: '💰',
			Творчество: '🎭',
			Другое: '📝',
		};
		return emojiMap[category] || '📝';
	};

	const getSentimentColor = (sentiment: string): string => {
		switch (sentiment) {
			case 'positive':
				return 'bg-[var(--ios-green)]/10 text-[var(--ios-green)] border-[var(--ios-green)]/20';
			case 'neutral':
				return 'bg-[var(--ios-blue)]/10 text-[var(--ios-blue)] border-[var(--ios-blue)]/20';
			case 'negative':
				return 'bg-[var(--ios-red)]/10 text-[var(--ios-red)] border-[var(--ios-red)]/20';
			default:
				return 'bg-muted text-foreground border-border';
		}
	};

	if (isLoading) {
		return (
			<div className="mt-6 mb-6 px-4">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-bold text-foreground text-xl">Лента последних записей</h2>
				</div>
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div
							className="animate-pulse rounded-2xl bg-card p-4 transition-colors duration-300"
							key={i}
						>
							<div className="mb-3 h-3 w-20 rounded bg-muted" />
							<div className="mb-2 h-5 w-3/4 rounded bg-muted" />
							<div className="mb-1 h-4 w-full rounded bg-muted" />
							<div className="h-4 w-2/3 rounded bg-muted" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (entries.length === 0) {
		return null; // Не показываем блок если нет записей
	}

	return (
		<div className="mt-6 mb-6">
			{/* Заголовок */}
			<div className="mb-4 flex items-center justify-between px-4">
				<h2 className="font-semibold! text-[20px]! text-foreground">Лента последних записей</h2>
				<button
					aria-label="Смотреть все"
					className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
					onClick={onViewAllClick}
					type="button"
				>
					<ArrowRight className="h-5 w-5" strokeWidth={2} />
				</button>
			</div>

			{/* Горизонтальный скролл */}
			<div className="overflow-hidden" ref={emblaRef}>
				<div className="flex items-start gap-3 px-4">
					{/* Последние 3 записи - УВЕЛИЧЕННЫЙ размер 280x200px для AI анализа */}
					{entries.map((entry) => (
						<button
							className="relative h-[200px] w-[280px] shrink-0 cursor-pointer overflow-hidden rounded-[16px] border border-border bg-card p-3 text-left transition-shadow hover:shadow-sm"
							data-testid="entry-item"
							key={entry.id}
							onClick={() => onEntryClick?.(entry)}
							type="button"
						>
							{/* Время и категория */}
							<div className="mb-2 flex items-center justify-between">
								<span className="whitespace-nowrap text-[11px]! text-muted-foreground">
									{formatTimeAgo(entry.createdAt)}
								</span>
								<Badge
									className={`rounded-full px-2 py-0.5 text-[11px]! ${getSentimentColor(entry.sentiment)}`}
								>
									{getCategoryEmoji(entry.category)}
								</Badge>
							</div>

							{/* Превью текста */}
							<div className="relative mb-2 w-full overflow-hidden">
								<p className="wrap-break-word line-clamp-2 text-[12px]! text-foreground leading-relaxed">
									{entry.text || 'Нет текста'}
								</p>
							</div>

							{/* AI Анализ - показываем если есть */}
							<AIAnalysisBlock aiReply={entry.aiReply} variant="compact" />

							{/* Если нет AI анализа, показываем больше текста */}
							{!entry.aiReply && (
								<div className="relative h-[100px] w-full overflow-hidden">
									<p className="wrap-break-word text-[12px]! text-foreground leading-relaxed">
										{entry.text || 'Нет текста'}
									</p>
									{/* Градиент затухания */}
									<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-linear-to-t from-card via-card/50 to-transparent" />
								</div>
							)}
						</button>
					))}

					{/* Карточка "Смотреть все" - 280x200px */}
					<button
						className="flex h-[200px] w-[280px] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border border-accent/20 bg-linear-to-br from-accent/10 to-accent/5 p-4 transition-all hover:shadow-sm"
						onClick={onViewAllClick}
						type="button"
					>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
							<ArrowRight className="h-6 w-6 text-accent" strokeWidth={2} />
						</div>
						<p className="text-center text-sm font-medium text-accent">Смотреть все</p>
					</button>
				</div>
			</div>
		</div>
	);
}
