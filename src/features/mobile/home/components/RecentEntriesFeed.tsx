import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { type DiaryEntry, getEntries } from '@/shared/lib/api';
import type { Language } from '@/shared/lib/i18n';

type RecentEntriesFeedProps = {
	userData?: any;
	language?: Language;
	onEntryClick?: (entry: DiaryEntry) => void;
	onViewAllClick?: () => void;
	refreshTrigger?: number; // ✅ NEW: Trigger для автообновления ленты
};

export function RecentEntriesFeed({
	userData,
	language: _language = 'ru',
	onEntryClick,
	onViewAllClick,
	refreshTrigger,
}: RecentEntriesFeedProps) {
	const [entries, setEntries] = useState<DiaryEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [emblaRef] = useEmblaCarousel({
		align: 'start',
		containScroll: 'trimSnaps',
		dragFree: true,
	});

	// Memoized loader to avoid recreation
	const loadRecentEntries = useCallback(async () => {
		try {
			setIsLoading(true);
			const userId = userData?.user?.id || userData?.id || 'anonymous'; // ✅ FIXED: Try user.id first
			const allEntries = await getEntries(userId, 3); // Загружаем только последние 3
			console.log('[RecentEntriesFeed] Loaded entries:', allEntries);
			console.log('[RecentEntriesFeed] First entry text:', allEntries[0]?.text);
			setEntries(allEntries);
		} catch (error) {
			console.error('Error loading recent entries:', error);
		} finally {
			setIsLoading(false);
		}
	}, [userData?.user?.id, userData?.id]);

	// ✅ FIX: Автообновление при изменении refreshTrigger
	useEffect(() => {
		loadRecentEntries();
	}, [loadRecentEntries, refreshTrigger]);

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
				>
					<ArrowRight className="h-5 w-5" strokeWidth={2} />
				</button>
			</div>

			{/* Горизонтальный скролл */}
			<div className="overflow-hidden" ref={emblaRef}>
				<div className="flex items-start gap-3 px-4">
					{/* Последние 3 записи - ФИКСИРОВАННЫЙ размер 240x140px */}
					{entries.map((entry) => (
						<div
							className="relative h-[140px] w-[240px] shrink-0 cursor-pointer overflow-hidden rounded-[16px] border border-border bg-card p-3 transition-shadow hover:shadow-sm"
							data-testid="entry-item"
							key={entry.id}
							onClick={() => onEntryClick?.(entry)}
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

							{/* Превью текста - ТОЛЬКО оригинальный текст */}
							<div className="relative h-[90px] w-full overflow-hidden">
								<p className="wrap-break-word text-[12px]! text-foreground leading-relaxed">
									{entry.text || 'Нет текста'}
								</p>
								{/* Градиент затухания в конце */}
								<div className="pointer-events-none absolute right-0 bottom-0 left-0 h-8 bg-linear-to-t from-card via-card/50 to-transparent" />
							</div>
						</div>
					))}

					{/* Карточка "Смотреть все" - 240x140px */}
					<div
						className="flex h-[140px] w-[240px] shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-[16px] border border-accent/20 bg-linear-to-br from-accent/10 to-accent/5 p-4 transition-all hover:shadow-sm"
						onClick={onViewAllClick}
					>
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
							<ArrowRight className="h-6 w-6 text-accent" strokeWidth={2} />
						</div>
						<p className="text-center text-sm font-medium text-accent">Смотреть все</p>
					</div>
				</div>
			</div>
		</div>
	);
}
