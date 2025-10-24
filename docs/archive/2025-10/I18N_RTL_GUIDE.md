# RTL (Right-to-Left) Support Guide for UNITY-v2

## 📋 Overview

UNITY-v2 i18n system includes comprehensive RTL support for languages like Arabic, Hebrew, Persian, and Urdu. This guide explains how to use RTL features in your components.

---

## 🌍 Supported RTL Languages

### Currently Supported

- **Arabic (ar)** - العربية
- **Hebrew (he)** - עברית
- **Persian (fa)** - فارسی
- **Urdu (ur)** - اردو

### Future Support

- Yiddish (yi)
- Pashto (ps)
- Kurdish (ku)
- Dhivehi (dv)

---

## 🚀 Basic Usage

### 1. Using RTL Hook

```typescript
import { useTranslation } from '@/shared/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div dir={t.direction}>
      {/* Content automatically adjusts to RTL */}
      <p className={t.isRTL ? 'text-right' : 'text-left'}>
        {t('welcome', 'Welcome')}
      </p>
    </div>
  );
}
```

### 2. Using RTL Provider

```typescript
import { RTLProvider, useRTL } from '@/shared/lib/i18n';

function App() {
  return (
    <TranslationProvider>
      <RTLProvider>
        <MyComponent />
      </RTLProvider>
    </TranslationProvider>
  );
}

function MyComponent() {
  const { direction, isRTL } = useRTL();
  
  return (
    <div>
      <p>Direction: {direction}</p>
      <p>Is RTL: {isRTL ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### 3. Using RTL Components

```typescript
import { RTLDiv, RTLText } from '@/shared/lib/i18n';

function MyComponent() {
  return (
    <RTLDiv className="p-4">
      <RTLText>مرحبا</RTLText> {/* Automatically RTL */}
      <RTLText>Hello</RTLText> {/* Automatically LTR */}
    </RTLDiv>
  );
}
```

---

## 🎨 CSS Utilities

### Logical Properties

Use logical properties instead of left/right:

```css
/* ❌ Bad - hardcoded direction */
.element {
  margin-left: 1rem;
  padding-right: 0.5rem;
  text-align: left;
}

/* ✅ Good - logical properties */
.element {
  margin-inline-start: 1rem;
  padding-inline-end: 0.5rem;
  text-align: start;
}
```

### RTL Utility Classes

```html
<!-- Margin/Padding -->
<div class="ms-4 me-2">  <!-- margin-inline-start/end -->
<div class="ps-4 pe-2">  <!-- padding-inline-start/end -->

<!-- Text alignment -->
<div class="text-start">  <!-- Aligns to start (left in LTR, right in RTL) -->
<div class="text-end">    <!-- Aligns to end (right in LTR, left in RTL) -->

<!-- Position -->
<div class="start-0">  <!-- inset-inline-start: 0 -->
<div class="end-0">    <!-- inset-inline-end: 0 -->

<!-- Conditional display -->
<div class="rtl-only">   <!-- Only visible in RTL -->
<div class="ltr-only">   <!-- Only visible in LTR -->
```

### Icon Mirroring

```html
<!-- Icons that should flip in RTL -->
<ChevronRight class="icon-mirror" />
<ArrowLeft class="icon-mirror" />

<!-- Icons that should NOT flip -->
<Search />  <!-- No mirror class -->
<Settings /> <!-- No mirror class -->
```

---

## 🔧 Advanced Features

### 1. RTL Detection

```typescript
import { isRTL, getTextDirection, containsRTLCharacters } from '@/shared/lib/i18n';

// Check if language is RTL
isRTL('ar')  // → true
isRTL('en')  // → false

// Get text direction
getTextDirection('ar')  // → 'rtl'
getTextDirection('en')  // → 'ltr'

// Check if string contains RTL characters
containsRTLCharacters('مرحبا')  // → true
containsRTLCharacters('Hello')  // → false
```

### 2. Conditional Styling

```typescript
import { rtlClass, rtlStyle } from '@/shared/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div 
      className={rtlClass('ml-4', 'mr-4', t.direction)}
      style={rtlStyle(
        { marginLeft: '1rem' },
        { marginRight: '1rem' },
        t.direction
      )}
    >
      Content
    </div>
  );
}
```

### 3. Transform Mirroring

```typescript
import { getTransform, flipHorizontal } from '@/shared/lib/i18n';

const { t } = useTranslation();

// Flip transform for RTL
const transform = getTransform('translateX(100px)', t.direction);
// LTR: 'translateX(100px)'
// RTL: 'translateX(-100px)'

// Flip horizontal value
const offset = flipHorizontal(10, t.direction);
// LTR: 10
// RTL: -10
```

### 4. Logical Property Conversion

```typescript
import { getLogicalProperty } from '@/shared/lib/i18n';

