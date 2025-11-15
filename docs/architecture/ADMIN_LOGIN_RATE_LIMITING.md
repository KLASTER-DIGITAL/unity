# 🔒 Admin Login Rate Limiting

**Версия**: 1.0  
**Дата**: 2025-11-15  
**Статус**: ✅ Реализовано

---

## 🎯 Назначение

Защита админ-панели от brute-force атак путем ограничения количества попыток входа.

---

## 📊 Параметры

| Параметр | Значение | Описание |
|----------|----------|----------|
| **Лимит попыток** | 5 | Максимум неудачных попыток |
| **Временное окно** | 15 минут | Период отслеживания попыток |
| **Блокировка** | 30 минут | Длительность блокировки после превышения лимита |
| **Retention** | 24 часа | Хранение истории попыток |

---

## 🏗️ Архитектура

### 1. База данных

**Таблица**: `admin_login_attempts`

```sql
CREATE TABLE public.admin_login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Индексы**:
- `idx_admin_login_attempts_email_created` - быстрый поиск по email
- `idx_admin_login_attempts_ip_created` - быстрый поиск по IP

**RLS политики**:
- Только `super_admin` может читать записи
- Запись через RPC функции (SECURITY DEFINER)

### 2. RPC функции

#### `check_admin_login_rate_limit(p_email, p_ip_address)`

**Назначение**: Проверка rate limit перед попыткой входа

**Параметры**:
- `p_email` (TEXT) - email пользователя
- `p_ip_address` (TEXT, optional) - IP адрес

**Возвращает**:
```json
{
  "is_blocked": false,
  "failed_attempts": 2,
  "attempts_remaining": 3,
  "block_until": null,
  "window_minutes": 15,
  "max_attempts": 5
}
```

**Логика**:
1. Подсчитать неудачные попытки за последние 15 минут
2. Если ≥5 попыток → проверить блокировку (30 минут с последней попытки)
3. Если блокировка истекла → сбросить счетчик
4. Вернуть статус и оставшиеся попытки

#### `record_admin_login_attempt(p_email, p_success, p_ip_address, p_user_agent)`

**Назначение**: Запись попытки входа

**Параметры**:
- `p_email` (TEXT) - email пользователя
- `p_success` (BOOLEAN) - успешность попытки
- `p_ip_address` (TEXT, optional) - IP адрес
- `p_user_agent` (TEXT, optional) - User-Agent браузера

**Логика**:
1. Вставить запись в `admin_login_attempts`
2. Очистить записи старше 24 часов

---

## 🔄 Workflow

### Сценарий 1: Успешный вход

```
1. Пользователь вводит email/password
2. AdminLoginScreen вызывает check_admin_login_rate_limit()
3. Rate limit OK (is_blocked: false)
4. Supabase auth.signInWithPassword()
5. Проверка роли (super_admin)
6. record_admin_login_attempt(success: true)
7. Переход в админ-панель
```

### Сценарий 2: Неудачная попытка (< 5)

```
1. Пользователь вводит неверный пароль
2. check_admin_login_rate_limit() → attempts_remaining: 3
3. auth.signInWithPassword() → error
4. record_admin_login_attempt(success: false)
5. Toast: "Неверный email или пароль. Осталось попыток: 3"
```

### Сценарий 3: Блокировка (≥ 5 попыток)

```
1. Пользователь вводит email/password (6-я попытка)
2. check_admin_login_rate_limit() → is_blocked: true, block_until: "2025-11-15T15:30:00Z"
3. Вычислить minutesLeft = 28 минут
4. Toast: "Слишком много попыток входа. Попробуйте снова через 28 минут"
5. НЕ вызывать auth.signInWithPassword()
```

### Сценарий 4: Истечение блокировки

```
1. Прошло 30 минут с последней попытки
2. check_admin_login_rate_limit() → is_blocked: false (блокировка истекла)
3. Счетчик сброшен → attempts_remaining: 5
4. Пользователь может попробовать снова
```

---

## 🎨 UI компоненты

### Индикатор оставшихся попыток

```tsx
{attemptsRemaining !== null && attemptsRemaining < 5 && (
  <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
    ⚠️ Осталось попыток: {attemptsRemaining}
  </p>
)}
```

**Показывается когда**:
- `attemptsRemaining < 5` (после первой неудачной попытки)
- Цвет: оранжевый (предупреждение)

### Toast уведомления

**Неудачная попытка**:
```tsx
toast.error('Неверный email или пароль', {
  description: `Осталось попыток: ${attemptsRemaining - 1}`
});
```

**Блокировка**:
```tsx
toast.error('Слишком много попыток входа', {
  description: `Попробуйте снова через ${minutesLeft} минут`
});
```

---

## 🔧 Реализация

### AdminLoginScreen.tsx

**Изменения**:
1. Добавлен state `attemptsRemaining`
2. Проверка rate limit ПЕРЕД `auth.signInWithPassword()`
3. Запись попытки ПОСЛЕ успеха/неудачи
4. UI индикатор оставшихся попыток

**Код**:
```typescript
// 1. Проверка rate limit
const { data: rateLimitData } = await supabase.rpc(
  'check_admin_login_rate_limit',
  { p_email: email }
);

if (rateLimitData?.is_blocked) {
  // Показать ошибку блокировки
  return;
}

// 2. Попытка входа
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// 3. Запись результата
await supabase.rpc('record_admin_login_attempt', {
  p_email: email,
  p_success: !error,
  p_user_agent: navigator.userAgent
});
```

---

## 📊 Метрики

### Мониторинг

**Запросы для анализа**:

```sql
-- Топ-10 email с наибольшим количеством неудачных попыток
SELECT email, COUNT(*) as failed_attempts
FROM admin_login_attempts
WHERE success = false
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY email
ORDER BY failed_attempts DESC
LIMIT 10;

-- Количество блокировок за последние 24 часа
SELECT COUNT(DISTINCT email) as blocked_users
FROM (
  SELECT email, COUNT(*) as attempts
  FROM admin_login_attempts
  WHERE success = false
    AND created_at > NOW() - INTERVAL '24 hours'
  GROUP BY email
  HAVING COUNT(*) >= 5
) subquery;
```

### Алерты

**Критические события**:
- ≥10 неудачных попыток с одного email за 1 час → возможная атака
- ≥50 неудачных попыток с разных email за 1 час → распределенная атака

---

## 🐛 Известные ограничения

1. **IP адрес**: Пока не реализовано (требуется Edge Function для получения реального IP)
2. **Fail-open**: Если `check_admin_login_rate_limit()` падает → разрешаем вход (для доступности)
3. **Нет CAPTCHA**: После блокировки нет дополнительной защиты

---

## 🚀 Будущие улучшения

1. **IP-based rate limiting**: Ограничение по IP адресу (через Edge Function)
2. **CAPTCHA**: После 3 неудачных попыток
3. **Email уведомления**: Отправка email при блокировке
4. **Sentry алерты**: Автоматические алерты при подозрительной активности
5. **Whitelist**: Исключения для доверенных IP

---

## 📚 Связанные документы

- [PUSH_RATE_LIMITING.md](./PUSH_RATE_LIMITING.md) - Rate limiting для push notifications
- [SECURITY.md](./SECURITY.md) - Общая безопасность UNITY-v2

---

**Конец документа**

