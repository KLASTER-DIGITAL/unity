# 🔧 ПЛАН ИСПРАВЛЕНИЯ EDGE FUNCTIONS - UNITY-v2

## 🐛 Выявленные проблемы

### Проблема 1: Неправильный BASE_URL для i18n API

**Текущее состояние**:
- Код вызывает: `/api/i18n/languages` и `/api/i18n/translations/:lang`
- Edge Function endpoints находятся по: `/make-server-9729c493/i18n/languages` и `/make-server-9729c493/i18n/translations/:lang`
- Результат: **404 ошибки**

**Файлы с проблемой**:
1. `src/utils/i18n/api.ts` - BASE_URL = '/api/i18n'
2. `src/shared/lib/i18n/api.ts` - BASE_URL = '/api/i18n'
3. `src/shared/lib/api/i18n/api.ts` - BASE_URL = '/api/i18n'

### Проблема 2: Дублированные i18n API классы

**Текущее состояние**:
- 3 копии I18nAPI класса в разных местах
- Все используют неправильный BASE_URL
- Сложно поддерживать и обновлять

**Файлы с дублями**:
1. `src/utils/i18n/api.ts`
2. `src/shared/lib/i18n/api.ts`
3. `src/shared/lib/api/i18n/api.ts`

---

## ✅ Решение

### Вариант 1: Обновить BASE_URL (Быстрое решение)

Обновить все три файла с правильным BASE_URL:

```typescript
// БЫЛО
private static readonly BASE_URL = '/api/i18n';

// СТАЛО
private static readonly BASE_URL = 'https://{projectId}.supabase.co/functions/v1/make-server-9729c493/i18n';
```

**Преимущества**:
- Быстрое решение
- Минимальные изменения

**Недостатки**:
- Дублирование кода
- Сложно поддерживать

### Вариант 2: Консолидировать в один файл (Рекомендуется)

1. Оставить только `src/shared/lib/i18n/api.ts`
2. Удалить `src/utils/i18n/api.ts` и `src/shared/lib/api/i18n/api.ts`
3. Обновить импорты во всех файлах
4. Обновить BASE_URL

**Преимущества**:
- Единственный источник истины
- Легко поддерживать
- Чистая архитектура

**Недостатки**:
- Требует больше изменений
- Нужно обновить импорты

---

## 🎯 Рекомендуемый план действий

### Шаг 1: Обновить BASE_URL в Edge Function

Убедиться, что Edge Function endpoints доступны:
- ✅ `/make-server-9729c493/i18n/languages` - GET
- ✅ `/make-server-9729c493/i18n/translations/:lang` - GET
- ✅ `/make-server-9729c493/i18n/keys` - GET

### Шаг 2: Обновить BASE_URL в i18n API классах

```typescript
// src/shared/lib/i18n/api.ts
private static readonly BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9729c493/i18n`;
```

### Шаг 3: Удалить дублированные файлы

- Удалить `src/utils/i18n/api.ts`
- Удалить `src/shared/lib/api/i18n/api.ts`

### Шаг 4: Обновить импорты

Найти все импорты из удаленных файлов и обновить на:
```typescript
import { I18nAPI } from '@/shared/lib/i18n/api';
```

### Шаг 5: Протестировать

- Открыть приложение
- Проверить консоль на ошибки
- Убедиться, что языки загружаются
- Убедиться, что переводы загружаются

---

## 📊 Ожидаемые результаты

### До исправления
```
❌ Error fetching supported languages: 401
❌ Error fetching translations for en: 401
❌ Failed to load translations for en after 3 attempts
```

### После исправления
```
✅ Fetching supported languages...
✅ Loading translations for en (fallback: ru)
✅ Translations loaded for ru, used fallback: false
```

---

## 🚀 Команды для выполнения

```bash
# 1. Обновить BASE_URL в src/shared/lib/i18n/api.ts
# 2. Удалить дублированные файлы
rm src/utils/i18n/api.ts
rm src/shared/lib/api/i18n/api.ts

# 3. Обновить импорты
grep -r "from.*utils/i18n/api" src/ --include="*.tsx" --include="*.ts"
grep -r "from.*shared/lib/api/i18n/api" src/ --include="*.tsx" --include="*.ts"

# 4. Пересобрать проект
npm run build

# 5. Запустить dev сервер
npm run dev

# 6. Открыть приложение и проверить консоль
open http://localhost:3000/
```

---

## 📝 Чек-лист

- [ ] Обновить BASE_URL в `src/shared/lib/i18n/api.ts`
- [ ] Удалить `src/utils/i18n/api.ts`
- [ ] Удалить `src/shared/lib/api/i18n/api.ts`
- [ ] Обновить импорты во всех файлах
- [ ] Пересобрать проект
- [ ] Протестировать загрузку языков
- [ ] Протестировать загрузку переводов
- [ ] Проверить консоль на ошибки

---

**Дата создания**: 2025-10-16
**Версия**: 1.0
**Статус**: 🔴 ТРЕБУЕТ ВНИМАНИЯ

