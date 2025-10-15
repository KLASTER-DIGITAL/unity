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

const MEDIA_BUCKET_NAME = 'diary-media';

// ======================
// OPENAI USAGE LOGGING
// ======================

// Функция для логирования использования OpenAI API
async function logOpenAIUsage(
  userId: string,
  operationType: 'ai_card' | 'translation' | 'pdf_export' | 'transcription' | 'other',
  model: string,
  usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
) {
  try {
    // Расчет стоимости на основе модели
    const pricing: Record<string, { prompt: number; completion: number }> = {
      'gpt-4': { prompt: 0.03 / 1000, completion: 0.06 / 1000 },
      'gpt-4-turbo-preview': { prompt: 0.01 / 1000, completion: 0.03 / 1000 },
      'gpt-3.5-turbo': { prompt: 0.0005 / 1000, completion: 0.0015 / 1000 },
      'whisper-1': { prompt: 0.006 / 60, completion: 0 } // $0.006 per minute
    };

    const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
    const promptTokens = usage.prompt_tokens || 0;
    const completionTokens = usage.completion_tokens || 0;
    const totalTokens = usage.total_tokens || (promptTokens + completionTokens);
    
    const estimatedCost = 
      (promptTokens * modelPricing.prompt) + 
      (completionTokens * modelPricing.completion);

    // Сохранение в БД
    const { error } = await supabase.from('openai_usage').insert({
      user_id: userId,
      operation_type: operationType,
      model,
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: totalTokens,
      estimated_cost: estimatedCost
    });

    if (error) {
      console.error('Failed to log OpenAI usage:', error);
    } else {
      console.log(`Logged OpenAI usage: ${operationType}, ${totalTokens} tokens, $${estimatedCost.toFixed(6)}`);
    }
  } catch (error) {
    console.error('Error logging OpenAI usage:', error);
  }
}

// ======================
// VOICE TRANSCRIPTION (Whisper API)
// ======================
app.post('/make-server-9729c493/transcribe', async (c) => {
  try {
    const { audio, mimeType, userId } = await c.req.json();

    if (!audio) {
      return c.json({ success: false, error: 'Audio data is required' }, 400);
    }

    console.log('Transcribing audio with Whisper API...');

    // Конвертируем base64 в buffer
    const audioBuffer = Buffer.from(audio, 'base64');

    // Определяем расширение файла
    const extension = mimeType?.includes('webm') ? 'webm' : 'mp4';
    const filename = `audio_${Date.now()}.${extension}`;

    // Создаем File объект для OpenAI
    const audioFile = new File([audioBuffer], filename, { type: mimeType || 'audio/webm' });

    // Вызываем Whisper API
    // Приоритет: 1) Ключ из заголовка (админ-панель), 2) Env переменная
    const openaiApiKey = c.req.header('X-OpenAI-Key') || Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return c.json({ success: false, error: 'OpenAI API key not configured. Please set it in admin panel.' }, 500);
    }

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', 'ru'); // Основной язык - русский

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: formData
    });

    if (!whisperResponse.ok) {
      const error = await whisperResponse.text();
      console.error('Whisper API error:', error);
      return c.json({ 
        success: false, 
        error: `Whisper API failed: ${whisperResponse.status}` 
      }, 500);
    }

    const result = await whisperResponse.json();
    const transcribedText = result.text;

    console.log('Transcription successful:', transcribedText);

    // Логирование использования API
    if (userId) {
      const audioDurationSeconds = audioBuffer.length / (16000 * 2); // Примерная оценка
      await logOpenAIUsage(userId, 'transcription', 'whisper-1', {
        total_tokens: Math.ceil(audioDurationSeconds * 60) // Whisper считается в минутах
      });
    }

    return c.json({
      success: true,
      text: transcribedText
    });

  } catch (error) {
    console.error('Error transcribing audio:', error);
    return c.json({ 
      success: false, 
      error: `Failed to transcribe audio: ${error.message}` 
    }, 500);
  }
});

// ======================
// MEDIA UPLOAD
// ======================

// Загрузить медиа файл
app.post('/make-server-9729c493/media/upload', async (c) => {
  try {
    const { file, type } = await c.req.json();

    if (!file) {
      return c.json({ success: false, error: 'File data is required' }, 400);
    }

    console.log('Uploading media file...');

    // Конвертируем base64 в buffer
    const fileBuffer = Buffer.from(file, 'base64');
    const filename = `media_${Date.now()}.${type || 'jpg'}`;

    // Загружаем в Supabase Storage
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET_NAME)
      .upload(filename, fileBuffer, {
        contentType: `image/${type || 'jpeg'}`,
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return c.json({ 
        success: false, 
        error: `Failed to upload file: ${error.message}` 
      }, 500);
    }

    // Получаем публичный URL
    const { data: urlData } = supabase.storage
      .from(MEDIA_BUCKET_NAME)
      .getPublicUrl(filename);

    console.log('Media upload successful:', urlData.publicUrl);

    return c.json({
      success: true,
      url: urlData.publicUrl,
      filename: data.path
    });

  } catch (error) {
    console.error('Error uploading media:', error);
    return c.json({ 
      success: false, 
      error: `Failed to upload media: ${error.message}` 
    }, 500);
  }
});

// ======================
// AI ANALYSIS
// ======================

