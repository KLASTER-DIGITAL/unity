# 🧹 ПЛАН ОЧИСТКИ КОДА - UNITY-v2

## 📋 Обзор проблем

После миграции на Feature-Sliced Design остались дублированные файлы и компоненты, которые нужно удалить.

---

## 🗑️ Файлы для удаления

### 1. Дублированные auth файлы

**Удалить**:
- `src/shared/lib/api/auth.ts` (старая версия, не используется)

**Причина**: Основной файл `src/utils/auth.ts` содержит все функции. `src/shared/lib/auth/index.ts` уже re-exports из `src/utils/auth.ts`.

**Проверка**: Убедиться, что никто не импортирует из `src/shared/lib/api/auth.ts`

---

### 2. Дублированные AuthScreen компоненты

**Удалить**:
- `src/components/AuthScreenNew.tsx` (старая версия)
- `src/components/AuthScreen.tsx` (re-export, не нужен)

**Причина**: Основной компонент находится в `src/features/mobile/auth/components/AuthScreenNew.tsx`

**Проверка**: Убедиться, что все импорты используют `src/features/mobile/auth`

---

### 3. Старые Onboarding компоненты

**Удалить**:
- `src/components/OnboardingScreen.tsx` (если существует)
- `src/components/OnboardingScreen2.tsx` (если существует)
- `src/components/OnboardingScreen3.tsx` (если существует)
- `src/components/OnboardingScreen4.tsx` (если существует)
- `src/components/WelcomeScreen.tsx` (если существует)

**Причина**: Все компоненты перемещены в `src/features/mobile/auth/components/`

**Проверка**: Убедиться, что все импорты используют новые пути

---

### 4. Дублированные re-export файлы

**Удалить**:
- `src/shared/lib/api/index.ts` (если содержит только re-exports)
- `src/shared/lib/auth/index.ts` (если содержит только re-exports)

**Причина**: Прямые импорты из `src/utils/` более понятны и не требуют промежуточных слоев

**Альтернатива**: Если нужны re-exports для постепенной миграции, оставить, но добавить комментарий о плане удаления

---

## 🔍 Проверка импортов

### Команда для поиска неправильных импортов

```bash
# Найти все импорты из старых путей
grep -r "from.*src/components/AuthScreen" src/
grep -r "from.*src/shared/lib/api/auth" src/
grep -r "from.*src/components/OnboardingScreen" src/
grep -r "from.*src/components/WelcomeScreen" src/
```

### Правильные импорты

```typescript
// ✅ ПРАВИЛЬНО
import { AuthScreen } from '@/features/mobile/auth/components/AuthScreenNew';
import { signUpWithEmail } from '@/utils/auth';
import { WelcomeScreen } from '@/features/mobile/auth/components/WelcomeScreen';

// ❌ НЕПРАВИЛЬНО
import { AuthScreen } from '@/components/AuthScreenNew';
import { signUpWithEmail } from '@/shared/lib/api/auth';
import { WelcomeScreen } from '@/components/WelcomeScreen';
```

---

## 📊 Статус файлов

### Дублированные файлы (УДАЛИТЬ)

| Файл | Статус | Причина |
|------|--------|---------|
| `src/components/AuthScreenNew.tsx` | ❌ Удалить | Дублирует `src/features/mobile/auth/components/AuthScreenNew.tsx` |
| `src/components/AuthScreen.tsx` | ❌ Удалить | Re-export, не нужен |
| `src/shared/lib/api/auth.ts` | ❌ Удалить | Старая версия, не используется |
| `src/components/OnboardingScreen*.tsx` | ❌ Удалить | Перемещены в `src/features/mobile/auth/components/` |
| `src/components/WelcomeScreen.tsx` | ❌ Удалить | Перемещен в `src/features/mobile/auth/components/` |

### Re-export файлы (ОСТАВИТЬ или УДАЛИТЬ)

| Файл | Статус | Решение |
|------|--------|---------|
| `src/shared/lib/auth/index.ts` | ⚠️ Оставить | Для постепенной миграции (добавить комментарий) |
| `src/shared/lib/api/index.ts` | ⚠️ Оставить | Для постепенной миграции (добавить комментарий) |

---

## 🚀 План выполнения

### Фаза 1: Проверка импортов (15 мин)
1. Найти все импорты из старых путей
2. Обновить импорты на новые пути
3. Убедиться, что проект собирается

### Фаза 2: Удаление файлов (10 мин)
1. Удалить дублированные файлы
2. Проверить, что проект собирается
3. Запустить тесты (если есть)

### Фаза 3: Финальная проверка (10 мин)
1. Протестировать onboarding flow
2. Протестировать регистрацию
3. Протестировать главный экран

---

## ✅ Чек-лист

- [ ] Найти все импорты из старых путей
- [ ] Обновить импорты на новые пути
- [ ] Удалить `src/components/AuthScreenNew.tsx`
- [ ] Удалить `src/components/AuthScreen.tsx`
- [ ] Удалить `src/shared/lib/api/auth.ts`
- [ ] Удалить старые Onboarding компоненты
- [ ] Удалить `src/components/WelcomeScreen.tsx`
- [ ] Проверить, что проект собирается
- [ ] Протестировать onboarding flow
- [ ] Протестировать регистрацию
- [ ] Протестировать главный экран

---

## 📝 Примечания

- Перед удалением файлов убедиться, что никто их не импортирует
- Использовать IDE для поиска всех ссылок на файл перед удалением
- После удаления файлов перезагрузить dev сервер
- Проверить консоль на ошибки импорта

---

**Дата создания**: 2025-10-16
**Версия**: 1.0

