# Universal Animation System

**Версия**: 1.0  
**Дата**: 2025-10-25  
**Статус**: ✅ Implemented (Web), 🔄 Planned (Native)

---

## 🎯 Цель

Создать единую систему анимаций, которая работает **ОДИНАКОВО** в React Web (PWA) и React Native Expo.

---

## 🏗️ Архитектура

### Platform Adapter Pattern

```
src/shared/lib/platform/animation/
├── index.ts                    # Public API + platform detection
├── types.ts                    # Shared types + presets
├── animation.web.ts            # Framer Motion (PWA)
├── animation.native.ts         # Reanimated (React Native) - PLACEHOLDER
└── hooks.ts                    # Animation hooks
```

### Технологии

| Platform | Library | Status |
|----------|---------|--------|
| **Web (PWA)** | Framer Motion (`motion/react`) | ✅ Implemented |
| **React Native** | React Native Reanimated | 🔄 Planned (Q3 2025) |

---

## 📚 API Reference

### AnimatedView

Универсальный компонент для анимированных элементов.

```tsx
import { AnimatedView } from '@/shared/lib/platform/animation';

<AnimatedView
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
  <div>Animated content</div>
</AnimatedView>
```

**Props:**
- `initial`: Начальное состояние анимации
- `animate`: Конечное состояние анимации
- `exit`: Состояние при выходе (для AnimatedPresence)
- `transition`: Конфигурация перехода (spring или timing)
- `className`: CSS классы
- `style`: Inline стили
- `onAnimationComplete`: Callback после завершения анимации

### AnimatedPresence

Управление анимациями при монтировании/размонтировании компонентов.

```tsx
import { AnimatedPresence, AnimatedView } from '@/shared/lib/platform/animation';

<AnimatedPresence mode="wait">
  {isVisible && (
    <AnimatedView
      key="modal"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <Modal />
    </AnimatedView>
  )}
</AnimatedPresence>
```

**Props:**
- `mode`: Режим анимации (`'wait'` | `'sync'` | `'popLayout'`)
- `custom`: Кастомные данные для анимации

### Animation Presets

Готовые пресеты анимаций.

```tsx
import { AnimatedView, AnimationPresets } from '@/shared/lib/platform/animation';

// Fade in
<AnimatedView {...AnimationPresets.fadeIn}>
  <div>Content</div>
</AnimatedView>

// Slide in from left
<AnimatedView {...AnimationPresets.slideInLeft}>
  <div>Content</div>
</AnimatedView>

// Scale in
<AnimatedView {...AnimationPresets.scaleIn}>
  <div>Content</div>
</AnimatedView>
```

**Доступные пресеты:**
- `fadeIn` - Плавное появление
- `slideInLeft` - Слайд слева
- `slideInRight` - Слайд справа
- `slideInUp` - Слайд снизу
- `slideInDown` - Слайд сверху
- `scaleIn` - Масштабирование

**Transition пресеты:**
- `springTransition` - Пружинная анимация (stiffness: 300, damping: 30)
- `smoothTransition` - Плавная анимация (stiffness: 260, damping: 20)
- `fastTransition` - Быстрая анимация (stiffness: 400, damping: 40)

### Screen Transitions

Специальные пресеты для переходов между экранами.

```tsx
import { AnimatedPresence, AnimatedView, ScreenTransitions } from '@/shared/lib/platform/animation';

const [direction, setDirection] = useState(1);

<AnimatedPresence mode="wait" custom={direction}>
  {activeScreen === 'home' && (
    <AnimatedView
      key="home"
      {...ScreenTransitions.slideLeft(direction)}
    >
      <HomeScreen />
    </AnimatedView>
  )}
</AnimatedPresence>
```

**Доступные переходы:**
- `slideLeft(direction)` - Слайд влево/вправо в зависимости от direction
- `fade()` - Плавное затухание

---

## 🔄 Migration Guide

### Шаг 1: Заменить импорты

**До:**
```tsx
import { motion, AnimatePresence } from 'motion/react';
```

**После:**
```tsx
import { AnimatedView, AnimatedPresence } from '@/shared/lib/platform/animation';
```

### Шаг 2: Заменить motion.div на AnimatedView

**До:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  <div>Content</div>
</motion.div>
```

**После:**
```tsx
<AnimatedView
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  <div>Content</div>
</AnimatedView>
```

### Шаг 3: Использовать пресеты где возможно

**До:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
  <div>Content</div>
</motion.div>
```

**После:**
```tsx
<AnimatedView {...AnimationPresets.fadeIn}>
  <div>Content</div>
</AnimatedView>
```

---

## 📋 Migration Checklist

### Критические файлы (приоритет P0):

- [ ] `src/app/mobile/MobileApp.tsx` - Переходы между экранами
- [ ] `src/features/mobile/history/components/HistoryScreen.tsx` - AnimatePresence для списка
- [ ] `src/shared/components/ui/BottomSheet.tsx` - Модальные окна
- [ ] `src/features/mobile/settings/components/ProfileEditModal.tsx` - Модальные окна

### UI компоненты (приоритет P1):

- [ ] `src/shared/components/LazyImage.tsx`
- [ ] `src/shared/components/PhotoViewer.tsx`
- [ ] `src/shared/components/VideoPlayer.tsx`
- [ ] `src/shared/components/MediaGrid.tsx`
- [ ] `src/shared/lib/i18n/LanguageSelector.tsx`

### PWA компоненты (приоритет P2):

- [ ] `src/shared/components/pwa/PWASplash.tsx`
- [ ] `src/shared/components/offline/OfflineStatusBanner.tsx`
- [ ] `src/shared/components/offline/OfflineSyncIndicator.tsx`

### shadcn-io декоративные (приоритет P3):

- [ ] `src/shared/components/ui/shadcn-io/tabs/index.tsx`
- [ ] `src/shared/components/ui/shadcn-io/magnetic-button/index.tsx`
- [ ] `src/shared/components/ui/shadcn-io/motion-highlight/index.tsx`
- [ ] `src/shared/components/ui/shadcn-io/shimmering-text/index.tsx`
- [ ] `src/shared/components/ui/shadcn-io/counter/index.tsx`

---

## 🎯 Benefits

### ✅ Сейчас (PWA):
- Единый API для всех анимаций
- Готовые пресеты для типовых анимаций
- Упрощённый код (меньше boilerplate)

### ✅ Будущее (React Native):
- Нулевая миграция анимаций при переходе на RN
- Одинаковые анимации в PWA и Native
- Простая замена Framer Motion на Reanimated

---

## 🔮 Future: React Native Implementation

### Q3 2025: Реализация animation.native.ts

```tsx
// animation.native.ts (будущая реализация)
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export const AnimatedView: React.FC<AnimatedViewProps> = ({
  children,
  initial,
  animate,
  transition,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(animate?.opacity ?? 1),
      transform: [
        { translateX: withSpring(animate?.x ?? 0) },
        { translateY: withSpring(animate?.y ?? 0) },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};
```

---

## 📝 Notes

- **Web**: Использует Framer Motion (motion/react) - 100% готово
- **Native**: Placeholder реализация - будет заменена на Reanimated в Q3 2025
- **API**: Полностью совместим между платформами
- **TypeScript**: Полная типизация для обеих платформ

