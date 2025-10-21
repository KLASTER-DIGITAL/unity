# 📱 React Native подготовка - Детальный план

**Дата**: 2025-01-18 | **Приоритет**: Критический | **Время**: 4 недели  
**Статус**: Готов к выполнению | **MCP**: Supabase, Chrome DevTools

> **Важно**: Основано на анализе реальной кодовой базы UNITY-v2

---

## 🎯 Цель

Подготовить кодовую базу к React Native миграции через создание platform-agnostic архитектуры, минимизируя время миграции с 7-10 дней до 3-5 дней.

---

## 📊 Анализ текущего состояния

### ✅ Что уже готово
- **Supabase клиент**: `@supabase/supabase-js@2.49.8` - работает с React Native
- **TypeScript**: Полная типизация - переносится без изменений
- **Бизнес-логика**: API функции в `src/shared/lib/api/` - универсальные
- **Edge Functions**: 10 микросервисов - работают с любым клиентом

### ❌ Проблемные зоны (требуют адаптации)

#### 1. **Веб-специфичные API**
```typescript
// src/utils/pwaUtils.ts - 150 строк веб-кода
window.matchMedia('(display-mode: standalone)')
localStorage.getItem('pwa-enabled')
document.referrer.startsWith('android-app://')

// src/shared/lib/i18n/cache.ts - localStorage
localStorage.setItem('translations_cache', JSON.stringify(cache))
```

#### 2. **DOM манипуляции**
```typescript
// src/components/hooks/useMediaUploader.ts
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*,video/*';

// src/components/ChatInputSection.tsx
document.body.style.overflow = 'hidden';
```

#### 3. **Radix UI компоненты** (49 компонентов)
```typescript
// Не работают в React Native:
@radix-ui/react-select
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
// ... и 46 других
```

---

## 🗓️ План выполнения (4 недели)

### **Неделя 1: Platform Detection & Storage**

#### Задача 1.1: Platform Detection System
**Файл**: `src/shared/lib/platform/detection.ts`
```typescript
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

#### Задача 1.2: Storage Adapter
**Файл**: `src/shared/lib/platform/storage.ts`
```typescript
interface StorageAdapter {
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
  // ... остальные методы
}

export const storage: StorageAdapter = Platform.select({
  web: new WebStorageAdapter(),
  native: new NativeStorageAdapter(), // Заглушка для React Native
  default: new WebStorageAdapter()
});
```

#### Задача 1.3: Обновить кэш переводов
**Файлы для изменения**:
- `src/shared/lib/i18n/cache.ts` - заменить localStorage на storage adapter
- `src/utils/i18n/cache.ts` - заменить localStorage на storage adapter

### **Неделя 2: Media & Navigation Adapters**

#### Задача 2.1: Media Picker Adapter
**Файл**: `src/shared/lib/platform/media.ts`
```typescript
interface MediaPickerAdapter {
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
      // ... реализация
    });
  }
}

export const mediaPicker: MediaPickerAdapter = Platform.select({
  web: new WebMediaPickerAdapter(),
  native: new NativeMediaPickerAdapter(), // Заглушка
  default: new WebMediaPickerAdapter()
});
```

#### Задача 2.2: Обновить компоненты
**Файлы для изменения**:
- `src/components/hooks/useMediaUploader.ts` - использовать mediaPicker
- `src/features/mobile/media/hooks/useMediaUploader.ts` - использовать mediaPicker

### **Неделя 3: Universal UI Components**

#### Задача 3.1: Universal Button
**Файл**: `src/shared/components/ui/universal/Button.tsx`
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const WebButton = ({ children, ...props }: ButtonProps) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props}>
    {children}
  </button>
);

const NativeButton = ({ children, ...props }: ButtonProps) => (
  // React Native реализация
  <Pressable {...props}>{children}</Pressable>
);

export const Button = Platform.select({
  web: WebButton,
  native: NativeButton,
  default: WebButton
});
```

#### Задача 3.2: Universal Select & Switch
**Файлы для создания**:
- `src/shared/components/ui/universal/Select.tsx`
- `src/shared/components/ui/universal/Switch.tsx`
- `src/shared/components/ui/universal/RadioGroup.tsx`

### **Неделя 4: Theme Tokens & Testing**

#### Задача 4.1: Design Tokens System
**Файл**: `src/shared/lib/theme/tokens.ts`
```typescript
export const themeTokens = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#FFFFFF',
    surface: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
  },
};
```

#### Задача 4.2: Тестирование с Chrome MCP
**Сценарии тестирования**:
1. **PWA функциональность** - проверить, что все работает
2. **Platform adapters** - протестировать storage, media
3. **Universal components** - проверить рендеринг
4. **Performance** - измерить влияние на скорость

---

## 🧪 Тестирование

### Использовать Chrome DevTools MCP
```bash
# Запустить dev сервер
npm run dev

# Тестировать через Chrome MCP:
# 1. Открыть http://localhost:3000
# 2. Проверить console на ошибки
# 3. Тестировать storage adapters
# 4. Проверить media picker
# 5. Тестировать universal components
```

### Чек-лист тестирования
- [ ] Storage adapter работает (localStorage → adapter)
- [ ] Media picker работает (DOM → adapter)
- [ ] Universal Button рендерится
- [ ] Platform detection корректный
- [ ] Нет TypeScript ошибок
- [ ] PWA функциональность сохранена
- [ ] Performance не ухудшился

---

## 📋 Результат

После выполнения всех задач:
- ✅ **95% кода готово к React Native** - только UI компоненты нужно портировать
- ✅ **Нет веб-зависимостей** - все через platform adapters
- ✅ **Universal components** - готовы к замене на React Native
- ✅ **Design tokens** - единая система стилей
- ✅ **Время миграции**: 7-10 дней → 3-5 дней (-50%)

---

## 🔗 Связанные документы

- **[REACT_NATIVE_MIGRATION_PLAN.md](../../mobile/REACT_NATIVE_MIGRATION_PLAN.md)** - Полный план миграции
- **[UNITY_MASTER_PLAN_2025.md](../../architecture/UNITY_MASTER_PLAN_2025.md)** - Общая стратегия
