# 🎯 ПЛАН ДЕЙСТВИЙ - 2025-10-16

## 📊 ТЕКУЩАЯ СИТУАЦИЯ

### ✅ ЧТО РАБОТАЕТ:
1. ✅ Onboarding flow (WelcomeScreen → OnboardingScreen2/3/4 → AuthScreen → AchievementHomeScreen)
2. ✅ Создание профиля через прямой запрос к Supabase
3. ✅ Создание первой записи через прямой запрос к Supabase
4. ✅ Отображение имени пользователя ("Привет Максим")
5. ✅ Статистика (totalEntries, currentStreak)
6. ✅ Лента записей (RecentEntriesFeed)
7. ✅ OpenAI ключ сохранен в admin_settings (sk-...lAMA)

### ❌ ЧТО НЕ РАБОТАЕТ:
1. ❌ AI-анализ первой записи (ai_summary, ai_insight = null)
2. ❌ Мотивационные карточки из AI-анализа (показываются только дефолтные)
3. ❌ OpenAI ключ НЕ читается из admin_settings (исправлено локально, НО НЕ ЗАДЕПЛОЕНО)
4. ❌ Монолитная Edge Function (2,291 строк) вместо микросервисов

---

## 🚨 КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### 1. **МОНОЛИТНАЯ EDGE FUNCTION**
- **Файл**: `supabase/functions/make-server-9729c493/index.ts`
- **Размер**: 69,937 bytes (2,291 строк)
- **Проблема**: Нарушает принцип микросервисов, сложно деплоить через Supabase MCP

### 2. **OPENAI KEY НЕ ЧИТАЕТСЯ ИЗ БД**
- **Проблема**: Edge Function использует `c.req.header('X-OpenAI-Key') || Deno.env.get('OPENAI_API_KEY')`
- **Последствие**: Обычные пользователи НЕ могут использовать AI (нет доступа к localStorage)
- **Решение**: Читать ключ из `admin_settings` таблицы

### 3. **ДУБЛИРОВАНИЕ EDGE FUNCTIONS**
- **Проблема**: Существуют микросервисы `profiles` и `entries`, НО фронтенд использует монолит
- **Файл**: `src/utils/api.ts` → `API_BASE_URL` указывает на `make-server-9729c493`

---

## 🎯 ПРИОРИТЕТЫ

### **ПРИОРИТЕТ 1: OPENAI KEY** 🔑 (СЕЙЧАС)

**Цель**: Задеплоить исправленную логику чтения OpenAI ключа из БД

**Задачи**:
- [/] 2.1 Создать микросервис `ai-analysis` с правильной логикой
- [ ] 2.2 Обновить `src/utils/auth.ts` для использования нового endpoint
- [ ] 2.3 Протестировать с Chrome MCP
- [ ] 2.4 Проверить логирование в `openai_usage`

**Срок**: 1 день

---

### **ПРИОРИТЕТ 2: РАЗДЕЛИТЬ МОНОЛИТ** 🏗️

**Цель**: Разделить монолитную функцию на микросервисы

**Задачи**:
- [ ] 1.1 Создать микросервис `ai-analysis` (AI анализ + Whisper)
- [ ] 1.2 Создать микросервис `motivations` (мотивационные карточки)
- [ ] 1.3 Создать микросервис `media` (загрузка медиа)
- [ ] 1.4 Обновить фронтенд для использования микросервисов
- [ ] 1.5 Удалить монолитную функцию

**Срок**: 3 дня

---

### **ПРИОРИТЕТ 3: ТЕСТИРОВАНИЕ** 🧪

**Цель**: Протестировать полный сценарий с Chrome MCP

**Задачи**:
- [ ] Тестировать onboarding flow
- [ ] Тестировать создание записи с AI
- [ ] Тестировать мотивационные карточки
- [ ] Проверить логирование в openai_usage
- [ ] Проверить затраты по пользователям

**Срок**: 1 день

---

### **ПРИОРИТЕТ 4: PDF ГЕНЕРАЦИЯ** 📚

**Цель**: Реализовать генерацию PDF книг

**Задачи**:
- [ ] Создать микросервис `books`
- [ ] Реализовать `/books/generate-draft`
- [ ] Реализовать `/books/{draftId}/render-pdf`
- [ ] Создать UI для редактирования черновика
- [ ] Протестировать полный flow

**Срок**: 5 дней

---

### **ПРИОРИТЕТ 5: ОПТИМИЗАЦИЯ БД** 🗄️

**Цель**: Оптимизировать базу данных

