import {
  Heart,
  Briefcase,
  DollarSign,
  Users,
  Sparkles
} from "lucide-react";

/**
 * Category icons mapping
 */
export const CATEGORY_ICONS: { [key: string]: any } = {
  'Семья': Users,
  'Работа': Briefcase,
  'Финансы': DollarSign,
  'Благодарность': Heart,
  'Здоровье': Sparkles,
  'Личное развитие': Sparkles,
  'Творчество': Sparkles,
  'Отношения': Heart
};

/**
 * Sentiment colors mapping
 */
export const SENTIMENT_COLORS = {
  positive: 'bg-[var(--ios-green)]/10 text-[var(--ios-green)]',
  neutral: 'bg-[var(--ios-blue)]/10 text-[var(--ios-blue)]',
  negative: 'bg-[var(--ios-orange)]/10 text-[var(--ios-orange)]'
};

/**
 * Available categories
 */
export const CATEGORIES = [
  'Другое',
  'Семья',
  'Работа',
  'Финансы',
  'Благодарность',
  'Здоровье',
  'Личное развитие',
  'Творчество',
  'Отношения'
];

