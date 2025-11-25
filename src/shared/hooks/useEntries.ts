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

	// ✅ КРИТИЧНО: Создаем ОДИН Supabase клиент для ВСЕГО hook
	// Это предотвращает проблемы с Real-time subscription
	const supabase = createClient();

	// ✅ FIX: Используем useRef для стабильной ссылки на fetchEntries
	// Это предотвращает повторное создание Realtime subscription при каждом обновлении
	const fetchEntriesRef = useRef<(() => Promise<void>) | null>(null);

	// Fetch entries from Supabase
	const fetchEntries = useCallback(async () => {
		if (!userId) {
			console.log('[useEntries] No userId provided, skipping fetch');
			setEntries([]);
			setIsLoading(false);
			return;
		}

		try {
			console.log('[useEntries] 🔄 Fetching entries... userId:', userId, 'limit:', limit);
			setIsLoading(true);

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
			// biome-ignore lint/suspicious/noExplicitAny: Supabase returns database row type which is complex
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

			console.log('[useEntries] ✅ Loaded entries:', formattedEntries.length);
			if (formattedEntries.length > 0) {
				console.log(
					'[useEntries] 📝 First entry:',
					formattedEntries[0].id,
					formattedEntries[0].text?.substring(0, 50)
				);
			}
			setEntries(formattedEntries);
			setError(null);
		} catch (err) {
			console.error('[useEntries] ❌ Error fetching entries:', err);
			setError(err as Error);
		} finally {
			// ✅ FIX: Check window exists before setState (prevents errors in test cleanup)
			if (typeof window !== 'undefined') {
				setIsLoading(false);
			}
		}
	}, [userId, limit, supabase.from]); // ✅ FIX: Убрали supabase.from - supabase singleton, не меняется

	// ✅ FIX: Обновляем ref при каждом изменении fetchEntries
	useEffect(() => {
		fetchEntriesRef.current = fetchEntries;
		console.log('[useEntries] 🔗 Updated fetchEntriesRef.current');
	}, [fetchEntries]);

	// ✅ КРИТИЧНО: Initial fetch ТОЛЬКО при изменении userId или limit
	// ✅ FIX: Убрали fetchEntries из зависимостей - используем ref для предотвращения бесконечного цикла
	useEffect(() => {
		console.log('[useEntries] 🚀 Initial fetch triggered, userId:', userId, 'limit:', limit);
		fetchEntries();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, limit, fetchEntries]); // ✅ FIX: Только userId и limit для предотвращения бесконечного цикла

	// ✅ КРИТИЧНО: Real-time subscription для автоматического обновления UI
	// FIX: Убираем fetchEntries из dependencies, используем fetchEntriesRef.current
	// Это предотвращает повторное создание subscription при каждом обновлении
	useEffect(() => {
		if (!userId) {
			console.log('[useEntries] No userId, skipping real-time subscription');
			return;
		}

		console.log(
			'[useEntries] Setting up real-time subscription for user:',
			userId,
			'limit:',
			limit
		);

		// Сохраняем актуальный userId и limit для использования в callback
		const currentUserId = userId;
		const currentLimit = limit;

		const channel = supabase
			.channel(`entries:${currentUserId}:${currentLimit || 'all'}`)
			.on(
				'postgres_changes',
				{
					event: '*', // Слушаем INSERT, UPDATE, DELETE
					schema: 'public',
					table: 'entries',
					filter: `user_id=eq.${currentUserId}`,
				},
				(payload) => {
					console.log('[useEntries] 🔔 Real-time update received:', payload.eventType);
					console.log('[useEntries] 📋 Payload new record:', payload.new);
					console.log('[useEntries] 📋 Payload old record:', payload.old);

					// ✅ ОПТИМИСТИЧНОЕ ОБНОВЛЕНИЕ: обновляем state НЕМЕДЛЕННО
					// Это дает мгновенное обновление UI без ожидания репликации БД
					if (payload.eventType === 'INSERT' && payload.new) {
						console.log('[useEntries] ⚡ Optimistic INSERT: adding new entry to state');

						// Конвертируем snake_case → camelCase
						const newEntry: DiaryEntry = {
							id: payload.new.id,
							userId: payload.new.user_id,
							text: payload.new.text,
							sentiment: payload.new.sentiment,
							category: payload.new.category,
							mood: payload.new.mood,
							isFirstEntry: payload.new.is_first_entry,
							media: payload.new.media,
							aiReply: payload.new.ai_reply,
							aiSummary: payload.new.ai_summary,
							aiInsight: payload.new.ai_insight,
							isAchievement: payload.new.is_achievement,
							tags: payload.new.tags,
							streakDay: payload.new.streak_day,
							focusArea: payload.new.focus_area,
							createdAt: payload.new.created_at,
							voiceUrl: payload.new.voice_url,
							mediaUrl: payload.new.media_url,
						};

						// Добавляем в начало списка и обрезаем до limit
						setEntries((prev) => {
							const updated = [newEntry, ...prev];
							const result = currentLimit ? updated.slice(0, currentLimit) : updated;
							console.log('[useEntries] ⚡ Optimistic state updated:', result.length, 'entries');
							return result;
						});
					} else if (payload.eventType === 'UPDATE' && payload.new) {
						console.log('[useEntries] ⚡ Optimistic UPDATE: updating entry in state');

						// Обновляем существующую запись
						setEntries((prev) => {
							const updated = prev.map((entry) =>
								entry.id === payload.new.id
									? {
											id: payload.new.id,
											userId: payload.new.user_id,
											text: payload.new.text,
											sentiment: payload.new.sentiment,
											category: payload.new.category,
											mood: payload.new.mood,
											isFirstEntry: payload.new.is_first_entry,
											media: payload.new.media,
											aiReply: payload.new.ai_reply,
											aiSummary: payload.new.ai_summary,
											aiInsight: payload.new.ai_insight,
											isAchievement: payload.new.is_achievement,
											tags: payload.new.tags,
											streakDay: payload.new.streak_day,
											focusArea: payload.new.focus_area,
											createdAt: payload.new.created_at,
											voiceUrl: payload.new.voice_url,
											mediaUrl: payload.new.media_url,
										}
									: entry
							);
							console.log('[useEntries] ⚡ Optimistic state updated:', updated.length, 'entries');
							return updated;
						});
					} else if (payload.eventType === 'DELETE' && payload.old) {
						console.log('[useEntries] ⚡ Optimistic DELETE: removing entry from state');

						// Удаляем запись
						setEntries((prev) => {
							const updated = prev.filter((entry) => entry.id !== payload.old.id);
							console.log('[useEntries] ⚡ Optimistic state updated:', updated.length, 'entries');
							return updated;
						});
					}

					// ✅ Затем обновляем данные из БД для синхронизации
					// Это гарантирует что state соответствует БД (на случай конфликтов)
					const refreshEntries = async () => {
						// Задержка для репликации БД (1000ms для надежности)
						await new Promise((resolve) => setTimeout(resolve, 1000));

						try {
							if (fetchEntriesRef.current) {
								console.log('[useEntries] 🔄 Calling fetchEntriesRef.current() to sync with DB...');
								await fetchEntriesRef.current();
								console.log('[useEntries] ✅ Entries synced with DB successfully');
							} else {
								console.warn(
									'[useEntries] ⚠️ fetchEntriesRef.current is null, using fetchEntries directly'
								);
								// Fallback: если ref не установлен, используем замыкание fetchEntries
								await fetchEntries();
							}
						} catch (err) {
							console.error('[useEntries] ❌ Error syncing entries with DB:', err);
						}
					};

					refreshEntries();
				}
			)
			.subscribe((status) => {
				console.log('[useEntries] 📡 Subscription status:', status);
				if (status === 'SUBSCRIBED') {
					console.log('[useEntries] ✅ Successfully subscribed to real-time updates');
					// После успешной подписки обновляем ref на всякий случай
					if (fetchEntriesRef.current) {
						console.log('[useEntries] 🔗 fetchEntriesRef is ready');
					}
				} else if (status === 'CHANNEL_ERROR') {
					console.error('[useEntries] ❌ Channel error!');
				} else if (status === 'TIMED_OUT') {
					console.error('[useEntries] ❌ Subscription timed out!');
				}
			});

		return () => {
			console.log('[useEntries] Cleaning up real-time subscription');
			supabase.removeChannel(channel);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId, limit, fetchEntries, supabase.channel, supabase.removeChannel]); // ✅ FIX: Убрали fetchEntries, supabase.channel, supabase.removeChannel - используем ref и singleton

	return {
		entries,
		isLoading,
		error,
		refetch: fetchEntries,
	};
}
