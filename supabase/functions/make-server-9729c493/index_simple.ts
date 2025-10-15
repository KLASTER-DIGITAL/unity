import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { Buffer } from 'node:buffer';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS и logger middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-OpenAI-Key'],
}));
app.use('*', logger(console.log));

// Инициализация Supabase клиента
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ======================
// AI ANALYSIS (исправленный endpoint)
// ======================

app.post('/make-server-9729c493/analyze', async (c) => {
  try {
    const { text, userId } = await c.req.json();

    if (!text) {
      return c.json({ success: false, error: 'Text is required' }, 400);
    }

    console.log('Analyzing text with AI...');

    // Приоритет: 1) Ключ из заголовка (админ-панель), 2) Env переменная
    const openaiApiKey = c.req.header('X-OpenAI-Key') || Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ success: false, error: 'OpenAI API key not configured. Please set it in admin panel.' }, 500);
    }

    // Получаем профиль пользователя для контекста
    let userProfile = null;
    if (userId) {
      userProfile = await kv.get(`profile:${userId}`);
    }

    const userLanguage = userProfile?.language || 'ru';
    const userName = userProfile?.name || 'Пользователь';

    // Системный промпт для анализа
    const systemPrompt = `Ты - AI-ассистент для дневника достижений. Твоя задача - анализировать записи пользователей и предоставлять мотивационные ответы.

Пользователь: ${userName}
Язык: ${userLanguage}

Проанализируй запись и верни JSON с полями:
- sentiment: "positive", "neutral", "negative"
- category: одна из категорий (семья, работа, финансы, благодарность, здоровье, личное развитие, творчество, отношения, другое)
- tags: массив тегов (максимум 5)
- aiReply: мотивационный ответ (2-3 предложения)
- aiSummary: краткое резюме (1 предложение)
- aiInsight: глубокое понимание или совет
- isAchievement: true/false (является ли это достижением)
- mood: описание настроения

Отвечай на языке пользователя: ${userLanguage}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return c.json({ 
        success: false, 
        error: `OpenAI API failed: ${response.status}` 
      }, 500);
    }

    const result = await response.json();
    const aiResponse = result.choices[0]?.message?.content;

    if (!aiResponse) {
      return c.json({ 
        success: false, 
        error: 'No response from AI' 
      }, 500);
    }

    // Парсим JSON ответ
    let analysis;
    try {
      analysis = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback анализ
      analysis = {
        sentiment: 'positive',
        category: 'другое',
        tags: ['запись'],
        aiReply: 'Спасибо за вашу запись! Продолжайте вести дневник.',
        aiSummary: 'Запись в дневнике',
        aiInsight: 'Ведение дневника помогает лучше понимать себя.',
        isAchievement: false,
        mood: 'хорошее'
      };
    }

    console.log('AI analysis successful:', analysis);

    return c.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error('Error analyzing text:', error);
    return c.json({ 
      success: false, 
      error: `Failed to analyze text: ${error.message}` 
    }, 500);
  }
});

// ======================
// ENTRIES MANAGEMENT (исправленный)
// ======================

app.post('/make-server-9729c493/entries/create', async (c) => {
  try {
    const entry = await c.req.json();
    
    if (!entry.userId || !entry.text) {
      return c.json({ success: false, error: 'userId and text are required' }, 400);
    }

    const entryId = crypto.randomUUID();
    const now = new Date().toISOString();

    const entryData = {
      id: entryId,
      userId: entry.userId,
      text: entry.text,
      voiceUrl: entry.voiceUrl || null,
      mediaUrl: entry.mediaUrl || null,
      media: entry.media || [],
      sentiment: entry.sentiment || 'positive',
      category: entry.category || 'Личное развитие',
      tags: entry.tags || [],
      aiReply: entry.aiReply || '',
      aiResponse: entry.aiResponse || entry.aiReply || '',
      aiSummary: entry.aiSummary || null,
      aiInsight: entry.aiInsight || null,
      isAchievement: entry.isAchievement !== undefined ? entry.isAchievement : true,
      mood: entry.mood || null,
      createdAt: now,
      streakDay: entry.streakDay || 1,
      focusArea: entry.focusArea || entry.category || 'Личное развитие'
    };

    // Сохраняем в KV store
    await kv.set(`entry:${entryId}`, entryData);
    
    // Также добавляем в список записей пользователя
    const userEntriesKey = `user_entries:${entry.userId}`;
    const existingEntries = await kv.get(userEntriesKey) || [];
    const updatedEntries = [entryId, ...existingEntries];
    await kv.set(userEntriesKey, updatedEntries);

    // Анализируем текст с помощью AI (исправленный внутренний вызов)
    try {
      const analysisResponse = await fetch(`${c.req.url.replace('/entries/create', '/analyze')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': c.req.header('Authorization') || '',
          'X-OpenAI-Key': c.req.header('X-OpenAI-Key') || ''
        },
        body: JSON.stringify({
          text: entry.text,
          userId: entry.userId
        })
      });

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        if (analysisData.success) {
          // Обновляем запись с результатами анализа
          const updatedEntry = {
            ...entryData,
            ...analysisData.analysis
          };
          await kv.set(`entry:${entryId}`, updatedEntry);
          entryData = updatedEntry;
        }
      }
    } catch (analysisError) {
      console.error('AI analysis failed:', analysisError);
      // Продолжаем без анализа
    }

    console.log(`Created entry ${entryId} for user ${entry.userId} with ${entry.media?.length || 0} media files`);

    return c.json({
      success: true,
      entry: entryData
    });

  } catch (error) {
    console.error('Error creating entry:', error);
    return c.json({ 
      success: false, 
      error: `Failed to create entry: ${error.message}` 
    }, 500);
  }
});

