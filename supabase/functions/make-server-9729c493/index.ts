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

// Создать новую запись
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

// Запуск сервера
Deno.serve(app.fetch);
