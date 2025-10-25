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

interface LoadingTask {
  language: LanguageCode;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  promise?: Promise<Translations>;
}

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
    if (this.loadedLanguages.has(language)) {
      const cached = await TranslationCacheManager.getCache(language);
      if (cached) {
        console.log(`✅ LazyLoader: Using cached ${language}`);
        return cached.translations;
      }
    }
    
    // Check if already loading
    const existingTask = this.loadingQueue.get(language);
    if (existingTask?.promise) {
      console.log(`⏳ LazyLoader: Waiting for ${language} (already loading)`);
      return existingTask.promise;
    }
    
    // Create new loading task
    console.log(`🔄 LazyLoader: Loading ${language} (priority: ${priority})`);
    const promise = this.loadTranslations(language);
    
    this.loadingQueue.set(language, {
      language,
      priority,
      timestamp: Date.now(),
      promise
    });
    
    try {
      const translations = await promise;
      this.loadedLanguages.add(language);
      this.loadingQueue.delete(language);
      
      // Cleanup old languages if needed
      await this.cleanupOldLanguages();
      
      console.log(`✅ LazyLoader: Loaded ${language} (${Object.keys(translations).length} keys)`);
      return translations;
    } catch (error) {
      this.loadingQueue.delete(language);
      console.error(`❌ LazyLoader: Failed to load ${language}:`, error);
      throw error;
    }
  }
  
  /**
   * Prefetch popular languages in background
   */
  static async prefetch(languages: LanguageCode[]): Promise<void> {
    if (!this.prefetchEnabled) {
      console.log('⏸️ LazyLoader: Prefetch disabled');
      return;
    }
    
    console.log(`🔮 LazyLoader: Prefetching ${languages.length} languages`);
    
    // Load in background with low priority
    const promises = languages
      .filter(lang => !this.loadedLanguages.has(lang))
      .map(lang => 
        this.load(lang, 'low').catch(error => {
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
  static async unload(language: LanguageCode): Promise<void> {
    console.log(`🗑️ LazyLoader: Unloading ${language}`);
    
    this.loadedLanguages.delete(language);
    this.loadingQueue.delete(language);
    
    // Keep in localStorage cache, just remove from memory
    console.log(`✅ LazyLoader: Unloaded ${language} (kept in cache)`);
  }
  
  /**
   * Get loading statistics
   */
  static getStats() {
    return {
      loadedLanguages: Array.from(this.loadedLanguages),
      loadingQueue: Array.from(this.loadingQueue.values()).map(task => ({
        language: task.language,
        priority: task.priority,
        age: Date.now() - task.timestamp
      })),
      prefetchEnabled: this.prefetchEnabled,
      maxCachedLanguages: this.maxCachedLanguages
    };
  }
  
  /**
   * Enable/disable prefetching
   */
  static setPrefetchEnabled(enabled: boolean): void {
    this.prefetchEnabled = enabled;
    console.log(`LazyLoader: Prefetch ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Set max cached languages
   */
  static setMaxCachedLanguages(max: number): void {
    this.maxCachedLanguages = max;
    console.log(`LazyLoader: Max cached languages set to ${max}`);
  }
  
  /**
   * Clear all loaded languages
   */
  static clear(): void {
    console.log('🗑️ LazyLoader: Clearing all loaded languages');
    this.loadedLanguages.clear();
    this.loadingQueue.clear();
  }
  
  // Private methods
  
  private static async loadTranslations(language: LanguageCode): Promise<Translations> {
    // Try cache first
    const cached = await TranslationCacheManager.getCache(language);
    if (cached && !this.isCacheStale(cached)) {
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
    if (this.loadedLanguages.size <= this.maxCachedLanguages) {
      return;
    }
    
    console.log(`🧹 LazyLoader: Cleaning up old languages (${this.loadedLanguages.size}/${this.maxCachedLanguages})`);
    
    // Get languages sorted by last access time
    const languagesByAccess = await Promise.all(
      Array.from(this.loadedLanguages).map(async lang => ({
        language: lang,
        lastAccess: await this.getLastAccessTime(lang)
      }))
    );
    languagesByAccess.sort((a, b) => a.lastAccess - b.lastAccess);
    
    // Remove oldest languages
    const toRemove = languagesByAccess.slice(0, this.loadedLanguages.size - this.maxCachedLanguages);
    
    for (const { language } of toRemove) {
      await this.unload(language);
    }
  }
  
  private static async getLastAccessTime(language: LanguageCode): Promise<number> {
    // Get from cache metadata
    const cached = await TranslationCacheManager.getCache(language);
    return cached?.timestamp || 0;
  }
  
  private static isCacheStale(cache: any): boolean {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const age = Date.now() - cache.timestamp;
    return age > maxAge;
  }
}

