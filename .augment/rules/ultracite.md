---
type: "always_apply"
---

# Ultracite Linting Rules for UNITY-v2

**Версия**: 1.0
**Дата**: 2025-10-30
**Применение**: Автоматически во всех разговорах Augment Chat и Agent

---

## 🎯 Основные принципы

### 1. **ВСЕГДА запускать lint перед редактированием**
```bash
# Перед любым изменением кода:
npm run lint

# Если есть ошибки в файле который редактируешь:
npx biome check src/path/to/file.tsx
```

### 2. **ВСЕГДА исправлять FIXABLE ошибки автоматически**
```bash
# После редактирования:
npm run lint:fix

# Или для конкретного файла:
npx biome check --write src/path/to/file.tsx
```

### 3. **НИКОГДА не создавать код с lint ошибками**
- Если lint показывает ошибку → исправить НЕМЕДЛЕННО
- Если не знаешь как исправить → использовать `getRules_ultracite()` MCP
- Если правило неправильное → обсудить с пользователем

---

## 📋 Категории правил

### **Accessibility (a11y)** - КРИТИЧНО для PWA
- `noAccessKey` - не использовать accessKey (плохая практика)
- `noAriaHiddenOnFocusable` - aria-hidden на focusable элементах
- `noAutofocus` - избегать autofocus (плохой UX)
- `noPositiveTabindex` - не использовать положительный tabindex
- `noRedundantAlt` - избегать "image" в alt тексте
- `useKeyWithClickEvents` - добавлять keyboard handlers к onClick
- `useValidAriaProps` - использовать только валидные ARIA атрибуты

**Примеры**:
```tsx
// ❌ НЕПРАВИЛЬНО
<button onClick={handleClick}>Click me</button>

// ✅ ПРАВИЛЬНО
<button onClick={handleClick} onKeyDown={handleKeyDown}>
  Click me
</button>

// ❌ НЕПРАВИЛЬНО
<img src="photo.jpg" alt="image of a cat" />

// ✅ ПРАВИЛЬНО
<img src="photo.jpg" alt="cat sitting on a windowsill" />
```

### **Performance** - КРИТИЧНО для 100K users
- `noAccumulatingSpread` - избегать spread в циклах
- `noDelete` - не использовать delete operator
- `noNamespaceImport` - избегать namespace imports (import * as)

**Примеры**:
```tsx
// ❌ НЕПРАВИЛЬНО
import * as React from 'react';

// ✅ ПРАВИЛЬНО
import { useState, useEffect } from 'react';

// ❌ НЕПРАВИЛЬНО
let obj = { a: 1 };
delete obj.a;

// ✅ ПРАВИЛЬНО
let obj = { a: 1 };
const { a, ...rest } = obj; // rest не содержит 'a'
```

### **Complexity** - AI-friendly code
- `noExcessiveCognitiveComplexity` - максимум 15 (настроено в biome.jsonc)

**Примеры**:
```tsx
// ❌ НЕПРАВИЛЬНО - слишком сложная функция
function processData(data) {
  if (data) {
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].active) {
          if (data[i].type === 'user') {
            // ... еще 10 уровней вложенности
          }
        }
      }
    }
  }
}

// ✅ ПРАВИЛЬНО - разбить на маленькие функции
function isActiveUser(item) {
  return item.active && item.type === 'user';
}

function processData(data) {
  if (!data?.length) return;
  
  const activeUsers = data.filter(isActiveUser);
  activeUsers.forEach(processUser);
}
```

### **Security** - КРИТИЧНО
- `noDangerouslySetInnerHtml` - не использовать dangerouslySetInnerHTML
- `noConsole` - OFF (разрешено для debugging)

### **Style** - Читаемость кода
- `useTemplate` - использовать template literals вместо конкатенации
- `noNestedTernary` - избегать вложенных тернарных операторов
- `noMagicNumbers` - извлекать magic numbers в константы

