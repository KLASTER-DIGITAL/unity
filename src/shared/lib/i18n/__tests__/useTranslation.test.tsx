/**
 * Unit тесты для useTranslation хука
 *
 * @author UNITY Team
 * @date 2025-11-19
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TranslationProvider } from '../TranslationProvider';
import { useTranslation } from '../useTranslation';

// Mock fetch для тестов
global.fetch = vi.fn();

const mockTranslations = {
	ru: {
		welcome_title: 'Добро пожаловать',
		hello_world: 'Привет, мир!',
		items_one: 'предмет',
		items_few: 'предмета',
		items_many: 'предметов',
	},
	en: {
		welcome_title: 'Welcome',
		hello_world: 'Hello, world!',
		items_one: 'item',
		items_other: 'items',
	},
	kk: {
		welcome_title: 'Қош келдіңіз',
		hello_world: 'Сәлем, әлем!',
		items_one: 'зат',
		items_other: 'заттар',
	},
};

describe('useTranslation', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		localStorage.clear();

		// Mock успешного ответа от API c заголовками ETag
		(global.fetch as any).mockImplementation((url: string) => {
			const lang = url.includes('/ru') ? 'ru' : url.includes('/en') ? 'en' : 'kk';
			return Promise.resolve({
				ok: true,
				headers: {
					get: (name: string) => (name.toLowerCase() === 'etag' ? `"test-etag-${lang}"` : null),
				},
				json: () => Promise.resolve(mockTranslations[lang as keyof typeof mockTranslations]),
			});
		});
	});

	it('должен загружать переводы для русского языка по умолчанию', async () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<TranslationProvider defaultLanguage="ru">{children}</TranslationProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		await waitFor(() => {
			expect(result.current.isLoaded).toBe(true);
		});

		expect(result.current.currentLanguage).toBe('ru');
		expect(result.current.t('welcome_title')).toBe('Добро пожаловать');
	});

	it('должен переключаться на английский язык', async () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<TranslationProvider defaultLanguage="ru">{children}</TranslationProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		await waitFor(() => {
			expect(result.current.isLoaded).toBe(true);
		});

		// Переключаем на английский
		await result.current.changeLanguage('en');

		await waitFor(() => {
			expect(result.current.currentLanguage).toBe('en');
		});

		expect(result.current.t('welcome_title')).toBe('Welcome');
	});

	it('должен работать с казахским языком', async () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<TranslationProvider defaultLanguage="kk">{children}</TranslationProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		await waitFor(() => {
			expect(result.current.isLoaded).toBe(true);
		});

		expect(result.current.currentLanguage).toBe('kk');
		expect(result.current.t('welcome_title')).toBe('Қош келдіңіз');
		expect(result.current.t('hello_world')).toBe('Сәлем, әлем!');
	});

	it('должен возвращать fallback текст если перевод не найден', async () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<TranslationProvider defaultLanguage="ru">{children}</TranslationProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		await waitFor(() => {
			expect(result.current.isLoaded).toBe(true);
		});

		expect(result.current.t('non_existent_key' as any, 'Fallback text')).toBe('Fallback text');
	});

	it('должен проверять наличие перевода', async () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<TranslationProvider defaultLanguage="ru">{children}</TranslationProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		await waitFor(() => {
			expect(result.current.isLoaded).toBe(true);
		});

		expect(result.current.hasTranslation('welcome_title')).toBe(true);
		expect(result.current.hasTranslation('non_existent_key' as any)).toBe(false);
	});

	it('должен сохранять выбранный язык в localStorage', async () => {
		const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem');

		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<TranslationProvider defaultLanguage="ru">{children}</TranslationProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		await waitFor(() => {
			expect(result.current.isLoaded).toBe(true);
		});

		await result.current.changeLanguage('en');

		await waitFor(() => {
			expect(setItemSpy).toHaveBeenCalledWith('user_preferred_language', 'en');
		});
	});

	it('должен работать с плюрализацией', async () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<TranslationProvider defaultLanguage="ru">{children}</TranslationProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		await waitFor(() => {
			expect(result.current.isLoaded).toBe(true);
		});

		// Русский: 1 предмет, 2 предмета, 5 предметов
		expect(result.current.plural('items', 1)).toContain('предмет');
		expect(result.current.plural('items', 2)).toContain('предмета');
		expect(result.current.plural('items', 5)).toContain('предметов');
	});

	it('должен определять RTL направление', async () => {
		const wrapper = ({ children }: { children: React.ReactNode }) => (
			<TranslationProvider defaultLanguage="ru">{children}</TranslationProvider>
		);

		const { result } = renderHook(() => useTranslation(), { wrapper });

		await waitFor(() => {
			expect(result.current.isLoaded).toBe(true);
		});

		// Русский - LTR
		expect(result.current.isRTL).toBe(false);
		expect(result.current.direction).toBe('ltr');
	});
});