// Анализ текста с помощью AI
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

    // Логирование использования API
    if (userId && result.usage) {
      await logOpenAIUsage(userId, 'ai_card', 'gpt-4', {
        prompt_tokens: result.usage.prompt_tokens,
        completion_tokens: result.usage.completion_tokens,
        total_tokens: result.usage.total_tokens
      });
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
// PROFILE MANAGEMENT
// ======================

// Создать профиль пользователя
app.post('/make-server-9729c493/profiles/create', async (c) => {
  try {
    const profileData = await c.req.json();
    
    console.log('Creating profile:', profileData);
    
    const profile = {
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`profile:${profile.id}`, profile);
    
    return c.json({ success: true, profile });
    
  } catch (error) {
    console.error('Error creating profile:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Получить профиль пользователя (новый эндпоинт)
app.get('/make-server-9729c493/profiles/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log(`Fetching profile for user: ${userId}`);

    const profile = await kv.get(`profile:${userId}`);
    
    if (!profile) {
      return c.json({ success: false, error: 'Profile not found' }, 404);
    }

    return c.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch profile: ${error.message}` 
    }, 500);
  }
});

// Получить профиль пользователя (старый эндпоинт для совместимости)
app.get('/make-server-9729c493/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log(`Fetching profile for user: ${userId}`);

    const profile = await kv.get(`profile:${userId}`);
    
    if (!profile) {
      return c.json({ success: false, error: 'Profile not found' }, 404);
    }

    return c.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch profile: ${error.message}` 
    }, 500);
  }
});

// Обновить профиль пользователя
app.put('/make-server-9729c493/profile/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const updates = await c.req.json();
    
    console.log(`Updating profile for user: ${userId}`);

    const existingProfile = await kv.get(`profile:${userId}`);
    
    if (!existingProfile) {
      return c.json({ success: false, error: 'Profile not found' }, 404);
    }

    const updatedProfile = {
      ...existingProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`profile:${userId}`, updatedProfile);

    return c.json({
      success: true,
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ 
      success: false, 
      error: `Failed to update profile: ${error.message}` 
    }, 500);
  }
});

// ======================
// ENTRIES MANAGEMENT
// ======================

// Создать новую запись (новый endpoint)
app.post('/make-server-9729c493/entries', async (c) => {
  try {
    const { userId, text, mediaUrl, category, tags } = await c.req.json();

    if (!userId || !text) {
      return c.json({ success: false, error: 'User ID and text are required' }, 400);
    }

    console.log(`Creating entry for user: ${userId}`);

    const entryId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Создаем запись
    let entry = {
      id: entryId,
      userId,
      text,
      mediaUrl: mediaUrl || null,
      category: category || 'другое',
      tags: tags || [],
      createdAt: now,
      updatedAt: now
    };

    // Сохраняем запись
    await kv.set(`entry:${entryId}`, entry);

    // Добавляем ID записи в список пользователя
    const userEntries = await kv.get(`user_entries:${userId}`) || [];
    userEntries.push(entryId);
    await kv.set(`user_entries:${userId}`, userEntries);

    // Анализируем текст с помощью AI
    try {
      const analysisResponse = await fetch(`${c.req.url.replace('/entries', '/analyze')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-OpenAI-Key': c.req.header('X-OpenAI-Key') || ''
        },
        body: JSON.stringify({ text, userId })
      });

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        if (analysisData.success) {
          // Обновляем запись с результатами анализа
          const updatedEntry = {
            ...entry,
            ...analysisData.analysis
          };
          await kv.set(`entry:${entryId}`, updatedEntry);
          entry = updatedEntry;
        }
      }
    } catch (analysisError) {
      console.error('AI analysis failed:', analysisError);
      // Продолжаем без анализа
    }

    return c.json({
      success: true,
      entry
    });

  } catch (error) {
    console.error('Error creating entry:', error);
    return c.json({ 
      success: false, 
      error: `Failed to create entry: ${error.message}` 
    }, 500);
  }
});

// Создать новую запись (старый endpoint для совместимости)
app.post('/make-server-9729c493/entries/create', async (c) => {
  try {
    const entry = await c.req.json();

    if (!entry.userId || !entry.text) {
      return c.json({ success: false, error: 'userId and text are required' }, 400);
    }

    console.log(`Creating entry for user ${entry.userId}...`);

    // 1. Сохранить entry в Supabase БД
    const { data: savedEntry, error: entryError } = await supabase
      .from('entries')
      .insert({
        user_id: entry.userId,
        text: entry.text,
        voice_url: entry.voiceUrl || null,
        media_url: entry.mediaUrl || null,
        media: entry.media || [],
        sentiment: entry.sentiment || 'positive',
        category: entry.category || 'Личное развитие',
        tags: entry.tags || [],
        ai_reply: entry.aiReply || '',
        ai_summary: entry.aiSummary || null,
        ai_insight: entry.aiInsight || null,
        is_achievement: entry.isAchievement !== undefined ? entry.isAchievement : true,
        mood: entry.mood || null,
        focus_area: entry.focusArea || entry.category || 'Личное развитие'
      })
      .select()
      .single();

    if (entryError) {
      console.error('Error saving entry to database:', entryError);
      throw entryError;
    }

    console.log(`✅ Entry saved to database: ${savedEntry.id}`);

    // 2. Сохранить entry_summary для Token Optimization (КРИТИЧНО!)
    if (entry.aiSummary || entry.aiInsight) {
      const { error: summaryError } = await supabase
        .from('entry_summaries')
        .insert({
          entry_id: savedEntry.id,
          user_id: entry.userId,
          summary_json: {
            text: entry.aiSummary || entry.text.substring(0, 200),
            insight: entry.aiInsight || '',
            mood: entry.mood || 'хорошее',
            sentiment: entry.sentiment || 'positive',
            contexts: [],
            tags: entry.tags || [],
            achievements: entry.isAchievement ? [{ text: entry.aiSummary || entry.text.substring(0, 100) }] : [],
            keywords: entry.text.split(' ').filter((w: string) => w.length > 3).slice(0, 5),
            excerpt: entry.text.substring(0, 200),
            confidence: 0.95
          },
          tokens_used: 0 // Will be updated if AI analysis was used
        });

      if (summaryError) {
        console.error('⚠️ Failed to save entry_summary:', summaryError);
        // Не бросаем ошибку, продолжаем
      } else {
        console.log(`✅ Entry summary saved for entry: ${savedEntry.id}`);
      }
    }

    // 3. Также сохраняем в KV store для быстрого доступа (кэш)
    const entryData = {
      id: savedEntry.id,
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
      createdAt: savedEntry.created_at,
      streakDay: entry.streakDay || 1,
      focusArea: entry.focusArea || entry.category || 'Личное развитие'
    };

    await kv.set(`entry:${savedEntry.id}`, entryData);

    // Добавляем в список записей пользователя
    const userEntriesKey = `user_entries:${entry.userId}`;
    const existingEntries = await kv.get(userEntriesKey) || [];
    const updatedEntries = [savedEntry.id, ...existingEntries];
    await kv.set(userEntriesKey, updatedEntries);

    console.log(`✅ Entry cached in KV store with ${entry.media?.length || 0} media files`);

    return c.json({
      success: true,
      entry: entryData
    });

  } catch (error) {
    console.error('❌ Error creating entry:', error);
    return c.json({
      success: false,
      error: `Failed to create entry: ${error.message}`
    }, 500);
  }
});

// Получить записи пользователя
app.get('/make-server-9729c493/entries/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    
    console.log(`Fetching entries for user: ${userId}, limit: ${limit}, offset: ${offset}`);

    const userEntries = await kv.get(`user_entries:${userId}`) || [];
    
    // Получаем записи с пагинацией
    const entryIds = userEntries.slice(offset, offset + limit);
    const entries = await Promise.all(
      entryIds.map(id => kv.get(`entry:${id}`))
    );

    // Фильтруем null значения и сортируем по дате
    const validEntries = entries
      .filter(entry => entry !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({
      success: true,
      entries: validEntries,
      total: userEntries.length,
      hasMore: offset + limit < userEntries.length
    });

  } catch (error) {
    console.error('Error fetching entries:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch entries: ${error.message}` 
    }, 500);
  }
});

