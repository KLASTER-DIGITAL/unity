/**
 * Achievement Home Screen - Type definitions
 */

export interface DiaryData {
  name: string;
  emoji: string;
}

export interface AchievementHomeScreenProps {
  diaryData?: DiaryData;
  userData?: any;
  onNavigateToHistory?: () => void;
  onNavigateToSettings?: () => void;
}

export interface AchievementCard {
  id: string;
  entryId?: string;
  date: string;
  title: string;
  description: string;
  gradient: string;
  isMarked: boolean;
  isDefault?: boolean;
  sentiment?: string;
  mood?: string;
  category?: string;
}

export interface SwipeCardProps {
  card: AchievementCard;
  index: number;
  totalCards: number;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

