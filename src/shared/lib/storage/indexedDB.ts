/**
 * IndexedDB Manager for UNITY-v2
 *
 * Provides robust offline-first caching using IndexedDB
 * Fallback to localStorage if IndexedDB is not available
 *
 * @author UNITY Team
 * @date 2025-11-15
 */

import { type DBSchema, type IDBPDatabase, openDB } from 'idb';

// Database schema
interface UnityDB extends DBSchema {
	motivation_cards: {
		key: string; // userId
		value: {
			cards: any[];
			timestamp: number;
			ttl: number;
		};
	};
	entries: {
		key: string; // entryId
		value: any;
	};
	user_data: {
		key: string; // userId
		value: {
			data: any;
			timestamp: number;
			ttl: number;
		};
	};
}

const DB_NAME = 'unity_cache';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<UnityDB> | null = null;

/**
 * Initialize IndexedDB
 */
async function getDB(): Promise<IDBPDatabase<UnityDB>> {
	if (dbInstance) {
		return dbInstance;
	}

	try {
		dbInstance = await openDB<UnityDB>(DB_NAME, DB_VERSION, {
			upgrade(db) {
				// Create object stores if they don't exist
				if (!db.objectStoreNames.contains('motivation_cards')) {
					db.createObjectStore('motivation_cards');
				}
				if (!db.objectStoreNames.contains('entries')) {
					db.createObjectStore('entries');
				}
				if (!db.objectStoreNames.contains('user_data')) {
					db.createObjectStore('user_data');
				}
			},
		});

		console.log('[IndexedDB] ✅ Database initialized');
		return dbInstance;
	} catch (error) {
		console.error('[IndexedDB] ❌ Failed to initialize database:', error);
		throw error;
	}
}

/**
 * Cache motivation cards for a user
 */
export async function cacheMotivationCards(
	userId: string,
	cards: any[],
	ttl = 5 * 60 * 1000 // 5 minutes default
): Promise<void> {
	try {
		const db = await getDB();
		await db.put(
			'motivation_cards',
			{
				cards,
				timestamp: Date.now(),
				ttl,
			},
			userId
		);

		console.log(`[IndexedDB] 💾 Cached ${cards.length} motivation cards for user: ${userId}`);
	} catch (error) {
		console.error('[IndexedDB] ❌ Failed to cache motivation cards:', error);
		// Fallback to localStorage
		try {
			localStorage.setItem(
				`unity_idb_fallback_motivations_${userId}`,
				JSON.stringify({ cards, timestamp: Date.now(), ttl })
			);
			console.log('[IndexedDB] 💾 Fallback: Cached to localStorage');
		} catch (fallbackError) {
			console.error('[IndexedDB] ❌ Fallback also failed:', fallbackError);
		}
	}
}

/**
 * Get cached motivation cards for a user
 */
export async function getCachedMotivationCards(
	userId: string,
	maxAge?: number
): Promise<any[] | null> {
	try {
		const db = await getDB();
		const cached = await db.get('motivation_cards', userId);

		if (!cached) {
			console.log(`[IndexedDB] ❌ No cached cards for user: ${userId}`);
			return null;
		}

		const age = Date.now() - cached.timestamp;
		const effectiveMaxAge = maxAge || cached.ttl;

		if (age > effectiveMaxAge) {
			console.log(
				`[IndexedDB] 🗑️ Cache expired for user: ${userId}, age: ${Math.round(age / 1000)}s`
			);
			await db.delete('motivation_cards', userId);
			return null;
		}

		console.log(
			`[IndexedDB] ✅ Cache hit for user: ${userId}, age: ${Math.round(age / 1000)}s, cards: ${cached.cards.length}`
		);
		return cached.cards;
	} catch (error) {
		console.error('[IndexedDB] ❌ Failed to get cached cards:', error);
		// Fallback to localStorage
		try {
			const fallback = localStorage.getItem(`unity_idb_fallback_motivations_${userId}`);
			if (fallback) {
				const parsed = JSON.parse(fallback);
				const age = Date.now() - parsed.timestamp;
				if (age <= (maxAge || parsed.ttl)) {
					console.log('[IndexedDB] ✅ Fallback: Retrieved from localStorage');
					return parsed.cards;
				}
			}
		} catch (fallbackError) {
			console.error('[IndexedDB] ❌ Fallback also failed:', fallbackError);
		}
		return null;
	}
}

/**
 * Clear all cached data
 */
export async function clearAllCache(): Promise<void> {
	try {
		const db = await getDB();
		await db.clear('motivation_cards');
		await db.clear('entries');
		await db.clear('user_data');
		console.log('[IndexedDB] 🗑️ Cleared all cache');
	} catch (error) {
		console.error('[IndexedDB] ❌ Failed to clear cache:', error);
	}
}
