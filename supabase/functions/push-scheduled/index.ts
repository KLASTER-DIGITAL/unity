/**
 * Push Scheduled Edge Function
 * 
 * Отправляет запланированные push уведомления:
 * - Ежедневные напоминания в 21:00 (daily_reminder)
 * - Еженедельные мотивационные карточки (weekly_motivation)
 * - Напоминания о целях (goal_reminder)
 * 
 * Вызывается через Supabase Cron Jobs
 * 
 * Endpoints:
 * - POST /push-scheduled?type=daily_reminder - Ежедневное напоминание
 * - POST /push-scheduled?type=weekly_motivation - Еженедельная мотивация
 * - POST /push-scheduled?type=goal_reminder - Напоминание о целях
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
 * Получает всех пользователей с активными push subscriptions
 */
async function getUsersWithPushEnabled() {
  const { data, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('user_id')
    .eq('is_active', true);

  if (error) {
    console.error('[PUSH-SCHEDULED] Failed to get users:', error);
    return [];
  }

  // Уникальные user_id
  const uniqueUserIds = [...new Set(data.map(sub => sub.user_id))];
  return uniqueUserIds;
}

/**
 * Вызывает push-sender Edge Function для отправки уведомления
 */
async function sendPushNotification(
  userIds: string[],
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
          user_ids: userIds,
          title,
          body,
          icon: icon || '/icon-192.png',
          data: data || {},
        }),
      }
    );

    const result = await response.json();
    console.log('[PUSH-SCHEDULED] Push sent:', result);
    return result;
  } catch (error) {
    console.error('[PUSH-SCHEDULED] Failed to send push:', error);
    return null;
  }
}

/**
 * Отправляет ежедневное напоминание в 21:00
 */
async function sendDailyReminder() {
  console.log('[PUSH-SCHEDULED] Sending daily reminder...');
  
  const userIds = await getUsersWithPushEnabled();
  if (userIds.length === 0) {
    console.log('[PUSH-SCHEDULED] No users with push enabled');
    return { sent: 0, total: 0 };
  }

  const result = await sendPushNotification(
    userIds,
    '📝 Время записать достижения!',
    'Не забудьте записать свои достижения за сегодня',
    '/icon-192.png',
    {
      type: 'daily_reminder',
      url: '/?action=new',
    }
  );

  return result;
}

/**
 * Отправляет еженедельную мотивационную карточку
 */
async function sendWeeklyMotivation() {
  console.log('[PUSH-SCHEDULED] Sending weekly motivation...');
  
  const userIds = await getUsersWithPushEnabled();
  if (userIds.length === 0) {
    console.log('[PUSH-SCHEDULED] No users with push enabled');
    return { sent: 0, total: 0 };
  }

  // Получаем случайную мотивационную карточку
  const { data: cards } = await supabaseAdmin
    .from('motivation_cards')
    .select('title, description')
    .limit(1);

  const card = cards?.[0];
  const title = card?.title || '💪 Мотивация недели';
  const body = card?.description || 'Продолжайте двигаться к своим целям!';

  const result = await sendPushNotification(
    userIds,
    title,
    body,
    '/icon-192.png',
    {
      type: 'weekly_motivation',
      url: '/?view=motivation',
    }
  );

  return result;
}

/**
 * Отправляет напоминание о целях
 */
async function sendGoalReminder() {
  console.log('[PUSH-SCHEDULED] Sending goal reminder...');
  
  const userIds = await getUsersWithPushEnabled();
  if (userIds.length === 0) {
    console.log('[PUSH-SCHEDULED] No users with push enabled');
    return { sent: 0, total: 0 };
  }

  const result = await sendPushNotification(
    userIds,
    '🎯 Проверьте свои цели',
    'Как продвигается работа над вашими целями?',
    '/icon-192.png',
    {
      type: 'goal_reminder',
      url: '/?view=achievements',
    }
  );

  return result;
}

// Main handler
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get notification type from query params
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'daily_reminder';

    console.log('[PUSH-SCHEDULED] Processing scheduled push:', type);

    let result;
    switch (type) {
      case 'daily_reminder':
        result = await sendDailyReminder();
        break;
      
      case 'weekly_motivation':
        result = await sendWeeklyMotivation();
        break;
      
      case 'goal_reminder':
        result = await sendGoalReminder();
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: `Unknown type: ${type}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({
        success: true,
        type,
        result,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[PUSH-SCHEDULED] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

