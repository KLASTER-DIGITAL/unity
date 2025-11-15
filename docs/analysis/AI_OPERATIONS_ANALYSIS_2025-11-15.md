# AI Operations Analysis - Текущее состояние

**Дата**: 2025-11-15  
**Цель**: Проанализировать текущее состояние AI операций для миграции в AI Control Center

---

## 🎯 Текущие AI операции

### 1. **entry_analysis** - Анализ записи

**Где используется**: `supabase/functions/ai-analysis/index.ts`

**Текущая реализация**:
- **Модель**: `gpt-4o-mini` (хардкод, строка 211)
- **Max tokens**: `1000` (хардкод, строка 227)
- **Temperature**: `0.7` (хардкод, строка 226)
- **Response format**: `json_object` (хардкод, строка 228)

**System Prompt** (строки 192-207):
```
Ты - AI-ассистент для дневника достижений. Твоя задача - анализировать записи пользователей и предоставлять мотивационные ответы.

Пользователь: ${finalUserName}
Язык: ${finalUserLanguage}

Проанализируй запись и верни JSON с полями:
- sentiment: "positive", "neutral", "negative"
- category: одна из категорий (семья, работа, финансы, благодарность, здоровье, личное развитие, творчество, отношения, другое)
- tags: массив тегов (максимум 5)
- reply: мотивационный ответ (2-3 предложения)
- summary: краткое резюме (1 предложение)
- insight: глубокое понимание или совет
- isAchievement: true/false (является ли это достижением)
- mood: описание настроения

Отвечай на языке пользователя: ${finalUserLanguage}
```

**User Prompt**: `text` (текст записи пользователя)

**Плейсхолдеры**:
- `{{user_name}}` → `finalUserName`
- `{{user_language}}` → `finalUserLanguage`
- `{{entry_text}}` → `text`

**Вызывается из**:
- `src/features/mobile/home/components/chat-input/messageHandlers.ts` (строка 66)
- Функция `analyzeTextWithAI(userText, userName, userId)`

---

### 2. **card_from_entry** - Генерация карточки из записи

**Где используется**: `supabase/functions/motivations/index.ts`

**Текущая реализация**:
- **НЕТ AI генерации** - карточки создаются из существующих полей записи
- Используются поля: `ai_summary`, `ai_insight`, `text`, `sentiment`, `category`
- Логика генерации title/description (строки 293-324):
  - Title: первые 8 слов из `ai_summary` или `text`
  - Description: `ai_insight` или `ai_summary` или `text`
  - Fallback: дата записи

**Что нужно**:
- Добавить AI генерацию карточек с учетом типа (celebrate, reflect, focus, gratitude, progress)
- Использовать промпты из `docs/new/ai-prompts-cards.md`

**Плейсхолдеры**:
- `{{user_language}}` → язык пользователя
- `{{card_type}}` → тип карточки
- `{{summary}}` → краткое резюме записи
- `{{insight}}` → AI инсайт
- `{{sentiment}}` → настроение
- `{{category}}` → категория
- `{{tags}}` → теги

---

### 3. **progress_card** - Карточка прогресса

**Где используется**: НЕ реализовано

**Что нужно**:
- Создать Edge Function для генерации карточек прогресса
- Использовать промпты из `docs/new/ai-prompts-cards.md` (строки 178-231)
- Параметры: `total_active_days`, `current_progress_streak_days`, `recent_categories`, `notable_shifts`

---

### 4. **push_text** - Текст push-уведомления

**Где используется**: `supabase/functions/push-ai-personalize/index.ts`

**Текущая реализация**:
- **НЕТ AI генерации** - используются шаблонные тексты
- Анализ поведения пользователя (строка 147): `analyzeUserBehavior(userId)`
- Контекст: `name`, `language`, `isPremium`, `recentEntries`, `currentStreak`, `recentAchievements`

**Что нужно**:
- Добавить AI генерацию персонализированных push-уведомлений
- Использовать промпты из `docs/new/ai-prompts-cards.md` (строки 234-295)
- Типы: `morning_reminder`, `evening_reflection`, `new_insights`, `come_back_gentle`, `support_during_hard_times`

---

### 5. **weekly_report** - Недельный отчет

**Где используется**: НЕ реализовано

**Что нужно**:
- Создать Edge Function для генерации недельных отчетов
- Промпт: TODO (добавить в `docs/new/ai-prompts-cards.md`)
- Параметры: записи за неделю, статистика, достижения

---

### 6. **monthly_report** - Месячный отчет

**Где используется**: НЕ реализовано

**Что нужно**:
- Создать Edge Function для генерации месячных отчетов
- Промпт: TODO (добавить в `docs/new/ai-prompts-cards.md`)
- Параметры: записи за месяц, статистика, достижения, тренды

---

## 📊 Сводная таблица

| Операция | Статус | Модель | Max Tokens | Temperature | Промпт |
|----------|--------|--------|------------|-------------|--------|
| entry_analysis | ✅ Реализовано | gpt-4o-mini | 1000 | 0.7 | Хардкод в ai-analysis |
| card_from_entry | ⚠️ Частично | - | - | - | Нет AI, используются поля |
| progress_card | ❌ Не реализовано | - | - | - | Промпт в docs |
| push_text | ⚠️ Частично | - | - | - | Нет AI, шаблоны |
| weekly_report | ❌ Не реализовано | - | - | - | TODO |
| monthly_report | ❌ Не реализовано | - | - | - | TODO |

---

## 🔧 Что нужно сделать

### Фаза 1: Миграция существующих операций

1. **entry_analysis**:
   - ✅ Промпт готов (из ai-analysis/index.ts)
   - ⏳ Создать запись в ai_operations
   - ⏳ Обновить ai-analysis для использования getAiOperationConfig

2. **card_from_entry**:
   - ⏳ Создать AI генерацию карточек
   - ⏳ Использовать промпты из ai-prompts-cards.md
   - ⏳ Обновить motivations для использования getAiOperationConfig

3. **push_text**:
   - ⏳ Создать AI генерацию push-уведомлений
   - ⏳ Использовать промпты из ai-prompts-cards.md
   - ⏳ Обновить push-ai-personalize для использования getAiOperationConfig

### Фаза 2: Новые операции

4. **progress_card**:
   - ⏳ Создать Edge Function
   - ⏳ Использовать промпты из ai-prompts-cards.md

5. **weekly_report**:
   - ⏳ Создать промпт
   - ⏳ Создать Edge Function

6. **monthly_report**:
   - ⏳ Создать промпт
   - ⏳ Создать Edge Function

---

## 📝 Следующие шаги

1. ✅ Создать этот анализ
2. ⏳ Создать миграцию для ai_operations таблицы
3. ⏳ Создать seed данные с промптами
4. ⏳ Создать helper функцию getAiOperationConfig
5. ⏳ Мигрировать ai-analysis Edge Function
6. ⏳ Создать UI компонент AIOperationsTab
7. ⏳ Протестировать полный флоу

---

**Статус**: Анализ завершен, готов к реализации

