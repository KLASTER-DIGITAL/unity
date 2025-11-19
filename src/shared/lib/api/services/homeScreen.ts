/**
 * Home Screen Data API
 *
 * Unified API для загрузки всех данных HomeScreen в 1 запрос
 *
 * Features:
 * - localStorage кэширование (1 час TTL)
 * - Instant FCP/LCP при повторных визитах
 * - Фоновое обновление кэша
 */

import { createClient } from '@/utils/supabase/client';
import type { DiaryEntry, MotivationCard, UserStats } from '../types';

export interface HomeScreenData {
	stats: UserStats;
	motivationCards: MotivationCard[];
	recentEntries: DiaryEntry[];
	timestamp: string;
}

// Cache configuration
const CACHE_KEY_PREFIX = 'unity_home_screen_v2_';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 час

/**
 * Load cached data from localStorage
 */
function loadCache(userId: string): HomeScreenData | null {
	try {
		const key = `${CACHE_KEY_PREFIX}${userId}`;
		const cached = localStorage.getItem(key);

		if (!cached) {
			return null;
		}

		const data: HomeScreenData = JSON.parse(cached);

		// Check if cache is expired
		const age = Date.now() - new Date(data.timestamp).getTime();
		if (age > CACHE_TTL_MS) {
			console.log('[HOME_SCREEN_DATA] 🗑️ Cache expired, removing');
			localStorage.removeItem(key);
			return null;
		}

		console.log('[HOME_SCREEN_DATA] ✅ Cache hit, age:', Math.round(age / 1000 / 60), 'min');
		return data;
	} catch (error) {
		console.error('[HOME_SCREEN_DATA] ❌ Error loading cache:', error);
		return null;
	}
}

/**
 * Save data to localStorage cache
 */
function saveCache(userId: string, data: HomeScreenData): void {
	try {
		const key = `${CACHE_KEY_PREFIX}${userId}`;
		localStorage.setItem(key, JSON.stringify(data));
		console.log('[HOME_SCREEN_DATA] 💾 Cache saved');
	} catch (error) {
		console.error('[HOME_SCREEN_DATA] ❌ Error saving cache:', error);
	}
}

/**
 * Get all home screen data in a single request
 *
 * Replaces 3 separate requests:
 * - getUserStats()
 * - getMotivationCards()
 * - getEntries(limit=3)
 *
 * Features:
 * - localStorage кэширование (1 час TTL)
 * - Instant FCP/LCP при повторных визитах
 * - Фоновое обновление кэша
 *
 * @param userId - User ID
 * @param useCache - Use localStorage cache (default: true)
 * @returns Home screen data
 */
export async function getHomeScreenData(userId: string, useCache = true): Promise<HomeScreenData> {
	// ✅ Try cache first
	if (useCache) {
		const cached = loadCache(userId);
		if (cached) {
			// Return cached data immediately, fetch fresh data in background
			console.log('[HOME_SCREEN_DATA] 🚀 Returning cached data, fetching fresh in background...');

			// Background refresh (don't await)
			fetchFreshData(userId).catch((err) => {
				console.error('[HOME_SCREEN_DATA] ❌ Background refresh failed:', err);
			});

			return cached;
		}
	}

	// ✅ No cache, fetch fresh data
	console.log('[HOME_SCREEN_DATA] 🚀 No cache, fetching fresh data...');
	return await fetchFreshData(userId);
}

/**
 * Invalidate cache for a user
 * Call this when data changes (new entry, new card, etc.)
 */
export function invalidateCache(userId: string): void {
	try {
		const key = `${CACHE_KEY_PREFIX}${userId}`;
		localStorage.removeItem(key);
		console.log('[HOME_SCREEN_DATA] 🗑️ Cache invalidated for user:', userId);
	} catch (error) {
		console.error('[HOME_SCREEN_DATA] ❌ Error invalidating cache:', error);
	}
}

/**
 * Fetch fresh data from Edge Function
 */
async function fetchFreshData(userId: string): Promise<HomeScreenData> {
	const supabase = createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session?.access_token) {
		throw new Error('No active session');
	}

	try {
		const response = await fetch(
			`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/home-screen-data`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${session.access_token}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error(`Edge Function returned ${response.status}`);
		}

		const data = await response.json();

		// Convert entries to camelCase
		const recentEntries: DiaryEntry[] = (data.recentEntries || []).map((entry: any) => ({
			id: entry.id,
			userId: entry.user_id,
			text: entry.text,
			sentiment: entry.sentiment,
			category: entry.category,
			mood: entry.mood,
			aiReply: entry.ai_reply,
			aiSummary: entry.ai_summary,
			aiInsight: entry.ai_insight,
			isAchievement: entry.is_achievement,
			tags: entry.tags,
			streakDay: entry.streak_day,
			createdAt: entry.created_at,
			updatedAt: entry.updated_at,
		}));

		// Convert motivation cards to camelCase
		const motivationCards: MotivationCard[] = (data.motivationCards || []).map((card: any) => ({
			id: card.id,
			userId: card.user_id,
			title: card.title,
			description: card.description,
			gradient: card.gradient,
			isRead: card.is_read,
			createdAt: card.created_at,
		}));

		const result: HomeScreenData = {
			stats: data.stats,
			motivationCards,
			recentEntries,
			timestamp: data.timestamp,
		};

		console.log('[HOME_SCREEN_DATA] ✅ Fresh data fetched:', {
			totalEntries: data.stats.totalEntries,
			motivationCards: motivationCards.length,
			recentEntries: recentEntries.length,
		});

		// ✅ Save to cache
		saveCache(userId, result);

		return result;
	} catch (error: any) {
		console.error('[HOME_SCREEN_DATA] ❌ Error:', error);
		throw new Error(`Failed to fetch home screen data: ${error.message}`);
	}
}
