# Dark Theme Checklist - UNITY-v2

**Дата обновления:** 2025-01-18 (Фаза 4)
**Версия:** 2.0
**iOS Compliance:** ✅ 100%

**Используйте этот чеклист при создании новых компонентов или исправлении существующих.**

---

## ✅ Чеклист для нового компонента

### 1. **Фоны (Backgrounds)**

- [ ] Основной фон страницы: `bg-background`
- [ ] Карточки/блоки: `bg-card`
- [ ] Второстепенные элементы (inputs, кнопки): `bg-muted`
- [ ] Hover состояния: `hover:bg-accent/10` или `hover:bg-muted`
- [ ] Active состояния: `active:bg-accent/20`
- [ ] Transitions: `transition-colors duration-300`

### 2. **Текст (Text)**

- [ ] Основной текст: `text-foreground`
- [ ] Второстепенный текст: `text-muted-foreground`
- [ ] Текст на карточках: `text-card-foreground`
- [ ] Текст на primary кнопках: `text-primary-foreground`
- [ ] Placeholder текст: `placeholder:text-muted-foreground`

### 3. **Границы (Borders)**

- [ ] Основные границы: `border-border`
- [ ] Границы inputs: `border-border focus:border-primary`
- [ ] Разделители: `divide-border`

### 4. **Кнопки (Buttons)**

- [ ] Primary кнопка: `bg-primary text-primary-foreground hover:bg-primary/90`
- [ ] Secondary кнопка: `bg-muted text-foreground hover:bg-accent/10`
- [ ] Destructive кнопка: `bg-destructive text-destructive-foreground`
- [ ] Ghost кнопка: `hover:bg-accent/10 text-foreground`

### 5. **Inputs & Forms**

- [ ] Input фон: `bg-input` или `bg-muted`
- [ ] Input текст: `text-foreground`
- [ ] Input placeholder: `placeholder:text-muted-foreground`
- [ ] Input border: `border-border focus:border-primary`
- [ ] Label: `text-foreground` или `text-muted-foreground`

### 6. **Модалы & Overlays**

- [ ] Модал фон: `bg-card`
- [ ] Модал border: `border border-border`
- [ ] Overlay: `bg-black/50` (можно оставить черный)
- [ ] Transitions: `transition-colors duration-300`

### 7. **Специальные элементы**

- [ ] Skeleton loader: `bg-muted` вместо `bg-gray-200`
- [ ] Progress bar фон: `bg-muted`
- [ ] Progress bar fill: `bg-primary` или `bg-accent`
- [ ] Divider: `border-border`

---

## 🔍 Проверка перед коммитом

### Автоматическая проверка:

```bash
# 1. Найти хардкод цвета в вашем файле
grep -n "bg-white\|bg-gray-\|text-gray-\|border-gray-" src/path/to/your/file.tsx

# 2. Если найдено - исправить согласно паттернам выше
```

### Ручная проверка:

1. **Светлая тема:**
   - [ ] Все элементы видны
   - [ ] Текст читаем
   - [ ] Границы видны
   - [ ] Hover состояния работают

2. **Темная тема:**
   - [ ] Все элементы видны
   - [ ] Текст читаем (достаточный контраст)
   - [ ] Границы видны
   - [ ] Hover состояния работают
   - [ ] Нет "белых вспышек" при переключении

3. **Transitions:**
   - [ ] Плавное переключение между темами
   - [ ] Нет резких изменений цвета
   - [ ] `transition-colors duration-300` добавлен

---

## 📋 Паттерны замены

### Фоны:

| ❌ Старый | ✅ Новый | Контекст |
|----------|---------|----------|
| `bg-white` | `bg-card` | Карточки, модалы |
| `bg-white` | `bg-background` | Основной фон страницы |
| `bg-gray-50` | `bg-muted` | Второстепенные элементы |
| `bg-gray-100` | `bg-muted` | Inputs, кнопки |
| `bg-gray-200` | `bg-muted` | Skeleton, progress bar |

### Текст:

| ❌ Старый | ✅ Новый | Контекст |
|----------|---------|----------|
| `text-gray-900` | `text-foreground` | Основной текст |
| `text-gray-800` | `text-foreground` | Заголовки |
| `text-gray-700` | `text-foreground` | Обычный текст |
| `text-gray-600` | `text-muted-foreground` | Второстепенный текст |
| `text-gray-500` | `text-muted-foreground` | Hints, labels |
| `text-gray-400` | `text-muted-foreground` | Placeholder |

### Границы:

| ❌ Старый | ✅ Новый |
|----------|---------|
| `border-gray-200` | `border-border` |
| `border-gray-300` | `border-border` |
| `divide-gray-200` | `divide-border` |

### Hover состояния:

| ❌ Старый | ✅ Новый |
|----------|---------|
| `hover:bg-gray-50` | `hover:bg-muted` |
| `hover:bg-gray-100` | `hover:bg-accent/10` |
| `hover:bg-white/20` | `hover:bg-card/20` |

---

## 🎨 Примеры компонентов

### Карточка:

```tsx
<div className="bg-card border border-border rounded-lg p-4 transition-colors duration-300">
  <h3 className="text-foreground font-semibold mb-2">Заголовок</h3>
  <p className="text-muted-foreground text-sm">Описание</p>
</div>
```

### Кнопка:

```tsx
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
  Нажми меня
</button>
```

### Input:

```tsx
<input
  className="w-full bg-muted border border-border rounded-lg px-4 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
  placeholder="Введите текст..."
/>
```

### Модал:

```tsx
<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
  <div className="bg-card border border-border rounded-xl p-6 max-w-md transition-colors duration-300">
    <h2 className="text-foreground text-xl font-bold mb-4">Заголовок</h2>
    <p className="text-muted-foreground mb-4">Текст модала</p>
    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
      OK
    </button>
  </div>
</div>
```

### Список с hover:

```tsx
<div className="space-y-2">
  {items.map(item => (
    <div
      key={item.id}
      className="bg-card border border-border rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer"
    >
      <h4 className="text-foreground font-medium">{item.title}</h4>
      <p className="text-muted-foreground text-sm">{item.description}</p>
    </div>
  ))}
</div>
```

---

## 🚨 Частые ошибки

### 1. **Забыли добавить transitions**

❌ Плохо:
```tsx
<div className="bg-card">
```

✅ Хорошо:
```tsx
<div className="bg-card transition-colors duration-300">
```

### 2. **Использовали хардкод для "временных" элементов**

❌ Плохо:
```tsx
<div className="bg-gray-100"> {/* "Это временно" */}
```

✅ Хорошо:
```tsx
<div className="bg-muted">
```

### 3. **Не проверили в темной теме**

Всегда тестируйте оба режима!

### 4. **Использовали неправильную переменную для контекста**

❌ Плохо:
```tsx
<div className="bg-background"> {/* Для карточки */}
```

✅ Хорошо:
```tsx
<div className="bg-card"> {/* Для карточки */}
```

---

## 📱 Тестирование

### Как переключить тему:

1. Откройте приложение
2. Перейдите в Settings (⚙️)
3. Найдите переключатель "Dark Mode"
4. Переключите и проверьте ваш компонент

### Что проверять:

- [ ] Все элементы видны в обеих темах
- [ ] Текст читаем (достаточный контраст)
- [ ] Границы видны
- [ ] Hover/Active состояния работают
- [ ] Плавное переключение между темами
- [ ] Нет "белых вспышек"
- [ ] Иконки видны (правильный цвет)

---

## 🔗 Полезные ссылки