// Получить записи пользователя (старый endpoint для совместимости)
app.get('/make-server-9729c493/entries/list', async (c) => {
  try {
    const userId = c.req.query('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    
    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }
    
    console.log(`Fetching entries for user: ${userId}, limit: ${limit}, offset: ${offset}`);

    const userEntries = await kv.get(`user_entries:${userId}`) || [];
    console.log(`Found ${userEntries.length} entry IDs for user ${userId}:`, userEntries);
    
    // Получаем записи с пагинацией
    const entryIds = userEntries.slice(offset, offset + limit);
    console.log(`Fetching ${entryIds.length} entries with IDs:`, entryIds);
    
    const entries = await Promise.all(
      entryIds.map(async (id) => {
        const entry = await kv.get(`entry:${id}`);
        console.log(`Entry ${id}:`, entry ? 'found' : 'not found');
        return entry;
      })
    );

    console.log(`Retrieved ${entries.length} entries, ${entries.filter(e => e).length} valid`);

    // Фильтруем null значения и сортируем по дате
    const validEntries = entries
      .filter(entry => entry !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({
      success: true,
      entries: validEntries,
      total: userEntries.length,
      hasMore: offset + limit < userEntries.length
    });

  } catch (error) {
    console.error('Error fetching entries:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch entries: ${error.message}` 
    }, 500);
  }
});

