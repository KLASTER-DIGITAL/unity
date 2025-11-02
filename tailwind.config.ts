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
				50: 50, // Voice Orb - canvas (под backdrop)
				51: 51, // Voice Orb - button (под backdrop)
				'modal-backdrop': 60, // Modal backdrop (above navigation)
				70: 70, // Voice Orb - canvas (поверх backdrop)
				80: 80, // Voice Orb - button (поверх backdrop)
				99: 99,
				100: 100,
				101: 101,
			},
		},
	},
	plugins: [],
} satisfies Config;
