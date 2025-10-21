import { I18nAPI } from './api';
import { TranslationCacheManager } from './cache';
import { LoadTranslationsOptions, TranslationResult } from './types';
import { storage } from '../platform/storage';

export class TranslationLoader {
  private static readonly DEFAULT_TIMEOUT = 10000; // 10 секунд
  private static readonly DEFAULT_RETRY_COUNT = 3;
  private static readonly RETRY_DELAY = 1000; // 1 секунда
  
  // Основной метод загрузки переводов
  static async loadTranslations(options: LoadTranslationsOptions): Promise<TranslationResult> {
    const {
      language,
      fallbackLanguage = 'ru',
      forceRefresh = false,
      timeout = this.DEFAULT_TIMEOUT,
      retryCount = this.DEFAULT_RETRY_COUNT
    } = options;
    
    console.log(`Loading translations for ${language} (fallback: ${fallbackLanguage})`);
    
    let attempt = 0;
    let lastError: Error | null = null;
    
    while (attempt < retryCount) {
      try {
        const result = await this.attemptLoad({
          language,
          fallbackLanguage,
          forceRefresh,
          timeout,
          attempt
        });
        
        console.log(`Successfully loaded translations for ${language}, source: ${result.fromCache ? 'cache' : 'api'}`);
        return result;
      } catch (error) {
        lastError = error as Error;
        attempt++;
        
        console.warn(`Attempt ${attempt} failed for ${language}:`, error);
        
        if (attempt < retryCount) {
          await this.delay(this.RETRY_DELAY * attempt);
        }
      }
    }
    
    // Все попытки неудачны, используем fallback
    console.error(`Failed to load translations for ${language} after ${retryCount} attempts, using fallback`);
    return this.loadFallback(fallbackLanguage);
  }
  
  // Попытка загрузки переводов
  private static async attemptLoad(options: {
    language: string;
    fallbackLanguage: string;
    forceRefresh: boolean;
    timeout: number;
    attempt: number;
  }): Promise<TranslationResult> {
    const { language, fallbackLanguage, forceRefresh, timeout, attempt } = options;
    
    // 1. Проверяем кэш (если не принудительное обновление)
    if (!forceRefresh && attempt === 0) {
      const cached = await TranslationCacheManager.getCache(language);
      if (cached && !this.isCacheStale(cached)) {
        return {
          translations: cached.translations,
          language,
          usedFallback: false,
          fromCache: true
        };
      }
    }
    
    // 2. Загружаем из API с таймаутом
    const etag = attempt === 0 ? await TranslationCacheManager.getCacheETag(language) : undefined;
    const translations = await this.withTimeout(
      I18nAPI.getTranslations(language, {
        useCache: true,
        etag
      }),
      timeout
    );
    
    if (Object.keys(translations).length === 0) {
      throw new Error('No translations received from API');
    }
    
    return {
      translations,
      language,
      usedFallback: false,
      fromCache: false
    };
  }
  
  // Загрузка fallback переводов
  private static async loadFallback(fallbackLanguage: string): Promise<TranslationResult> {
    console.log(`Loading fallback translations for ${fallbackLanguage}`);
    
    // Сначала пробуем кэш fallback языка
    const cached = TranslationCacheManager.getCache(fallbackLanguage);
    if (cached) {
      console.log(`Using cached fallback translations for ${fallbackLanguage}`);
      return {
        translations: cached.translations,
        language: fallbackLanguage,
        usedFallback: true,
        fromCache: true
      };
    }
    
    // Загружаем fallback из API
    try {
      const translations = await this.withTimeout(
        I18nAPI.getTranslations(fallbackLanguage),
        this.DEFAULT_TIMEOUT
      );
      
      console.log(`Loaded fallback translations from API for ${fallbackLanguage}`);
      return {
        translations,
        language: fallbackLanguage,
        usedFallback: true,
        fromCache: false
      };
    } catch (error) {
      console.error(`Failed to load fallback translations for ${fallbackLanguage}:`, error);
      
      // Если даже fallback не загрузился, используем встроенные переводы
      console.log('Using builtin fallback translations');
      return {
        translations: this.getBuiltinTranslations(fallbackLanguage),
        language: fallbackLanguage,
        usedFallback: true,
        fromCache: false
      };
    }
  }
  
