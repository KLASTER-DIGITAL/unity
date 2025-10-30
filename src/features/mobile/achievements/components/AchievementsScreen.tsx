import {
	BookOpen,
	Camera,
	Crown,
	Dumbbell,
	Flame,
	Heart,
	Star,
	Target,
	Trophy,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { type DiaryEntry, getEntries } from "@/shared/lib/api";
import {
	type Achievement,
	calculateAchievements,
	calculateUserStats,
} from "@/shared/lib/api/statsCalculator";
import { useTranslation } from "@/shared/lib/i18n";

// Маппинг иконок для достижений
const iconMap: Record<string, any> = {
	Star,
	Flame,
	Dumbbell,
	BookOpen,
	Trophy,
	Target,
	Camera,
	Heart,
	Zap,
};

export function AchievementsScreen({ userData }: { userData?: any }) {
	// Получаем переводы для языка пользователя
	const { t } = useTranslation();

	// ✅ SAFETY: Ensure t function is available
	if (!t) {
		console.error("[ACHIEVEMENTS] Translation function not available");
		return (
			<div className="flex min-h-screen items-center justify-center bg-background pb-20">
				<p className="text-foreground">Loading translations...</p>
			</div>
		);
	}

	const [isLoading, setIsLoading] = useState(true);
	const [_entries, setEntries] = useState<DiaryEntry[]>([]);
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [userStats, setUserStats] = useState({
		totalEntries: 0,
		currentStreak: 0,
		longestStreak: 0,
		totalBadges: 0,
		level: 1,
		nextLevelProgress: 0,
	});

	useEffect(() => {
		loadData();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const loadData = async () => {
		try {
			setIsLoading(true);
			// ✅ FIXED: userData has structure {user: {...}, profile: {...}}
			const userId = userData?.user?.id || userData?.id || "anonymous";
			console.log("[ACHIEVEMENTS] Loading data for user:", userId);
			const entriesData = await getEntries(userId, 100);

			console.log("Loaded entries for achievements:", entriesData);
			setEntries(entriesData);

			// Вычислить достижения
			const calculatedAchievements = calculateAchievements(entriesData);
			setAchievements(calculatedAchievements);

			// Вычислить статистику
			const stats = calculateUserStats(entriesData);
			setUserStats({
				totalEntries: stats.totalEntries,
				currentStreak: stats.currentStreak,
				longestStreak: stats.longestStreak,
				totalBadges: calculatedAchievements.filter((a) => a.earned).length,
				level: stats.level,
				nextLevelProgress: stats.nextLevelProgress,
			});

			console.log("Calculated achievements:", calculatedAchievements);
			console.log("User stats:", userStats);
		} catch (error) {
			console.error("Error loading data:", error);
			toast.error("Не удалось загрузить достижения");
		} finally {
			setIsLoading(false);
		}
	};

	// Преобразовать достижения в формат для UI
	const badges = achievements.map((achievement) => {
		// ✅ SAFETY: Ensure icon is always a valid component
		const IconComponent = iconMap[achievement.icon];

		return {
			id: achievement.id,
			name: achievement.name,
			description: achievement.description,
			icon: IconComponent || Star, // Fallback to Star if icon not found
			earned: achievement.earned,
			rarity: achievement.rarity,
			earnedDate: achievement.earnedDate,
			progress: achievement.progress,
		};
	});

	const milestones = [
		{
			id: 1,
			title: t("milestone_10_entries", "10 записей"),
			completed: userStats.totalEntries >= 10,
			reward: t("badge_beginner", 'Бейдж "Начинающий"'),
		},
		{
			id: 2,
			title: t("milestone_week_streak", "Неделя подряд"),
			completed: userStats.currentStreak >= 7,
			reward: t("badge_consistency", 'Бейдж "Постоянство"'),
		},
		{
			id: 3,
			title: t("milestone_50_entries", "50 записей"),
			completed: userStats.totalEntries >= 50,
			progress: userStats.totalEntries,
			total: 50,
			reward: t("premium_theme", "Премиум тема"),
		},
		{
			id: 4,
			title: t("milestone_month_streak", "Месяц подряд"),
			completed: userStats.longestStreak >= 30,
			progress: userStats.longestStreak,
			total: 30,
			reward: t("badge_legend", 'Бейдж "Легенда"'),
		},
	];

	// Helper functions for rarity styling (currently unused but kept for future use)
	// const getRarityColor = (rarity: string) => {
	//   switch (rarity) {
	//     case "common": return "bg-muted text-foreground border-border";
	//     case "uncommon": return "bg-[var(--ios-green)]/10 text-[var(--ios-green)] border-[var(--ios-green)]/20";
	//     case "rare": return "bg-[var(--ios-blue)]/10 text-[var(--ios-blue)] border-[var(--ios-blue)]/20";
	//     case "legendary": return "bg-[var(--ios-purple)]/10 text-[var(--ios-purple)] border-[var(--ios-purple)]/20";
	//     default: return "bg-muted text-foreground border-border";
	//   }
	// };

	// const getRarityGlow = (rarity: string) => {
	//   switch (rarity) {
	//     case "rare": return "shadow-[var(--ios-blue)]/20";
	//     case "legendary": return "shadow-[var(--ios-purple)]/20";
	//     default: return "";
	//   }
	// };

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background pb-20">
				{/* Skeleton for achievements header */}
				<div className="bg-card p-4 transition-colors duration-300">
					<div className="mb-6 text-center">
						<Skeleton className="mx-auto mb-3 h-20 w-20 rounded-full" />
						<Skeleton className="mx-auto mb-2 h-8 w-32" />
						<Skeleton className="mx-auto h-4 w-40" />
					</div>

					{/* Skeleton for stats grid */}
					<div className="mb-6 grid grid-cols-4 gap-4">
						{[...new Array(4)].map((_, i) => (
							<div className="text-center" key={i}>
								<Skeleton className="mx-auto mb-1 h-8 w-12" />
								<Skeleton className="mx-auto h-3 w-16" />
							</div>
						))}
					</div>

					{/* Skeleton for progress bar */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-8" />
						</div>
						<Skeleton className="h-2 w-full rounded-full" />
					</div>
				</div>

				{/* Skeleton for achievement cards */}
				<div className="space-y-3 p-4">
					{[...new Array(3)].map((_, i) => (
						<div
							className="rounded-[16px] bg-card p-4 transition-colors duration-300"
							key={i}
						>
							<div className="flex items-start gap-4">
								<Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-5 w-3/4" />
									<Skeleton className="h-4 w-full" />
									<div className="mt-2 flex items-center gap-2">
										<Skeleton className="h-6 w-16 rounded-full" />
										<Skeleton className="h-6 w-20 rounded-full" />
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="scrollbar-hide min-h-screen overflow-x-hidden bg-background pb-20">
			{/* Header Section */}
			<div className="bg-card p-4 transition-colors duration-300">
				<div className="mb-6 text-center">
					<div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 shadow-lg">
						<Crown className="h-10 w-10 text-primary-foreground" />
					</div>
					<h1 className="mb-1 font-semibold text-2xl text-foreground">
						{t("level", "Уровень")} {userStats.level}
					</h1>
					<p className="text-muted-foreground">
						{t("achievement_master", "Мастер достижений")}
					</p>
				</div>

				<div className="mb-6 grid grid-cols-4 gap-4">
					<div className="text-center">
						<div className="mb-1 font-semibold text-2xl text-foreground">
							{userStats.totalEntries}
						</div>
						<div className="text-muted-foreground text-xs">Записей</div>
					</div>
					<div className="text-center">
						<div className="mb-1 font-semibold text-2xl text-foreground">
							{userStats.totalBadges}
						</div>
						<div className="text-muted-foreground text-xs">Наград</div>
					</div>
					<div className="text-center">
						<div className="mb-1 font-semibold text-2xl text-foreground">
							{userStats.currentStreak}
						</div>
						<div className="text-muted-foreground text-xs">Дней подряд</div>
					</div>
					<div className="text-center">
						<div className="mb-1 font-semibold text-2xl text-foreground">
							{userStats.longestStreak}
						</div>
						<div className="text-muted-foreground text-xs">Рекорд</div>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-muted-foreground text-sm">
						<span>До следующего уровня</span>
						<span>{userStats.nextLevelProgress}%</span>
					</div>
					<div className="h-2 w-full rounded-full bg-muted">
						<div
							className="h-2 rounded-full bg-linear-to-r from-primary to-primary/80 transition-all duration-300"
							style={{ width: `${userStats.nextLevelProgress}%` }}
						/>
					</div>
				</div>
			</div>

			{/* Badges Grid */}
			<div className="p-4">
				<div className="grid grid-cols-2 gap-4">
					{badges.map((badge) => {
						// ✅ SAFETY: Ensure Icon component exists before rendering
						const Icon = badge.icon || Star;

						return (
							<Card
								className={`cursor-pointer border-0 bg-card shadow-sm transition-all hover:shadow-md ${
									badge.earned ? "" : "opacity-60"
								}`}
								key={badge.id}
							>
								<CardContent className="p-4 text-center">
									<div className="relative mb-3">
										<div
											className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
												badge.earned
													? badge.rarity === "legendary"
														? "bg-linear-to-br from-purple-400 to-purple-600"
														: badge.rarity === "rare"
															? "bg-linear-to-br from-blue-400 to-blue-600"
															: badge.rarity === "uncommon"
																? "bg-linear-to-br from-green-400 to-green-600"
																: "bg-linear-to-br from-gray-400 to-gray-600"
													: "bg-muted"
											}`}
										>
											{Icon && (
												<Icon
													className={`h-8 w-8 ${badge.earned ? "text-white" : "text-muted-foreground"}`}
												/>
											)}
										</div>
										{badge.earned && (
											<div className="-top-2 -right-2 absolute">
												<div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
													<Star className="h-3 w-3 fill-white text-white" />
												</div>
											</div>
										)}
									</div>

									<h4 className="mb-1 text-[#0d062d]">{badge.name}</h4>
									<p className="mb-2 text-[#787486] text-xs">
										{badge.description}
									</p>

									{badge.earned ? (
										<Badge
											className={`text-xs ${
												badge.rarity === "legendary"
													? "bg-purple-100 text-purple-600"
													: badge.rarity === "rare"
														? "bg-blue-100 text-blue-600"
														: badge.rarity === "uncommon"
															? "bg-green-100 text-green-600"
															: "bg-muted text-muted-foreground"
											}`}
										>
											{badge.earnedDate}
										</Badge>
									) : (
										<div className="space-y-1">
											<div className="h-2 w-full rounded-full bg-muted">
												<div
													className="h-2 rounded-full bg-[#5030e5] transition-all duration-300"
													style={{
														width: `${((badge.progress || 0) / (badge.rarity === "legendary" ? 30 : 20)) * 100}%`,
													}}
												/>
											</div>
											<p className="text-[#787486] text-xs">
												{badge.progress}/
												{badge.rarity === "legendary" ? 30 : 20}
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Milestones Section */}
			<div className="p-4">
				<h3 className="mb-4 text-[#0d062d]">Основные этапы</h3>
				<div className="space-y-3">
					{milestones.map((milestone) => (
						<Card
							className="border-0 bg-card shadow-sm transition-colors duration-300"
							key={milestone.id}
						>
							<CardContent className="p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div
											className={`flex h-10 w-10 items-center justify-center rounded-full ${
												milestone.completed
													? "bg-green-100 text-green-600"
													: "bg-[#5030e5]/10 text-[#5030e5]"
											}`}
										>
											{milestone.completed ? (
												<Trophy className="h-5 w-5" strokeWidth={2} />
											) : (
												<Target className="h-5 w-5" strokeWidth={2} />
											)}
										</div>
										<div>
											<h4 className="text-[#0d062d]">{milestone.title}</h4>
											<p className="text-[#787486] text-sm">
												{milestone.reward}
											</p>
										</div>
									</div>

									{milestone.completed ? (
										<Badge className="bg-green-100 text-green-600">
											Выполнено
										</Badge>
									) : (
										<div className="text-right">
											<p className="mb-1 text-[#787486] text-sm">
												{milestone.progress}/{milestone.total}
											</p>
											<div className="h-2 w-20 rounded-full bg-muted">
												<div
													className="h-2 rounded-full bg-[#5030e5] transition-all duration-300"
													style={{
														width: `${(milestone.progress! / milestone.total!) * 100}%`,
													}}
												/>
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	);
}
export default AchievementsScreen;