// ======================
// CARDS MODULE API
// ======================

// Получить мотивационные карточки для пользователя
app.get('/make-server-9729c493/motivations/cards/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ success: false, error: 'User ID is required' }, 400);
    }

    // 1. Получаем записи за последние 48 часов из KV store (временно)
    const userEntries = await kv.get(`user_entries:${userId}`) || [];
    const recentEntries = [];
    
    // Получаем последние 10 записей
    for (let i = 0; i < Math.min(10, userEntries.length); i++) {
      const entry = await kv.get(`entry:${userEntries[i]}`);
      if (entry) {
        const entryDate = new Date(entry.createdAt);
        const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000);
        
        if (entryDate >= yesterday) {
          recentEntries.push(entry);
        }
      }
    }

    // 2. Получаем просмотренные карточки из KV (TTL 24h)
    const viewedKey = `card_views:${userId}`;
    const viewedData = await kv.get(viewedKey);
    const viewedIds = viewedData ? JSON.parse(viewedData) : [];

    // 3. Фильтруем и маппим доступные карточки
    const available = recentEntries
      .filter(entry => !viewedIds.includes(entry.id))
      .map(entry => ({
        id: entry.id,
        entryId: entry.id,
        date: formatDate(entry.createdAt),
        title: entry.aiSummary 
          ? entry.aiSummary.split(' ').slice(0, 3).join(' ')
          : entry.text.split(' ').slice(0, 3).join(' '),
        description: entry.aiInsight || entry.aiReply || 'Каждое достижение приближает к цели!',
        gradient: getGradient(entry.sentiment),
        sentiment: entry.sentiment,
        mood: entry.mood,
        isMarked: false
      }));

    // 4. Получаем язык пользователя для дефолтных карточек
    const userProfile = await kv.get(`profile:${userId}`);
    const language = userProfile?.language || 'ru';
    const defaults = getDefaultMotivations(language);

    // 5. Добавляем дефолтные карточки если нужно
    let cards = available;
    if (available.length < 3) {
      cards = [
        ...available,
        ...defaults.slice(0, 3 - available.length)
      ];
    }

    return c.json({
      success: true,
      cards: cards.slice(0, 3)
    });

  } catch (error) {
    console.error('Error in getMotivationCards:', error);
    return c.json({ 
      success: false, 
      error: `Failed to get motivation cards: ${error.message}` 
    }, 500);
  }
});

