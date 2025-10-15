# Полный сценарий: От записи к мотивационной карточке

**Версия:** 1.0  
**Дата:** Октябрь 2025  
**Описание:** Детальное описание всей цепочки создания и отображения мотивационной карточки с AI анализом

---

## 📋 Содержание

1. Обзор цепочки
2. Шаг 1: User создает запись
3. Шаг 2: AI анализирует запись
4. Шаг 3: Backend сохраняет данные
5. Шаг 4: Загрузка карточек на фронтенд
6. Шаг 5: Отображение карточек
7. Шаг 6: Взаимодействие пользователя
8. Полный код (Frontend + Backend)
9. Диаграммы и схемы
10. Примеры данных

---

## 1. Обзор цепочки

```
┌─────────────────────────────────────────────────────────────┐
│           ПОЛНАЯ ЦЕПОЧКА СОЗДАНИЯ КАРТОЧКИ                 │
└─────────────────────────────────────────────────────────────┘

[ПОЛЬЗОВАТЕЛЬ]
    ↓
[1. ПИШЕТ ЗАПИСЬ]
┌─────────────────────────────────────────────────────────────┐
│ "Сегодня я выиграл теннисный турнир!                        │
│  Это была жесткая борьба, но я не сдавался.                │
│  Родители очень гордятся."                                 │
│                                                              │
│ [Отправить]                                                 │
└─────────────────────────────────────────────────────────────┘
    ↓ (POST /api/entries/create)
    
[2. FRONTEND: ChatInputSection]
┌─────────────────────────────────────────────────────────────┐
│ entryText = "Сегодня я выиграл теннисный турнир!..."       │
│ userName = "Карина" (or null if not in context)            │
│ userId = "user_12345" (from session)                        │
│                                                              │
│ Call: analyzeTextWithAI(entryText, userName, userId)       │
└─────────────────────────────────────────────────────────────┘
    ↓ (POST /api/chat/analyze)
    
[3. BACKEND: OpenAI API]
┌─────────────────────────────────────────────────────────────┐
│ systemPrompt (на языке пользователя - русский):            │
│                                                              │
│ "Ты - мотивирующий AI-помощник...                         │
│  Отвечай на русском языке...                              │
│  Верни JSON с полями: reply, summary, insight, mood..."   │
│                                                              │
│ userMessage = "Сегодня я выиграл теннисный турнир!..."   │
│                                                              │
│ openai.chat.completions.create({                           │
│   model: "gpt-4-turbo",                                    │
│   messages: [{system}, {user}],                            │
│   temperature: 0.7,                                        │
│   max_tokens: 500                                          │
│ })                                                          │
│                                                              │
│ ⏱️ Время: 2-3 сек                                          │
│ 📊 Токены: ~150 (input) + ~100 (output) = 250 total      │
└─────────────────────────────────────────────────────────────┘
    ↓ (response: JSON)
    
[4. BACKEND: Парсинг и сохранение]
┌─────────────────────────────────────────────────────────────┐
│ response.content = {                                        │
│   "reply": "Поздравляем! 🎉 Победа в теннисе - это       │
│             результат упорного труда и мастерства!",      │
│   "summary": "Выиграл теннисный турнир, родители гордятся",│
│   "insight": "Победа показывает, что упорство приводит    │
│               к результатам. Это мотивирует на новые       │
│               достижения.",                                │
│   "sentiment": "positive",                                 │
│   "category": "спорт",                                     │
│   "tags": ["теннис", "победа", "спорт"],                 │
│   "confidence": 0.97,                                      │
│   "isAchievement": true,                                   │
│   "mood": "радость"                                        │
│ }                                                           │
│                                                              │
│ 1. Вставить DiaryEntry:                                    │
│    INSERT INTO diary_entries (                             │
│      user_id,                                              │
│      text,                                                 │
│      sentiment,                                            │
│      category,                                             │
│      tags,                                                 │
│      ai_summary,                                           │
│      ai_insight,                                           │
│      ai_reply,                                             │
│      mood,                                                 │
│      is_achievement                                        │
│    ) VALUES (                                              │
│      'user_12345',                                         │
│      'Сегодня я выиграл...',                              │
│      'positive',                                           │
│      'спорт',                                              │
│      ['теннис', 'победа', 'спорт'],                       │
│      'Выиграл теннисный турнир...',                       │
│      'Победа показывает, что упорство...',                │
│      'Поздравляем! 🎉 Победа в теннисе...',             │
│      'радость',                                            │
│      true                                                  │
│    )                                                        │
│    RETURNING id;                                           │
│                                                              │
│ 2. Вставить EntrySummaries (для оптимизации токенов):      │
│    INSERT INTO entry_summaries (                           │
│      entry_id,                                             │
│      user_id,                                              │
│      summary_json,                                         │
│      tokens_used,                                          │
│      created_at                                            │
│    ) VALUES (                                              │
│      'entry_12345',                                        │
│      'user_12345',                                         │
│      {                                                     │
│        text: 'Выиграл теннисный турнир...',              │
│        insight: 'Победа показывает, что упорство...',     │
│        mood: 'радость',                                   │
│        sentiment: 'positive',                             │
│        contexts: ['Карина'],                              │
│        tags: ['теннис', 'победа', 'спорт'],              │
│        achievements: [{type: 'win', title: 'Турнир'}],   │
│        keywords: ['теннис', 'победа', 'турнир'],         │
│        excerpt: 'Выиграл теннисный турнир...',           │
│        confidence: 0.97                                   │
│      },                                                   │
│      250,                                                 │
│      NOW()                                                │
│    );                                                      │
│                                                              │
│ ✓ Данные сохранены в БД                                   │
└─────────────────────────────────────────────────────────────┘
    ↓ (return: entryData)
    
[5. FRONTEND: Показать answer пользователю]
┌─────────────────────────────────────────────────────────────┐
│ ChatInputSection显示:                                       │
│                                                              │
│ 🤖 AI ОТВЕТ:                                               │
│ "Поздравляем! 🎉 Победа в теннисе - это результат         │
│  упорного труда и мастерства!"                             │
│                                                              │
│ ✨ Категория: спорт                                         │
│ 🏷️ Теги: теннис, победа, спорт                            │
│ 😊 Настроение: радость                                      │
│                                                              │
│ Запись сохранена ✓                                         │
│                                                              │
│ [Создать еще запись] [На главную]                         │
│                                                              │
│ ⏱️ Время отклика: 3-4 сек (AI + DB + render)              │
└─────────────────────────────────────────────────────────────┘
    ↓ (navigate to home screen)
    
[6. FRONTEND: Загрузить карточку на AchievementHomeScreen]
┌─────────────────────────────────────────────────────────────┐
│ useEffect(() => {                                           │
│   getMotivationCards(userId).then(cards => {               │
│     setCards(cards);                                       │
│   });                                                       │
│ }, [userId]);                                              │
│                                                              │
│ Call: GET /api/motivations/cards/{userId}                 │
└─────────────────────────────────────────────────────────────┘
    ↓ (response: 3 MotivationCard[])
    
[7. BACKEND: getMotivationCards]
┌─────────────────────────────────────────────────────────────┐
│ 1. SELECT entry_summaries WHERE                            │
│    - user_id = 'user_12345'                               │
│    - created_at >= (NOW() - 48 hours)                      │
│    ORDER BY created_at DESC                                │
│                                                              │
│ Result: [                                                  │
│   {                                                        │
│     id: 'sum_20251014_001',                               │
│     entry_id: 'entry_12345',                              │
│     created_at: '2025-10-14T14:32:00Z',                  │
│     summary_json: {                                        │
│       text: 'Выиграл теннисный турнир...',               │
│       insight: 'Победа показывает...',                   │
│       mood: 'радость',                                    │
│       sentiment: 'positive',                              │
│       ...                                                 │
│     }                                                     │
│   }                                                        │
│ ]                                                          │
│                                                              │
│ 2. GET card_views:user_12345 from KV Store               │
│    (cards marked as read, TTL 24h)                        │
│    Result: [] (empty - новые записи)                      │
│                                                              │
│ 3. Map to MotivationCard:                                  │
│    [{                                                      │
│      id: 'entry_12345',                                   │
│      entryId: 'entry_12345',                              │
│      date: 'Сегодня в 14:32',                            │
│      title: 'Выиграл теннисный турнир',                  │
│      description: 'Победа показывает, что упорство        │
│                   приводит к результатам. Это мотивирует  │
│                   на новые достижения.',                  │
│      gradient: 'from-[#FE7669] to-[#ff8969]',           │
│      sentiment: 'positive',                               │
│      mood: 'радость',                                     │
│      isMarked: false,                                     │
│      isDefault: false                                     │
│    }]                                                      │
│                                                              │
│ 4. If cards.length < 3:                                    │
│    ADD DEFAULT MOTIVATIONS (на русском):                  │
│    [{                                                      │
│      id: 'default_1',                                     │
│      date: 'Начни сегодня',                              │
│      title: 'Сегодня отличное время',                    │
│      description: 'Запиши маленькую победу...',          │
│      gradient: 'from-[#FE7669] to-[#ff8969]',           │
│      isDefault: true                                      │
│    },                                                     │
│    {                                                      │
│      id: 'default_2',                                     │
│      date: 'Совет дня',                                  │
│      title: 'Даже одна мысль делает день...',           │
│      description: 'Не обязательно писать много...',      │
│      gradient: 'from-[#ff6b9d] to-[#c471ed]',           │
│      isDefault: true                                      │
│    },                                                     │
│    {                                                      │
│      id: 'default_3',                                     │
│      date: 'Мотивация',                                  │
│      title: 'Запиши момент благодарности',              │
│      description: 'Почувствуй лёгкость...',             │
│      gradient: 'from-[#c471ed] to-[#8B78FF]',           │
│      isDefault: true                                      │
│    }]                                                     │
│                                                              │
│ 5. RETURN first 3 cards                                    │
│                                                              │
│ ⏱️ Время: < 500ms                                          │
│ 💾 Токены: 0 (все из cache)                               │
└─────────────────────────────────────────────────────────────┘
    ↓ (response: 3 cards)
    
[8. FRONTEND: Отобразить карточку]
┌─────────────────────────────────────────────────────────────┐
│ AchievementHomeScreen render:                              │
│                                                              │
│ ┌─────────────────────────────────┐                        │
│ │ [Gradient Background]           │                        │
│ │ from-[#FE7669] to-[#ff8969]     │                        │
│ │                                 │                        │
│ │ Сегодня в 14:32                │                        │
│ │                                 │                        │
│ │ ВЫИГРАЛ ТЕННИСНЫЙ ТУРНИР       │                        │
│ │                                 │                        │
│ │ Победа показывает, что упорство │                        │
│ │ приводит к результатам. Это     │                        │
│ │ мотивирует на новые достижения. │                        │
│ │                                 │                        │
│ │ ← свайп вправо/влево →          │                        │
│ │ • ◦ ◦  (прогресс)              │                        │
│ └─────────────────────────────────┘                        │
│                                                              │
│ ⏱️ Время загрузки: < 1 сек                                  │
│ 📱 Responsive: работает на всех устройствах               │
│ ♿ Accessible: proper ARIA labels                         │
└─────────────────────────────────────────────────────────────┘
    ↓
    
[9. ПОЛЬЗОВАТЕЛЬ ВЗАИМОДЕЙСТВУЕТ С КАРТОЧКОЙ]

ВАРИАНТ 1: Свайп вправо (👍)
┌─────────────────────────────────────────────────────────────┐
│ User swipes RIGHT > 50px                                   │
│                                                              │
│ Call: POST /api/motivations/mark-read                      │
│ Body: { userId: 'user_12345', cardId: 'entry_12345' }    │
│                                                              │
│ Backend:                                                   │
│ - GET card_views:user_12345 from KV                       │
│ - APPEND entry_12345 to array                             │
│ - SET card_views:user_12345 = [..., entry_12345]         │
│ - TTL: 86400 seconds (24 hours)                          │
│                                                              │
│ Frontend:                                                  │
│ - Card animates out RIGHT                                 │
│ - Next card animates in LEFT                              │
│ - Progress dots update: ◦ • ◦                             │
│ - Sound effect (optional)                                 │
│                                                              │
│ Пользователь: "Нравится!" → следующая карточка          │
│                                                              │
│ ⏱️ Время: < 100ms (animation) + 300ms (api) = 400ms      │
└─────────────────────────────────────────────────────────────┘

ВАРИАНТ 2: Свайп влево (✏️)
┌─────────────────────────────────────────────────────────────┐
│ User swipes LEFT > 50px                                    │
│                                                              │
│ Frontend:                                                  │
│ - Card animates out LEFT                                  │
│ - Navigate to ChatInputSection                            │
│ - Focus on input field                                    │
│ - Show hint: "Хочешь создать новую запись?"             │
│                                                              │
│ Пользователь: "Хочу написать еще!" → new entry           │
│                                                              │
│ ⏱️ Время: < 300ms (navigation)                             │
└─────────────────────────────────────────────────────────────┘

ВАРИАНТ 3: Нажатие на карточку
┌─────────────────────────────────────────────────────────────┐
│ User taps on card                                          │
│                                                              │
│ Navigate to CardDetailScreen                              │
│                                                              │
│ Call: GET /api/entries/{entryId}                          │
│                                                              │
│ Display:                                                   │
│ ┌─────────────────────────────────┐                        │
│ │ 📝 Полная запись                │                        │
│ ├─────────────────────────────────┤                        │
│ │                                 │                        │
│ │ Сегодня я выиграл теннисный    │                        │
│ │ турнир! Это была жесткая       │                        │
│ │ борьба, но я не сдавался.      │                        │
│ │ Родители очень гордятся.       │                        │
│ │                                 │                        │
│ ├─────────────────────────────────┤                        │
│ │ 🤖 AI ОТВЕТ:                    │                        │
│ │ "Поздравляем! 🎉 Победа в      │                        │
│ │  теннисе - это результат        │                        │
│ │  упорного труда и мастерства!"  │                        │
│ │                                 │                        │
│ ├─────────────────────────────────┤                        │
│ │ Категория: спорт                │                        │
│ │ Теги: теннис, победа, спорт    │                        │
│ │ Настроение: радость             │                        │
│ │ Достижение: ✓ Да               │                        │
│ │                                 │                        │
│ ├─────────────────────────────────┤                        │
│ │ [Редактировать] [Добавить фото] │                        │
│ │ [← Назад]                       │                        │
│ └─────────────────────────────────┘                        │
│                                                              │
│ ⏱️ Время загрузки: < 500ms                                  │
│ 💾 Данные из кэша (Redis/Supabase)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Шаг 1: Пользователь создает запись

### 2.1 UI: ChatInputSection

```typescript
// screens/ChatInputSection.tsx

