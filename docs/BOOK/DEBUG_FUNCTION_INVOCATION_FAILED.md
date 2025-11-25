<!-- Debug guide for function invocation failures -->
# 🔍 Отладка ошибки FUNCTION_INVOCATION_FAILED

**Дата**: 2025-01-30  
**Ошибка**: `A server error has occurred FUNCTION_INVOCATION_FAILED`

## 🔴 Проблема

После сохранения книги возникает ошибка:
```
Произошла ошибка при создании PDF
A server error has occurred FUNCTION_INVOCATION_FAILED
fra1::hzrqv-1763957122417-162953c3373e
```

## 🔍 Причины

Ошибка `FUNCTION_INVOCATION_FAILED` в Vercel может возникать по нескольким причинам:

### 1. Отсутствие переменных окружения
- `SUPABASE_SERVICE_ROLE_KEY` не настроен в Vercel
- Или настроен неправильно

### 2. Проблема с Puppeteer/Chromium
- Не удается запустить браузер
- Timeout при генерации PDF
- Недостаточно памяти

### 3. Timeout функции
- Vercel Hobby plan: 10 секунд timeout
- Для больших книг может не хватить времени

### 4. Ошибка в коде
- Необработанное исключение
- Проблема с импортами

## ✅ Решение

### Шаг 1: Проверьте переменные окружения в Vercel

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите проект `unity-v2`
3. Перейдите в **Settings** → **Environment Variables**
4. Убедитесь что есть:
   - ✅ `VITE_SUPABASE_URL` = `https://ecuwuzqlwdkkdncampnc.supabase.co`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**Важно**: Переменная должна называться именно `SUPABASE_SERVICE_ROLE_KEY` (не `pdfgen`, не `SUPABASE_SERVICE_KEY`)

### Шаг 2: Проверьте логи Vercel

1. В Vercel Dashboard → **Deployments**
2. Выберите последний деплой
3. Перейдите в **Functions** → `/api/books/render-pdf`
4. Откройте **Logs**
5. Ищите префикс `[VERCEL-PDF]` в логах

**Что искать**:
- `[VERCEL-PDF] Request received` - функция запустилась
- `[VERCEL-PDF] Supabase configured` - переменные окружения доступны
- `[VERCEL-PDF] Launching browser...` - запуск браузера
- `[VERCEL-PDF] Browser launched successfully` - браузер запущен
- `[VERCEL-PDF] PDF generated` - PDF создан
- `[VERCEL-PDF] Error:` - ошибка на каком-то этапе

### Шаг 3: Частые ошибки и решения

#### Ошибка: "Supabase configuration missing"
**Решение**: Добавьте `SUPABASE_SERVICE_ROLE_KEY` в Vercel Environment Variables

#### Ошибка: "Failed to launch browser"
**Причина**: Проблема с Puppeteer/Chromium
**Решение**: 
- Проверьте логи Vercel для деталей
- Убедитесь что `@sparticuz/chromium` установлен в `package.json`
- Проверьте что функция не превышает лимит памяти

#### Ошибка: "Function timeout"
**Причина**: Генерация PDF занимает больше 10 секунд (Hobby plan)
**Решение**:
- Уменьшите размер книги
- Или перейдите на Pro plan (60 секунд timeout)

#### Ошибка: "Memory limit exceeded"
**Причина**: Недостаточно памяти для Puppeteer
**Решение**:
- Уменьшите размер HTML (меньше контента в книге)
- Или перейдите на Pro plan (больше памяти)

### Шаг 4: Проверьте Trace ID

Если видите Trace ID в ошибке (например, `fra1::hzrqv-1763957122417-162953c3373e`):

1. В Vercel Dashboard → **Deployments**
2. Найдите деплой с этим временем
3. Проверьте логи для этого деплоя
4. Ищите ошибки с этим Trace ID

## 🛠️ Улучшения в коде

Я добавил детальное логирование на каждом этапе:

1. ✅ Логирование начала запроса
2. ✅ Проверка переменных окружения с детальными сообщениями
3. ✅ Логирование запуска браузера
4. ✅ Логирование каждого этапа генерации PDF
5. ✅ Улучшенная обработка ошибок с гарантированным закрытием browser/page
6. ✅ Детальные сообщения об ошибках

## 📝 Следующие шаги

После проверки переменных окружения и логов:

1. Если проблема в переменных окружения → добавьте их и перезапустите деплой
2. Если проблема в Puppeteer → проверьте логи для деталей
3. Если проблема в timeout → рассмотрите переход на Pro plan
4. Если проблема в коде → проверьте логи для конкретной ошибки

## 🔗 Полезные ссылки

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Function Logs](https://vercel.com/docs/concepts/functions/serverless-functions#logs)
- [Vercel Function Limits](https://vercel.com/docs/concepts/functions/serverless-functions#limits)


