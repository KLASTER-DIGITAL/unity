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

import { useCallback, useEffect, useState } from 'react';
import { getHomeScreenData, type HomeScreenData } from '@/shared/lib/api';

interface UseHomeScreenDataResult {
	data: HomeScreenData | null;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

/**
 * Hook для загрузки всех данных HomeScreen
 *
 * @param userId - ID пользователя
 * @returns Данные HomeScreen, состояние загрузки, ошибки и функция refetch
 */
export function useHomeScreenData(userId: string | undefined): UseHomeScreenDataResult {
	const [data, setData] = useState<HomeScreenData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

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

	// Fetch data on mount
	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		data,
		isLoading,
		error,
		refetch: fetchData,
	};
}
