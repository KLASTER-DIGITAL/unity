# i18n System API Reference

Complete API reference for UNITY-v2 internationalization system.

---

## 📋 Table of Contents

1. [useTranslation Hook](#usetranslation-hook)
2. [TranslationProvider](#translationprovider)
3. [TranslationLoader](#translationloader)
4. [Pluralization](#pluralization)
5. [Date Formatting](#date-formatting)
6. [Number Formatting](#number-formatting)
7. [RTL Support](#rtl-support)
8. [Types](#types)

---

## useTranslation Hook

Main hook for accessing i18n functionality.

### Import

```typescript
import { useTranslation } from '@/shared/lib/i18n';
```

### Return Value

```typescript
{
  // Core translation
  t: (key: TranslationKey, fallback: string) => string;
  changeLanguage: (code: LanguageCode) => Promise<void>;
  currentLanguage: LanguageCode;
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;
  
  // Pluralization
  plural: (baseKey: string, count: number, forms: PluralForms) => string;
  
  // Date formatting
  formatDate: (date: Date | string | number, options?: DateFormatOptions) => string;
  formatTime: (date: Date | string | number) => string;
  formatRelativeTime: (date: Date | string | number, options?: RelativeTimeOptions) => string;
  
  // Number formatting
  formatNumber: (value: number, options?: NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatPercent: (value: number) => string;
  formatCompact: (value: number) => string;
  formatFileSize: (bytes: number) => string;
  formatDuration: (seconds: number) => string;
  
  // RTL support
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  rtlConfig: RTLConfig;
  
  // Presets
  dateFormats: typeof DATE_FORMATS;
  numberFormats: typeof NUMBER_FORMATS;
}
```

### Methods

#### t(key, fallback)

Translate a key to current language.

**Parameters:**
- `key: TranslationKey` - Translation key (auto-completed)
- `fallback: string` - Fallback text if translation not found

**Returns:** `string`

**Example:**
```typescript
const { t } = useTranslation();
t('welcome.title', 'Welcome to UNITY')
```

#### changeLanguage(code)

Change current language.

**Parameters:**
- `code: LanguageCode` - Language code ('ru' | 'en' | 'es' | 'de' | 'fr' | 'zh' | 'ja' | 'ka')

**Returns:** `Promise<void>`

**Example:**
```typescript
await changeLanguage('es');
```

#### plural(baseKey, count, forms)

Get pluralized translation.

**Parameters:**
- `baseKey: string` - Base translation key
- `count: number` - Count for pluralization
- `forms: PluralForms` - Plural forms object

**Returns:** `string`

**Example:**
```typescript
t.plural('item.count', 5, {
  one: '1 item',
  other: '{count} items'
})
```

---

## TranslationProvider

React context provider for i18n system.

### Import

```typescript
import { TranslationProvider } from '@/shared/lib/i18n';
```

### Props

```typescript
interface TranslationProviderProps {
  children: ReactNode;
  defaultLanguage?: LanguageCode;
  fallbackLanguage?: LanguageCode;
}
```

### Example

```typescript
<TranslationProvider defaultLanguage="en" fallbackLanguage="en">
  <App />
</TranslationProvider>
```

---

## TranslationLoader

Static class for loading translations.

### Import

```typescript
import { TranslationLoader } from '@/shared/lib/i18n';
```

### Methods

#### loadTranslations(languageCode)

Load translations for a language.

**Parameters:**
- `languageCode: string` - Language code

**Returns:** `Promise<Record<string, string>>`

**Example:**
```typescript
const translations = await TranslationLoader.loadTranslations('es');
```

#### prefetchLanguages(languageCodes)

Prefetch multiple languages.

**Parameters:**
- `languageCodes: string[]` - Array of language codes

**Returns:** `Promise<void>`

**Example:**
```typescript
await TranslationLoader.prefetchLanguages(['de', 'fr', 'zh']);
```

---

## Pluralization

### pluralize(count, languageCode, forms)

Get pluralized form.

**Parameters:**
- `count: number` - Count for pluralization
- `languageCode: string` - Language code
- `forms: PluralForms` - Plural forms

**Returns:** `string`

**Example:**
```typescript
import { pluralize } from '@/shared/lib/i18n';

pluralize(5, 'en', {
  one: '1 item',
  other: '{count} items'
})
// → "5 items"
```

### PluralForms Type

```typescript
type PluralForm = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

type PluralForms = Partial<Record<PluralForm, string>>;
```

---

## Date Formatting

### formatDate(date, locale, options)

Format date with locale.

**Parameters:**
- `date: Date | string | number` - Date to format
- `locale: string` - Locale code
- `options?: DateFormatOptions` - Format options

**Returns:** `string`

**Options:**
```typescript
interface DateFormatOptions {
  style?: 'short' | 'medium' | 'long' | 'full';
  includeTime?: boolean;
  timezone?: string;
}
```

**Example:**
```typescript
import { formatDate } from '@/shared/lib/i18n';

formatDate(new Date(), 'en', { style: 'medium' })
// → "Jan 15, 2024"
```

### formatTime(date, locale)

Format time only.

**Example:**
```typescript
formatTime(new Date(), 'en')
// → "3:30 PM"
```

### formatRelativeTime(date, locale, options)

Format relative time.

**Options:**
```typescript
interface RelativeTimeOptions {
  style?: 'long' | 'short' | 'narrow';
  numeric?: 'always' | 'auto';
}
```

**Example:**
```typescript
formatRelativeTime(fiveMinutesAgo, 'en')
// → "5 minutes ago"
```

### DATE_FORMATS Presets

```typescript
DATE_FORMATS.shortDate(date, locale)      // "1/15/24"
DATE_FORMATS.mediumDate(date, locale)     // "Jan 15, 2024"
DATE_FORMATS.longDate(date, locale)       // "January 15, 2024"
DATE_FORMATS.time(date, locale)           // "3:30 PM"
DATE_FORMATS.timeAgo(date, locale)        // "5 minutes ago"
DATE_FORMATS.monthYear(date, locale)      // "January 2024"
DATE_FORMATS.dayMonth(date, locale)       // "January 15"
DATE_FORMATS.weekday(date, locale)        // "Monday"
```

---

## Number Formatting

### formatNumber(value, locale, options)

Format number with locale.

**Parameters:**
- `value: number` - Number to format
- `locale: string` - Locale code
- `options?: NumberFormatOptions` - Format options

**Returns:** `string`

**Options:**
```typescript
interface NumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
  notation?: 'standard' | 'compact';
}
```

**Example:**
```typescript
import { formatNumber } from '@/shared/lib/i18n';

formatNumber(1234.56, 'en')
// → "1,234.56"
```

### formatCurrency(value, locale, currency)

Format currency.

**Example:**
```typescript
formatCurrency(1234.56, 'en', 'USD')
// → "$1,234.56"
```

### formatPercent(value, locale)

Format percentage.

**Example:**
```typescript
formatPercent(0.85, 'en')
// → "85%"
```

### formatCompact(value, locale)

Format with compact notation.

**Example:**
```typescript
formatCompact(1234567, 'en')
// → "1.2M"
```

### formatFileSize(bytes, locale)

Format file size.

**Example:**
```typescript
formatFileSize(1024 * 1024, 'en')
// → "1.00 MB"
```

### formatDuration(seconds, locale)

Format duration.

**Example:**
```typescript
formatDuration(3665, 'en')
// → "1h 1m 5s"
```

### NUMBER_FORMATS Presets

```typescript
NUMBER_FORMATS.decimal(value, locale)     // "1,234.56"
NUMBER_FORMATS.percent(value, locale)     // "85%"
NUMBER_FORMATS.compact(value, locale)     // "1.2M"
NUMBER_FORMATS.usd(value, locale)         // "$1,234.56"
NUMBER_FORMATS.eur(value, locale)         // "€1,234.56"
NUMBER_FORMATS.rub(value, locale)         // "1 234,56 ₽"
NUMBER_FORMATS.fileSize(value, locale)    // "1.00 MB"
NUMBER_FORMATS.duration(value, locale)    // "1h 1m 5s"
NUMBER_FORMATS.ordinal(value, locale)     // "1st"
```

---

## RTL Support

### isRTL(languageCode)

Check if language is RTL.

**Example:**
```typescript
import { isRTL } from '@/shared/lib/i18n';

isRTL('ar')  // → true
isRTL('en')  // → false
```

### getTextDirection(languageCode)

Get text direction.

**Example:**
```typescript
import { getTextDirection } from '@/shared/lib/i18n';

getTextDirection('ar')  // → 'rtl'
getTextDirection('en')  // → 'ltr'
```

### useRTL Hook

```typescript
import { useRTL } from '@/shared/lib/i18n';

const { direction, isRTL, config } = useRTL();
```

### RTL Components

```typescript
import { RTLProvider, RTLDiv, RTLText } from '@/shared/lib/i18n';

<RTLProvider>
  <RTLDiv className="p-4">
    <RTLText>Content</RTLText>
  </RTLDiv>
</RTLProvider>
```

---

## Types

### TranslationKey

Union type of all translation keys (auto-generated).

```typescript
type TranslationKey = 
  | 'welcome.title'
  | 'welcome.description'
  | 'nav.home'
  | 'nav.history'
  // ... 165+ keys
```

### LanguageCode

Union type of supported language codes.

```typescript
type LanguageCode = 'ru' | 'en' | 'es' | 'de' | 'fr' | 'zh' | 'ja' | 'ka';
```

### TextDirection

```typescript
type TextDirection = 'ltr' | 'rtl';
```

### RTLConfig

```typescript
interface RTLConfig {
  isRTL: boolean;
  direction: TextDirection;
  languageCode: string;
  directionClass: string;
}
```

---

## Error Handling

All async methods may throw errors. Always handle them:

```typescript
try {
  await changeLanguage('es');
} catch (error) {
  console.error('Failed to change language:', error);
}
```

---

## Performance Tips

1. **Prefetch popular languages** on app load
2. **Use presets** for common formatting patterns
3. **Cache translations** - handled automatically
4. **Lazy load** languages - handled automatically

---

## Related Documentation

- [System Documentation](./I18N_SYSTEM_DOCUMENTATION.md)
- [Formatting Guide](./I18N_FORMATTING_GUIDE.md)
- [Pluralization Guide](./I18N_PLURALIZATION_GUIDE.md)
- [RTL Guide](./I18N_RTL_GUIDE.md)

