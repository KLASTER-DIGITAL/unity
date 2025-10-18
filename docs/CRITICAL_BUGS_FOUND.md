# 🔴 КРИТИЧЕСКИЕ БАГИ ПОСЛЕ МИГРАЦИИ

**Дата**: 2025-10-15  
**Статус**: 🔴 КРИТИЧНО - Приложение НЕ работает!  
**Тестирование**: Chrome MCP + Playwright

---

## 🚨 Критические проблемы (блокируют использование)

### 1. ✅ WelcomeScreen - кнопка "Начать" теперь работает (ИСПРАВЛЕНО)

**Проблема**: `TypeError: onNext is not a function`

**Исправление**:
- Изменил `onNext` на `onComplete` в интерфейсе
- Удалил неиспользуемые props (`onSkip`, `currentStep`, `totalSteps`, `onStepClick`)
- Обновил onClick handler

**Результат**: ✅ Переход WelcomeScreen → OnboardingScreen2 работает!

**Файлы**:
- `src/components/WelcomeScreen.tsx` - исправлен

---

### 2. ❌ OnboardingScreen2/3/4 - кнопки НЕ работают

**Проблема**: Кнопки "Skip" и навигации не переключают экраны

**Причина**:
- `OnboardingScreen2/3/4` ожидают props: `onNext`, `onSkip`, `currentStep`, `totalSteps`, `onStepClick`
- Но `MobileApp` передает только: `onComplete`, `selectedLanguage`
- Несоответствие интерфейсов

**Воспроизведение**:
1. Перейти на OnboardingScreen2
2. Нажать "Skip" или кнопки навигации
3. Ничего не происходит

**Приоритет**: 🔴 КРИТИЧЕСКИЙ (блокирует onboarding flow)

**Файлы**:
- `src/components/OnboardingScreen2.tsx:5-12` - неправильный интерфейс
- `src/components/OnboardingScreen3.tsx:5-12` - неправильный интерфейс
- `src/components/OnboardingScreen4.tsx:10-17` - неправильный интерфейс
- `src/app/mobile/MobileApp.tsx:57-59` - передает неправильные props

---

### 3. ❌ Бесконечный цикл загрузки i18n переводов

**Проблема**:
```
[ERROR] Error fetching translations for en: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
[WARNING] Attempt 1/2/3 failed for en
[ERROR] Failed to load translations for en after 3 attempts, using fallback
[LOG] Loading fallback translations for ru
[ERROR] Error fetching translations for ru
[ERROR] Failed to load fallback translations for ru
[LOG] Using builtin fallback translations
[LOG] Changing language from ru to en
[LOG] Loading translations for language: en
... (повторяется бесконечно)
```

**Причина**:
- i18n API возвращает HTML вместо JSON (404 или неправильный endpoint)
- Fallback механизм запускает повторную загрузку
- Создается бесконечный цикл

**Воспроизведение**:
1. Открыть http://localhost:3002/
2. Открыть консоль
3. Видеть сотни ошибок загрузки переводов

**Приоритет**: 🔴 КРИТИЧЕСКИЙ (переполняет консоль, тормозит приложение)

**Файлы**:
- `src/shared/lib/i18n/api.ts` - API запросы
- `src/shared/lib/i18n/loader.ts` - Логика загрузки и fallback
- `src/shared/lib/i18n/TranslationProvider.tsx` - Провайдер

---

### 3. ⚠️ Supabase Edge Function 401 ошибка

**Проблема**:
```
[ERROR] Failed to load resource: the server responded with a status of 401 ()
@ https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/languages
[ERROR] Failed to load languages: 401
```

**Причина**:
- Edge Function требует авторизацию
- Запрос делается без токена
- Или функция не существует/не развернута

**Приоритет**: ⚠️ ВЫСОКИЙ (блокирует динамическую загрузку языков)

**Файлы**:
- `src/components/WelcomeScreen.tsx:152` - Запрос языков
- Supabase Edge Function: `make-server-9729c493/languages`

---

## ⚠️ Важные проблемы (ухудшают UX)

### 4. ⚠️ Кнопка "Начать" не переводится на английский

**Проблема**:
- Язык меняется: "Создавай дневник побед" → "Create a victory diary" ✅
- Но кнопка остается "Начать" вместо "Start" ❌

**Причина**:
```
[WARNING] Using fallback translation for key: start_button
```

**Приоритет**: ⚠️ СРЕДНИЙ (UX проблема)

**Файлы**:
- `src/components/WelcomeScreen.tsx` - Использует ключ `start_button`
- Builtin fallback translations - Отсутствует перевод для `start_button`

---

### 5. ⚠️ Неправильная логика проверки сессии