import React, { useState } from 'react';
import { analyzeTextWithAI, createEntry } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function ChatInputSection({ onEntryCreated }) {
  const { userData } = useAuth();
  const [entryText, setEntryText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!entryText.trim()) {
      setError('Напишите что-нибудь');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. Получить AI анализ
      console.log('Отправляем текст на анализ...');
      const analysis = await analyzeTextWithAI(
        entryText,
        userData?.name || 'Пользователь',
        userData?.id
      );

      console.log('AI анализ получен:', analysis);
      setAiResponse(analysis);

      // 2. Сохранить запись
      console.log('Сохраняем запись в БД...');
      const savedEntry = await createEntry({
        userId: userData.id,
        text: entryText,
        sentiment: analysis.sentiment,
        category: analysis.category,
        tags: analysis.tags,
        aiReply: analysis.reply,
        aiSummary: analysis.summary,
        aiInsight: analysis.insight,
        isAchievement: analysis.isAchievement,
        mood: analysis.mood,
        focusArea: analysis.category
      });

      console.log('Запись сохранена:', savedEntry);

      // 3. Очистить форму
      setEntryText('');

      // 4. Показать AI ответ
      setTimeout(() => {
        // 5. Уведомить parent component
        if (onEntryCreated) {
          onEntryCreated(savedEntry);
        }
        // Через 3 сек вернуться на главный экран
        setTimeout(() => {
          setAiResponse(null);
          navigate('/home');
        }, 3000);
      }, 1000);
    } catch (err) {
      console.error('Ошибка:', err);
      setError(err.message || 'Ошибка при сохранении записи');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-input-section">
      {/* Форма ввода */}
      <textarea
        value={entryText}
        onChange={(e) => setEntryText(e.target.value)}
        placeholder="Что произошло сегодня? Какие достижения?"
        disabled={isLoading || aiResponse}
        className="input-field"
      />

      {/* AI Response */}
      {aiResponse && (
        <div className="ai-response">
          <h3>🤖 AI Ответ:</h3>
          <p className="reply">{aiResponse.reply}</p>
          
          <div className="metadata">
            <p><strong>Категория:</strong> {aiResponse.category}</p>
            <p><strong>Теги:</strong> {aiResponse.tags.join(', ')}</p>
            <p><strong>Настроение:</strong> {aiResponse.mood}</p>
            {aiResponse.isAchievement && (
              <p><strong>✨ Это достижение!</strong></p>
            )}
          </div>

          <p className="saved-message">✓ Запись сохранена!</p>
        </div>
      )}

      {/* Error */}
      {error && <div className="error-message">{error}</div>}

      {/* Button */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !entryText.trim()}
        className="submit-button"
      >
        {isLoading ? 'Анализирую...' : 'Отправить'}
      </button>
    </div>
  );
}
```

---

## 3. Шаг 2: AI анализирует запись

### 3.1 Frontend: analyzeTextWithAI

```typescript
// utils/api.ts

