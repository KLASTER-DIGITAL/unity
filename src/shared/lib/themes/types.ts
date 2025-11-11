/**
 * Theme Types for UNITY-v2
 * Поддержка базовых и Premium тем
 */

export type BaseTheme = 'light' | 'dark' | 'system';

export type PremiumTheme =
	| 'sunset'
	| 'ocean'
	| 'forest'
	| 'sakura'
	| 'night'
	| 'coffee'
	| 'lavender';

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

export const PREMIUM_THEMES: ThemeInfo[] = [
	{
		id: 'sunset',
		name: 'Закат',
		description: 'Теплые оранжево-розовые тона',
		isPremium: true,
		icon: '🌅',
		preview: {
			primary: '#ff6b35',
			secondary: '#ff8c94',
			background: '#fff5f0',
		},
	},
	{
		id: 'ocean',
		name: 'Океан',
		description: 'Глубокие сине-бирюзовые тона',
		isPremium: true,
		icon: '🌊',
		preview: {
			primary: '#0077be',
			secondary: '#40e0d0',
			background: '#f0f8ff',
		},
	},
	{
		id: 'forest',
		name: 'Лес',
		description: 'Природные зеленые тона',
		isPremium: true,
		icon: '🌲',
		preview: {
			primary: '#228b22',
			secondary: '#6b8e23',
			background: '#f5fff5',
		},
	},
	{
		id: 'sakura',
		name: 'Сакура',
		description: 'Нежные розовые тона',
		isPremium: true,
		icon: '🌸',
		preview: {
			primary: '#ffb7c5',
			secondary: '#db7093',
			background: '#fff0f5',
		},
	},
	{
		id: 'night',
		name: 'Ночь',
		description: 'Глубокие темные тона',
		isPremium: true,
		icon: '🌃',
		preview: {
			primary: '#4169e1',
			secondary: '#9370db',
			background: '#0a0a1a',
		},
	},
	{
		id: 'coffee',
		name: 'Кофе',
		description: 'Теплые коричневые тона',
		isPremium: true,
		icon: '☕',
		preview: {
			primary: '#6f4e37',
			secondary: '#a67b5b',
			background: '#faf5f0',
		},
	},
	{
		id: 'lavender',
		name: 'Лаванда',
		description: 'Нежные фиолетовые тона',
		isPremium: true,
		icon: '💜',
		preview: {
			primary: '#9370db',
			secondary: '#dda0dd',
			background: '#f8f5ff',
		},
	},
];

export const ALL_THEMES: ThemeInfo[] = [...BASE_THEMES, ...PREMIUM_THEMES];
