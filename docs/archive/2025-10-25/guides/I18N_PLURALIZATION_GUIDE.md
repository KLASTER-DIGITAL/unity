# Pluralization Guide for UNITY-v2

## 📋 Overview

UNITY-v2 i18n system includes comprehensive pluralization support based on Unicode CLDR plural rules. This allows for correct plural forms in different languages.

---

## 🌍 Supported Plural Forms

### Plural Form Types

- **zero**: 0 items (Arabic, Welsh)
- **one**: 1 item (most languages)
- **two**: 2 items (Arabic, Welsh)
- **few**: 2-4 items (Russian, Polish, Czech)
- **many**: 5+ items (Russian, Polish, Arabic)
- **other**: default form (all languages)

### Language-Specific Rules

#### English (Simple: one/other)
```
1 → one    (1 item)
0, 2-∞ → other  (0 items, 2 items, 5 items)
```

#### Russian (Complex: one/few/many)
```
1, 21, 31... → one   (1 день, 21 день)
2-4, 22-24... → few  (2 дня, 23 дня)
5-20, 25-30... → many (5 дней, 25 дней)
```

#### Chinese/Japanese (No plurals: other only)
```
All numbers → other  (1个, 5个)
```

#### Arabic (Very complex: zero/one/two/few/many/other)
```
0 → zero
1 → one
2 → two
3-10 → few
11-99 → many
100+ → other
```

---

## 💻 Usage

### Basic Usage

```typescript
import { useTranslation } from '@/shared/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  // Simple pluralization
  return (
    <div>
      <p>{t.plural('achievements', 1)}</p>  {/* → "1 achievement" */}
      <p>{t.plural('achievements', 5)}</p>  {/* → "5 achievements" */}
    </div>
  );
}
```

### With Fallback

```typescript
function MyComponent({ count }: { count: number }) {
  const { t } = useTranslation();
  
  return (
    <div>
      {t.plural('items', count, `${count} items`)}
    </div>
  );
}
```

### Complex Pluralization (Russian)

```typescript
function DaysCounter({ days }: { days: number }) {
  const { t } = useTranslation();
  
  return (
    <div>
      {/* Automatically selects correct form based on number */}
      <p>{t.plural('days', 1)}</p>   {/* → "1 день" */}
      <p>{t.plural('days', 2)}</p>   {/* → "2 дня" */}
      <p>{t.plural('days', 5)}</p>   {/* → "5 дней" */}
      <p>{t.plural('days', 21)}</p>  {/* → "21 день" */}
      <p>{t.plural('days', 22)}</p>  {/* → "22 дня" */}
      <p>{t.plural('days', 25)}</p>  {/* → "25 дней" */}
    </div>
  );
}
```

---

## 🗄️ Database Structure

### Translation Keys Format

Plural translations use the format: `{baseKey}_{form}`

**Example for "achievements"**:

English:
```
achievements_one: "{{count}} achievement"
achievements_other: "{{count}} achievements"
```

Russian:
```
achievements_one: "{{count}} достижение"
achievements_few: "{{count}} достижения"
achievements_many: "{{count}} достижений"
```

Chinese:
```
achievements_other: "{{count}} 个成就"
```

### Placeholder Syntax

Use `{{count}}` placeholder for the number:

```
"{{count}} item"   → "1 item", "5 items"
"{{count}} день"   → "1 день", "5 дней"
```

---

## 📝 Adding New Plural Translations

### Step 1: Identify Required Forms

Check language-specific rules:

- **English, Spanish, German**: `one`, `other`
- **Russian, Polish**: `one`, `few`, `many`
- **Chinese, Japanese**: `other` only
- **Arabic**: `zero`, `one`, `two`, `few`, `many`, `other`

### Step 2: Add to Database

```sql
-- English
INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
('items_one', 'en', '{{count}} item'),
('items_other', 'en', '{{count}} items');

-- Russian
INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
('items_one', 'ru', '{{count}} элемент'),
('items_few', 'ru', '{{count}} элемента'),
('items_many', 'ru', '{{count}} элементов');

-- Chinese
INSERT INTO translations (translation_key, lang_code, translation_value) VALUES
('items_other', 'zh', '{{count}} 个项目');
```

### Step 3: Use in Code

```typescript
const { t } = useTranslation();
const text = t.plural('items', count);
```

---

## 🎯 Common Use Cases

### 1. Entries Count

```typescript
function EntriesCount({ count }: { count: number }) {
  const { t } = useTranslation();
  
  return <div>{t.plural('entries', count)}</div>;
}

// Database:
// entries_one: "{{count}} entry"
// entries_other: "{{count}} entries"
```

### 2. Time Ago

