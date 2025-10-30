# /shared/ - Truly Shared Code

**Цель**: Переиспользование кода между PWA (`src/`) и React Native (`/app/`)

## 📁 Структура

```
/shared/
├── types/           # TypeScript types
│   ├── user.ts      # User, Profile types
│   ├── entry.ts     # Entry, MediaFile, Category types
│   └── index.ts     # Barrel export
├── constants/       # App constants
│   ├── app.ts       # APP_NAME, SUPPORTED_LANGUAGES, etc.
│   └── index.ts     # Barrel export
├── utils/           # Pure utility functions
│   ├── date.ts      # formatDate, getRelativeTime, etc.
│   ├── text.ts      # truncate, capitalize, extractHashtags, etc.
│   └── index.ts     # Barrel export
├── api/             # API clients (Supabase, OpenAI)
│   └── (TODO)
└── business/        # Business logic
    └── (TODO)
```

## ✅ Правила

1. **NO platform-specific imports**
   - ❌ НЕ импортировать `react-native`
   - ❌ НЕ импортировать `react-dom`
   - ❌ НЕ импортировать `@radix-ui/*`
   - ✅ ТОЛЬКО pure TypeScript/JavaScript

2. **Pure functions only**
   - ✅ Функции без side effects
   - ✅ Детерминированные функции
   - ✅ Легко тестируемые

3. **Tree-shakeable exports**
   - ✅ Named exports (`export function ...`)
   - ❌ Default exports (`export default ...`)

## 📦 Использование

### В PWA (src/)

```typescript
import { User, Entry } from '@/shared/types';
import { formatDate, truncate } from '@/shared/utils';
import { APP_NAME, SUPPORTED_LANGUAGES } from '@/shared/constants';
```

### В React Native (/app/)

```typescript
import { User, Entry } from '@/shared/types';
import { formatDate, truncate } from '@/shared/utils';
import { APP_NAME, SUPPORTED_LANGUAGES } from '@/shared/constants';
```

## 🚀 Добавление нового кода

1. Создать файл в соответствующей директории
2. Экспортировать через `index.ts`
3. Убедиться что НЕТ platform-specific imports
4. Написать unit тесты (TODO)

## 📚 Примеры

### Types

```typescript
// shared/types/user.ts
export interface User {
  id: string;
  email: string;
  role: 'user' | 'super_admin';
}
```

### Utils

```typescript
// shared/utils/date.ts
export function formatDate(date: Date): string {
  // Pure function - NO platform-specific code
  return date.toISOString().split('T')[0];
}
```

### Constants

```typescript
// shared/constants/app.ts
export const APP_NAME = 'UNITY';
export const APP_VERSION = '2.0.0';
```

## ⚠️ Что НЕ должно быть здесь

- ❌ React components
- ❌ React hooks
- ❌ Platform adapters
- ❌ UI logic
- ❌ Navigation logic
- ❌ Storage logic (use API clients instead)

## 🔗 См. также

- `src/shared/` - PWA-specific shared code (Radix UI components, web hooks)
- `/app/shared/` - RN-specific shared code (RN components, native hooks)
- `docs/architecture/ARCHITECTURE_PWA_RN.md` - Полная архитектура

