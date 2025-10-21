/**
 * Translation loading optimizations
 * 
 * This module provides advanced optimization features:
 * - Lazy loading: Load translations only when needed
 * - Compression: Reduce storage size by 30-50%
 * - Smart caching: LRU cache with priority-based eviction
 * - Prefetching: Background loading of popular languages
 */

export { LazyLoader } from './LazyLoader';
export { Compression, OptimizedStorage } from './Compression';
export { SmartCache, CacheWarmer } from './SmartCache';

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
    prefetchLanguages = ['en', 'ru']
  } = options || {};
  
  console.log('🚀 Initializing translation optimizations...');
  
  // Configure lazy loader
  const { LazyLoader } = await import('./LazyLoader');
  LazyLoader.setPrefetchEnabled(enablePrefetch);
  LazyLoader.setMaxCachedLanguages(maxCachedLanguages);
  
  // Configure smart cache
  const { SmartCache } = await import('./SmartCache');
  SmartCache.configure({
    maxEntries: maxCachedLanguages + 2,
    maxSize: 5 * 1024 * 1024 // 5MB
  });
  
  // Warm cache with popular languages
  if (enablePrefetch && prefetchLanguages.length > 0) {
    const { CacheWarmer } = await import('./SmartCache');
    await CacheWarmer.warm(prefetchLanguages as any);
  }
  
  console.log('✅ Translation optimizations initialized');
}

/**
 * Get optimization statistics
 */
export function getOptimizationStats() {
  const { LazyLoader } = require('./LazyLoader');
  const { SmartCache } = require('./SmartCache');
  const { OptimizedStorage } = require('./Compression');
  
  return {
    lazyLoader: LazyLoader.getStats(),
    smartCache: SmartCache.getStats(),
    storage: OptimizedStorage.getStats()
  };
}