**Проблема** (ИСПРАВЛЕНО):
- `checkSession()` возвращает `{success: false}` при отсутствии сессии
- Код проверял `if (session)` - объект truthy, даже если `success: false`
- Приложение пропускало WelcomeScreen и сразу показывало OnboardingScreen2

**Исправление**:
```typescript
// Было:
if (session) { ... }

// Стало:
if (session && session.success !== false && session.user) { ... }
```

**Статус**: ✅ ИСПРАВЛЕНО в `src/App.tsx:47`

---

### 6. ⚠️ TranslationProvider отсутствовал для onboarding screens

**Проблема** (ИСПРАВЛЕНО):
```
Error: useTranslationContext must be used within TranslationProvider
```

**Причина**:
- `WelcomeScreen` использует `useTranslation`
- Но не был обернут в `TranslationProvider`

**Исправление**:
- Обернул onboarding screens в `TranslationProvider` в `MobileApp.tsx:51-64`

**Статус**: ✅ ИСПРАВЛЕНО

---

## 📊 Статистика тестирования

**Тестировано**:
- ✅ WelcomeScreen загружается
- ✅ Селектор языков открывается
- ✅ Переключение языка работает (частично)
- ❌ Кнопка "Начать" НЕ работает
- ❌ Переход к OnboardingScreen2 НЕ работает
- ❌ i18n API НЕ работает (бесконечный цикл)

**Скриншоты**:
- `test-screenshots/01-initial-load.png` - Первая загрузка (показывал OnboardingScreen2 вместо WelcomeScreen)
- `test-screenshots/02-welcome-screen-fixed.png` - WelcomeScreen после исправления
- `test-screenshots/03-language-selector-opened.png` - Селектор языков
- `test-screenshots/04-english-selected.png` - Английский язык выбран
- `test-screenshots/05-onboarding-screen-2.png` - Не удалось перейти (ошибка)

**Консольные ошибки**:
- 🔴 `TypeError: onNext is not a function` - КРИТИЧНО
- 🔴 Бесконечный цикл i18n ошибок - КРИТИЧНО
- ⚠️ 401 ошибка Supabase Edge Function - ВЫСОКИЙ
- ⚠️ Отсутствующие переводы - СРЕДНИЙ

---

## 🔧 План исправления

### Приоритет 1 (КРИТИЧНО - сегодня)

1. **Исправить WelcomeScreen prop**:
   - Изменить `onNext` на `onComplete` в `WelcomeScreen.tsx`
   - ИЛИ изменить `onComplete` на `onNext` в `MobileApp.tsx`
   - Проверить все onboarding screens на соответствие интерфейсов

2. **Остановить бесконечный цикл i18n**:
   - Добавить флаг для предотвращения повторных попыток
   - Исправить API endpoint (проверить URL)
   - Добавить debounce для загрузки переводов
   - Улучшить builtin fallback translations

3. **Исправить Supabase Edge Function**:
   - Проверить существование функции
   - Добавить авторизацию к запросу
   - ИЛИ использовать альтернативный метод загрузки языков

### Приоритет 2 (ВЫСОКИЙ - завтра)

4. **Добавить недостающие переводы**:
   - Добавить `start_button` в builtin fallback
   - Проверить все ключи переводов
   - Создать полный набор fallback переводов

5. **Протестировать весь onboarding flow**:
   - WelcomeScreen → OnboardingScreen2 → OnboardingScreen3 → OnboardingScreen4 → AuthScreen
   - Проверить все кнопки и переходы
   - Проверить все переводы

### Приоритет 3 (СРЕДНИЙ - эта неделя)

6. **Протестировать основное приложение**:
   - Авторизация (с тестовыми данными из pass.md)
   - Главный экран (AchievementHomeScreen)
   - История (HistoryScreen)
   - Достижения (AchievementsScreen)
   - Отчеты (ReportsScreen)
   - Настройки (SettingsScreen)

7. **Протестировать админ-панель**:
   - Переход на `?view=admin`
   - Авторизация админа
   - AdminDashboard
   - Все табы

---

## 📋 Чеклист перед деплоем

- [ ] Исправить критические баги (1-3)
- [ ] Протестировать весь onboarding flow
- [ ] Протестировать авторизацию
- [ ] Протестировать все основные экраны
- [ ] Протестировать админ-панель
- [ ] Проверить i18n для всех языков
- [ ] Проверить PWA функционал
- [ ] Проверить responsive design
- [ ] Проверить производительность
- [ ] Создать финальный отчет

---

**Вывод**: Миграция НЕ готова к деплою! Требуется исправление критических багов.

**Следующий шаг**: Исправить баги 1-3 и повторить тестирование.

