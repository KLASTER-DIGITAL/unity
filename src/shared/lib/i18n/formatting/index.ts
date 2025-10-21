/**
 * Formatting utilities for i18n
 * 
 * Provides locale-aware formatting for:
 * - Dates and times
 * - Numbers and currencies
 * - Relative time
 * - File sizes
 * - Durations
 */

export * from './DateFormatter';
export * from './NumberFormatter';

// Re-export commonly used functions
export {
  formatDate,
  formatTime,
  formatRelativeTime,
  DATE_FORMATS
} from './DateFormatter';

export {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatCompact,
  formatFileSize,
  formatDuration,
  NUMBER_FORMATS
} from './NumberFormatter';

