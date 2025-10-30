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
// Re-export commonly used functions
export {
  DATE_FORMATS,
  formatDate,
  formatRelativeTime,
  formatTime,
} from './DateFormatter';
export * from './NumberFormatter';

export {
  formatCompact,
  formatCurrency,
  formatDuration,
  formatFileSize,
  formatNumber,
  formatPercent,
  NUMBER_FORMATS,
} from './NumberFormatter';
