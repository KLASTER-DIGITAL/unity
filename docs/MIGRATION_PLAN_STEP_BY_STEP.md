# 🚀 ПОШАГОВЫЙ ПЛАН МИГРАЦИИ

**Проект:** UNITY Diary Application  
**Цель:** Разделить монолитную Edge Function на микросервисы  
**Срок:** 3 недели

---

## 📋 ЭТАП 1: ПОДГОТОВКА (День 1)

### 1.1 Создать новую структуру папок

```bash
cd "/Users/rustamkarimov/DEV/UNITY — v 2"

# Создать новые Edge Functions
supabase functions new profiles
supabase functions new entries  
supabase functions new motivations
supabase functions new stats
supabase functions new books
supabase functions new admin
supabase functions new i18n

# Создать папку для общих утилит
mkdir -p supabase/functions/_shared
```

### 1.2 Создать общие типы

**Файл:** `supabase/functions/_shared/types.ts`

```typescript
export interface DiaryEntry {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  tags: string[];
  aiSummary: string;
  aiInsight: string;
  aiReply: string;
  mood: string;
  isAchievement: boolean;
}

export interface EntrySummary {
  id: string;
  entryId: string;
  userId: string;
  summaryJson: {
    text: string;
    insight: string;
    mood: string;
    sentiment: string;
    contexts: string[];
    tags: string[];
    achievements: object[];
    keywords: string[];
    excerpt: string;
    confidence: number;
  };
  tokensUsed: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  language: string;
  diaryName: string;
  diaryEmoji: string;
  notificationSettings: object;
  onboardingCompleted: boolean;
}

export interface MotivationCard {
  id: string;
  entryId?: string;
  date: string;
  title: string;
  description: string;
  gradient: string;
  isMarked: boolean;
  isDefault?: boolean;
  sentiment?: string;
  mood?: string;
}
```

### 1.3 Создать общие утилиты

**Файл:** `supabase/functions/_shared/supabase.ts`

```typescript
import { createClient } from 'jsr:@supabase/supabase-js@2';

export function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseServiceKey);
}
```

**Файл:** `supabase/functions/_shared/openai.ts`

```typescript
export async function logOpenAIUsage(
  supabase: any,
  userId: string,
  operationType: 'ai_card' | 'translation' | 'pdf_export' | 'transcription' | 'other',
  model: string,
  usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
) {
  const pricing: Record<string, { prompt: number; completion: number }> = {
    'gpt-4': { prompt: 0.03 / 1000, completion: 0.06 / 1000 },
    'gpt-4-turbo-preview': { prompt: 0.01 / 1000, completion: 0.03 / 1000 },
    'gpt-3.5-turbo': { prompt: 0.0005 / 1000, completion: 0.0015 / 1000 },
  };

  const modelPricing = pricing[model] || pricing['gpt-3.5-turbo'];
  const promptTokens = usage.prompt_tokens || 0;
  const completionTokens = usage.completion_tokens || 0;
  const totalTokens = usage.total_tokens || (promptTokens + completionTokens);
  
  const estimatedCost = 
    (promptTokens * modelPricing.prompt) + 
    (completionTokens * modelPricing.completion);

  await supabase.from('openai_usage').insert({
    user_id: userId,
    operation_type: operationType,
    model,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    total_tokens: totalTokens,
    estimated_cost: estimatedCost
  });
}
```

---

## 📋 ЭТАП 2: СОЗДАТЬ STATS FUNCTION (День 2-3)

### 2.1 Создать основной файл

**Файл:** `supabase/functions/stats/index.ts`

```typescript
import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { getSupabaseClient } from '../_shared/supabase.ts';
import { calculateStreak, calculateMoodDistribution, calculateTopCategories } from './utils.ts';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

const supabase = getSupabaseClient();

// GET /stats/user/:userId
app.get('/stats/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    // Получить все записи пользователя
    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Вычислить статистику
    const streak = calculateStreak(entries);
    const moodDistribution = calculateMoodDistribution(entries);
    const topCategories = calculateTopCategories(entries);

    // Вычислить уровень (1 запись = 10 XP, уровень каждые 100 XP)
    const totalXP = entries.length * 10;
    const level = Math.floor(totalXP / 100) + 1;
    const nextLevelProgress = (totalXP % 100);

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
        thisWeekEntries: entries.filter(e => 
          new Date(e.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length
      }
    });
  } catch (error) {
    console.error('Error in /stats/user:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// GET /stats/achievements/:userId
app.get('/stats/achievements/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');

    const { data: entries } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId);

    const achievements = calculateAchievements(entries);

    return c.json({
      success: true,
      achievements,
      totalBadges: achievements.filter(a => a.earned).length
    });
  } catch (error) {
    console.error('Error in /stats/achievements:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

Deno.serve(app.fetch);
```

### 2.2 Создать утилиты для статистики

**Файл:** `supabase/functions/stats/utils.ts`

