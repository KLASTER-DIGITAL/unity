import type { LucideIcon } from 'lucide-react';
import {
	Award,
	BookOpen,
	Calendar,
	Camera,
	Crown,
	Dumbbell,
	Flame,
	Gift,
	Heart,
	Home,
	Lightbulb,
	Medal,
	Rocket,
	Sparkles,
	Star,
	Target,
	TrendingUp,
	Trophy,
	Users,
	Zap,
} from 'lucide-react';

type AchievementsScreenUserData = {
	id?: string;
	user?: { id?: string } | null;
};

type AchievementBadgeUi = {
	id: string;
	name: string;
	description: string;
	icon: LucideIcon;
	earned: boolean;
	rarity: RarityType;
	earnedDate?: string;
	progress: number;
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAchievements } from '@/shared/hooks/useAchievements';
import { useTranslation } from '@/shared/lib/i18n';
import type { RarityType } from '../constants/rarityStyles';
import { getEarnedText } from '../utils/getEarnedText';
import { AchievementBadge3D } from './AchievementBadge3D';
import { AchievementCategory } from './AchievementCategory';
import { AchievementDetailsModal } from './AchievementDetailsModal';

// Маппинг иконок для достижений
const iconMap: Record<string, LucideIcon> = {
	// Основные достижения
	Star, // Общие достижения
	Trophy, // Победы и награды
	Medal, // Медали
	Award, // Награды
	Crown, // Легендарные
	Target, // Цели

	// Постоянство
	Flame, // Стрики
	Calendar, // Дни подряд
	TrendingUp, // Прогресс

	// Категории
	Home, // Семья
	Dumbbell, // Здоровье
	BookOpen, // Работа/Обучение
	Heart, // Благодарность
	Lightbulb, // Идеи

	// Особые
	Rocket, // Рост
	Sparkles, // Особые моменты
	Gift, // Подарки/Бонусы
	Users, // Социальные
	Camera, // Воспоминания
	Zap, // Энергия/Быстрые
};

