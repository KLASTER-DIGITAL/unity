# 🏗️ Архитектура UNITY-v2: PWA + React Native Expo

**Дата**: 2025-10-29  
**Версия**: 1.0  
**Статус**: ✅ PRODUCTION READY

---

## 🎯 Философия

### Принцип: "Write Once, Run Everywhere (Smart Way)"

**НЕ**: Один код для всех платформ (компромиссы в производительности)  
**ДА**: Shared logic + Platform-optimized UI (максимальная производительность)

```
┌─────────────────────────────────────────────────────────────┐
│                    UNITY-v2 Architecture                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │   PWA (Web)      │              │  React Native    │    │
│  │   src/           │              │  /app/           │    │
│  │                  │              │                  │    │
│  │  • Vite build    │              │  • Metro build   │    │
│  │  • Radix UI      │              │  • RN components │    │
│  │  • Framer Motion │              │  • Reanimated    │    │
│  │  • React Router  │              │  • Expo Router   │    │
│  └────────┬─────────┘              └────────┬─────────┘    │
│           │                                 │               │
│           └────────────┬────────────────────┘               │
│                        │                                    │
│                ┌───────▼────────┐                          │
│                │  Shared Code   │                          │
│                │  /shared/      │                          │
│                │                │                          │
│                │  • Types       │                          │
│                │  • Utils       │                          │
│                │  • Constants   │                          │
│                │  • API clients │                          │
│                │  • Business    │                          │
│                │    logic       │                          │
│                └────────────────┘                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Структура проекта

### Корневая структура

```
UNITY-v2/
├── /app/                    # React Native Expo Router (Metro bundler)
│   ├── (tabs)/              # Tab navigation screens
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Entry point
│   └── shared/              # RN-specific shared code
│       ├── components/      # RN components (.tsx)
│       └── lib/             # RN platform adapters (.ts)
│
├── src/                     # PWA (Vite bundler)
│   ├── app/                 # PWA app layer
│   │   ├── mobile/          # Mobile PWA (max-w-md)
│   │   └── admin/           # Admin panel (full-width)
│   ├── features/            # Feature modules
│   ├── shared/              # PWA shared code
│   │   ├── components/      # Web components (.tsx)
│   │   └── lib/             # Web platform adapters (.ts)
│   └── styles/              # Global styles
│
├── /shared/                 # TRULY shared code (PWA + RN)
│   ├── types/               # TypeScript types
│   ├── utils/               # Pure functions
│   ├── constants/           # Constants
│   ├── api/                 # API clients (Supabase)
│   └── business/            # Business logic
│
├── supabase/                # Backend (Edge Functions, migrations)
├── docs/                    # Documentation
├── vite.config.ts           # Vite config (PWA)
├── metro.config.js          # Metro config (RN)
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

---

## 🎨 Platform-Specific Code

### PWA (src/)

**Цель**: Максимальная производительность для веб

**Технологии**:
- ✅ Vite 6.3.5 (ultra-fast HMR)
- ✅ React 18.3.1 (будет 19.1.0)
- ✅ Radix UI (accessibility)
- ✅ Framer Motion (smooth animations)
- ✅ React Router (client-side routing)
- ✅ Tailwind CSS (utility-first)

**Структура**:
```
src/
├── shared/
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx           # Radix UI Button
│   │       ├── Modal.tsx            # Radix Dialog
│   │       ├── Select.tsx           # Radix Select
│   │       └── Switch.tsx           # Radix Switch
│   └── lib/
│       └── platform/
│           ├── storage.ts           # localStorage
│           ├── media.ts             # DOM FileReader
│           ├── navigation.ts        # React Router
│           └── animation.ts         # Framer Motion
```

**Оптимизации**:
- ✅ Code splitting (route-based)
- ✅ Tree shaking (unused code removal)
- ✅ Lazy loading (components, routes)
- ✅ CSS purging (Tailwind)
- ✅ Image optimization (Vite assets)
- ✅ Gzip compression (Vercel)

---

### React Native (/app/)

**Цель**: Нативная производительность для iOS/Android

**Технологии**:
- ✅ Expo SDK 54
- ✅ React Native 0.81.5
- ✅ Expo Router (file-based routing)
- ✅ React Native Reanimated (60fps animations)
- ✅ React Navigation (native navigation)
- ✅ NativeWind (Tailwind for RN)

**Структура**:
```
/app/
├── (tabs)/
│   ├── index.tsx                    # Home screen
│   ├── diary.tsx                    # Diary screen
│   ├── achievements.tsx             # Achievements screen
│   └── settings.tsx                 # Settings screen
├── shared/
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx           # RN TouchableOpacity
│   │       ├── Modal.tsx            # RN Modal
│   │       ├── Select.tsx           # RN Picker
│   │       └── Switch.tsx           # RN Switch
│   └── lib/
│       └── platform/
│           ├── storage.ts           # AsyncStorage
│           ├── media.ts             # Expo ImagePicker
│           ├── navigation.ts        # Expo Router
│           └── animation.ts         # Reanimated
```

**Оптимизации**:
- ✅ Hermes engine (faster JS execution)
- ✅ RAM bundles (faster startup)
- ✅ Image caching (Expo Image)
- ✅ Native modules (performance-critical code)
- ✅ FlatList virtualization (long lists)
- ✅ Reanimated worklets (UI thread animations)

---

## 🔗 Shared Code (/shared/)

**Цель**: Переиспользование бизнес-логики

