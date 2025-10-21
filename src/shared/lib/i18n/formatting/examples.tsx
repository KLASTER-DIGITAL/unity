/**
 * Examples of date and number formatting in UNITY-v2
 * 
 * This file demonstrates how to use the formatting system
 * in different scenarios.
 */

import { useTranslation } from '../useTranslation';

/**
 * Example 1: Format entry creation date
 */
export function ExampleEntryDate({ createdAt }: { createdAt: string }) {
  const { t } = useTranslation();
  
  return (
    <div className="text-sm text-gray-500">
      {/* Short date: "1/15/24" (en) / "15.01.24" (ru) */}
      <p>{t.formatDate(createdAt, { style: 'short' })}</p>
      
      {/* Medium date: "Jan 15, 2024" (en) / "15 янв. 2024 г." (ru) */}
      <p>{t.formatDate(createdAt, { style: 'medium' })}</p>
      
      {/* Long date: "January 15, 2024" (en) / "15 января 2024 г." (ru) */}
      <p>{t.formatDate(createdAt, { style: 'long' })}</p>
      
      {/* With time: "Jan 15, 2024, 3:30 PM" */}
      <p>{t.formatDate(createdAt, { style: 'medium', includeTime: true })}</p>
    </div>
  );
}

/**
 * Example 2: Relative time (time ago)
 */
export function ExampleTimeAgo({ date }: { date: string }) {
  const { t } = useTranslation();
  
  return (
    <div className="text-sm text-gray-500">
      {/* "5 minutes ago" / "2 hours ago" / "yesterday" */}
      <p>{t.formatRelativeTime(date)}</p>
      
      {/* Short version: "5m ago" / "2h ago" */}
      <p>{t.formatRelativeTime(date, { style: 'short' })}</p>
      
      {/* Always numeric: "1 day ago" instead of "yesterday" */}
      <p>{t.formatRelativeTime(date, { numeric: 'always' })}</p>
    </div>
  );
}

/**
 * Example 3: Achievement statistics with numbers
 */
export function ExampleAchievementStats({ 
  count, 
  percentage, 
  rank 
}: { 
  count: number; 
  percentage: number; 
  rank: number;
}) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-2">
      {/* Number: "1,234" (en) / "1 234" (ru) */}
      <p>Total: {t.formatNumber(count)}</p>
      
      {/* Percentage: "85%" (en) / "85 %" (ru) */}
      <p>Completion: {t.formatPercent(percentage)}</p>
      
      {/* Compact: "1.2K" / "1.2M" */}
      <p>Users: {t.formatCompact(1234567)}</p>
      
      {/* Ordinal: "1st" / "2nd" / "3rd" */}
      <p>Rank: {t.numberFormats.ordinal(rank, t.currentLanguage)}</p>
    </div>
  );
}

/**
 * Example 4: File upload with size
 */
export function ExampleFileUpload({ size }: { size: number }) {
  const { t } = useTranslation();
  
  return (
    <div className="text-sm">
      {/* "1.50 MB" / "2.34 GB" */}
      <p>Size: {t.formatFileSize(size)}</p>
    </div>
  );
}

/**
 * Example 5: Audio/video duration
 */
export function ExampleMediaDuration({ seconds }: { seconds: number }) {
  const { t } = useTranslation();
  
  return (
    <div className="text-sm">
      {/* Short: "1h 5m 30s" */}
      <p>{t.formatDuration(seconds)}</p>
      
      {/* Long: "1 hours 5 minutes 30 seconds" */}
      <p>{t.dateFormats.durationLong(seconds, t.currentLanguage)}</p>
    </div>
  );
}

/**
 * Example 6: Currency formatting
 */
export function ExampleCurrency({ amount }: { amount: number }) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-2">
      {/* USD: "$1,234.56" (en) / "1 234,56 $" (ru) */}
      <p>{t.formatCurrency(amount, 'USD')}</p>
      
      {/* EUR: "€1,234.56" (en) / "1 234,56 €" (ru) */}
      <p>{t.formatCurrency(amount, 'EUR')}</p>
      
      {/* RUB: "₽1,234.56" (en) / "1 234,56 ₽" (ru) */}
      <p>{t.formatCurrency(amount, 'RUB')}</p>
      
      {/* Using presets */}
      <p>{t.numberFormats.usd(amount, t.currentLanguage)}</p>
    </div>
  );
}

