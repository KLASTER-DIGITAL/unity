# i18n Migration Guide

Guide for migrating existing components to use the new i18n system.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Step-by-Step Migration](#step-by-step-migration)
3. [Common Patterns](#common-patterns)
4. [RTL Migration](#rtl-migration)
5. [Testing](#testing)
6. [Checklist](#checklist)

---

## 📖 Overview

This guide helps you migrate existing UNITY-v2 components to use the new i18n system.

### What's Changing

**Before:**
- Hardcoded text strings
- No multi-language support
- Manual date/number formatting
- No RTL support

**After:**
- Dynamic translations from database
- 8+ language support
- Locale-aware formatting
- Full RTL support

---

## 🔄 Step-by-Step Migration

### Step 1: Import useTranslation

**Before:**
```typescript
import React from 'react';

function MyComponent() {
  return <h1>Welcome to UNITY</h1>;
}
```

**After:**
```typescript
import React from 'react';
import { useTranslation } from '@/shared/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('welcome.title', 'Welcome to UNITY')}</h1>;
}
```

### Step 2: Replace Hardcoded Strings

**Before:**
```typescript
function Navigation() {
  return (
    <nav>
      <a href="/">Home</a>
      <a href="/history">History</a>
      <a href="/settings">Settings</a>
    </nav>
  );
}
```

**After:**
```typescript
function Navigation() {
  const { t } = useTranslation();
  return (
    <nav>
      <a href="/">{t('nav.home', 'Home')}</a>
      <a href="/history">{t('nav.history', 'History')}</a>
      <a href="/settings">{t('nav.settings', 'Settings')}</a>
    </nav>
  );
}
```

### Step 3: Update Date Formatting

**Before:**
```typescript
function EntryCard({ entry }) {
  return (
    <div>
      <p>{new Date(entry.created_at).toLocaleDateString()}</p>
      <p>{entry.text}</p>
    </div>
  );
}
```

**After:**
```typescript
function EntryCard({ entry }) {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t.formatRelativeTime(entry.created_at)}</p>
      <p>{entry.text}</p>
    </div>
  );
}
```

### Step 4: Update Number Formatting

**Before:**
```typescript
function Stats({ count, percentage }) {
  return (
    <div>
      <p>Total: {count.toLocaleString()}</p>
      <p>Completion: {(percentage * 100).toFixed(1)}%</p>
    </div>
  );
}
```

**After:**
```typescript
function Stats({ count, percentage }) {
  const { t } = useTranslation();
  return (
    <div>
      <p>{t('stats.total', 'Total')}: {t.formatNumber(count)}</p>
      <p>{t('stats.completion', 'Completion')}: {t.formatPercent(percentage)}</p>
    </div>
  );
}
```

### Step 5: Add RTL Support

**Before:**
```typescript
function Card({ title, description }) {
  return (
    <div className="text-left">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

**After:**
```typescript
function Card({ title, description }) {
  const { t } = useTranslation();
  return (
    <div dir={t.direction} className="text-start">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
```

---

## 🎯 Common Patterns

### Pattern 1: Button Text

**Before:**
```typescript
<button>Save</button>
<button>Cancel</button>
```

**After:**
```typescript
<button>{t('common.save', 'Save')}</button>
<button>{t('common.cancel', 'Cancel')}</button>
```

### Pattern 2: Form Labels

**Before:**
```typescript
<label>Email Address</label>
<input type="email" placeholder="Enter your email" />
```

**After:**
```typescript
<label>{t('form.email.label', 'Email Address')}</label>
<input 
  type="email" 
  placeholder={t('form.email.placeholder', 'Enter your email')} 
/>
```

### Pattern 3: Error Messages

**Before:**
```typescript
if (!email) {
  setError('Email is required');
}
```

**After:**
```typescript
if (!email) {
  setError(t('form.email.required', 'Email is required'));
}
```

### Pattern 4: Pluralization

**Before:**
```typescript
const message = count === 1 
  ? '1 achievement' 
  : `${count} achievements`;
```

**After:**
```typescript
const message = t.plural('achievement.count', count, {
  one: '1 achievement',
  other: '{count} achievements'
});
```

### Pattern 5: Conditional Text

**Before:**
```typescript
const status = isActive ? 'Active' : 'Inactive';
```

**After:**
```typescript
const status = isActive 
  ? t('status.active', 'Active')
  : t('status.inactive', 'Inactive');
```

### Pattern 6: Lists

**Before:**
```typescript
const categories = ['Work', 'Personal', 'Health', 'Learning'];
```

**After:**
```typescript
const categories = [
  t('category.work', 'Work'),
  t('category.personal', 'Personal'),
  t('category.health', 'Health'),
  t('category.learning', 'Learning')
];
```

---

## 🔄 RTL Migration

### Step 1: Replace Left/Right with Logical Properties

**Before:**
```css
.element {
  margin-left: 1rem;
  padding-right: 0.5rem;
  text-align: left;
}
```

**After:**
```css
.element {
  margin-inline-start: 1rem;
  padding-inline-end: 0.5rem;
  text-align: start;
}
```

### Step 2: Use RTL Utility Classes

**Before:**
```html
<div className="ml-4 pr-2 text-left">
```

**After:**
```html
<div className="ms-4 pe-2 text-start">
```

### Step 3: Add dir Attribute

**Before:**
```typescript
<div className="container">
```

**After:**
```typescript
const { t } = useTranslation();
<div className="container" dir={t.direction}>
```

### Step 4: Mirror Directional Icons

**Before:**
```typescript
<ChevronRight />
```

**After:**
```typescript
<ChevronRight className="icon-mirror" />
```

---

## 🧪 Testing

### Test Checklist

- [ ] Component renders in English
- [ ] Component renders in Russian
- [ ] Component renders in Spanish
- [ ] Dates format correctly for each locale
- [ ] Numbers format correctly for each locale
- [ ] Pluralization works correctly
- [ ] RTL layout works (if applicable)
- [ ] No hardcoded strings remain
- [ ] Fallback text is provided for all keys

### Testing Example

```typescript
import { render, screen } from '@testing-library/react';
import { TranslationProvider } from '@/shared/lib/i18n';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders in English', () => {
    render(
      <TranslationProvider defaultLanguage="en">
        <MyComponent />
      </TranslationProvider>
    );
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });
  
  it('renders in Russian', () => {
    render(
      <TranslationProvider defaultLanguage="ru">
        <MyComponent />
      </TranslationProvider>
    );
    expect(screen.getByText('Добро пожаловать')).toBeInTheDocument();
  });
});
```

---

## ✅ Migration Checklist

### Component Level

- [ ] Import `useTranslation` hook
- [ ] Replace all hardcoded strings with `t()` calls
- [ ] Add fallback text to all `t()` calls
- [ ] Update date formatting to use `t.formatDate()` or `t.formatRelativeTime()`
- [ ] Update number formatting to use `t.formatNumber()`, `t.formatCurrency()`, etc.
- [ ] Add pluralization where needed
- [ ] Add `dir={t.direction}` to container elements
- [ ] Replace `text-left/right` with `text-start/end`
- [ ] Replace `ml-*/mr-*` with `ms-*/me-*`
- [ ] Replace `pl-*/pr-*` with `ps-*/pe-*`
- [ ] Add `icon-mirror` class to directional icons
- [ ] Test component in multiple languages
- [ ] Test component in RTL mode (if applicable)

### File Level

- [ ] No hardcoded strings in JSX
- [ ] No hardcoded strings in error messages
- [ ] No hardcoded strings in validation messages
- [ ] No hardcoded strings in placeholders
- [ ] No hardcoded strings in button text
- [ ] No hardcoded strings in labels
- [ ] All dates use locale-aware formatting
- [ ] All numbers use locale-aware formatting
- [ ] All CSS uses logical properties
- [ ] All tests updated

### Project Level

- [ ] All components migrated
- [ ] All screens migrated
- [ ] All forms migrated
- [ ] All error messages migrated
- [ ] All validation messages migrated
- [ ] All admin panel migrated
- [ ] Translation keys added to database
- [ ] Translations added for all supported languages
- [ ] TypeScript types regenerated
- [ ] Documentation updated
- [ ] E2E tests updated

---

## 🚨 Common Mistakes

### Mistake 1: Missing Fallback

**Wrong:**
```typescript
t('welcome.title')  // No fallback
```

**Correct:**
```typescript
t('welcome.title', 'Welcome')
```

### Mistake 2: Using toLocaleString()

**Wrong:**
```typescript
date.toLocaleString()  // Uses browser locale, not app locale
```

**Correct:**
```typescript
t.formatDate(date)  // Uses app locale
```

### Mistake 3: Hardcoded Left/Right

**Wrong:**
```css
margin-left: 1rem;
```

**Correct:**
```css
margin-inline-start: 1rem;
```

### Mistake 4: Not Testing RTL

**Wrong:**
```typescript
// Only testing LTR languages
```

**Correct:**
```typescript
// Test with Arabic or Hebrew to verify RTL
```

---

## 📚 Related Documentation

- [System Documentation](./I18N_SYSTEM_DOCUMENTATION.md)
- [API Reference](./I18N_API_REFERENCE.md)
- [RTL Guide](./I18N_RTL_GUIDE.md)
- [Formatting Guide](./I18N_FORMATTING_GUIDE.md)

---

## 💡 Tips

1. **Start with high-traffic components** - Migrate the most used components first
2. **Migrate one screen at a time** - Don't try to migrate everything at once
3. **Test thoroughly** - Test each component in multiple languages
4. **Use TypeScript autocomplete** - Let the IDE suggest translation keys
5. **Keep fallback text updated** - Fallback text should match the English translation
6. **Document new keys** - Add descriptions for new translation keys
7. **Reuse existing keys** - Don't create duplicate keys for the same text

---

## 🆘 Need Help?

If you encounter issues during migration:

1. Check the [Troubleshooting](#testing) section
2. Review the [API Reference](./I18N_API_REFERENCE.md)
3. Look at [examples](../src/shared/lib/i18n/formatting/examples.tsx)
4. Ask the team for help

