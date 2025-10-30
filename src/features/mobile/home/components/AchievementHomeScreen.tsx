import { lazy, Suspense, useEffect, useState } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { type DiaryEntry, getUserStats } from "@/shared/lib/api";
import { AchievementHeader } from "./AchievementHeader";
import { ChatInputSection } from "./ChatInputSection";
import { EntryDetailModal } from "./EntryDetailModal";
import { RecentEntriesFeed } from "./RecentEntriesFeed";

// Lazy load MotivationCardsSection for better LCP
const MotivationCardsSection = lazy(() =>
	import("./MotivationCardsSection").then((module) => ({
		default: module.MotivationCardsSection,
	})),
);

// Import types
import type {
	AchievementCard,
	AchievementHomeScreenProps,
	DiaryData,
} from "./achievement";

// Re-export types for backward compatibility
export type { DiaryData, AchievementHomeScreenProps, AchievementCard };

// ✅ REMOVED: GRADIENTS moved to ./achievement/constants.ts
// ✅ REMOVED: DEFAULT_MOTIVATIONS moved to ./achievement/constants.ts
// ✅ REMOVED: getDefaultMotivations() moved to ./achievement/utils.ts
// ✅ REMOVED: entryToCard() moved to ./achievement/utils.ts
// ✅ REMOVED: SwipeCard component moved to ./achievement/SwipeCard.tsx

// Основной компонент
export function AchievementHomeScreen({
	diaryData: _diaryData = { name: "Мой дневник", emoji: "🏆" },
	userData,
	onNavigateToHistory,
	onNavigateToSettings,
}: AchievementHomeScreenProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [currentStreak, setCurrentStreak] = useState(0);
	const [feedRefreshKey, setFeedRefreshKey] = useState(0);
	const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

	// Загрузка статистики при монтировании
	useEffect(() => {
		loadStats();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const loadStats = async () => {
		try {
			setIsLoading(true);
			const userId = userData?.user?.id || userData?.id || "anonymous";

			// Загружаем только статистику
			const stats = await getUserStats(userId);
			console.log("User stats:", stats);

			// Обновляем streak
			setCurrentStreak(stats.currentStreak);
		} catch (error) {
			console.error("Error loading stats:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// Обработчик создания новой записи
	const handleNewEntry = (_entry: DiaryEntry) => {
		console.log("New entry created:", _entry);

		// Перезагружаем статистику
		const userId = userData?.user?.id || userData?.id || "anonymous";
		getUserStats(userId)
			.then((stats) => {
				setCurrentStreak(stats.currentStreak);
			})
			.catch((err) => {
				console.error("Error updating stats:", err);
			});

		// Trigger feed refresh
		setFeedRefreshKey((prev) => prev + 1);
	};

	// Получаем имя пользователя из userData.profile.name или userData.name или используем дефолтное
	const userName = userData?.profile?.name || userData?.name || "Пользователь";
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

			{/* Loading State - Skeleton for stats */}
			{isLoading && (
				<div className="space-y-4 p-section">
					{/* Skeleton for motivation cards */}
					<div className="relative flex min-h-[280px] w-full flex-col justify-between rounded-[24px] bg-card p-6">
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
			)}

			{/* ✅ LAZY LOADED: Motivation Cards Section - improves LCP */}
			{!isLoading && (
				<Suspense
					fallback={
						<div className="p-section">
							<div className="relative mb-responsive-md flex min-h-[280px] w-full items-center justify-center">
								<div className="text-center">
									<div className="inline-block h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
								</div>
							</div>
						</div>
					}
				>
					<MotivationCardsSection
						onCardSwipe={() => {
							// Refresh feed when card is swiped
							setFeedRefreshKey((prev) => prev + 1);
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
							console.log("New achievement message:", message);
						}} // ✅ FIXED: Try user.id first
						userId={userData?.user?.id || userData?.id || "anonymous"}
						userName={userName}
					/>
				</div>
			)}

			{/* Recent Entries Feed - Лента последних записей */}
			{!isLoading && (
				<RecentEntriesFeed
					key={feedRefreshKey} // ✅ NEW: Force refresh when key changes
					language={userData?.language || "ru"}
					onEntryClick={(entry) => {
						setSelectedEntry(entry);
					}}
					onViewAllClick={() => {
						console.log("Navigate to History");
						onNavigateToHistory?.();
					}}
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
