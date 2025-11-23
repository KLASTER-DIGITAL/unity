# 🔑 Как найти Service Role Key в новом интерфейсе Supabase

## 📍 Где искать

В новом интерфейсе Supabase структура изменилась. Вот несколько способов найти `service_role` key:

## Способ 1: Legacy API Keys (рекомендуется)

1. Откройте https://supabase.com/dashboard
2. Выберите проект `ecuwuzqlwdkkdncampnc`
3. Перейдите в **Settings** → **API Keys** (в левом меню)
4. **Вверху страницы** найдите две вкладки:
   - **"API Keys"** (новый интерфейс)
   - **"Legacy API Keys"** ← **нажмите на эту вкладку**
5. В разделе **"Project API keys"** вы увидите:
   - `anon` key (публичный)
   - `service_role` key (секретный) ← **это то, что нужно!**
6. Нажмите **"Reveal"** рядом с `service_role` key
7. Скопируйте ключ

## Способ 2: Прямой URL

Попробуйте открыть напрямую:
```
https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/settings/api
```

Это должно открыть старый интерфейс с "Project API keys".

## Способ 3: Через Database

Если в интерфейсе не видно, можно получить через SQL:

1. Откройте **SQL Editor** в Supabase Dashboard
2. Выполните запрос:
```sql
SELECT name, value 
FROM vault.secrets 
WHERE name LIKE '%service_role%';
```

⚠️ **Внимание**: Это работает только если у вас есть доступ к vault.

## Способ 4: Создать новый Secret Key

Если старый ключ недоступен:

1. **Settings** → **API Keys**
2. В секции **"Secret keys"** нажмите **"+ New secret key"**
3. Назовите ключ (например, "Vercel PDF API")
4. Выберите права: **service_role**
5. Скопируйте созданный ключ

## ✅ Как проверить, что это правильный ключ

`service_role` key обычно:
- Начинается с `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Длиннее чем `anon` key
- Имеет полный доступ к проекту (обходит RLS)

## ⚠️ Важно

- **НЕ используйте** `anon` key (публичный ключ)
- **НЕ используйте** `publishable` key (новый интерфейс)
- Используйте **только** `service_role` key для серверных функций

## 📞 Если ничего не помогает

1. Проверьте, что вы вошли в правильный проект
2. Убедитесь, что у вас есть права администратора проекта
3. Попробуйте обновить страницу (Ctrl+F5)
4. Обратитесь в поддержку Supabase

