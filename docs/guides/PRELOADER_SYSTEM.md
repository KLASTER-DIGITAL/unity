# 🎬 Система Прелоадеров (Lottie Animations)

## 📋 Обзор

UNITY-v2 использует улучшенную систему прелоадеров на основе Lottie анимаций с поддержкой:
- ✅ Двух типов анимаций (Initial Loading & Page Transitions)
- ✅ Адаптивности к светлой/темной теме
- ✅ Различных размеров и вариантов компонентов
- ✅ Минимального времени показа для лучшего UX

---

## 🎨 Типы Анимаций

### 1. **Initial Loading** (Первая загрузка)
**Файлы:** `Black.json` (темная тема) и `White.json` (светлая тема)

**Использование:**
- Welcome Screen при первой загрузке приложения
- Загрузка переводов и инициализация системы
- Минимальное время показа: 5 секунд

**Пример:**
```tsx
<LottiePreloader
  message="Загрузка..."
  minDuration={5000}
  animationType="initial"
  size="lg"
/>
```

### 2. **Page Transitions** (Переходы между страницами)
**Файлы:** `Black-2.json` (темная тема) и `White-2.json` (светлая тема)

**Использование:**
- Загрузка данных при переходе между экранами
- Загрузка записей, отчетов, достижений
- Минимальное время показа: 1-2 секунды

**Пример:**
```tsx
<LottiePreloaderCompact
  showMessage={false}
  minDuration={1000}
  animationType="transition"
  size="md"
/>
```

---

## 🧩 Компоненты Прелоадеров

### 1. **LottiePreloader** (Полноэкранный)
Используется для полноэкранной загрузки (Welcome Screen, App Initialization)

```tsx
import { LottiePreloader } from '@/shared/components/LottiePreloader';

<LottiePreloader
  message="Загрузка..."           // Текст под анимацией
  minDuration={5000}              // Минимальное время показа (мс)
  showMessage={true}              // Показывать ли текст
  size="lg"                        // Размер: sm, md, lg, xl
  animationType="initial"          // Тип: initial, transition
  onMinDurationComplete={() => {}} // Callback при завершении
/>
```

### 2. **LottiePreloaderCompact** (Компактный)
Используется внутри компонентов для загрузки данных

```tsx
import { LottiePreloaderCompact } from '@/shared/components/LottiePreloader';

<LottiePreloaderCompact
  showMessage={false}              // Обычно без текста
  minDuration={1000}               // Быстрее, чем initial
  size="md"                         // Размер: sm, md, lg, xl
  animationType="transition"        // Тип: initial, transition
/>
```

### 3. **LottiePreloaderInline** (Inline)
Используется в кнопках и других inline элементах

```tsx
import { LottiePreloaderInline } from '@/shared/components/LottiePreloader';

<LottiePreloaderInline
  size="sm"                         // Размер: sm, md, lg, xl
  animationType="transition"        // Тип: initial, transition
/>
```

---

## 🎯 Примеры Использования

### Welcome Screen (Initial Loading)
```tsx
// src/features/mobile/auth/components/WelcomeScreen.tsx
if (!isLoaded) {
  return (
    <div className="bg-white w-full h-screen max-w-md mx-auto">
      <LottiePreloader
        showMessage={false}
        minDuration={5000}
        animationType="initial"
        size="lg"
      />
    </div>
  );
}
```

### Home Screen (Page Transition)
```tsx
// src/features/mobile/home/components/AchievementHomeScreen.tsx
{isLoading && (
  <div className="p-section flex items-center justify-center">
    <LottiePreloaderCompact
      showMessage={false}
      minDuration={1000}
      animationType="transition"
      size="md"
    />
  </div>
)}
```

### History Screen (Page Transition)
```tsx
// src/features/mobile/history/components/HistoryScreen.tsx
{isLoading ? (
  <div className="flex items-center justify-center py-12">
    <LottiePreloaderCompact
      showMessage={false}
      minDuration={1000}
      animationType="transition"
      size="md"
    />
  </div>
) : (
  // Content
)}
```

---

## 🎨 Размеры Анимаций

### LottiePreloader (Полноэкранный)
- `sm`: 96x96px (w-24 h-24)
- `md`: 128x128px (w-32 h-32) - **Default**
- `lg`: 192x192px (w-48 h-48)
- `xl`: 256x256px (w-64 h-64)

### LottiePreloaderCompact (Компактный)
- `sm`: 48x48px (w-12 h-12) - **Default**
- `md`: 64x64px (w-16 h-16)
- `lg`: 96x96px (w-24 h-24)
- `xl`: 128x128px (w-32 h-32)

### LottiePreloaderInline (Inline)
- `sm`: 16x16px (w-4 h-4) - **Default**
- `md`: 24x24px (w-6 h-6)
- `lg`: 32x32px (w-8 h-8)
- `xl`: 48x48px (w-12 h-12)

---

## 🌓 Поддержка Тем

Все компоненты автоматически адаптируются к текущей теме:

**Светлая тема (light):**
- Initial Loading: `White.json` (светлая анимация)
- Page Transitions: `White-2.json` (светлая анимация)

**Темная тема (dark):**
- Initial Loading: `Black.json` (темная анимация)
- Page Transitions: `Black-2.json` (темная анимация)

Переключение происходит автоматически через `useTheme()` hook.

---

## 📁 Структура Файлов

```
src/
├── components/preloader/
│   ├── Black.json          # Темная анимация (Initial Loading)
│   ├── White.json          # Светлая анимация (Initial Loading)
│   ├── Black-2.json        # Темная анимация (Page Transitions)
│   └── White-2.json        # Светлая анимация (Page Transitions)
└── shared/components/
    └── LottiePreloader.tsx # Основной компонент
```

---

## ⚡ Производительность

- **Lazy Loading:** Анимации загружаются только при необходимости
- **Code Splitting:** Каждая анимация в отдельном чанке
- **Оптимизация:** JSON файлы минимизированы
- **Кэширование:** Браузер кэширует загруженные анимации

---

## 🔧 Добавление Новых Анимаций

Если нужно добавить новый тип анимации:

1. Добавьте JSON файлы в `src/components/preloader/`
2. Импортируйте их в `LottiePreloader.tsx`
3. Добавьте новый тип в `animationType` prop
4. Обновите логику выбора анимации

Пример:
```tsx
// Импорт
import customAnimation from '@/components/preloader/Custom.json';

// Использование
const animationData = animationType === 'custom'
  ? (theme === 'dark' ? customAnimation : customAnimation)
  : ...
```

---

## 📚 Документация

- **Lottie React:** https://github.com/LottieFiles/lottie-react
- **Lottie Web:** https://github.com/airbnb/lottie-web
- **Figma Animations:** Экспортируйте как Lottie JSON


