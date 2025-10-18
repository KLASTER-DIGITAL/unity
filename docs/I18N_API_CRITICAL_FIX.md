# 🔴 КРИТИЧЕСКАЯ ПРОБЛЕМА: i18n API BASE_URL возвращает 404

**Дата**: 2025-10-16  
**Приоритет**: 🔴 КРИТИЧЕСКИЙ  
**Статус**: ⏳ ТРЕБУЕТ ИСПРАВЛЕНИЯ

---

## 🔴 Проблема

При загрузке приложения в консоли браузера видны ошибки:

```
[ERROR] Error fetching translations for en: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is...
[ERROR] Error fetching supported languages: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is...
[ERROR] Failed to load translations for en after 3 attempts, using fallback
```

**Причина**: API endpoint возвращает HTML (404 страница) вместо JSON

---

## 🔍 Анализ

### Текущий BASE_URL

**Файл**: `src/shared/lib/i18n/api.ts`

```typescript
private static readonly BASE_URL = '/api/i18n';  // ❌ НЕПРАВИЛЬНО
```

**Результат**: Запрос идет на `http://localhost:3000/api/i18n` → 404 → HTML ошибка

### Правильный BASE_URL

```typescript
private static readonly BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9729c493/i18n`;
```

**Результат**: Запрос идет на Edge Function → JSON ответ ✅

---

## ✅ Решение

### Шаг 1: Обновить BASE_URL в `src/shared/lib/i18n/api.ts`

```typescript
// Получаем projectId из переменных окружения
const projectId = import.meta.env.VITE_SUPABASE_URL?.split('https://')[1]?.split('.')[0] || 'ecuwuzqlwdkkdncampnc';

export class TranslationAPI {
  private static readonly BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9729c493/i18n`;
  
  // ... остальной код
}
```

### Шаг 2: Удалить дублированные файлы

Найти и удалить:
- `src/utils/i18n/api.ts`
- `src/shared/lib/api/i18n/api.ts`

### Шаг 3: Обновить импорты

Убедиться, что все импорты используют:
```typescript
import { TranslationAPI } from '@/shared/lib/i18n/api';
```

### Шаг 4: Проверить Edge Function

**Файл**: `supabase/functions/make-server-9729c493/index.ts`

Убедиться, что endpoint `/i18n` существует:

```typescript
app.get('/make-server-9729c493/i18n/languages', async (c) => {
  // Возвращает список поддерживаемых языков
  return c.json({
    languages: ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja']
  });
});

app.get('/make-server-9729c493/i18n/:language', async (c) => {
  // Возвращает переводы для языка
  const language = c.req.param('language');
  // ... логика загрузки переводов
});
```

---

## 📊 Текущие ошибки в консоли

```
[ERROR] Failed to load resource: the server responded with a status of 401 ()
[ERROR] Error fetching translations for en: SyntaxError: Unexpected token '<'
[ERROR] Error fetching supported languages: SyntaxError: Unexpected token '<'
[ERROR] Failed to load translations for en after 3 attempts, using fallback
[LOG] Using builtin fallback translations
```

**Анализ**:
1. ❌ 401 ошибка - возможно, нет авторизации
2. ❌ SyntaxError '<' - HTML вместо JSON
3. ✅ Fallback работает - встроенные переводы используются

---

## 🎯 Проверка после исправления

### 1. Проверить консоль браузера
```
[LOG] Loading translations for en (fallback: ru)
[LOG] Preloading translations for languages: en
[LOG] TranslationManager: Initialization complete
```

### 2. Проверить сетевые запросы
```
GET https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/i18n/languages
Status: 200 OK
Response: { languages: ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja'] }
```

### 3. Проверить загрузку переводов
```
GET https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/i18n/en
Status: 200 OK
Response: { translations: { ... } }
```

---

## 📝 Файлы для изменения

| Файл | Изменение | Приоритет |
|------|-----------|-----------|
| `src/shared/lib/i18n/api.ts` | Обновить BASE_URL | 🔴 КРИТИЧЕСКИЙ |
| `src/utils/i18n/api.ts` | Удалить (дубль) | 🟡 ВАЖНЫЙ |
| `src/shared/lib/api/i18n/api.ts` | Удалить (дубль) | 🟡 ВАЖНЫЙ |
| `supabase/functions/make-server-9729c493/index.ts` | Проверить endpoints | 🟡 ВАЖНЫЙ |

---

## ⏱️ Время исправления

- Обновить BASE_URL: 5 минут
- Удалить дубли: 5 минут
- Обновить импорты: 5 минут
- Тестирование: 10 минут

**Итого**: ~25 минут

---

## 🚀 Статус

| Задача | Статус |
|--------|--------|
| Идентифицировать проблему | ✅ ЗАВЕРШЕНО |
| Найти правильный BASE_URL | ✅ ЗАВЕРШЕНО |
| Обновить BASE_URL | ⏳ PENDING |
| Удалить дубли | ⏳ PENDING |
| Обновить импорты | ⏳ PENDING |
| Протестировать | ⏳ PENDING |

---

**Версия**: 1.0  
**Автор**: Augment Agent  
**Дата**: 2025-10-16

