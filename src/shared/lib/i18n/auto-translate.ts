import { AutoTranslationResult } from './types';

export class AutoTranslationService {
  private static readonly BATCH_SIZE = 10;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 2000;
  
  // Основной метод автоперевода
  static async translateMissingKeys(
    sourceLanguage: string,
    targetLanguages: string[],
    openaiApiKey: string
  ): Promise<{ [language: string]: AutoTranslationResult[] }> {
    
    console.log(`Starting auto-translation from ${sourceLanguage} to ${targetLanguages.join(', ')}`);
    
    // 1. Получаем все ключи для перевода
    const allKeys = await this.getAllTranslationKeys();
    const sourceTranslations = await this.getTranslations(sourceLanguage);
    
    // 2. Определяем отсутствующие переводы
    const missingTranslations = await this.getMissingTranslations(
      allKeys, 
      targetLanguages
    );
    
    console.log('Missing translations:', missingTranslations);
    
    // 3. Переводим пакетами
    const results: { [language: string]: AutoTranslationResult[] } = {};
    
    for (const targetLanguage of targetLanguages) {
      const missingKeys = missingTranslations[targetLanguage] || [];
      if (missingKeys.length === 0) {
        console.log(`No missing translations for ${targetLanguage}`);
        continue;
      }
      
      console.log(`Translating ${missingKeys.length} keys to ${targetLanguage}`);
      
      const batches = this.createBatches(missingKeys, this.BATCH_SIZE);
      const languageResults: AutoTranslationResult[] = [];
      
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processing batch ${i + 1}/${batches.length} for ${targetLanguage} (${batch.length} keys)`);
        
        const batchResults = await this.translateBatch(
          sourceLanguage,
          targetLanguage,
          batch,
          sourceTranslations,
          openaiApiKey
        );
        
        languageResults.push(...batchResults);
        
        // Небольшая задержка между запросами
        if (i < batches.length - 1) {
          await this.delay(this.RETRY_DELAY);
        }
      }
      
      results[targetLanguage] = languageResults;
      
      // 4. Сохраняем результаты в базу
      await this.saveTranslations(targetLanguage, languageResults);
    }
    
    return results;
  }
  
  // Перевод пакета ключей
  private static async translateBatch(
    sourceLanguage: string,
    targetLanguage: string,
    keys: string[],
    sourceTranslations: Record<string, string>,
    openaiApiKey: string
  ): Promise<AutoTranslationResult[]> {
    
    const prompt = this.buildTranslationPrompt(
      sourceLanguage,
      targetLanguage,
      keys,
      sourceTranslations
    );
    
    let retryCount = 0;
    
    while (retryCount < this.MAX_RETRIES) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [
              {
                role: 'system',
                content: `You are a professional translator for a mobile app called "UNITY" - an achievement diary app. 
                Translate the following keys from ${sourceLanguage} to ${targetLanguage}. 
                
                IMPORTANT RULES:
                1. Keep the same tone and style as the original
                2. Preserve formatting like line breaks, emojis, and special characters
                3. For UI elements, keep translations concise and appropriate for mobile interfaces
                4. For motivational content, be encouraging and positive
                5. Return ONLY valid JSON format with the same keys
                6. If unsure about context, provide a conservative translation
                7. Handle placeholders like {name}, {count} correctly - keep them unchanged
                
                The app helps users track daily achievements and positive moments. The tone should be friendly, encouraging, and supportive.`
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000,
            response_format: { type: "json_object" }
          })
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        const content = data.choices[0]?.message?.content;
        
        if (!content) {
          throw new Error('No content from OpenAI');
        }
        
        // Парсим JSON ответ
        let translations: Record<string, string>;
        try {
          translations = JSON.parse(content);
        } catch (parseError) {
          console.error('Failed to parse OpenAI response:', content);
          throw new Error(`Invalid JSON from OpenAI: ${parseError}`);
        }
        
        return keys.map(key => ({
          key,
          originalText: sourceTranslations[key] || key,
          translatedText: translations[key] || key,
          confidence: this.calculateConfidence(translations[key], key),
          needsReview: this.needsReview(translations[key], key)
        }));
        
      } catch (error) {
        console.error(`Translation batch error (attempt ${retryCount + 1}):`, error);
        retryCount++;
        
        if (retryCount < this.MAX_RETRIES) {
          console.log(`Retrying in ${this.RETRY_DELAY}ms...`);
          await this.delay(this.RETRY_DELAY);
        } else {
          // Возвращаем fallback результаты
          console.error(`All retries failed for batch to ${targetLanguage}, using fallback`);
          return keys.map(key => ({
            key,
            originalText: sourceTranslations[key] || key,
            translatedText: key, // Fallback - использовать ключ как перевод
            confidence: 0,
            needsReview: true
          }));
        }
      }
    }
    
    // Этот код не должен достигаться из-за return в цикле
    return [];
  }
  
  // Формирование промпта для перевода
  private static buildTranslationPrompt(
    sourceLanguage: string,
    targetLanguage: string,
    keys: string[],
    sourceTranslations: Record<string, string>
  ): string {
    const keyValuePairs = keys.map(key => {
      const value = sourceTranslations[key] || key;
      // Экранируем специальные символы для JSON
      const escapedKey = key.replace(/"/g, '\\"');
      const escapedValue = value.replace(/"/g, '\\"');
      return `"${escapedKey}": "${escapedValue}"`;
    }).join('\n');
    
    return `Translate the following JSON keys from ${sourceLanguage} to ${targetLanguage}:

{
${keyValuePairs}
}

Return the result in the same JSON format, keeping the same keys but with translated values.

IMPORTANT: 
- Return ONLY the JSON object, no additional text
- Keep all keys exactly as they are
- Translate only the values
- Preserve any emojis, special characters, or placeholders`;
  }
  
  // Расчет уверенности в переводе
  private static calculateConfidence(translation: string, key: string): number {
    if (!translation || translation.length === 0) return 0;
    if (translation === key) return 0.1; // Очень низкая уверенность если перевод равен ключу
    
    let confidence = 0.8; // Базовая уверенность
    
    // Снижаем уверенность за очень короткие или длинные переводы
    if (translation.length < 3) confidence -= 0.3;
    if (translation.length > 100) confidence -= 0.1;
    
    // Снижаем если есть подозрительные символы
    if (translation.includes('??') || translation.includes('???')) confidence -= 0.4;
    if (translation.includes('[missing') || translation.includes('[undefined')) confidence -= 0.5;
    
    // Снижаем если есть английские слова в неанглийском переводе
    const englishWords = /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi;
    if (englishWords.test(translation) && translation.length > 10) confidence -= 0.2;
    
    // Повышаем уверенность для качественных признаков
    if (translation.includes(' ') && translation.length > 5) confidence += 0.1;
    if (!/[a-z]{10,}/i.test(translation)) confidence += 0.1; // Нет длинных английских слов
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  // Определение необходимости ручной проверки
  private static needsReview(translation: string, key: string): boolean {
    // Ключи, требующие обязательной проверки
    const criticalKeys = [
      'app_title', 'app_subtitle', 'legal_terms', 'privacy_policy',
      'welcome_title', 'diary_name'
    ];
    
    if (criticalKeys.includes(key)) return true;
    
    // Подозрительные паттерны
    const suspiciousPatterns = [
      /\?\?+/g,           // Множественные вопросительные знаки
      /\[.*?\]/g,         // Непереведенные плейсхолдеры
      /translation/i,     // Слово "translation" в переводе
      /undefined/i,       // "undefined" в переводе
      /missing/i,         // "missing" в переводе
      /\b[a-z]{15,}\b/gi  // Длинные английские слова
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(translation));
  }
  
  // Вспомогательные методы
  
  private static createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }
  
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // API методы для взаимодействия с бэкендом

  private static async getAllTranslationKeys(): Promise<string[]> {
    try {
      const response = await fetch('/api/i18n/keys');
      if (!response.ok) throw new Error('Failed to fetch keys');

      const data = await response.json();
      return data.keys || [];
    } catch (error) {
      console.error('Error fetching translation keys:', error);
      return this.getFallbackKeys();
    }
  }

  private static async getTranslations(language: string): Promise<Record<string, string>> {
    try {
      const response = await fetch(`/api/i18n/translations/${language}`);
      if (!response.ok) throw new Error('Failed to fetch translations');

      const data = await response.json();
      return data.translations || {};
    } catch (error) {
      console.error(`Error fetching translations for ${language}:`, error);
      return {};
    }
  }

  private static async getMissingTranslations(
    allKeys: string[],
    targetLanguages: string[]
  ): Promise<{ [language: string]: string[] }> {
    const missing: { [language: string]: string[] } = {};

    for (const language of targetLanguages) {
      try {
        const translations = await this.getTranslations(language);
        missing[language] = allKeys.filter(key => !translations[key]);
      } catch (error) {
        console.error(`Error checking missing translations for ${language}:`, error);
        missing[language] = allKeys; // Предполагаем, что все ключи отсутствуют
      }
    }

    return missing;
  }

  private static async saveTranslations(
    language: string,
    results: AutoTranslationResult[]
  ): Promise<void> {
    try {
      const translations = results.reduce((acc, result) => {
        acc[result.key] = result.translatedText;
        return acc;
      }, {} as Record<string, string>);

      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      const response = await fetch('/api/i18n/admin/translations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          language,
          translations,
          autoTranslated: true,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save translations: ${response.status}`);
      }

