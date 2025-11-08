import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { type DiaryEntry, getUserStats } from '@/shared/lib/api';
import { AchievementHeader } from './AchievementHeader';
import { ChatInputSection } from './ChatInputSection';
import { EntryDetailModal } from './EntryDetailModal';
import { RecentEntriesFeed } from './RecentEntriesFeed';

// Lazy load MotivationCardsSection for better LCP
const MotivationCardsSection = lazy(() =>
	import('./MotivationCardsSection').then((module) => ({
		default: module.MotivationCardsSection,
	}))
);

// Import types
import type { AchievementCard, AchievementHomeScreenProps, DiaryData } from './achievement';

// Re-export types for backward compatibility
export type { DiaryData, AchievementHomeScreenProps, AchievementCard };

// ✅ REMOVED: GRADIENTS moved to ./achievement/constants.ts
// ✅ REMOVED: DEFAULT_MOTIVATIONS moved to ./achievement/constants.ts
// ✅ REMOVED: getDefaultMotivations() moved to ./achievement/utils.ts
// ✅ REMOVED: entryToCard() moved to ./achievement/utils.ts
// ✅ REMOVED: SwipeCard component moved to ./achievement/SwipeCard.tsx

// Основной компонент
export function AchievementHomeScreen({
	diaryData: _diaryData = { name: 'Мой дневник', emoji: '🏆' },
	userData,
	onNavigateToHistory,
	onNavigateToSettings,
}: AchievementHomeScreenProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [currentStreak, setCurrentStreak] = useState(0);
	const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

	// ✅ FIX: Определяем функцию ДО useEffect с useCallback
	const loadStats = useCallback(async () => {
		try {
			setIsLoading(true);
			const userId = userData?.user?.id || userData?.id || 'anonymous';

			// Загружаем только статистику
			const stats = await getUserStats(userId);
			console.log('User stats:', stats);

			// Обновляем streak
			setCurrentStreak(stats.currentStreak);
		} catch (error) {
			console.error('Error loading stats:', error);
		} finally {
			setIsLoading(false);
		}
	}, [userData]);

	// ✅ FIX: useEffect ПОСЛЕ определения функции
	useEffect(() => {
		loadStats();
	}, [loadStats]);

	// Обработчик создания новой записи
	const handleNewEntry = (_entry: DiaryEntry) => {
		console.log('[AchievementHomeScreen] New entry created:', _entry);

		// Перезагружаем статистику
		const userId = userData?.user?.id || userData?.id || 'anonymous';
		getUserStats(userId)
			.then((stats) => {
				setCurrentStreak(stats.currentStreak);
			})
			.catch((err) => {
				console.error('Error updating stats:', err);
			});

		// ✅ FIX: Больше НЕ нужен manual refresh - Supabase Realtime автоматически обновит UI
		// setFeedRefreshKey((prev) => prev + 1); // DEPRECATED
	};

	// Получаем имя пользователя из userData.profile.name или userData.name или используем дефолтное
	const userName = userData?.profile?.name || userData?.name || 'Пользователь';
	const userEmail = userData?.profile?.email || userData?.email;
	const avatarUrl = userData?.profile?.avatar || userData?.avatar;

	// Вычисляем количество дней в приложении (используем streak)
	const daysInApp = currentStreak > 0 ? currentStreak : 1;

	return (
		<div className="scrollbar-hide min-h-screen bg-background pb-20">
			{/* Achievement Header */}
			<AchievementHeader
				avatarUrl={avatarUrl}
				daysInApp={daysInApp}
				onNavigateToHistory={onNavigateToHistory}
				onNavigateToSettings={onNavigateToSettings}
				userEmail={userEmail}
				userName={userName}
			/>

			{/* ✅ FIX: Loading State - Детальные Skeleton loaders для FCP/LCP оптимизации */}
			{isLoading && (
				<div className="space-y-4 p-section">
					{/* Skeleton for motivation cards - ТОЧНЫЕ размеры */}
					<div
						className="relative flex min-h-[280px] w-full flex-col justify-between rounded-[24px] bg-card p-6 shadow-sm transition-colors duration-300"
						style={{ minHeight: '280px' }}
					>
						<div className="space-y-3">
							<Skeleton className="h-6 w-3/4" />
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-5/6" />
						</div>
						<div className="mt-4 flex items-center justify-between">
							<Skeleton className="h-10 w-24 rounded-full" />
							<Skeleton className="h-10 w-24 rounded-full" />
						</div>
					</div>

					{/* Skeleton for chat input section - ТОЧНЫЕ размеры */}
					<div
						className="rounded-[24px] bg-card p-4 shadow-sm transition-colors duration-300"
						style={{ minHeight: '120px' }}
					>
						<div className="space-y-3">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-12 w-full rounded-[16px]" />
							<div className="flex items-center justify-between">
								<div className="flex gap-2">
									<Skeleton className="h-10 w-10 rounded-full" />
									<Skeleton className="h-10 w-10 rounded-full" />
									<Skeleton className="h-10 w-10 rounded-full" />
								</div>
								<Skeleton className="h-10 w-10 rounded-full" />
							</div>
						</div>
					</div>

					{/* Skeleton for recent entries feed - ТОЧНЫЕ размеры */}
					<div className="space-y-3">
						<div className="flex items-center justify-between px-4">
							<Skeleton className="h-6 w-40" />
							<Skeleton className="h-5 w-24" />
						</div>
						{[...new Array(3)].map((_, i) => (
							<div
								className="rounded-[16px] bg-card p-4 shadow-sm transition-colors duration-300"
								key={i}
								style={{ minHeight: '140px' }}
							>
								<div className="mb-3 flex items-start justify-between">
									<div className="flex items-center gap-3">
										<Skeleton className="h-10 w-10 rounded-full" />
										<div className="space-y-2">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-3 w-16" />
										</div>
									</div>
									<Skeleton className="h-8 w-8 rounded-full" />
								</div>
								<div className="space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-5/6" />
								</div>
								<div className="mt-3 flex gap-2">
									<Skeleton className="h-6 w-16 rounded-full" />
									<Skeleton className="h-6 w-20 rounded-full" />
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* ✅ LAZY LOADED: Motivation Cards Section - improves LCP */}
			{!isLoading && (
				<Suspense
					fallback={
						<div className="p-section">
							{/* ✅ FIX: Skeleton fallback с ТОЧНЫМИ размерами для предотвращения CLS */}
							<div
								className="relative mb-responsive-md flex min-h-[280px] w-full flex-col justify-between rounded-[24px] bg-card p-6 shadow-sm transition-colors duration-300"
								style={{ minHeight: '280px' }}
							>
								<div className="space-y-3">
									<Skeleton className="h-6 w-3/4" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-5/6" />
								</div>
								<div className="mt-4 flex items-center justify-between">
									<Skeleton className="h-10 w-24 rounded-full" />
									<Skeleton className="h-10 w-24 rounded-full" />
								</div>
							</div>
						</div>
					}
				>
					<MotivationCardsSection
						onCardSwipe={() => {
							// ✅ REMOVED: feedRefreshKey больше не нужен - Supabase Realtime автоматически обновляет
							console.log('Card swiped - Realtime will update feed automatically');
						}}
						userData={userData}
					/>
				</Suspense>
			)}

			{/* ✅ FIX: Chat Container - адаптивный контейнер под карточками */}
			{!isLoading && (
				<div className="relative w-full">
					<ChatInputSection
						onEntrySaved={handleNewEntry}
						onMessageSent={(message) => {
							console.log('New achievement message:', message);
						}} // ✅ FIXED: Try user.id first
						userId={userData?.user?.id || userData?.id || 'anonymous'}
						userName={userName}
					/>
				</div>
			)}

			{/* Recent Entries Feed - Лента последних записей */}
			{!isLoading && (
				<RecentEntriesFeed
					language={userData?.language || 'ru'}
					onEntryClick={(entry) => {
						setSelectedEntry(entry);
					}}
					onViewAllClick={() => {
						console.log('Navigate to History');
						onNavigateToHistory?.();
					}}
					// ✅ REMOVED: refreshTrigger больше не нужен - Supabase Realtime автоматически обновляет
					userData={userData}
				/>
			)}

			{/* Entry Detail Modal */}
			<EntryDetailModal
				entry={selectedEntry}
				isOpen={selectedEntry !== null}
				onClose={() => setSelectedEntry(null)}
			/>
		</div>
	);
}

export default AchievementHomeScreen;