**Что здесь**:
- ✅ TypeScript types (User, Entry, Profile)
- ✅ API clients (Supabase, OpenAI)
- ✅ Business logic (validation, calculations)
- ✅ Constants (API URLs, config)
- ✅ Pure utils (date formatting, text processing)

**Структура**:
```
/shared/
├── types/
│   ├── user.ts                      # User, Profile types
│   ├── entry.ts                     # Entry, MediaFile types
│   └── api.ts                       # API request/response types
├── api/
│   ├── supabase.ts                  # Supabase client
│   ├── openai.ts                    # OpenAI client
│   └── translations.ts              # i18n API
├── business/
│   ├── validation.ts                # Form validation
│   ├── calculations.ts              # Stats calculations
│   └── permissions.ts               # RBAC logic
├── utils/
│   ├── date.ts                      # Date formatting
│   ├── text.ts                      # Text processing
│   └── crypto.ts                    # Encryption
└── constants/
    ├── config.ts                    # App config
    └── api.ts                       # API endpoints
```

**Правила**:
- ❌ НЕТ platform-specific кода (DOM, React Native)
- ❌ НЕТ UI компонентов
- ❌ НЕТ импортов из src/ или /app/
- ✅ ТОЛЬКО pure TypeScript/JavaScript
- ✅ ТОЛЬКО Node.js-compatible код

---

## 🚀 Workflow разработки

### Создание новой фичи

**Шаг 1: Shared code** (если нужно)
```typescript
// /shared/types/achievement.ts
export interface Achievement {
  id: string;
  userId: string;
  type: 'streak' | 'milestone' | 'challenge';
  unlockedAt: string;
}

// /shared/api/achievements.ts
export async function getAchievements(userId: string): Promise<Achievement[]> {
  // Supabase query
}
```

**Шаг 2: PWA UI** (src/)
```typescript
// src/features/mobile/achievements/AchievementsScreen.tsx
import { getAchievements } from '@/shared/api/achievements';
import { Button } from '@/shared/components/ui/Button'; // Radix UI

export function AchievementsScreen() {
  // PWA-specific UI with Radix UI
}
```

**Шаг 3: React Native UI** (/app/)
```typescript
// /app/(tabs)/achievements.tsx
import { getAchievements } from '@/shared/api/achievements';
import { Button } from '@/app/shared/components/ui/Button'; // RN TouchableOpacity

export default function AchievementsScreen() {
  // RN-specific UI with native components
}
```

---

## ⚡ Performance Best Practices

### PWA (Vite)

1. **Code Splitting**
   ```typescript
   // Route-based splitting
   const AchievementsScreen = lazy(() => import('./AchievementsScreen'));
   ```

2. **Tree Shaking**
   ```typescript
   // ✅ Named imports (tree-shakeable)
   import { getAchievements } from '@/shared/api/achievements';
   
   // ❌ Default imports (NOT tree-shakeable)
   import achievements from '@/shared/api/achievements';
   ```

3. **Lazy Loading**
   ```typescript
   // Images
   <img loading="lazy" src={imageUrl} />
   
   // Components
   <Suspense fallback={<Loading />}>
     <HeavyComponent />
   </Suspense>
   ```

### React Native (Metro)

1. **RAM Bundles**
   ```javascript
   // metro.config.js
   module.exports = {
     transformer: {
       enableBabelRCLookup: false,
       enableBabelRuntime: false,
     },
   };
   ```

2. **FlatList Virtualization**
   ```typescript
   <FlatList
     data={items}
     renderItem={renderItem}
     windowSize={10}
     maxToRenderPerBatch={10}
     removeClippedSubviews={true}
   />
   ```

3. **Reanimated Worklets**
   ```typescript
   const animatedStyle = useAnimatedStyle(() => {
     'worklet'; // Runs on UI thread!
     return {
       transform: [{ translateX: offset.value }],
     };
   });
   ```

---

## 🔧 Build Configuration

### Vite (PWA)

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      // Exclude React Native from PWA build
      external: [
        /^react-native/,
        /^@react-native/,
        /^expo-/,
      ],
    },
  },
  optimizeDeps: {
    // Exclude React Native from pre-bundling
    exclude: ['react-native'],
  },
});
```

### Metro (React Native)

```javascript
// metro.config.js
const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = {
  ...getDefaultConfig(__dirname),
  resolver: {
    // Resolve .native.tsx before .tsx
    sourceExts: ['tsx', 'ts', 'jsx', 'js', 'json'],
  },
};
```

---

## 📊 Масштабирование до 100K пользователей

### PWA
- ✅ Vercel Edge Network (CDN)
- ✅ Gzip compression
- ✅ Image optimization
- ✅ Code splitting
- ✅ Service Worker (offline)

### React Native
- ✅ Hermes engine
- ✅ RAM bundles
- ✅ Native modules
- ✅ Image caching
- ✅ FlatList virtualization

### Backend (Supabase)
- ✅ Database indexes
- ✅ RLS policies
- ✅ Connection pooling
- ✅ Edge Functions
- ✅ CDN for media

---

## ✅ Checklist для новой фичи

- [ ] Создать shared types в `/shared/types/`
- [ ] Создать API client в `/shared/api/`
- [ ] Создать business logic в `/shared/business/`
- [ ] Создать PWA UI в `src/features/`
- [ ] Создать RN UI в `/app/`
- [ ] Проверить PWA build (`npm run build`)
- [ ] Проверить RN build (`npm run android`)
- [ ] Написать E2E тесты
- [ ] Обновить документацию

---

**Следующий шаг**: Переместить .native.tsx файлы в /app/shared/

