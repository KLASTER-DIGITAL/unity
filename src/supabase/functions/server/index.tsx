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
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', logger(console.log));

// Инициализация Supabase клиента
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ======================
// VOICE TRANSCRIPTION (Whisper API)
// ======================
app.post('/make-server-9729c493/transcribe', async (c) => {
  try {
    const { audio, mimeType } = await c.req.json();

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
    const { file, fileName, mimeType, userId } = await c.req.json();

    if (!file || !fileName || !userId) {
      return c.json({ success: false, error: 'file, fileName, and userId are required' }, 400);
    }

    console.log(`Uploading media for user ${userId}: ${fileName}`);

    // Конвертируем base64 в buffer
    const fileBuffer = Buffer.from(file, 'base64');

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const extension = fileName.split('.').pop();
    const uniqueFileName = `${userId}/${timestamp}_${fileName}`;

    // Загружаем файл в Supabase Storage
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET_NAME)
      .upload(uniqueFileName, fileBuffer, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      console.error('Error uploading to storage:', error);
      return c.json({ 
        success: false, 
        error: `Failed to upload: ${error.message}` 
      }, 500);
    }

    // Создаем signed URL (действителен 1 год)
    const { data: signedUrlData } = await supabase.storage
      .from(MEDIA_BUCKET_NAME)
      .createSignedUrl(uniqueFileName, 31536000); // 1 год в секундах

    console.log(`Media uploaded successfully: ${uniqueFileName}`);

    return c.json({
      success: true,
      path: uniqueFileName,
      url: signedUrlData?.signedUrl || '',
      mimeType
    });

  } catch (error) {
    console.error('Error in media upload:', error);
    return c.json({ 
      success: false, 
      error: `Failed to upload media: ${error.message}` 
    }, 500);
  }
});

// Получить signed URL для медиа
app.post('/make-server-9729c493/media/signed-url', async (c) => {
  try {
    const { path } = await c.req.json();

    if (!path) {
      return c.json({ success: false, error: 'path is required' }, 400);
    }

    // Создаем signed URL (действителен 1 год)
    const { data, error } = await supabase.storage
      .from(MEDIA_BUCKET_NAME)
      .createSignedUrl(path, 31536000);

    if (error) {
      console.error('Error creating signed URL:', error);
      return c.json({ 
        success: false, 
        error: `Failed to create signed URL: ${error.message}` 
      }, 500);
    }

    return c.json({
      success: true,
      url: data.signedUrl
    });

  } catch (error) {
    console.error('Error creating signed URL:', error);
    return c.json({ 
      success: false, 
      error: `Failed to create signed URL: ${error.message}` 
    }, 500);
  }
});

// Удалить медиа файл
app.delete('/make-server-9729c493/media/:path', async (c) => {
  try {
    const path = c.req.param('path');

    if (!path) {
      return c.json({ success: false, error: 'path is required' }, 400);
    }

    // Удаляем файл из Storage
    const { error } = await supabase.storage
      .from(MEDIA_BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Error deleting from storage:', error);
      return c.json({ 
        success: false, 
        error: `Failed to delete: ${error.message}` 
      }, 500);
    }

    console.log(`Media deleted successfully: ${path}`);

    return c.json({
      success: true
    });

  } catch (error) {
    console.error('Error deleting media:', error);
    return c.json({ 
      success: false, 
      error: `Failed to delete media: ${error.message}` 
    }, 500);
  }
});