      console.log(`Saved ${results.length} translations for ${language}`);
    } catch (error) {
      console.error(`Error saving translations for ${language}:`, error);
    }
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

  // Проверка доступности OpenAI API
  static async checkOpenAIAvailability(apiKey: string): Promise<{
    available: boolean;
    error?: string;
    model?: string;
  }> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        return {
          available: false,
          error: `OpenAI API error: ${response.status}`
        };
      }

      const data = await response.json();
      const hasGPT4 = data.data.some((model: any) => model.id.includes('gpt-4'));

      return {
        available: true,
        model: hasGPT4 ? 'gpt-4-turbo-preview' : 'gpt-3.5-turbo'
      };
    } catch (error) {
      return {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Получение стоимости автоперевода
  static estimateTranslationCost(
    _sourceLanguage: string,
    targetLanguages: string[],
    _apiKey: string
  ): Promise<{
    estimatedCost: number;
    estimatedTime: number;
    keyCount: number;
  }> {
    // Это упрощенная оценка. В реальном приложении нужно сделать API вызов
    return Promise.resolve({
      estimatedCost: targetLanguages.length * 0.05, // $0.05 за язык
      estimatedTime: targetLanguages.length * 30, // 30 секунд на язык
      keyCount: 100 // Примерное количество ключей
    });
  }
}