/**
 * Example 7: History screen with dates
 */
export function ExampleHistoryEntry({ 
  entry 
}: { 
  entry: { 
    created_at: string; 
    text: string; 
  } 
}) {
  const { t } = useTranslation();
  
  return (
    <div className="border-b pb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm text-gray-500">
          {/* Relative time for recent entries */}
          {t.formatRelativeTime(entry.created_at)}
        </div>
        <div className="text-xs text-gray-400">
          {/* Exact time */}
          {t.formatTime(entry.created_at)}
        </div>
      </div>
      <p>{entry.text}</p>
    </div>
  );
}

/**
 * Example 8: Reports screen with statistics
 */
export function ExampleReportStats({ 
  stats 
}: { 
  stats: {
    totalEntries: number;
    avgPerDay: number;
    completionRate: number;
    totalDuration: number;
  }
}) {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg">
        <div className="text-2xl font-bold">
          {t.formatNumber(stats.totalEntries)}
        </div>
        <div className="text-sm text-gray-500">
          {t('reports.totalEntries', 'Total Entries')}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg">
        <div className="text-2xl font-bold">
          {t.formatNumber(stats.avgPerDay, { 
            minimumFractionDigits: 1,
            maximumFractionDigits: 1 
          })}
        </div>
        <div className="text-sm text-gray-500">
          {t('reports.avgPerDay', 'Avg per Day')}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg">
        <div className="text-2xl font-bold">
          {t.formatPercent(stats.completionRate)}
        </div>
        <div className="text-sm text-gray-500">
          {t('reports.completionRate', 'Completion Rate')}
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg">
        <div className="text-2xl font-bold">
          {t.formatDuration(stats.totalDuration)}
        </div>
        <div className="text-sm text-gray-500">
          {t('reports.totalDuration', 'Total Duration')}
        </div>
      </div>
    </div>
  );
}

/**
 * Example 9: Admin panel with usage statistics
 */
export function ExampleAdminUsage({ 
  usage 
}: { 
  usage: {
    totalUsers: number;
    activeUsers: number;
    totalStorage: number;
    apiCalls: number;
  }
}) {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <span>Total Users:</span>
        <span className="font-semibold">
          {t.formatCompact(usage.totalUsers)}
        </span>
      </div>
      
      <div className="flex justify-between">
        <span>Active Users:</span>
        <span className="font-semibold">
          {t.formatNumber(usage.activeUsers)}
        </span>
      </div>
      
      <div className="flex justify-between">
        <span>Storage Used:</span>
        <span className="font-semibold">
          {t.formatFileSize(usage.totalStorage)}
        </span>
      </div>
      
      <div className="flex justify-between">
        <span>API Calls:</span>
        <span className="font-semibold">
          {t.formatCompact(usage.apiCalls)}
        </span>
      </div>
    </div>
  );
}

/**
 * Example 10: Using preset formats
 */
export function ExamplePresetFormats() {
  const { t } = useTranslation();
  const now = new Date();
  
  return (
    <div className="space-y-2 text-sm">
      {/* Date presets */}
      <p>Short date: {t.dateFormats.shortDate(now, t.currentLanguage)}</p>
      <p>Medium date: {t.dateFormats.mediumDate(now, t.currentLanguage)}</p>
      <p>Long date: {t.dateFormats.longDate(now, t.currentLanguage)}</p>
      <p>Time: {t.dateFormats.time(now, t.currentLanguage)}</p>
      <p>Time ago: {t.dateFormats.timeAgo(now, t.currentLanguage)}</p>
      <p>Month/Year: {t.dateFormats.monthYear(now, t.currentLanguage)}</p>
      <p>Weekday: {t.dateFormats.weekday(now, t.currentLanguage)}</p>
      
      {/* Number presets */}
      <p>Decimal: {t.numberFormats.decimal(1234.56, t.currentLanguage)}</p>
      <p>Percent: {t.numberFormats.percent(0.85, t.currentLanguage)}</p>
      <p>Compact: {t.numberFormats.compact(1234567, t.currentLanguage)}</p>
      <p>File size: {t.numberFormats.fileSize(1024 * 1024, t.currentLanguage)}</p>
    </div>
  );
}

