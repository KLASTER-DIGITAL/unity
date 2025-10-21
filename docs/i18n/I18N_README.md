# UNITY-v2 i18n System

Complete internationalization system for UNITY-v2 with support for 8+ languages, RTL, pluralization, and locale-aware formatting.

---

## ⚡ Quick Start

### 1. Basic Usage

```typescript
import { useTranslation } from '@/shared/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome.title', 'Welcome to UNITY')}</h1>
      <p>{t('welcome.description', 'Track your achievements')}</p>
    </div>
  );
}
```

### 2. Change Language

```typescript
function LanguageSwitcher() {
  const { t, changeLanguage, currentLanguage } = useTranslation();
  
  return (
    <select 
      value={currentLanguage} 
      onChange={(e) => changeLanguage(e.target.value)}
    >
      <option value="en">English</option>
      <option value="ru">Русский</option>
      <option value="es">Español</option>
    </select>
  );
}
```

### 3. Format Dates

```typescript
function EntryCard({ entry }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <p>{t.formatRelativeTime(entry.created_at)}</p>
      {/* → "5 minutes ago" (en) / "5 минут назад" (ru) */}
    </div>
  );
}
```

### 4. Format Numbers

```typescript
function Stats({ count, price }) {
  const { t } = useTranslation();
  
  return (
    <div>
      <p>{t.formatNumber(count)}</p>
      {/* → "1,234" (en) / "1 234" (ru) */}
      
      <p>{t.formatCurrency(price, 'USD')}</p>
      {/* → "$1,234.56" (en) / "1 234,56 $" (ru) */}
    </div>
  );
}
```

### 5. Pluralization

```typescript
function AchievementCount({ count }) {
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

### 6. RTL Support

```typescript
function RTLComponent() {
  const { t } = useTranslation();
  
  return (
    <div dir={t.direction} className="text-start">
      {/* Automatically adjusts for RTL languages */}
      <p>{t('content', 'Content')}</p>
    </div>
  );
}
```

---

## 🌍 Supported Languages

| Code | Language | Native Name | RTL |
|------|----------|-------------|-----|
| `en` | English | English | ❌ |
| `ru` | Russian | Русский | ❌ |
| `es` | Spanish | Español | ❌ |
| `de` | German | Deutsch | ❌ |
| `fr` | French | Français | ❌ |
| `zh` | Chinese | 中文 | ❌ |
| `ja` | Japanese | 日本語 | ❌ |
| `ka` | Georgian | ქართული | ❌ |
| `ar` | Arabic | العربية | ✅ |
| `he` | Hebrew | עברית | ✅ |

---

## 🎯 Features

### ✅ Core Features

- **8 Active Languages** - English, Russian, Spanish, German, French, Chinese, Japanese, Georgian
- **RTL Support** - Arabic, Hebrew, Persian, Urdu (prepared)
- **Type Safety** - Auto-generated TypeScript types for all translation keys
- **Lazy Loading** - Translations loaded on demand with smart caching
- **Compression** - LZ77-based compression (30-50% space savings)
- **Prefetching** - Background loading of popular languages

### ✅ Formatting

- **Date Formatting** - 4 styles (short, medium, long, full)
- **Relative Time** - "5 minutes ago", "yesterday", etc.
- **Number Formatting** - Locale-aware decimal, currency, percent
- **Compact Notation** - 1.2M, 1.5K, etc.
- **File Sizes** - Automatic KB/MB/GB conversion
- **Duration** - Human-readable time durations

### ✅ Pluralization

- **6 Plural Forms** - zero, one, two, few, many, other
- **11 Languages** - Including complex rules (Russian, Arabic, Polish)
- **Auto-Detection** - Automatic plural form selection

### ✅ Admin Features

- **Translation Management** - Add/edit/delete translations
- **Language Management** - Enable/disable languages
- **Auto-Translation** - OpenAI-powered translation generation
- **Missing Keys Detection** - Automatic detection of untranslated keys
- **Bulk Operations** - Import/export translations

---

## 📚 Documentation

### Getting Started

- **[Quick Start](#quick-start)** - Basic usage examples
- **[Migration Guide](./I18N_MIGRATION_GUIDE.md)** - Migrate existing components

### Core Documentation

- **[System Documentation](./I18N_SYSTEM_DOCUMENTATION.md)** - Architecture and overview
- **[API Reference](./I18N_API_REFERENCE.md)** - Complete API documentation
- **[Implementation Plan](./I18N_COMPLETE_IMPLEMENTATION_PLAN.md)** - Development roadmap

### Feature Guides

- **[Formatting Guide](./I18N_FORMATTING_GUIDE.md)** - Date and number formatting
- **[Pluralization Guide](./I18N_PLURALIZATION_GUIDE.md)** - Pluralization rules
- **[RTL Guide](./I18N_RTL_GUIDE.md)** - Right-to-left language support
- **[TypeScript Types Guide](./I18N_TYPESCRIPT_TYPES_GUIDE.md)** - Type generation
- **[Optimization Guide](./I18N_OPTIMIZATION_GUIDE.md)** - Performance optimization

---

## 🔧 API Overview

### useTranslation Hook

```typescript
const {
  // Translation
  t,                      // Translate key
  changeLanguage,         // Change language
  currentLanguage,        // Current language code
  
  // State
  isLoading,             // Loading state
  isLoaded,              // Loaded state
  error,                 // Error state
  
  // Pluralization
  plural,                // Pluralize text
  
  // Date formatting
  formatDate,            // Format date
  formatTime,            // Format time
  formatRelativeTime,    // Format relative time
  
  // Number formatting
  formatNumber,          // Format number
  formatCurrency,        // Format currency
  formatPercent,         // Format percentage
  formatCompact,         // Compact notation
  formatFileSize,        // File size
  formatDuration,        // Duration
  
  // RTL support
  isRTL,                 // Is RTL language
  direction,             // Text direction
  rtlConfig,             // RTL configuration
  
  // Presets
  dateFormats,           // Date format presets
  numberFormats          // Number format presets
} = useTranslation();
```

---

## 💡 Best Practices

### 1. Always Provide Fallback

```typescript
// ✅ Good
t('welcome.title', 'Welcome')

