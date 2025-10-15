import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ======================
// UTILITY FUNCTIONS
// ======================

function calculateStreak(entries: any[]) {
  if (!entries || entries.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Сортировать по дате (новые первые)
  const sorted = [...entries].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  let lastDate = new Date(sorted[0].created_at);

  // Проверить текущую серию
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastEntryDate = new Date(sorted[0].created_at);
  lastEntryDate.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 1) {
    currentStreak = 1;
    
    for (let i = 1; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i].created_at);
      currentDate.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        currentStreak++;
        tempStreak++;
      } else if (diff > 1) {
        break;
      }
      
      lastDate = currentDate;
    }
  }

  // Вычислить самую длинную серию
  tempStreak = 1;
  lastDate = new Date(sorted[0].created_at);
  
  for (let i = 1; i < sorted.length; i++) {
    const currentDate = new Date(sorted[i].created_at);
    currentDate.setHours(0, 0, 0, 0);
    lastDate.setHours(0, 0, 0, 0);
    
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

function calculateMoodDistribution(entries: any[]) {
  const moodCounts: Record<string, number> = {};
  
  entries.forEach(entry => {
    const mood = entry.mood || 'хорошее';
    moodCounts[mood] = (moodCounts[mood] || 0) + 1;
  });

  const total = entries.length;
  
  return Object.entries(moodCounts)
    .map(([mood, count]) => ({
      mood: getMoodEmoji(mood),
      label: mood,
      count,
      percentage: Math.round((count / total) * 100)
    }))
    .sort((a, b) => b.count - a.count);
}

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
      trend: '+0' // TODO: вычислить тренд
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function getMoodEmoji(mood: string): string {
  const emojiMap: Record<string, string> = {
    'радость': '😊',
    'восторг': '😍',
    'уверенность': '💪',
    'благодарность': '🙏',
    'энтузиазм': '🤓',
    'удовлетворение': '😌',
    'хорошее': '😊',
    'спокойствие': '😌',
    'мотивация': '🔥',
    'гордость': '🏆',
    'вдохновение': '✨',
    'энергия': '⚡'
  };
  return emojiMap[mood.toLowerCase()] || '😊';
}

function calculateAchievements(entries: any[]) {
  const streak = calculateStreak(entries);
  
  const achievements = [
    {
      id: 1,
      name: "Первые шаги",
      description: "Создать первую запись",
      icon: "Star",
      earned: entries.length >= 1,
      rarity: "common",
      earnedDate: entries.length >= 1 ? "Получено" : null,
      progress: entries.length >= 1 ? 100 : 0
    },
    {
      id: 2,
      name: "Неделя силы",
      description: "7 дней записей подряд",
      icon: "Flame",
      earned: streak.current >= 7,
      rarity: "rare",
      earnedDate: streak.current >= 7 ? "Получено" : null,
      progress: Math.min(100, (streak.current / 7) * 100)
    },
    {
      id: 3,
      name: "Спортивный дух",
      description: "10 записей о спорте",
      icon: "Dumbbell",
      earned: entries.filter(e => 
        e.category === 'Спорт' || e.category === 'Здоровье'
      ).length >= 10,
      rarity: "common",
      earnedDate: null,
      progress: Math.min(100, (entries.filter(e => 
        e.category === 'Спорт' || e.category === 'Здоровье'
      ).length / 10) * 100)
    },
    {
      id: 4,
      name: "Книжный червь",
      description: "Прочитать 5 книг",
      icon: "BookOpen",
      earned: entries.filter(e => 
        e.category === 'Чтение' || e.category === 'Обучение'
      ).length >= 5,
      rarity: "uncommon",
      earnedDate: entries.filter(e => 
        e.category === 'Чтение' || e.category === 'Обучение'
      ).length >= 5 ? "Получено" : null,
      progress: Math.min(100, (entries.filter(e => 
        e.category === 'Чтение' || e.category === 'Обучение'
      ).length / 5) * 100)
    },
    {
      id: 5,
      name: "Месяц достижений",
      description: "30 дней записей подряд",
      icon: "Trophy",
      earned: streak.longest >= 30,
      rarity: "legendary",
      earnedDate: null,
      progress: Math.min(100, (streak.longest / 30) * 100)
    },
    {
      id: 6,
      name: "Продуктивный",
      description: "50 записей всего",
      icon: "Target",
      earned: entries.length >= 50,
      rarity: "uncommon",
      earnedDate: entries.length >= 50 ? "Получено" : null,
      progress: Math.min(100, (entries.length / 50) * 100)
    }
  ];

  return achievements;
}

// ======================
// API ENDPOINTS
// ======================

// GET /stats/user/:userId
app.get('/stats/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    console.log(`[STATS] Fetching stats for user: ${userId}`);

    // Получить все записи пользователя
    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`[STATS] Found ${entries.length} entries`);

    // Вычислить статистику
    const streak = calculateStreak(entries);
    const moodDistribution = calculateMoodDistribution(entries);
    const topCategories = calculateTopCategories(entries);

    // Вычислить уровень (1 запись = 10 XP, уровень каждые 100 XP)
    const totalXP = entries.length * 10;
    const level = Math.floor(totalXP / 100) + 1;
    const nextLevelProgress = (totalXP % 100);

    // Записи за эту неделю
    const thisWeekEntries = entries.filter(e => 
      new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return c.json({
      success: true,
      stats: {
        totalEntries: entries.length,
        currentStreak: streak.current,
        longestStreak: streak.longest,
        level,
        nextLevelProgress,
        moodDistribution,
        topCategories,
        lastEntryDate: entries[0]?.created_at,
        thisWeekEntries
      }
    });
  } catch (error) {
    console.error('[STATS] Error in /stats/user:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /stats/achievements/:userId
app.get('/stats/achievements/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    console.log(`[STATS] Fetching achievements for user: ${userId}`);

    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    console.log(`[STATS] Found ${entries.length} entries for achievements`);

    const achievements = calculateAchievements(entries);

    return c.json({
      success: true,
      achievements,
      totalBadges: achievements.filter(a => a.earned).length
    });
  } catch (error) {
    console.error('[STATS] Error in /stats/achievements:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

Deno.serve(app.fetch);