// ======================
// HEALTH CHECK
// ======================
app.get('/make-server-9729c493/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ======================
// USER PROFILES
// ======================

// Создать профиль пользователя
app.post('/make-server-9729c493/profiles/create', async (c) => {
  try {
    const profileData = await c.req.json();
    
    if (!profileData.id || !profileData.email) {
      return c.json({ success: false, error: 'id and email are required' }, 400);
    }

    const profile = {
      id: profileData.id,
      email: profileData.email,
      name: profileData.name || 'Пользователь',
      diaryName: profileData.diaryName || 'Мой дневник',
      diaryEmoji: profileData.diaryEmoji || '🏆',
      language: profileData.language || 'ru',
      notificationSettings: profileData.notificationSettings || {
        selectedTime: 'none',
        morningTime: '08:00',
        eveningTime: '21:00',
        permissionGranted: false
      },
      createdAt: new Date().toISOString()
    };

    // Сохраняем профиль
    await kv.set(`profile:${profileData.id}`, profile);

    console.log(`Created profile for user ${profileData.id}`);

    return c.json({
      success: true,
      profile
    });

  } catch (error) {
    console.error('Error creating profile:', error);
    return c.json({ 
      success: false, 
      error: `Failed to create profile: ${error.message}` 
    }, 500);
  }
});

// Получить профиль пользователя
app.get('/make-server-9729c493/profiles/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    let profile = await kv.get(`profile:${userId}`);
    
    // Если профиль не существует, создаем его автоматически
    if (!profile) {
      console.log(`Profile not found for user ${userId}, creating new profile...`);
      
      // Получаем данные пользователя из Supabase Auth
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (authError) {
        console.error('Error getting user from auth:', authError);
        return c.json({ success: false, error: 'User not found in auth' }, 404);
      }
      
      // Создаем новый профиль с дефолтными значениями
      profile = {
        id: userId,
        email: authUser.user.email,
        name: authUser.user.email?.split('@')[0] || 'User',
        diaryName: 'Мой дневник',
        diaryEmoji: '🏆',
        language: 'ru',
        notificationSettings: {
          selectedTime: 'none',
          morningTime: '08:00',
          eveningTime: '21:00',
          permissionGranted: false
        },
        onboardingCompleted: false, // Новый пользователь должен пройти онбординг
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Сохраняем профиль
      await kv.set(`profile:${userId}`, profile);
      console.log(`Created new profile for user ${userId}`);
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
app.put('/make-server-9729c493/profiles/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const updates = await c.req.json();
    
    // Получаем существующий профиль
    const existingProfile = await kv.get(`profile:${userId}`);
    
    if (!existingProfile) {
      return c.json({ success: false, error: 'Profile not found' }, 404);
    }

    // Обновляем профиль
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      id: userId, // Не позволяем изменить ID
      updatedAt: new Date().toISOString()
    };

    await kv.set(`profile:${userId}`, updatedProfile);

    console.log(`Updated profile for user ${userId}`);

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
// AI CHAT ANALYSIS
// ======================
app.post('/make-server-9729c493/chat/analyze', async (c) => {
  try {
    const { text, userName, userId } = await c.req.json();
    
    if (!text || typeof text !== 'string') {
      return c.json({ success: false, error: 'Text is required' }, 400);
    }

    console.log(`Analyzing text for user: ${userName || 'anonymous'}`);

    // Получить язык пользователя из профиля
    let userLanguage = 'ru';
    if (userId) {
      const profile = await kv.get(`profile:${userId}`);
      if (profile?.language) {
        userLanguage = profile.language;
      }
    }

    console.log(`User language: ${userLanguage}`);

    // Проверяем наличие OpenAI API ключа
    // Приоритет: 1) Ключ из заголовка (админ-панель), 2) Env переменная
    const openaiApiKey = c.req.header('X-OpenAI-Key') || Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY is not set in environment variables or request header');
      return c.json({ 
        success: false, 
        error: 'OpenAI API key is not configured. Please set it in admin panel or OPENAI_API_KEY environment variable.' 
      }, 500);
    }
    
    console.log(`Using OpenAI API key from: ${c.req.header('X-OpenAI-Key') ? 'admin panel' : 'environment variable'}`);

    // Запрос к OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Ты - мотивирующий AI-помощник в приложении "Дневник достижений".
ВАЖНО: Отвечай на языке пользователя (${userLanguage}).

Твоя задача - проанализировать запись пользователя и вернуть JSON со ВСЕМИ полями:

1. reply - короткий воодушевляющий ответ (1-2 предложения, эмоджи приветствуются)
2. summary - краткое резюме достижения (до 150 символов) - заголовок для карточки мотивации
3. insight - позитивный вывод/инсайт (до 150 символов) - что это значит для человека
4. sentiment - эмоциональная окраска: "positive", "neutral" или "negative"
5. category - категория из списка: Семья, Работа, Финансы, Благодарность, Здоровье, Личное развитие, Творчество, Отношения
6. tags - массив из 2-3 ключевых слов
7. confidence - уверенность анализа (0.0-1.0)
8. isAchievement - boolean, является ли это достижением
9. mood - настроение одним словом (радость, энергия, умиротворение, вдохновение и т.д.)

ОБЯЗАТЕЛЬНО верни ВСЕ 9 полей в JSON! Формат:
{
  "reply": "мотивирующий ответ на ${userLanguage}",
  "summary": "краткое резюме на ${userLanguage}",
  "insight": "позитивный вывод на ${userLanguage}",
  "sentiment": "positive",
  "category": "категория на ${userLanguage}",
  "tags": ["тег1", "тег2"],
  "confidence": 0.95,
  "isAchievement": true,
  "mood": "эмоция на ${userLanguage}"
}`
          },
          {
            role: 'user',
            content: `Проанализируй текст: "${text}"\nАвтор: ${userName || 'Аноним'}\nЯзык ответа: ${userLanguage}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" }
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      return c.json({ 
        success: false, 
        error: `OpenAI API error: ${openaiResponse.status}` 
      }, 500);
    }

    const openaiData = await openaiResponse.json();
    console.log('OpenAI response:', openaiData);

    const aiMessage = openaiData.choices?.[0]?.message?.content;
    if (!aiMessage) {
      throw new Error('No response from OpenAI');
    }

    // Парсим JSON ответ от AI
    let analysis;
    try {
      analysis = JSON.parse(aiMessage);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiMessage);
      // Fallback если AI вернул не JSON
      analysis = {
        reply: aiMessage,
        summary: text.substring(0, 100),
        insight: 'Каждое достижение приближает тебя к цели!',
        sentiment: 'positive',
        category: 'Личное развитие',
        tags: ['достижение'],
        confidence: 0.5,
        isAchievement: true,
        mood: 'вдохновение'
      };
    }

    // Сохраняем summary в entry_summaries для оптимизации токенов
    let entrySummaryId = null;
    if (userId) {
      try {
        const summaryJson = {
          text: analysis.summary || text.substring(0, 100),
          insight: analysis.insight || 'Каждое достижение приближает тебя к цели!',
          mood: analysis.mood || 'вдохновение',
          sentiment: analysis.sentiment || 'positive',
          contexts: [], // Будет заполнено при создании записи
          tags: analysis.tags || [],
          achievements: analysis.isAchievement ? [analysis.summary] : [],
          keywords: analysis.tags || [],
          excerpt: text.substring(0, 200),
          confidence: analysis.confidence || 0.5
        };

        const { data: summaryData, error: summaryError } = await supabase
          .from('entry_summaries')
          .insert({
            entry_id: null, // Будет обновлено при создании записи
            user_id: userId,
            summary_json: summaryJson,
            tokens_used: openaiData.usage?.total_tokens || 0
          })
          .select()
          .single();

        if (summaryError) {
          console.error('Error saving entry summary:', summaryError);
        } else {
          entrySummaryId = summaryData.id;
          console.log('Entry summary saved:', entrySummaryId);
        }
      } catch (summaryError) {
        console.error('Error in summary saving:', summaryError);
      }
    }

    return c.json({
      success: true,
      analysis: {
        reply: analysis.reply || 'Отлично! Продолжай в том же духе! 💪',
        summary: analysis.summary || text.substring(0, 100),
        insight: analysis.insight || 'Каждое достижение приближает тебя к цели!',
        sentiment: analysis.sentiment || 'positive',
        category: analysis.category || 'Личное развитие',
        tags: analysis.tags || [],
        confidence: analysis.confidence || 0.5,
        isAchievement: analysis.isAchievement !== undefined ? analysis.isAchievement : true,
        mood: analysis.mood || 'вдохновение',
        entrySummaryId: entrySummaryId // Добавляем ID summary для связи с записью
      }
    });

  } catch (error) {
    console.error('Error in chat analysis:', error);
    return c.json({ 
      success: false, 
      error: `Chat analysis error: ${error.message}` 
    }, 500);
  }
});

// ======================
// DIARY ENTRIES
// ======================

// Создать новую запись
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

    // Обновляем entry_summaries с entry_id если есть entrySummaryId
    if (entry.entrySummaryId) {
      try {
        const { error: updateError } = await supabase
          .from('entry_summaries')
          .update({ entry_id: entryId })
          .eq('id', entry.entrySummaryId);

        if (updateError) {
          console.error('Error updating entry summary with entry_id:', updateError);
        } else {
          console.log('Entry summary linked to entry:', entryId);
        }
      } catch (linkError) {
        console.error('Error linking entry summary:', linkError);
      }
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

// Получить список записей пользователя
app.get('/make-server-9729c493/entries/list', async (c) => {
  try {
    const userId = c.req.query('userId');
    const limit = parseInt(c.req.query('limit') || '50');

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    // Получаем список ID записей пользователя
    const userEntriesKey = `user_entries:${userId}`;
    const entryIds = await kv.get(userEntriesKey) || [];

    // Получаем сами записи
    const entries = [];
    for (const entryId of entryIds.slice(0, limit)) {
      const entry = await kv.get(`entry:${entryId}`);
      if (entry) {
        entries.push(entry);
      }
    }

    // Сортируем по дате создания (новые первыми)
    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`Retrieved ${entries.length} entries for user ${userId}`);

    return c.json({
      success: true,
      entries
    });

  } catch (error) {
    console.error('Error fetching entries:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch entries: ${error.message}` 
    }, 500);
  }
});

