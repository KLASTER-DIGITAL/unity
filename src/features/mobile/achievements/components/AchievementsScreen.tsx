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
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAchievements } from '@/shared/hooks/useAchievements';
import { useTranslation } from '@/shared/lib/i18n';
import type { RarityType } from '../constants/rarityStyles';
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

			// 🔁 Fallback: если сервер вернул пустую статистику, но у пользователя уже есть достижения,
			// используем client-side getUserStats, чтобы подтянуть реальные значения из записей.
			if (totalEntries === 0 && earnedCount > 0) {
				try {
					const { getUserStats } = await import('@/shared/lib/api');
					const legacyStats = await getUserStats(userId);

					if (legacyStats?.totalEntries) {
						totalEntries = legacyStats.totalEntries;
						currentStreak = legacyStats.currentStreak ?? currentStreak;

						// Если рекорд не посчитан на сервере, используем текущий стрик как минимум
						if (!longestStreak && legacyStats.currentStreak) {
							longestStreak = legacyStats.currentStreak;
						}

						// Пересчитываем уровень из количества записей, если сервер оставил уровень по умолчанию
						if (level <= 1) {
							const totalXP = legacyStats.totalEntries * 10;
							level = Math.floor(totalXP / 100) + 1;
							nextLevelProgress = Math.round(totalXP % 100);
						}
					}
				} catch (fallbackError) {
					console.error('[AchievementsScreen] Fallback getUserStats failed:', fallbackError);
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

	// ✅ NEW: Объединенный loading state
	const isLoading = isLoadingEntries || isLoadingAchievements;

	// ✅ NEW: Преобразовать достижения из БД в формат для UI с мемоизацией
	const badges = useMemo(
		() =>
			achievements.map((achievement) => {
				// ✅ SAFETY: Ensure icon is always a valid component
				const IconComponent = iconMap[achievement.icon];
				const locale =
					currentLanguage === 'kk'
						? 'kk-KZ'
						: currentLanguage === 'ka'
							? 'ka-GE'
							: `${currentLanguage}-${currentLanguage.toUpperCase()}`;

				return {
					id: achievement.id,
					name: achievement.name,
					description: achievement.description,
					icon: IconComponent || Star, // Fallback to Star if icon not found
					earned: achievement.isEarned, // ✅ NEW: используем isEarned из БД
					rarity: achievement.rarity, // ✅ NEW: rarity из БД (common/rare/epic/legendary)
					earnedDate: achievement.earnedAt
						? new Date(achievement.earnedAt).toLocaleDateString(locale, {
								day: 'numeric',
								month: 'short',
								year: 'numeric',
							})
						: undefined, // ✅ NEW: форматируем дату
					progress: achievement.progress || 0, // ✅ NEW: прогресс 0-100 из БД (default 0)
				};
			}),
		[achievements, currentLanguage] // ✅ FIXED: Added currentLanguage dependency
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
					<h1 className="mb-1 font-semibold text-2xl text-foreground">
						{t('level', 'Уровень')} {userStats.level}
					</h1>
					<p className="text-muted-foreground">{t('achievement_master', 'Мастер достижений')}</p>
				</div>

				<div className="mb-6 grid grid-cols-4 gap-4">
					<div className="text-center">
						<div className="mb-1 font-semibold text-2xl text-foreground">
							{userStats.totalEntries}
						</div>
						<div className="text-muted-foreground text-sm">
							{t('achievements.stats.entries', 'Записей')}
						</div>
					</div>
					<div className="text-center">
						<div className="mb-1 font-semibold text-2xl text-foreground">
							{userStats.totalBadges}
						</div>
						<div className="text-muted-foreground text-sm">
							{t('achievements.stats.badges', 'Наград')}
						</div>
					</div>
					<div className="text-center">
						<div className="mb-1 font-semibold text-2xl text-foreground">
							{userStats.currentStreak}
						</div>
						<div className="text-muted-foreground text-sm">
							{t('achievements.stats.days_streak', 'Дней подряд')}
						</div>
					</div>
					<div className="text-center">
						<div className="mb-1 font-semibold text-2xl text-foreground">
							{userStats.longestStreak}
						</div>
						<div className="text-muted-foreground text-sm">
							{t('achievements.stats.record', 'Рекорд')}
						</div>
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-muted-foreground text-sm">
						<span>
							{t('achievements.to_level', 'До уровня')} {userStats.level + 1}
						</span>
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

			{/* Tabs */}
			<div className="border-border border-b bg-card px-4 transition-colors duration-300">
				<div className="flex gap-4">
					<button
						type="button"
						className={`relative pb-3 pt-4 font-medium text-sm transition-colors duration-200 ${
							activeTab === 'all'
								? 'text-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
						onClick={() => setActiveTab('all')}
					>
						{t('achievements.tabs.all', 'Все')}
						{activeTab === 'all' && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
						)}
					</button>
					<button
						type="button"
						className={`relative pb-3 pt-4 font-medium text-sm transition-colors duration-200 ${
							activeTab === 'earned'
								? 'text-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
						onClick={() => setActiveTab('earned')}
					>
						{t('achievements.tabs.earned', 'Полученные')} ({earnedCount})
						{activeTab === 'earned' && (
							<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
						)}
					</button>
				</div>
			</div>

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
