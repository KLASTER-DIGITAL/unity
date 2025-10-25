# 🚀 UNITY-v2 - План подготовки к React Native Expo миграции

**Дата обновления**: 2025-01-18
**Версия**: 2.0
**Статус**: Синхронизирован с мастер-планом
**Автор**: Команда UNITY

> **Важно**: Этот план реализует Фазу 1 из [UNITY_MASTER_PLAN_2025.md](./UNITY_MASTER_PLAN_2025.md)

## 📋 Обзор

Этот документ описывает стратегию подготовки кодовой базы UNITY-v2 для будущей миграции на React Native Expo. Цель - минимизировать время миграции с 7-10 дней до 3-5 дней и сократить количество ошибок на 70%.

## 🎯 Стратегия: Platform-Agnostic Development

### Принципы разработки:
1. **Separation of Concerns** - разделение веб-специфичного и универсального кода
2. **Platform Adapters** - абстракция платформенных API
3. **Universal Components** - компоненты, работающие на всех платформах
4. **Progressive Enhancement** - сначала универсальная функциональность, затем платформенные улучшения

## 🏗️ Архитектурные изменения

### 1. Новая структура папок

```
src/
├── shared/
│   ├── lib/
│   │   ├── platform/          # 🆕 Platform adapters
│   │   │   ├── index.ts        # Platform detection
│   │   │   ├── storage.ts      # Storage abstraction
│   │   │   ├── media.ts        # Media picker abstraction
│   │   │   ├── navigation.ts   # Navigation abstraction
│   │   │   └── notifications.ts # Push notifications
│   │   ├── theme/              # 🆕 Universal theming
│   │   │   ├── tokens.ts       # Design tokens
│   │   │   └── styles.ts       # Platform-specific styles
│   │   └── utils/
│   └── components/
│       ├── ui/
│       │   ├── universal/      # 🆕 Cross-platform components
│       │   │   ├── Button.tsx
│       │   │   ├── Select.tsx
│       │   │   ├── Switch.tsx
│       │   │   ├── AnimatedView.tsx
│       │   │   └── Modal.tsx
│       │   └── web/            # 🆕 Web-specific components
│       │       ├── PWAHead.tsx
│       │       └── InstallPrompt.tsx
│       └── platform/           # 🆕 Platform-specific wrappers
│           ├── web/
│           └── native/         # Для будущего
```

### 2. Platform Detection System

```typescript
// src/shared/lib/platform/index.ts
export const Platform = {
  OS: typeof window !== 'undefined' ? 'web' : 'native',
  isWeb: typeof window !== 'undefined',
  isNative: typeof window === 'undefined',
  
  select<T>(specifics: { web?: T; native?: T; default?: T }): T {
    if (this.isWeb && specifics.web !== undefined) return specifics.web;
    if (this.isNative && specifics.native !== undefined) return specifics.native;
    return specifics.default as T;
  }
};
```

## 🔧 Критические изменения

### 1. Storage Abstraction

**Проблема:** Прямое использование `localStorage`/`sessionStorage`
**Решение:** Универсальный storage adapter

```typescript
// src/shared/lib/platform/storage.ts
interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const storage: StorageAdapter = Platform.select({
  web: webStorageAdapter,
  native: nativeStorageAdapter,
  default: webStorageAdapter
});
```

**Файлы для обновления:**
- `src/shared/lib/i18n/cache.ts`
- `src/utils/i18n/cache.ts`
- `src/utils/supabase/client.ts`
- `src/shared/lib/api/pwaUtils.ts`

### 2. Media Picker Abstraction

**Проблема:** DOM манипуляции для выбора файлов
**Решение:** Platform-specific media pickers

```typescript
// src/shared/lib/platform/media.ts
interface MediaPickerAdapter {
  pickImages(): Promise<MediaFile[]>;
  pickVideos(): Promise<MediaFile[]>;
  takePhoto(): Promise<MediaFile>;
  recordVideo(): Promise<MediaFile>;
}

export const mediaPicker: MediaPickerAdapter = Platform.select({
  web: webMediaPickerAdapter,
  native: nativeMediaPickerAdapter,
  default: webMediaPickerAdapter
});
```

**Файлы для обновления:**
- `src/shared/hooks/useMediaUploader.ts`
- `src/features/mobile/media/hooks/useMediaUploader.ts`

### 3. UI Components Migration

**Проблема:** Radix UI не работает в React Native
**Решение:** Universal components с platform-specific implementations

#### Приоритетные компоненты для замены:

