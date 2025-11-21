/**
 * Global Store для статистики пользователя
 * Обеспечивает единый источник истины для всех экранов
 * Использует Zustand для state management и Supabase Realtime для автообновления
 */

import { create } from 'zustand';
import { createClient } from '@/utils/supabase/client';

interface UserStats {
	totalEntries: number;
	currentStreak: number;
	longestStreak: number;
	totalBadges: number;
	level: number;
	nextLevelProgress: number;
}

interface StatsStore {
	// State
	stats: Record<string, UserStats>; // userId -> stats
	isLoading: Record<string, boolean>;
	lastUpdated: Record<string, number>;
	subscriptions: Record<string, () => void>; // userId -> cleanup function

	// Actions
	fetchStats: (userId: string, forceRefresh?: boolean) => Promise<void>;
	subscribeToUpdates: (userId: string) => () => void;
	clearStats: (userId: string) => void;
}

// Время жизни кэша - 30 секунд
const CACHE_TTL = 30 * 1000;

export const useStatsStore = create<StatsStore>((set, get) => ({
	stats: {},
	isLoading: {},
	lastUpdated: {},
	subscriptions: {},

	/**
	 * Загрузка статистики пользователя с умным кэшированием
	 */
	fetchStats: async (userId: string, forceRefresh = false) => {
		const now = Date.now();
		const lastUpdate = get().lastUpdated[userId] || 0;

		// Используем кэш если данные свежие (< 30 сек) и не форсируем обновление
		if (!forceRefresh && now - lastUpdate < CACHE_TTL) {
			console.log('[StatsStore] Using cached stats for', userId);
			return;
		}

		console.log('[StatsStore] 🔄 Fetching fresh stats for', userId);
		set((state) => ({
			isLoading: { ...state.isLoading, [userId]: true },
		}));

		try {
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				throw new Error('No session');
			}

			// Вызываем Edge Function для расчета статистики
			const response = await fetch(`${supabase.supabaseUrl}/functions/v1/achievements-calculate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.access_token}`,
				},
				body: JSON.stringify({ user_id: userId }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data?.stats) {
				const stats: UserStats = {
					totalEntries: data.stats.totalEntries ?? 0,
					currentStreak: data.stats.currentStreak ?? 0,
					longestStreak: data.stats.longestStreak ?? 0,
					totalBadges: data.stats.totalBadges ?? 0,
					level: data.stats.level ?? 1,
					nextLevelProgress: data.stats.nextLevelProgress ?? 0,
				};

				console.log('[StatsStore] ✅ Loaded stats:', stats);

				set((state) => ({
					stats: { ...state.stats, [userId]: stats },
					lastUpdated: { ...state.lastUpdated, [userId]: now },
					isLoading: { ...state.isLoading, [userId]: false },
				}));
			} else {
				throw new Error('Invalid response format');
			}
		} catch (error) {
			console.error('[StatsStore] ❌ Error fetching stats:', error);
			set((state) => ({
				isLoading: { ...state.isLoading, [userId]: false },
			}));
		}
	},

	/**
	 * Подписка на real-time обновления для автоматической синхронизации
	 */
	subscribeToUpdates: (userId: string) => {
		// Проверяем есть ли уже активная подписка
		const existingCleanup = get().subscriptions[userId];
		if (existingCleanup) {
			console.log('[StatsStore] Already subscribed for', userId);
			return existingCleanup;
		}

		console.log('[StatsStore] 🔔 Setting up real-time subscription for', userId);

		const supabase = createClient();
		const channel = supabase
			.channel(`stats-store:${userId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'entries',
					filter: `user_id=eq.${userId}`,
				},
				(payload) => {
					console.log('[StatsStore] 🔔 Entry changed, invalidating cache:', payload.eventType);

					// Инвалидируем кэш и перезагружаем
					get().fetchStats(userId, true);
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
						'[StatsStore] 🔔 Achievement changed, invalidating cache:',
						payload.eventType
					);

					// Инвалидируем кэш и перезагружаем
					get().fetchStats(userId, true);
				}
			)
			.subscribe((status) => {
				if (status === 'SUBSCRIBED') {
					console.log('[StatsStore] ✅ Successfully subscribed to real-time updates');
				} else if (status === 'CHANNEL_ERROR') {
					console.error('[StatsStore] ❌ Channel error!');
				} else if (status === 'TIMED_OUT') {
					console.error('[StatsStore] ❌ Subscription timed out!');
				}
			});

		// Функция cleanup
		const cleanup = () => {
			console.log('[StatsStore] 🔕 Unsubscribing from real-time updates for', userId);
			supabase.removeChannel(channel);

			// Удаляем из списка активных подписок
			set((state) => {
				const newSubscriptions = { ...state.subscriptions };
				delete newSubscriptions[userId];
				return { subscriptions: newSubscriptions };
			});
		};

		// Сохраняем cleanup функцию
		set((state) => ({
			subscriptions: { ...state.subscriptions, [userId]: cleanup },
		}));

		return cleanup;
	},

	/**
	 * Очистка данных пользователя
	 */
	clearStats: (userId: string) => {
		console.log('[StatsStore] Clearing stats for', userId);

		// Отписываемся от обновлений
		const cleanup = get().subscriptions[userId];
		if (cleanup) {
			cleanup();
		}

		// Удаляем данные
		set((state) => {
			const newStats = { ...state.stats };
			const newIsLoading = { ...state.isLoading };
			const newLastUpdated = { ...state.lastUpdated };
			const newSubscriptions = { ...state.subscriptions };

			delete newStats[userId];
			delete newIsLoading[userId];
			delete newLastUpdated[userId];
			delete newSubscriptions[userId];

			return {
				stats: newStats,
				isLoading: newIsLoading,
				lastUpdated: newLastUpdated,
				subscriptions: newSubscriptions,
			};
		});
	},
}));

/**
 * Hook для использования статистики конкретного пользователя
 */
export function useUserStats(userId: string | undefined) {
	const stats = useStatsStore((state) => (userId ? state.stats[userId] : undefined));
	const isLoading = useStatsStore((state) => (userId ? state.isLoading[userId] : false));
	const fetchStats = useStatsStore((state) => state.fetchStats);
	const subscribeToUpdates = useStatsStore((state) => state.subscribeToUpdates);

	return {
		stats: stats || {
			totalEntries: 0,
			currentStreak: 0,
			longestStreak: 0,
			totalBadges: 0,
			level: 1,
			nextLevelProgress: 0,
		},
		isLoading: isLoading || false,
		fetchStats,
		subscribeToUpdates,
	};
}
