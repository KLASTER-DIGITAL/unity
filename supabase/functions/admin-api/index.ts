import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Проверка прав супер-админа
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user || user.email !== 'diary@leadshunter.biz') {
      return new Response(JSON.stringify({ error: 'Access denied. Super admin only.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /stats - общая статистика
    if (path === '/stats' && method === 'GET') {
      // Получаем всех пользователей из KV хранилища
      const { data: kvProfiles, error: kvError } = await supabaseClient
        .from('kv_store_9729c493')
        .select('key, value')
        .like('key', 'profile:%');

      if (kvError) throw kvError;

      // Получаем все записи из KV хранилища
      const { data: kvEntries, error: entriesError } = await supabaseClient
        .from('kv_store_9729c493')
        .select('key')
        .like('key', 'entry:%');

      if (entriesError) throw entriesError;

      // Подсчитываем статистику
      const totalUsers = kvProfiles.length;
      const totalEntries = kvEntries.length;
      
      // Активные пользователи (с записями за последние 7 дней)
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      let activeUsers = 0;
      for (const profile of kvProfiles) {
        const profileData = profile.value as any;
        if (profileData.updatedAt && new Date(profileData.updatedAt) > weekAgo) {
          activeUsers++;
        }
      }

      // Новые пользователи сегодня
      let newUsersToday = 0;
      for (const profile of kvProfiles) {
        const profileData = profile.value as any;
        if (profileData.createdAt && new Date(profileData.createdAt).toDateString() === today.toDateString()) {
          newUsersToday++;
        }
      }

      const stats = {
        totalUsers,
        activeUsers,
        premiumUsers: 0, // Пока нет подписок
        totalRevenue: 0,
        newUsersToday,
        activeToday: activeUsers,
        totalEntries,
        pwaInstalls: 0 // Пока нет метрик
      };

      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /users - список пользователей с пагинацией
    if (path === '/users' && method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = (page - 1) * limit;

      // Получаем всех пользователей из KV хранилища
      const { data: kvProfiles, error: kvError } = await supabaseClient
        .from('kv_store_9729c493')
        .select('key, value')
        .like('key', 'profile:%')
        .order('key');

      if (kvError) throw kvError;

      // Получаем записи для каждого пользователя
      const usersWithStats = await Promise.all(
        kvProfiles.slice(offset, offset + limit).map(async (profile) => {
          const userId = profile.key.replace('profile:', '');
          const profileData = profile.value as any;
          
          // Получаем количество записей пользователя
          const { data: userEntries } = await supabaseClient
            .from('kv_store_9729c493')
            .select('value')
            .eq('key', `user_entries:${userId}`)
            .single();

          const entriesCount = userEntries?.value?.length || 0;

          return {
            id: userId,
            name: profileData.name || 'Unknown',
            email: profileData.email || '',
            isPremium: false, // Пока нет подписок
            createdAt: profileData.createdAt || new Date().toISOString(),
            lastActivity: profileData.updatedAt || profileData.createdAt || new Date().toISOString(),
            entriesCount
          };
        })
      );

      const totalPages = Math.ceil(kvProfiles.length / limit);

      return new Response(JSON.stringify({
        users: usersWithStats,
        totalPages,
        currentPage: page,
        totalUsers: kvProfiles.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET /user/:userId/entries - записи конкретного пользователя
    if (path.startsWith('/user/') && path.endsWith('/entries') && method === 'GET') {
      const userId = path.split('/')[2];
      
      // Получаем список ID записей пользователя
      const { data: userEntries, error: entriesError } = await supabaseClient
        .from('kv_store_9729c493')
        .select('value')
        .eq('key', `user_entries:${userId}`)
        .single();

      if (entriesError) throw entriesError;

      const entryIds = userEntries?.value || [];
      
      // Получаем сами записи
      const entries = await Promise.all(
        entryIds.map(async (entryId: string) => {
          const { data: entryData } = await supabaseClient
            .from('kv_store_9729c493')
            .select('value')
            .eq('key', `entry:${entryId}`)
            .single();

          return entryData?.value || null;
        })
      );

      const validEntries = entries.filter(entry => entry !== null);

      return new Response(JSON.stringify(validEntries), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-api:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
