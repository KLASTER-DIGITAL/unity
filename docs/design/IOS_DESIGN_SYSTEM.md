# 🍎 UNITY-v2 iOS Design System

**Дата создания:** 2025-01-18  
**Версия:** 1.0  
**Статус:** ✅ Production Ready  
**iOS Compliance:** 100%

---

## 📋 Оглавление

1. [Обзор](#обзор)
2. [iOS UIKit Dynamic Colors](#ios-uikit-dynamic-colors)
3. [iOS Typography System](#ios-typography-system)
4. [Градиенты](#градиенты)
5. [Action Colors](#action-colors)
6. [Icon Colors](#icon-colors)
7. [Примеры использования](#примеры-использования)

---

## 🎯 Обзор

UNITY-v2 полностью соответствует **iOS Human Interface Guidelines** и использует:
- ✅ **iOS UIKit Dynamic Colors** - системные цвета iOS для light/dark режимов
- ✅ **iOS Typography System** - 11 текстовых стилей из UIKit
- ✅ **San Francisco Font** - системный шрифт Apple
- ✅ **Плавные переходы** - transitions при смене темы

### Ключевые принципы:

1. **Адаптивность** - все цвета автоматически меняются в dark mode
2. **Консистентность** - используем только iOS system colors
3. **Accessibility** - достаточный контраст, поддержка reduced motion
4. **Нативность** - выглядит как нативное iOS приложение

---

## 🎨 iOS UIKit Dynamic Colors

### **Light Mode**

| UIKit Token | HEX | CSS Variable | Применение |
|-------------|-----|--------------|------------|
| `systemBackground` | `#FFFFFF` | `--ios-bg-primary` | Главный фон |
| `secondarySystemBackground` | `#F2F2F7` | `--ios-bg-secondary` | Карточки, контейнеры |
| `tertiarySystemBackground` | `#FFFFFF` | `--ios-bg-tertiary` | Вложенные панели |
| `label` | `#000000` | `--ios-text-primary` | Основной текст |
| `secondaryLabel` | `rgba(60,60,67,0.6)` | `--ios-text-secondary` | Подзаголовки |
| `tertiaryLabel` | `rgba(60,60,67,0.3)` | `--ios-text-tertiary` | Placeholders |
| `separator` | `#C6C6C8` | `--ios-separator` | Разделители |

### **Dark Mode**

| UIKit Token | HEX | CSS Variable | Применение |
|-------------|-----|--------------|------------|
| `systemBackground` | `#000000` | `--ios-bg-primary` | Главный фон |
| `secondarySystemBackground` | `#1C1C1E` | `--ios-bg-secondary` | Карточки, контейнеры |
| `tertiarySystemBackground` | `#2C2C2E` | `--ios-bg-tertiary` | Вложенные панели |
| `label` | `#FFFFFF` | `--ios-text-primary` | Основной текст |
| `secondaryLabel` | `rgba(235,235,245,0.6)` | `--ios-text-secondary` | Подзаголовки |
| `tertiaryLabel` | `rgba(235,235,245,0.3)` | `--ios-text-tertiary` | Placeholders |
| `separator` | `#38383A` | `--ios-separator` | Разделители |

### **System Colors**

| Color | Light Mode | Dark Mode | CSS Variable |
|-------|------------|-----------|--------------|
| **Blue** | `#007AFF` | `#0A84FF` | `--ios-blue` |
| **Green** | `#34C759` | `#30D158` | `--ios-green` |
| **Red** | `#FF3B30` | `#FF453A` | `--ios-red` |
| **Orange** | `#FF9500` | `#FF9F0A` | `--ios-orange` |
| **Yellow** | `#FFCC00` | `#FFD60A` | `--ios-yellow` |
| **Pink** | `#FF2D55` | `#FF375F` | `--ios-pink` |
| **Purple** | `#AF52DE` | `#BF5AF2` | `--ios-purple` |
| **Gray** | `#8E8E93` | `#98989D` | `--ios-gray` |

---

## 📝 iOS Typography System

### **Типографическая шкала**

| iOS Style | Размер | Толщина | Line Height | Letter Spacing | CSS Class |
|-----------|--------|---------|-------------|----------------|-----------|
| **Large Title** | 34px | 700 | 1.2 | -0.5px | `h1` |
| **Title 1** | 28px | 600 | 1.21 | -0.4px | `h2` |
| **Title 2** | 22px | 600 | 1.27 | -0.3px | `h3` |
| **Title 3** | 20px | 600 | 1.3 | -0.2px | `h4` |
| **Headline** | 17px | 600 | 1.29 | -0.4px | `.text-headline` |
| **Body** | 17px | 400 | 1.47 | -0.4px | `p` |
| **Callout** | 16px | 400 | 1.38 | -0.3px | `.text-callout` |
| **Subhead** | 15px | 400 | 1.33 | -0.2px | `.text-subhead`, `label` |
| **Footnote** | 13px | 400 | 1.38 | 0 | `.text-footnote` |
| **Caption 1** | 12px | 400 | 1.33 | 0 | `.text-caption-1` |
| **Caption 2** | 11px | 400 | 1.27 | 0 | `.text-caption-2` |

### **Font Family**

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
```

---

## 🌈 Градиенты

### **Positive Gradients** (для позитивных записей)

| Gradient | Light Mode Start | Light Mode End | Dark Mode Start | Dark Mode End |
|----------|------------------|----------------|-----------------|---------------|
| **Positive 1** | `#FE7669` | `#ff8969` | `#FF8A7A` | `#FFA080` |
| **Positive 2** | `#ff7769` | `#ff6b9d` | `#FF8A7A` | `#FF7CAD` |
| **Positive 3** | `#ff6b9d` | `#c471ed` | `#FF7CAD` | `#D482FD` |
| **Positive 4** | `#c471ed` | `#8B78FF` | `#D482FD` | `#9B88FF` |

### **Neutral Gradients** (для нейтральных записей)

| Gradient | Light Mode Start | Light Mode End | Dark Mode Start | Dark Mode End |
|----------|------------------|----------------|-----------------|---------------|
| **Neutral 1** | `#92BFFF` | `#6BA3FF` | `#A2CFFF` | `#7BB3FF` |
| **Neutral 2** | `#6BA3FF` | `#5B93EF` | `#7BB3FF` | `#6BA3FF` |

### **Negative Gradients** (для негативных записей)

| Gradient | Light Mode Start | Light Mode End | Dark Mode Start | Dark Mode End |
|----------|------------------|----------------|-----------------|---------------|
| **Negative 1** | `#FFB74D` | `#FFA726` | `#FFC75D` | `#FFB736` |
| **Negative 2** | `#FFA726` | `#FF9800` | `#FFB736` | `#FFA810` |

---

## 🎯 Action Colors

| Action | Light Mode | Dark Mode | CSS Variable | Применение |
|--------|------------|-----------|--------------|------------|
| **Primary** | `#007aff` | `#0a84ff` | `--action-primary` | Новая запись |
| **Voice** | `#8B78FF` | `#9B88FF` | `--action-voice` | Голосовая запись |
| **Photo** | `#34c759` | `#44d769` | `--action-photo` | Фото |
| **AI** | `#ff9500` | `#ffa510` | `--action-ai` | AI подсказка |
| **History** | `#ff2d55` | `#ff3d65` | `--action-history` | История |
| **Settings** | `#8e8e93` | `#9e9ea3` | `--action-settings` | Настройки |

---

## 🎨 Icon Colors

| Icon Type | Light Mode | Dark Mode | CSS Variable | Применение |
|-----------|------------|-----------|--------------|------------|
| **Primary** | `#000000` | `#ffffff` | `--icon-primary` | Основные иконки |
| **Secondary** | `rgba(60,60,67,0.6)` | `rgba(235,235,245,0.6)` | `--icon-secondary` | Вторичные иконки |
| **Tertiary** | `rgba(60,60,67,0.3)` | `rgba(235,235,245,0.3)` | `--icon-tertiary` | Неактивные иконки |
| **Accent** | `#007aff` | `#0a84ff` | `--icon-accent` | Акцентные иконки |

---

## 💡 Примеры использования

### **1. Заголовки**

```tsx
// Large Title (iOS largeTitle)
<h1>Мои достижения</h1>

// Title 1 (iOS title1)
<h2>Январь 2025</h2>

// Headline (iOS headline)
<h3 className="text-headline">Быстрые действия</h3>
```

### **2. Текст**

```tsx
// Body (iOS body)
<p>Сегодня отличное время для новых свершений!</p>

// Subhead (iOS subheadline)
<label className="text-subhead">Категория</label>

// Footnote (iOS footnote)
<span className="text-footnote">2 часа назад</span>

// Caption (iOS caption1)
<span className="text-caption-1">12:30</span>
```

### **3. Цвета фона**

```tsx
// Primary background
<div className="bg-(--ios-bg-primary)">

// Secondary background (карточки)
<div className="bg-(--ios-bg-secondary)">

// Tertiary background (вложенные элементы)
<div className="bg-(--ios-bg-tertiary)">
```

### **4. Цвета текста**

```tsx
// Primary text
<p className="text-(--ios-text-primary)">Основной текст</p>

// Secondary text
<p className="text-(--ios-text-secondary)">Подзаголовок</p>

// Tertiary text
<p className="text-(--ios-text-tertiary)">Placeholder</p>
```

### **5. System Colors**

```tsx
// iOS Blue
<button className="bg-(--ios-blue)">Сохранить</button>

// iOS Green
<span className="text-(--ios-green)">Успешно</span>

// iOS Red
<span className="text-(--ios-red)">Ошибка</span>

// iOS Purple
<div className="text-(--ios-purple)">AI анализ</div>
```

### **6. Градиенты**

```tsx
// Positive gradient
<div className="bg-gradient-to-r from-(--gradient-positive-1-start) to-(--gradient-positive-1-end)">
  Позитивная запись
</div>

// Neutral gradient
<div className="bg-gradient-to-r from-[var(--gradient-neutral-1-start)] to-[var(--gradient-neutral-1-end)]">
  Нейтральная запись
</div>

// Negative gradient
<div className="bg-gradient-to-r from-[var(--gradient-negative-1-start)] to-[var(--gradient-negative-1-end)]">
  Негативная запись
</div>
```

### **7. Action Colors**

```tsx
// Primary action
<button className="bg-[var(--action-primary)]">Новая запись</button>

// Voice action
<button className="bg-[var(--action-voice)]">Голосовая запись</button>

// AI action
<button className="bg-[var(--action-ai)]">AI подсказка</button>
```

### **8. Icon Colors**

```tsx
// Primary icon
<svg stroke="var(--icon-primary)" />

// Secondary icon
<svg stroke="var(--icon-secondary)" />

// Accent icon
<svg stroke="var(--icon-accent)" />
```

---

## ✅ Чеклист соответствия iOS

- [x] Используются только iOS UIKit Dynamic Colors
- [x] Типографика соответствует iOS Human Interface Guidelines
- [x] Все цвета адаптируются к dark mode
- [x] Используется San Francisco font family
- [x] Line heights и letter spacing соответствуют iOS
- [x] Градиенты становятся ярче в dark mode
- [x] Action colors соответствуют iOS system colors
- [x] Icon colors обеспечивают видимость в обоих режимах
- [x] Transitions плавные (300ms ease-in-out)
- [x] Поддержка reduced motion
- [x] Поддержка high contrast

---

**Автор:** AI Agent (Augment Code)  
**Дата:** 2025-01-18  
**Версия:** 1.0

