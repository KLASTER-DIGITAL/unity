/**
 * 🎤 TRANSCRIPTION API MICROSERVICE (STANDALONE)
 * Purpose: Voice transcription using OpenAI Whisper API
 * Architecture: Hono framework + OpenAI Whisper + Embedded utilities
 * Status: Production ready
 * Date: 2025-10-20
 * Note: Standalone version with embedded utilities for Supabase MCP deployment
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { Buffer } from 'node:buffer';
import { createClient } from 'jsr:@supabase/supabase-js@2';

console.log('[TRANSCRIPTION-API] 🚀 Starting standalone microservice...');

// ======================
// EMBEDDED UTILITIES
// ======================

// CORS middleware
const corsMiddleware = cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-OpenAI-Key', 'apikey', 'x-client-info'],
});

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get OpenAI API key
async function getOpenAIKey(headerKey?: string | null): Promise<string | null> {
  if (headerKey) return headerKey;
  
  try {
    const { data } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'openai_api_key')
      .single();
    if (data?.value) return data.value;
  } catch (error) {
    console.error('[AUTH] Error fetching OpenAI key:', error);
  }
  
  const envKey = Deno.env.get('OPENAI_API_KEY');
  if (envKey) return envKey;
  
  return null;
}

// Log OpenAI usage
async function logOpenAIUsage(userId: string, operationType: string, model: string, usage: any) {
  try {
    const totalTokens = usage.total_tokens || 0;
    const estimatedCost = (totalTokens / 60) * 0.006; // Whisper: $0.006/minute
    
    await supabase.from('openai_usage').insert({
      user_id: userId,
      operation_type: operationType,
      model,
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: totalTokens,
      estimated_cost: estimatedCost
    });
    
    console.log(`[OPENAI-LOGGER] ✅ Logged: ${operationType}, ${totalTokens} tokens, $${estimatedCost.toFixed(6)}`);
  } catch (error) {
    console.error('[OPENAI-LOGGER] Error logging usage:', error);
  }
}

// ======================
// HONO APP
// ======================

const app = new Hono();

app.use('*', corsMiddleware);
app.use('*', logger(console.log));

// Health check
app.get('/health', (c) => {
  return c.json({
    success: true,
    status: 'ok',
    service: 'transcription-api',
    timestamp: new Date().toISOString()
  });
});

// Single transcription
app.post('/transcribe', async (c) => {
  try {
    const { audio, mimeType, userId, language = 'ru' } = await c.req.json();

    if (!audio) {
      return c.json({ success: false, error: 'Audio data is required' }, 400);
    }

    console.log('[TRANSCRIPTION-API] Transcribing audio with Whisper API...');

    const openaiApiKey = await getOpenAIKey(c.req.header('X-OpenAI-Key'));
    if (!openaiApiKey) {
      return c.json({ success: false, error: 'OpenAI API key not configured' }, 500);
    }

    const audioBuffer = Buffer.from(audio, 'base64');
    const extension = mimeType?.includes('webm') ? 'webm' : 'mp4';
    const filename = `audio_${Date.now()}.${extension}`;
    const audioFile = new File([audioBuffer], filename, { type: mimeType || 'audio/webm' });

    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', language);

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiApiKey}` },
      body: formData
    });

    if (!whisperResponse.ok) {
      const error = await whisperResponse.text();
      console.error('[TRANSCRIPTION-API] Whisper API error:', error);
      return c.json({ success: false, error: `Whisper API failed: ${whisperResponse.status}` }, 500);
    }

    const result = await whisperResponse.json();
    const transcribedText = result.text;

    console.log('[TRANSCRIPTION-API] ✅ Transcription successful');

    if (userId) {
      const audioDurationSeconds = audioBuffer.length / (16000 * 2);
      await logOpenAIUsage(userId, 'transcription', 'whisper-1', {
        total_tokens: Math.ceil(audioDurationSeconds * 60)
      });
    }

    return c.json({
      success: true,
      text: transcribedText,
      language: result.language || language
    });

  } catch (error: any) {
    console.error('[TRANSCRIPTION-API] Error:', error);
    return c.json({ success: false, error: `Failed to transcribe: ${error.message}` }, 500);
  }
});

// Batch transcription
app.post('/transcribe/batch', async (c) => {
  try {
    const { audios, userId, language = 'ru' } = await c.req.json();

    if (!audios || !Array.isArray(audios) || audios.length === 0) {
      return c.json({ success: false, error: 'Audios array is required' }, 400);
    }

    console.log(`[TRANSCRIPTION-API] Batch transcribing ${audios.length} audio files...`);

    const openaiApiKey = await getOpenAIKey(c.req.header('X-OpenAI-Key'));
    if (!openaiApiKey) {
      return c.json({ success: false, error: 'OpenAI API key not configured' }, 500);
    }

    const results = [];

    for (let i = 0; i < audios.length; i++) {
      const { audio, mimeType } = audios[i];

      try {
        const audioBuffer = Buffer.from(audio, 'base64');
        const extension = mimeType?.includes('webm') ? 'webm' : 'mp4';
        const filename = `audio_${Date.now()}_${i}.${extension}`;
        const audioFile = new File([audioBuffer], filename, { type: mimeType || 'audio/webm' });

        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('model', 'whisper-1');
        formData.append('language', language);

        const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${openaiApiKey}` },
          body: formData
        });

        if (!whisperResponse.ok) {
          results.push({ index: i, success: false, error: `Whisper API failed: ${whisperResponse.status}` });
          continue;
        }

        const result = await whisperResponse.json();

        if (userId) {
          const audioDurationSeconds = audioBuffer.length / (16000 * 2);
          await logOpenAIUsage(userId, 'transcription', 'whisper-1', {
            total_tokens: Math.ceil(audioDurationSeconds * 60)
          });
        }

        results.push({
          index: i,
          success: true,
          text: result.text,
          language: result.language || language
        });

      } catch (error: any) {
        results.push({ index: i, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[TRANSCRIPTION-API] ✅ Batch complete: ${successCount}/${audios.length} successful`);

    return c.json({
      success: true,
      total: audios.length,
      successful: successCount,
      failed: audios.length - successCount,
      results
    });

  } catch (error: any) {
    console.error('[TRANSCRIPTION-API] Batch error:', error);
    return c.json({ success: false, error: `Failed to batch transcribe: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);