// Получить одну запись
app.get('/make-server-9729c493/entries/:id', async (c) => {
  try {
    const entryId = c.req.param('id');
    
    const entry = await kv.get(`entry:${entryId}`);
    
    if (!entry) {
      return c.json({ success: false, error: 'Entry not found' }, 404);
    }

    return c.json({
      success: true,
      entry
    });

  } catch (error) {
    console.error('Error fetching entry:', error);
    return c.json({ 
      success: false, 
      error: `Failed to fetch entry: ${error.message}` 
    }, 500);
  }
});

// Удалить запись
app.delete('/make-server-9729c493/entries/:id', async (c) => {
  try {
    const entryId = c.req.param('id');
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    // Удаляем запись
    await kv.del(`entry:${entryId}`);

    // Удаляем из списка пользователя
    const userEntriesKey = `user_entries:${userId}`;
    const entryIds = await kv.get(userEntriesKey) || [];
    const updatedIds = entryIds.filter((id: string) => id !== entryId);
    await kv.set(userEntriesKey, updatedIds);

    console.log(`Deleted entry ${entryId} for user ${userId}`);

    return c.json({
      success: true
    });

  } catch (error) {
    console.error('Error deleting entry:', error);
    return c.json({ 
      success: false, 
      error: `Failed to delete entry: ${error.message}` 
    }, 500);
  }
});

