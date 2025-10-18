// 📊 STATS MICROSERVICE v2 - Pure Deno
// Purpose: Get user statistics (entries count, achievements, streak, etc.)
// Architecture: Pure Deno.serve() (no Hono framework)
// Status: v2 - Production ready

import { createClient } from 'jsr:@supabase/supabase-js@2';

console.log('[STATS v2] 🚀 Starting stats microservice...');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
};

// Calculate streak from entries
function calculateStreak(entries: any[]) {
  if (!entries || entries.length === 0) {
    return { current: 0, longest: 0 };
  }

  const sorted = [...entries].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastEntryDate = new Date(sorted[0].created_at);
  lastEntryDate.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 1) {
    currentStreak = 1;
    let lastDate = lastEntryDate;
    
    for (let i = 1; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i].created_at);
      currentDate.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        currentStreak++;
      } else if (diff > 1) {
        break;
      }
      
      lastDate = currentDate;
    }
  }

  // Calculate longest streak
  let tempStreak = 1;
  let lastDate = new Date(sorted[0].created_at);
  lastDate.setHours(0, 0, 0, 0);
  
  for (let i = 1; i < sorted.length; i++) {
    const currentDate = new Date(sorted[i].created_at);
    currentDate.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (diff > 1) {
      tempStreak = 1;
    }
    
    lastDate = currentDate;
  }
  
  longestStreak = Math.max(longestStreak, currentStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
}

// Calculate mood distribution
function calculateMoodDistribution(entries: any[]) {
  const moodCounts: Record<string, number> = {};
  
  entries.forEach(entry => {
    const mood = entry.mood || 'хорошее';
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  const total = entries.length;
  
  return Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

// Calculate top categories
function calculateTopCategories(entries: any[]) {
  const categoryCounts: Record<string, number> = {};
  
  entries.forEach(entry => {
    const category = entry.category || 'Другое';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  return Object.entries(categoryCounts)
    .map(([name, count]) => ({
      name,
      count,
      trend: '+0'
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  
  console.log(`[STATS v2] ${req.method} ${path}`);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[STATS v2] ✅ OPTIONS handled');
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse path: /stats/user/{userId} or /{userId}
    const pathParts = path.split('/').filter(p => p);
    let userId: string | null = null;
    
    // Support both /stats/user/{userId} and /{userId}
    if (pathParts.length >= 2 && pathParts[0] === 'stats' && pathParts[1] === 'user') {
      userId = pathParts[2];
    } else if (pathParts.length === 1) {
      userId = pathParts[0];
    }
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required. Use /stats/user/{userId}' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[STATS v2] Getting stats for user: ${userId}`);

    // Get all entries for the user
    const { data: entries, error: entriesError } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (entriesError) {
      console.error('[STATS v2] Error getting entries:', entriesError);
      return new Response(
        JSON.stringify({ success: false, error: entriesError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`[STATS v2] Found ${entries?.length || 0} entries`);

    // Calculate statistics
    const streak = calculateStreak(entries || []);
    const moodDistribution = calculateMoodDistribution(entries || []);
    const topCategories = calculateTopCategories(entries || []);

    // Calculate level (1 entry = 10 XP, level every 100 XP)
    const totalXP = (entries?.length || 0) * 10;
    const level = Math.floor(totalXP / 100) + 1;
    const nextLevelProgress = (totalXP % 100);

    // Entries this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekEntries = entries?.filter(e => 
      new Date(e.created_at) > oneWeekAgo
    ).length || 0;

    const stats = {
      totalEntries: entries?.length || 0,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      level,
      nextLevelProgress,
      moodDistribution,
      topCategories,
      lastEntryDate: entries && entries.length > 0 ? entries[0].created_at : null,
      thisWeekEntries,
      categoryCounts: {},
      sentimentCounts: {}
    };

    console.log(`[STATS v2] ✅ Stats calculated:`, {
      totalEntries: stats.totalEntries,
      currentStreak: stats.currentStreak,
      level: stats.level
    });

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        version: 'v2'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[STATS v2] ❌ Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal server error',
        version: 'v2'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

console.log('[STATS v2] ✅ Microservice started');