**Задачи**:
- [ ] Удалить дублирующиеся таблицы (languages vs supported_languages)
- [ ] Начать использовать entry_summaries
- [ ] Начать использовать books_archive
- [ ] Начать использовать story_snapshots

**Срок**: 2 дня

---

## 📋 СЛЕДУЮЩИЕ ШАГИ (СЕЙЧАС)

### ШАГ 1: Создать микросервис `ai-analysis`

**Файл**: `supabase/functions/ai-analysis/index.ts`

**Endpoints**:
1. `POST /ai-analysis/analyze` - AI анализ текста
2. `POST /ai-analysis/transcribe` - Whisper API транскрипция

**Логика чтения OpenAI ключа**:
```typescript
// Приоритет: 1) Header, 2) БД (admin_settings), 3) Env
let openaiApiKey = c.req.header('X-OpenAI-Key');

if (!openaiApiKey) {
  const { data: setting } = await supabase
    .from('admin_settings')
    .select('value')
    .eq('key', 'openai_api_key')
    .single();
  
  if (setting?.value) {
    openaiApiKey = setting.value;
    console.log('Using OpenAI key from admin_settings');
  } else {
    openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  }
}
```

**Логирование**:
```typescript
await supabase.from('openai_usage').insert({
  user_id: userId,
  operation_type: 'ai_card',
  model: 'gpt-4',
  prompt_tokens: usage.prompt_tokens,
  completion_tokens: usage.completion_tokens,
  total_tokens: usage.total_tokens,
  estimated_cost: estimatedCost
});
```

---

### ШАГ 2: Задеплоить через Supabase MCP

```typescript
deploy_edge_function_supabase({
  project_id: 'ecuwuzqlwdkkdncampnc',
  name: 'ai-analysis',
  files: [
    { name: 'index.ts', content: '...' }
  ]
});
```

---

### ШАГ 3: Обновить фронтенд

**Файл**: `src/utils/auth.ts`

```typescript
// Было:
await createEntry({
  userId: data.user.id,
  text: userData.firstEntry.trim(),
  sentiment: 'positive',
  category: 'Другое',
  mood: 'хорошее'
});

// Стало:
const analysis = await analyzeTextWithAI(
  userData.firstEntry.trim(),
  userData.name,
  data.user.id
);

await createEntry({
  userId: data.user.id,
  text: userData.firstEntry.trim(),
  sentiment: analysis.sentiment,
  category: analysis.category,
  tags: analysis.tags,
  aiReply: analysis.reply,
  aiSummary: analysis.summary,
  aiInsight: analysis.insight,
  isAchievement: analysis.isAchievement,
  mood: analysis.mood
});
```

**Файл**: `src/utils/api.ts`

```typescript
// Было:
const API_BASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493';

// Стало:
const AI_ANALYSIS_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/ai-analysis';

export async function analyzeTextWithAI(text: string, userName?: string, userId?: string): Promise<AIAnalysisResult> {
  const response = await fetch(`${AI_ANALYSIS_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({ text, userName, userId })
  });
  
  // ...
}
```

---

### ШАГ 4: Протестировать с Chrome MCP

1. Открыть Chrome MCP
2. Перейти на http://localhost:3000/
3. Создать нового пользователя (test_ai_2025@leadshunter.biz)
4. Пройти onboarding с первой записью
5. Проверить консоль на ошибки
6. Проверить что ai_summary и ai_insight заполнены
7. Проверить что мотивационная карточка создана из AI-анализа
8. Проверить запись в openai_usage таблице

---

## 📊 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

### После ПРИОРИТЕТА 1:
- ✅ AI-анализ работает для всех пользователей
- ✅ OpenAI ключ читается из admin_settings
- ✅ Первая запись создается с ai_summary и ai_insight
- ✅ Мотивационная карточка генерируется из AI-анализа
- ✅ Логирование в openai_usage работает
- ✅ Админ видит затраты по каждому пользователю

### После ПРИОРИТЕТА 2:
- ✅ Монолитная функция разделена на микросервисы
- ✅ Каждый микросервис < 500 строк
- ✅ Фронтенд использует микросервисы
- ✅ Деплой через Supabase MCP работает

### После ПРИОРИТЕТА 3:
- ✅ Полный сценарий протестирован
- ✅ Все ошибки исправлены
- ✅ Документация обновлена

---

## 🎯 НАЧИНАЕМ С ПРИОРИТЕТА 1!

**Следующий шаг**: Создать микросервис `ai-analysis` с правильной логикой чтения OpenAI ключа из БД.

