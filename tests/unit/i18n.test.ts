/**
 * Unit tests for i18n System
 * Tests: language switching, translation loading, fallback mechanism
 * Coverage target: 80%+
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Translations } from '@/shared/lib/api/i18n-types';
import { I18nAPI } from '@/shared/lib/i18n/api';
import { getFallbackKey, getFallbackTranslation } from '@/shared/lib/i18n/fallback';
import { TranslationLoader } from '@/shared/lib/i18n/loader';

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock storage
vi.mock('@/shared/lib/platform/storage', () => ({
  storage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}));

describe('i18n System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Fallback Translations', () => {
    it('should return Russian translations for "ru" language', () => {
      const translations = getFallbackTranslation('ru');

      expect(translations).toBeDefined();
      expect(translations.greeting).toBe('Привет!');
      expect(translations.home).toBe('Главная');
      expect(translations.settings).toBe('Настройки');
    });

    it('should return English translations for "en" language', () => {
      const translations = getFallbackTranslation('en');

      expect(translations).toBeDefined();
      expect(translations.greeting).toBe('Hello!');
      expect(translations.home).toBe('Home');
      expect(translations.settings).toBe('Settings');
    });

    it('should return Spanish translations for "es" language', () => {
      const translations = getFallbackTranslation('es');

      expect(translations).toBeDefined();
      expect(translations.greeting).toBe('¡Hola!');
      expect(translations.home).toBe('Inicio');
    });

    it('should return Chinese translations for "zh" language', () => {
      const translations = getFallbackTranslation('zh');

      expect(translations).toBeDefined();
      expect(translations.greeting).toBe('你好！');
      expect(translations.home).toBe('首页');
    });

    it('should fallback to Russian for unknown language', () => {
      const translations = getFallbackTranslation('unknown');

      expect(translations).toBeDefined();
      expect(translations.greeting).toBe('Привет!');
    });

    it('should get specific key from fallback translations', () => {
      const greeting = getFallbackKey('en', 'greeting');
      expect(greeting).toBe('Hello!');

      const home = getFallbackKey('ru', 'home');
      expect(home).toBe('Главная');
    });

    it('should return key itself if translation not found', () => {
      const unknownKey = getFallbackKey('en', 'nonexistent_key' as keyof Translations);
      expect(unknownKey).toBe('nonexistent_key');
    });
  });

  describe('I18nAPI - getSupportedLanguages', () => {
    it('should fetch supported languages from API', async () => {
      const mockLanguages = [
        { code: 'ru', name: 'Русский', nativeName: 'Русский', isActive: true },
        { code: 'en', name: 'English', nativeName: 'English', isActive: true },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLanguages,
      });

      const languages = await I18nAPI.getSupportedLanguages();

      expect(languages).toBeDefined();
      expect(Array.isArray(languages)).toBe(true);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle legacy API response format', async () => {
      const mockLegacyResponse = {
        success: true,
        languages: [{ code: 'ru', name: 'Русский', nativeName: 'Русский', isActive: true }],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockLegacyResponse,
      });

      const languages = await I18nAPI.getSupportedLanguages();

      expect(languages).toBeDefined();
      expect(Array.isArray(languages)).toBe(true);
    });
  });

  describe('I18nAPI - getTranslations', () => {
    it('should fetch translations for a language', async () => {
      const mockTranslations = {
        greeting: 'Hello!',
        home: 'Home',
        settings: 'Settings',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('etag-123'),
        },
        json: async () => mockTranslations,
      });

      const translations = await I18nAPI.getTranslations('en');

      expect(translations).toBeDefined();
      expect(typeof translations).toBe('object');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should use cache with ETag if provided', async () => {
      const mockTranslations = {
        greeting: 'Hello!',
        home: 'Home',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('etag-456'),
        },
        json: async () => mockTranslations,
      });

      const result = await I18nAPI.getTranslations('en', { useCache: true, etag: 'abc123' });

      // Verify translations were returned
      expect(result).toEqual(mockTranslations);
      // Verify fetch was called
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle cache headers correctly', async () => {
      const mockTranslations = {
        greeting: 'Hello!',
        home: 'Home',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn((header: string) => {
            if (header === 'ETag') return 'etag-789';
            return null;
          }),
        },
        json: async () => mockTranslations,
      });

      const translations = await I18nAPI.getTranslations('en', {
        useCache: true,
      });

      expect(translations).toEqual(mockTranslations);
    });

    it('should handle API error for translations', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(I18nAPI.getTranslations('unknown')).rejects.toThrow(
        'Failed to fetch translations: 404 Not Found'
      );
    });
  });

  describe('TranslationLoader Integration', () => {
    it('should return translation result with required fields', async () => {
      // Mock successful API response
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          translations: { greeting: 'Hello!' },
        }),
      });

      const result = await TranslationLoader.loadTranslations({
        language: 'en',
        fallbackLanguage: 'ru',
      });

      // Verify result structure
      expect(result).toHaveProperty('translations');
      expect(result).toHaveProperty('language');
      expect(result).toHaveProperty('usedFallback');
      expect(result.translations).toBeDefined();
    });

    it('should call fetch API when loading translations', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          translations: {},
        }),
      });

      await TranslationLoader.loadTranslations({
        language: 'en',
        fallbackLanguage: 'ru',
      });

      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('Language Switching', () => {
    it('should validate language codes', () => {
      const validLanguages = ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja'];

      validLanguages.forEach((lang) => {
        const translations = getFallbackTranslation(lang);
        expect(translations).toBeDefined();
        expect(translations.greeting).toBeDefined();
      });
    });

    it('should handle language switching with fallback', () => {
      // Switch from Russian to English
      const ruTranslations = getFallbackTranslation('ru');
      expect(ruTranslations.greeting).toBe('Привет!');

      const enTranslations = getFallbackTranslation('en');
      expect(enTranslations.greeting).toBe('Hello!');

      // Verify they are different
      expect(ruTranslations.greeting).not.toBe(enTranslations.greeting);
    });
  });
});
