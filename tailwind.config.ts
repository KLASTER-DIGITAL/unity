import type { Config } from 'tailwindcss';

export default {
	darkMode: ['class'],
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			colors: {},
			zIndex: {
				40: 40, // Mobile Navigation (НИЖЕ modal backdrop)
				50: 50, // (не используется)
				51: 51, // (не используется)
				'modal-backdrop': 60, // Voice Orb - backdrop (ПОВЕРХ navigation, затемняет ВСЁ)
				70: 70, // Voice Orb - WebGL canvas (ПОВЕРХ backdrop, pointer-events-none)
				modal: 70, // Alias для z-70 (для совместимости)
				80: 80, // Voice Orb - кнопки (САМЫЙ ВЕРХНИЙ слой, pointer-events-auto)
				99: 99,
				100: 100,
				101: 101,
			},
		},
	},
	plugins: [],
} satisfies Config;
