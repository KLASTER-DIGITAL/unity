/**
 * Achievement Home Screen - Modular exports
 */

export { GRADIENTS, UNIQUE_GRADIENTS } from './constants';
export { SwipeCard } from './SwipeCard';
export type {
	AchievementCard,
	AchievementHomeScreenProps,
	DiaryData,
	SwipeCardProps,
} from './types';
export { useDefaultMotivations } from './useDefaultMotivations';
export { entryToCard, getDefaultMotivations } from './utils';

// ❌ DEPRECATED: DEFAULT_MOTIVATIONS constant removed
// Use useDefaultMotivations() hook instead for i18n support
