# 🚀 Инструкция по деплою Edge Function

## ✅ ЧТО СДЕЛАНО

### 1. **Исправлен WelcomeScreen** ✅
- Для новых пользователей теперь показывается экран выбора языка
- Файл: `src/App.tsx` строка 293-298

### 2. **Исправлен множественный рендеринг OnboardingScreen2** ✅
- Убрана сложная анимация с 4 слоями
- Используется простой slide transition
- Файл: `src/App.tsx` строки 746-763

### 3. **Проверен Edge Function** ⚠️
- Функция существует и активна (версия 11)
- **НО!** Развернута старая версия без новых AI полей
- Нужно задеплоить обновленную версию из `src/supabase/functions/server/`

---

## 🐛 ТЕКУЩАЯ ПРОБЛЕМА

**Edge Function содержит старую версию кода** без поддержки:
- `summary` - краткое резюме для карточки
- `insight` - позитивный вывод
- `mood` - настроение
- `isAchievement` - флаг достижения
- `X-OpenAI-Key` header для ключа из админ-панели
- Мультиязычности (userId для определения языка)

## 📋 КАК ЗАДЕПЛОИТЬ

### **Вариант 1: Через Supabase CLI (рекомендуется)**

```bash
cd /Users/rustamkarimov/DEV/UNITY

# 1. Подключиться к проекту (если еще не подключен)
supabase link --project-ref ecuwuzqlwdkkdncampnc

# Введите Database Password когда попросит
# Пароль можно найти в Supabase Dashboard > Settings > Database

# 2. Деплоить функцию
supabase functions deploy make-server-9729c493 \
  --project-ref ecuwuzqlwdkkdncampnc

# 3. Проверить статус
supabase functions list --project-ref ecuwuzqlwdkkdncampnc

# 4. Посмотреть логи
supabase functions logs make-server-9729c493 \
  --project-ref ecuwuzqlwdkkdncampnc
```

### **Вариант 2: Через Supabase Dashboard**

1. Открыть https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc/functions
2. Найти функцию `make-server-9729c493`
3. Нажать "Edit Function"
4. Скопировать содержимое из:
   - `src/supabase/functions/server/index.tsx`
   - `src/supabase/functions/server/kv_store.tsx`
5. Нажать "Deploy"

### **Вариант 3: Проверить secrets**

```bash
# Проверить какие secrets установлены
supabase secrets list --project-ref ecuwuzqlwdkkdncampnc

# Установить OPENAI_API_KEY если нужно
supabase secrets set OPENAI_API_KEY=<your-key> \
  --project-ref ecuwuzqlwdkkdncampnc
```

---

## 🔍 ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ

### 1. **Проверить health endpoint**
```bash
curl https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "timestamp": "2025-10-12T..."
}
```

### 2. **Проверить AI анализ**
```bash
curl -X POST https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/chat/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <anon-key>" \
  -d '{
    "text": "Сегодня пробежал 5 км!",
    "userName": "Test",
    "userId": "test-user-id"
  }'
```

Ожидаемый ответ должен содержать:
```json
{
  "success": true,
  "analysis": {
    "reply": "...",
    "summary": "...",    // <- НОВОЕ ПОЛЕ
    "insight": "...",    // <- НОВОЕ ПОЛЕ
    "sentiment": "positive",
    "category": "...",
    "tags": ["..."],
    "confidence": 0.95,
    "isAchievement": true,  // <- НОВОЕ ПОЛЕ
    "mood": "..."           // <- НОВОЕ ПОЛЕ
  }
}
```

### 3. **Проверить логи**
```bash
supabase functions logs make-server-9729c493 \
  --project-ref ecuwuzqlwdkkdncampnc \
  --limit 50
```

Ищите в логах:
- ✅ `User language: ru` (или другой язык)
- ✅ `Using OpenAI API key from: admin panel` (если ключ из админки)
- ✅ `OpenAI response: ...` с новыми полями
- ❌ Ошибки парсинга JSON
- ❌ Ошибки OpenAI API

---

## 📊 ОЖИДАЕМЫЕ ИЗМЕНЕНИЯ

После деплоя:

### **Frontend (уже готово) ✅**
- `src/utils/api.ts` - расширенные интерфейсы
- `src/components/ChatInputSection.tsx` - сохранение новых полей
- `src/components/screens/AchievementHomeScreen.tsx` - использование aiSummary/aiInsight
- `src/App.tsx` - сохранение первой записи с AI анализом

