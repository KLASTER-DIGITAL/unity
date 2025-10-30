# План исправления Lint ошибок (17,312 errors)

**Дата создания**: 2025-10-30
**Текущее состояние**: 17,312 errors + 1,021 warnings
**Цель**: Уменьшить до 5,000 errors за 4 недели

---

## 🎯 Стратегия: Поэтапное исправление

**КРИТИЧЕСКОЕ ПРАВИЛО**: НЕ запускать `npm run lint:fix` на всем проекте (зависает)!

**Подход**:
1. Исправлять **по директориям** (не весь проект сразу)
2. Исправлять **по категориям** (сначала FIXABLE, потом ручные)
3. Коммитить **после каждого этапа** (маленькие коммиты)
4. Проверять **TypeScript + Build** после каждого этапа

---

## 📊 Анализ ошибок

### React Native файлы (app/):
- **Всего**: ~20 ошибок
- **FIXABLE**: ~12 ошибок (useExhaustiveDependencies, useConsistentTypeDefinitions)
- **Ручные**: ~8 ошибок (noMagicNumbers, noEmptyBlockStatements, useAwait)

### PWA файлы (src/):
- **Всего**: ~17,292 ошибок
- **FIXABLE**: ~300 ошибок
- **Ручные**: ~17,000 ошибок

### Категории ошибок:
1. **useExhaustiveDependencies** (FIXABLE) - missing dependencies в useEffect
2. **noUnusedVariables** (частично FIXABLE) - неиспользуемые переменные
3. **noEmptyBlockStatements** - пустые блоки
4. **useAwait** - async без await
5. **noMagicNumbers** - magic numbers
6. **noNestedTernary** - вложенные тернарные операторы

---

## 🗓️ План на 4 недели

### **Неделя 1: React Native + FIXABLE ошибки** (цель: 17,312 → 15,000)

#### **День 1** (сегодня):
- [x] Исправить React Native файлы (app/)
  ```bash
  npx biome check --write app/
  ```
- [ ] Проверить TypeScript: `npm run type-check`
- [ ] Проверить Build: `npm run build`
- [ ] Коммит: `fix: исправить lint ошибки в React Native файлах`

#### **День 2**:
- [ ] Исправить FIXABLE в `src/features/` (по одной директории)
  ```bash
  npx biome check --write src/features/mobile/
  npx biome check --write src/features/admin/
  ```
- [ ] Проверить TypeScript + Build
- [ ] Коммит: `fix: исправить FIXABLE lint ошибки в features/`

#### **День 3**:
- [ ] Исправить FIXABLE в `src/shared/`
  ```bash
  npx biome check --write src/shared/components/
  npx biome check --write src/shared/lib/
  ```
- [ ] Проверить TypeScript + Build
- [ ] Коммит: `fix: исправить FIXABLE lint ошибки в shared/`

#### **День 4-5**:
- [ ] Исправить `noUnusedVariables` в `src/features/mobile/`
  - Найти: `npm run lint 2>&1 | grep "src/features/mobile" | grep "noUnusedVariables"`
  - Исправить вручную (удалить или переименовать с `_`)
- [ ] Коммит: `fix: удалить неиспользуемые переменные в features/mobile/`

#### **День 6-7**:
- [ ] Исправить `noEmptyBlockStatements`
  - Найти: `npm run lint 2>&1 | grep "noEmptyBlockStatements" | head -50`
  - Удалить пустые блоки или добавить комментарий `// TODO:`
- [ ] Коммит: `fix: удалить пустые блоки кода`

**Цель недели**: 17,312 → 15,000 errors (-2,312)

---

### **Неделя 2: noUnusedVariables + useAwait** (цель: 15,000 → 12,000)

#### **День 8-10**:
- [ ] Исправить `noUnusedVariables` в `src/features/admin/`
  ```bash
  npm run lint 2>&1 | grep "src/features/admin" | grep "noUnusedVariables" > unused-vars.txt
  ```
- [ ] Исправить по 50-100 переменных в день
- [ ] Коммит после каждого дня

#### **День 11-14**:
- [ ] Исправить `useAwait` (async без await)
  - Найти: `npm run lint 2>&1 | grep "useAwait"`
  - Либо добавить `await`, либо убрать `async`
- [ ] Коммит: `fix: исправить async функции без await`

**Цель недели**: 15,000 → 12,000 errors (-3,000)

---

### **Неделя 3: noMagicNumbers** (цель: 12,000 → 9,000)

