# UNITY-v2 i18n System Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [Core Features](#core-features)
5. [API Reference](#api-reference)
6. [Advanced Usage](#advanced-usage)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Related Documentation](#related-documentation)

---

## 📖 Overview

UNITY-v2 features a comprehensive internationalization (i18n) system supporting **8 languages** with advanced features including:

- ✅ **8 Languages**: Russian, English, Spanish, German, French, Chinese, Japanese, Georgian
- ✅ **RTL Support**: Arabic, Hebrew, Persian, Urdu (prepared)
- ✅ **Dynamic Loading**: Lazy loading with smart caching
- ✅ **Type Safety**: Auto-generated TypeScript types for all translation keys
- ✅ **Pluralization**: Support for 6 plural forms across 11 languages
- ✅ **Formatting**: Locale-aware date, time, number, and currency formatting
- ✅ **Admin Panel**: Centralized translation management
- ✅ **Auto-Translation**: OpenAI-powered translation generation
- ✅ **Performance**: LZ77 compression, LRU caching, prefetching

### System Stats

- **Translation Keys**: 165+ keys across 12 categories
- **Languages**: 8 active + 4 RTL prepared
- **Bundle Size**: Optimized with compression (30-50% savings)
- **Cache Hit Rate**: 85%+ with smart caching
- **Load Time**: ~0.5-1s initial, ~0.2-0.5s language switch

---

## 🏗️ Architecture

### Component Structure

```
src/shared/lib/i18n/
├── TranslationProvider.tsx      # React context provider
├── useTranslation.ts            # Main hook
├── TranslationLoader.tsx        # API loader
├── TranslationCacheManager.ts   # Cache management
├── LanguageSelector.tsx         # Language switcher UI
├── types/
│   └── TranslationKeys.ts       # Auto-generated types
├── pluralization/
│   ├── Pluralization.ts         # Pluralization engine
│   └── PluralRules.ts           # Language-specific rules
├── formatting/
│   ├── DateFormatter.ts         # Date/time formatting
│   └── NumberFormatter.ts       # Number/currency formatting
├── rtl/
│   ├── RTLDetector.ts           # RTL detection
│   ├── RTLProvider.tsx          # RTL context
│   └── rtl.css                  # RTL utilities
└── optimizations/
    ├── LazyLoader.ts            # Lazy loading
    ├── SmartCache.ts            # LRU cache
    └── Compression.ts           # LZ77 compression
```

### Database Schema

```sql
-- Languages table
CREATE TABLE languages (
  code VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100),
  native_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  is_rtl BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Translation keys table
CREATE TABLE translation_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  category VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Translations table
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID REFERENCES translation_keys(id),
  language_code VARCHAR(10) REFERENCES languages(code),
  value TEXT NOT NULL,
  is_auto_translated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(key_id, language_code)
);
```

### Data Flow

```
User Action
    ↓
useTranslation Hook
    ↓
TranslationProvider Context
    ↓
TranslationCacheManager (Check Cache)
    ↓
LazyLoader (If not cached)
    ↓
TranslationLoader (Fetch from API)
    ↓
Compression (Decompress)
    ↓
SmartCache (Store with priority)
    ↓
Return Translation
```

---

## 🚀 Quick Start

### 1. Basic Setup

```typescript
import { TranslationProvider } from '@/shared/lib/i18n';

function App() {
  return (
    <TranslationProvider>
      <YourApp />
    </TranslationProvider>
  );
}
```

### 2. Using Translations

```typescript
import { useTranslation } from '@/shared/lib/i18n';

function MyComponent() {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome.title', 'Welcome to UNITY')}</h1>
      <p>{t('welcome.description', 'Track your achievements')}</p>
      
      <button onClick={() => changeLanguage('es')}>
        Español
      </button>
    </div>
  );
}
```

### 3. With Pluralization

```typescript
function AchievementCount({ count }: { count: number }) {
  const { t } = useTranslation();
  
  return (
    <p>
      {t.plural('achievement.count', count, {
        one: '1 achievement',
        other: '{count} achievements'
      })}
    </p>
  );
}
```

### 4. With Formatting

```typescript
function EntryCard({ entry }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <p>{t.formatRelativeTime(entry.created_at)}</p>
      <p>{t.formatNumber(entry.views)}</p>
      <p>{t.formatCurrency(entry.price, 'USD')}</p>
    </div>
  );
}
```

### 5. With RTL Support

```typescript
function RTLComponent() {
  const { t } = useTranslation();
  
  return (
    <div dir={t.direction}>
      <p className={t.isRTL ? 'text-right' : 'text-left'}>
        {t('content', 'Content')}
      </p>
    </div>
  );
}
```

---

## 🎯 Core Features

### 1. Translation Function

```typescript
// Basic translation
t('key', 'Fallback text')

// With interpolation (future)
t('greeting', 'Hello {name}', { name: 'John' })

// Nested keys
t('settings.language.title', 'Language Settings')
```

### 2. Pluralization

```typescript
// Simple pluralization
t.plural('item.count', count, {
  one: '1 item',
  other: '{count} items'
})

// Complex pluralization (Russian)
t.plural('day.count', count, {
  one: '{count} день',
  few: '{count} дня',
  many: '{count} дней'
})
```

### 3. Date Formatting

```typescript
// Date styles
t.formatDate(date, { style: 'short' })   // "1/15/24"
t.formatDate(date, { style: 'medium' })  // "Jan 15, 2024"
t.formatDate(date, { style: 'long' })    // "January 15, 2024"

// Relative time
t.formatRelativeTime(date)  // "5 minutes ago"

// Time only
t.formatTime(date)  // "3:30 PM"
```

### 4. Number Formatting

```typescript
// Numbers
t.formatNumber(1234.56)  // "1,234.56" (en) / "1 234,56" (ru)

// Currency
t.formatCurrency(1234.56, 'USD')  // "$1,234.56"

// Percent
t.formatPercent(0.85)  // "85%"

// Compact
t.formatCompact(1234567)  // "1.2M"

// File size
t.formatFileSize(1024 * 1024)  // "1.00 MB"
```

### 5. RTL Support

```typescript
// Check RTL
t.isRTL  // true/false

// Get direction
t.direction  // 'rtl' | 'ltr'

// RTL config
t.rtlConfig  // { isRTL, direction, languageCode, directionClass }
```

---

## 📚 API Reference

### useTranslation Hook

```typescript
const {
  // Translation function
  t: (key: TranslationKey, fallback: string) => string,
  
  // Language management
  changeLanguage: (code: LanguageCode) => Promise<void>,
  currentLanguage: LanguageCode,
  
  // State
  isLoading: boolean,
  isLoaded: boolean,
  error: Error | null,
  
  // Pluralization
  plural: (baseKey: string, count: number, forms: PluralForms) => string,
  
  // Date formatting
  formatDate: (date: Date, options?: DateFormatOptions) => string,
  formatTime: (date: Date) => string,
  formatRelativeTime: (date: Date, options?: RelativeTimeOptions) => string,
  
  // Number formatting
  formatNumber: (value: number, options?: NumberFormatOptions) => string,
  formatCurrency: (value: number, currency?: string) => string,
  formatPercent: (value: number) => string,
  formatCompact: (value: number) => string,
  formatFileSize: (bytes: number) => string,
  formatDuration: (seconds: number) => string,
  
  // RTL support
  isRTL: boolean,
  direction: TextDirection,
  rtlConfig: RTLConfig,
  
  // Presets
  dateFormats: typeof DATE_FORMATS,
  numberFormats: typeof NUMBER_FORMATS
}
```

### TranslationProvider Props

```typescript
interface TranslationProviderProps {
  children: ReactNode;
  defaultLanguage?: LanguageCode;
  fallbackLanguage?: LanguageCode;
}
```

---

## 🔧 Advanced Usage

### Custom Translation Loading

```typescript
import { TranslationLoader } from '@/shared/lib/i18n';

// Load specific language
const translations = await TranslationLoader.loadTranslations('es');

// Prefetch multiple languages
await TranslationLoader.prefetchLanguages(['de', 'fr', 'zh']);
```

### Cache Management

```typescript
import { TranslationCacheManager } from '@/shared/lib/i18n';

// Clear cache
TranslationCacheManager.clearCache();

// Get cache stats
const stats = TranslationCacheManager.getStats();
```

### Type Generation

```bash
# Generate TypeScript types from database
npm run i18n:generate-types
```

---

## 💡 Best Practices

### 1. Always Use Fallback Text

```typescript
// ✅ Good
t('welcome.title', 'Welcome')

// ❌ Bad
t('welcome.title')  // No fallback
```

### 2. Use Logical Properties for RTL

```css
/* ✅ Good */
margin-inline-start: 1rem;

/* ❌ Bad */
margin-left: 1rem;
```

### 3. Prefetch Popular Languages

```typescript
useEffect(() => {
  TranslationLoader.prefetchLanguages(['en', 'es', 'de']);
}, []);
```

### 4. Use Relative Time for Recent Dates

```typescript
// ✅ Good for recent dates
t.formatRelativeTime(date)  // "5 minutes ago"

// ✅ Good for old dates
t.formatDate(date)  // "Jan 15, 2024"
```

---

## 🔍 Troubleshooting

See individual guides for detailed troubleshooting:
- [Formatting Guide](./I18N_FORMATTING_GUIDE.md#troubleshooting)
- [Pluralization Guide](./I18N_PLURALIZATION_GUIDE.md#troubleshooting)
- [RTL Guide](./I18N_RTL_GUIDE.md#troubleshooting)

---

## 📚 Related Documentation

- [Complete Implementation Plan](./I18N_COMPLETE_IMPLEMENTATION_PLAN.md)
- [TypeScript Types Guide](./I18N_TYPESCRIPT_TYPES_GUIDE.md)
- [Optimization Guide](./I18N_OPTIMIZATION_GUIDE.md)
- [Pluralization Guide](./I18N_PLURALIZATION_GUIDE.md)
- [Formatting Guide](./I18N_FORMATTING_GUIDE.md)
- [RTL Guide](./I18N_RTL_GUIDE.md)