### **Backend (требует деплоя) ⚠️**
- `/chat/analyze` - новый prompt с 9 полями
- Поддержка `X-OpenAI-Key` header
- Определение языка пользователя из профиля
- Форсированный JSON output (`response_format`)
- Увеличено `max_tokens` до 500

---

## 🎯 ТЕСТИРОВАНИЕ ПОСЛЕ ДЕПЛОЯ

### **Полный тест:**

1. ✅ Открыть http://localhost:3001
2. ✅ Очистить localStorage
3. ✅ Пройти onboarding:
   - Выбрать язык (Русский)
   - Заполнить мотивацию
   - Выбрать emoji дневника
   - Настроить напоминания
   - Написать первую запись
4. ✅ Зарегистрироваться (test2@leadshunter.biz)
5. ✅ Попасть на главный экран
6. ✅ Проверить карточки мотивации:
   - Должны отображаться с `aiSummary` (title)
   - Должны отображаться с `aiInsight` (description)
7. ✅ Создать новую запись
8. ✅ Проверить консоль:
   - Не должно быть ошибок
   - API запросы успешны
   - AI возвращает все поля

### **Проверка консоли:**
```javascript
// В Chrome DevTools > Console
localStorage.getItem('admin_openai_api_key') // должен вернуть ключ если установлен
```

---

## 🔧 TROUBLESHOOTING

### **Проблема: ERR_FAILED при запросах**
**Причина:** Edge Function не отвечает или CORS проблема  
**Решение:**
```bash
# Проверить статус функции
supabase functions list --project-ref ecuwuzqlwdkkdncampnc

# Проверить логи
supabase functions logs make-server-9729c493 --project-ref ecuwuzqlwdkkdncampnc

# Редеплоить если нужно
supabase functions deploy make-server-9729c493 --project-ref ecuwuzqlwdkkdncampnc --no-verify-jwt
```

### **Проблема: OpenAI API key not configured**
**Причина:** Не установлен ключ в Supabase Secrets  
**Решение:**
```bash
supabase secrets set OPENAI_API_KEY=<your-key> --project-ref ecuwuzqlwdkkdncampnc
```

### **Проблема: AI не возвращает новые поля**
**Причина:** Развернута старая версия функции  
**Решение:** Задеплоить обновленную версию (см. выше)

### **Проблема: Карточки показывают category вместо aiSummary**
**Причина:** Backend не возвращает новые поля  
**Решение:** Убедитесь что Edge Function обновлен и проверьте логи

---

## 📝 ВАЖНЫЕ ФАЙЛЫ

### **Backend (Edge Function):**
- `/Users/rustamkarimov/DEV/UNITY/src/supabase/functions/server/index.tsx` - основной файл
- `/Users/rustamkarimov/DEV/UNITY/src/supabase/functions/server/kv_store.tsx` - KV store helper

### **Frontend:**
- `/Users/rustamkarimov/DEV/UNITY/src/utils/api.ts` - API клиент
- `/Users/rustamkarimov/DEV/UNITY/src/components/ChatInputSection.tsx` - создание записей
- `/Users/rustamkarimov/DEV/UNITY/src/components/screens/AchievementHomeScreen.tsx` - карточки
- `/Users/rustamkarimov/DEV/UNITY/src/App.tsx` - главная логика

### **Конфигурация:**
- `/.cursor/mcp.json` - Supabase MCP config
- `/TESTING_REPORT_2025-10-12.md` - детальный отчет тестирования
- `/FINAL_RECOMMENDATIONS.md` - рекомендации
- `/CODE_CLEANUP_AND_OPTIMIZATION.md` - оптимизации

---

## ✅ ЧЕКЛИСТ ДЕПЛОЯ

- [ ] 1. Подключиться к проекту через Supabase CLI
- [ ] 2. Задеплоить Edge Function с обновленным кодом
- [ ] 3. Проверить health endpoint (curl)
- [ ] 4. Проверить логи функции
- [ ] 5. Проверить AI анализ через curl
- [ ] 6. Очистить localStorage в браузере
- [ ] 7. Пройти полный onboarding flow
- [ ] 8. Зарегистрировать test2@leadshunter.biz
- [ ] 9. Проверить карточки мотивации
- [ ] 10. Создать новую запись
- [ ] 11. Проверить консоль на ошибки
- [ ] 12. Проверить все вкладки (История, Достижения, Отчеты, Настройки)

---

**Дата:** 2025-10-12  
**Статус:** Готово к деплою  
**Приоритет:** P0 - КРИТИЧЕСКИЙ  
**Ожидаемое время:** 10-15 минут