getLogicalProperty('margin-left')   // → 'margin-inline-start'
getLogicalProperty('padding-right') // → 'padding-inline-end'
getLogicalProperty('left')          // → 'inset-inline-start'
```

---

## 📝 Common Patterns

### 1. Navigation Menu

```typescript
function Navigation() {
  const { t } = useTranslation();
  
  return (
    <nav dir={t.direction}>
      <ul className="flex">
        <li className="me-4">{t('nav.home')}</li>
        <li className="me-4">{t('nav.about')}</li>
        <li>{t('nav.contact')}</li>
      </ul>
    </nav>
  );
}
```

### 2. Card Layout

```typescript
function Card({ image, title, description }) {
  const { t } = useTranslation();
  
  return (
    <div className="flex" dir={t.direction}>
      <img src={image} className="me-4" />
      <div>
        <h3 className="text-start">{title}</h3>
        <p className="text-start">{description}</p>
      </div>
    </div>
  );
}
```

### 3. Form with Icons

```typescript
function SearchInput() {
  const { t } = useTranslation();
  
  return (
    <div className="relative" dir={t.direction}>
      <input 
        type="text" 
        className="ps-10 pe-4"
        placeholder={t('search.placeholder')}
      />
      <Search className="absolute start-3 top-1/2 -translate-y-1/2" />
    </div>
  );
}
```

### 4. Modal with Close Button

```typescript
function Modal({ children, onClose }) {
  const { t } = useTranslation();
  
  return (
    <div className="modal" dir={t.direction}>
      <button 
        onClick={onClose}
        className="absolute top-4 end-4"
      >
        <X />
      </button>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
```

### 5. Breadcrumbs

```typescript
function Breadcrumbs({ items }) {
  const { t } = useTranslation();
  
  return (
    <nav dir={t.direction}>
      {items.map((item, index) => (
        <span key={index}>
          {item}
          {index < items.length - 1 && (
            <ChevronRight className="icon-mirror mx-2" />
          )}
        </span>
      ))}
    </nav>
  );
}
```

---

## 🎯 Best Practices

### 1. Always Use Logical Properties

✅ **Good**:
```css
margin-inline-start: 1rem;
padding-inline-end: 0.5rem;
text-align: start;
```

❌ **Bad**:
```css
margin-left: 1rem;
padding-right: 0.5rem;
text-align: left;
```

### 2. Mirror Directional Icons

✅ **Good**:
```html
<ChevronRight class="icon-mirror" />
<ArrowLeft class="icon-mirror" />
```

❌ **Bad**:
```html
<ChevronRight />  <!-- Won't flip in RTL -->
```

### 3. Use dir Attribute

✅ **Good**:
```html
<div dir={t.direction}>
  Content
</div>
```

❌ **Bad**:
```html
<div>  <!-- No direction specified -->
  Content
</div>
```

### 4. Test with RTL Languages

Always test your components with Arabic or Hebrew to ensure proper RTL support.

---

## 🔍 Troubleshooting

### Icons Not Flipping

**Problem**: Icons don't flip in RTL

**Solution**: Add `icon-mirror` class
```html
<ChevronRight class="icon-mirror" />
```

### Text Alignment Wrong

**Problem**: Text aligned to wrong side

**Solution**: Use `text-start` instead of `text-left`
```html
<p class="text-start">Text</p>
```

### Margins/Paddings Wrong

**Problem**: Spacing on wrong side

**Solution**: Use logical properties
```css
/* Instead of margin-left */
margin-inline-start: 1rem;
```

### Layout Broken in RTL

**Problem**: Layout breaks when switching to RTL

**Solution**: Use flexbox with logical properties
```css
.container {
  display: flex;
  gap: 1rem;  /* Works in both directions */
}
```

---

## 📊 RTL Language Examples

### Arabic (ar)

```
Direction: RTL
Text: مرحبا بك في UNITY
Alignment: Right
Number format: ١٢٣٤٥٦٧٨٩٠ (Arabic-Indic digits)
```

### Hebrew (he)

```
Direction: RTL
Text: ברוכים הבאים ל-UNITY
Alignment: Right
Number format: 1234567890 (Western digits)
```

### Persian (fa)

```
Direction: RTL
Text: به UNITY خوش آمدید
Alignment: Right
Number format: ۱۲۳۴۵۶۷۸۹۰ (Persian digits)
```

---

## 🎓 Migration Checklist

When adding RTL support to existing components:

- [ ] Replace `margin-left/right` with `margin-inline-start/end`
- [ ] Replace `padding-left/right` with `padding-inline-start/end`
- [ ] Replace `text-align: left/right` with `text-align: start/end`
- [ ] Replace `left/right` positioning with `inset-inline-start/end`
- [ ] Add `dir` attribute to containers
- [ ] Add `icon-mirror` class to directional icons
- [ ] Test with Arabic or Hebrew language
- [ ] Check animations and transitions
- [ ] Verify form layouts
- [ ] Check modal and dropdown positioning

---

## 📚 Related Documentation

- [I18N Complete Implementation Plan](./I18N_COMPLETE_IMPLEMENTATION_PLAN.md)
- [Formatting Guide](./I18N_FORMATTING_GUIDE.md)
- [Pluralization Guide](./I18N_PLURALIZATION_GUIDE.md)
- [MDN CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [W3C Writing Modes](https://www.w3.org/TR/css-writing-modes-3/)