```typescript
function TimeAgo({ minutes }: { minutes: number }) {
  const { t } = useTranslation();
  
  if (minutes < 60) {
    return <span>{t.plural('minutes', minutes)}</span>;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return <span>{t.plural('hours', hours)}</span>;
  }
  
  const days = Math.floor(hours / 24);
  return <span>{t.plural('days', days)}</span>;
}

// Database:
// minutes_one: "{{count}} minute ago"
// minutes_other: "{{count}} minutes ago"
// hours_one: "{{count}} hour ago"
// hours_other: "{{count}} hours ago"
// days_one: "{{count}} day ago"
// days_other: "{{count}} days ago"
```

### 3. Achievement Milestones

```typescript
function Milestones({ count }: { count: number }) {
  const { t } = useTranslation();
  
  return (
    <div className="text-lg font-semibold">
      {t.plural('milestones', count)}
    </div>
  );
}

// Database:
// milestones_one: "{{count}} milestone reached"
// milestones_other: "{{count}} milestones reached"
```

---

## 🔧 Advanced Features

### Validation

Check if all required plural forms are provided:

```typescript
import { validatePluralTranslations } from '@/shared/lib/i18n/pluralization';

const missing = validatePluralTranslations('ru', {
  one: '{{count}} день',
  few: '{{count}} дня'
  // Missing 'many' form!
});

console.log(missing); // → ['many']
```

### Generation

Generate plural translations from templates:

```typescript
import { generatePluralTranslations } from '@/shared/lib/i18n/pluralization';

// Russian
const plurals = generatePluralTranslations('ru', 'день', 'дня', 'дней');
// → {
//   one: '{{count}} день',
//   few: '{{count}} дня',
//   many: '{{count}} дней'
// }

// English
const plurals = generatePluralTranslations('en', 'item', 'items');
// → {
//   one: '{{count}} item',
//   other: '{{count}} items'
// }
```

### Plural Rules

Get plural form for a specific count:

```typescript
import { getPluralForm } from '@/shared/lib/i18n/pluralization';

getPluralForm('ru', 1);   // → 'one'
getPluralForm('ru', 2);   // → 'few'
getPluralForm('ru', 5);   // → 'many'
getPluralForm('ru', 21);  // → 'one'
```

---

## 📊 Available Plural Translations

### Current Database (8 languages × 8 categories)

| Category | Languages | Forms |
|----------|-----------|-------|
| achievements | en, ru, es, de, fr, zh, ja, ka | 2-3 forms |
| entries | en, ru, es, de, fr, zh, ja, ka | 2-3 forms |
| days | en, ru, es, de, fr, zh, ja, ka | 2-3 forms |
| hours | en, ru, es, de, fr, zh, ja, ka | 2-3 forms |
| minutes | en, ru, es, de, fr, zh, ja, ka | 2-3 forms |
| seconds | en, ru, es, de, fr, zh, ja, ka | 2-3 forms |
| milestones | en, ru, es, de, fr, zh, ja, ka | 2-3 forms |
| items | en, ru, es, de, fr, zh, ja, ka | 2-3 forms |

**Total**: 64 base keys, ~150 plural translations

---

## 🎓 Best Practices

### 1. Always Use Placeholders

✅ **Good**:
```
"{{count}} items"
```

❌ **Bad**:
```
"5 items"  // Hardcoded number
```

### 2. Provide All Required Forms

✅ **Good** (Russian):
```sql
INSERT INTO translations VALUES
('items_one', 'ru', '{{count}} элемент'),
('items_few', 'ru', '{{count}} элемента'),
('items_many', 'ru', '{{count}} элементов');
```

❌ **Bad** (Russian):
```sql
INSERT INTO translations VALUES
('items_other', 'ru', '{{count}} элементов');  -- Missing one/few!
```

### 3. Test with Different Numbers

Test with numbers that trigger different forms:

- **English**: 0, 1, 2, 5
- **Russian**: 1, 2, 5, 21, 22, 25
- **Arabic**: 0, 1, 2, 5, 15, 100

---

## 🔍 Troubleshooting

### Wrong Plural Form

**Problem**: "5 item" instead of "5 items"

**Solution**: Check if `{baseKey}_other` exists in database

### Missing Translation

**Problem**: Shows key instead of translation

**Solution**: Add all required plural forms for the language

### Placeholder Not Replaced

**Problem**: Shows "{{count}} items" instead of "5 items"

**Solution**: Ensure `{{count}}` placeholder is in translation value

---

## 📚 Related Documentation

- [I18N Complete Implementation Plan](./I18N_COMPLETE_IMPLEMENTATION_PLAN.md)
- [TypeScript Types Guide](./I18N_TYPESCRIPT_TYPES_GUIDE.md)
- [Optimization Guide](./I18N_OPTIMIZATION_GUIDE.md)
- [Unicode CLDR Plural Rules](https://cldr.unicode.org/index/cldr-spec/plural-rules)

