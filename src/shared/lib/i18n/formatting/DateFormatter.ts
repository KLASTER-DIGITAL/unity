/**
 * Date formatting utilities for i18n
 * 
 * Uses Intl.DateTimeFormat API for locale-aware date formatting
 * 
 * Features:
 * - Multiple date formats (short, medium, long, full)
 * - Relative time formatting (time ago)
 * - Custom format patterns
 * - Timezone support
 */

export type DateFormatStyle = 'short' | 'medium' | 'long' | 'full';

export interface DateFormatOptions {
  style?: DateFormatStyle;
  includeTime?: boolean;
  timezone?: string;
}

export interface RelativeTimeOptions {
  style?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
}

/**
 * Format a date according to locale
 */
export function formatDate(
  date: Date | string | number,
  locale: string,
  options: DateFormatOptions = {}
): string {
  const {
    style = 'medium',
    includeTime = false,
    timezone
  } = options;
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return String(date);
  }
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle: style,
    ...(timezone && { timeZone: timezone })
  };
  
  if (includeTime) {
    formatOptions.timeStyle = style;
  }
  
  try {
    return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Format relative time (time ago)
 * 
 * Examples:
 * - "5 minutes ago"
 * - "2 hours ago"
 * - "yesterday"
 * - "last week"
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string,
  options: RelativeTimeOptions = {}
): string {
  const {
    style = 'long',
    numeric = 'auto'
  } = options;
  
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return String(date);
  }
  
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);
  
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric, style });
    
    if (Math.abs(diffSeconds) < 60) {
      return rtf.format(-diffSeconds, 'second');
    } else if (Math.abs(diffMinutes) < 60) {
      return rtf.format(-diffMinutes, 'minute');
    } else if (Math.abs(diffHours) < 24) {
      return rtf.format(-diffHours, 'hour');
    } else if (Math.abs(diffDays) < 7) {
      return rtf.format(-diffDays, 'day');
    } else if (Math.abs(diffWeeks) < 4) {
      return rtf.format(-diffWeeks, 'week');
    } else if (Math.abs(diffMonths) < 12) {
      return rtf.format(-diffMonths, 'month');
    } else {
      return rtf.format(-diffYears, 'year');
    }
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return formatDate(dateObj, locale, { style: 'short' });
  }
}

/**
 * Format time only
 */
export function formatTime(
  date: Date | string | number,
  locale: string,
  style: DateFormatStyle = 'short'
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return String(date);
  }
  
  try {
    return new Intl.DateTimeFormat(locale, { timeStyle: style }).format(dateObj);
  } catch (error) {
    console.error('Time formatting error:', error);
    return dateObj.toLocaleTimeString();
  }
}

/**
 * Format date with custom pattern
 */
export function formatDateCustom(
  date: Date | string | number,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return String(date);
  }
  
  try {
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch (error) {
    console.error('Custom date formatting error:', error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Get locale-specific date parts
 */
export function getDateParts(
  date: Date | string | number,
  locale: string
): Intl.DateTimeFormatPart[] {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date:', date);
    return [];
  }
  
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).formatToParts(dateObj);
  } catch (error) {
    console.error('Date parts error:', error);
    return [];
  }
}

/**
 * Common date format presets
 */
export const DATE_FORMATS = {
  // Short formats
  shortDate: (date: Date | string | number, locale: string) => 
    formatDate(date, locale, { style: 'short' }),
  
  shortDateTime: (date: Date | string | number, locale: string) => 
    formatDate(date, locale, { style: 'short', includeTime: true }),
  
  // Medium formats
  mediumDate: (date: Date | string | number, locale: string) => 
    formatDate(date, locale, { style: 'medium' }),
  
  mediumDateTime: (date: Date | string | number, locale: string) => 
    formatDate(date, locale, { style: 'medium', includeTime: true }),
  
  // Long formats
  longDate: (date: Date | string | number, locale: string) => 
    formatDate(date, locale, { style: 'long' }),
  
  longDateTime: (date: Date | string | number, locale: string) => 
    formatDate(date, locale, { style: 'long', includeTime: true }),
  
  // Time only
  time: (date: Date | string | number, locale: string) => 
    formatTime(date, locale, 'short'),
  
  timeWithSeconds: (date: Date | string | number, locale: string) => 
    formatTime(date, locale, 'medium'),
  
  // Relative time
  timeAgo: (date: Date | string | number, locale: string) => 
    formatRelativeTime(date, locale, { style: 'long', numeric: 'auto' }),
  
  timeAgoShort: (date: Date | string | number, locale: string) => 
    formatRelativeTime(date, locale, { style: 'short', numeric: 'auto' }),
  
  // Custom formats
  monthYear: (date: Date | string | number, locale: string) => 
    formatDateCustom(date, locale, { year: 'numeric', month: 'long' }),
  
  dayMonth: (date: Date | string | number, locale: string) => 
    formatDateCustom(date, locale, { day: 'numeric', month: 'long' }),
  
  weekday: (date: Date | string | number, locale: string) => 
    formatDateCustom(date, locale, { weekday: 'long' }),
  
  weekdayShort: (date: Date | string | number, locale: string) => 
    formatDateCustom(date, locale, { weekday: 'short' })
};

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const today = new Date();
  return dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear();
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string | number): boolean {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear();
}