// Получить статистику пользователя
app.get('/make-server-9729c493/stats/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log(`Fetching stats for user: ${userId}`);

    const userEntries = await kv.get(`user_entries:${userId}`) || [];
    const entries = await Promise.all(
      userEntries.map(id => kv.get(`entry:${id}`))
    );

    const validEntries = entries.filter(entry => entry !== null);
    
    // Подсчитываем статистику
    const totalEntries = validEntries.length;
    const achievements = validEntries.filter(entry => entry.isAchievement).length;
    const streak = calculateStreak(validEntries);
    
    // Статистика по категориям
    const categoryStats = {};
    validEntries.forEach(entry => {
      const category = entry.category || 'другое';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    // Статистика по настроению
    const moodStats = {};
    validEntries.forEach(entry => {
      const mood = entry.mood || 'хорошее';
      moodStats[mood] = (moodStats[mood] || 0) + 1;
    });

    const stats = {
      totalEntries,
      achievements,
      streak,
      categoryStats,
      moodStats,
      lastEntry: validEntries.length > 0 ? validEntries[0].createdAt : null
    };

    return c.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch stats: ${error.message}` 
    }, 500);
  }
});

// ======================
// MOTIVATION CARDS
// ======================

// Получить мотивационные карточки для пользователя
app.get('/make-server-9729c493/motivations/cards/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log(`Fetching motivation cards for user: ${userId}`);

    // Получаем профиль пользователя для языка
    const profile = await kv.get(`profile:${userId}`);
    const userLanguage = profile?.language || 'ru';

    // Получаем записи пользователя за последние 48 часов
    const userEntries = await kv.get(`user_entries:${userId}`) || [];
    const yesterday = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const entries = await Promise.all(
      userEntries.map(id => kv.get(`entry:${id}`))
    );

    // Фильтруем записи за последние 48 часов
    const recentEntries = entries
      .filter(entry => entry !== null && new Date(entry.createdAt) >= yesterday)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Получаем просмотренные карточки из KV (TTL 24h)
    const viewedKey = `card_views:${userId}`;
    const viewedData = await kv.get(viewedKey);
    const viewedIds = viewedData || [];

    // Фильтруем непросмотренные записи
    const unviewedEntries = recentEntries.filter(entry => !viewedIds.includes(entry.id));

    // Создаем карточки из записей
    const cards = unviewedEntries.slice(0, 3).map(entry => ({
      id: entry.id,
      entryId: entry.id,
      date: new Date(entry.createdAt).toLocaleDateString(userLanguage === 'ru' ? 'ru-RU' : 'en-US'),
      title: entry.aiSummary ? entry.aiSummary.split(' ').slice(0, 3).join(' ') : entry.text.split(' ').slice(0, 3).join(' '),
      description: entry.aiInsight || entry.aiSummary || entry.text,
      gradient: getGradientBySentiment(entry.sentiment || 'positive'),
      isMarked: false,
      isDefault: false,
      sentiment: entry.sentiment || 'positive',
      mood: entry.mood || 'хорошее'
    }));

    // Если карточек меньше 3, добавляем дефолтные
    if (cards.length < 3) {
      const defaultCards = getDefaultMotivations(userLanguage);
      const needed = 3 - cards.length;
      cards.push(...defaultCards.slice(0, needed));
    }

    console.log(`Returning ${cards.length} motivation cards for user ${userId}`);

    return c.json({
      success: true,
      cards
    });

  } catch (error) {
    console.error('Error fetching motivation cards:', error);
    return c.json({
      success: false,
      error: `Failed to fetch motivation cards: ${error.message}`
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

    console.log(`Marking card ${cardId} as read for user ${userId}`);

    const viewedKey = `card_views:${userId}`;
    const viewedData = await kv.get(viewedKey);
    const viewedIds = viewedData || [];

    if (!viewedIds.includes(cardId)) {
      viewedIds.push(cardId);
      // Сохраняем с TTL 24 часа (86400 секунд)
      await kv.setex(viewedKey, 86400, viewedIds);
    }

    return c.json({
      success: true
    });

  } catch (error) {
    console.error('Error marking card as read:', error);
    return c.json({
      success: false,
      error: `Failed to mark card as read: ${error.message}`
    }, 500);
  }
});

// ======================
// UTILITY FUNCTIONS
// ======================

function calculateStreak(entries: any[]): number {
  if (entries.length === 0) return 0;

  // Сортируем записи по дате (новые первыми)
  const sortedEntries = entries.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.createdAt);
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (entryDate.getTime() < currentDate.getTime()) {
      // Пропустили день, прерываем серию
      break;
    }
  }

  return streak;
}

function getGradientBySentiment(sentiment: string): string {
  const gradients: Record<string, string[]> = {
    'positive': [
      'from-[#FE7669] to-[#ff8969]',
      'from-[#ff7769] to-[#ff6b9d]',
      'from-[#ff6b9d] to-[#c471ed]',
      'from-[#c471ed] to-[#8B78FF]'
    ],
    'neutral': [
      'from-[#4facfe] to-[#00f2fe]',
      'from-[#43e97b] to-[#38f9d7]'
    ],
    'negative': [
      'from-[#f093fb] to-[#f5576c]',
      'from-[#fa709a] to-[#fee140]'
    ]
  };

  const gradientList = gradients[sentiment] || gradients['positive'];
  return gradientList[Math.floor(Math.random() * gradientList.length)];
}

function getDefaultMotivations(language: string): any[] {
  const defaults: Record<string, any[]> = {
    'ru': [
      {
        id: 'default-1',
        date: new Date().toLocaleDateString('ru-RU'),
        title: 'Запиши момент благодарности',
        description: 'Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.',
        gradient: 'from-[#c471ed] to-[#8B78FF]',
        isMarked: false,
        isDefault: true,
        sentiment: 'grateful'
      },
      {
        id: 'default-2',
        date: new Date().toLocaleDateString('ru-RU'),
        title: 'Даже одна мысль делает день осмысленным',
        description: 'Не обязательно писать много — одна фраза может изменить твой взгляд на прожитый день.',
        gradient: 'from-[#ff6b9d] to-[#c471ed]',
        isMarked: false,
        isDefault: true,
        sentiment: 'calm'
      },
      {
        id: 'default-3',
        date: new Date().toLocaleDateString('ru-RU'),
        title: 'Сегодня отличное время',
        description: 'Запиши маленькую победу — это первый шаг к осознанию своих достижений.',
        gradient: 'from-[#43e97b] to-[#38f9d7]',
        isMarked: false,
        isDefault: true,
        sentiment: 'excited'
      }
    ],
    'en': [
      {
        id: 'default-1',
        date: new Date().toLocaleDateString('en-US'),
        title: 'Write a moment of gratitude',
        description: 'Feel the lightness when you notice the good in your life. This is the path to happiness.',
        gradient: 'from-[#c471ed] to-[#8B78FF]',
        isMarked: false,
        isDefault: true,
        sentiment: 'grateful'
      },
      {
        id: 'default-2',
        date: new Date().toLocaleDateString('en-US'),
        title: 'Even one thought makes the day meaningful',
        description: 'You don\'t have to write a lot — one phrase can change your view of the day.',
        gradient: 'from-[#ff6b9d] to-[#c471ed]',
        isMarked: false,
        isDefault: true,
        sentiment: 'calm'
      },
      {
        id: 'default-3',
        date: new Date().toLocaleDateString('en-US'),
        title: 'Today is a great time',
        description: 'Write down a small victory — it\'s the first step to realizing your achievements.',
        gradient: 'from-[#43e97b] to-[#38f9d7]',
        isMarked: false,
        isDefault: true,
        sentiment: 'excited'
      }
    ]
  };

  return defaults[language] || defaults['en'];
}

// ======================
// ADMIN API
// ======================

// Получить статистику для админ-панели
app.get('/make-server-9729c493/admin/stats', async (c) => {
  try {
    // Проверка авторизации супер-админа
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return c.json({ success: false, error: 'Access denied. Super admin only.' }, 403);
    }

    console.log('Fetching admin stats...');

    // Получаем все профили пользователей
    const profiles = await kv.getByPrefix('profile:');
    const totalUsers = profiles.length;

    // Получаем все записи
    const allEntriesData = await kv.getByPrefix('user_entries:');
    let totalEntries = 0;
    let activeUsersSet = new Set();
    let newUsersToday = 0;
    let activeTodaySet = new Set();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const profile of profiles) {
      // Подсчет новых пользователей сегодня
      if (profile.createdAt) {
        const createdDate = new Date(profile.createdAt);
        createdDate.setHours(0, 0, 0, 0);
        if (createdDate.getTime() === today.getTime()) {
          newUsersToday++;
        }
      }
    }

    // Подсчет записей и активных пользователей
    for (const entryIds of allEntriesData) {
      if (Array.isArray(entryIds)) {
        totalEntries += entryIds.length;
        
        // Загружаем записи для подсчета активности
        const entries = await Promise.all(
          entryIds.map(id => kv.get(`entry:${id}`))
        );
        
        // Активные пользователи (с записями)
        entries.filter(e => e).forEach(entry => {
          activeUsersSet.add(entry.userId);
          
          // Активные сегодня
          const entryDate = new Date(entry.createdAt);
          entryDate.setHours(0, 0, 0, 0);
          if (entryDate.getTime() === today.getTime()) {
            activeTodaySet.add(entry.userId);
          }
        });
      }
    }

    const stats = {
      totalUsers,
      totalEntries,
      activeUsers: activeUsersSet.size,
      newUsersToday,
      activeToday: activeTodaySet.size,
      averageEntriesPerUser: totalUsers > 0 ? Math.round(totalEntries / totalUsers) : 0,
      premiumUsers: profiles.filter(p => p.subscriptionStatus === 'active' || p.isPremium).length
    };

    return c.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch admin stats: ${error.message}` 
    }, 500);
  }
});