1. **Select** (`@radix-ui/react-select` → Universal Select)
2. **Switch** (`@radix-ui/react-switch` → Universal Switch)  
3. **RadioGroup** (`@radix-ui/react-radio-group` → Universal RadioGroup)
4. **Dialog/Modal** (`@radix-ui/react-dialog` → Universal Modal)
5. **Toast** (`sonner` → Universal Toast)

### 4. Animation System

**Проблема:** Framer Motion не работает в React Native
**Решение:** ✅ Universal Animation Adapter (IMPLEMENTED)

**Статус:**
- ✅ Web (PWA): Framer Motion - 100% готово
- 🔄 Native: React Native Reanimated - Placeholder (Q3 2025)

**Документация:** `docs/architecture/ANIMATION_SYSTEM.md`

**Структура:**
```
src/shared/lib/platform/animation/
├── index.ts                    # Public API + platform detection
├── types.ts                    # Shared types + presets
├── animation.web.ts            # Framer Motion (PWA) ✅
├── animation.native.ts         # Reanimated (RN) 🔄
└── hooks.ts                    # Animation hooks
```

**API:**
```typescript
import { AnimatedView, AnimatedPresence, AnimationPresets } from '@/shared/lib/platform/animation';

// Simple animation
<AnimatedView {...AnimationPresets.fadeIn}>
  <div>Content</div>
</AnimatedView>

// Screen transitions
<AnimatedPresence mode="wait">
  <AnimatedView {...ScreenTransitions.slideLeft(direction)}>
    <HomeScreen />
  </AnimatedView>
</AnimatedPresence>
```

**Migration Status:**
- 19 файлов используют Framer Motion
- Приоритет P0: MobileApp.tsx, HistoryScreen.tsx (критические переходы)
- Приоритет P1: UI компоненты (BottomSheet, modals, media)
- Приоритет P2: PWA компоненты
- Приоритет P3: shadcn-io декоративные компоненты

### 5. Theme System

**Проблема:** CSS переменные не работают в React Native
**Решение:** Design tokens + NativeWind

```typescript
// src/shared/lib/theme/tokens.ts
export const themeTokens = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32
  },
  borderRadius: {
    sm: 4, md: 8, lg: 12, xl: 16
  }
};
```

## 📅 План реализации (4 недели)

### Неделя 1: Platform Foundation
- [ ] Создать `src/shared/lib/platform/` структуру
- [ ] Реализовать Platform detection
- [ ] Создать Storage adapter
- [ ] Создать Media picker adapter
- [ ] Обновить Supabase client

### Неделя 2: UI Components Abstraction  
- [ ] Создать `src/shared/components/ui/universal/`
- [ ] Портировать Button, Select, Switch
- [ ] Заменить Radix UI компоненты
- [ ] Создать Universal Modal/Dialog

### Неделя 3: Animation & Theme
- [ ] Создать Universal AnimatedView
- [ ] Подготовить миграцию анимаций
- [ ] Создать theme tokens систему
- [ ] Подготовить NativeWind конфигурацию

### Неделя 4: Testing & Optimization
- [ ] Протестировать все изменения
- [ ] Оптимизировать производительность
- [ ] Обновить документацию
- [ ] Подготовить React Native Expo setup

## 🎯 Ожидаемые результаты

### До изменений:
- ❌ 150+ веб-специфичных API вызовов
- ❌ 20+ Radix UI компонентов
- ❌ Прямые DOM манипуляции
- ❌ CSS переменные в стилях
- ⏱️ Миграция: 7-10 дней

### После изменений:
- ✅ 95% platform-agnostic кода
- ✅ Universal UI components
- ✅ Абстрактные API адаптеры
- ✅ Design tokens система
- ⏱️ Миграция: 3-5 дней (-50% времени)

## 🚨 Критические точки внимания

### 1. Не ломать текущую функциональность
- Все изменения должны быть обратно совместимы
- PWA функциональность остается полностью рабочей
- Постепенная миграция без breaking changes

### 2. Тестирование на каждом этапе
- Unit тесты для platform adapters
- Integration тесты для UI components
- E2E тесты для критических флоу

### 3. Performance мониторинг
- Bundle size не должен увеличиться
- Время загрузки остается прежним
- Memory usage под контролем

## 📚 Дополнительные ресурсы

