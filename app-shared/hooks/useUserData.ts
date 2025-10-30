/**
 * useUserData Hook for React Native
 *
 * Управление данными пользователя и статистикой
 * Адаптировано из PWA версии для React Native
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase/client';

export interface UserProfile {
	id: string;
	name: string;
	email: string;
	avatar: string | null;
	diaryName: string;
	diaryEmoji: string;
	createdAt: string;
}

export interface UserStats {
	totalEntries: number;
	currentStreak: number;
	longestStreak: number;
	totalAchievements: number;
	level: number;
	xp: number;
	nextLevelXp: number;
}

interface UseUserDataResult {
	profile: UserProfile | null;
	stats: UserStats | null;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

/**
 * Hook для работы с данными пользователя
 */
export function useUserData(userId: string | undefined): UseUserDataResult {
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [stats, setStats] = useState<UserStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Fetch user data
	const fetchUserData = useCallback(async () => {
		if (!userId) {
			setProfile(null);
			setStats(null);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			// Fetch profile
			const { data: profileData, error: profileError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', userId)
				.single();

			// If profile doesn't exist, create default profile
			if (profileError && profileError.code === 'PGRST116') {
				console.log('[useUserData] Profile not found, using default');
				const defaultProfile: UserProfile = {
					id: userId,
					name: 'Test User',
					email: 'test@example.com',
					avatar: 'https://cdn.shadcnstudio.com/ss-assets/avatar/avatar-1.png',
					diaryName: 'Мой дневник',
					diaryEmoji: '🏆',
					createdAt: new Date().toISOString(),
				};
				setProfile(defaultProfile);
			} else if (profileError) {
				throw profileError;
			} else {
				// Convert to camelCase
				const userProfile: UserProfile = {
					id: profileData.id,
					name: profileData.name,
					email: profileData.email,
					avatar: profileData.avatar,
					diaryName: profileData.diary_name || 'Мой дневник',
					diaryEmoji: profileData.diary_emoji || '🏆',
					createdAt: profileData.created_at,
				};
				setProfile(userProfile);
			}

			// Fetch stats (calculate from entries)
			const { data: entriesData, error: entriesError } = await supabase
				.from('entries')
				.select('*')
				.eq('user_id', userId);

			if (entriesError) {
				throw entriesError;
			}

			// Calculate stats
			const totalEntries = entriesData?.length || 0;
			const totalAchievements = entriesData?.filter((e: any) => e.is_achievement).length || 0;

			// Calculate streak (simplified)
			const currentStreak = calculateStreak(entriesData || []);
			const longestStreak = currentStreak; // Simplified for now

			// Calculate level and XP
			const xp = totalEntries * 10 + totalAchievements * 50;
			const level = Math.floor(xp / 100) + 1;
			const nextLevelXp = level * 100;

			const userStats: UserStats = {
				totalEntries,
				currentStreak,
				longestStreak,
				totalAchievements,
				level,
				xp,
				nextLevelXp,
			};

			setStats(userStats);
		} catch (err) {
			console.error('[useUserData] Error fetching user data:', err);
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	}, [userId]);

	// Initial fetch
	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);

	// Real-time subscription for profile
	useEffect(() => {
		if (!userId) return;

		const channel = supabase
			.channel(`profile:${userId}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'profiles',
					filter: `id=eq.${userId}`,
				},
				(payload) => {
					console.log('[useUserData] Profile updated:', payload);
					fetchUserData();
				}
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [userId, fetchUserData]);

	// Update profile
	const updateProfile = useCallback(
		async (updates: Partial<UserProfile>): Promise<void> => {
			if (!userId) {
				throw new Error('User ID is required');
			}

			try {
				const { error: updateError } = await supabase
					.from('profiles')
					.update({
						name: updates.name,
						avatar: updates.avatar,
						diary_name: updates.diaryName,
						diary_emoji: updates.diaryEmoji,
					})
					.eq('id', userId);

				if (updateError) {
					throw updateError;
				}

				// Update local state
				setProfile((prev) => (prev ? { ...prev, ...updates } : null));
			} catch (err) {
				console.error('[useUserData] Error updating profile:', err);
				throw err;
			}
		},
		[userId]
	);

	return {
		profile,
		stats,
		isLoading,
		error,
		refetch: fetchUserData,
		updateProfile,
	};
}

/**
 * Calculate current streak from entries
 * Simplified version - checks if user has entries in consecutive days
 */
function calculateStreak(entries: any[]): number {
	if (entries.length === 0) return 0;

	// Sort entries by date (newest first)
	const sortedEntries = [...entries].sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	);

	let streak = 0;
	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	for (const entry of sortedEntries) {
		const entryDate = new Date(entry.created_at);
		entryDate.setHours(0, 0, 0, 0);

		const daysDiff = Math.floor(
			(currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
		);

		if (daysDiff === streak) {
			streak++;
		} else if (daysDiff > streak) {
			break;
		}
	}

	return streak;
}
