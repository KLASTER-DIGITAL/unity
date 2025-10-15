import { LanguageConfig, MissingTranslationReport } from './types';
import { TranslationCacheManager } from './cache';

export class I18nAPI {
  private static readonly BASE_URL = '/api/i18n';
  
  // Получение всех поддерживаемых языков
  static async getSupportedLanguages(): Promise<LanguageConfig[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/languages`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch languages: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch languages');
      }
      
      return data.languages || [];
    } catch (error) {
      console.error('Error fetching supported languages:', error);
      // Возвращаем fallback языки
      return this.getFallbackLanguages();
    }
  }
  
  // Получение переводов для языка
  static async getTranslations(language: string, options?: {
    useCache?: boolean;
    etag?: string;
  }): Promise<Record<string, string>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Добавляем ETag для проверки изменений
      if (options?.etag) {
        headers['If-None-Match'] = options.etag;
      }
      
      const response = await fetch(`${this.BASE_URL}/translations/${language}`, {
        headers,
      });
      
      if (response.status === 304) {
        // Контент не изменен, используем кэш
        const cached = TranslationCacheManager.getCache(language);
        if (cached) {
          console.log(`Using cached translations for ${language}`);
          return cached.translations;
        }
        // Если кэша нет, продолжаем загрузку
      }
      
      if (!response.ok) {
        throw new Error(`Failed to fetch translations: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch translations');
      }
      
      const etag = response.headers.get('ETag');
      const translations = data.translations || {};
      
      // Сохраняем в кэш с ETag
      if (options?.useCache !== false) {
        TranslationCacheManager.setCache(language, translations, etag || undefined);
      }
      
      console.log(`Loaded ${Object.keys(translations).length} translations for ${language}`);
      return translations;
    } catch (error) {
      console.error(`Error fetching translations for ${language}:`, error);
      
      // Пробуем загрузить из кэша даже при ошибке
      const cached = TranslationCacheManager.getCache(language);
      if (cached) {
        console.log(`Using cached translations for ${language} due to API error`);
        return cached.translations;
      }
      
      throw error;
    }
  }
  
  // Получение списка всех ключей переводов
  static async getTranslationKeys(): Promise<string[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/keys`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch keys: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch keys');
      }
      
      return data.keys || [];
    } catch (error) {
      console.error('Error fetching translation keys:', error);
      return this.getFallbackKeys();
    }
  }
  
  // Сообщение об отсутствующем переводе
  static async reportMissingTranslation(
    key: string,
    language: string,
    context?: string
  ): Promise<void> {
    try {
      const report: MissingTranslationReport = {
        key,
        language,
        context,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch(`${this.BASE_URL}/missing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      
      if (!response.ok) {
        console.warn(`Failed to report missing translation: ${response.status}`);
      }
    } catch (error) {
      console.error('Error reporting missing translation:', error);
    }
  }
  
  // Получение статистики переводов (для админ-панели)
  static async getTranslationStats(): Promise<{
    totalKeys: number;
    translatedKeys: Record<string, number>;
    progress: Record<string, number>;
    lastUpdated: Record<string, string>;
  }> {
    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      const response = await fetch(`${this.BASE_URL}/admin/stats`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stats');
      }
      
      return data.stats;
    } catch (error) {
      console.error('Error fetching translation stats:', error);
      return {
        totalKeys: 0,
        translatedKeys: {},
        progress: {},
        lastUpdated: {}
      };
    }
  }
  
  // Обновление переводов (для админ-панели)
  static async updateTranslations(
    language: string,
    translations: Record<string, string>
  ): Promise<boolean> {
    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      const response = await fetch(`${this.BASE_URL}/admin/translations`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          language,
          translations
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update translations: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update translations');
      }
      
      // Обновляем кэш
      TranslationCacheManager.setCache(language, translations);
      
      return true;
    } catch (error) {
      console.error('Error updating translations:', error);
      return false;
    }
  }
  
  // Автоперевод через OpenAI (для админ-панели)
  static async autoTranslate(
    sourceLanguage: string,
    targetLanguages: string[]
  ): Promise<{
    success: boolean;
    results: Record<string, Array<{
      key: string;
      originalText: string;
      translatedText: string;
      confidence: number;
      needsReview: boolean;
    }>>;
    error?: string;
  }> {
    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      const openaiApiKey = localStorage.getItem('admin_openai_api_key');
      
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }
      
      const response = await fetch(`${this.BASE_URL}/admin/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-OpenAI-Key': openaiApiKey,
        },
        body: JSON.stringify({
          sourceLanguage,
          targetLanguages
        })
      });
      
      if (!response.ok) {
        throw new Error(`Auto-translation failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Auto-translation failed');
      }
      
      // Обновляем кэш для переведенных языков
      for (const language of targetLanguages) {
        const translations = data.results[language]?.reduce((acc: Record<string, string>, result: any) => {
          acc[result.key] = result.translatedText;
          return acc;
        }, {});
        
        if (translations && Object.keys(translations).length > 0) {
          TranslationCacheManager.setCache(language, translations);
        }
      }
      
      return {
        success: true,
        results: data.results
      };
    } catch (error) {
      console.error('Error in auto-translation:', error);
      return {
        success: false,
        results: {},
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Проверка здоровья API
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }
  
  // Fallback данные
  private static getFallbackLanguages(): LanguageConfig[] {
    return [
      { code: 'ru', name: 'Russian', native_name: 'Русский', flag: '🇷🇺', is_active: true },
      { code: 'en', name: 'English', native_name: 'English', flag: '🇺🇸', is_active: true },
      { code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸', is_active: true },
      { code: 'de', name: 'German', native_name: 'Deutsch', flag: '🇩🇪', is_active: false },
      { code: 'fr', name: 'French', native_name: 'Français', flag: '🇫🇷', is_active: false },
      { code: 'zh', name: 'Chinese', native_name: '中文', flag: '🇨🇳', is_active: false },
      { code: 'ja', name: 'Japanese', native_name: '日本語', flag: '🇯🇵', is_active: false },
    ];
  }
  
  private static getFallbackKeys(): string[] {
    return [
      'welcome_title', 'start_button', 'skip', 'next', 'back',
      'home', 'history', 'achievements', 'reports', 'settings',
      'greeting', 'today_question', 'input_placeholder',
      'send', 'save', 'cancel_button', 'delete',
      'sign_in', 'sign_up', 'your_email', 'password',
      'notifications', 'language', 'support',
      'family', 'work', 'finance', 'gratitude', 'health',
      'personal_development', 'creativity', 'relationships',
      'connected_to_ai', 'ai_help', 'history_title',
      'select_language', 'diary_name', 'first_entry', 'reminders'
    ];
  }
}

