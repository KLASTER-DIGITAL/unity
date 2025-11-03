/**
 * useEntries Hook for PWA
 *
 * Управление записями дневника с real-time updates через Supabase Realtime
 * Адаптировано из React Native версии (app-shared/hooks/useEntries.ts)
 *
 * Features:
 * - Real-time subscription на таблицу entries
 * - Автоматическое обновление UI при INSERT/UPDATE/DELETE
 * - Оптимистичное обновление (optimistic updates)
 * - Кэширование данных
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DiaryEntry } from '@/shared/lib/api';
import { createClient } from '@/utils/supabase/client';

interface UseEntriesResult {
	entries: DiaryEntry[];
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

/**
 * Hook для работы с записями дневника с real-time updates
 *
 * @param userId - ID пользователя
 * @param limit - Максимальное количество записей (по умолчанию: все)
 * @returns Записи, состояние загрузки, ошибки и функция refetch
 */
export function useEntries(userId: string | undefined, limit?: number): UseEntriesResult {
	const [entries, setEntries] = useState<DiaryEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// ✅ FIX: Используем useRef для стабильной ссылки на fetchEntries
	// Это предотвращает повторное создание Realtime subscription при каждом обновлении
	const fetchEntriesRef = useRef<(() => Promise<void>) | null>(null);

	// Fetch entries from Supabase
	const fetchEntries = useCallback(async () => {
		if (!userId) {
			setEntries([]);
			setIsLoading(false);
			return;
		}

		try {
			setIsLoading(true);
			const supabase = createClient();

			let query = supabase
				.from('entries')
				.select('*')
				.eq('user_id', userId)
				.order('created_at', { ascending: false });

			if (limit) {
				query = query.limit(limit);
			}

			const { data, error: fetchError } = await query;

			if (fetchError) {
				throw fetchError;
			}

			// Convert to camelCase
			const formattedEntries: DiaryEntry[] = (data || []).map((entry: any) => ({
				id: entry.id,
				userId: entry.user_id,
				text: entry.text,
				sentiment: entry.sentiment,
				category: entry.category,
				mood: entry.mood,
				isFirstEntry: entry.is_first_entry,
				media: entry.media,
				aiReply: entry.ai_reply,
				aiSummary: entry.ai_summary,
				aiInsight: entry.ai_insight,
				isAchievement: entry.is_achievement,
				tags: entry.tags,
				streakDay: entry.streak_day,
				focusArea: entry.focus_area,
				createdAt: entry.created_at,
				voiceUrl: entry.voice_url,
				mediaUrl: entry.media_url,
			}));

			console.log('[useEntries] Loaded entries:', formattedEntries.length);
			setEntries(formattedEntries);
			setError(null);
		} catch (err) {
			console.error('[useEntries] Error fetching entries:', err);
			setError(err as Error);
		} finally {
			setIsLoading(false);
		}
	}, [userId, limit]);

	// ✅ FIX: Обновляем ref при каждом изменении fetchEntries
	useEffect(() => {
		fetchEntriesRef.current = fetchEntries;
	}, [fetchEntries]);

	// Initial fetch
	useEffect(() => {
		fetchEntries();
	}, [fetchEntries]);

	// ✅ КРИТИЧНО: Real-time subscription для автоматического обновления UI
	// FIX: Убираем fetchEntries из dependencies, используем fetchEntriesRef.current
	// Это предотвращает повторное создание subscription при каждом обновлении
	useEffect(() => {
		if (!userId) return;

		const supabase = createClient();

		console.log('[useEntries] Setting up real-time subscription for user:', userId);

		const channel = supabase
			.channel(`entries:${userId}`)
			.on(
				'postgres_changes',
				{
					event: '*', // Слушаем INSERT, UPDATE, DELETE
					schema: 'public',
					table: 'entries',
					filter: `user_id=eq.${userId}`,
				},
				(payload) => {
					console.log('[useEntries] Real-time update received:', payload);

					// ✅ FIX: Используем fetchEntriesRef.current вместо fetchEntries
					// Это гарантирует что subscription НЕ пересоздается при каждом обновлении
					if (fetchEntriesRef.current) {
						fetchEntriesRef.current();
					}
				}
			)
			.subscribe((status) => {
				console.log('[useEntries] Subscription status:', status);
			});

		return () => {
			console.log('[useEntries] Cleaning up real-time subscription');
			supabase.removeChannel(channel);
		};
	}, [userId]); // ✅ FIX: Только userId в dependencies, НЕ fetchEntries!

	return {
		entries,
		isLoading,
		error,
		refetch: fetchEntries,
	};
}