  // Предзагрузка переводов для нескольких языков
  static async preloadLanguages(
    languages: string[],
    options: Partial<LoadTranslationsOptions> = {}
  ): Promise<void> {
    console.log(`Preloading translations for languages: ${languages.join(', ')}`);
    
    const promises = languages.map(language => 
      this.loadTranslations({ ...options, language })
        .then(result => {
          console.log(`Preloaded ${Object.keys(result.translations).length} translations for ${language}`);
        })
        .catch(error => {
          console.warn(`Failed to preload ${language}:`, error);
          return null;
        })
    );
    
    await Promise.allSettled(promises);
    console.log('Preloading completed');
  }
  
  // Валидация и восстановление кэша
  static async validateCache(): Promise<void> {
    console.log('Validating translation cache...');

    try {
      const languages = await I18nAPI.getSupportedLanguages();
      const validLanguages = languages.map(lang => lang.code);

      // Проверяем кэш для каждого языка
      for (const language of validLanguages) {
        const cached = await TranslationCacheManager.getCache(language);

        if (cached) {
          // Проверяем целостность кэша
          if (!this.validateCacheIntegrity(cached)) {
            console.warn(`Cache integrity check failed for ${language}, removing...`);
            await TranslationCacheManager.removeCache(language);
          }
        }
      }

      // Очищаем кэш для неактивных языков
      const allKeys = await storage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith('i18n_cache_'));

      for (const cacheKey of cacheKeys) {
        const language = cacheKey.replace('i18n_cache_', '');
        if (!validLanguages.includes(language)) {
          console.log(`Removing cache for inactive language: ${language}`);
          await TranslationCacheManager.removeCache(language);
        }
      }

      console.log('Cache validation completed');
    } catch (error) {
      console.error('Cache validation failed:', error);
    }
  }
  
  // Очистка всех переводов
  static async clearAllTranslations(): Promise<void> {
    console.log('Clearing all translations...');

    await TranslationCacheManager.clearCache();

    // Очищаем возможные временные данные
    const allKeys = await storage.getAllKeys();
    const i18nKeys = allKeys.filter(key => key.startsWith('i18n_'));

    if (i18nKeys.length > 0) {
      await storage.multiRemove(i18nKeys);
    }

    console.log('All translations cleared');
  }
  
  // Получение статистики загрузки
  static getLoadingStats(): {
    cacheStats: any;
    lastSync: Date | null;
    supportedLanguages: string[];
  } {
    return {
      cacheStats: TranslationCacheManager.getCacheStats(),
      lastSync: TranslationCacheManager.getLastSync(),
      supportedLanguages: TranslationCacheManager.getCachedLanguages()
    };
  }
  
  // Вспомогательные методы
  
  private static async withTimeout<T>(
    promise: Promise<T>, 
    timeout: number
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout);
    });
    
    return Promise.race([promise, timeoutPromise]);
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private static isCacheStale(cache: any): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 часа
    const age = Date.now() - new Date(cache.lastUpdated).getTime();
    return age > maxAge;
  }
  
  private static validateCacheIntegrity(cache: any): boolean {
    return !!(
      cache.language &&
      cache.translations &&
      typeof cache.translations === 'object' &&
      Object.keys(cache.translations).length > 0 &&
      cache.lastUpdated &&
      cache.version
    );
  }
  
  private static getBuiltinTranslations(language: string): Record<string, string> {
    // Встроенные переводы для критических ситуаций
    const builtin: Record<string, Record<string, string>> = {
      ru: {
        welcome_title: 'Создавай дневник побед',
        start_button: 'Начать',
        skip: 'Пропустить',
        next: 'Далее',
        back: 'Назад',
        home: 'Главная',
        settings: 'Настройки',
        loading_translations: 'Загрузка переводов...',
        translation_error: 'Ошибка загрузки переводов',
        retry: 'Повторить',
        cancel_button: 'Отмена',
        select_language: 'Выберите язык',
        language: 'Язык'
      },
      en: {
        welcome_title: 'Create a victory diary',
        start_button: 'Get Started',
        skip: 'Skip',
        next: 'Next',
        back: 'Back',
        home: 'Home',
        settings: 'Settings',
        loading_translations: 'Loading translations...',
        translation_error: 'Translation loading error',
        retry: 'Retry',
        cancel_button: 'Cancel',
        select_language: 'Select language',
        language: 'Language'
      }
    };
    
    return builtin[language] || builtin.ru;
  }
  
  // Метод для отладки
  static async debugInfo(): Promise<{
    currentCache: any;
    loadingStats: any;
    apiHealth: boolean;
    localStorageUsage: number;
  }> {
    return {
      currentCache: TranslationCacheManager.exportCache(),
      loadingStats: this.getLoadingStats(),
      apiHealth: await I18nAPI.healthCheck(),
      localStorageUsage: JSON.stringify(localStorage).length
    };
  }
}

