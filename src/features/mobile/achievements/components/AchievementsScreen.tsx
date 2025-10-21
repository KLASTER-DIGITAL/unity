import { useState, useEffect } from "react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useTranslation } from "@/shared/lib/i18n";
import { getEntries, type DiaryEntry } from "@/shared/lib/api";
import { calculateAchievements, calculateUserStats, type Achievement } from "@/shared/lib/api/statsCalculator";
import { toast } from "sonner";
import { LottiePreloaderCompact } from "@/shared/components/LottiePreloader";
import {
  Trophy,
  Medal,
  Star,
  Target,
  Calendar,
  Flame,
  TrendingUp,
  Award,
  Crown,
  Zap,
  Heart,
  BookOpen,
  Dumbbell,
  Camera
} from "lucide-react";

// Маппинг иконок для достижений
const iconMap: Record<string, any> = {
  Star,
  Flame,
  Dumbbell,
  BookOpen,
  Trophy,
  Target,
  Camera,
  Heart,
  Zap
};

export function AchievementsScreen({ userData }: { userData?: any }) {
  // Получаем переводы для языка пользователя
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState({
    totalEntries: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalBadges: 0,
    level: 1,
    nextLevelProgress: 0
  });

  useEffect(() => {
    loadData();
  }, [userData?.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // ✅ FIXED: userData has structure {user: {...}, profile: {...}}
      const userId = userData?.user?.id || userData?.id || "anonymous";
      console.log("[ACHIEVEMENTS] Loading data for user:", userId);
      const entriesData = await getEntries(userId, 100);

      console.log("Loaded entries for achievements:", entriesData);
      setEntries(entriesData);

      // Вычислить достижения
      const calculatedAchievements = calculateAchievements(entriesData);
      setAchievements(calculatedAchievements);

      // Вычислить статистику
      const stats = calculateUserStats(entriesData);
      setUserStats({
        totalEntries: stats.totalEntries,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        totalBadges: calculatedAchievements.filter(a => a.earned).length,
        level: stats.level,
        nextLevelProgress: stats.nextLevelProgress
      });

      console.log("Calculated achievements:", calculatedAchievements);
      console.log("User stats:", userStats);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Не удалось загрузить достижения");
    } finally {
      setIsLoading(false);
    }
  };

  // Преобразовать достижения в формат для UI
  const badges = achievements.map(achievement => ({
    id: achievement.id,
    name: achievement.name,
    description: achievement.description,
    icon: iconMap[achievement.icon] || Star,
    earned: achievement.earned,
    rarity: achievement.rarity,
    earnedDate: achievement.earnedDate,
    progress: achievement.progress
  }));

  const milestones = [
    {
      id: 1,
      title: t('milestone_10_entries', '10 записей'),
      completed: userStats.totalEntries >= 10,
      reward: t('badge_beginner', 'Бейдж "Начинающий"')
    },
    {
      id: 2,
      title: t('milestone_week_streak', 'Неделя подряд'),
      completed: userStats.currentStreak >= 7,
      reward: t('badge_consistency', 'Бейдж "Постоянство"')
    },
    {
      id: 3,
      title: t('milestone_50_entries', '50 записей'),
      completed: userStats.totalEntries >= 50,
      progress: userStats.totalEntries,
      total: 50,
      reward: t('premium_theme', 'Премиум тема')
    },
    {
      id: 4,
      title: t('milestone_month_streak', 'Месяц подряд'),
      completed: userStats.longestStreak >= 30,
      progress: userStats.longestStreak,
      total: 30,
      reward: t('badge_legend', 'Бейдж "Легенда"')
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-muted text-foreground border-border";
      case "uncommon": return "bg-[var(--ios-green)]/10 text-[var(--ios-green)] border-[var(--ios-green)]/20";
      case "rare": return "bg-[var(--ios-blue)]/10 text-[var(--ios-blue)] border-[var(--ios-blue)]/20";
      case "legendary": return "bg-[var(--ios-purple)]/10 text-[var(--ios-purple)] border-[var(--ios-purple)]/20";
      default: return "bg-muted text-foreground border-border";
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case "rare": return "shadow-[var(--ios-blue)]/20";
      case "legendary": return "shadow-[var(--ios-purple)]/20";
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <div className="pb-20 min-h-screen flex items-center justify-center bg-background">
        <LottiePreloaderCompact showMessage={false} size="md" />
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-[100dvh] overflow-x-hidden scrollbar-hide bg-background">
      {/* Header Section */}
      <div className="p-4 bg-card transition-colors duration-300">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
            <Crown className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl mb-1 text-foreground font-semibold">{t('level', 'Уровень')} {userStats.level}</h1>
          <p className="text-muted-foreground">{t('achievement_master', 'Мастер достижений')}</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl mb-1 text-foreground font-semibold">{userStats.totalEntries}</div>
            <div className="text-xs text-muted-foreground">Записей</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1 text-foreground font-semibold">{userStats.totalBadges}</div>
            <div className="text-xs text-muted-foreground">Наград</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1 text-foreground font-semibold">{userStats.currentStreak}</div>
            <div className="text-xs text-muted-foreground">Дней подряд</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1 text-foreground font-semibold">{userStats.longestStreak}</div>
            <div className="text-xs text-muted-foreground">Рекорд</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>До следующего уровня</span>
            <span>{userStats.nextLevelProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-300"
              style={{ width: `${userStats.nextLevelProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {badges.map(badge => {
            const Icon = badge.icon;
            return (
              <Card
                key={badge.id}
                className={`bg-card border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  badge.earned ? '' : 'opacity-60'
                }`}
              >
                <CardContent className="p-4 text-center">
                  <div className="relative mb-3">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                      badge.earned
                        ? badge.rarity === 'legendary' ? 'bg-gradient-to-br from-purple-400 to-purple-600' :
                          badge.rarity === 'rare' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                          badge.rarity === 'uncommon' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                          'bg-gradient-to-br from-gray-400 to-gray-600'
                        : 'bg-muted'
                    }`}>
                      <Icon className={`h-8 w-8 ${badge.earned ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    {badge.earned && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Star className="h-3 w-3 text-white fill-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <h4 className="text-[#0d062d] mb-1">{badge.name}</h4>
                  <p className="text-xs text-[#787486] mb-2">{badge.description}</p>
                  
                  {badge.earned ? (
                    <Badge className={`text-xs ${
                      badge.rarity === 'legendary' ? 'bg-purple-100 text-purple-600' :
                      badge.rarity === 'rare' ? 'bg-blue-100 text-blue-600' :
                      badge.rarity === 'uncommon' ? 'bg-green-100 text-green-600' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {badge.earnedDate}
                    </Badge>
                  ) : (
                    <div className="space-y-1">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-[#5030e5] h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${((badge.progress || 0) / (badge.rarity === 'legendary' ? 30 : 20)) * 100}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-[#787486]">
                        {badge.progress}/{badge.rarity === 'legendary' ? 30 : 20}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Milestones Section */}
      <div className="p-4">
        <h3 className="text-[#0d062d] mb-4">Основные этапы</h3>
        <div className="space-y-3">
          {milestones.map(milestone => (
            <Card key={milestone.id} className="bg-card border-0 shadow-sm transition-colors duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      milestone.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-[#5030e5]/10 text-[#5030e5]'
                    }`}>
                      {milestone.completed ? <Trophy className="h-5 w-5" strokeWidth={2} /> : <Target className="h-5 w-5" strokeWidth={2} />}
                    </div>
                    <div>
                      <h4 className="text-[#0d062d]">{milestone.title}</h4>
                      <p className="text-sm text-[#787486]">{milestone.reward}</p>
                    </div>
                  </div>
                  
                  {milestone.completed ? (
                    <Badge className="bg-green-100 text-green-600">Выполнено</Badge>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm text-[#787486] mb-1">
                        {milestone.progress}/{milestone.total}
                      </p>
                      <div className="w-20 bg-muted rounded-full h-2">
                        <div
                          className="bg-[#5030e5] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(milestone.progress! / milestone.total!) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}