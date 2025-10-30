# Code Quality Guide для UNITY-v2

**Версия**: 1.0  
**Дата**: 2025-10-30  
**Автор**: AI Agent + Rustam Karimov

---

## 🎯 Цель

Навести порядок в проекте согласно лучшим практикам:
- ✅ Ultracite/Biome linting
- ✅ TypeScript strict mode
- ✅ Accessibility (a11y)
- ✅ Performance optimization
- ✅ React Native готовность

---

## 📊 Текущее состояние (2025-10-30)

### **Lint ошибки**:
- **Всего**: 17,334 errors + 1,031 warnings
- **FIXABLE**: ~10,000 errors (можно исправить автоматически)
- **Требуют ручного исправления**: ~7,000 errors

### **TypeScript ошибки**:
- **Всего**: 8 errors
- **Файл**: `src/features/admin/settings/components/mobile-config/MobileConfigTab.tsx`

### **Build статус**:
- ✅ **PWA Build**: успешен
- ✅ **Vite**: работает
- ⚠️ **React Native**: не тестировался

---

## 🚀 План наведения порядка

### **Фаза 1: Автоматические исправления** (1-2 дня)

#### **Шаг 1: Исправить FIXABLE ошибки**
```bash
# 1. Запустить автоисправление
npm run lint:fix

# 2. Проверить что изменилось
git status

# 3. Проверить build
npm run build

# 4. Закоммитить
git add .
git commit -m "chore: auto-fix lint errors with Ultracite"
```

**Ожидаемый результат**: ~10,000 ошибок исправлено

---

#### **Шаг 2: Исправить TypeScript ошибки**
```bash
# 1. Проверить ошибки
npm run type-check

# 2. Исправить вручную
# - MobileConfigTab.tsx: toast() calls
# - MobileConfigTab.tsx: onChange handlers

# 3. Проверить снова
npm run type-check

# 4. Закоммитить
git commit -m "fix: resolve TypeScript errors in MobileConfigTab"
```

**Ожидаемый результат**: 0 TypeScript ошибок

---

### **Фаза 2: Ручные исправления по категориям** (1-2 недели)

#### **Категория 1: КРИТИЧНО** (исправлять НЕМЕДЛЕННО)

**Security errors**:
- `noDangerouslySetInnerHtml` - удалить все использования
- `noEval` - заменить на безопасные альтернативы

**Accessibility errors**:
- `useKeyWithClickEvents` - добавить keyboard handlers
- `noRedundantAlt` - исправить alt тексты
- `useValidAriaProps` - исправить ARIA атрибуты

**Performance errors**:
- `noNamespaceImport` - заменить на named imports
- `noAccumulatingSpread` - оптимизировать циклы

**Команды**:
```bash
# 1. Найти все security ошибки
npm run lint 2>&1 | grep "security"

# 2. Исправить вручную

# 3. Проверить
npm run lint

# 4. Закоммитить
git commit -m "fix(security): resolve critical security issues"
```

---

#### **Категория 2: ВАЖНО** (исправлять в течение недели)

**Complexity warnings**:
- `noExcessiveCognitiveComplexity` - разбить сложные функции

**Suspicious errors**:
- `noUnusedVariables` - удалить неиспользуемые переменные
- `useAwait` - исправить async функции без await
- `noEmptyBlockStatements` - удалить пустые блоки

**Команды**:
```bash
# 1. Найти все complexity warnings
npm run lint 2>&1 | grep "complexity"

# 2. Исправить вручную

# 3. Закоммитить
git commit -m "refactor: reduce code complexity"
```

---

#### **Категория 3: МОЖНО ОТЛОЖИТЬ** (исправлять постепенно)

**Style warnings**:
- `useTemplate` - использовать template literals
- `noNestedTernary` - упростить тернарные операторы
- `noMagicNumbers` - извлечь magic numbers в константы

**Команды**:
```bash
# 1. Исправлять по 100 ошибок в день
npm run lint 2>&1 | grep "style" | head -100

# 2. Исправить вручную

# 3. Закоммитить
git commit -m "style: improve code readability"
```

---

### **Фаза 3: Мониторинг и поддержка** (постоянно)

#### **Еженедельный мониторинг**:
```bash
# Каждый понедельник:
npm run lint 2>&1 | grep "Found"

# Цель: уменьшать на 1000 ошибок в неделю
# Неделя 1: 17,334 → 16,334
# Неделя 2: 16,334 → 15,334
# Неделя 3: 15,334 → 14,334
# Неделя 4: 14,334 → 13,334
```