export function AchievementsScreen({ userData }: { userData?: AchievementsScreenUserData }) {
	// Получаем переводы для языка пользователя
	const { t, currentLanguage } = useTranslation();

	// ✅ HOOKS FIRST: All hooks must be called before any early returns
	const [isLoadingEntries, setIsLoadingEntries] = useState(true);
	const [userStats, setUserStats] = useState({
		totalEntries: 0,
		currentStreak: 0,
		longestStreak: 0,
		totalBadges: 0,
		level: 1,
		nextLevelProgress: 0,
	});
	const [selectedAchievement, setSelectedAchievement] = useState<AchievementBadgeUi | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<'all' | 'earned'>('all');

	// ✅ NEW: Используем hook для загрузки достижений из БД
	const {
		achievements,
		isLoading: isLoadingAchievements,
		error: achievementsError,
		earnedCount,
	} = useAchievements(userData?.user?.id);

	// ✅ FIX: Define function BEFORE useEffect with useCallback
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: loadData orchestrates async calls and early returns, splitting would hurt readability
	const loadData = useCallback(async () => {
		try {
			setIsLoadingEntries(true);
			// ✅ FIXED: userData has structure {user: {...}, profile: {...}}
			const userId = userData?.user?.id || userData?.id;

			if (!userId) {
				console.warn('[AchievementsScreen] No user id, skipping stats load');
				setUserStats((prev) => ({
					...prev,
					totalEntries: 0,
					currentStreak: 0,
					longestStreak: 0,
				}));
				return;
			}

			console.log('[AchievementsScreen] Loading stats for user:', userId);

			// Используем Supabase Edge Function achievements-calculate,
			// чтобы вся статистика (уровень, стрики и т.д.) считалась на сервере
			const { createClient } = await import('@/utils/supabase/client');
			const supabase = createClient();

			const {
				data: { session },
				error: sessionError,
			} = await supabase.auth.getSession();

			if (sessionError || !session?.access_token) {
				console.error('[AchievementsScreen] No session for stats:', sessionError);
				toast.error(t('auth_error', 'Ошибка авторизации'));
				return;
			}

			const response = await fetch(`${supabase.supabaseUrl}/functions/v1/achievements-calculate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({ user_id: userId }),
			});

			const data = (await response.json().catch(() => null)) as {
				success?: boolean;
				stats?: { [key: string]: unknown };
			} | null;

			const hasStats = !!data?.stats;

			if (!response.ok || data?.success === false || !hasStats) {
				console.warn(
					'[AchievementsScreen] Stats response incomplete, using fallback where needed:',
					{
						status: response.status,
						data,
					}
				);
			}

			const stats =
				(data?.stats as {
					// Названия соответствуют интерфейсу UserStats в Edge Function
					totalEntries?: number;
					currentStreak?: number;
					longestStreak?: number;
					level?: number;
					nextLevelProgress?: number;
				}) || {};

			let totalEntries = stats.totalEntries ?? 0;
			let currentStreak = stats.currentStreak ?? 0;
			let longestStreak = stats.longestStreak ?? 0;
			let level = stats.level ?? 1;
			let nextLevelProgress = stats.nextLevelProgress ?? 0;

			// ✅ OPTIMIZATION: Один вызов getHomeScreenData вместо двух (было 10 сек → стало 2-3 сек)
			// Синхронизируем currentStreak с главным экраном, используем кэш для быстрой загрузки
			// ВАЖНО: home-screen-data НЕ возвращает longestStreak, поэтому используем его из achievements-calculate
			try {
				const { getHomeScreenData } = await import('@/shared/lib/api/services/homeScreen');
				const homeData = await getHomeScreenData(userId, true); // true = использовать кэш для быстрой загрузки

				if (homeData?.stats) {
					// Синхронизируем currentStreak с главным экраном (он всегда правильный в home-screen-data)
					currentStreak = homeData.stats.currentStreak;

					// ✅ FIX: longestStreak НЕ берем из home-screen-data, так как он там не считается
					// Используем longestStreak из achievements-calculate (он уже правильный)
					// Если longestStreak = 0, но currentStreak > 0, то longestStreak должен быть минимум = currentStreak
					if (longestStreak === 0 && currentStreak > 0) {
						longestStreak = currentStreak;
						console.log(
							'[AchievementsScreen] ⚠️ longestStreak was 0, setting to currentStreak:',
							currentStreak
						);
					}

					// Если totalEntries из achievements-calculate = 0, берем из home-screen-data
					if (totalEntries === 0 && homeData.stats.totalEntries > 0) {
						totalEntries = homeData.stats.totalEntries;
					}

					console.log('[AchievementsScreen] ✅ Using data from home-screen-data:', {
						totalEntries,
						currentStreak,
						longestStreak: `from achievements-calculate: ${longestStreak}`,
					});
				}
			} catch (homeDataError) {
				console.warn(
					'[AchievementsScreen] Failed to get data from home-screen-data:',
					homeDataError
				);
				// Продолжаем с текущими значениями из achievements-calculate
				// Если longestStreak = 0, но currentStreak > 0, устанавливаем longestStreak = currentStreak
				if (longestStreak === 0 && currentStreak > 0) {
					longestStreak = currentStreak;
				}
			}

			// 🔁 Fallback: если longestStreak все еще 0, но есть записи, пересчитываем его
			// Также пересчитываем уровень, если он неправильный
			if (longestStreak === 0 && currentStreak > 0) {
				longestStreak = currentStreak;
				console.log(
					'[AchievementsScreen] ⚠️ longestStreak was 0, setting to currentStreak as fallback:',
					currentStreak
				);
			}

			// 🔁 Fallback: если сервер вернул пустую статистику, но у пользователя уже есть достижения,
			// используем client-side getUserStats, чтобы подтянуть реальные значения из записей.
			if (totalEntries === 0 && earnedCount > 0) {
				try {
					const { getUserStats } = await import('@/shared/lib/api');
					const legacyStats = await getUserStats(userId);

					if (legacyStats?.totalEntries) {
						totalEntries = legacyStats.totalEntries;

						// Если рекорд не посчитан на сервере, используем текущий стрик как минимум
						if (longestStreak === 0 && legacyStats.currentStreak) {
							longestStreak = legacyStats.currentStreak;
						}

						// Пересчитываем уровень из количества записей
						const totalXP = legacyStats.totalEntries * 10;
						level = Math.floor(totalXP / 100) + 1;
						nextLevelProgress = Math.round(totalXP % 100);
					}
				} catch (fallbackError) {
					console.error('[AchievementsScreen] Fallback getUserStats failed:', fallbackError);
				}
			} else if (totalEntries > 0) {
				// ✅ FIX: Пересчитываем уровень из количества записей, если он неправильный
				// Уровень: 1 запись = 10 XP, уровень каждые 100 XP
				const totalXP = totalEntries * 10;
				const calculatedLevel = Math.floor(totalXP / 100) + 1;
				const calculatedProgress = Math.round(totalXP % 100);

				// Если уровень из achievements-calculate неправильный, пересчитываем
				if (
					level !== calculatedLevel ||
					(level === 1 && totalEntries > 0 && nextLevelProgress === 0 && calculatedProgress > 0)
				) {
					level = calculatedLevel;
					nextLevelProgress = calculatedProgress;
					console.log('[AchievementsScreen] ✅ Recalculated level:', {
						oldLevel: stats.level,
						newLevel: level,
						totalEntries,
						nextLevelProgress,
					});
				}
			}

			setUserStats({
				totalEntries,
				currentStreak,
				longestStreak,
				totalBadges: earnedCount, // ✅ Используем earnedCount из useAchievements
				level,
				nextLevelProgress,
			});

			console.log('[AchievementsScreen] User stats (server):', stats);
		} catch (error) {
			console.error('[AchievementsScreen] Error loading stats:', error);
			toast.error(t('achievements_stats_error', 'Не удалось загрузить статистику достижений'));
		} finally {
			setIsLoadingEntries(false);
		}
	}, [userData, earnedCount, t]); // ✅ FIX: Добавили earnedCount и t в зависимости

	// ✅ FIX: useEffect AFTER function definition
	useEffect(() => {
		loadData();
	}, [loadData]);

	// ✅ НОВОЕ: Real-time подписка на изменения entries для автообновления статистики
	useEffect(() => {
		const userId = userData?.user?.id || userData?.id;

		if (!userId) {
			console.log('[AchievementsScreen] No userId, skipping real-time subscription');
			return;
		}

		console.log('[AchievementsScreen] 🔔 Setting up real-time subscription for entries:', userId);

		// Создаем Supabase клиент внутри useEffect
		let channel: ReturnType<
			typeof import('@/utils/supabase/client').createClient extends () => infer R
				? R extends { channel: infer C }
					? C
					: never
				: never
		>;

		(async () => {
			const { createClient } = await import('@/utils/supabase/client');
			const supabase = createClient();

			channel = supabase
				.channel(`achievements-stats:${userId}`)
				.on(
					'postgres_changes',
					{
						event: '*', // INSERT, UPDATE, DELETE
						schema: 'public',
						table: 'entries',
						filter: `user_id=eq.${userId}`,
					},
					(payload) => {
						console.log(
							'[AchievementsScreen] 🔔 Entry changed, reloading stats:',
							payload.eventType
						);

						// Перезагружаем статистику БЕЗ показа skeleton
						loadData();
					}
				)
				.on(
					'postgres_changes',
					{
						event: '*',
						schema: 'public',
						table: 'user_achievements',
						filter: `user_id=eq.${userId}`,
					},
					(payload) => {
						console.log(
							'[AchievementsScreen] 🔔 Achievement changed, reloading stats:',
							payload.eventType
						);

						// Перезагружаем статистику для обновления earnedCount
						loadData();
					}
				)
				.subscribe((status) => {
					if (status === 'SUBSCRIBED') {
						console.log('[AchievementsScreen] ✅ Subscribed to real-time updates');
					}
				});
		})();

		return () => {
			if (channel) {
				console.log('[AchievementsScreen] 🔕 Unsubscribing from real-time updates');
				(async () => {
					const { createClient } = await import('@/utils/supabase/client');
					const supabase = createClient();
					supabase.removeChannel(channel);
				})();
			}
		};
	}, [userData?.user?.id, userData?.id, loadData]);

	// ✅ NEW: Объединенный loading state
	const isLoading = isLoadingEntries || isLoadingAchievements;

	// ✅ NEW: Преобразовать достижения из БД в формат для UI с мемоизацией
	const badges = useMemo(
		() =>
			achievements.map((achievement) => {
				// ✅ SAFETY: Ensure icon is always a valid component
				const IconComponent = iconMap[achievement.icon];

				// ✅ i18n: Try to get translation, fallback to DB value
				const translatedName = t(`achievement.${achievement.id}.name`, achievement.name);
				const translatedDescription = t(
					`achievement.${achievement.id}.description`,
					achievement.description
				);

				// ✅ Manual date formatting for kk/ka languages
				let formattedDate: string | undefined;
				if (achievement.earnedAt) {
					const date = new Date(achievement.earnedAt);

					if (currentLanguage === 'kk' || currentLanguage === 'ka') {
						const months =
							currentLanguage === 'kk'
								? [
										'қаң.',
										'ақп.',
										'нау.',
										'сәу.',
										'мам.',
										'мау.',
										'шіл.',
										'там.',
										'қыр.',
										'қаз.',
										'қар.',
										'жел.',
									]
								: [
										'იან.',
										'თებ.',
										'მარ.',
										'აპრ.',
										'მაი.',
										'ივნ.',
										'ივლ.',
										'აგვ.',
										'სექ.',
										'ოქტ.',
										'ნოე.',
										'დეკ.',
									];

						const day = date.getDate();
						const month = months[date.getMonth()];
						const year = date.getFullYear();

						formattedDate =
							currentLanguage === 'kk'
								? `${day} ${month} ${year} ж.`
								: `${day} ${month} ${year} წ.`;
					} else {
						const locale = `${currentLanguage}-${currentLanguage.toUpperCase()}`;
						formattedDate = date.toLocaleDateString(locale, {
							day: 'numeric',
							month: 'short',
							year: 'numeric',
						});
					}
				}

				// ✅ NEW: Определяем правильный текст для выполненных достижений
				const earnedText = getEarnedText(achievement.id, t);

				return {
					id: achievement.id,
					name: translatedName,
					description: translatedDescription,
					icon: IconComponent || Star, // Fallback to Star if icon not found
					earned: achievement.isEarned, // ✅ NEW: используем isEarned из БД
					rarity: achievement.rarity, // ✅ NEW: rarity из БД (common/rare/epic/legendary)
					earnedDate: formattedDate,
					earnedText, // ✅ NEW: Правильный текст для выполненных достижений
					progress: achievement.progress || 0, // ✅ NEW: прогресс 0-100 из БД (default 0)
				};
			}),
		[achievements, currentLanguage, t] // ✅ FIXED: Added t dependency
	);

	// ✅ NEW: Фильтрация по табам
	const filteredBadges = useMemo(() => {
		if (activeTab === 'earned') {
			return badges.filter((b) => b.earned);
		}
		return badges;
	}, [badges, activeTab]);

	// ✅ FIXED: Категоризация достижений по ID (не по названию)
	// Используем ID достижений вместо hardcoded текстов в названиях
	const categorizedAchievements = useMemo(() => {
		const milestones = filteredBadges.filter((b) => {
			// Достижения по количеству записей: entries_*, first_entry
			return b.id.startsWith('entries_') || b.id === 'first_entry';
		});

		const streaks = filteredBadges.filter((b) => {
			// Достижения по серии дней: streak_*
			return b.id.startsWith('streak_');
		});

		const categories = filteredBadges.filter((b) => {
			// Достижения по категориям: category_*
			return b.id.startsWith('category_');
		});

		const mindfulness = filteredBadges.filter((b) => {
			// Достижения по эмоциональной честности и балансу
			return (
				b.id === 'honest_difficult_day' ||
				b.id === 'emotional_balance' ||
				b.id.includes('mindfulness') ||
				b.id.includes('emotion')
			);
		});

		const special = filteredBadges.filter(
			(b) =>
				!milestones.includes(b) &&
				!streaks.includes(b) &&
				!categories.includes(b) &&
				!mindfulness.includes(b)
		);

		return { milestones, streaks, categories, mindfulness, special };
	}, [filteredBadges]);

	// ✅ EARLY RETURN AFTER ALL HOOKS: Check t function availability
	if (!t) {
		console.error('[AchievementsScreen] Translation function not available');
		return (
			<div className="flex min-h-screen items-center justify-center bg-background pb-20">
				<p className="text-foreground">Loading translations...</p>
			</div>
		);
	}

	// ✅ NEW: Показываем ошибку если не удалось загрузить достижения
	if (achievementsError) {
		console.error('[AchievementsScreen] Achievements error:', achievementsError);
		toast.error('Не удалось загрузить достижения');
	}

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
						{Array.from({ length: 4 }, (_, i) => ({ id: `stat-${i}` })).map((item) => (
							<div className="text-center" key={item.id}>
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

				{/* ✅ FIX: Skeleton for achievement cards - ТОЧНЫЕ размеры для предотвращения CLS */}
				<div className="p-4">
					<div className="grid grid-cols-2 gap-4">
						{Array.from({ length: 6 }, (_, i) => ({ id: `achievement-${i}` })).map((item) => (
							<div
								className="rounded-[16px] border-0 bg-card p-4 shadow-sm transition-colors duration-300"
								key={item.id}
								style={{ minHeight: '180px' }}
							>
								<div className="text-center">
									{/* Icon skeleton - ТОЧНЫЙ размер как в реальной карточке */}
									<div className="relative mb-3">
										<Skeleton className="mx-auto h-16 w-16 rounded-full" />
									</div>
									{/* Title skeleton */}
									<Skeleton className="mx-auto mb-1 h-5 w-3/4" />
									{/* Description skeleton */}
									<Skeleton className="mx-auto mb-2 h-4 w-full" />
									{/* Badge/Progress skeleton */}
									<Skeleton className="mx-auto h-6 w-20 rounded-full" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="scrollbar-hide min-h-screen overflow-x-hidden bg-background pb-20">
			{/* Header Section */}
			<div className="bg-card p-4 transition-colors duration-300">
				<div className="mb-6 text-center">
					<div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-muted shadow-lg transition-colors duration-300">
						<Crown className="h-10 w-10 text-foreground transition-colors duration-300" />
					</div>
					<h1 className="mb-1 font-semibold text-xl text-foreground transition-colors duration-300 sm:text-2xl">
						{t('level', 'Уровень')} {userStats.level}
					</h1>
					<p className="text-muted-foreground text-sm transition-colors duration-300 sm:text-base">
						{t('achievement_master', 'Мастер достижений')}
					</p>
				</div>

				<div className="mb-6 grid grid-cols-4 gap-2 transition-colors duration-300 sm:gap-4">
					<div className="text-center">
						<div className="mb-1 font-semibold text-lg text-foreground transition-colors duration-300 sm:text-2xl">
							{userStats.totalEntries}
						</div>
						<div className="text-muted-foreground text-[10px] transition-colors duration-300 sm:text-sm">
							{t('achievements.stats.entries', 'Записей')}
						</div>
					</div>
					<div className="text-center">
						<div className="mb-1 font-semibold text-lg text-foreground transition-colors duration-300 sm:text-2xl">
							{userStats.totalBadges}
						</div>
						<div className="text-muted-foreground text-[10px] transition-colors duration-300 sm:text-sm">
							{t('achievements.stats.badges', 'Наград')}
						</div>
					</div>
					<div className="text-center">
						<div className="mb-1 font-semibold text-lg text-foreground transition-colors duration-300 sm:text-2xl">
							{userStats.currentStreak}
						</div>
						<div className="text-muted-foreground text-[10px] transition-colors duration-300 sm:text-sm">
							{t('achievements.stats.days_streak', 'Дней подряд')}
						</div>
					</div>
					<div className="text-center">
						<div className="mb-1 font-semibold text-lg text-foreground transition-colors duration-300 sm:text-2xl">
							{userStats.longestStreak}
						</div>
						<div className="text-muted-foreground text-[10px] transition-colors duration-300 sm:text-sm">
							{t('achievements.stats.record', 'Рекорд')}
						</div>
					</div>
				</div>

				{/* ✅ IMPROVED: Progress bar with better UI (pattern from Reports) */}
				<div className="space-y-2">
					<div className="mb-2">
						<div className="mb-2 flex items-center justify-between">
							<span className="text-muted-foreground text-sm font-medium">
								{t('achievements.to_level', 'До уровня')} {userStats.level + 1}
							</span>
							<span className="text-muted-foreground text-xs font-medium">
								{userStats.nextLevelProgress}%
							</span>
						</div>
						<Progress className="h-2" value={userStats.nextLevelProgress} />
					</div>
				</div>
			</div>

			{/* ✅ IMPROVED: Tabs using shadcn/ui component (pattern from Reports) */}
			<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'earned')}>
				<div className="bg-card px-4 pt-4 transition-colors duration-300">
					<TabsList className="inline-flex h-auto w-full items-center justify-start rounded-lg bg-muted p-1">
						<TabsTrigger className="flex-1 rounded-md px-4 py-2.5 text-sm font-medium" value="all">
							{t('achievements.tabs.all', 'Все')}
						</TabsTrigger>
						<TabsTrigger
							className="flex-1 rounded-md px-4 py-2.5 text-sm font-medium"
							value="earned"
						>
							{t('achievements.tabs.earned', 'Полученные')} ({earnedCount})
						</TabsTrigger>
					</TabsList>
				</div>

				<TabsContent value={activeTab} className="m-0">
					{/* Categorized Achievements */}
					<div className="space-y-6 px-4 pt-4">
						{/* Milestones */}
						{categorizedAchievements.milestones.length > 0 && (
							<AchievementCategory
								title={t('achievements.category.milestones', 'Вехи')}
								icon="🎯"
								delay={0}
							>
								{categorizedAchievements.milestones.map((badge, index) => (
									<AchievementBadge3D
										key={badge.id}
										{...badge}
										index={index}
										onClick={() => {
											setSelectedAchievement(badge);
											setIsModalOpen(true);
										}}
									/>
								))}
							</AchievementCategory>
						)}

						{/* Streaks */}
						{categorizedAchievements.streaks.length > 0 && (
							<AchievementCategory
								title={t('achievements.category.streaks', 'Постоянство')}
								icon="🔥"
								delay={0.1}
							>
								{categorizedAchievements.streaks.map((badge, index) => (
									<AchievementBadge3D
										key={badge.id}
										{...badge}
										index={index}
										onClick={() => {
											setSelectedAchievement(badge);
											setIsModalOpen(true);
										}}
									/>
								))}
							</AchievementCategory>
						)}

						{/* Categories */}
						{categorizedAchievements.categories.length > 0 && (
							<AchievementCategory
								title={t('achievements.category.categories', 'Категории')}
								icon="📚"
								delay={0.2}
							>
								{categorizedAchievements.categories.map((badge, index) => (
									<AchievementBadge3D
										key={badge.id}
										{...badge}
										index={index}
										onClick={() => {
											setSelectedAchievement(badge);
											setIsModalOpen(true);
										}}
									/>
								))}
							</AchievementCategory>
						)}

						{/* Mindfulness & Emotions */}
						{categorizedAchievements.mindfulness?.length > 0 && (
							<AchievementCategory
								title={t('achievements.category.mindfulness', 'Осознанность и эмоции')}
								icon="💙"
								delay={0.3}
							>
								{categorizedAchievements.mindfulness.map((badge, index) => (
									<AchievementBadge3D
										key={badge.id}
										{...badge}
										index={index}
										onClick={() => {
											setSelectedAchievement(badge);
											setIsModalOpen(true);
										}}
									/>
								))}
							</AchievementCategory>
						)}

						{/* Special */}
						{categorizedAchievements.special.length > 0 && (
							<AchievementCategory
								title={t('achievements.category.special', 'Особые')}
								icon="⭐"
								delay={0.4}
							>
								{categorizedAchievements.special.map((badge, index) => (
									<AchievementBadge3D
										key={badge.id}
										{...badge}
										index={index}
										onClick={() => {
											setSelectedAchievement(badge);
											setIsModalOpen(true);
										}}
									/>
								))}
							</AchievementCategory>
						)}
					</div>
				</TabsContent>
			</Tabs>

			{/* Achievement Details Modal */}
			<AchievementDetailsModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				achievement={selectedAchievement}
			/>
		</div>
	);
}
export default AchievementsScreen;
