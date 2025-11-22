/**
 * Lazy Loading optimization for translations
 *
 * Features:
 * - Load translations only when needed
 * - Prefetch popular languages in background
 * - Priority-based loading queue
 * - Automatic cleanup of unused translations
 */

import { I18nAPI } from '../api';
import { TranslationCacheManager } from '../cache';
import type { LanguageCode, Translations } from '../types/TranslationKeys';

type LoadingTask = {
	language: LanguageCode;
	priority: 'high' | 'medium' | 'low';
	timestamp: number;
	promise?: Promise<Translations>;
};

// biome-ignore lint/complexity/noStaticOnlyClass: Lazy loader intentionally uses static state for cross-app coordination
export class LazyLoader {
	private static loadingQueue: Map<LanguageCode, LoadingTask> = new Map();
	private static loadedLanguages: Set<LanguageCode> = new Set();
	private static prefetchEnabled = true;
	private static maxCachedLanguages = 3; // Максимум языков в памяти

	/**
	 * Load translations for a language with priority
	 */
	static async load(
		language: LanguageCode,
		priority: 'high' | 'medium' | 'low' = 'high'
	): Promise<Translations> {
		// Check if already loaded
		if (LazyLoader.loadedLanguages.has(language)) {
			const cached = await TranslationCacheManager.getCache(language);
			if (cached) {
				console.log(`✅ LazyLoader: Using cached ${language}`);
				return cached.translations;
			}
		}

		// Check if already loading
		const existingTask = LazyLoader.loadingQueue.get(language);
		if (existingTask?.promise) {
			console.log(`⏳ LazyLoader: Waiting for ${language} (already loading)`);
			return existingTask.promise;
		}

		// Create new loading task
		console.log(`🔄 LazyLoader: Loading ${language} (priority: ${priority})`);
		const promise = LazyLoader.loadTranslations(language);

		LazyLoader.loadingQueue.set(language, {
			language,
			priority,
			timestamp: Date.now(),
			promise,
		});

		try {
			const translations = await promise;
			LazyLoader.loadedLanguages.add(language);
			LazyLoader.loadingQueue.delete(language);

			// Cleanup old languages if needed
			await LazyLoader.cleanupOldLanguages();

			console.log(`✅ LazyLoader: Loaded ${language} (${Object.keys(translations).length} keys)`);
			return translations;
		} catch (error) {
			LazyLoader.loadingQueue.delete(language);
			console.error(`❌ LazyLoader: Failed to load ${language}:`, error);
			throw error;
		}
	}

	/**
	 * Prefetch popular languages in background
	 */
	static async prefetch(languages: LanguageCode[]): Promise<void> {
		if (!LazyLoader.prefetchEnabled) {
			console.log('⏸️ LazyLoader: Prefetch disabled');
			return;
		}

		console.log(`🔮 LazyLoader: Prefetching ${languages.length} languages`);

		// Load in background with low priority
		const promises = languages
			.filter((lang) => !LazyLoader.loadedLanguages.has(lang))
			.map((lang) =>
				LazyLoader.load(lang, 'low').catch((error) => {
					console.warn(`⚠️ LazyLoader: Prefetch failed for ${lang}:`, error);
					return null;
				})
			);

		await Promise.allSettled(promises);
		console.log('✅ LazyLoader: Prefetch completed');
	}

	/**
	 * Unload a language to free memory
	 */
	static unload(language: LanguageCode): void {
		console.log(`🗑️ LazyLoader: Unloading ${language}`);

		LazyLoader.loadedLanguages.delete(language);
		LazyLoader.loadingQueue.delete(language);

		// Keep in localStorage cache, just remove from memory
		console.log(`✅ LazyLoader: Unloaded ${language} (kept in cache)`);
	}

	/**
	 * Get loading statistics
	 */
	static getStats() {
		return {
			loadedLanguages: Array.from(LazyLoader.loadedLanguages),
			loadingQueue: Array.from(LazyLoader.loadingQueue.values()).map((task) => ({
				language: task.language,
				priority: task.priority,
				age: Date.now() - task.timestamp,
			})),
			prefetchEnabled: LazyLoader.prefetchEnabled,
			maxCachedLanguages: LazyLoader.maxCachedLanguages,
		};
	}

	/**
	 * Enable/disable prefetching
	 */
	static setPrefetchEnabled(enabled: boolean): void {
		LazyLoader.prefetchEnabled = enabled;
		console.log(`LazyLoader: Prefetch ${enabled ? 'enabled' : 'disabled'}`);
	}

	/**
	 * Set max cached languages
	 */
	static setMaxCachedLanguages(max: number): void {
		LazyLoader.maxCachedLanguages = max;
		console.log(`LazyLoader: Max cached languages set to ${max}`);
	}

	/**
	 * Clear all loaded languages
	 */
	static clear(): void {
		console.log('🗑️ LazyLoader: Clearing all loaded languages');
		LazyLoader.loadedLanguages.clear();
		LazyLoader.loadingQueue.clear();
	}

	// Private methods

	private static async loadTranslations(language: LanguageCode): Promise<Translations> {
		// Try cache first
		const cached = await TranslationCacheManager.getCache(language);
		if (cached && !LazyLoader.isCacheStale(cached)) {
			return cached.translations;
		}

		// Load from API
		const translations = await I18nAPI.getTranslations(language);

		if (!translations || Object.keys(translations).length === 0) {
			throw new Error(`No translations received for ${language}`);
		}

		// Save to cache
		await TranslationCacheManager.setCache(language, translations);

		return translations;
	}

	private static async cleanupOldLanguages(): Promise<void> {
		if (LazyLoader.loadedLanguages.size <= LazyLoader.maxCachedLanguages) {
			return;
		}

		console.log(
			`🧹 LazyLoader: Cleaning up old languages (${LazyLoader.loadedLanguages.size}/${LazyLoader.maxCachedLanguages})`
		);

		// Get languages sorted by last access time
		const languagesByAccess = await Promise.all(
			Array.from(LazyLoader.loadedLanguages).map(async (lang) => ({
				language: lang,
				lastAccess: await LazyLoader.getLastAccessTime(lang),
			}))
		);
		languagesByAccess.sort((a, b) => a.lastAccess - b.lastAccess);

		// Remove oldest languages
		const toRemove = languagesByAccess.slice(
			0,
			LazyLoader.loadedLanguages.size - LazyLoader.maxCachedLanguages
		);

		for (const { language } of toRemove) {
			await LazyLoader.unload(language);
		}
	}

	private static async getLastAccessTime(language: LanguageCode): Promise<number> {
		// Get from cache metadata
		const cached = await TranslationCacheManager.getCache(language);
		return cached?.timestamp || 0;
	}

	private static isCacheStale(cache: { timestamp: number }): boolean {
		const maxAge = 24 * 60 * 60 * 1000; // 24 hours
		const age = Date.now() - cache.timestamp;
		return age > maxAge;
	}
}