#### **День 15-21**:
- [ ] Исправить `noMagicNumbers` по директориям
  - Извлечь magic numbers в константы
  - Пример:
    ```typescript
    // ❌ БЫЛО
    setTimeout(() => {}, 100);
    
    // ✅ СТАЛО
    const DEBOUNCE_DELAY = 100;
    setTimeout(() => {}, DEBOUNCE_DELAY);
    ```
- [ ] Исправлять по 100-200 ошибок в день
- [ ] Коммит после каждого дня

**Цель недели**: 12,000 → 9,000 errors (-3,000)

---

### **Неделя 4: noNestedTernary + финальная чистка** (цель: 9,000 → 5,000)

#### **День 22-28**:
- [ ] Исправить `noNestedTernary`
  - Разбить вложенные тернарные операторы на if-else
  - Пример:
    ```typescript
    // ❌ БЫЛО
    const status = isActive ? isVerified ? 'active-verified' : 'active-unverified' : 'inactive';
    
    // ✅ СТАЛО
    function getStatus(isActive, isVerified) {
      if (!isActive) return 'inactive';
      return isVerified ? 'active-verified' : 'active-unverified';
    }
    ```
- [ ] Исправлять по 100-200 ошибок в день
- [ ] Финальная проверка TypeScript + Build
- [ ] Коммит: `fix: разбить вложенные тернарные операторы`

**Цель недели**: 9,000 → 5,000 errors (-4,000)

---

## 🛠️ Команды для поэтапного исправления

### **1. Исправить конкретную директорию**:
```bash
# React Native
npx biome check --write app/

# PWA - по директориям
npx biome check --write src/features/mobile/
npx biome check --write src/features/admin/
npx biome check --write src/shared/components/
npx biome check --write src/shared/lib/
npx biome check --write src/pwa/
```

### **2. Исправить конкретный файл**:
```bash
npx biome check --write src/features/mobile/home/MobileHome.tsx
```

### **3. Найти ошибки по категории**:
```bash
# noUnusedVariables
npm run lint 2>&1 | grep "noUnusedVariables" | head -50

# noEmptyBlockStatements
npm run lint 2>&1 | grep "noEmptyBlockStatements" | head -50

# useAwait
npm run lint 2>&1 | grep "useAwait" | head -50

# noMagicNumbers
npm run lint 2>&1 | grep "noMagicNumbers" | head -50
```

### **4. Найти ошибки в конкретной директории**:
```bash
npm run lint 2>&1 | grep "src/features/mobile" | head -50
npm run lint 2>&1 | grep "src/features/admin" | head -50
```

### **5. Проверить прогресс**:
```bash
npm run lint 2>&1 | grep "Found"
```

---

## ✅ Checklist после каждого этапа

- [ ] Запустить `npm run type-check` (0 errors)
- [ ] Запустить `npm run build` (успешно)
- [ ] Проверить консоль браузера (0 errors)
- [ ] Запустить `npm run lint 2>&1 | grep "Found"` (проверить прогресс)
- [ ] Коммитить изменения

---

## 📈 Мониторинг прогресса

| Дата | Errors | Warnings | Изменение | Категория |
|------|--------|----------|-----------|-----------|
| 2025-10-30 | 17,312 | 1,021 | - | Начало |
| День 1 | 17,314 | 1,008 | +2 / -13 warnings | React Native FIXABLE (5 файлов исправлено) |
| День 2 | 17,107 | 981 | -207 / -27 warnings | features/ FIXABLE (109 файлов исправлено) |
| День 3 | 16,663 | 940 | -444 / -41 warnings | shared/ FIXABLE (136 файлов исправлено) |
| День 2 | ? | ? | ? | features/ FIXABLE |
| День 3 | ? | ? | ? | shared/ FIXABLE |
| День 7 | 15,000 | ? | -2,312 | Неделя 1 завершена |
| День 14 | 12,000 | ? | -3,000 | Неделя 2 завершена |
| День 21 | 9,000 | ? | -3,000 | Неделя 3 завершена |
| День 28 | 5,000 | ? | -4,000 | Неделя 4 завершена |

---

## 🚨 Важные правила

1. **НИКОГДА** не запускать `npm run lint:fix` на всем проекте (зависает)
2. **ВСЕГДА** исправлять по директориям/файлам
3. **ВСЕГДА** проверять TypeScript + Build после исправлений
4. **ВСЕГДА** коммитить после каждого этапа
5. **НИКОГДА** не исправлять больше 200 ошибок за раз (риск сломать код)

---

## 📝 Примечания

- Этот план создан на основе анализа текущих ошибок
- План может корректироваться в процессе
- Приоритет: стабильность > скорость
- Цель: уменьшить технический долг постепенно

