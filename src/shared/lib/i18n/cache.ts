import { TranslationCache, CacheConfig } from './types';

export class TranslationCacheManager {
  private static readonly CACHE_PREFIX = 'i18n_cache_';
  private static readonly LAST_SYNC_KEY = 'i18n_last_sync';
  private static readonly DEFAULT_CONFIG: CacheConfig = {
    maxAge: 24 * 60 * 60 * 1000, // 24 часа
    maxSize: 1024 * 1024, // 1MB
    compressionEnabled: true
  };

  // Получение кэша для языка
  static getCache(language: string): TranslationCache | null {
    const cacheKey = this.CACHE_PREFIX + language;
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return null;
    
    try {
      const cache: TranslationCache = JSON.parse(cached);
      
      // Проверка актуальности
      if (this.isCacheExpired(cache)) {
        this.removeCache(language);
        return null;
      }
      
      // Проверка целостности
      if (!this.validateCacheIntegrity(cache)) {
        console.warn(`Cache integrity check failed for ${language}, removing...`);
        this.removeCache(language);
        return null;
      }
      
      return cache;
    } catch (error) {
      console.error('Error parsing cache:', error);
      this.removeCache(language);
      return null;
    }
  }

  // Сохранение кэша
  static setCache(language: string, translations: Record<string, string>, etag?: string): void {
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
        this.cleanupOldCache();
      }
      
      localStorage.setItem(cacheKey, serialized);
      localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
      
      console.log(`Cache saved for language: ${language}, keys: ${Object.keys(translations).length}`);
    } catch (error) {
      console.error('Error saving cache:', error);
      this.handleStorageError(error);
    }
  }

  // Проверка актуальности кэша
  static isCacheExpired(cache: TranslationCache): boolean {
    const age = Date.now() - new Date(cache.lastUpdated).getTime();
    return age > this.DEFAULT_CONFIG.maxAge;
  }

  // Очистка кэша для конкретного языка
  static removeCache(language: string): void {
    const cacheKey = this.CACHE_PREFIX + language;
    localStorage.removeItem(cacheKey);
    console.log(`Cache removed for language: ${language}`);
  }

  // Полная очистка кэша
  static clearCache(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
    
    localStorage.removeItem(this.LAST_SYNC_KEY);
    console.log('All translation cache cleared');
  }

  // Получение последнего времени синхронизации
  static getLastSync(): Date | null {
    const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
    return lastSync ? new Date(lastSync) : null;
  }

  // Получение ETag для кэша
  static getCacheETag(language: string): string | undefined {
    const cache = this.getCache(language);
    return cache?.etag;
  }

  // Получение списка закэшированных языков
  static getCachedLanguages(): string[] {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.CACHE_PREFIX))
      .map(key => key.replace(this.CACHE_PREFIX, ''));
  }

  // Валидация кэша для всех языков
  static validateAllCaches(): { valid: string[]; invalid: string[] } {
    const languages = this.getCachedLanguages();
    const valid: string[] = [];
    const invalid: string[] = [];
    
    languages.forEach(language => {
      const cache = this.getCache(language);
      if (cache && this.validateCacheIntegrity(cache)) {
        valid.push(language);
      } else {
        invalid.push(language);
        this.removeCache(language);
      }
    });
    
    return { valid, invalid };
  }

  // Получение статистики кэша
  static getCacheStats(): {
    totalSize: number;
    languagesCount: number;
    totalKeys: number;
    oldestCache: Date | null;
    newestCache: Date | null;
  } {
    const languages = this.getCachedLanguages();
    let totalSize = 0;
    let totalKeys = 0;
    let oldestDate: Date | null = null;
    let newestDate: Date | null = null;
    
    languages.forEach(language => {
      const cacheKey = this.CACHE_PREFIX + language;
      const cached = localStorage.getItem(cacheKey);
      
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
    });
    
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
    return btoa(content).slice(0, 16);
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

  private static handleStorageError(error: any): void {
    if (error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, cleaning up old cache...');
      this.cleanupOldCache();
    } else if (error.name === 'SecurityError') {
      console.warn('Storage access denied, possibly in private mode');
    } else {
      console.error('Unexpected storage error:', error);
    }
  }

  private static cleanupOldCache(): void {
    const caches = Object.keys(localStorage)
      .filter(key => key.startsWith(this.CACHE_PREFIX))
      .map(key => {
        try {
          const cache = JSON.parse(localStorage.getItem(key) || '{}');
          return { 
            key, 
            lastUpdated: new Date(cache.lastUpdated || 0),
            size: this.getSizeInBytes(localStorage.getItem(key) || '')
          };
        } catch {
          return { 
            key, 
            lastUpdated: new Date(0), 
            size: 0 
          };
        }
      })
      .sort((a, b) => a.lastUpdated.getTime() - b.lastUpdated.getTime());

    // Удаляем самые старые кэши до освобождения 50% места
    const totalSize = caches.reduce((sum, cache) => sum + cache.size, 0);
    const targetSize = this.DEFAULT_CONFIG.maxSize * 0.5;
    
    let currentSize = 0;
    caches.forEach(({ key, size }) => {
      if (currentSize < targetSize) {
        localStorage.removeItem(key);
        currentSize += size;
      }
    });
    
    console.log(`Cleaned up ${Math.floor(currentSize / 1024)}KB of old cache`);
  }

  // Экспорт/импорт кэша для миграции
  static exportCache(): Record<string, TranslationCache> {
    const exported: Record<string, TranslationCache> = {};
    const languages = this.getCachedLanguages();
    
    languages.forEach(language => {
      const cache = this.getCache(language);
      if (cache) {
        exported[language] = cache;
      }
    });
    
    return exported;
  }

  static importCache(caches: Record<string, TranslationCache>): void {
    Object.entries(caches).forEach(([language, cache]) => {
      if (this.validateCacheIntegrity(cache)) {
        this.setCache(language, cache.translations, cache.etag);
      } else {
        console.warn(`Skipping invalid cache import for ${language}`);
      }
    });
  }
}