- [React Native Expo Documentation](https://docs.expo.dev/)
- [NativeWind Setup Guide](https://www.nativewind.dev/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)

## 🛠️ Детальные инструкции по реализации

### 1. Platform Detection Setup

```bash
# Создать структуру папок
mkdir -p src/shared/lib/platform
mkdir -p src/shared/components/ui/universal
mkdir -p src/shared/lib/theme
```

```typescript
// src/shared/lib/platform/index.ts
export interface PlatformAPI {
  OS: 'web' | 'native';
  isWeb: boolean;
  isNative: boolean;
  select<T>(specifics: { web?: T; native?: T; default?: T }): T;
}

export const Platform: PlatformAPI = {
  OS: typeof window !== 'undefined' ? 'web' : 'native',
  isWeb: typeof window !== 'undefined',
  isNative: typeof window === 'undefined',

  select<T>(specifics: { web?: T; native?: T; default?: T }): T {
    if (this.isWeb && specifics.web !== undefined) return specifics.web;
    if (this.isNative && specifics.native !== undefined) return specifics.native;
    return specifics.default as T;
  }
};
```

### 2. Storage Adapter Implementation

```typescript
// src/shared/lib/platform/storage.ts
export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

class WebStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage not available:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage setItem failed:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage removeItem failed:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('localStorage clear failed:', error);
    }
  }
}

// React Native implementation (для будущего)
class NativeStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    // const AsyncStorage = require('@react-native-async-storage/async-storage');
    // return await AsyncStorage.getItem(key);
    throw new Error('Native storage not implemented yet');
  }

  async setItem(key: string, value: string): Promise<void> {
    // const AsyncStorage = require('@react-native-async-storage/async-storage');
    // await AsyncStorage.setItem(key, value);
    throw new Error('Native storage not implemented yet');
  }

  async removeItem(key: string): Promise<void> {
    // const AsyncStorage = require('@react-native-async-storage/async-storage');
    // await AsyncStorage.removeItem(key);
    throw new Error('Native storage not implemented yet');
  }

  async clear(): Promise<void> {
    // const AsyncStorage = require('@react-native-async-storage/async-storage');
    // await AsyncStorage.clear();
    throw new Error('Native storage not implemented yet');
  }
}

export const storage: StorageAdapter = Platform.select({
  web: new WebStorageAdapter(),
  native: new NativeStorageAdapter(),
  default: new WebStorageAdapter()
});
```

### 3. Media Picker Adapter

```typescript
// src/shared/lib/platform/media.ts
export interface MediaFile {
  uri: string;
  type: 'image' | 'video';
  name?: string;
  size?: number;
}

export interface MediaPickerAdapter {
  pickImages(options?: { multiple?: boolean }): Promise<MediaFile[]>;
  pickVideos(options?: { multiple?: boolean }): Promise<MediaFile[]>;
  takePhoto(): Promise<MediaFile>;
  recordVideo(): Promise<MediaFile>;
}

class WebMediaPickerAdapter implements MediaPickerAdapter {
  async pickImages(options: { multiple?: boolean } = {}): Promise<MediaFile[]> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = options.multiple || false;

      input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        const mediaFiles: MediaFile[] = files.map(file => ({
          uri: URL.createObjectURL(file),
          type: 'image' as const,
          name: file.name,
          size: file.size
        }));
        resolve(mediaFiles);
      };

      input.onerror = () => reject(new Error('File selection cancelled'));
      input.click();
    });
  }

  async pickVideos(options: { multiple?: boolean } = {}): Promise<MediaFile[]> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.multiple = options.multiple || false;

      input.onchange = (e) => {
        const files = Array.from((e.target as HTMLInputElement).files || []);
        const mediaFiles: MediaFile[] = files.map(file => ({
          uri: URL.createObjectURL(file),
          type: 'video' as const,
          name: file.name,
          size: file.size
        }));
        resolve(mediaFiles);
      };

      input.onerror = () => reject(new Error('File selection cancelled'));
      input.click();
    });
  }

  async takePhoto(): Promise<MediaFile> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          resolve({
            uri: URL.createObjectURL(file),
            type: 'image',
            name: file.name,
            size: file.size
          });
        } else {
          reject(new Error('No photo taken'));
        }
      };

      input.onerror = () => reject(new Error('Camera access failed'));
      input.click();
    });
  }

  async recordVideo(): Promise<MediaFile> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.capture = 'environment';

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          resolve({
            uri: URL.createObjectURL(file),
            type: 'video',
            name: file.name,
            size: file.size
          });
        } else {
          reject(new Error('No video recorded'));
        }
      };

      input.onerror = () => reject(new Error('Camera access failed'));
      input.click();
    });
  }
}

// React Native implementation (для будущего)
class NativeMediaPickerAdapter implements MediaPickerAdapter {
  async pickImages(options: { multiple?: boolean } = {}): Promise<MediaFile[]> {
    // const ImagePicker = require('expo-image-picker');
    // const result = await ImagePicker.launchImageLibraryAsync({
    //   mediaTypes: ImagePicker.MediaTypeOptions.Images,
    //   allowsMultipleSelection: options.multiple,
    // });
    // return result.assets || [];
    throw new Error('Native media picker not implemented yet');
  }

  async pickVideos(options: { multiple?: boolean } = {}): Promise<MediaFile[]> {
    throw new Error('Native media picker not implemented yet');
  }

  async takePhoto(): Promise<MediaFile> {
    throw new Error('Native media picker not implemented yet');
  }

  async recordVideo(): Promise<MediaFile> {
    throw new Error('Native media picker not implemented yet');
  }
}

export const mediaPicker: MediaPickerAdapter = Platform.select({
  web: new WebMediaPickerAdapter(),
  native: new NativeMediaPickerAdapter(),
  default: new WebMediaPickerAdapter()
});
```

### 4. Universal Button Component

```typescript
// src/shared/components/ui/universal/Button.tsx
import React from 'react';
import { Platform } from '@/shared/lib/platform';
import { cn } from '@/shared/components/ui/utils';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Web implementation
const WebButton: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  size = 'default',
  className,
  disabled,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50";

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive: "bg-destructive text-white hover:bg-destructive/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline"
  };

  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  };

  return (
    <button
      type={type}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// React Native implementation (для будущего)
const NativeButton: React.FC<ButtonProps> = ({
  children,
  variant = 'default',
  disabled,
  onClick
}) => {
  // const { Pressable, Text } = require('react-native');
  // return (
  //   <Pressable
  //     onPress={onClick}
  //     disabled={disabled}
  //     style={[
  //       styles.button,
  //       styles[variant],
  //       disabled && styles.disabled
  //     ]}
  //   >
  //     <Text style={styles.text}>{children}</Text>
  //   </Pressable>
  // );
  throw new Error('Native Button not implemented yet');
};

export const Button = Platform.select({
  web: WebButton,
  native: NativeButton,
  default: WebButton
});
```

### 5. Theme Tokens System

```typescript
// src/shared/lib/theme/tokens.ts
export const themeTokens = {
  colors: {
    // Primary colors
    primary: '#007AFF',
    primaryForeground: '#FFFFFF',

    // Secondary colors
    secondary: '#5856D6',
    secondaryForeground: '#FFFFFF',

    // Background colors
    background: '#FFFFFF',
    foreground: '#000000',

    // Surface colors
    surface: '#F2F2F7',
    surfaceForeground: '#000000',

    // Accent colors
    accent: '#FF3B30',
    accentForeground: '#FFFFFF',

    // Destructive colors
    destructive: '#FF3B30',
    destructiveForeground: '#FFFFFF',

    // Border and input
    border: '#C7C7CC',
    input: '#F2F2F7',

    // Text colors
    text: '#000000',
    textSecondary: '#8E8E93',
    textMuted: '#C7C7CC',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },

  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
};

// Platform-specific style helpers
export const createStyles = Platform.select({
  web: (styles: any) => styles, // CSS-in-JS for web
  native: (styles: any) => {
    // const { StyleSheet } = require('react-native');
    // return StyleSheet.create(styles);
    return styles;
  },
  default: (styles: any) => styles
});
```

## 🔄 Migration Checklist

### Phase 1: Foundation (Week 1)
- [ ] ✅ Create platform detection system
- [ ] ✅ Implement storage adapter
- [ ] ✅ Implement media picker adapter
- [ ] ✅ Update Supabase client configuration
- [ ] ✅ Create theme tokens system

### Phase 2: UI Components (Week 2)
- [ ] ✅ Create universal Button component
- [ ] ✅ Create universal Select component
- [ ] ✅ Create universal Switch component
- [ ] ✅ Create universal Modal component
- [ ] ✅ Replace Radix UI dependencies

### Phase 3: Animation & Advanced (Week 3)
- [ ] ✅ Create universal AnimatedView
- [ ] ✅ Migrate critical animations
- [ ] ✅ Setup NativeWind configuration
- [ ] ✅ Create platform-specific style helpers

### Phase 4: Testing & Polish (Week 4)
- [ ] ✅ Write unit tests for adapters
- [ ] ✅ Test all universal components
- [ ] ✅ Performance optimization
- [ ] ✅ Documentation updates

---

**Статус:** 🟡 В разработке
**Последнее обновление:** 2025-01-18
**Ответственный:** Development Team
**Приоритет:** Высокий
