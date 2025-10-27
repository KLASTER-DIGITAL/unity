# Date and Number Formatting Guide for UNITY-v2

## 📋 Overview

UNITY-v2 i18n system includes comprehensive date and number formatting based on the Intl API. This provides locale-aware formatting for dates, times, numbers, currencies, and more.

---

## 📅 Date Formatting

### Basic Date Formatting

```typescript
import { useTranslation } from '@/shared/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();
  const date = new Date();
  
  return (
    <div>
      {/* Short: "1/15/24" (en) / "15.01.24" (ru) */}
      <p>{t.formatDate(date, { style: 'short' })}</p>
      
      {/* Medium: "Jan 15, 2024" (en) / "15 янв. 2024 г." (ru) */}
      <p>{t.formatDate(date, { style: 'medium' })}</p>
      
      {/* Long: "January 15, 2024" (en) / "15 января 2024 г." (ru) */}
      <p>{t.formatDate(date, { style: 'long' })}</p>
      
      {/* Full: "Monday, January 15, 2024" */}
      <p>{t.formatDate(date, { style: 'full' })}</p>
    </div>
  );
}
```

### Date with Time

```typescript
// Medium date + time: "Jan 15, 2024, 3:30 PM"
t.formatDate(date, { style: 'medium', includeTime: true })

// Short date + time: "1/15/24, 3:30 PM"
t.formatDate(date, { style: 'short', includeTime: true })
```

### Time Only

```typescript
// Short time: "3:30 PM" (en) / "15:30" (ru)
t.formatTime(date)

// With seconds: "3:30:45 PM"
t.dateFormats.timeWithSeconds(date, t.currentLanguage)
```

### Relative Time (Time Ago)

```typescript
const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

// "5 minutes ago" (en) / "5 минут назад" (ru)
t.formatRelativeTime(fiveMinutesAgo)

// Short version: "5m ago"
t.formatRelativeTime(fiveMinutesAgo, { style: 'short' })

// Always numeric: "1 day ago" instead of "yesterday"
t.formatRelativeTime(date, { numeric: 'always' })
```

### Preset Date Formats

```typescript
const { t } = useTranslation();

// Available presets
t.dateFormats.shortDate(date, t.currentLanguage)      // "1/15/24"
t.dateFormats.mediumDate(date, t.currentLanguage)     // "Jan 15, 2024"
t.dateFormats.longDate(date, t.currentLanguage)       // "January 15, 2024"
t.dateFormats.time(date, t.currentLanguage)           // "3:30 PM"
t.dateFormats.timeAgo(date, t.currentLanguage)        // "5 minutes ago"
t.dateFormats.monthYear(date, t.currentLanguage)      // "January 2024"
t.dateFormats.dayMonth(date, t.currentLanguage)       // "January 15"
t.dateFormats.weekday(date, t.currentLanguage)        // "Monday"
t.dateFormats.weekdayShort(date, t.currentLanguage)   // "Mon"
```

---

## 🔢 Number Formatting

### Basic Number Formatting

```typescript
const { t } = useTranslation();

// Decimal: "1,234.56" (en) / "1 234,56" (ru)
t.formatNumber(1234.56)

// With custom precision
t.formatNumber(1234.56, { 
  minimumFractionDigits: 2,
  maximumFractionDigits: 2 
})

// Without grouping: "1234.56"
t.formatNumber(1234.56, { useGrouping: false })
```

### Currency Formatting

```typescript
// USD: "$1,234.56" (en) / "1 234,56 $" (ru)
t.formatCurrency(1234.56, 'USD')

// EUR: "€1,234.56" (en) / "1 234,56 €" (ru)
t.formatCurrency(1234.56, 'EUR')

// RUB: "₽1,234.56" (en) / "1 234,56 ₽" (ru)
t.formatCurrency(1234.56, 'RUB')

// Using presets
t.numberFormats.usd(1234.56, t.currentLanguage)
t.numberFormats.eur(1234.56, t.currentLanguage)
t.numberFormats.rub(1234.56, t.currentLanguage)
```

### Percentage Formatting

```typescript
// "85%" (en) / "85 %" (ru)
t.formatPercent(0.85)

// With 2 decimals: "85.50%"
t.numberFormats.percent2(0.855, t.currentLanguage)
```

### Compact Notation

```typescript
// "1.2M" (en) / "1,2 млн" (ru)
t.formatCompact(1234567)

// Long version: "1.2 million" (en) / "1,2 миллиона" (ru)
t.numberFormats.compactLong(1234567, t.currentLanguage)
```

### File Size Formatting

```typescript
// "1.00 MB"
t.formatFileSize(1024 * 1024)

// "2.50 GB"
t.formatFileSize(2.5 * 1024 * 1024 * 1024)
```

### Duration Formatting

```typescript
// Short: "1h 5m 30s"
t.formatDuration(3930)

// Long: "1 hours 5 minutes 30 seconds"
t.numberFormats.durationLong(3930, t.currentLanguage)
```

