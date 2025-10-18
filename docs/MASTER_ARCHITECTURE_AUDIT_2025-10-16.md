# 🏗️ MASTER ARCHITECTURE AUDIT - 2025-10-16

## 🎯 ЦЕЛЬ АУДИТА

Провести полный аудит архитектуры проекта UNITY-v2, выявить проблемы и создать правильный план оптимизации.

---

## ❌ КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### 1. **МОНОЛИТНАЯ EDGE FUNCTION** 🚨

**Файл**: `supabase/functions/make-server-9729c493/index.ts`
- **Размер**: 69,937 bytes (2,291 строк)
- **Проблема**: Нарушает принцип микросервисов
- **Последствия**:
  - Сложность деплоя (не проходит через Supabase MCP)
  - Сложность поддержки
  - Невозможность масштабирования
  - Дублирование кода

**Содержит**:
- ✅ OpenAI usage logging
- ✅ Voice transcription (Whisper API)
- ✅ Media upload
- ✅ AI analysis
- ✅ Profile management
- ✅ Entries management
- ✅ Motivation cards
- ✅ Admin API
- ✅ Admin settings
- ✅ Supported languages
- ✅ Translations API
- ✅ Public i18n endpoints
- ✅ Admin i18n endpoints

**Должно быть разделено на**:
1. `ai-analysis` - AI анализ текста
2. `transcription` - Whisper API
3. `media` - Загрузка медиа
4. `profiles` - Управление профилями (УЖЕ СОЗДАН ✅)
5. `entries` - Управление записями (УЖЕ СОЗДАН ✅)
6. `motivations` - Мотивационные карточки
7. `admin-api` - Админ панель (УЖЕ СОЗДАН ✅)
8. `translations-api` - Переводы (УЖЕ СОЗДАН ✅)
9. `stats` - Статистика (УЖЕ СОЗДАН ✅)

---

### 2. **ДУБЛИРОВАНИЕ EDGE FUNCTIONS** 🔄

**Проблема**: Существуют микросервисы, но монолитная функция все еще используется!

**Развернутые Edge Functions**:
1. ✅ `make-server-9729c493` (v38) - МОНОЛИТ (2,291 строк)
2. ✅ `translations-api` (v6) - Микросервис
3. ✅ `admin-api` (v3) - Микросервис
4. ✅ `telegram-auth` (v22) - Микросервис
5. ✅ `stats` (v1, slug: quick-endpoint) - Микросервис
6. ✅ `profiles` (v1) - Микросервис
7. ✅ `entries` (v1) - Микросервис

**Проблема**: Фронтенд использует `API_BASE_URL` который указывает на `make-server-9729c493`!

**Файл**: `src/utils/api.ts`
```typescript
const API_BASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493';
```

**Последствия**:
- Микросервисы `profiles` и `entries` НЕ используются
- Все запросы идут через монолит
- Дублирование логики

---

### 3. **OPENAI API KEY ЛОГИКА** 🔑

**Текущая реализация**:
```
Супер-админ → Админ-панель → Сохраняет ключ в admin_settings
                                    ↓
                            Все пользователи используют этот ключ
                                    ↓
                            Логирование в openai_usage (по user_id)
                                    ↓
                            Админ видит затраты по каждому пользователю
```

**Проблема**: Edge Function НЕ читает ключ из `admin_settings`!

**Текущий код** (НЕПРАВИЛЬНО):
```typescript
const openaiApiKey = c.req.header('X-OpenAI-Key') || Deno.env.get('OPENAI_API_KEY');
```

**Правильный код** (ИСПРАВЛЕНО):
```typescript
let openaiApiKey = c.req.header('X-OpenAI-Key');

if (!openaiApiKey) {
  const { data: setting } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'openai_api_key')
    .single();
  
  if (setting?.value) {
    openaiApiKey = setting.value;
  } else {
    openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  }
}
```

**Статус**: ✅ Исправлено в локальном файле, НО НЕ ЗАДЕПЛОЕНО!

---

### 4. **БАЗА ДАННЫХ** 📊

**Таблицы** (13 total):
1. ✅ `profiles` - Профили пользователей (5 записей)
2. ✅ `entries` - Записи дневника (7 записей)
3. ✅ `admin_settings` - Настройки админа (3 записи, включая OpenAI ключ)
4. ✅ `openai_usage` - Логи использования OpenAI (1 запись)
5. ✅ `openai_usage_stats` - Статистика использования (0 записей)
6. ✅ `translations` - Переводы (791 запись)
7. ✅ `translation_keys` - Ключи переводов (9 записей)
8. ✅ `languages` - Языки (8 записей)
9. ✅ `supported_languages` - Поддерживаемые языки (7 записей)
10. ✅ `entry_summaries` - Резюме записей (0 записей) ⚠️ НЕ ИСПОЛЬЗУЕТСЯ
11. ✅ `books_archive` - Архив книг (0 записей) ⚠️ НЕ ИСПОЛЬЗУЕТСЯ
12. ✅ `story_snapshots` - Снимки историй (0 записей) ⚠️ НЕ ИСПОЛЬЗУЕТСЯ
13. ✅ `kv_store_9729c493` - KV хранилище (43 записи)

**Проблемы**:
- ❌ `entry_summaries` не заполняется при создании записи
- ❌ `books_archive` и `story_snapshots` не используются (PDF генерация не реализована)
- ⚠️ Дублирование языков: `languages` и `supported_languages`

