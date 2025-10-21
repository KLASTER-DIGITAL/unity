import { TranslationCache, CacheConfig } from './types';
import { storage, StorageUtils } from '../platform/storage';

export class TranslationCacheManager {
  private static readonly CACHE_PREFIX = 'i18n_cache_';
  private static readonly LAST_SYNC_KEY = 'i18n_last_sync';
  private static readonly DEFAULT_CONFIG: CacheConfig = {
    maxAge: 24 * 60 * 60 * 1000, // 24 часа
    maxSize: 1024 * 1024, // 1MB
    compressionEnabled: true
  };

  // Получение кэша для языка
  static async getCache(language: string): Promise<TranslationCache | null> {
    console.log(`🔍 TranslationCacheManager.getCache called for ${language}`);
    const cacheKey = this.CACHE_PREFIX + language;
    const cached = await storage.getItem(cacheKey);

    console.log(`📦 Cache for ${language}:`, cached ? 'FOUND' : 'NOT FOUND');
    if (!cached) return null;

    try {
      const cache: TranslationCache = JSON.parse(cached);

      // Проверка актуальности
      if (this.isCacheExpired(cache)) {
        await this.removeCache(language);
        return null;
      }

      // Проверка целостности
      if (!this.validateCacheIntegrity(cache)) {
        console.warn(`Cache integrity check failed for ${language}, removing...`);
        await this.removeCache(language);
        return null;
      }

      return cache;
    } catch (error) {
      console.error('Error parsing cache:', error);
      await this.removeCache(language);
      return null;
    }
  }