**Примеры**:
```tsx
// ❌ НЕПРАВИЛЬНО
const message = 'Hello, ' + name + '!';

// ✅ ПРАВИЛЬНО
const message = `Hello, ${name}!`;

// ❌ НЕПРАВИЛЬНО
const status = isActive ? isVerified ? 'active-verified' : 'active-unverified' : 'inactive';

// ✅ ПРАВИЛЬНО
function getStatus(isActive, isVerified) {
  if (!isActive) return 'inactive';
  return isVerified ? 'active-verified' : 'active-unverified';
}

// ❌ НЕПРАВИЛЬНО
setTimeout(() => {}, 100);

// ✅ ПРАВИЛЬНО
const DEBOUNCE_DELAY = 100;
setTimeout(() => {}, DEBOUNCE_DELAY);
```

### **Suspicious** - Потенциальные баги
- `noExplicitAny` - WARN (разрешено для React Native файлов)
- `useAwait` - async функции должны содержать await
- `noEmptyBlockStatements` - не оставлять пустые блоки

---

## 🔧 Конфигурация для UNITY-v2

### **Overrides** (исключения из правил):

#### 1. **React Native файлы** (`*.native.ts`, `*.native.tsx`, `app/**/*.tsx`):
```jsonc
{
  "overrides": [
    {
      "includes": ["**/*.native.ts", "**/*.native.tsx", "app/**/*.tsx"],
      "linter": {
        "rules": {
          "suspicious": { "noExplicitAny": "off" }
        }
      }
    }
  ]
}
```
- Разрешено использовать `any` (React Native типы часто неполные)

#### 2. **Test файлы** (`*.test.ts`, `*.spec.tsx`):
```jsonc
{
  "overrides": [
    {
      "includes": ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
      "linter": {
        "rules": {
          "complexity": { "noExcessiveCognitiveComplexity": "off" }
        }
      }
    }
  ]
}
```
- Разрешена высокая сложность (тесты могут быть сложными)

#### 3. **Config файлы** (`*.config.js`, `*.config.ts`):
```jsonc
{
  "overrides": [
    {
      "includes": ["*.config.js", "*.config.ts", "*.config.mjs"],
      "linter": {
        "rules": {
          "style": { "noDefaultExport": "off" }
        }
      }
    }
  ]
}
```
- Разрешены default exports (требуется для конфигов)

---

## 🚀 Workflow для AI

### **Перед созданием нового файла**:
1. Проверить существующие файлы на lint ошибки
2. Использовать `getRules_ultracite()` для изучения правил
3. Создать файл согласно правилам

### **После редактирования файла**:
1. Запустить `npx biome check --write <file>`
2. Проверить что нет новых ошибок
3. Если есть ошибки - исправить НЕМЕДЛЕННО

### **Перед коммитом**:
1. Запустить `npm run lint:fix`
2. Запустить `npm run type-check`
3. Запустить `npm run build`
4. Проверить консоль браузера (Chrome MCP)

---

## 📊 Мониторинг качества кода

### **Еженедельно** (каждый понедельник):
```bash
# 1. Проверить общее количество ошибок
npm run lint 2>&1 | grep "Found"

# 2. Цель: уменьшать на 1000 ошибок в неделю
# Текущее состояние: 17,334 errors
# Цель через неделю: 16,334 errors
# Цель через месяц: 13,334 errors
```

### **Категории приоритетов**:
1. **КРИТИЧНО** (исправлять НЕМЕДЛЕННО):
   - Security errors
   - Accessibility errors
   - Performance errors

2. **ВАЖНО** (исправлять в течение недели):
   - Complexity warnings
   - Suspicious errors
   - noUnusedVariables

3. **МОЖНО ОТЛОЖИТЬ** (исправлять постепенно):
   - Style warnings
   - useTemplate
   - noMagicNumbers

---

## 🎓 Обучение команды

### **Для новых разработчиков**:
1. Прочитать этот файл
2. Запустить `getRules_ultracite()` и изучить правила
3. Исправить 10 lint ошибок вручную (для понимания)
4. Использовать `npm run lint:fix` для остальных

### **Для AI ассистентов**:
1. ВСЕГДА проверять lint перед редактированием
2. ВСЕГДА исправлять FIXABLE ошибки автоматически
3. НИКОГДА не создавать код с lint ошибками
4. Использовать `getRules_ultracite()` при неясности

---

## 📝 Примечания

- Эти правила применяются автоматически во всех разговорах
- При конфликте правил - спросить пользователя
- При неясности - использовать `getRules_ultracite()` MCP
- Всегда приоритет: безопасность > производительность > читаемость