---

## 📋 ПОЛНЫЙ СЦЕНАРИЙ ПОЛЬЗОВАТЕЛЯ

### 1. **Onboarding Flow** ✅

```
WelcomeScreen (выбор языка)
    ↓
OnboardingScreen2 (о приложении)
    ↓
OnboardingScreen3 (название дневника + эмодзи)
    ↓
OnboardingScreen4 (напоминания + первая запись)
    ↓
AuthScreen (регистрация)
    ↓ signUpWithEmail()
    ↓
Edge Function: /make-server-9729c493/profiles/create
    ↓ Создает профиль в profiles table
    ↓
Edge Function: /make-server-9729c493/analyze (AI анализ первой записи)
    ↓ Читает OpenAI ключ из admin_settings ✅
    ↓ Вызывает OpenAI GPT-4 API
    ↓ Логирует в openai_usage
    ↓
Edge Function: /make-server-9729c493/entries (создание записи)
    ↓ Сохраняет в entries table с AI-анализом
    ↓
AchievementHomeScreen (главный экран)
```

**Статус**: ✅ Работает, НО использует монолит

---

### 2. **Создание новой записи** ✅

```
ChatInputSection
    ↓ analyzeTextWithAI()
    ↓
Edge Function: /make-server-9729c493/analyze
    ↓ AI анализ
    ↓
createEntry()
    ↓
Edge Function: /make-server-9729c493/entries
    ↓ Сохранение в БД
    ↓
getMotivationCards()
    ↓ Генерация карточек из AI-анализа
```

**Статус**: ✅ Работает, НО использует монолит

---

### 3. **PDF генерация книги** ❌ НЕ РЕАЛИЗОВАНО

```
ReportsScreen
    ↓ generateBookDraft()
    ↓
Edge Function: /books/generate-draft (НЕ СУЩЕСТВУЕТ)
    ↓ Компиляция записей
    ↓ AI генерация истории
    ↓ Сохранение в books_archive
    ↓
BookDraftEditor
    ↓ Редактирование
    ↓
renderBookPDF()
    ↓
Edge Function: /books/{draftId}/render-pdf (НЕ СУЩЕСТВУЕТ)
    ↓ HTML → CSS → PDF
    ↓ Сохранение в Storage
```

**Статус**: ❌ НЕ РЕАЛИЗОВАНО

---

## 🎯 ПРАВИЛЬНЫЙ ПЛАН ДЕЙСТВИЙ

### **ПРИОРИТЕТ 1: РАЗДЕЛИТЬ МОНОЛИТ** 🚨

**Цель**: Разделить `make-server-9729c493` на микросервисы

**Шаги**:
1. Создать микросервис `ai-analysis` (AI анализ + Whisper)
2. Создать микросервис `motivations` (мотивационные карточки)
3. Создать микросервис `media` (загрузка медиа)
4. Обновить фронтенд для использования микросервисов
5. Удалить монолитную функцию

**Срок**: 3 дня

---

### **ПРИОРИТЕТ 2: ИСПРАВИТЬ OPENAI KEY** 🔑

**Цель**: Задеплоить исправленную логику чтения ключа из БД

**Шаги**:
1. Создать микросервис `ai-analysis` с правильной логикой
2. Задеплоить через Supabase MCP
3. Обновить фронтенд для использования нового endpoint
4. Протестировать с Chrome MCP

**Срок**: 1 день

---

### **ПРИОРИТЕТ 3: ТЕСТИРОВАНИЕ** 🧪

**Цель**: Протестировать полный сценарий с Chrome MCP

**Шаги**:
1. Тестировать onboarding flow
2. Тестировать создание записи с AI
3. Тестировать мотивационные карточки
4. Проверить логирование в openai_usage
5. Проверить затраты по пользователям

**Срок**: 1 день

---

### **ПРИОРИТЕТ 4: PDF ГЕНЕРАЦИЯ** 📚

**Цель**: Реализовать генерацию PDF книг

**Шаги**:
1. Создать микросервис `books`
2. Реализовать `/books/generate-draft`
3. Реализовать `/books/{draftId}/render-pdf`
4. Создать UI для редактирования черновика
5. Протестировать полный flow

**Срок**: 5 дней

---

## 📊 ИТОГОВАЯ СТАТИСТИКА

### Текущее состояние:
- ✅ Edge Functions: 7 (1 монолит + 6 микросервисов)
- ❌ Монолит: 2,291 строк (НУЖНО РАЗДЕЛИТЬ)
- ✅ База данных: 13 таблиц
- ⚠️ Неиспользуемые таблицы: 3 (entry_summaries, books_archive, story_snapshots)
- ✅ OpenAI ключ: Сохранен в admin_settings
- ❌ OpenAI ключ: НЕ читается из БД (НУЖНО ИСПРАВИТЬ)

### Целевое состояние:
- ✅ Edge Functions: 12 микросервисов (каждый < 500 строк)
- ✅ Монолит: УДАЛЕН
- ✅ База данных: Все таблицы используются
- ✅ OpenAI ключ: Читается из admin_settings
- ✅ PDF генерация: Реализована

---

**СЛЕДУЮЩИЙ ШАГ**: Создать детальный план задач с приоритетами

