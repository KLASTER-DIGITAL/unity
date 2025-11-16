import confetti from 'canvas-confetti';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { haptics } from '@/shared/lib/platform/haptics';
import { soundAdapter } from '@/shared/lib/platform/sound';
import { createClient } from '@/utils/supabase/client';

/**
 * Achievement from database
 */
export interface Achievement {
	id: string;
	name: string;
	description: string;
	icon: string;
	rarity: 'common' | 'rare' | 'epic' | 'legendary';
	progress: number;
	earnedAt: string | null;
	isEarned: boolean;
}

interface UseAchievementsResult {
	achievements: Achievement[];
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	earnedCount: number;
	totalCount: number;
}

/**
 * Hook для работы с достижениями пользователя из БД
 *
 * @param userId - ID пользователя
 * @returns Достижения, состояние загрузки, ошибки и функция refetch
 */
export function useAchievements(userId: string | undefined): UseAchievementsResult {
	const [achievements, setAchievements] = useState<Achievement[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const supabase = createClient();

	const fetchAchievements = useCallback(async () => {
		if (!userId) {
			console.log('[useAchievements] No userId provided, skipping fetch');
			setAchievements([]);
			setIsLoading(false);
			return;
		}

		try {
			console.log('[useAchievements] 🔄 Fetching achievements... userId:', userId);
			setIsLoading(true);

			// Вызываем helper функцию из БД
			const { data, error: fetchError } = await supabase.rpc('get_user_achievements_progress', {
				p_user_id: userId,
			});

			if (fetchError) {
				throw fetchError;
			}

			// Преобразуем snake_case в camelCase
			const formattedAchievements: Achievement[] = (data || []).map((item: any) => ({
				id: item.achievement_id,
				name: item.name,
				description: item.description,
				icon: item.icon,
				rarity: item.rarity,
				progress: item.progress,
				earnedAt: item.earned_at,
				isEarned: item.is_earned,
			}));

			console.log('[useAchievements] ✅ Loaded achievements:', formattedAchievements.length);
			console.log(
				'[useAchievements] 📊 Earned:',
				formattedAchievements.filter((a) => a.isEarned).length
			);

			setAchievements(formattedAchievements);
			setError(null);
		} catch (err) {
			console.error('[useAchievements] ❌ Error fetching achievements:', err);
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	}, [userId, supabase]);

	useEffect(() => {
		fetchAchievements();
	}, [fetchAchievements]);

	// ✅ NEW: Real-time подписка на изменения достижений
	useEffect(() => {
		if (!userId) return;

		console.log('[useAchievements] 🔔 Setting up real-time subscription for user:', userId);

		// Подписка на изменения в user_achievements
		const channel = supabase
			.channel(`achievements:${userId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'user_achievements',
					filter: `user_id=eq.${userId}`,
				},
				(payload) => {
					console.log('[useAchievements] 🔔 Real-time update:', payload);

					// Если достижение получено (INSERT или UPDATE с earned_at)
					if (
						payload.eventType === 'INSERT' ||
						(payload.eventType === 'UPDATE' && payload.new.earned_at)
					) {
						const newAchievement = payload.new;

						// ✅ NEW: Haptic feedback (вибрация на мобильных)
						haptics
							.trigger('success')
							.catch((err) => console.error('[useAchievements] Haptic error:', err));

						// ✅ NEW: Воспроизводим звук
						soundAdapter
							.play('/sounds/achievement.mp3', { volume: 0.5 })
							.catch((err) => console.error('[useAchievements] Sound error:', err));

						// Показываем toast notification
						toast.success('🎉 Новое достижение!', {
							description: `Вы получили: ${newAchievement.achievement_id}`,
							duration: 5000,
						});

						// Запускаем confetti
						confetti({
							particleCount: 100,
							spread: 70,
							origin: { y: 0.6 },
							colors: ['#FFD700', '#FFA500', '#FF6347'],
						});

						// Обновляем список достижений
						fetchAchievements();
					}
				}
			)
			.subscribe();

		// Cleanup при unmount
		return () => {
			console.log('[useAchievements] 🔕 Unsubscribing from real-time updates');
			supabase.removeChannel(channel);
		};
	}, [userId, supabase, fetchAchievements]);

	// Подсчет заработанных достижений
	const earnedCount = achievements.filter((a) => a.isEarned).length;
	const totalCount = achievements.length;

	return {
		achievements,
		isLoading,
		error,
		refetch: fetchAchievements,
		earnedCount,
		totalCount,
	};
}