// Получить список всех пользователей для админ-панели
app.get('/make-server-9729c493/admin/users', async (c) => {
  try {
    // Проверка авторизации супер-админа
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return c.json({ success: false, error: 'Access denied. Super admin only.' }, 403);
    }

    console.log('Fetching all users for admin...');

    // Получаем все профили
    const profiles = await kv.getByPrefix('profile:');
    
    // Получаем статистику записей для каждого пользователя
    const usersWithStats = await Promise.all(
      profiles.map(async (profile) => {
        const entryIds = await kv.get(`user_entries:${profile.id}`) || [];
        const entriesCount = Array.isArray(entryIds) ? entryIds.length : 0;
        
        // Последняя активность
        let lastActivity = null;
        if (Array.isArray(entryIds) && entryIds.length > 0) {
          // Получаем все записи пользователя
          const entries = await Promise.all(
            entryIds.map(id => kv.get(`entry:${id}`))
          );
          const sortedEntries = entries.filter(e => e).sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          if (sortedEntries.length > 0) {
            lastActivity = sortedEntries[0].createdAt;
          }
        }

        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          createdAt: profile.createdAt,
          isPremium: profile.subscriptionStatus === 'active' || profile.isPremium || false,
          entriesCount,
          lastActivity,
          language: profile.language || 'ru'
        };
      })
    );

    // Сортируем по дате создания (новые первыми)
    usersWithStats.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({
      success: true,
      users: usersWithStats,
      total: usersWithStats.length
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch users: ${error.message}` 
    }, 500);
  }
});

// ======================
// ADMIN SETTINGS API
// ======================

// Получить настройку админа по ключу
app.get('/make-server-9729c493/admin/settings/:key', async (c) => {
  try {
    // Проверка авторизации супер-админа
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return c.json({ success: false, error: 'Access denied. Super admin only.' }, 403);
    }

    const key = c.req.param('key');
    console.log(`Fetching admin setting: ${key}`);

    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ success: false, error: 'Setting not found' }, 404);
      }
      throw error;
    }

    return c.json({
      success: true,
      setting: data
    });

  } catch (error) {
    console.error('Error fetching admin setting:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch admin setting: ${error.message}` 
    }, 500);
  }
});

// Сохранить настройку админа
app.post('/make-server-9729c493/admin/settings', async (c) => {
  try {
    // Проверка авторизации супер-админа
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return c.json({ success: false, error: 'Access denied. Super admin only.' }, 403);
    }

    const { key, value } = await c.req.json();

    if (!key || !value) {
      return c.json({ success: false, error: 'Key and value are required' }, 400);
    }

    console.log(`Saving admin setting: ${key}`);

    // Используем upsert для создания или обновления
    const { data, error } = await supabase
      .from('admin_settings')
      .upsert({
        key,
        value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return c.json({
      success: true,
      setting: data
    });

  } catch (error) {
    console.error('Error saving admin setting:', error);
    return c.json({ 
      success: false, 
      error: `Failed to save admin setting: ${error.message}` 
    }, 500);
  }
});

// ======================
// SUPPORTED LANGUAGES API
// ======================

// Получить все поддерживаемые языки
app.get('/make-server-9729c493/admin/languages', async (c) => {
  try {
    // Проверка авторизации супер-админа
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return c.json({ success: false, error: 'Access denied. Super admin only.' }, 403);
    }

    console.log('Fetching supported languages...');

    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('is_active', true)
      .order('code');

    if (error) {
      throw error;
    }

    return c.json({
      success: true,
      languages: data
    });

  } catch (error) {
    console.error('Error fetching supported languages:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch supported languages: ${error.message}` 
    }, 500);
  }
});

// Добавить новый поддерживаемый язык
app.post('/make-server-9729c493/admin/languages', async (c) => {
  try {
    // Проверка авторизации супер-админа
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return c.json({ success: false, error: 'Access denied. Super admin only.' }, 403);
    }

    const { code, name, native_name, flag, rtl = false } = await c.req.json();

    if (!code || !name || !native_name || !flag) {
      return c.json({ success: false, error: 'Code, name, native_name and flag are required' }, 400);
    }

    console.log(`Adding new language: ${code}`);

    const { data, error } = await supabase
      .from('languages')
      .insert({
        code: code.toLowerCase(),
        name,
        native_name,
        flag,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return c.json({ success: false, error: 'Language with this code already exists' }, 409);
      }
      throw error;
    }

    return c.json({
      success: true,
      language: data
    });

  } catch (error) {
    console.error('Error adding supported language:', error);
    return c.json({ 
      success: false, 
      error: `Failed to add supported language: ${error.message}` 
    }, 500);
  }
});

// Обновить поддерживаемый язык
app.put('/make-server-9729c493/admin/languages/:code', async (c) => {
  try {
    // Проверка авторизации супер-админа
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return c.json({ success: false, error: 'Access denied. Super admin only.' }, 403);
    }

    const code = c.req.param('code');
    const updates = await c.req.json();

    console.log(`Updating language: ${code}`);

    const { data, error } = await supabase
      .from('languages')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('code', code)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json({ success: false, error: 'Language not found' }, 404);
      }
      throw error;
    }

    return c.json({
      success: true,
      language: data
    });

  } catch (error) {
    console.error('Error updating supported language:', error);
    return c.json({ 
      success: false, 
      error: `Failed to update supported language: ${error.message}` 
    }, 500);
  }
});