  // Сохранение кэша
  static async setCache(language: string, translations: Record<string, string>, etag?: string): Promise<void> {
    const cache: TranslationCache = {
      language,
      translations,
      version: this.generateVersion(),
      lastUpdated: new Date().toISOString(),
      etag,
      checksum: this.calculateChecksum(translations)
    };

    const cacheKey = this.CACHE_PREFIX + language;

    try {
      const serialized = JSON.stringify(cache);

      // Проверка размера
      if (this.DEFAULT_CONFIG.compressionEnabled && this.getSizeInBytes(serialized) > this.DEFAULT_CONFIG.maxSize) {
        console.warn(`Cache size exceeds limit for ${language}, cleaning up...`);
        await this.cleanupOldCache();
      }

      await storage.setItem(cacheKey, serialized);
      await storage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());

      console.log(`Cache saved for language: ${language}, keys: ${Object.keys(translations).length}`);
    } catch (error) {
      console.error('Error saving cache:', error);
      await this.handleStorageError(error);
    }
  }

  // Проверка актуальности кэша
  static isCacheExpired(cache: TranslationCache): boolean {
    const age = Date.now() - new Date(cache.lastUpdated).getTime();
    return age > this.DEFAULT_CONFIG.maxAge;
  }

  // Очистка кэша для конкретного языка
  static async removeCache(language: string): Promise<void> {
    const cacheKey = this.CACHE_PREFIX + language;
    await storage.removeItem(cacheKey);
    console.log(`Cache removed for language: ${language}`);
  }

  // Полная очистка кэша
  static async clearCache(): Promise<void> {
    const keys = await storage.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));

    await storage.multiRemove([...cacheKeys, this.LAST_SYNC_KEY]);
    console.log('All translation cache cleared');
  }

  // Получение последнего времени синхронизации
  static async getLastSync(): Promise<Date | null> {
    const lastSync = await storage.getItem(this.LAST_SYNC_KEY);
    return lastSync ? new Date(lastSync) : null;
  }

  // Получение ETag для кэша
  static async getCacheETag(language: string): Promise<string | undefined> {
    const cache = await this.getCache(language);
    return cache?.etag;
  }

  // Получение списка закэшированных языков
  static async getCachedLanguages(): Promise<string[]> {
    const keys = await storage.getAllKeys();
    return keys
      .filter(key => key.startsWith(this.CACHE_PREFIX))
      .map(key => key.replace(this.CACHE_PREFIX, ''));
  }

  // Валидация кэша для всех языков
  static async validateAllCaches(): Promise<{ valid: string[]; invalid: string[] }> {
    const languages = await this.getCachedLanguages();
    const valid: string[] = [];
    const invalid: string[] = [];

    for (const language of languages) {
      const cache = await this.getCache(language);
      if (cache && this.validateCacheIntegrity(cache)) {
        valid.push(language);
      } else {
        invalid.push(language);
        await this.removeCache(language);
      }
    }

    return { valid, invalid };
  }

  // Получение статистики кэша
  static async getCacheStats(): Promise<{
    totalSize: number;
    languagesCount: number;
    totalKeys: number;
    oldestCache: Date | null;
    newestCache: Date | null;
  }> {
    const languages = await this.getCachedLanguages();
    let totalSize = 0;
    let totalKeys = 0;
    let oldestDate: Date | null = null;
    let newestDate: Date | null = null;

    for (const language of languages) {
      const cacheKey = this.CACHE_PREFIX + language;
      const cached = await storage.getItem(cacheKey);

      if (cached) {
        totalSize += this.getSizeInBytes(cached);

        try {
          const cache: TranslationCache = JSON.parse(cached);
          totalKeys += Object.keys(cache.translations).length;

          const cacheDate = new Date(cache.lastUpdated);
          if (!oldestDate || cacheDate < oldestDate) oldestDate = cacheDate;
          if (!newestDate || cacheDate > newestDate) newestDate = cacheDate;
        } catch (error) {
          console.error(`Error parsing cache for ${language}:`, error);
        }
      }
    }

    return {
      totalSize,
      languagesCount: languages.length,
      totalKeys,
      oldestCache: oldestDate,
      newestCache: newestDate
    };
  }

  // Приватные методы
  
  private static generateVersion(): string {
    return Date.now().toString();
  }

  private static calculateChecksum(translations: Record<string, string>): string {
    const content = JSON.stringify(translations);

    // ✅ FIX: Используем простой хеш вместо btoa для поддержки Unicode
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36).slice(0, 16);
  }

  private static validateCacheIntegrity(cache: TranslationCache): boolean {
    return !!(
      cache.language &&
      cache.translations &&
      typeof cache.translations === 'object' &&
      Object.keys(cache.translations).length > 0 &&
      cache.lastUpdated &&
      cache.version
    );
  }

  private static getSizeInBytes(str: string): number {
    return new Blob([str]).size;
  }

  private static async handleStorageError(error: any): Promise<void> {
    if (error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, cleaning up old cache...');
      await this.cleanupOldCache();
    } else if (error.name === 'SecurityError') {
      console.warn('Storage access denied, possibly in private mode');
    } else {
      console.error('Unexpected storage error:', error);
    }
  }

  private static async cleanupOldCache(): Promise<void> {
    const allKeys = await storage.getAllKeys();
    const cacheKeys = allKeys.filter(key => key.startsWith(this.CACHE_PREFIX));

    const caches = await Promise.all(
      cacheKeys.map(async (key) => {
        try {
          const cached = await storage.getItem(key);
          const cache = JSON.parse(cached || '{}');
          return {
            key,
            lastUpdated: new Date(cache.lastUpdated || 0),
            size: this.getSizeInBytes(cached || '')
          };
        } catch {
          return {
            key,
            lastUpdated: new Date(0),
            size: 0
          };
        }
      })
    );

    caches.sort((a, b) => a.lastUpdated.getTime() - b.lastUpdated.getTime());

    // Удаляем самые старые кэши до освобождения 50% места
    const totalSize = caches.reduce((sum, cache) => sum + cache.size, 0);
    const targetSize = this.DEFAULT_CONFIG.maxSize * 0.5;

    let currentSize = 0;
    const keysToRemove: string[] = [];

    caches.forEach(({ key, size }) => {
      if (currentSize < targetSize) {
        keysToRemove.push(key);
        currentSize += size;
      }
    });

    await storage.multiRemove(keysToRemove);
    console.log(`Cleaned up ${Math.floor(currentSize / 1024)}KB of old cache`);
  }

  // Экспорт/импорт кэша для миграции
  static async exportCache(): Promise<Record<string, TranslationCache>> {
    const exported: Record<string, TranslationCache> = {};
    const languages = await this.getCachedLanguages();

    for (const language of languages) {
      const cache = await this.getCache(language);
      if (cache) {
        exported[language] = cache;
      }
    }

    return exported;
  }

  static async importCache(caches: Record<string, TranslationCache>): Promise<void> {
    for (const [language, cache] of Object.entries(caches)) {
      if (this.validateCacheIntegrity(cache)) {
        await this.setCache(language, cache.translations, cache.etag);
      } else {
        console.warn(`Skipping invalid cache import for ${language}`);
      }
    }
  }
}

