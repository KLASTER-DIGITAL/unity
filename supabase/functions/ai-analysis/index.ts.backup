import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { Buffer } from 'node:buffer';

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
// HELPER: GET OPENAI KEY
// ======================

async function getOpenAIKey(headerKey?: string): Promise<string | null> {
  // Приоритет: 1) Ключ из заголовка (админ-панель), 2) Из БД (admin_settings), 3) Env переменная
  let openaiApiKey = headerKey;

  if (!openaiApiKey) {
    // Пытаемся получить из БД
    const { data: setting } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'openai_api_key')
      .single();

    if (setting?.value) {
      openaiApiKey = setting.value;
      console.log('✅ Using OpenAI key from admin_settings (database)');
    } else {
      // Fallback на env переменную
      openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (openaiApiKey) {
        console.log('⚠️ Using OpenAI key from env variable (fallback)');
      }
    }
  } else {
    console.log('✅ Using OpenAI key from header (admin panel)');
  }

  return openaiApiKey || null;
}

// ======================
// AI TEXT ANALYSIS
// ======================

app.post('/ai-analysis/analyze', async (c) => {
  try {
    const { text, userId, userName, userLanguage } = await c.req.json();

    if (!text) {
      return c.json({ success: false, error: 'Text is required' }, 400);
    }

    console.log('Analyzing text with AI...');

    // Получаем OpenAI ключ
    const openaiApiKey = await getOpenAIKey(c.req.header('X-OpenAI-Key'));

    if (!openaiApiKey) {
      return c.json({ 
        success: false, 
        error: 'OpenAI API key not configured. Please set it in admin panel.' 
      }, 500);
    }

    // Получаем профиль пользователя для контекста (если не передан)
    let finalUserName = userName || 'Пользователь';
    let finalUserLanguage = userLanguage || 'ru';

    if (userId && !userName) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, language')
        .eq('id', userId)
        .single();

      if (profile) {
        finalUserName = profile.name || finalUserName;
        finalUserLanguage = profile.language || finalUserLanguage;
      }
    }

    // Системный промпт для анализа
    const systemPrompt = `Ты - AI-ассистент для дневника достижений. Твоя задача - анализировать записи пользователей и предоставлять мотивационные ответы.

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

Отвечай на языке пользователя: ${finalUserLanguage}`;

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
        reply: 'Спасибо за вашу запись! Продолжайте вести дневник.',
        summary: 'Запись в дневнике',
        insight: 'Ведение дневника помогает лучше понимать себя.',
        isAchievement: false,
        mood: 'хорошее'
      };
    }

    console.log('✅ AI analysis successful:', analysis);

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
// VOICE TRANSCRIPTION (Whisper API)
// ======================

app.post('/ai-analysis/transcribe', async (c) => {
  try {
    const { audio, mimeType, userId } = await c.req.json();

    if (!audio) {
      return c.json({ success: false, error: 'Audio data is required' }, 400);
    }

    console.log('Transcribing audio with Whisper API...');

    // Получаем OpenAI ключ
    const openaiApiKey = await getOpenAIKey(c.req.header('X-OpenAI-Key'));

    if (!openaiApiKey) {
      return c.json({ 
        success: false, 
        error: 'OpenAI API key not configured. Please set it in admin panel.' 
      }, 500);
    }

    // Конвертируем base64 в buffer
    const audioBuffer = Buffer.from(audio, 'base64');

    // Определяем расширение файла
    const extension = mimeType?.includes('webm') ? 'webm' : 'mp4';
    const filename = `audio_${Date.now()}.${extension}`;

    // Создаем File объект для OpenAI
    const audioFile = new File([audioBuffer], filename, { type: mimeType || 'audio/webm' });

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

    console.log('✅ Transcription successful:', transcribedText);

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

// Health check endpoint
app.get('/ai-analysis/health', (c) => {
  return c.json({ 
    success: true, 
    service: 'ai-analysis',
    version: '1.0.0',
    endpoints: [
      'POST /ai-analysis/analyze',
      'POST /ai-analysis/transcribe',
      'GET /ai-analysis/health'
    ]
  });
});

Deno.serve(app.fetch);

