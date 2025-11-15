# React Native UI/UX Migration - Детальный план

**Дата создания**: 2025-10-30
**Статус**: В процессе (50% готовности)
**Цель**: Полная миграция UI/UX из PWA в React Native за 5-7 дней

---

## 🎯 Текущее состояние

### ✅ Что готово (Инфраструктура 100%)

#### Platform Adapters (8 адаптеров)
```
app-shared/lib/platform/
├── animation.native.ts         ✅ Reanimated (placeholder)
├── media-picker.native.ts      ✅ Expo ImagePicker
├── media.native.ts             ✅ Expo FileSystem
├── navigation.native.ts        ✅ Expo Router
├── offline.native.ts           ✅ SQLite + AsyncStorage
├── speech.native.ts            ✅ Expo Speech
├── storage.native.ts           ✅ AsyncStorage
└── voice.native.ts             ✅ Expo AV
```

#### Universal Components (9 компонентов)
```
app-shared/components/ui/
├── Button.native.tsx           ✅ TouchableOpacity + стили
├── Checkbox.native.tsx         ✅ Custom checkbox
├── Dialog.native.tsx           ✅ RN Modal
├── Modal.native.tsx            ✅ RN Modal
├── RadioGroup.native.tsx       ✅ TouchableOpacity radio
├── Select.native.tsx           ✅ RN Picker
├── Switch.native.tsx           ✅ RN Switch
├── Toast.native.tsx            ✅ react-native-toast-message
└── universal/
    └── Pressable.native.tsx    ✅ RN Pressable
```

### ❌ Что НЕ готово (UI экраны 0%)

#### Экраны (заглушки)
```
app/(tabs)/
├── index.tsx                   ❌ Заглушка (20 строк)
├── diary.tsx                   ❌ Заглушка (20 строк)
├── achievements.tsx            ❌ Заглушка (20 строк)
└── settings.tsx                ❌ Заглушка (20 строк)
```

#### Компоненты (не созданы)
```
app-shared/components/screens/  ❌ Директория не существует
├── home/                       ❌ Нужно создать
│   ├── AchievementHeader.native.tsx
│   ├── ChatInputSection.native.tsx
│   ├── RecentEntriesFeed.native.tsx
│   └── MotivationCardsSection.native.tsx
├── history/                    ❌ Нужно создать
│   ├── SearchBar.native.tsx
│   ├── FiltersPanel.native.tsx
│   ├── EntryCard.native.tsx
│   └── EntryActionsModal.native.tsx
└── achievements/               ❌ Нужно создать
    ├── AchievementCard.native.tsx
    └── MilestoneCard.native.tsx
```

---

## 📊 Прогресс миграции

```
Инфраструктура:     ████████████████████ 100% ✅
Platform Adapters:  ████████████████████ 100% ✅
Universal Components: ████████████████████ 100% ✅
Экраны:             ░░░░░░░░░░░░░░░░░░░░   0% ❌
Компоненты:         ░░░░░░░░░░░░░░░░░░░░   0% ❌
Анимации:           ░░░░░░░░░░░░░░░░░░░░   0% ❌
Навигация:          ████████████████████ 100% ✅

ОБЩИЙ ПРОГРЕСС:     ██████████░░░░░░░░░░  50%
```

---

## 🛠️ React Native DevTools

### Доступ к DevTools

**URL**: http://localhost:8081
**Инструмент**: Chrome MCP для отладки
**Возможности**:
- Инспекция компонентов
- Просмотр props и state
- Анализ производительности
- Консоль для логов
- Network requests

### Как использовать

1. **Запустить Expo dev server**:
   ```bash
   npm run start:expo
   ```

2. **Открыть DevTools в браузере**:
   - Автоматически откроется http://localhost:8081
   - Или нажать `j` в терминале Expo

3. **Подключить Chrome MCP**:
   ```typescript
   // Через Augment Agent
   new_page_chrome-devtools({ url: "http://localhost:8081" })
   ```

4. **Проверить консоль**:
   ```typescript
   list_console_messages_chrome-devtools()
   ```

### Текущее состояние DevTools

**Статус**: Disconnected (Connection lost to corresponding device)
**Причина**: Expo dev server не запущен или устройство не подключено

