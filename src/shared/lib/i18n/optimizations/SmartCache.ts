/**
 * Smart caching system for translations
 * 
 * Features:
 * - LRU (Least Recently Used) cache eviction
 * - Priority-based caching
 * - Automatic prefetching of popular languages
 * - Memory-efficient storage
 */

import type { LanguageCode, Translations } from '../types/TranslationKeys';
import { OptimizedStorage } from './Compression';

interface CacheEntry {
  language: LanguageCode;
  translations: Translations;
  priority: number;
  accessCount: number;
  lastAccess: number;
  size: number;
}

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictions: number;
}

export class SmartCache {
  private static cache: Map<LanguageCode, CacheEntry> = new Map();
  private static maxEntries = 5;
  private static maxSize = 5 * 1024 * 1024; // 5MB
  private static hits = 0;
  private static misses = 0;
  private static evictions = 0;
  
  /**
   * Get translations from cache
   */
  static async get(language: LanguageCode): Promise<Translations | null> {
    // Check memory cache first
    const entry = this.cache.get(language);
    if (entry) {
      this.hits++;
      entry.accessCount++;
      entry.lastAccess = Date.now();
      console.log(`✅ SmartCache: Hit for ${language} (${entry.accessCount} accesses)`);
      return entry.translations;
    }
    
    // Check persistent storage
    this.misses++;
    const stored = await OptimizedStorage.load(language);
    if (stored) {
      console.log(`📂 SmartCache: Loaded ${language} from storage`);
      await this.set(language, stored, 1); // Low priority for storage loads
      return stored;
    }
    
    console.log(`❌ SmartCache: Miss for ${language}`);
    return null;
  }
  
  /**
   * Set translations in cache
   */
  static async set(
    language: LanguageCode,
    translations: Translations,
    priority: number = 1
  ): Promise<void> {
    const size = JSON.stringify(translations).length;
    
    // Check if we need to evict entries
    await this.ensureSpace(size);
    
    const entry: CacheEntry = {
      language,
      translations,
      priority,
      accessCount: 1,
      lastAccess: Date.now(),
      size
    };
    
    this.cache.set(language, entry);
    
    // Save to persistent storage
    await OptimizedStorage.save(language, translations);
    
    console.log(`💾 SmartCache: Cached ${language} (${size} bytes, priority: ${priority})`);
  }
  
  /**
   * Remove language from cache
   */
  static async remove(language: LanguageCode): Promise<void> {
    this.cache.delete(language);
    await OptimizedStorage.remove(language);
    console.log(`🗑️ SmartCache: Removed ${language}`);
  }
  
  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    console.log('🗑️ SmartCache: Cleared all cache');
  }
  
  /**
   * Get cache statistics
   */
  static getStats(): CacheStats {
    const totalSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    
    const total = this.hits + this.misses;
    
    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate: total > 0 ? Math.round((this.hits / total) * 100) : 0,
      missRate: total > 0 ? Math.round((this.misses / total) * 100) : 0,
      evictions: this.evictions
    };
  }
  
  /**
   * Get detailed cache info
   */
  static getInfo() {
    const entries = Array.from(this.cache.entries()).map(([lang, entry]) => ({
      language: lang,
      priority: entry.priority,
      accessCount: entry.accessCount,
      lastAccess: new Date(entry.lastAccess).toISOString(),
      size: entry.size,
      keysCount: Object.keys(entry.translations).length
    }));
    
    return {
      entries,
      stats: this.getStats(),
      maxEntries: this.maxEntries,
      maxSize: this.maxSize
    };
  }
  
  /**
   * Prefetch popular languages
   */
  static async prefetch(languages: LanguageCode[]): Promise<void> {
    console.log(`🔮 SmartCache: Prefetching ${languages.length} languages`);
    
    for (const language of languages) {
      if (!this.cache.has(language)) {
        // Load from storage if available
        const stored = await OptimizedStorage.load(language);
        if (stored) {
          await this.set(language, stored, 0.5); // Medium-low priority
        }
      }
    }
    
    console.log('✅ SmartCache: Prefetch completed');
  }
  
  /**
   * Set cache configuration
   */
  static configure(options: {
    maxEntries?: number;
    maxSize?: number;
  }): void {
    if (options.maxEntries !== undefined) {
      this.maxEntries = options.maxEntries;
    }
    if (options.maxSize !== undefined) {
      this.maxSize = options.maxSize;
    }
    
    console.log(`⚙️ SmartCache: Configured (maxEntries: ${this.maxEntries}, maxSize: ${this.maxSize})`);
  }
  
  // Private methods
  
  private static async ensureSpace(requiredSize: number): Promise<void> {
    const currentSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    
    // Check if we need to evict by count
    if (this.cache.size >= this.maxEntries) {
      await this.evictLRU();
    }
    
    // Check if we need to evict by size
    if (currentSize + requiredSize > this.maxSize) {
      await this.evictBySize(requiredSize);
    }
  }
  
  private static async evictLRU(): Promise<void> {
    // Find least recently used entry with lowest priority
    let lruEntry: [LanguageCode, CacheEntry] | null = null;
    let lruScore = Infinity;
    
    for (const [lang, entry] of this.cache.entries()) {
      // Score = priority * accessCount / age
      const age = Date.now() - entry.lastAccess;
      const score = (entry.priority * entry.accessCount * 1000) / (age + 1);
      
      if (score < lruScore) {
        lruScore = score;
        lruEntry = [lang, entry];
      }
    }
    
    if (lruEntry) {
      const [lang] = lruEntry;
      this.cache.delete(lang);
      this.evictions++;
      console.log(`🗑️ SmartCache: Evicted ${lang} (LRU, score: ${lruScore.toFixed(2)})`);
    }
  }
  
  private static async evictBySize(requiredSize: number): Promise<void> {
    const currentSize = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
    
    let freedSize = 0;
    const targetSize = currentSize + requiredSize - this.maxSize;
    
    // Sort by score (lowest first)
    const entries = Array.from(this.cache.entries())
      .map(([lang, entry]) => {
        const age = Date.now() - entry.lastAccess;
        const score = (entry.priority * entry.accessCount * 1000) / (age + 1);
        return { lang, entry, score };
      })
      .sort((a, b) => a.score - b.score);
    
    // Evict until we have enough space
    for (const { lang, entry } of entries) {
      if (freedSize >= targetSize) break;
      
      this.cache.delete(lang);
      this.evictions++;
      freedSize += entry.size;
      console.log(`🗑️ SmartCache: Evicted ${lang} (size: ${entry.size} bytes)`);
    }
    
    console.log(`✅ SmartCache: Freed ${freedSize} bytes`);
  }
}

/**
 * Automatic cache warming on app start
 */
export class CacheWarmer {
  private static warmed = false;
  
  /**
   * Warm cache with popular languages
   */
  static async warm(languages: LanguageCode[]): Promise<void> {
    if (this.warmed) {
      console.log('⏸️ CacheWarmer: Already warmed');
      return;
    }
    
    console.log(`🔥 CacheWarmer: Warming cache with ${languages.length} languages`);
    
    await SmartCache.prefetch(languages);
    
    this.warmed = true;
    console.log('✅ CacheWarmer: Cache warmed');
  }
  
  /**
   * Reset warmed state
   */
  static reset(): void {
    this.warmed = false;
  }
}