// Отметить карточку как просмотренную
app.post('/make-server-9729c493/motivations/mark-read', async (c) => {
  try {
    const { userId, cardId } = await c.req.json();
    
    if (!userId || !cardId) {
      return c.json({ success: false, error: 'userId and cardId are required' }, 400);
    }

    const viewedKey = `card_views:${userId}`;
    const viewedData = await kv.get(viewedKey);
    const viewedIds = viewedData ? JSON.parse(viewedData) : [];

    if (!viewedIds.includes(cardId)) {
      viewedIds.push(cardId);
    }

    // Сохраняем с TTL 24 часа (86400 секунд)
    await kv.setex(viewedKey, 86400, JSON.stringify(viewedIds));

    return c.json({
      success: true,
      message: 'Card marked as read'
    });

  } catch (error) {
    console.error('Error in markCardAsRead:', error);
    return c.json({ 
      success: false, 
      error: `Failed to mark card as read: ${error.message}` 
    }, 500);
  }
});

// ======================
// HELPER FUNCTIONS
// ======================

// Форматирование даты для карточек
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    return 'Только что';
  } else if (diffHours < 24) {
    return `Сегодня ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffHours < 48) {
    return 'Вчера';
  } else {
    return date.toLocaleDateString('ru-RU');
  }
}

// Получение градиента по sentiment
function getGradient(sentiment: string): string {
  const gradients = {
    positive: "from-[#FE7669] to-[#ff8969]",
    neutral: "from-[#ff6b9d] to-[#c471ed]",
    negative: "from-[#c471ed] to-[#8B78FF]"
  };
  return gradients[sentiment as keyof typeof gradients] || gradients.positive;
}

// Дефолтные мотивационные карточки
function getDefaultMotivations(language: string) {
  const motivations = {
    ru: [
      {
        id: "default_1",
        date: "Начни сегодня",
        title: "Сегодня отличное время",
        description: "Запиши маленькую победу — это первый шаг к осознанию своих достижений.",
        gradient: "from-[#FE7669] to-[#ff8969]",
        isMarked: false,
        isDefault: true
      },
      {
        id: "default_2",
        date: "Совет дня",
        title: "Даже одна мысль делает день осмысленным",
        description: "Не обязательно писать много — одна фраза может изменить твой взгляд на день.",
        gradient: "from-[#ff6b9d] to-[#c471ed]",
        isMarked: false,
        isDefault: true
      },
      {
        id: "default_3",
        date: "Мотивация",
        title: "Запиши момент благодарности",
        description: "Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.",
        gradient: "from-[#c471ed] to-[#8B78FF]",
        isMarked: false,
        isDefault: true
      }
    ],
    en: [
      {
        id: "default_1",
        date: "Start today",
        title: "Today is a great time",
        description: "Write down a small victory — it's the first step to recognizing your achievements.",
        gradient: "from-[#FE7669] to-[#ff8969]",
        isMarked: false,
        isDefault: true
      },
      {
        id: "default_2",
        date: "Daily tip",
        title: "Even one thought makes the day meaningful",
        description: "You don't have to write a lot — one phrase can change your perspective on the day.",
        gradient: "from-[#ff6b9d] to-[#c471ed]",
        isMarked: false,
        isDefault: true
      },
      {
        id: "default_3",
        date: "Motivation",
        title: "Write down a moment of gratitude",
        description: "Feel the lightness when you notice the good in your life. This is the path to happiness.",
        gradient: "from-[#c471ed] to-[#8B78FF]",
        isMarked: false,
        isDefault: true
      }
    ]
  };
  
  return motivations[language as keyof typeof motivations] || motivations.ru;
}

// Запуск сервера
Deno.serve(app.fetch);
