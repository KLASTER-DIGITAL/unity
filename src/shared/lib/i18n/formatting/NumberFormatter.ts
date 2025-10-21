/**
 * Number formatting utilities for i18n
 * 
 * Uses Intl.NumberFormat API for locale-aware number formatting
 * 
 * Features:
 * - Decimal formatting
 * - Currency formatting
 * - Percentage formatting
 * - Compact notation (1K, 1M, 1B)
 * - Custom precision
 */

export type NumberFormatStyle = 'decimal' | 'currency' | 'percent' | 'unit';

export interface NumberFormatOptions {
  style?: NumberFormatStyle;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  compactDisplay?: 'short' | 'long';
  signDisplay?: 'auto' | 'never' | 'always' | 'exceptZero';
}

/**
 * Format a number according to locale
 */
export function formatNumber(
  value: number,
  locale: string,
  options: NumberFormatOptions = {}
): string {
  if (typeof value !== 'number' || isNaN(value)) {
    console.error('Invalid number:', value);
    return String(value);
  }
  
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    console.error('Number formatting error:', error);
    return value.toString();
  }
}

/**
 * Format currency
 */
export function formatCurrency(
  value: number,
  locale: string,
  currency: string = 'USD',
  options: Omit<NumberFormatOptions, 'style' | 'currency'> = {}
): string {
  return formatNumber(value, locale, {
    ...options,
    style: 'currency',
    currency
  });
}

/**
 * Format percentage
 */
export function formatPercent(
  value: number,
  locale: string,
  options: Omit<NumberFormatOptions, 'style'> = {}
): string {
  return formatNumber(value, locale, {
    ...options,
    style: 'percent'
  });
}

/**
 * Format number with compact notation (1K, 1M, 1B)
 */
export function formatCompact(
  value: number,
  locale: string,
  options: Omit<NumberFormatOptions, 'notation'> = {}
): string {
  return formatNumber(value, locale, {
    ...options,
    notation: 'compact',
    compactDisplay: 'short'
  });
}

/**
 * Format number with custom precision
 */
export function formatDecimal(
  value: number,
  locale: string,
  decimals: number = 2
): string {
  return formatNumber(value, locale, {
    style: 'decimal',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Format file size (bytes to KB, MB, GB)
 */
export function formatFileSize(
  bytes: number,
  locale: string,
  decimals: number = 2
): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  const value = bytes / Math.pow(k, i);
  const formattedValue = formatDecimal(value, locale, decimals);
  
  return `${formattedValue} ${sizes[i]}`;
}

/**
 * Format duration (seconds to human-readable)
 */
export function formatDuration(
  seconds: number,
  locale: string,
  style: 'short' | 'long' = 'short'
): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(style === 'short' ? `${hours}h` : `${hours} hours`);
  }
  if (minutes > 0) {
    parts.push(style === 'short' ? `${minutes}m` : `${minutes} minutes`);
  }
  if (secs > 0 || parts.length === 0) {
    parts.push(style === 'short' ? `${secs}s` : `${secs} seconds`);
  }
  
  return parts.join(' ');
}

/**
 * Format range of numbers
 */
export function formatNumberRange(
  start: number,
  end: number,
  locale: string,
  options: NumberFormatOptions = {}
): string {
  try {
    // @ts-ignore - formatRange is not in all TypeScript versions
    if (Intl.NumberFormat.prototype.formatRange) {
      // @ts-ignore
      return new Intl.NumberFormat(locale, options).formatRange(start, end);
    }
    
    // Fallback for older browsers
    const formattedStart = formatNumber(start, locale, options);
    const formattedEnd = formatNumber(end, locale, options);
    return `${formattedStart} - ${formattedEnd}`;
  } catch (error) {
    console.error('Number range formatting error:', error);
    return `${start} - ${end}`;
  }
}

/**
 * Format ordinal numbers (1st, 2nd, 3rd)
 */
export function formatOrdinal(
  value: number,
  locale: string
): string {
  // English ordinals
  if (locale.startsWith('en')) {
    const j = value % 10;
    const k = value % 100;
    
    if (j === 1 && k !== 11) return `${value}st`;
    if (j === 2 && k !== 12) return `${value}nd`;
    if (j === 3 && k !== 13) return `${value}rd`;
    return `${value}th`;
  }
  
  // Russian ordinals
  if (locale.startsWith('ru')) {
    return `${value}-й`;
  }
  
  // Spanish ordinals
  if (locale.startsWith('es')) {
    return `${value}º`;
  }
  
  // German ordinals
  if (locale.startsWith('de')) {
    return `${value}.`;
  }
  
  // French ordinals
  if (locale.startsWith('fr')) {
    return value === 1 ? `${value}er` : `${value}e`;
  }
  
  // Default
  return `${value}`;
}

/**
 * Common number format presets
 */
export const NUMBER_FORMATS = {
  // Decimal formats
  decimal: (value: number, locale: string) => 
    formatNumber(value, locale, { style: 'decimal' }),
  
  decimal2: (value: number, locale: string) => 
    formatDecimal(value, locale, 2),
  
  decimal0: (value: number, locale: string) => 
    formatDecimal(value, locale, 0),
  
  // Currency formats
  usd: (value: number, locale: string) => 
    formatCurrency(value, locale, 'USD'),
  
  eur: (value: number, locale: string) => 
    formatCurrency(value, locale, 'EUR'),
  
  rub: (value: number, locale: string) => 
    formatCurrency(value, locale, 'RUB'),
  
  // Percentage formats
  percent: (value: number, locale: string) => 
    formatPercent(value, locale),
  
  percent2: (value: number, locale: string) => 
    formatPercent(value, locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  
  // Compact formats
  compact: (value: number, locale: string) => 
    formatCompact(value, locale),
  
  compactLong: (value: number, locale: string) => 
    formatNumber(value, locale, { notation: 'compact', compactDisplay: 'long' }),
  
  // File size
  fileSize: (value: number, locale: string) => 
    formatFileSize(value, locale),
  
  // Duration
  duration: (value: number, locale: string) => 
    formatDuration(value, locale, 'short'),
  
  durationLong: (value: number, locale: string) => 
    formatDuration(value, locale, 'long'),
  
  // Ordinal
  ordinal: (value: number, locale: string) => 
    formatOrdinal(value, locale)
};

/**
 * Parse number from localized string
 */
export function parseNumber(
  value: string,
  locale: string
): number | null {
  try {
    // Remove grouping separators and replace decimal separator
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const groupSeparator = parts.find(p => p.type === 'group')?.value || ',';
    const decimalSeparator = parts.find(p => p.type === 'decimal')?.value || '.';
    
    const normalized = value
      .replace(new RegExp(`\\${groupSeparator}`, 'g'), '')
      .replace(decimalSeparator, '.');
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? null : parsed;
  } catch (error) {
    console.error('Number parsing error:', error);
    return null;
  }
}

/**
 * Get locale-specific number separators
 */
export function getNumberSeparators(locale: string): {
  decimal: string;
  group: string;
} {
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    return {
      decimal: parts.find(p => p.type === 'decimal')?.value || '.',
      group: parts.find(p => p.type === 'group')?.value || ','
    };
  } catch (error) {
    console.error('Get separators error:', error);
    return { decimal: '.', group: ',' };
  }
}

