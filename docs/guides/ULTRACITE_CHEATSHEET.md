# Ultracite Cheatsheet для UNITY-v2

**Быстрая справка** для ежедневной работы

---

## 🚀 Основные команды

```bash
# Проверка (без исправлений)
npm run lint

# Автоисправление
npm run lint:fix

# Unsafe исправления (осторожно!)
npm run lint:unsafe

# Проверка конкретного файла
npx biome check src/path/to/file.tsx

# Исправление конкретного файла
npx biome check --write src/path/to/file.tsx

# TypeScript проверка
npm run type-check

# Build проверка
npm run build

# Все проверки перед коммитом
npm run pre-commit
```

---

## 📋 Workflow

### **Утро** (начало работы):
```bash
npm run lint          # Проверить текущее состояние
npm run lint:fix      # Исправить автоматически
npm run build         # Проверить что build работает
```

### **Во время разработки** (каждые 30 мин):
```bash
# После редактирования файла:
npx biome check --write src/features/mobile/home/ChatInputSection.tsx
```

### **Перед коммитом** (автоматически):
```bash
# Pre-commit hook запустит автоматически:
# 1. npm run lint:fix
# 2. npm run type-check
# 3. npm run build

# Или вручную:
npm run pre-commit
```

---

## 🎯 Частые ошибки и решения

### **1. `noNamespaceImport`** (Performance)
```tsx
// ❌ НЕПРАВИЛЬНО
import * as React from 'react';

// ✅ ПРАВИЛЬНО
import { useState, useEffect } from 'react';
```

### **2. `useTemplate`** (Style)
```tsx
// ❌ НЕПРАВИЛЬНО
const message = 'Hello, ' + name + '!';

// ✅ ПРАВИЛЬНО
const message = `Hello, ${name}!`;
```

### **3. `noMagicNumbers`** (Style)
```tsx
// ❌ НЕПРАВИЛЬНО
setTimeout(() => {}, 100);

// ✅ ПРАВИЛЬНО
const DEBOUNCE_DELAY = 100;
setTimeout(() => {}, DEBOUNCE_DELAY);
```

### **4. `useKeyWithClickEvents`** (Accessibility)
```tsx
// ❌ НЕПРАВИЛЬНО
<button onClick={handleClick}>Click me</button>

// ✅ ПРАВИЛЬНО
<button onClick={handleClick} onKeyDown={handleKeyDown}>
  Click me
</button>
```

### **5. `noRedundantAlt`** (Accessibility)
```tsx
// ❌ НЕПРАВИЛЬНО
<img src="photo.jpg" alt="image of a cat" />

// ✅ ПРАВИЛЬНО
<img src="photo.jpg" alt="cat sitting on a windowsill" />
```

### **6. `noExcessiveCognitiveComplexity`** (Complexity)
```tsx
// ❌ НЕПРАВИЛЬНО - слишком сложная функция
function processData(data) {
  if (data) {
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        if (data[i].active) {
          // ... еще 10 уровней вложенности
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

### **7. `noUnusedVariables`** (Correctness)
```tsx
// ❌ НЕПРАВИЛЬНО
const [isProcessing, setIsProcessing] = useState(false);
// isProcessing не используется

// ✅ ПРАВИЛЬНО (если не используется)
const [_isProcessing, _setIsProcessing] = useState(false);

// ✅ ПРАВИЛЬНО (если используется)
const [isProcessing, setIsProcessing] = useState(false);
if (isProcessing) { /* ... */ }
```

### **8. `useAwait`** (Suspicious)
```tsx
// ❌ НЕПРАВИЛЬНО
const handleDemoLogin = async () => {
  setEmail('test@example.com');
  setPassword('demo123');
};

// ✅ ПРАВИЛЬНО (убрать async)
const handleDemoLogin = () => {
  setEmail('test@example.com');
  setPassword('demo123');
};

// ✅ ПРАВИЛЬНО (добавить await)
const handleDemoLogin = async () => {
  await fetchUserData();
  setEmail('test@example.com');
};
```

---

## 🔧 MCP Tools

### **getRules_ultracite()**
```typescript
// Получить список всех правил Ultracite
getRules_ultracite()

// Использовать когда:
// - Не понимаешь ошибку
// - Хочешь изучить best practices
// - Нужна документация по правилу
```

---

## 📊 Мониторинг

### **Проверить количество ошибок**:
```bash
npm run lint 2>&1 | grep "Found"

# Вывод:
# Found 17334 errors.
# Found 1031 warnings.
```

### **Найти ошибки по категории**:
```bash
# Security
npm run lint 2>&1 | grep "security"

# Accessibility
npm run lint 2>&1 | grep "a11y"

# Performance
npm run lint 2>&1 | grep "performance"

# Complexity
npm run lint 2>&1 | grep "complexity"

# Style
npm run lint 2>&1 | grep "style"
```

---

## 🎯 Приоритеты

### **КРИТИЧНО** (исправлять НЕМЕДЛЕННО):
1. Security errors (`noDangerouslySetInnerHtml`, `noEval`)
2. Accessibility errors (`useKeyWithClickEvents`, `noRedundantAlt`)
3. Performance errors (`noNamespaceImport`, `noAccumulatingSpread`)

### **ВАЖНО** (исправлять в течение недели):
4. Complexity warnings (`noExcessiveCognitiveComplexity`)
5. Suspicious errors (`noUnusedVariables`, `useAwait`)

### **МОЖНО ОТЛОЖИТЬ** (исправлять постепенно):
6. Style warnings (`useTemplate`, `noMagicNumbers`)

---

## 🚨 Важные правила

### **ВСЕГДА**:
- ✅ Запускать `npm run lint:fix` после редактирования
- ✅ Проверять TypeScript (`npm run type-check`)
- ✅ Проверять build (`npm run build`)

### **НИКОГДА**:
- ❌ Коммитить код с lint ошибками
- ❌ Использовать `git commit --no-verify` без причины
- ❌ Игнорировать TypeScript ошибки

---

## 📚 Ресурсы

- [Ultracite Rules](.augment/rules/ultracite.md) - детальное описание правил
- [Code Quality Guide](docs/guides/CODE_QUALITY_GUIDE.md) - полное руководство
- [UNITY-v2 Rules](.augment/rules/unity.md) - правила проекта
- [Biome Documentation](https://biomejs.dev/) - официальная документация

---

## 💡 Советы

1. **Используй MCP**: `getRules_ultracite()` для изучения правил
2. **Исправляй постепенно**: по 100 ошибок в день
3. **Проверяй build**: после каждого исправления
4. **Коммить часто**: маленькие коммиты лучше больших
5. **Читай ошибки**: Biome дает хорошие объяснения

---

## 🎓 Обучение

### **Для новых разработчиков**:
1. Прочитать этот cheatsheet
2. Запустить `getRules_ultracite()` и изучить правила
3. Исправить 10 lint ошибок вручную (для понимания)
4. Использовать `npm run lint:fix` для остальных

### **Для AI ассистентов**:
1. ВСЕГДА проверять lint перед редактированием
2. ВСЕГДА исправлять FIXABLE ошибки автоматически
3. НИКОГДА не создавать код с lint ошибками
4. Использовать `getRules_ultracite()` при неясности

