# 🎨 UNITY-v2 Design System - AI Guide

**Дата создания:** 2025-11-04  
**Версия:** 2.0  
**Статус:** ✅ Production Ready  
**Применение:** Автоматически для всех AI-ассистентов

---

## 📋 Оглавление

1. [Обзор](#обзор)
2. [Компоненты](#компоненты)
3. [Цветовая система](#цветовая-система)
4. [Типографика](#типографика)
5. [Spacing & Layout](#spacing--layout)
6. [Паттерны использования](#паттерны-использования)
7. [Принципы](#принципы)
8. [Файловая структура](#файловая-структура)

---

## 🎯 Обзор

UNITY-v2 использует **гибридную дизайн-систему** для PWA и React Native:

- ✅ **shadcn/ui** - 49+ компонентов для Web (Radix UI + Tailwind CSS)
- ✅ **Universal Components** - 8 компонентов с .web.tsx и .native.tsx версиями
- ✅ **iOS Design System** - 100% соответствие iOS Human Interface Guidelines
- ✅ **OKLCH Color Space** - для лучшей перцептивной однородности
- ✅ **AI-Friendly** - файлы < 300 строк, модульная структура
- ✅ **Dark Theme** - 85% покрытие, автоматическое переключение

### Ключевые принципы:

1. **Dual-Platform** - ВСЕГДА создавать .web.ts И .native.tsx для новых компонентов
2. **CSS Variables** - НИКОГДА хардкод цветов (`bg-white`), ВСЕГДА `bg-card`, `text-foreground`
3. **Transitions** - ВСЕГДА добавлять `transition-colors duration-300` для темной темы
4. **Accessibility** - touch targets 44x44px, достаточный контраст, reduced motion
5. **Responsive** - breakpoints 320px → 375px → 390px → 430px, PWA max-w-md (448px)

---

## 🧩 Компоненты

### shadcn/ui Components (49+)

**Расположение:** `src/shared/components/ui/`

**Основные компоненты:**
- `button.tsx` - Кнопки (Radix UI Slot)
- `card.tsx` - Карточки
- `dialog.tsx` - Модальные окна (Radix UI Dialog)
- `input.tsx` - Поля ввода
- `select.tsx` - Выпадающие списки (Radix UI Select)
- `switch.tsx` - Переключатели (Radix UI Switch)
- `checkbox.tsx` - Чекбоксы (Radix UI Checkbox)
- `radio-group.tsx` - Радио кнопки (Radix UI RadioGroup)
- `sonner.tsx` - Toast notifications (sonner)
- `skeleton.tsx` - Скелетоны для загрузки
- `badge.tsx` - Бейджи
- `avatar.tsx` - Аватары
- `tooltip.tsx` - Подсказки
- `popover.tsx` - Поповеры
- `dropdown-menu.tsx` - Выпадающие меню
- `tabs.tsx` - Табы
- `accordion.tsx` - Аккордеоны
- `alert.tsx` - Алерты
- `progress.tsx` - Прогресс бары
- `slider.tsx` - Слайдеры
- `table.tsx` - Таблицы
- `calendar.tsx` - Календари
- `form.tsx` - Формы

**shadcn-io Special Components:**
- `shadcn-io/3d-card/` - 3D карточки
- `shadcn-io/animated-modal/` - Анимированные модалки
- `shadcn-io/animated-tooltip/` - Анимированные подсказки
- `shadcn-io/background-gradient/` - Градиентные фоны
- `shadcn-io/magnetic-button/` - Магнитные кнопки
- `shadcn-io/motion-highlight/` - Подсветка при наведении
- `shadcn-io/shimmering-text/` - Мерцающий текст
- `shadcn-io/sparkles/` - Эффект искр
- `shadcn-io/color-picker/` - Выбор цвета
- `shadcn-io/counter/` - Счетчики
- `shadcn-io/gantt/` - Диаграммы Ганта
- `shadcn-io/rating/` - Рейтинги
- `shadcn-io/terminal/` - Терминал

**Lazy Loading:**
- `lazy/LazyComponents.tsx` - Lazy load для тяжелых компонентов
- `charts/LazyCharts.tsx` - Lazy load для графиков (recharts)

### Universal Components (8)

**Расположение:**
- PWA: `src/shared/components/ui/universal/`
- React Native: `app-shared/components/ui/universal/`

**Компоненты:**

#### 1. **Button**
```typescript
import { Button } from '@/shared/components/ui/universal/Button';

<Button variant="default" size="lg" onPress={() => console.log('Pressed')}>
  Click me
</Button>
```

**Варианты:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`  
**Размеры:** `default`, `sm`, `lg`, `icon`

#### 2. **Switch**
```typescript
import { Switch } from '@/shared/components/ui/universal/Switch';

<Switch checked={enabled} onCheckedChange={setEnabled} />
```

#### 3. **Modal**
```typescript
import { Modal } from '@/shared/components/ui/universal/Modal';

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Title">
  <p>Content</p>
</Modal>
```

#### 4. **Dialog**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/universal/Dialog';

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <p>Content</p>
  </DialogContent>
</Dialog>
```

#### 5. **Toast**
```typescript
import { toast } from '@/shared/components/ui/universal/Toast';

toast.success('Success!');
toast.error('Error!', { description: 'Something went wrong' });
```

#### 6. **Checkbox**
```typescript
import { Checkbox } from '@/shared/components/ui/universal/Checkbox';

<Checkbox checked={agreed} onCheckedChange={setAgreed} />
```

#### 7. **Select**
```typescript
import { Select } from '@/shared/components/ui/universal/Select';

<Select
  value={selectedValue}
  onValueChange={setSelectedValue}
  options={[
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ]}
/>
```

#### 8. **RadioGroup**
```typescript
import { RadioGroup } from '@/shared/components/ui/universal/RadioGroup';

<RadioGroup
  value={selectedOption}
  onValueChange={setSelectedOption}
  options={[
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ]}
/>
```

---

## 🎨 Цветовая система

### OKLCH Color Space

**Формат:** `oklch(lightness chroma hue)`

**Преимущества:**
- Лучшая перцептивная однородность
- Предсказуемые изменения яркости
- Плавные переходы между темами

### Semantic Colors

**Light Mode:**
```css
--background: oklch(1 0 0);              /* #ffffff */
--foreground: oklch(0 0 0);              /* #000000 */
--card: oklch(0.98 0 0);                 /* #fafafa */
--primary: oklch(0.568 0.207 254.604);   /* #007aff - iOS blue */
--secondary: oklch(0.975 0 0);           /* #f2f2f7 */
--muted: oklch(0.975 0 0);               /* #f2f2f7 */
--accent: oklch(0.568 0.207 254.604);    /* #007aff */
--destructive: oklch(0.637 0.237 25.331); /* #ff3b30 - iOS red */
--border: oklch(0.85 0.005 286.75);      /* #c6c6c8 */
```

**Dark Mode:**
```css
--background: oklch(0 0 0);              /* #000000 */
--foreground: oklch(1 0 0);              /* #ffffff */
--card: oklch(0.22 0 0);                 /* #2b2b2b */
--primary: oklch(0.696 0.17 254.604);    /* #0a84ff - iOS blue */
--secondary: oklch(0.18 0.005 286.75);   /* #1c1c1e */
--muted: oklch(0.22 0.005 286.75);       /* #2c2c2e */
--accent: oklch(0.696 0.17 254.604);     /* #0a84ff */
--destructive: oklch(0.704 0.191 22.216); /* #ff453a - iOS red */
--border: oklch(0.28 0.005 286.75);      /* #38383a */
```

### iOS System Colors

**Light Mode:**
```css
--ios-blue: #007aff;
--ios-green: #34c759;
--ios-red: #ff3b30;
--ios-orange: #ff9500;
--ios-yellow: #ffcc00;
--ios-pink: #ff2d55;
--ios-purple: #af52de;
--ios-gray: #8e8e93;
```

**Dark Mode:**
```css
--ios-blue: #0a84ff;
--ios-green: #30d158;
--ios-red: #ff453a;
--ios-orange: #ff9f0a;
--ios-yellow: #ffd60a;
--ios-pink: #ff375f;
--ios-purple: #bf5af2;
--ios-gray: #98989d;
```

### Gradients

**Positive Gradients:**
```css
--gradient-positive-1: linear-gradient(135deg, #34c759, #30d158);  /* Green */
--gradient-positive-2: linear-gradient(135deg, #007aff, #0a84ff);  /* Blue */
--gradient-positive-3: linear-gradient(135deg, #af52de, #bf5af2);  /* Purple */
--gradient-positive-4: linear-gradient(135deg, #ff9500, #ff9f0a);  /* Orange */
```

**Neutral Gradients:**
```css
--gradient-neutral-1: linear-gradient(135deg, #8e8e93, #98989d);   /* Gray */
--gradient-neutral-2: linear-gradient(135deg, #f2f2f7, #ffffff);   /* Light Gray */
```

**Negative Gradients:**
```css
--gradient-negative-1: linear-gradient(135deg, #ff3b30, #ff453a);  /* Red */
--gradient-negative-2: linear-gradient(135deg, #ff2d55, #ff375f);  /* Pink */
```

### Action Colors

```css
--action-primary: var(--ios-blue);    /* #007aff / #0a84ff */
--action-voice: var(--ios-purple);    /* #af52de / #bf5af2 */
--action-photo: var(--ios-green);     /* #34c759 / #30d158 */
--action-ai: var(--ios-purple);       /* #af52de / #bf5af2 */
--action-history: var(--ios-orange);  /* #ff9500 / #ff9f0a */
--action-settings: var(--ios-gray);   /* #8e8e93 / #98989d */
```

### Icon Colors

```css
--icon-primary: var(--foreground);           /* #000000 / #ffffff */
--icon-secondary: var(--muted-foreground);   /* rgba(60,60,67,0.6) / rgba(235,235,245,0.6) */
--icon-tertiary: var(--ios-text-tertiary);   /* rgba(60,60,67,0.3) / rgba(235,235,245,0.3) */
--icon-accent: var(--primary);               /* #007aff / #0a84ff */
```

### Z-Index Hierarchy

```css
--z-base: 0;
--z-dropdown: 10;
--z-sticky: 20;
--z-fixed: 30;
--z-navigation: 50;        /* Mobile bottom navigation */
--z-modal-backdrop: 60;    /* Modal backdrop (above navigation) */
--z-modal: 70;             /* Modal content (above backdrop) */
--z-popover: 80;           /* Popovers and tooltips */
--z-tooltip: 90;           /* Tooltips (highest) */
```

### Использование цветов

**✅ ПРАВИЛЬНО:**
```tsx
<div className="bg-card text-foreground border-border">
  <h1 className="text-primary">Title</h1>
  <p className="text-muted-foreground">Description</p>
  <button className="bg-(--action-primary) text-white">Action</button>
</div>
```

**❌ НЕПРАВИЛЬНО:**
```tsx
<div className="bg-white text-black border-gray-200">
  <h1 className="text-blue-500">Title</h1>
  <p className="text-gray-500">Description</p>
  <button className="bg-blue-500 text-white">Action</button>
</div>
```

---

## ✍️ Типографика

### iOS Typography System

**Font Family:**
```css
--font-family-ios: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
```

**Font Sizes:**
```css
--text-large-title: 34px;  /* iOS largeTitle */
--text-title-1: 28px;      /* iOS title1 */
--text-title-2: 22px;      /* iOS title2 */
--text-title-3: 20px;      /* iOS title3 */
--text-headline: 17px;     /* iOS headline */
--text-body: 17px;         /* iOS body */
--text-callout: 16px;      /* iOS callout */
--text-subhead: 15px;      /* iOS subheadline */
--text-footnote: 13px;     /* iOS footnote */
--text-caption-1: 12px;    /* iOS caption1 */
--text-caption-2: 11px;    /* iOS caption2 */
```

**Font Weights:**
```css
--font-weight-bold: 700;      /* Large Title */
--font-weight-semibold: 600;  /* Titles, Headlines */
--font-weight-regular: 400;   /* Body, Callout, Subhead, Footnote, Captions */
--font-weight-light: 300;     /* Optional for very light text */
```

### Использование типографики

```tsx
<h1 className="text-(--text-large-title) font-bold">Large Title</h1>
<h2 className="text-(--text-title-1) font-semibold">Title 1</h2>
<h3 className="text-(--text-title-2) font-semibold">Title 2</h3>
<p className="text-(--text-body) font-normal">Body text</p>
<span className="text-(--text-footnote) text-muted-foreground">Footnote</span>
```

---

## 📐 Spacing & Layout

### Border Radius
```css
--radius: 10px;
--radius-sm: 6px;   /* calc(var(--radius) - 4px) */
--radius-md: 8px;   /* calc(var(--radius) - 2px) */
--radius-lg: 10px;  /* var(--radius) */
--radius-xl: 12px;  /* calc(var(--radius) + 2px) */
--radius-2xl: 14px; /* calc(var(--radius) + 4px) */
--radius-3xl: 18px; /* calc(var(--radius) + 8px) */
```

### Responsive Breakpoints
```css
320px  /* iPhone SE (base) */
375px  /* iPhone 12/13 mini (sm) */
390px  /* iPhone 12/13/14 (md) */
430px  /* iPhone 14 Pro Max (lg) */
448px  /* PWA max-width (max-w-md) */
```

### Touch Targets
```css
Minimum: 44x44px  /* iOS Human Interface Guidelines */
```

---

## 📚 Паттерны использования

### Card Pattern
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card';

<Card className="border-0 bg-card shadow-sm transition-colors duration-300">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Content</p>
  </CardContent>
</Card>
```

### Form Pattern
```tsx
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/universal/Button';

<form className="space-y-4">
  <Input
    type="text"
    placeholder="Enter text"
    className="bg-muted/50 border-border"
  />
  <Button variant="default" fullWidth>
    Submit
  </Button>
</form>
```

### Modal Pattern
```tsx
import { Modal } from '@/shared/components/ui/universal/Modal';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  <div className="space-y-4">
    <p className="text-foreground">Content</p>
    <Button onClick={() => setIsOpen(false)}>Close</Button>
  </div>
</Modal>
```

---

## ⚡ Принципы

### 1. AI-Friendly Code
- **Модульность:** файлы < 300 строк (CSS < 200, компоненты < 250)
- **Читаемость:** явные имена, избегать сокращений
- **Комментарии:** для сложной логики
- **Время анализа:** 3-5 сек вместо 30-60 сек

### 2. iOS Compliance
- **100% соответствие** iOS Human Interface Guidelines
- **iOS UIKit Dynamic Colors** для light/dark режимов
- **San Francisco Font** - системный шрифт Apple
- **Touch Targets:** минимум 44x44px

### 3. Accessibility
- **Контраст:** достаточный контраст текста (WCAG AA)
- **Reduced Motion:** поддержка `prefers-reduced-motion`
- **High Contrast:** поддержка `prefers-contrast`
- **Keyboard Navigation:** все интерактивные элементы доступны с клавиатуры

### 4. Performance
- **Lazy Loading:** для тяжелых компонентов (charts, animations)
- **Code Splitting:** автоматическое разделение кода Vite
- **Bundle Size:** оптимизация размера бандла

---

## 📂 Файловая структура

```
src/
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx              # shadcn/ui Button
│   │   │   ├── card.tsx                # shadcn/ui Card
│   │   │   ├── dialog.tsx              # shadcn/ui Dialog
│   │   │   ├── input.tsx               # shadcn/ui Input
│   │   │   ├── select.tsx              # shadcn/ui Select
│   │   │   ├── switch.tsx              # shadcn/ui Switch
│   │   │   ├── sonner.tsx              # Toast (sonner)
│   │   │   ├── universal/              # Universal Components
│   │   │   │   ├── Button.tsx          # PWA Button
│   │   │   │   ├── Button.web.tsx      # Web implementation
│   │   │   │   ├── Switch.tsx          # PWA Switch
│   │   │   │   ├── Switch.web.tsx      # Web implementation
│   │   │   │   ├── Modal.tsx           # PWA Modal
│   │   │   │   ├── Dialog.tsx          # PWA Dialog
│   │   │   │   ├── Toast.tsx           # PWA Toast
│   │   │   │   └── index.tsx           # Exports
│   │   │   ├── shadcn-io/              # Special components
│   │   │   ├── lazy/                   # Lazy loading
│   │   │   └── charts/                 # Charts
│   │   └── theme-provider.tsx          # Theme context
│   └── lib/
│       └── platform/                   # Platform adapters
├── styles/
│   ├── index.css                       # Entry point
│   ├── theme-tokens.css                # Tailwind tokens
│   ├── theme-light.css                 # Light theme
│   └── theme-dark.css                  # Dark theme
└── index.css                           # Generated Tailwind CSS

app-shared/                             # React Native
├── components/
│   └── ui/
│       └── universal/
│           ├── Button.native.tsx       # RN Button
│           ├── Switch.native.tsx       # RN Switch
│           ├── Modal.native.tsx        # RN Modal
│           └── index.ts                # Exports
└── design-system/
    └── tokens.ts                       # Design tokens
```

---

## 🔗 Связанные документы

- [IOS_DESIGN_SYSTEM.md](./IOS_DESIGN_SYSTEM.md) - iOS дизайн система
- [CSS_ARCHITECTURE_AI_FRIENDLY.md](../architecture/CSS_ARCHITECTURE_AI_FRIENDLY.md) - CSS архитектура
- [DARK_THEME_CHECKLIST.md](./DARK_THEME_CHECKLIST.md) - Темная тема
- [REACT_NATIVE_ARCHITECTURE_ANALYSIS.md](../architecture/REACT_NATIVE_ARCHITECTURE_ANALYSIS.md) - React Native архитектура

---

**Создано:** 2025-11-04  
**Автор:** AI Assistant  
**Статус:** ✅ Production Ready

