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
				50: 50, // Voice Orb - backdrop (САМЫЙ НИЖНИЙ слой, кликабельный для закрытия)
				51: 51, // (не используется)
				'modal-backdrop': 60, // (не используется, оставлен для совместимости)
				modal: 70, // Voice Orb - WebGL canvas (поверх backdrop, pointer-events-none)
				80: 80, // Voice Orb - кнопки (САМЫЙ ВЕРХНИЙ слой, pointer-events-auto)
				99: 99,
				100: 100,
				101: 101,
			},
		},
	},
	plugins: [],
} satisfies Config;
