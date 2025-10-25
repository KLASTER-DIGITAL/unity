# Quality Checks Workflow

**Версия**: 1.0  
**Дата**: 2025-10-25  
**Цель**: Обеспечить качество кода перед каждым коммитом и деплоем

---

## 🎯 Обязательные проверки

### Автоматические (выполняются при коммите)

#### 1. TypeScript проверка
```bash
npm run type-check
```
- **Что проверяет**: типы, интерфейсы, сигнатуры функций
- **Критерий**: 0 ошибок
- **Действие при ошибке**: НЕМЕДЛЕННО исправить

#### 2. Build проверка
```bash
npm run build
```
- **Что проверяет**: компиляция, бандлинг, оптимизация
- **Критерий**: успешный build
- **Действие при ошибке**: НЕМЕДЛЕННО исправить

### Ручные (выполняются перед деплоем)

#### 3. Supabase Advisors
```typescript
// Security check
get_advisors_supabase({
  project_id: "ecuwuzqlwdkkdncampnc",
  type: "security"
})

// Performance check
get_advisors_supabase({
  project_id: "ecuwuzqlwdkkdncampnc",
  type: "performance"
})
```
- **Что проверяет**: RLS policies, индексы, N+1 проблемы
- **Критерий**: 0 WARN/ERROR
- **Действие при ошибке**: НЕМЕДЛЕННО исправить

#### 4. Консоль браузера
```bash
# Запустить dev server
npm run dev

# Открыть Chrome DevTools (Cmd+Option+I)
# Проверить консоль на ошибки
```
- **Что проверяет**: runtime ошибки, warnings, network errors
- **Критерий**: 0 errors в консоли
- **Действие при ошибке**: НЕМЕДЛЕННО исправить

---

## 🔄 Workflow

### Для AI (Augment Agent)

**ОБЯЗАТЕЛЬНЫЙ порядок действий:**

1. ✅ Делаешь изменения в коде
2. ✅ Проверяешь TypeScript: `npm run type-check`
3. ✅ Проверяешь Build: `npm run build`
4. ✅ Проверяешь Supabase Advisors (security + performance)
5. ✅ Проверяешь консоль браузера (Chrome MCP)
6. ✅ Если ВСЁ ОК → коммит и push
7. ❌ Если ЕСТЬ ОШИБКИ → исправляешь и повторяешь с шага 2

**ЗАПРЕТЫ:**
- ❌ НИКОГДА не коммитить с TypeScript ошибками
- ❌ НИКОГДА не коммитить с ошибками build
- ❌ НИКОГДА не коммитить с ошибками в консоли
- ❌ НИКОГДА не продолжать при WARN/ERROR в Supabase Advisors

### Для разработчиков

**Быстрая проверка:**
```bash
./scripts/pre-deploy-check.sh
```

**Ручная проверка:**
```bash
# 1. TypeScript
npm run type-check

# 2. Build
npm run build

# 3. Supabase Advisors (через Augment Chat)
# 4. Консоль браузера (вручную)
```

---

## 🛡️ Автоматизация

### Pre-commit Hook (Husky)

**Что делает:**
- Автоматически запускается при `git commit`
- Проверяет TypeScript
- Проверяет Build
- **Блокирует коммит** при наличии ошибок

**Файл:** `.husky/pre-commit`

**Обход (НЕ рекомендуется):**
```bash
git commit --no-verify -m "message"
```

### GitHub Action

**Что делает:**
- Запускается при push в main/develop
- Проверяет TypeScript
- Проверяет Build
- Проверяет размер бандла

**Файл:** `.github/workflows/quality-checks.yml`

---

## 📊 Метрики качества

### TypeScript
- **Цель**: 0 ошибок
- **Текущий**: проверяется при каждом коммите

### Build
- **Цель**: успешный build < 30 секунд
- **Текущий**: проверяется при каждом коммите

### Bundle Size
- **Цель**: < 2 MB (gzipped)
- **Текущий**: отображается в GitHub Action

### Supabase Advisors
- **Цель**: 0 WARN/ERROR
- **Текущий**: проверяется вручную перед деплоем

### Console Errors
- **Цель**: 0 errors
- **Текущий**: проверяется вручную перед деплоем

---

## 🆘 Troubleshooting

### TypeScript ошибки не исчезают
```bash
# Очистить кеш TypeScript
rm -rf node_modules/.cache
npx tsc --build --clean
npm run type-check
```

### Build падает с ошибкой памяти
```bash
# Увеличить лимит памяти Node.js
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Pre-commit hook не работает
```bash
# Переустановить Husky
npm run prepare
chmod +x .husky/pre-commit
```

### Supabase Advisors показывает старые ошибки
```bash
# Проверить, что изменения применены в БД
# Проверить, что миграции выполнены
# Подождать 1-2 минуты и повторить проверку
```

---

## 📝 Примеры

### ✅ Правильный workflow

```bash
# 1. Делаю изменения
vim src/components/Button.tsx

# 2. Проверяю TypeScript
npm run type-check
# ✅ No errors

# 3. Проверяю Build
npm run build
# ✅ Build successful

# 4. Проверяю Supabase Advisors (через Augment Chat)
# ✅ No warnings

# 5. Проверяю консоль браузера
npm run dev
# ✅ No errors in console

# 6. Коммит
git add .
git commit -m "feat: update Button component"
# ✅ Pre-commit checks passed

# 7. Push
git push origin main
# ✅ GitHub Action passed
```

### ❌ Неправильный workflow

```bash
# 1. Делаю изменения
vim src/components/Button.tsx

# 2. Сразу коммит (БЕЗ ПРОВЕРОК)
git add .
git commit -m "feat: update Button component"
# ❌ Pre-commit hook FAILED
# ❌ TypeScript errors found!

# 3. Пытаюсь обойти hook
git commit --no-verify -m "feat: update Button component"
# ❌ ПЛОХАЯ ПРАКТИКА!

# 4. Push
git push origin main
# ❌ GitHub Action FAILED
# ❌ Деплой сломан
```

---

## 🎓 Best Practices

1. **ВСЕГДА** запускать `npm run type-check` перед коммитом
2. **ВСЕГДА** запускать `npm run build` перед коммитом
3. **ВСЕГДА** проверять Supabase Advisors перед деплоем
4. **ВСЕГДА** проверять консоль браузера перед деплоем
5. **НИКОГДА** не использовать `--no-verify` для обхода pre-commit hook
6. **НИКОГДА** не игнорировать ошибки TypeScript
7. **НИКОГДА** не игнорировать ошибки Build
8. **НИКОГДА** не игнорировать WARN/ERROR в Supabase Advisors

---

## 📚 Связанные документы

- [UNITY-v2 Rules](../../.augment/rules/unity.md)
- [BACKLOG.md](../BACKLOG.md)
- [SPRINT.md](../SPRINT.md)