// ======================
// TRANSLATIONS API
// ======================

// Получить все переводы
app.get('/make-server-9729c493/admin/translations', async (c) => {
  try {
    // Проверка авторизации супер-админа
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return c.json({ success: false, error: 'Access denied. Super admin only.' }, 403);
    }

    console.log('Fetching all translations...');

    const { data, error } = await supabase
      .from('translations')
      .select('*')
      .order('lang_code, translation_key');

    if (error) {
      throw error;
    }

    return c.json({
      success: true,
      translations: data
    });

  } catch (error) {
    console.error('Error fetching translations:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch translations: ${error.message}` 
    }, 500);
  }
});

// Сохранить перевод
app.post('/make-server-9729c493/admin/translations', async (c) => {
  try {
    // Проверка авторизации супер-админа
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return c.json({ success: false, error: 'Access denied. Super admin only.' }, 403);
    }

    const { lang_code, translation_key, translation_value } = await c.req.json();

    if (!lang_code || !translation_key || !translation_value) {
      return c.json({ success: false, error: 'lang_code, translation_key and translation_value are required' }, 400);
    }

    console.log(`Saving translation: ${lang_code}/${translation_key}`);

    // Используем upsert для создания или обновления
    const { data, error } = await supabase
      .from('translations')
      .upsert({
        lang_code,
        translation_key,
        translation_value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'lang_code,translation_key'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return c.json({
      success: true,
      translation: data
    });

  } catch (error) {
    console.error('Error saving translation:', error);
    return c.json({ 
      success: false, 
      error: `Failed to save translation: ${error.message}` 
    }, 500);
  }
});

// ======================
// PUBLIC I18N API ENDPOINTS
// ======================

// Получение всех поддерживаемых языков (публичный)
app.get('/make-server-9729c493/i18n/languages', async (c) => {
  try {
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('is_active', true)
      .order('code');

    if (error) throw error;
    
    return c.json({
      success: true,
      languages: data || []
    });
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    return c.json({
      success: false,
      error: `Failed to fetch supported languages: ${error.message}`
    }, 500);
  }
});

// Получение переводов для языка (публичный)
app.get('/make-server-9729c493/i18n/translations/:lang', async (c) => {
  try {
    const lang = c.req.param('lang');
    const ifNoneMatch = c.req.header('If-None-Match');
    
    // Проверяем валидность языка
    if (!lang || !/^[a-z]{2}$/.test(lang)) {
      return c.json({
        success: false,
        error: 'Invalid language code'
      }, 400);
    }
    
    // Получаем переводы из базы
    const { data: translations, error } = await supabase
      .from('translations')
      .select('translation_key, translation_value, updated_at')
      .eq('lang_code', lang);
    
    if (error) throw error;
    
    if (!translations || translations.length === 0) {
      // Если переводов нет, пробуем вернуть fallback
      console.log(`No translations found for ${lang}, trying fallback`);
      
      const { data: fallbackData } = await supabase
        .from('translations')
        .select('translation_key, translation_value, updated_at')
        .eq('lang_code', 'ru')
        .limit(50);
      
      if (!fallbackData || fallbackData.length === 0) {
        return c.json({
          success: false,
          error: 'Translations not found'
        }, 404);
      }
      
      translations.push(...fallbackData);
    }
    
    // Генерируем ETag на основе времени последнего обновления
    const lastUpdated = Math.max(...translations.map(t => new Date(t.updated_at).getTime()));
    const etag = `"${lastUpdated}"`;
    
    if (ifNoneMatch === etag) {
      return c.json(null, 304);
    }
    
    const translationMap = translations.reduce((acc, t) => {
      acc[t.translation_key] = t.translation_value;
      return acc;
    }, {} as Record<string, string>);
    
    return c.json(
      {
        success: true,
        translations: translationMap
      },
      200,
      { 'ETag': etag }
    );
  } catch (error) {
    console.error(`Error fetching translations for ${c.req.param('lang')}:`, error);
    return c.json({
      success: false,
      error: `Failed to fetch translations: ${error.message}`
    }, 500);
  }
});

// Получение списка всех ключей переводов
app.get('/make-server-9729c493/i18n/keys', async (c) => {
  try {
    // Получаем все уникальные ключи из переводов
    const { data, error } = await supabase
      .from('translations')
      .select('translation_key')
      .eq('lang_code', 'ru'); // Используем русский как базовый
    
    if (error) throw error;
    
    const keys = data ? [...new Set(data.map(t => t.translation_key))] : [];
    
    return c.json({
      success: true,
      keys
    });
  } catch (error) {
    console.error('Error fetching translation keys:', error);
    return c.json({
      success: false,
      error: `Failed to fetch translation keys: ${error.message}`
    }, 500);
  }
});

// Сообщение об отсутствующем переводе
app.post('/make-server-9729c493/i18n/missing', async (c) => {
  try {
    const { key, language, context, userAgent, timestamp } = await c.req.json();
    
    if (!key || !language) {
      return c.json({
        success: false,
        error: 'Key and language are required'
      }, 400);
    }
    
    // Проверяем, существует ли уже такой отчет
    const { data: existing } = await supabase
      .from('missing_translations')
      .select('*')
      .eq('translation_key', key)
      .eq('lang_code', language)
      .eq('context', context || '')
      .single();
    
    if (existing) {
      // Обновляем счетчик
      const { error: updateError } = await supabase
        .from('missing_translations')
        .update({
          report_count: existing.report_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      
      if (updateError) throw updateError;
    } else {
      // Создаем новый отчет
      const { error: insertError } = await supabase
        .from('missing_translations')
        .insert({
          translation_key: key,
          lang_code: language,
          context: context || null,
          user_agent: userAgent || null,
          report_count: 1,
          created_at: timestamp || new Date().toISOString()
        });
      
      if (insertError) throw insertError;
    }
    
    return c.json({
      success: true,
      message: 'Missing translation reported'
    });
  } catch (error) {
    console.error('Error reporting missing translation:', error);
    return c.json({
      success: false,
      error: `Failed to report missing translation: ${error.message}`
    }, 500);
  }
});

// Проверка здоровья API
app.get('/make-server-9729c493/i18n/health', async (c) => {
  try {
    // Простая проверка подключения к базе
    const { data, error } = await supabase
      .from('languages')
      .select('count')
      .limit(1)
      .single();
    
    if (error) throw error;
    
    return c.json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return c.json({
      success: false,
      status: 'error',
      error: error.message
    }, 500);
  }
});

// ======================
// ADMIN I18N API ENDPOINTS
// ======================

// Автоперевод через OpenAI
app.post('/make-server-9729c493/i18n/admin/translate', async (c) => {
  try {
    // Проверка авторизации супер-админа
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const openaiApiKey = c.req.header('X-OpenAI-Key');
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return c.json({ success: false, error: 'Access denied. Super admin only.' }, 403);
    }
    
    if (!openaiApiKey) {
      return c.json({ success: false, error: 'OpenAI API key required' }, 400);
    }
    
    const { sourceLanguage, targetLanguages } = await c.req.json();
    
    if (!sourceLanguage || !targetLanguages || !Array.isArray(targetLanguages)) {
      return c.json({
        success: false,
        error: 'sourceLanguage and targetLanguages array are required'
      }, 400);
    }
    
    console.log(`Starting auto-translation from ${sourceLanguage} to ${targetLanguages.join(', ')}`);
    
    // Получаем все ключи для перевода
    const { data: sourceKeys, error: keysError } = await supabase
      .from('translations')
      .select('translation_key, translation_value')
      .eq('lang_code', sourceLanguage);
    
    if (keysError) throw keysError;
    
    if (!sourceKeys || sourceKeys.length === 0) {
      return c.json({
        success: false,
        error: 'No source translations found'
      }, 404);
    }
    
    // Получаем существующие переводы для целевых языков
    const existingTranslations: Record<string, Set<string>> = {};
    
    for (const targetLang of targetLanguages) {
      const { data: existing } = await supabase
        .from('translations')
        .select('translation_key')
        .eq('lang_code', targetLang);
      
      existingTranslations[targetLang] = new Set(existing?.map(t => t.translation_key) || []);
    }
    
    // Определяем отсутствующие переводы
    const missingTranslations: Record<string, any[]> = {};
    
    for (const targetLang of targetLanguages) {
      const existing = existingTranslations[targetLang];
      missingTranslations[targetLang] = sourceKeys.filter(item => !existing.has(item.translation_key));
    }
    
    console.log('Missing translations by language:',
      Object.entries(missingTranslations).map(([lang, items]) => `${lang}: ${items.length}`));
    
    // Результаты автоперевода
    const results: Record<string, any[]> = {};
    
    // Переводим каждый язык
    for (const [targetLanguage, missingItems] of Object.entries(missingTranslations)) {
      if (missingItems.length === 0) {
        results[targetLanguage] = [];
        continue;
      }
      
      console.log(`Translating ${missingItems.length} keys to ${targetLanguage}`);
      
      // Разбиваем на пакеты по 10 ключей
      const batchSize = 10;
      const batches = [];
      
      for (let i = 0; i < missingItems.length; i += batchSize) {
        batches.push(missingItems.slice(i, i + batchSize));
      }
      
      const languageResults: any[] = [];
      
      // Обрабатываем каждый пакет
      for (const batch of batches) {
        try {
          // Формируем промпт для OpenAI
          const keyValuePairs = batch.map(item =>
            `"${item.translation_key}": "${item.translation_value}"`
          ).join('\n');
          
          const prompt = `You are a professional translator for a mobile app called "UNITY" - an achievement diary app.
Translate the following JSON keys from ${sourceLanguage} to ${targetLanguage}.

IMPORTANT RULES:
1. Keep the same tone and style as the original
2. Preserve formatting like line breaks, emojis, and special characters
3. For UI elements, keep translations concise and appropriate for mobile interfaces
4. For motivational content, be encouraging and positive
5. Return ONLY valid JSON format with the same keys
6. If unsure about context, provide a conservative translation
7. Handle placeholders like {name}, {count} correctly - keep them unchanged

{
${keyValuePairs}
}

Return the result in the same JSON format, keeping the same keys but with translated values.

IMPORTANT:
- Return ONLY the JSON object, no additional text
- Keep all keys exactly as they are
- Translate only the values
- Preserve any emojis, special characters, or placeholders`;
          
          // Вызываем OpenAI API
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4-turbo-preview',
              messages: [
                {
                  role: 'system',
                  content: `You are a professional translator for a mobile app called "UNITY" - an achievement diary app.`
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.3,
              max_tokens: 2000,
              response_format: { type: "json_object" }
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`OpenAI API error for ${targetLanguage}:`, errorText);
            throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          const content = data.choices[0]?.message?.content;
          
          if (!content) {
            throw new Error('No content from OpenAI');
          }
          
          // Парсим JSON ответ
          let translations: Record<string, string>;
          try {
            translations = JSON.parse(content);
          } catch (parseError) {
            console.error(`Failed to parse OpenAI response for ${targetLanguage}:`, content);
            throw new Error(`Invalid JSON from OpenAI: ${parseError}`);
          }
          
          // Обрабатываем результаты
          for (const item of batch) {
            const translatedText = translations[item.translation_key] || item.translation_key;
            
            languageResults.push({
              key: item.translation_key,
              originalText: item.translation_value,
              translatedText,
              confidence: this.calculateConfidence(translatedText, item.translation_key),
              needsReview: this.needsReview(translatedText, item.translation_key)
            });
            
            // Сохраняем в базу
            await supabase
              .from('translations')
              .upsert({
                lang_code: targetLanguage,
                translation_key: item.translation_key,
                translation_value: translatedText,
                needs_review: this.needsReview(translatedText, item.translation_key),
                confidence_score: this.calculateConfidence(translatedText, item.translation_key),
                auto_translated: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'lang_code,translation_key'
              });
          }
          
          // Небольшая задержка между запросами
          if (batches.indexOf(batch) < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
        } catch (error) {
          console.error(`Error translating batch to ${targetLanguage}:`, error);
          // Добавляем fallback результаты
          for (const item of batch) {
            languageResults.push({
              key: item.translation_key,
              originalText: item.translation_value,
              translatedText: item.translation_key, // Fallback
              confidence: 0,
              needsReview: true
            });
          }
        }
      }
      
      results[targetLanguage] = languageResults;
      console.log(`Completed translation for ${targetLanguage}: ${languageResults.length} keys`);
    }
    
    return c.json({
      success: true,
      results
    });
    
  } catch (error) {
    console.error('Error in auto-translation:', error);
    return c.json({
      success: false,
      error: `Auto-translation failed: ${error.message}`
    }, 500);
  }
});

// Обновление переводов
app.put('/make-server-9729c493/i18n/admin/translations', async (c) => {
  try {
    // Проверка авторизации супер-админа
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return c.json({ success: false, error: 'Access denied. Super admin only.' }, 403);
    }
    
    const { language, translations, autoTranslated } = await c.req.json();
    
    if (!language || !translations) {
      return c.json({
        success: false,
        error: 'Language and translations are required'
      }, 400);
    }
    
    console.log(`Updating ${Object.keys(translations).length} translations for ${language}`);
    
    // Обновляем переводы в базе
    const updatePromises = Object.entries(translations).map(async ([key, value]) => {
      return await supabase
        .from('translations')
        .upsert({
          lang_code: language,
          translation_key: key,
          translation_value: value as string,
          auto_translated: autoTranslated || false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'lang_code,translation_key'
        });
    });
    
    await Promise.all(updatePromises);
    
    return c.json({
      success: true,
      message: `Updated ${Object.keys(translations).length} translations for ${language}`
    });
    
  } catch (error) {
    console.error('Error updating translations:', error);
    return c.json({
      success: false,
      error: `Failed to update translations: ${error.message}`
    }, 500);
  }
});

// Получение статистики переводов
app.get('/make-server-9729c493/i18n/admin/stats', async (c) => {
  try {
    // Проверка авторизации супер-админа
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ success: false, error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return c.json({ success: false, error: 'Access denied. Super admin only.' }, 403);
    }
    
    // Получаем все языки
    const { data: languages, error: langError } = await supabase
      .from('languages')
      .select('*')
      .eq('is_active', true);
    
    if (langError) throw langError;
    
    // Получаем общее количество ключей
    const { data: totalKeysResult, error: keysError } = await supabase
      .from('translations')
      .select('translation_key')
      .eq('lang_code', 'ru');
    
    if (keysError) throw keysError;
    
    const totalKeys = totalKeysResult ? [...new Set(totalKeysResult.map(t => t.translation_key))].length : 0;
    
    // Получаем статистику по каждому языку
    const languageStats: Record<string, any> = {};
    
    for (const lang of languages || []) {
      const { data: langTranslations, error: langError } = await supabase
        .from('translations')
        .select('translation_key, updated_at, needs_review')
        .eq('lang_code', lang.code);
      
      if (langError) throw langError;
      
      const translatedKeys = langTranslations ? [...new Set(langTranslations.map(t => t.translation_key))] : [];
      const needsReview = langTranslations ? langTranslations.filter(t => t.needs_review).length : 0;
      const lastUpdated = langTranslations && langTranslations.length > 0
        ? Math.max(...langTranslations.map(t => new Date(t.updated_at).getTime()))
        : 0;
      
      languageStats[lang.code] = {
        translatedKeys: translatedKeys.length,
        progress: totalKeys > 0 ? Math.round((translatedKeys.length / totalKeys) * 100) : 0,
        needsReview,
        lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null
      };
    }
    
    return c.json({
      success: true,
      stats: {
        totalKeys,
        translatedKeys: Object.fromEntries(
          Object.entries(languageStats).map(([code, stats]) => [code, stats.translatedKeys])
        ),
        progress: Object.fromEntries(
          Object.entries(languageStats).map(([code, stats]) => [code, stats.progress])
        ),
        lastUpdated: Object.fromEntries(
          Object.entries(languageStats).map(([code, stats]) => [code, stats.lastUpdated])
        )
      }
    });
    
  } catch (error) {
    console.error('Error fetching translation stats:', error);
    return c.json({
      success: false,
      error: `Failed to fetch stats: ${error.message}`
    }, 500);
  }
});

// Вспомогательные функции для автоперевода
function calculateConfidence(translation: string, key: string): number {
  if (!translation || translation.length === 0) return 0;
  if (translation === key) return 0.1;
  
  let confidence = 0.8;
  
  if (translation.length < 3) confidence -= 0.3;
  if (translation.length > 100) confidence -= 0.1;
  
  if (translation.includes('??') || translation.includes('???')) confidence -= 0.4;
  if (translation.includes('[missing') || translation.includes('[undefined')) confidence -= 0.5;
  
  const englishWords = /\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi;
  if (englishWords.test(translation) && translation.length > 10) confidence -= 0.2;
  
  if (translation.includes(' ') && translation.length > 5) confidence += 0.1;
  if (!/[a-z]{10,}/i.test(translation)) confidence += 0.1;
  
  return Math.max(0, Math.min(1, confidence));
}

function needsReview(translation: string, key: string): boolean {
  const criticalKeys = [
    'app_title', 'app_subtitle', 'legal_terms', 'privacy_policy',
    'welcome_title', 'diary_name'
  ];
  
  if (criticalKeys.includes(key)) return true;
  
  const suspiciousPatterns = [
    /\?\?+/g,
    /\[.*?\]/g,
    /translation/i,
    /undefined/i,
    /missing/i,
    /\b[a-z]{15,}\b/gi
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(translation));
}

// Запуск сервера
Deno.serve(app.fetch);