#### **Pre-commit hook**:
```bash
# Автоматически запускается при git commit:
# 1. npm run lint:fix  - исправляет форматирование
# 2. npm run type-check - проверяет TypeScript
# 3. npm run build      - проверяет build

# Если хочешь обойти (НЕ РЕКОМЕНДУЕТСЯ):
git commit --no-verify -m "..."
```

#### **GitHub Actions**:
```yaml
# .github/workflows/quality-checks.yml
# Автоматически запускается при push:
# - Lint check
# - TypeScript check
# - Build check
# - Bundle size check
```

---

## 🎓 Best Practices

### **1. Перед созданием нового файла**:
```bash
# 1. Проверить существующие файлы
npm run lint

# 2. Изучить правила
# Использовать getRules_ultracite() MCP

# 3. Создать файл согласно правилам
```

### **2. После редактирования файла**:
```bash
# 1. Исправить автоматически
npx biome check --write src/path/to/file.tsx

# 2. Проверить что нет ошибок
npx biome check src/path/to/file.tsx

# 3. Если есть ошибки - исправить НЕМЕДЛЕННО
```

### **3. Перед коммитом**:
```bash
# 1. Запустить все проверки
npm run pre-commit

# 2. Если есть ошибки - исправить
# 3. Закоммитить
git commit -m "feat: add new feature"
```

---

## 📚 Ресурсы

### **Документация**:
- [Ultracite Rules](.augment/rules/ultracite.md)
- [UNITY-v2 Rules](.augment/rules/unity.md)
- [Biome Documentation](https://biomejs.dev/)

### **MCP Tools**:
- `getRules_ultracite()` - получить список всех правил
- `Context7 MCP` - документация библиотек

### **Команды**:
```bash
# Lint
npm run lint              # Проверка без исправлений
npm run lint:fix          # Автоматическое исправление
npm run lint:unsafe       # Unsafe fixes

# TypeScript
npm run type-check        # Проверка типов

# Build
npm run build             # Production build
npm run dev               # Development server

# Pre-commit
npm run pre-commit        # Все проверки перед коммитом
```

---

## 🎯 Цели на месяц

### **Неделя 1** (2025-10-30 - 2025-11-06):
- ✅ Интегрировать Ultracite
- ✅ Исправить FIXABLE ошибки (~10,000)
- ✅ Исправить TypeScript ошибки (8)
- ✅ Цель: 17,334 → 7,334 errors

### **Неделя 2** (2025-11-06 - 2025-11-13):
- ⬜ Исправить Security errors
- ⬜ Исправить Accessibility errors
- ⬜ Исправить Performance errors
- ⬜ Цель: 7,334 → 5,334 errors

### **Неделя 3** (2025-11-13 - 2025-11-20):
- ⬜ Исправить Complexity warnings
- ⬜ Исправить Suspicious errors
- ⬜ Цель: 5,334 → 3,334 errors

### **Неделя 4** (2025-11-20 - 2025-11-27):
- ⬜ Исправить Style warnings
- ⬜ Оптимизировать код
- ⬜ Цель: 3,334 → 1,334 errors

---

## ✅ Checklist

### **Ежедневно**:
- [ ] Запустить `npm run lint` перед началом работы
- [ ] Исправить ошибки в файлах которые редактируешь
- [ ] Запустить `npm run pre-commit` перед коммитом

### **Еженедельно**:
- [ ] Проверить общее количество ошибок
- [ ] Исправить 1000+ ошибок
- [ ] Обновить CHANGELOG.md

### **Ежемесячно**:
- [ ] Проверить прогресс (цель: -4000 errors/месяц)
- [ ] Обновить документацию
- [ ] Провести code review

---

## 🚨 Важные правила

### **ВСЕГДА**:
- ✅ Запускать `npm run lint:fix` после редактирования
- ✅ Проверять TypeScript (`npm run type-check`)
- ✅ Проверять build (`npm run build`)
- ✅ Проверять консоль браузера (Chrome MCP)

### **НИКОГДА**:
- ❌ Коммитить код с lint ошибками
- ❌ Использовать `git commit --no-verify` без причины
- ❌ Игнорировать TypeScript ошибки
- ❌ Создавать код с accessibility проблемами

---

## 📞 Поддержка

Если возникли вопросы:
1. Использовать `getRules_ultracite()` MCP
2. Читать `.augment/rules/ultracite.md`
3. Спросить AI Agent
4. Читать [Biome Documentation](https://biomejs.dev/)