```typescript
import { DiaryEntry } from '../_shared/types.ts';

export function calculateStreak(entries: DiaryEntry[]) {
  if (!entries || entries.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Сортировать по дате (новые первые)
  const sorted = [...entries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  let lastDate = new Date(sorted[0].createdAt);

  // Проверить текущую серию
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastEntryDate = new Date(sorted[0].createdAt);
  lastEntryDate.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff <= 1) {
    currentStreak = 1;
    
    for (let i = 1; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i].createdAt);
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
  lastDate = new Date(sorted[0].createdAt);
  
  for (let i = 1; i < sorted.length; i++) {
    const currentDate = new Date(sorted[i].createdAt);
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

export function calculateMoodDistribution(entries: DiaryEntry[]) {
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

export function calculateTopCategories(entries: DiaryEntry[]) {
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
    'хорошее': '😊'
  };
  return emojiMap[mood.toLowerCase()] || '😊';
}

export function calculateAchievements(entries: DiaryEntry[]) {
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
      earned: calculateStreak(entries).current >= 7,
      rarity: "rare",
      earnedDate: calculateStreak(entries).current >= 7 ? "Получено" : null,
      progress: Math.min(100, (calculateStreak(entries).current / 7) * 100)
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
      earnedDate: null,
      progress: Math.min(100, (entries.filter(e => 
        e.category === 'Чтение' || e.category === 'Обучение'
      ).length / 5) * 100)
    },
    {
      id: 5,
      name: "Месяц достижений",
      description: "30 дней записей подряд",
      icon: "Trophy",
      earned: calculateStreak(entries).longest >= 30,
      rarity: "legendary",
      earnedDate: null,
      progress: Math.min(100, (calculateStreak(entries).longest / 30) * 100)
    }
  ];

  return achievements;
}
```

---

## 📋 ЭТАП 3: ОБНОВИТЬ FRONTEND (День 4-5)

### 3.1 Обновить ReportsScreen.tsx

```typescript
// src/components/screens/ReportsScreen.tsx
import { useState, useEffect } from "react";
import { apiRequest } from "../../utils/api";

export function ReportsScreen({ userData }: { userData?: any }) {
  const [monthlyReport, setMonthlyReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        const response = await apiRequest(
          `/stats/user/${userData.id}`,
          'GET'
        );
        
        if (response.success) {
          setMonthlyReport({
            period: new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
            totalEntries: response.stats.totalEntries,
            streakDays: response.stats.currentStreak,
            topMood: response.stats.moodDistribution[0]?.mood || "😊",
            moodDistribution: response.stats.moodDistribution,
            topCategories: response.stats.topCategories,
            // TODO: получить AI инсайты
            personalInsights: []
          });
        }
      } catch (error) {
        console.error('Failed to load report:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userData?.id) {
      loadReport();
    }
  }, [userData?.id]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  // ... остальной код
}
```

### 3.2 Обновить AchievementsScreen.tsx

```typescript
// src/components/screens/AchievementsScreen.tsx
import { useState, useEffect } from "react";
import { apiRequest } from "../../utils/api";

export function AchievementsScreen({ userData }: { userData?: any }) {
  const [userStats, setUserStats] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAchievements() {
      try {
        setLoading(true);
        
        // Загрузить статистику
        const statsResponse = await apiRequest(
          `/stats/user/${userData.id}`,
          'GET'
        );
        
        // Загрузить достижения
        const achievementsResponse = await apiRequest(
          `/stats/achievements/${userData.id}`,
          'GET'
        );
        
        if (statsResponse.success) {
          setUserStats({
            totalEntries: statsResponse.stats.totalEntries,
            currentStreak: statsResponse.stats.currentStreak,
            longestStreak: statsResponse.stats.longestStreak,
            totalBadges: achievementsResponse.totalBadges,
            level: statsResponse.stats.level,
            nextLevelProgress: statsResponse.stats.nextLevelProgress
          });
        }
        
        if (achievementsResponse.success) {
          setBadges(achievementsResponse.achievements);
        }
      } catch (error) {
        console.error('Failed to load achievements:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userData?.id) {
      loadAchievements();
    }
  }, [userData?.id]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  // ... остальной код
}
```

---

## 📋 ЭТАП 4: ИСПРАВИТЬ ENTRY_SUMMARIES (День 6)

### 4.1 Обновить эндпоинт создания записи

Найти в `supabase/functions/make-server-9729c493/index.ts` эндпоинт `/api/chat/analyze` и добавить сохранение в `entry_summaries`:

```typescript
// После сохранения entry
const { data: entry, error: entryError } = await supabase
  .from('entries')
  .insert({
    user_id: userId,
    text,
    ai_summary: analysis.summary,
    ai_insight: analysis.insight,
    sentiment: analysis.sentiment,
    category: analysis.category,
    tags: analysis.tags,
    mood: analysis.mood,
    is_achievement: analysis.isAchievement,
    ai_reply: analysis.reply
  })
  .select()
  .single();

if (entryError) throw entryError;

// ДОБАВИТЬ: Сохранить entry_summary
const { error: summaryError } = await supabase
  .from('entry_summaries')
  .insert({
    entry_id: entry.id,
    user_id: userId,
    summary_json: {
      text: analysis.summary,
      insight: analysis.insight,
      mood: analysis.mood,
      sentiment: analysis.sentiment,
      contexts: [], // TODO: extract from text
      tags: analysis.tags,
      achievements: analysis.isAchievement ? [{ text: analysis.summary }] : [],
      keywords: text.split(' ').slice(0, 5), // Простое извлечение ключевых слов
      excerpt: text.substring(0, 200),
      confidence: 0.95
    },
    tokens_used: usage.total_tokens || 0
  });

if (summaryError) {
  console.error('Failed to save entry_summary:', summaryError);
}
```

---

## 📋 ЭТАП 5: ТЕСТИРОВАНИЕ (День 7)

### 5.1 Тестовый скрипт

```bash
#!/bin/bash

USER_ID="726a9369-8c28-4134-b03f-3c29ad1235f4"
BASE_URL="https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1"

echo "Testing /stats/user endpoint..."
curl -s "$BASE_URL/stats/user/$USER_ID" | jq .

echo "\nTesting /stats/achievements endpoint..."
curl -s "$BASE_URL/stats/achievements/$USER_ID" | jq .
```

---

**Следующие шаги:** После завершения этих этапов продолжить с разделением остальных функций (entries, motivations, books, admin, i18n).