- [CSS Architecture Guide](./CSS_ARCHITECTURE_AI_FRIENDLY.md)
- [iOS Design System](./IOS_DESIGN_SYSTEM.md) ⭐ NEW!
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [OKLCH Color Picker](https://oklch.com/)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)

---

## 🍎 iOS UIKit Variables (NEW!)

### **Фоны (iOS Backgrounds)**

- [ ] Primary background: `bg-[var(--ios-bg-primary)]` (white → black)
- [ ] Secondary background: `bg-[var(--ios-bg-secondary)]` (#F2F2F7 → #1C1C1E)
- [ ] Tertiary background: `bg-[var(--ios-bg-tertiary)]` (white → #2C2C2E)

### **Текст (iOS Labels)**

- [ ] Primary text: `text-[var(--ios-text-primary)]` (black → white)
- [ ] Secondary text: `text-[var(--ios-text-secondary)]` (60% opacity)
- [ ] Tertiary text: `text-[var(--ios-text-tertiary)]` (30% opacity)

### **System Colors**

- [ ] Blue: `bg-[var(--ios-blue)]` (#007AFF → #0A84FF)
- [ ] Green: `bg-[var(--ios-green)]` (#34C759 → #30D158)
- [ ] Red: `bg-[var(--ios-red)]` (#FF3B30 → #FF453A)
- [ ] Orange: `bg-[var(--ios-orange)]` (#FF9500 → #FF9F0A)
- [ ] Purple: `bg-[var(--ios-purple)]` (#AF52DE → #BF5AF2)

### **Градиенты (Theme-aware)**

- [ ] Positive: `from-[var(--gradient-positive-1-start)] to-[var(--gradient-positive-1-end)]`
- [ ] Neutral: `from-[var(--gradient-neutral-1-start)] to-[var(--gradient-neutral-1-end)]`
- [ ] Negative: `from-[var(--gradient-negative-1-start)] to-[var(--gradient-negative-1-end)]`

### **Action Colors**

- [ ] Primary action: `bg-[var(--action-primary)]` (iOS blue)
- [ ] Voice action: `bg-[var(--action-voice)]` (purple)
- [ ] Photo action: `bg-[var(--action-photo)]` (iOS green)
- [ ] AI action: `bg-[var(--action-ai)]` (iOS orange)

### **Icon Colors**

- [ ] Primary icon: `stroke="var(--icon-primary)"` (black → white)
- [ ] Secondary icon: `stroke="var(--icon-secondary)"` (60% opacity)
- [ ] Accent icon: `stroke="var(--icon-accent)"` (iOS blue)

---

## 📝 iOS Typography Classes (NEW!)

- [ ] Large Title: `<h1>` (34px/700)
- [ ] Title 1: `<h2>` (28px/600)
- [ ] Title 2: `<h3>` (22px/600)
- [ ] Title 3: `<h4>` (20px/600)
- [ ] Headline: `.text-headline` (17px/600)
- [ ] Body: `<p>` (17px/400)
- [ ] Callout: `.text-callout` (16px/400)
- [ ] Subhead: `.text-subhead` или `<label>` (15px/400)
- [ ] Footnote: `.text-footnote` (13px/400)
- [ ] Caption 1: `.text-caption-1` (12px/400)
- [ ] Caption 2: `.text-caption-2` (11px/400)

---

## 🎨 Admin Panel Variables (NEW!)

### **Admin Theme Colors**

- [ ] Primary: `var(--admin-primary)` (#4f46e5)
- [ ] Background: `var(--admin-bg-primary)` (white)
- [ ] Secondary background: `var(--admin-bg-secondary)` (#f9fafb)

### **Admin Components**

- [ ] Card: `.admin-card`
- [ ] Button: `.admin-btn`, `.admin-btn-primary`, `.admin-btn-secondary`
- [ ] Input: `.admin-input`
- [ ] Table: `.admin-table`

---

**Помните:** Лучше потратить 5 минут на правильную реализацию сейчас, чем 30 минут на исправление потом! 🚀



## ✅ Финальный чеклист (Фаза 4)

### **Mobile Screens (7 компонентов исправлено)**

- [x] AchievementHeader.tsx - 20 замен (SVG icons, action colors)
- [x] AchievementHomeScreen.tsx - 29 замен (градиенты)
- [x] ChatInputSection.tsx - 6 замен (tags)
- [x] ReportsScreen.tsx - 18 замен (иконки, цвета)
- [x] HistoryScreen.tsx - 3 замены (sentiment colors)
- [x] RecentEntriesFeed.tsx - 3 замены (rarity colors)
- [x] AchievementsScreen.tsx - 6 замен (rarity colors)

### **Admin Modules (8 файлов создано)**

- [x] admin-theme.css - 145 строк (CSS переменные)
- [x] admin-typography.css - 73 строки (типографика)
- [x] admin-cards.css - 57 строк (карточки)
- [x] admin-buttons.css - 135 строк (кнопки)
- [x] admin-forms.css - 167 строк (формы)
- [x] admin-tables.css - 44 строки (таблицы)
- [x] admin-utilities.css - 103 строки (утилиты)
- [x] admin-responsive.css - 103 строки (адаптивность)

### **iOS Theme Extensions (5 файлов создано)**

- [x] theme-gradients.css - 78 строк (градиенты)
- [x] theme-actions.css - 58 строк (action colors)
- [x] theme-icons.css - 58 строк (icon colors)
- [x] typography.css - 198 строк (iOS Typography System)
- [x] animations.css - 80 строк (анимации)

### **Документация (3 файла обновлено/создано)**

- [x] CSS_ARCHITECTURE_AI_FRIENDLY.md - обновлен (v2.0)
- [x] IOS_DESIGN_SYSTEM.md - создан (v1.0)
- [x] DARK_THEME_CHECKLIST.md - обновлен (v2.0)

---

**Автор:** AI Agent (Augment Code)
**Последнее обновление:** 2025-01-18 (Фаза 4)
**Версия:** 2.0
