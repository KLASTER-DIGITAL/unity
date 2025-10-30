/**
 * Achievement Home Screen - Type definitions
 */

export type DiaryData = {
  name: string;
  emoji: string;
};

export type AchievementHomeScreenProps = {
  diaryData?: DiaryData;
  userData?: any;
  onNavigateToHistory?: () => void;
  onNavigateToSettings?: () => void;
};

export type AchievementCard = {
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
};

export type SwipeCardProps = {
  card: AchievementCard;
  index: number;
  totalCards: number;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
};
