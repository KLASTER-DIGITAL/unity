# TypeScript Types for i18n System

## 📋 Overview

UNITY-v2 i18n system provides full TypeScript support with autocomplete for translation keys and language codes.

**Benefits**:
- ✅ **Autocomplete**: IDE suggests available translation keys
- ✅ **Type Safety**: Compile-time errors for invalid keys
- ✅ **Refactoring**: Rename keys safely across codebase
- ✅ **Documentation**: Self-documenting code with types

---

## 🔧 Auto-Generated Types

### Location
```
src/shared/lib/i18n/types/TranslationKeys.ts
```

### Generation Command
```bash
npm run i18n:generate-types
```

This script:
1. Fetches all translation keys from Supabase
2. Categorizes keys by feature (onboarding, auth, home, etc.)
3. Generates TypeScript union type `TranslationKey`
4. Generates `LanguageCode` type from active languages
5. Creates helper types and interfaces

**⚠️ Important**: Run this command after adding new translation keys to the database!

---

## 📝 Usage Examples

### Basic Usage with Autocomplete

```typescript
import { useTranslation } from '@/shared/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  // ✅ TypeScript autocompletes available keys
  const title = t('welcome_title', 'Welcome');
  const subtitle = t('welcome_subtitle', 'Get started');
  
  // ❌ TypeScript error: invalid key
  const invalid = t('non_existent_key', 'Fallback');
  //                  ^^^^^^^^^^^^^^^^^^
  //                  Type '"non_existent_key"' is not assignable to type 'TranslationKey'
  
  return (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
```

### Language Switching with Type Safety

```typescript
import { useTranslation } from '@/shared/lib/i18n';

function LanguageSwitcher() {
  const { changeLanguage, currentLanguage } = useTranslation();
  
  // ✅ TypeScript autocompletes language codes
  const handleChange = async (lang: 'ru' | 'en' | 'es') => {
    await changeLanguage(lang);
  };
  
  // ❌ TypeScript error: invalid language code
  await changeLanguage('invalid');
  //                    ^^^^^^^^^
  //                    Type '"invalid"' is not assignable to type 'LanguageCode'
  
  return (
    <select value={currentLanguage} onChange={(e) => handleChange(e.target.value as any)}>
      <option value="ru">Русский</option>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}
```

### Checking Translation Existence

```typescript
import { useTranslation } from '@/shared/lib/i18n';

function ConditionalTranslation() {
  const { t, hasTranslation } = useTranslation();
  
  // Check if translation exists before using
  if (hasTranslation('premium_feature_title')) {
    return <h2>{t('premium_feature_title')}</h2>;
  }
  
  return <h2>Premium Feature</h2>;
}
```

---

## 🎯 Available Types

### TranslationKey

Union type of all available translation keys:

```typescript
export type TranslationKey =
  | 'welcome_title'
  | 'welcome_subtitle'
  | 'home'
  | 'settings'
  // ... 165+ keys
  ;
```

### LanguageCode

Union type of all active language codes:

```typescript
export type LanguageCode = 'ru' | 'en' | 'es' | 'de' | 'fr' | 'zh' | 'ja' | 'ka';
```

### TranslationFunction

Type for the `t()` function:

```typescript
export type TranslationFunction = (key: TranslationKey, fallback?: string) => string;
```

### Language

Interface for language objects:

```typescript
export interface Language {
  id?: string;
  code: LanguageCode;
  name: string;
  native_name: string;
  flag: string;
  is_active?: boolean;
  enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}
```

### TranslationEntry

Interface for translation database entries:

```typescript
export interface TranslationEntry {
  id?: string;
  translation_key: TranslationKey;
  lang_code: LanguageCode;
  translation_value: string;
  created_at?: string;
  updated_at?: string;
}
```

---

## 🔄 Workflow

### Adding New Translation Keys

1. **Add translations to database** (via admin panel or migration):
   ```sql
   INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
     ('new_feature_title', 'ru', 'Новая функция'),
     ('new_feature_title', 'en', 'New Feature');
   ```