**Решение**:
1. Запустить `npm run start:expo`
2. Подключить устройство (Expo Go или Development Build)
3. Нажать "Reconnect DevTools"

---

## 📋 План миграции (5-7 дней)

### День 1-2: Home Screen (Главный экран)

**Задача**: Портирование `app/(tabs)/index.tsx`

**Источник**: `src/features/mobile/home/components/AchievementHomeScreen.tsx`

**Компоненты для адаптации**:
1. `AchievementHeader` - шапка с аватаром и статистикой
2. `ChatInputSection` - поле ввода с AI
3. `RecentEntriesFeed` - лента записей
4. `MotivationCardsSection` - карточки мотивации

**Что переиспользуется**:
- ✅ API calls (`getUserStats`, `getEntries`)
- ✅ State management (useState, useEffect)
- ✅ Business logic (calculations, filters)
- ✅ Universal Components (Button, Modal)

**Что нужно адаптировать**:
- ❌ Framer Motion → Reanimated
- ❌ HTML/CSS → React Native components
- ❌ Radix UI → Universal Components

**Пример адаптации**:
```typescript
// PWA (src/features/mobile/home/components/AchievementHomeScreen.tsx)
<div className="min-h-screen bg-background pb-20">
  <AchievementHeader ... />
  <MotivationCardsSection ... />
  <ChatInputSection ... />
  <RecentEntriesFeed ... />
</div>

// React Native (app/(tabs)/index.tsx)
<ScrollView style={styles.container}>
  <AchievementHeader ... />
  <MotivationCardsSection ... />
  <ChatInputSection ... />
  <RecentEntriesFeed ... />
</ScrollView>
```

### День 3: History Screen (История)

**Задача**: Портирование `app/(tabs)/diary.tsx`

**Источник**: `src/features/mobile/history/components/HistoryScreen.tsx`

**Компоненты для адаптации**:
1. `SearchBar` - поиск по записям
2. `FiltersPanel` - фильтры (категория, настроение)
3. `EntryCard` - карточка записи
4. `EntryActionsModal` - действия с записью
5. `EditEntryModal` - редактирование записи

**Особенности**:
- Использовать `FlatList` вместо `map()` для производительности
- Анимации удаления/редактирования через Reanimated
- Оптимизация рендеринга больших списков

### День 4: Achievements Screen (Достижения)

**Задача**: Портирование `app/(tabs)/achievements.tsx`

**Источник**: `src/features/mobile/achievements/components/AchievementsScreen.tsx`

**Компоненты для адаптации**:
1. `AchievementCard` - карточка достижения
2. `MilestoneCard` - карточка вехи
3. Progress bars - прогресс-бары
4. Icons - иконки достижений (lucide-react-native)

**Особенности**:
- Анимации разблокировки достижений
- Прогресс-бары с анимацией
- Иконки из lucide-react-native

### День 5: Reports + Settings Screens

**Задача**: Портирование `app/(tabs)/reports.tsx` + `settings.tsx`

**Источники**:
- `src/features/mobile/reports/components/ReportsScreen.tsx`
- `src/features/mobile/settings/components/SettingsScreen.tsx`

**Особенности**:
- Простые экраны с формами
- Использовать Universal Components (Switch, Select)
- Минимальная адаптация

### День 6-7: Тестирование и полировка

**Задачи**:
1. Тестирование на реальных устройствах (iOS + Android)
2. Исправление багов
3. Оптимизация производительности
4. Финальная полировка UI/UX
5. Проверка через React Native DevTools

---

## 💡 Стратегия адаптации

### 1. Переиспользование кода (70-80%)

**Что копируется 1:1**:
- ✅ API calls и business logic
- ✅ State management (useState, useEffect, useCallback)
- ✅ Data transformations
- ✅ Calculations и filters
- ✅ Type definitions

**Что требует адаптации**:
- ❌ HTML/CSS → React Native components
- ❌ Framer Motion → Reanimated
- ❌ Radix UI → Universal Components
- ❌ CSS classes → StyleSheet

### 2. Создание библиотеки компонентов