### Ordinal Numbers

```typescript
// English: "1st", "2nd", "3rd", "4th"
t.numberFormats.ordinal(1, 'en')  // → "1st"
t.numberFormats.ordinal(2, 'en')  // → "2nd"
t.numberFormats.ordinal(3, 'en')  // → "3rd"

// Russian: "1-й", "2-й", "3-й"
t.numberFormats.ordinal(1, 'ru')  // → "1-й"

// Spanish: "1º", "2º", "3º"
t.numberFormats.ordinal(1, 'es')  // → "1º"
```

---

## 🎯 Common Use Cases

### 1. Entry Creation Date

```typescript
function EntryCard({ entry }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <div className="text-sm text-gray-500">
        {t.formatRelativeTime(entry.created_at)}
      </div>
      <div className="text-xs text-gray-400">
        {t.formatTime(entry.created_at)}
      </div>
    </div>
  );
}
```

### 2. Achievement Statistics

```typescript
function AchievementStats({ count, percentage }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <p>Total: {t.formatNumber(count)}</p>
      <p>Completion: {t.formatPercent(percentage)}</p>
    </div>
  );
}
```

### 3. File Upload

```typescript
function FileUpload({ file }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <p>{file.name}</p>
      <p className="text-sm text-gray-500">
        {t.formatFileSize(file.size)}
      </p>
    </div>
  );
}
```

### 4. Media Duration

```typescript
function AudioPlayer({ duration }) {
  const { t } = useTranslation();
  
  return (
    <div className="text-sm">
      {t.formatDuration(duration)}
    </div>
  );
}
```

### 5. Admin Usage Statistics

```typescript
function AdminDashboard({ stats }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <p>Total Users: {t.formatCompact(stats.totalUsers)}</p>
      <p>Storage: {t.formatFileSize(stats.totalStorage)}</p>
      <p>API Calls: {t.formatCompact(stats.apiCalls)}</p>
    </div>
  );
}
```

---

## 📊 Locale-Specific Examples

### English (en)

```
Date: Jan 15, 2024
Time: 3:30 PM
Number: 1,234.56
Currency: $1,234.56
Percent: 85%
Compact: 1.2M
```

### Russian (ru)

```
Date: 15 янв. 2024 г.
Time: 15:30
Number: 1 234,56
Currency: 1 234,56 ₽
Percent: 85 %
Compact: 1,2 млн
```

### Spanish (es)

```
Date: 15 ene 2024
Time: 15:30
Number: 1.234,56
Currency: 1.234,56 €
Percent: 85 %
Compact: 1,2 M
```

### German (de)

```
Date: 15. Jan. 2024
Time: 15:30
Number: 1.234,56
Currency: 1.234,56 €
Percent: 85 %
Compact: 1,2 Mio.
```

---

## 🎓 Best Practices

### 1. Always Use Locale-Aware Formatting

✅ **Good**:
```typescript
t.formatDate(date)
t.formatNumber(value)
```

❌ **Bad**:
```typescript
date.toLocaleDateString()  // Uses browser locale, not app locale
value.toFixed(2)           // No locale formatting
```

### 2. Use Relative Time for Recent Dates

✅ **Good**:
```typescript
// For dates within last 7 days
t.formatRelativeTime(date)  // "5 minutes ago", "yesterday"
```

❌ **Bad**:
```typescript
// Always showing full date
t.formatDate(date)  // "Jan 15, 2024" (even for 5 minutes ago)
```

### 3. Use Compact Notation for Large Numbers

✅ **Good**:
```typescript
t.formatCompact(1234567)  // "1.2M"
```

❌ **Bad**:
```typescript
t.formatNumber(1234567)  // "1,234,567" (too long)
```

### 4. Use Appropriate Precision

✅ **Good**:
```typescript
// Currency: always 2 decimals
t.formatCurrency(price, 'USD')

// Percentage: 0-2 decimals based on context
t.formatPercent(0.8567, { maximumFractionDigits: 1 })  // "85.7%"
```

---

## 🔍 Troubleshooting

### Wrong Date Format

**Problem**: Date shows in wrong format

**Solution**: Check that locale is correctly set in TranslationProvider

### Number Separators Wrong

**Problem**: "1.234,56" instead of "1,234.56"

**Solution**: This is correct for some locales (de, es, ru). Use locale-aware formatting.

### Relative Time Not Updating

**Problem**: "5 minutes ago" doesn't update

**Solution**: Re-render component or use interval to update

---

## 📚 Related Documentation

- [I18N Complete Implementation Plan](./I18N_COMPLETE_IMPLEMENTATION_PLAN.md)
- [Pluralization Guide](./I18N_PLURALIZATION_GUIDE.md)
- [TypeScript Types Guide](./I18N_TYPESCRIPT_TYPES_GUIDE.md)
- [MDN Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

