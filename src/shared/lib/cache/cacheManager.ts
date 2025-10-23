/**
 * Cache Manager
 * 
 * Utilities for managing Service Worker caches.
 * Provides functions for cache invalidation, clearing, and inspection.
 */

export interface CacheInfo {
  name: string;
  size: number;
  entries: number;
}

/**
 * Get all caches and their info
 */
export async function getAllCaches(): Promise<CacheInfo[]> {
  if (!('caches' in window)) {
    console.warn('[CacheManager] Cache API not supported');
    return [];
  }

  try {
    const cacheNames = await caches.keys();
    const cacheInfos: CacheInfo[] = [];

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      let totalSize = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }

      cacheInfos.push({
        name,
        size: totalSize,
        entries: keys.length
      });
    }

    return cacheInfos;
  } catch (error) {
    console.error('[CacheManager] Failed to get caches:', error);
    return [];
  }
}

/**
 * Clear a specific cache by name
 */
export async function clearCache(cacheName: string): Promise<boolean> {
  if (!('caches' in window)) {
    console.warn('[CacheManager] Cache API not supported');
    return false;
  }

  try {
    const deleted = await caches.delete(cacheName);
    console.log(`[CacheManager] Cache "${cacheName}" deleted:`, deleted);
    return deleted;
  } catch (error) {
    console.error(`[CacheManager] Failed to delete cache "${cacheName}":`, error);
    return false;
  }
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<number> {
  if (!('caches' in window)) {
    console.warn('[CacheManager] Cache API not supported');
    return 0;
  }

  try {
    const cacheNames = await caches.keys();
    let deletedCount = 0;

    for (const name of cacheNames) {
      const deleted = await caches.delete(name);
      if (deleted) {
        deletedCount++;
      }
    }

    console.log(`[CacheManager] Deleted ${deletedCount} caches`);
    return deletedCount;
  } catch (error) {
    console.error('[CacheManager] Failed to clear all caches:', error);
    return 0;
  }
}

/**
 * Invalidate API cache (force refresh on next request)
 */
export async function invalidateAPICache(): Promise<boolean> {
  if (!('caches' in window)) {
    console.warn('[CacheManager] Cache API not supported');
    return false;
  }

  try {
    const deleted = await caches.delete('achievement-diary-api-v1');
    console.log('[CacheManager] API cache invalidated:', deleted);
    return deleted;
  } catch (error) {
    console.error('[CacheManager] Failed to invalidate API cache:', error);
    return false;
  }
}

/**
 * Invalidate specific URL from cache
 */
export async function invalidateURL(url: string): Promise<boolean> {
  if (!('caches' in window)) {
    console.warn('[CacheManager] Cache API not supported');
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    let deleted = false;

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const result = await cache.delete(url);
      if (result) {
        deleted = true;
        console.log(`[CacheManager] URL "${url}" deleted from cache "${name}"`);
      }
    }

    return deleted;
  } catch (error) {
    console.error(`[CacheManager] Failed to invalidate URL "${url}":`, error);
    return false;
  }
}

/**
 * Get cache size in human-readable format
 */
export function formatCacheSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Get total cache size across all caches
 */
export async function getTotalCacheSize(): Promise<number> {
  const caches = await getAllCaches();
  return caches.reduce((total, cache) => total + cache.size, 0);
}

/**
 * Check if a URL is cached
 */
export async function isURLCached(url: string): Promise<boolean> {
  if (!('caches' in window)) {
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    
    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const response = await cache.match(url);
      if (response) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`[CacheManager] Failed to check if URL is cached:`, error);
    return false;
  }
}

/**
 * Preload URLs into cache
 */
export async function preloadURLs(urls: string[], cacheName: string = 'achievement-diary-static-v1'): Promise<number> {
  if (!('caches' in window)) {
    console.warn('[CacheManager] Cache API not supported');
    return 0;
  }

  try {
    const cache = await caches.open(cacheName);
    let cachedCount = 0;

    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (response && response.status === 200) {
          await cache.put(url, response);
          cachedCount++;
        }
      } catch (error) {
        console.error(`[CacheManager] Failed to preload URL "${url}":`, error);
      }
    }

    console.log(`[CacheManager] Preloaded ${cachedCount}/${urls.length} URLs`);
    return cachedCount;
  } catch (error) {
    console.error('[CacheManager] Failed to preload URLs:', error);
    return 0;
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalCaches: number;
  totalEntries: number;
  totalSize: number;
  caches: CacheInfo[];
}> {
  const caches = await getAllCaches();
  
  return {
    totalCaches: caches.length,
    totalEntries: caches.reduce((total, cache) => total + cache.entries, 0),
    totalSize: caches.reduce((total, cache) => total + cache.size, 0),
    caches
  };
}

