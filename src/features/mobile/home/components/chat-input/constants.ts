/**
 * Constants for Chat Input Section
 */

import type { Category } from "./types";

// Категории для быстрого выбора - все 9 тегов системы
export const CATEGORIES: Category[] = [
  { id: 'Семья', label: 'Семья', icon: '👨‍👩‍👧', color: 'var(--gradient-neutral-1-start)' },
  { id: 'Работа', label: 'Работа', icon: '💼', color: 'var(--gradient-neutral-1-start)' },
  { id: 'Финансы', label: 'Финансы', icon: '💰', color: 'var(--gradient-neutral-1-start)' },
  { id: 'Благодарность', label: 'Благодарность', icon: '🙏', color: 'var(--gradient-neutral-1-start)' },
  { id: 'Здоровье', label: 'Здоровье', icon: '💪', color: 'var(--gradient-neutral-1-start)' },
  { id: 'Личное развитие', label: 'Личное развитие', icon: '📚', color: 'var(--gradient-neutral-1-start)' },
  { id: 'Творчество', label: 'Творчество', icon: '🎨', color: 'var(--gradient-neutral-1-start)' },
  { id: 'Отношения', label: 'Отношения', icon: '❤️', color: 'var(--gradient-neutral-1-start)' },
  { id: 'Другое', label: 'Другое', icon: '✨', color: 'var(--gradient-neutral-1-start)' }
];

