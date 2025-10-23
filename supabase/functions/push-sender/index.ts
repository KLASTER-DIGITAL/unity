/**
 * Push Sender Edge Function
 * 
 * Отправляет Web Push уведомления пользователям
 * 
 * Endpoints:
 * - POST /push-sender - Отправить push уведомление
 * 
 * Body:
 * {
 *   "user_ids": ["uuid1", "uuid2"], // Массив user_id или "all" для всех
 *   "title": "Заголовок",
 *   "body": "Текст уведомления",
 *   "icon": "/icon.png", // Опционально
 *   "badge": "/badge.png", // Опционально
 *   "data": {} // Опциональные данные
 * }
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// VAPID keys - будут храниться в admin_settings
let VAPID_PUBLIC_KEY: string | null = null;
let VAPID_PRIVATE_KEY: string | null = null;

/**
 * Загружает VAPID keys из admin_settings
 */
async function loadVapidKeys(supabaseAdmin: any): Promise<{ publicKey: string; privateKey: string }> {
  if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    return { publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('key, value')
      .in('key', ['vapid_public_key', 'vapid_private_key']);

    if (error) {
      console.error('Failed to load VAPID keys:', error);
      throw new Error('VAPID keys not configured');
    }

    const publicKeyRow = data.find((row: any) => row.key === 'vapid_public_key');
    const privateKeyRow = data.find((row: any) => row.key === 'vapid_private_key');

    if (!publicKeyRow || !privateKeyRow) {
      throw new Error('VAPID keys not found in admin_settings');
    }

    VAPID_PUBLIC_KEY = publicKeyRow.value;
    VAPID_PRIVATE_KEY = privateKeyRow.value;

    return { publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY };
  } catch (error) {
    console.error('Error loading VAPID keys:', error);
    throw error;
  }
}

/**
 * Отправляет push уведомление на один endpoint
 */
async function sendPushNotification(
  subscription: any,
  payload: any,
  vapidKeys: { publicKey: string; privateKey: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    // Используем web-push библиотеку через npm:
    // Для Edge Functions нужно использовать fetch API напрямую
    // или импортировать web-push через npm:
    
    // Временно используем простой fetch для демонстрации
    // В production нужно использовать web-push библиотеку
    
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400', // 24 hours
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Push notification failed:', response.status, response.statusText);
      return { success: false, error: `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Главный обработчик
 */
Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Получаем Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Проверяем авторизацию
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Проверяем что пользователь - super_admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Super admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Парсим body
    const body = await req.json();
    const { user_ids, title, body: messageBody, icon, badge, data } = body;

    if (!title || !messageBody) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Загружаем VAPID keys
    const vapidKeys = await loadVapidKeys(supabaseAdmin);

    // Получаем subscriptions
    let query = supabaseAdmin
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (user_ids && user_ids !== 'all') {
      query = query.in('user_id', user_ids);
    }

    const { data: subscriptions, error: subsError } = await query;

    if (subsError) {
      console.error('Failed to get subscriptions:', subsError);
      return new Response(
        JSON.stringify({ error: 'Failed to get subscriptions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active subscriptions found',
          sent: 0,
          failed: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Формируем payload
    const payload = {
      title,
      body: messageBody,
      icon: icon || '/icon-192.png',
      badge: badge || '/badge-72.png',
      data: data || {},
    };

    // Отправляем push уведомления
    const results = await Promise.all(
      subscriptions.map((sub) =>
        sendPushNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
          vapidKeys
        )
      )
    );

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    // Сохраняем в историю
    await supabaseAdmin.from('push_notifications_history').insert({
      title,
      body: messageBody,
      icon,
      badge,
      sent_by: user.id,
      total_sent: sent,
      total_delivered: 0, // Будет обновлено позже
      total_opened: 0, // Будет обновлено позже
      status: failed === 0 ? 'sent' : 'failed',
      metadata: {
        user_ids: user_ids === 'all' ? 'all' : user_ids,
        failed_count: failed,
        errors: results.filter((r) => !r.success).map((r) => r.error),
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        failed,
        total: subscriptions.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in push-sender:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

