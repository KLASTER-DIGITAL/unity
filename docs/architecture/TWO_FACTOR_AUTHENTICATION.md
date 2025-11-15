# 🔐 Two-Factor Authentication (2FA) для Super Admin

**Версия**: 1.0  
**Дата**: 2025-11-15  
**Статус**: ✅ Реализовано (частично - требуется интеграция в AdminLoginScreen)

---

## 🎯 Назначение

Добавить дополнительный уровень безопасности для супер-админа через TOTP (Time-based One-Time Password).

---

## 🏗️ Архитектура

### 1. База данных

**Таблица**: `profiles` (новые колонки)

```sql
ALTER TABLE profiles
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN two_factor_secret TEXT,
ADD COLUMN two_factor_backup_codes TEXT[],
ADD COLUMN two_factor_verified_at TIMESTAMPTZ;
```

**Таблица**: `two_factor_attempts` (новая)

```sql
CREATE TABLE two_factor_attempts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    code TEXT NOT NULL,
    success BOOLEAN DEFAULT false,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. RPC функции

#### `check_2fa_rate_limit(p_user_id)`

**Назначение**: Проверка rate limit для 2FA попыток

**Параметры**:
- `p_user_id` (UUID) - ID пользователя

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

**Лимиты**:
- Окно: 15 минут
- Максимум попыток: 5
- Блокировка: 30 минут

#### `record_2fa_attempt(p_user_id, p_code, p_success, p_ip_address, p_user_agent)`

**Назначение**: Запись попытки 2FA верификации

**Логика**:
1. Вставить запись в `two_factor_attempts`
2. Если успешно → обновить `two_factor_verified_at`
3. Очистить записи старше 24 часов

---

## 🔄 Workflow

### Сценарий 1: Включение 2FA

```
1. Super admin открывает Settings → Security
2. Нажимает "Включить 2FA"
3. Генерируется TOTP secret (base32, 16 символов)
4. Показывается QR код для сканирования
5. Admin сканирует QR код в Google Authenticator/Authy
6. Вводит 6-значный код для подтверждения
7. Код проверяется через verifyTOTPCode()
8. Генерируются 10 резервных кодов (8 символов hex)
9. Резервные коды хешируются (SHA-256)
10. Сохраняется в БД:
    - two_factor_enabled = true
    - two_factor_secret = secret
    - two_factor_backup_codes = [hashed codes]
    - two_factor_verified_at = NOW()
11. Показываются резервные коды для сохранения
```

### Сценарий 2: Вход с 2FA

```
1. Admin вводит email/password
2. Проверка rate limit (check_admin_login_rate_limit)
3. auth.signInWithPassword() → успех
4. Загрузка профиля из БД
5. Проверка роли (super_admin)
6. Проверка two_factor_enabled
7. Если true → показать TwoFactorVerification компонент
8. Admin вводит 6-значный код
9. Проверка rate limit (check_2fa_rate_limit)
10. Верификация кода (verifyTOTPCode)
11. Запись попытки (record_2fa_attempt)
12. Если успешно → onComplete(userData)
```

### Сценарий 3: Использование резервного кода

```
1. Admin потерял доступ к приложению-аутентификатору
2. На экране 2FA нажимает "Использовать резервный код"
3. Вводит 8-значный код (XXXXXXXX)
4. Код хешируется (SHA-256)
5. Проверяется против two_factor_backup_codes
6. Если совпадает → код удаляется из списка
7. Обновляется two_factor_backup_codes в БД
8. Toast: "Резервный код использован. Осталось кодов: X"
9. onComplete(userData)
```

### Сценарий 4: Отключение 2FA

```
1. Admin открывает Settings → Security
2. Нажимает "Отключить 2FA"
3. Подтверждение: "Вы уверены?"
4. Обновление БД:
    - two_factor_enabled = false
    - two_factor_secret = null
    - two_factor_backup_codes = null
    - two_factor_verified_at = null
5. Toast: "2FA отключен"
```

---

## 🎨 UI компоненты

### TwoFactorSetup

**Файл**: `src/features/admin/settings/components/TwoFactorSetup.tsx`

**Функции**:
- Показ статуса 2FA (включен/выключен)
- Генерация QR кода для настройки
- Верификация первого кода
- Показ резервных кодов
- Отключение 2FA

**Props**:
```typescript
{
  userId: string;
  userEmail: string;
}
```

### TwoFactorVerification

**Файл**: `src/features/admin/auth/components/TwoFactorVerification.tsx`

**Функции**:
- Ввод 6-значного TOTP кода
- Ввод 8-значного резервного кода
- Rate limiting (5 попыток / 15 минут)
- Показ оставшихся попыток
- Переключение между TOTP и backup code

**Props**:
```typescript
{
  userId: string;
  userEmail: string;
  twoFactorSecret: string;
  backupCodes: string[];
  onVerified: () => void;
  onBack: () => void;
}
```

---

## 🔧 Утилиты (TOTP)

**Файл**: `src/shared/lib/auth/totp.ts`

### Функции

#### `generateTOTPSecret(): string`
Генерирует случайный base32 secret (16 символов)

#### `generateTOTPUri(secret, email, issuer): string`
Генерирует otpauth:// URI для QR кода

#### `verifyTOTPCode(secret, code, window): Promise<boolean>`
Проверяет 6-значный TOTP код (±30 секунд window)

#### `generateBackupCodes(count): string[]`
Генерирует резервные коды (8 символов hex)

#### `hashBackupCode(code): Promise<string>`
Хеширует резервный код (SHA-256)

#### `verifyBackupCode(code, hashedCodes): Promise<boolean>`
Проверяет резервный код против хешей

---

## 📊 Метрики

### Мониторинг

**Запросы для анализа**:

```sql
-- Количество пользователей с включенным 2FA
SELECT COUNT(*) as users_with_2fa
FROM profiles
WHERE two_factor_enabled = true;

-- Топ-10 пользователей с наибольшим количеством неудачных 2FA попыток
SELECT user_id, COUNT(*) as failed_attempts
FROM two_factor_attempts
WHERE success = false
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY failed_attempts DESC
LIMIT 10;

-- Использование резервных кодов
SELECT user_id, array_length(two_factor_backup_codes, 1) as remaining_codes
FROM profiles
WHERE two_factor_enabled = true
  AND array_length(two_factor_backup_codes, 1) < 10;
```

---

## 🚧 TODO (Интеграция)

1. **AdminLoginScreen.tsx** - добавить проверку 2FA после успешного входа:
   ```typescript
   // После проверки роли super_admin
   if (profileData.two_factor_enabled) {
     // Показать TwoFactorVerification компонент
     setShow2FA(true);
     return;
   }
   ```

2. **SettingsTab.tsx** - добавить TwoFactorSetup компонент в Security секцию

3. **Тестирование**:
   - Включение 2FA
   - Вход с 2FA
   - Использование резервного кода
   - Rate limiting
   - Отключение 2FA

---

## 📚 Связанные документы

- [ADMIN_LOGIN_RATE_LIMITING.md](./ADMIN_LOGIN_RATE_LIMITING.md) - Rate limiting для входа
- [ROLE_BASED_ACCESS_CONTROL.md](./ROLE_BASED_ACCESS_CONTROL.md) - RBAC система

---

**Конец документа**

