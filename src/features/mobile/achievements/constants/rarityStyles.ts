// Rarity color system (light/dark mode compatible)
export const RARITY_STYLES = {
	legendary: {
		gradient: 'bg-gradient-to-br from-purple-400 to-purple-600',
		badge: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
		glow: 'shadow-sm shadow-purple-500/20',
		text: 'text-purple-600 dark:text-purple-400',
	},
	epic: {
		gradient: 'bg-gradient-to-br from-orange-400 to-orange-600',
		badge: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
		glow: 'shadow-sm shadow-orange-500/20',
		text: 'text-orange-600 dark:text-orange-400',
	},
	rare: {
		gradient: 'bg-gradient-to-br from-blue-400 to-blue-600',
		badge: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
		glow: 'shadow-sm shadow-blue-500/20',
		text: 'text-blue-600 dark:text-blue-400',
	},
	common: {
		gradient: 'bg-gradient-to-br from-gray-400 to-gray-600',
		badge: 'bg-muted text-muted-foreground',
		glow: 'shadow-sm',
		text: 'text-muted-foreground',
	},
} as const;

export type RarityType = keyof typeof RARITY_STYLES;
