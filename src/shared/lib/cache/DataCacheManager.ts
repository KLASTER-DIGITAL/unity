/**
 * Data Cache Manager for UNITY-v2
 *
 * Provides cross-platform data caching with TTL support
 * Works on both Web (localStorage) and React Native (AsyncStorage)
 *
 * @author UNITY Team
 * @date 2025-11-08
 */

import { storage } from '@/shared/lib/platform/storage';

export interface CacheEntry<T> {
	data: T;
	timestamp: number;
	ttl: number; // milliseconds
}

const DEFAULT_PREFIX = 'unity_data_cache_';

/**
 * Data Cache Manager for application data
 */
export class DataCacheManager {
	private static prefix = DEFAULT_PREFIX;

	/**
	 * Get cached data
	 */
	static async get<T>(key: string): Promise<T | null> {
		try {
			const fullKey = `${DataCacheManager.prefix}${key}`;
			const cached = await storage.getItem(fullKey);

			if (!cached) {
				return null;
			}

			const entry: CacheEntry<T> = JSON.parse(cached);
			const age = Date.now() - entry.timestamp;

			// Check if cache is expired
			if (age > entry.ttl) {
				console.log(`[DataCacheManager] 🗑️ Cache expired for key: ${key}`);
				await storage.removeItem(fullKey);
				return null;
			}

			console.log(
				`[DataCacheManager] ✅ Cache hit for key: ${key}, age: ${Math.round(age / 1000)}s`
			);
			return entry.data;
		} catch (error) {
			console.error(`[DataCacheManager] ❌ Error getting cache for key: ${key}`, error);
			return null;
		}
	}

	/**
	 * Set cache data
	 */
	static async set<T>(key: string, data: T, ttl: number): Promise<void> {
		try {
			const fullKey = `${DataCacheManager.prefix}${key}`;
			const entry: CacheEntry<T> = {
				data,
				timestamp: Date.now(),
				ttl,
			};

			await storage.setItem(fullKey, JSON.stringify(entry));
			console.log(
				`[DataCacheManager] 💾 Cached key: ${key}, TTL: ${Math.round(ttl / 1000 / 60)}min`
			);
		} catch (error) {
			console.error(`[DataCacheManager] ❌ Error setting cache for key: ${key}`, error);
		}
	}

	/**
	 * Remove cache entry
	 */
	static async remove(key: string): Promise<void> {
		try {
			const fullKey = `${DataCacheManager.prefix}${key}`;
			await storage.removeItem(fullKey);
			console.log(`[DataCacheManager] 🗑️ Removed cache for key: ${key}`);
		} catch (error) {
			console.error(`[DataCacheManager] ❌ Error removing cache for key: ${key}`, error);
		}
	}

	/**
	 * Clear all cache entries
	 */
	static async clear(): Promise<void> {
		try {
			await storage.clear();
			console.log(`[DataCacheManager] 🗑️ Cleared all data cache`);
		} catch (error) {
			console.error(`[DataCacheManager] ❌ Error clearing cache`, error);
		}
	}
}

// Cache TTL constants (in milliseconds)
export const DATA_CACHE_TTL = {
	PROFILE: 60 * 60 * 1000, // 1 hour
	CATEGORIES: 24 * 60 * 60 * 1000, // 24 hours
	MOTIVATIONS: 60 * 60 * 1000, // 1 hour
	STATS: 30 * 60 * 1000, // 30 minutes
	HOME_SCREEN: 60 * 60 * 1000, // 1 hour
	ENTRIES: 30 * 60 * 1000, // 30 minutes
} as const;