export async function analyzeTextWithAI(
  text: string,
  userName: string,
  userId: string
): Promise<AIAnalysisResult> {
  try {
    console.log('[API] Начало анализа текста:', text.substring(0, 50) + '...');

    const response = await fetch('/api/chat/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        userName,
        userId
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    console.log('[API] Анализ завершен:', data);

    return {
      reply: data.reply,
      summary: data.summary,
      insight: data.insight,
      sentiment: data.sentiment,
      category: data.category,
      tags: data.tags,
      confidence: data.confidence,
      isAchievement: data.isAchievement,
      mood: data.mood
    };
  } catch (error) {
    console.error('[API] Ошибка анализа:', error);
    throw error;
  }
}
```

### 3.2 Backend: POST /api/chat/analyze

```typescript
// server/routes/analyze.ts

import Anthropic from '@anthropic-ai/sdk';
import { db } from '../supabase';

app.post('/api/chat/analyze', async (c) => {
  try {
    const { text, userName, userId } = await c.req.json();

    console.log('[BACKEND] Получен запрос на анализ от:', userId);
    console.log('[BACKEND] Текст:', text.substring(0, 100) + '...');

    // 1. Получить профиль пользователя для определения языка
    const userProfile = await db
      .from('profiles')
      .select('language')
      .eq('id', userId)
      .single();

    const userLanguage = userProfile.data?.language || 'ru';
    console.log('[BACKEND] Язык пользователя:', userLanguage);

    // 2. Составить системный промпт на языке пользователя
    const systemPrompt = buildSystemPrompt(userLanguage);

    console.log('[BACKEND] Отправляем запрос в OpenAI...');

    // 3. Вызвать OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('[BACKEND] Ответ от OpenAI получен');

    // 4. Распарсить JSON ответ
    const content = response.choices[0].message.content;
    console.log('[BACKEND] Content:', content.substring(0, 100) + '...');

    // Очистить markdown backticks если есть
    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const analysis = JSON.parse(cleanContent);

    console.log('[BACKEND] JSON распаршен успешно');
    console.log('[BACKEND] Анализ результат:', analysis);

    // 5. Подсчитать токены
    const tokensUsed = Math.ceil(response.usage.total_tokens);
    console.log('[BACKEND] Токены использованы:', tokensUsed);

    // 6. Вернуть результат
    return c.json({
      success: true,
      reply: analysis.reply,
      summary: analysis.summary,
      insight: analysis.insight,
      sentiment: analysis.sentiment,
      category: analysis.category,
      tags: analysis.tags,
      confidence: analysis.confidence,
      isAchievement: analysis.isAchievement,
      mood: analysis.mood,
      tokensUsed
    });
  } catch (error) {
    console.error('[BACKEND] Ошибка:', error);
    return c.json(
      {
        success: false,
        error: error.message
      },
      500
    );
  }
});

// Построить системный промпт
function buildSystemPrompt(language: string): string {
  const prompts = {
    ru: `Ты - мотивирующий AI-помощник в приложении "Дневник достижений".
ВАЖНО: Отвечай на русском языке.

Твоя задача:
1. Дать короткий воодушевляющий ответ (1-2 предложения, эмоджи приветствуются)
2. Создать краткое резюме достижения (summary, до 200 символов)
3. Сформировать позитивный вывод/инсайт (insight, до 200 символов)
4. Определить sentiment (positive/neutral/negative)
5. Определить категорию (спорт, работа, учеба, семья, здоровье, хобби, путешествия, другое)
6. Выбрать релевантные теги
7. Определить настроение (mood): радость, энергия, гордость, вдохновение, спокойствие, мотивация, благодарность
8. Определить, это ли достижение (isAchievement: true/false)
9. Оценить confidence (0.0-1.0)

Отвечай ТОЛЬКО в формате JSON, без дополнительного текста:
{
  "reply": "Воодушевляющий ответ на русском",
  "summary": "Краткое резюме до 200 символов",
  "insight": "Позитивный вывод до 200 символов",
  "sentiment": "positive|neutral|negative",
  "category": "категория на русском",
  "tags": ["теги на русском"],
  "confidence": 0.95,
  "isAchievement": true,
  "mood": "настроение на русском"
}`,
    en: `You are a motivating AI assistant in the "Achievement Diary" app.
IMPORTANT: Respond in English.

Your task:
1. Give a short encouraging response (1-2 sentences, emojis are welcome)
2. Create a brief achievement summary (summary, max 200 characters)
3. Form a positive conclusion/insight (insight, max 200 characters)
...
Respond ONLY in JSON format:
{
  "reply": "Encouraging response",
  "summary": "Brief summary",
  "insight": "Positive conclusion",
  "sentiment": "positive|neutral|negative",
  "category": "category",
  "tags": ["tags"],
  "confidence": 0.95,
  "isAchievement": true,
  "mood": "emotion"
}`
    // ... es, de, fr, zh, ja
  };

  return prompts[language] || prompts.ru;
}
```

---

## 4. Шаг 3: Backend сохраняет данные

### 4.1 Backend: createEntry

```typescript
// server/routes/entries.ts

app.post('/api/entries/create', async (c) => {
  try {
    const entryData = await c.req.json();
    const { userId, text, sentiment, category, tags, aiSummary, aiInsight, aiReply, mood, isAchievement } = entryData;

    console.log('[BACKEND] Начало сохранения записи...');

    // 1. Вставить запись в diary_entries
    const { data: entry, error: entryError } = await db
      .from('diary_entries')
      .insert({
        user_id: userId,
        text: text,
        sentiment: sentiment,
        category: category,
        tags: tags,
        ai_summary: aiSummary,
        ai_insight: aiInsight,
        ai_reply: aiReply,
        mood: mood,
        is_achievement: isAchievement,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (entryError) throw entryError;

    console.log('[BACKEND] Запись создана:', entry.id);

    // 2. Вставить summary в entry_summaries (для оптимизации токенов)
    const { data: summary, error: summaryError } = await db
      .from('entry_summaries')
      .insert({
        entry_id: entry.id,
        user_id: userId,
        summary_json: {
          text: aiSummary,
          insight: aiInsight,
          mood: mood,
          sentiment: sentiment,
          contexts: [], // будет заполнено при необходимости
          tags: tags,
          achievements: isAchievement ? [{ type: 'write', title: category }] : [],
          keywords: extractKeywords(text),
          excerpt: text.substring(0, 100),
          confidence: 0.95
        },
        tokens_used: entryData.tokensUsed || 250,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (summaryError) throw summaryError;

    console.log('[BACKEND] Summary сохранена:', summary.id);

    // 3. Очистить кэш карточек для этого пользователя (опционально)
    // await cache.invalidate(`motivation_cards:${userId}`);

    console.log('[BACKEND] Запись полностью сохранена');

    return c.json({
      success: true,
      entryId: entry.id,
      summaryId: summary.id,
      entry: entry
    });
  } catch (error) {
    console.error('[BACKEND] Ошибка сохранения:', error);
    return c.json(
      {
        success: false,
        error: error.message
      },
      500
    );
  }
});

function extractKeywords(text: string): string[] {
  // Простой алгоритм извлечения ключевых слов
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3);

  const stopWords = new Set(['что', 'это', 'того', 'чего', 'того', 'что', 'как', 'для', 'или', 'был']);

  return Array.from(new Set(words))
    .filter(w => !stopWords.has(w))
    .slice(0, 5);
}
```

---

## 5. Шаг 4: Загрузка карточек на фронтенд

### 5.1 Backend: GET /api/motivations/cards

```typescript
// server/routes/motivations.ts

app.get('/api/motivations/cards/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    console.log('[BACKEND] Запрос карточек для пользователя:', userId);

    // 1. Получить записи за последние 48 часов
    const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const { data: recentEntries, error: entriesError } = await db
      .from('entry_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    if (entriesError) throw entriesError;

    console.log('[BACKEND] Найдено записей за 48ч:', recentEntries.length);

    // 2. Получить просмотренные карточки из KV Store
    const viewedKey = `card_views:${userId}`;
    const viewedData = await kv.get(viewedKey);
    const viewedIds = viewedData ? JSON.parse(viewedData) : [];

    console.log('[BACKEND] Просмотренные карточки:', viewedIds);

    // 3. Отфильтровать непросмотренные
    const availableEntries = recentEntries
      .filter(entry => !viewedIds.includes(entry.entry_id))
      .slice(0, 3);

    console.log('[BACKEND] Доступных карточек:', availableEntries.length);

    // 4. Преобразовать в MotivationCard
    const cards = availableEntries.map(entry => ({
      id: entry.entry_id,
      entryId: entry.entry_id,
      date: formatDate(entry.created_at),
      title: entry.summary_json.text
        .split(' ')
        .slice(0, 3)
        .join(' '),
      description: entry.summary_json.insight,
      gradient: getGradient(entry.summary_json.sentiment),
      sentiment: entry.summary_json.sentiment,
      mood: entry.summary_json.mood,
      isMarked: false,
      isDefault: false
    }));

    console.log('[BACKEND] Реальных карточек:', cards.length);

    // 5. Добавить дефолтные, если нужно
    if (cards.length < 3) {
      const userProfile = await db
        .from('profiles')
        .select('language')
        .eq('id', userId)
        .single();

      const language = userProfile.data?.language || 'ru';
      const defaults = getDefaultMotivations(language);

      const additionalDefaults = defaults.slice(0, 3 - cards.length);
      console.log('[BACKEND] Добавлено дефолтных карточек:', additionalDefaults.length);

      cards.push(...additionalDefaults);
    }

    console.log('[BACKEND] Итого карточек к отправке:', cards.length);

    return c.json({
      success: true,
      data: cards,
      count: cards.length
    });
  } catch (error) {
    console.error('[BACKEND] Ошибка при получении карточек:', error);
    return c.json(
      {
        success: false,
        error: error.message
      },
      500
    );
  }
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (entryDate.getTime() === today.getTime()) {
    return `Сегодня в ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  } else if (entryDate.getTime() === yesterday.getTime()) {
    return `Вчера в ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

function getGradient(sentiment: string): string {
  const gradients = {
    positive: 'from-[#FE7669] to-[#ff8969]',
    neutral: 'from-[#ff6b9d] to-[#c471ed]',
    negative: 'from-[#c471ed] to-[#8B78FF]'
  };
  return gradients[sentiment] || gradients.positive;
}

function getDefaultMotivations(language: string) {
  const motivations = {
    ru: [
      {
        id: 'default_1',
        date: 'Начни сегодня',
        title: 'Сегодня отличное время',
        description: 'Запиши маленькую победу — это первый шаг к осознанию своих достижений.',
        gradient: 'from-[#FE7669] to-[#ff8969]',
        isMarked: false,
        isDefault: true
      },
      {
        id: 'default_2',
        date: 'Совет дня',
        title: 'Даже одна мысль делает день осмысленным',
        description: 'Не обязательно писать много — одна фраза может изменить твой взгляд на день.',
        gradient: 'from-[#ff6b9d] to-[#c471ed]',
        isMarked: false,
        isDefault: true
      },
      {
        id: 'default_3',
        date: 'Мотивация',
        title: 'Запиши момент благодарности',
        description: 'Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.',
        gradient: 'from-[#c471ed] to-[#8B78FF]',
        isMarked: false,
        isDefault: true
      }
    ],
    en: [
      {
        id: 'default_1',
        date: 'Start today',
        title: 'Today is a great time',
        description: 'Write down a small victory — it is the first step to recognizing your achievements.',
        gradient: 'from-[#FE7669] to-[#ff8969]',
        isMarked: false,
        isDefault: true
      },
      // ... 2 more
    ]
    // ... es, de, fr, zh, ja
  };

  return motivations[language] || motivations.ru;
}
```

### 5.2 Frontend: Load cards in component

```typescript
// components/AchievementHomeScreen.tsx

import React, { useState, useEffect } from 'react';
import { getMotivationCards, markCardAsRead } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function AchievementHomeScreen({ diaryData }) {
  const { userData } = useAuth();
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузить карточки при монтировании
  useEffect(() => {
    loadCards();
  }, [userData?.id]);

  const loadCards = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[FRONTEND] Загружаем карточки для:', userData?.id);

      const motivationCards = await getMotivationCards(userData.id);

      console.log('[FRONTEND] Карточки загружены:', motivationCards.length);

      setCards(motivationCards);
    } catch (err) {
      console.error('[FRONTEND] Ошибка загрузки:', err);
      setError('Ошибка загрузки карточек');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwipe = async (direction) => {
    const currentCard = cards[currentCardIndex];

    if (direction === 'right') {
      // Пользователь проголосовал "лайк"
      await markCardAsRead(userData.id, currentCard.id);
    } else if (direction === 'left') {
      // Пользователь свайпнул влево - перейти в создание записи
      navigateTo('/chat');
      return;
    }

    // Показать следующую карточку
    const nextIndex = (currentCardIndex + 1) % cards.length;
    setCurrentCardIndex(nextIndex);
  };

  if (isLoading) {
    return <div className="loading-spinner">Загрузка карточек...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (cards.length === 0) {
    return <div className="no-cards">Нет карточек</div>;
  }

  const currentCard = cards[currentCardIndex];

  return (
    <div className="achievement-home-screen">
      <header className="header">
        <h1>{diaryData.emoji} {diaryData.name}</h1>
      </header>

      {/* Swipeable Card */}
      <div
        className={`motivation-card gradient-${currentCard.sentiment}`}
        style={{
          backgroundImage: `linear-gradient(135deg, var(--${currentCard.gradient.split(' ')[0]}), var(--${currentCard.gradient.split(' ')[1]}))`
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <p className="date">{currentCard.date}</p>
        <h2 className="title">{currentCard.title}</h2>
        <p className="description">{currentCard.description}</p>
      </div>

      {/* Progress Dots */}
      <div className="progress-dots">
        {cards.map((_, index) => (
          <div
            key={index}
            className={`dot ${index === currentCardIndex ? 'active' : ''}`}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button onClick={() => navigateTo('/chat')} className="btn-primary">
          + Новая запись
        </button>
        <button onClick={() => navigateTo('/books')} className="btn-secondary">
          Мои книги
        </button>
      </div>
    </div>
  );
}
```

---

## 6. Диаграмма последовательности (Sequence Diagram)

```
USER          FRONTEND         BACKEND          OPENAI          DATABASE
 │                │               │                │               │
 ├─ Type text ───→│               │                │               │
 │                │               │                │               │
 ├─ Click send ───→│               │                │               │
 │                │               │                │               │
 │                ├─ POST /chat/analyze ────────────→│               │
 │                │               │ (text, userId)  │               │
 │                │               │                 │               │
 │                │               ├─ Get user language              │
 │                │               │ (from cache or DB)              │
 │                │               │                                 │
 │                │               ├─ Build systemPrompt             │
 │                │               │ (in user's language)            │
 │                │               │                                 │
 │                │               ├─ Call gpt-4-turbo ─────────────→│
 │                │               │ (system + user prompt)          │
 │                │ ⏱ 2-3 sec     │                                 │
 │                │               │←─ JSON response ────────────────┤
 │                │               │ {reply, summary, insight, ...}  │
 │                │               │                                 │
 │                │               ├─ Parse JSON                     │
 │                │               │                                 │
 │                │               ├─ INSERT diary_entries ─────────→│
 │                │               │                    ↓            │
 │                │               │ ✓ Entry created    ↓            │
 │                │               │←────────────────────────────────┤
 │                │               │                                 │
 │                │               ├─ INSERT entry_summaries ────────→│
 │                │               │ (for token optimization)        │
 │                │               │                    ↓            │
 │                │               │ ✓ Summary stored   ↓            │
 │                │               │←────────────────────────────────┤
 │                │               │                                 │
 │                ├─