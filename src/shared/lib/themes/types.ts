/**
 * Theme Types for UNITY-v2
 * Поддержка базовых и Premium тем с разделением на светлые/темные цветовые схемы
 */

export type BaseTheme = 'light' | 'dark' | 'system';

export type LightColorScheme = 'sunset' | 'ocean' | 'forest' | 'sakura' | 'coffee' | 'lavender';
export type DarkColorScheme = 'night' | 'evening' | 'dusk' | 'midnight';

export type ColorScheme = LightColorScheme | DarkColorScheme | null;

// Legacy type для обратной совместимости
export type PremiumTheme = LightColorScheme | DarkColorScheme;
export type Theme = BaseTheme | PremiumTheme;

export interface ThemeInfo {
	id: Theme;
	name: string;
	description: string;
	isPremium: boolean;
	icon: string; // Emoji icon
	preview: {
		primary: string;
		secondary: string;
		background: string;
	};
	// Новое: градиент для круглых карточек
	gradient?: {
		start: string; // Начальный цвет градиента
		end: string; // Конечный цвет градиента
	};
	// Новое: принадлежность к светлой/темной базовой теме
	baseTheme?: 'light' | 'dark';
}

export const BASE_THEMES: ThemeInfo[] = [
	{
		id: 'light',
		name: 'Светлая',
		description: 'Классическая светлая тема',
		isPremium: false,
		icon: '☀️',
		preview: {
			primary: '#007aff',
			secondary: '#5856d6',
			background: '#ffffff',
		},
	},
	{
		id: 'dark',
		name: 'Темная',
		description: 'Классическая темная тема',
		isPremium: false,
		icon: '🌙',
		preview: {
			primary: '#0a84ff',
			secondary: '#5e5ce6',
			background: '#000000',
		},
	},
];

// Светлые Premium цветовые схемы (для light базовой темы)
export const LIGHT_COLOR_SCHEMES: ThemeInfo[] = [
	{
		id: 'sunset',
		name: 'Закат',
		description: 'Теплые оранжево-розовые тона',
		isPremium: true,
		icon: '🌅',
		baseTheme: 'light',
		preview: {
			primary: '#ff6b35',
			secondary: '#ff8c94',
			background: '#fff5f0',
		},
		gradient: {
			start: '#ff6b35', // Оранжевый
			end: '#ff8c94', // Розовый
		},
	},
	{
		id: 'ocean',
		name: 'Океан',
		description: 'Глубокие сине-бирюзовые тона',
		isPremium: true,
		icon: '🌊',
		baseTheme: 'light',
		preview: {
			primary: '#0077be',
			secondary: '#40e0d0',
			background: '#f0f8ff',
		},
		gradient: {
			start: '#0077be', // Синий
			end: '#40e0d0', // Бирюзовый
		},
	},
	{
		id: 'forest',
		name: 'Лес',
		description: 'Природные зеленые тона',
		isPremium: true,
		icon: '🌲',
		baseTheme: 'light',
		preview: {
			primary: '#228b22',
			secondary: '#6b8e23',
			background: '#f5fff5',
		},
		gradient: {
			start: '#228b22', // Зеленый
			end: '#6b8e23', // Оливковый
		},
	},
	{
		id: 'sakura',
		name: 'Сакура',
		description: 'Нежные розовые тона',
		isPremium: true,
		icon: '🌸',
		baseTheme: 'light',
		preview: {
			primary: '#ffb7c5',
			secondary: '#db7093',
			background: '#fff0f5',
		},
		gradient: {
			start: '#ffb7c5', // Светло-розовый
			end: '#db7093', // Пурпурный
		},
	},
	{
		id: 'coffee',
		name: 'Кофе',
		description: 'Теплые коричневые тона',
		isPremium: true,
		icon: '☕',
		baseTheme: 'light',
		preview: {
			primary: '#6f4e37',
			secondary: '#a67b5b',
			background: '#faf5f0',
		},
		gradient: {
			start: '#6f4e37', // Коричневый
			end: '#a67b5b', // Светло-коричневый
		},
	},
	{
		id: 'lavender',
		name: 'Лаванда',
		description: 'Нежные фиолетовые тона',
		isPremium: true,
		icon: '💜',
		baseTheme: 'light',
		preview: {
			primary: '#9370db',
			secondary: '#dda0dd',
			background: '#f8f5ff',
		},
		gradient: {
			start: '#9370db', // Лавандовый
			end: '#dda0dd', // Сиреневый
		},
	},
];

// Темные Premium цветовые схемы (для dark базовой темы)
export const DARK_COLOR_SCHEMES: ThemeInfo[] = [
	{
		id: 'evening',
		name: 'Вечер',
		description: 'Теплые вечерние тона',
		isPremium: true,
		icon: '🌆',
		baseTheme: 'dark',
		preview: {
			primary: '#8b4513',
			secondary: '#cd853f',
			background: '#1a1a1a',
		},
		gradient: {
			start: '#8b4513', // Коричневый вечерний
			end: '#cd853f', // Персиковый
		},
	},
	{
		id: 'dusk',
		name: 'Закат',
		description: 'Темные тона заката',
		isPremium: true,
		icon: '🌇',
		baseTheme: 'dark',
		preview: {
			primary: '#8b0000',
			secondary: '#ff6347',
			background: '#0a0a0a',
		},
		gradient: {
			start: '#8b0000', // Темно-красный
			end: '#ff6347', // Томатный
		},
	},
	{
		id: 'midnight',
		name: 'Полночь',
		description: 'Глубокие сине-черные тона',
		isPremium: true,
		icon: '🌌',
		baseTheme: 'dark',
		preview: {
			primary: '#1e3a8a',
			secondary: '#3b82f6',
			background: '#0a0a0a',
		},
		gradient: {
			start: '#1e3a8a', // Темно-синий
			end: '#3b82f6', // Яркий синий
		},
	},
	{
		id: 'night',
		name: 'Ночь',
		description: 'Глубокие темные тона',
		isPremium: true,
		icon: '🌃',
		baseTheme: 'dark',
		preview: {
			primary: '#4169e1',
			secondary: '#9370db',
			background: '#0a0a1a',
		},
		gradient: {
			start: '#4169e1', // Синий
			end: '#9370db', // Фиолетовый
		},
	},
];

// Все Premium темы (для обратной совместимости)
export const PREMIUM_THEMES: ThemeInfo[] = [...LIGHT_COLOR_SCHEMES, ...DARK_COLOR_SCHEMES];

// Все темы
export const ALL_THEMES: ThemeInfo[] = [...BASE_THEMES, ...PREMIUM_THEMES];

// Утилиты для работы с темами
export function isLightColorScheme(scheme: ColorScheme): scheme is LightColorScheme {
	return scheme !== null && LIGHT_COLOR_SCHEMES.some((s) => s.id === scheme);
}

export function isDarkColorScheme(scheme: ColorScheme): scheme is DarkColorScheme {
	return scheme !== null && DARK_COLOR_SCHEMES.some((s) => s.id === scheme);
}

export function getColorSchemeBaseTheme(scheme: ColorScheme): BaseTheme | null {
	if (!scheme) return null;
	const themeInfo = PREMIUM_THEMES.find((t) => t.id === scheme);
	return themeInfo?.baseTheme || null;
}