2. **Regenerate TypeScript types**:
   ```bash
   npm run i18n:generate-types
   ```

3. **Use in code with autocomplete**:
   ```typescript
   const title = t('new_feature_title', 'New Feature');
   ```

### Adding New Language

1. **Add language to database** (via admin panel):
   ```sql
   INSERT INTO languages (code, name, native_name, flag, is_active) VALUES
     ('pt', 'Portuguese', 'Português', '🇵🇹', true);
   ```

2. **Regenerate TypeScript types**:
   ```bash
   npm run i18n:generate-types
   ```

3. **Language code is now available**:
   ```typescript
   await changeLanguage('pt'); // ✅ TypeScript knows about 'pt'
   ```

---

## 🛠️ Advanced Usage

### Custom Translation Hook

```typescript
import { useTranslation, TranslationKey } from '@/shared/lib/i18n';

function useFeatureTranslations(prefix: string) {
  const { t } = useTranslation();
  
  return (key: string, fallback?: string) => {
    const fullKey = `${prefix}_${key}` as TranslationKey;
    return t(fullKey, fallback);
  };
}

// Usage
function SettingsScreen() {
  const ts = useFeatureTranslations('settings');
  
  return (
    <div>
      <h1>{ts('title', 'Settings')}</h1>
      <p>{ts('description', 'Manage your preferences')}</p>
    </div>
  );
}
```

### Type-Safe Translation Object

```typescript
import { Translations } from '@/shared/lib/i18n';

const myTranslations: Translations = {
  welcome_title: 'Welcome',
  welcome_subtitle: 'Get started',
  // ❌ TypeScript error: invalid key
  invalid_key: 'Invalid'
};
```

---

## 📊 Statistics

**Current Status** (2025-10-20):
- **Total Keys**: 165
- **Languages**: 8 (ru, en, es, de, fr, zh, ja, ka)
- **Total Translations**: 1084
- **Categories**: 12 (common, onboarding, auth, navigation, home, history, achievements, reports, settings, admin, categories, other)

---

## 🔍 Troubleshooting

### Types Not Updating

**Problem**: New translation keys don't appear in autocomplete

**Solution**: Run type generation script
```bash
npm run i18n:generate-types
```

### TypeScript Errors After Adding Keys

**Problem**: TypeScript shows errors for valid keys

**Solution**: 
1. Regenerate types: `npm run i18n:generate-types`
2. Restart TypeScript server in IDE (VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server")

### Autocomplete Not Working

**Problem**: IDE doesn't suggest translation keys

**Solution**:
1. Make sure you're importing from `@/shared/lib/i18n`
2. Check that `TranslationKeys.ts` file exists
3. Restart IDE

---

## 📚 Best Practices

1. **Always use `t()` with type safety**:
   ```typescript
   // ✅ Good
   const text = t('welcome_title', 'Welcome');
   
   // ❌ Bad (no type safety)
   const text = t('welcome_title' as any, 'Welcome');
   ```

2. **Provide fallback values**:
   ```typescript
   // ✅ Good (works even if translation missing)
   const text = t('new_key', 'Default Text');
   
   // ⚠️ Risky (returns key if translation missing)
   const text = t('new_key');
   ```

3. **Regenerate types after database changes**:
   ```bash
   # After adding translations
   npm run i18n:generate-types
   ```

4. **Use semantic key names**:
   ```typescript
   // ✅ Good (descriptive)
   t('settings_profile_edit_button', 'Edit Profile')
   
   // ❌ Bad (unclear)
   t('btn1', 'Edit Profile')
   ```

---

## 🎓 Related Documentation

- [I18N Complete Implementation Plan](./I18N_COMPLETE_IMPLEMENTATION_PLAN.md)
- [Translation Provider](../src/shared/lib/i18n/TranslationProvider.tsx)
- [useTranslation Hook](../src/shared/lib/i18n/useTranslation.ts)