**Структура**:
```
app-shared/components/screens/
├── home/
│   ├── AchievementHeader.native.tsx
│   ├── ChatInputSection.native.tsx
│   ├── RecentEntriesFeed.native.tsx
│   └── MotivationCardsSection.native.tsx
├── history/
│   ├── SearchBar.native.tsx
│   ├── FiltersPanel.native.tsx
│   ├── EntryCard.native.tsx
│   ├── EntryActionsModal.native.tsx
│   └── EditEntryModal.native.tsx
├── achievements/
│   ├── AchievementCard.native.tsx
│   ├── MilestoneCard.native.tsx
│   └── ProgressBar.native.tsx
└── shared/
    ├── LoadingScreen.native.tsx
    ├── EmptyState.native.tsx
    └── ErrorBoundary.native.tsx
```

### 3. Анимации (Framer Motion → Reanimated)

**Screen transitions**:
```typescript
// PWA (Framer Motion)
<AnimatedView
  initial={{ x: 300, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: -300, opacity: 0 }}
/>

// React Native (Reanimated)
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: withSpring(translateX.value) }],
  opacity: withTiming(opacity.value)
}));
```

**Card swipe**:
```typescript
// PWA (Framer Motion)
<motion.div drag="x" onDragEnd={handleSwipe} />

// React Native (Reanimated + Gesture Handler)
const gesture = Gesture.Pan()
  .onUpdate((e) => { translateX.value = e.translationX })
  .onEnd(() => { runOnJS(handleSwipe)() });
```

---

## 🚀 Следующие шаги

### Немедленные действия

1. **Запустить Expo dev server**:
   ```bash
   npm run start:expo
   ```

2. **Подключить React Native DevTools**:
   - Открыть http://localhost:8081
   - Проверить консоль на ошибки
   - Изучить структуру компонентов

3. **Начать с Home Screen**:
   - Создать `app-shared/components/screens/home/`
   - Адаптировать `AchievementHeader.native.tsx`
   - Адаптировать `ChatInputSection.native.tsx`
   - Адаптировать `RecentEntriesFeed.native.tsx`

4. **Тестировать на каждом этапе**:
   - После каждого компонента - проверка в DevTools
   - После каждого экрана - тестирование на устройстве
   - Проверять производительность и анимации

---

## 📝 Чеклист миграции

### Инфраструктура
- [x] Platform Adapters созданы
- [x] Universal Components созданы
- [x] Expo Router настроен
- [x] Navigation работает
- [ ] React Native DevTools подключены

### Экраны
- [ ] Home Screen (index.tsx)
- [ ] History Screen (diary.tsx)
- [ ] Achievements Screen (achievements.tsx)
- [ ] Reports Screen (reports.tsx)
- [ ] Settings Screen (settings.tsx)

### Компоненты
- [ ] AchievementHeader.native.tsx
- [ ] ChatInputSection.native.tsx
- [ ] RecentEntriesFeed.native.tsx
- [ ] MotivationCardsSection.native.tsx
- [ ] SearchBar.native.tsx
- [ ] FiltersPanel.native.tsx
- [ ] EntryCard.native.tsx
- [ ] AchievementCard.native.tsx
- [ ] MilestoneCard.native.tsx

### Анимации
- [ ] Screen transitions (Reanimated)
- [ ] Card swipe animations
- [ ] Modal animations
- [ ] List animations
- [ ] Progress bar animations

### Тестирование
- [ ] iOS тестирование
- [ ] Android тестирование
- [ ] Производительность
- [ ] Анимации плавные
- [ ] Навигация работает
- [ ] API calls работают
- [ ] Offline mode работает

---

## 🎯 Критерии успеха

1. **Все экраны работают** на iOS и Android
2. **Анимации плавные** (60 FPS)
3. **Навигация быстрая** (<100ms переходы)
4. **API calls работают** (offline + online)
5. **UI/UX идентичен PWA** (iOS Design System)
6. **Нет ошибок в консоли** DevTools
7. **Производительность оптимальна** (FlatList, memo, useMemo)

---

## 📚 Ресурсы

- [React Native DevTools](https://reactnative.dev/docs/debugging)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [iOS Design System](https://developer.apple.com/design/human-interface-guidelines/)

