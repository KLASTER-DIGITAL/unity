import { DiaryEntry } from '../types';

export interface UserStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  nextLevelProgress: number;
  moodDistribution: Array<{
    mood: string;
    label: string;
    count: number;
    percentage: number;
  }>;
  topCategories: Array<{
    name: string;
    count: number;
    trend: string;
  }>;
  lastEntryDate?: string;
  thisWeekEntries: number;
  keyAchievements: string[];
  personalInsights: string[];
}

export function calculateStreak(entries: DiaryEntry[]): { current: number; longest: number } {
  if (!entries || entries.length === 0) {
    return { current: 0, longest: 0 };
  }

  const sorted = [...entries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  let lastDate = new Date(sorted[0].createdAt);

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
  return emojiMap[mood?.toLowerCase()] || '😊';
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
      trend: '+0' // TODO: вычислить тренд по сравнению с предыдущим периодом
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function extractKeyAchievements(entries: DiaryEntry[]): string[] {
  return entries
    .filter(entry => entry.isAchievement)
    .map(entry => entry.aiSummary || entry.text.substring(0, 100))
    .slice(0, 3);
}

export function generatePersonalInsights(entries: DiaryEntry[]): string[] {
  const insights: string[] = [];
  
  // Инсайт о частоте записей
  const thisWeekEntries = entries.filter(e => 
    new Date(e.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  
  if (thisWeekEntries > 5) {
    insights.push("Вы очень активны на этой неделе! Продолжайте в том же духе.");
  }
  
  // Инсайт о настроении
  const moodDist = calculateMoodDistribution(entries);
  if (moodDist.length > 0 && moodDist[0].percentage > 50) {
    insights.push(`Ваше преобладающее настроение - ${moodDist[0].label}. Это отлично!`);
  }
  
  // Инсайт о категориях
  const topCats = calculateTopCategories(entries);
  if (topCats.length > 0) {
    insights.push(`Вы больше всего фокусируетесь на категории "${topCats[0].name}".`);
  }
  
  // Инсайт о серии
  const streak = calculateStreak(entries);
  if (streak.current > 3) {
    insights.push(`Отличная серия! ${streak.current} дней подряд.`);
  }
  
  return insights.slice(0, 3);
}

export function calculateUserStats(entries: DiaryEntry[]): UserStats {
  const streak = calculateStreak(entries);
  const moodDistribution = calculateMoodDistribution(entries);
  const topCategories = calculateTopCategories(entries);
  const keyAchievements = extractKeyAchievements(entries);
  const personalInsights = generatePersonalInsights(entries);

  // Вычислить уровень (1 запись = 10 XP, уровень каждые 100 XP)
  const totalXP = entries.length * 10;
  const level = Math.floor(totalXP / 100) + 1;
  const nextLevelProgress = (totalXP % 100);

  // Записи за эту неделю
  const thisWeekEntries = entries.filter(e => 
    new Date(e.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  return {
    totalEntries: entries.length,
    currentStreak: streak.current,
    longestStreak: streak.longest,
    level,
    nextLevelProgress,
    moodDistribution,
    topCategories,
    lastEntryDate: entries[0]?.createdAt,
    thisWeekEntries,
    keyAchievements,
    personalInsights
  };
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  earnedDate: string | null;
  progress: number;
}

export function calculateAchievements(entries: DiaryEntry[]): Achievement[] {
  const streak = calculateStreak(entries);
  
  const achievements: Achievement[] = [
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