// ❌ Bad
t('welcome.title')
```

### 2. Use Logical Properties for RTL

```css
/* ✅ Good */
margin-inline-start: 1rem;

/* ❌ Bad */
margin-left: 1rem;
```

### 3. Use Relative Time for Recent Dates

```typescript
// ✅ Good for recent dates
t.formatRelativeTime(date)  // "5 minutes ago"

// ✅ Good for old dates
t.formatDate(date)  // "Jan 15, 2024"
```

### 4. Prefetch Popular Languages

```typescript
useEffect(() => {
  TranslationLoader.prefetchLanguages(['en', 'es', 'de']);
}, []);
```

---

## 🎨 Examples

### Complete Component Example

```typescript
import { useTranslation } from '@/shared/lib/i18n';
import { ChevronRight } from 'lucide-react';

function AchievementCard({ achievement }) {
  const { t } = useTranslation();
  
  return (
    <div dir={t.direction} className="bg-white rounded-lg shadow p-4">
      {/* Title */}
      <h3 className="text-lg font-semibold text-start mb-2">
        {achievement.title}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-gray-600 text-start mb-4">
        {achievement.description}
      </p>
      
      {/* Stats */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-500">
          {t.formatRelativeTime(achievement.created_at)}
        </span>
        <span className="text-sm font-semibold">
          {t.formatPercent(achievement.progress)}
        </span>
      </div>
      
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>{t('achievement.progress', 'Progress')}</span>
          <span>
            {t.plural('achievement.count', achievement.count, {
              one: '1 achievement',
              other: '{count} achievements'
            })}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${achievement.progress * 100}%` }}
          />
        </div>
      </div>
      
      {/* Action */}
      <button className="flex items-center gap-2 text-blue-600 hover:underline">
        <span>{t('common.view_details', 'View Details')}</span>
        <ChevronRight className="icon-mirror w-4 h-4" />
      </button>
    </div>
  );
}
```

---

## 🚀 Performance

- **Bundle Size**: Optimized with compression (30-50% savings)
- **Load Time**: ~0.5-1s initial, ~0.2-0.5s language switch
- **Cache Hit Rate**: 85%+ with smart caching
- **Memory Usage**: ~250 KB per language (compressed)

---

## 🔍 Troubleshooting

### Translation Not Showing

1. Check if translation key exists in database
2. Verify fallback text is provided
3. Check browser console for errors
4. Regenerate TypeScript types: `npm run i18n:generate-types`

### Wrong Date/Number Format

1. Verify current language is correct
2. Check locale-specific formatting rules
3. Use appropriate format method

### RTL Layout Issues

1. Add `dir={t.direction}` to container
2. Use logical properties (margin-inline-start, etc.)
3. Add `icon-mirror` class to directional icons
4. Test with Arabic or Hebrew

---

## 📦 Scripts

```bash
# Generate TypeScript types from database
npm run i18n:generate-types

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 🆘 Support

- **Documentation**: See [docs/](./I18N_SYSTEM_DOCUMENTATION.md)
- **Examples**: See [src/shared/lib/i18n/formatting/examples.tsx](../src/shared/lib/i18n/formatting/examples.tsx)
- **Issues**: Check [Troubleshooting](#troubleshooting)

---

## 📄 License

Part of UNITY-v2 project.

