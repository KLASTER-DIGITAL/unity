/**
 * Push Realtime Trigger Edge Function
 * 
 * Автоматически отправляет push уведомления при событиях в БД:
 * - Новая запись создана (entries INSERT)
 * - Новое достижение (achievements INSERT)
 * - AI-анализ готов (entry_summaries INSERT)
 * 
 * Вызывается через Database Webhooks или Supabase Realtime
 * 
 * Endpoints:
 * - POST /push-realtime-trigger - Обработать событие и отправить push
 * 
 * Body:
 * {
 *   "type": "INSERT",
 *   "table": "entries",
 *   "record": {...},
 *   "old_record": null
 * }
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase Admin Client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Получает push subscriptions для пользователя
 */
async function getUserPushSubscriptions(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    console.error('[PUSH-REALTIME] Failed to get subscriptions:', error);
    return [];
  }

  return data || [];
}

/**
 * Вызывает push-sender Edge Function для отправки уведомления
 */
async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  icon?: string,
  data?: Record<string, any>
) {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/push-sender`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          user_ids: [userId],
          title,
          body,
          icon: icon || '/icon-192.png',
          data: data || {},
        }),
      }
    );

    const result = await response.json();
    console.log('[PUSH-REALTIME] Push sent:', result);
    return result;
  } catch (error) {
    console.error('[PUSH-REALTIME] Failed to send push:', error);
    return null;
  }
}

/**
 * Обрабатывает INSERT события для entries
 */
async function handleEntryInsert(record: any) {
  const userId = record.user_id;
  
  // Проверяем есть ли активные subscriptions
  const subscriptions = await getUserPushSubscriptions(userId);
  if (subscriptions.length === 0) {
    console.log('[PUSH-REALTIME] No active subscriptions for user:', userId);
    return;
  }

  // Отправляем уведомление
  await sendPushNotification(
    userId,
    '✅ Запись сохранена!',
    'Ваша запись успешно добавлена в дневник',
    '/icon-192.png',
    {
      type: 'entry_created',
      entry_id: record.id,
      url: `/?view=history&entry=${record.id}`,
    }
  );
}

/**
 * Обрабатывает INSERT события для achievements
 */
async function handleAchievementInsert(record: any) {
  const userId = record.user_id;
  
  // Проверяем есть ли активные subscriptions
  const subscriptions = await getUserPushSubscriptions(userId);
  if (subscriptions.length === 0) {
    console.log('[PUSH-REALTIME] No active subscriptions for user:', userId);
    return;
  }

  // Отправляем уведомление
  await sendPushNotification(
    userId,
    '🎉 Новое достижение!',
    `Поздравляем! Вы достигли: ${record.title || 'новой цели'}`,
    '/icon-192.png',
    {
      type: 'achievement_unlocked',
      achievement_id: record.id,
      url: `/?view=achievements&achievement=${record.id}`,
    }
  );
}

/**
 * Обрабатывает INSERT события для entry_summaries (AI-анализ готов)
 */
async function handleSummaryInsert(record: any) {
  // Получаем entry для определения user_id
  const { data: entry } = await supabaseAdmin
    .from('entries')
    .select('user_id')
    .eq('id', record.entry_id)
    .single();

  if (!entry) {
    console.error('[PUSH-REALTIME] Entry not found for summary:', record.entry_id);
    return;
  }

  const userId = entry.user_id;
  
  // Проверяем есть ли активные subscriptions
  const subscriptions = await getUserPushSubscriptions(userId);
  if (subscriptions.length === 0) {
    console.log('[PUSH-REALTIME] No active subscriptions for user:', userId);
    return;
  }

  // Отправляем уведомление
  await sendPushNotification(
    userId,
    '🤖 AI-анализ готов!',
    'Ваша запись проанализирована. Посмотрите результаты!',
    '/icon-192.png',
    {
      type: 'ai_analysis_ready',
      entry_id: record.entry_id,
      url: `/?view=history&entry=${record.entry_id}`,
    }
  );
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse webhook payload
    const payload = await req.json();
    console.log('[PUSH-REALTIME] Received webhook:', payload);

    const { type, table, record } = payload;

    // Обрабатываем только INSERT события
    if (type !== 'INSERT') {
      console.log('[PUSH-REALTIME] Ignoring non-INSERT event:', type);
      return new Response(
        JSON.stringify({ success: true, message: 'Event ignored' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Обрабатываем события по таблицам
    switch (table) {
      case 'entries':
        // Проверяем is_achievement флаг для достижений
        if (record.is_achievement) {
          await handleAchievementInsert(record);
        } else {
          await handleEntryInsert(record);
        }
        break;

      case 'entry_summaries':
        await handleSummaryInsert(record);
        break;

      default:
        console.log('[PUSH-REALTIME] Unknown table:', table);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[PUSH-REALTIME] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

