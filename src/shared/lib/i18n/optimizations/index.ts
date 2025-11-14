/**
 * Translation loading optimizations
 *
 * This module provides advanced optimization features:
 * - Lazy loading: Load translations only when needed
 * - Compression: Reduce storage size by 30-50%
 * - Smart caching: LRU cache with priority-based eviction
 * - Prefetching: Background loading of popular languages
 */

// ✅ PERFORMANCE: Use static imports to prevent circular dependency warnings
// Vite will handle code splitting automatically
import { Compression, OptimizedStorage } from './Compression';
import { LazyLoader } from './LazyLoader';
import { CacheWarmer, SmartCache } from './SmartCache';

// Re-export for external use
export { Compression, OptimizedStorage, LazyLoader, CacheWarmer, SmartCache };

/**
 * Initialize all optimizations
 */
export async function initializeOptimizations(options?: {
	enablePrefetch?: boolean;
	maxCachedLanguages?: number;
	prefetchLanguages?: string[];
}): Promise<void> {
	const {
		enablePrefetch = true,
		maxCachedLanguages = 3,
		prefetchLanguages = ['en', 'ru'],
	} = options || {};

	console.log('🚀 Initializing translation optimizations...');

	// ✅ PERFORMANCE: Use static imports (already imported at top)
	// Configure lazy loader
	LazyLoader.setPrefetchEnabled(enablePrefetch);
	LazyLoader.setMaxCachedLanguages(maxCachedLanguages);

	// Configure smart cache
	SmartCache.configure({
		maxEntries: maxCachedLanguages + 2,
		maxSize: 5 * 1024 * 1024, // 5MB
	});

	// Warm cache with popular languages
	if (enablePrefetch && prefetchLanguages.length > 0) {
		await CacheWarmer.warm(prefetchLanguages as any);
	}

	console.log('✅ Translation optimizations initialized');
}

/**
 * Get optimization statistics
 */
export function getOptimizationStats() {
	// ✅ PERFORMANCE: Use static imports (already imported at top)
	return {
		lazyLoader: LazyLoader.getStats(),
		smartCache: SmartCache.getStats(),
		storage: OptimizedStorage.getStats(),
	};
}