// ======================
// USER STATISTICS
// ======================
app.get('/make-server-9729c493/stats/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    // Получаем все записи пользователя
    const userEntriesKey = `user_entries:${userId}`;
    const entryIds = await kv.get(userEntriesKey) || [];

    const entries = [];
    for (const entryId of entryIds) {
      const entry = await kv.get(`entry:${entryId}`);
      if (entry) {
        entries.push(entry);
      }
    }

    // Вычисляем статистику
    const categoryCounts: { [key: string]: number } = {};
    const sentimentCounts: { [key: string]: number } = {};
    let lastEntryDate = null;

    for (const entry of entries) {
      // Категории
      categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + 1;
      
      // Sentiment
      sentimentCounts[entry.sentiment] = (sentimentCounts[entry.sentiment] || 0) + 1;
      
      // Последняя запись
      if (!lastEntryDate || new Date(entry.createdAt) > new Date(lastEntryDate)) {
        lastEntryDate = entry.createdAt;
      }
    }

    // Вычисляем streak
    const currentStreak = calculateStreak(entries);

    const stats = {
      totalEntries: entries.length,
      currentStreak,
      categoryCounts,
      sentimentCounts,
      lastEntryDate
    };

    console.log(`Retrieved stats for user ${userId}:`, stats);

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

// Вспомогательная функция для вычисления streak
function calculateStreak(entries: any[]): number {
  if (entries.length === 0) return 0;

  // Сортируем записи по дате (новые первыми)
  const sorted = entries
    .map(e => new Date(e.createdAt))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Проверяем, есть ли запись сегодня или вчера
  const latestEntry = new Date(sorted[0]);
  latestEntry.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today.getTime() - latestEntry.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff > 1) {
    return 0; // Streak прервался
  }

  // Считаем последовательные дни
  for (let i = 1; i < sorted.length; i++) {
    const currentDate = new Date(sorted[i]);
    currentDate.setHours(0, 0, 0, 0);
    
    const prevDate = new Date(sorted[i - 1]);
    prevDate.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      streak++;
    } else if (diff === 0) {
      // Несколько записей в один день - не увеличиваем streak
      continue;
    } else {
      break; // Streak прервался
    }
  }

  return streak;
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
    for (const profile of profiles) {
      const userEntriesKey = `user_entries:${profile.id}`;
      const userEntryIds = await kv.get(userEntriesKey);
      
      if (Array.isArray(userEntryIds) && userEntryIds.length > 0) {
        totalEntries += userEntryIds.length;
        activeUsersSet.add(profile.id);
        
        // Проверяем записи за сегодня
        for (const entryId of userEntryIds) {
          const entry = await kv.get(`entry:${entryId}`);
          if (entry && entry.createdAt) {
            const entryDate = new Date(entry.createdAt);
            entryDate.setHours(0, 0, 0, 0);
            
            if (entryDate.getTime() === today.getTime()) {
              activeTodaySet.add(profile.id);
            }
          }
        }
      }
    }

    const activeUsers = activeUsersSet.size;
    const activeToday = activeTodaySet.size;

    // Подсчет премиум пользователей
    let premiumUsers = 0;
    for (const profile of profiles) {
      if (profile.subscriptionStatus === 'active' || profile.isPremium) {
        premiumUsers++;
      }
    }

    // Подсчет дохода (примерная оценка: 499 руб/месяц за премиум)
    const totalRevenue = premiumUsers * 499;

    // Подсчет PWA установок
    let pwaInstalls = 0;
    for (const profile of profiles) {
      if (profile.pwaInstalled) {
        pwaInstalls++;
      }
    }

    const stats = {
      totalUsers,
      activeUsers,
      premiumUsers,
      totalRevenue,
      newUsersToday,
      activeToday,
      totalEntries,
      pwaInstalls
    };

    console.log('Admin stats calculated:', stats);

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
        const userEntriesKey = `user_entries:${profile.id}`;
        const entryIds = await kv.get(userEntriesKey) || [];
        const entriesCount = Array.isArray(entryIds) ? entryIds.length : 0;
        
        // Последняя активность
        let lastActivity = null;
        if (Array.isArray(entryIds) && entryIds.length > 0) {
          // Получаем последнюю запись по ID
          const lastEntryId = entryIds[0]; // ID уже отсортированы по дате создания
          const lastEntry = await kv.get(`entry:${lastEntryId}`);
          if (lastEntry && lastEntry.createdAt) {
            lastActivity = lastEntry.createdAt;
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

    console.log(`Retrieved ${usersWithStats.length} users`);

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

// Запуск сервера
Deno.serve(app.fetch);
