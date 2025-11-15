/**
 * useHomeScreenData Hook
 *
 * Unified hook для загрузки всех данных HomeScreen в 1 запрос
 *
 * Заменяет 3 отдельных запроса:
 * - getUserStats()
 * - getMotivationCards()
 * - getEntries(limit=3)
 *
 * Ожидаемый результат:
 * - API requests: 3 → 1 (↓67%)
 * - FCP: 1500ms → 900-1050ms (↓30-40%)
 * - LCP: 2000ms → 1200-1400ms (↓30-40%)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getHomeScreenData, type HomeScreenData } from '@/shared/lib/api';
import { createClient } from '@/utils/supabase/client';

interface UseHomeScreenDataResult {
	data: HomeScreenData | null;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

/**
 * Hook для загрузки всех данных HomeScreen
 *
 * ✅ НОВОЕ: Добавлен Supabase Realtime subscription для автоматического обновления:
 * - entries: INSERT (новые записи) + UPDATE (AI анализ обновляет запись)
 * - motivation_cards: INSERT (новые карточки)
 *
 * @param userId - ID пользователя
 * @returns Данные HomeScreen, состояние загрузки, ошибки и функция refetch
 */
export function useHomeScreenData(userId: string | undefined): UseHomeScreenDataResult {
	const [data, setData] = useState<HomeScreenData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// ✅ FIX: Используем ref для хранения актуальной функции fetchData
	const fetchDataRef = useRef<(() => Promise<void>) | null>(null);

	// Fetch home screen data
	const fetchData = useCallback(async () => {
		if (!userId) {
			console.log('[useHomeScreenData] No userId provided, skipping fetch');
			setData(null);
			setIsLoading(false);
			return;
		}

		try {
			console.log('[useHomeScreenData] 🚀 Fetching unified data... userId:', userId);
			setIsLoading(true);
			setError(null);

			const result = await getHomeScreenData(userId);

			console.log('[useHomeScreenData] ✅ Success:', {
				totalEntries: result.stats.totalEntries,
				motivationCards: result.motivationCards.length,
				recentEntries: result.recentEntries.length,
			});

			setData(result);
		} catch (err: any) {
			console.error('[useHomeScreenData] ❌ Error:', err);
			setError(err);
		} finally {
			setIsLoading(false);
		}
	}, [userId]);

	// ✅ FIX: Обновляем ref при каждом изменении fetchData
	useEffect(() => {
		fetchDataRef.current = fetchData;
		console.log('[useHomeScreenData] 🔗 Updated fetchDataRef.current');
	}, [fetchData]);

	// Fetch data on mount
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// ✅ НОВОЕ: Real-time subscription для автоматического обновления
	useEffect(() => {
		if (!userId || userId === 'anonymous') {
			console.log('[useHomeScreenData] No userId, skipping real-time subscription');
			return;
		}

		console.log('[useHomeScreenData] Setting up real-time subscription for user:', userId);

		// ✅ КРИТИЧНО: Создаем ОДИН Supabase клиент для realtime подписки
		const supabase = createClient();

		const channel = supabase
			.channel(`home-screen:${userId}`)
			.on(
				'postgres_changes',
				{
					event: 'INSERT', // Слушаем INSERT (новые записи)
					schema: 'public',
					table: 'entries',
					filter: `user_id=eq.${userId}`,
				},
				(payload) => {
					console.log('[useHomeScreenData] 🔔 New entry created, reloading data:', payload);

					// Перезагружаем данные при создании новой записи
					if (fetchDataRef.current) {
						console.log('[useHomeScreenData] 🔄 Reloading home screen data...');
						fetchDataRef.current();
					} else {
						console.error('[useHomeScreenData] ❌ fetchDataRef.current is null!');
					}
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'UPDATE', // ✅ НОВОЕ: Слушаем UPDATE (AI анализ обновляет запись)
					schema: 'public',
					table: 'entries',
					filter: `user_id=eq.${userId}`,
				},
				(payload) => {
					console.log(
						'[useHomeScreenData] 🔔 Entry updated (AI analysis), reloading data:',
						payload
					);

					// Перезагружаем данные при обновлении записи (AI анализ)
					if (fetchDataRef.current) {
						console.log('[useHomeScreenData] 🔄 Reloading home screen data...');
						fetchDataRef.current();
					} else {
						console.error('[useHomeScreenData] ❌ fetchDataRef.current is null!');
					}
				}
			)
			.on(
				'postgres_changes',
				{
					event: 'INSERT', // ✅ НОВОЕ: Слушаем INSERT на motivation_cards
					schema: 'public',
					table: 'motivation_cards',
					filter: `user_id=eq.${userId}`,
				},
				(payload) => {
					console.log(
						'[useHomeScreenData] 🔔 New motivation card created, reloading data:',
						payload
					);

					// Перезагружаем данные при создании новой карточки
					if (fetchDataRef.current) {
						console.log('[useHomeScreenData] 🔄 Reloading home screen data...');
						fetchDataRef.current();
					} else {
						console.error('[useHomeScreenData] ❌ fetchDataRef.current is null!');
					}
				}
			)
			.subscribe((status) => {
				console.log('[useHomeScreenData] 📡 Subscription status:', status);
				if (status === 'SUBSCRIBED') {
					console.log('[useHomeScreenData] ✅ Successfully subscribed to real-time updates');
				} else if (status === 'CHANNEL_ERROR') {
					console.error('[useHomeScreenData] ❌ Channel error!');
				} else if (status === 'TIMED_OUT') {
					console.error('[useHomeScreenData] ❌ Subscription timed out!');
				}
			});

		return () => {
			console.log('[useHomeScreenData] Cleaning up real-time subscription');
			supabase.removeChannel(channel);
		};
	}, [userId]); // ✅ FIX: Только userId в dependencies, fetchData через ref

	return {
		data,
		isLoading,
		error,
		refetch: fetchData,
	};
}
