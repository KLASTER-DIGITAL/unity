import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useTranslation } from "@/shared/lib/i18n";
import { getEntries, type DiaryEntry } from "@/shared/lib/api";
import { calculateUserStats, type UserStats } from "@/shared/lib/api/statsCalculator";
import { toast } from "sonner";
import {
  Download,
  Sparkles,
  TrendingUp,
  BarChart3,
  Heart,
  Star,
  Brain,
  Share2,
  Crown,
  Target
} from "lucide-react";

export function ReportsScreen({ userData }: { userData?: any }) {
  // Получаем переводы для языка пользователя
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [isLoading, setIsLoading] = useState(true);
  const [_entries, setEntries] = useState<DiaryEntry[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    loadData();
  }, [userData?.id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // ✅ FIXED: userData has structure {user: {...}, profile: {...}}
      const userId = userData?.user?.id || userData?.id || "anonymous";
      console.log("[REPORTS] Loading data for user:", userId);
      const entriesData = await getEntries(userId, 100);

      console.log("Loaded entries for reports:", entriesData);
      setEntries(entriesData);

      // Вычислить статистику
      const calculatedStats = calculateUserStats(entriesData);
      setStats(calculatedStats);

      console.log("Calculated stats:", calculatedStats);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Не удалось загрузить данные");
    } finally {
      setIsLoading(false);
    }
  };

  // Получить текущий месяц и год
  const currentPeriod = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long'
  });

  const monthlyReport = stats ? {
    period: currentPeriod,
    totalEntries: stats.totalEntries,
    streakDays: stats.currentStreak,
    topMood: stats.moodDistribution[0]?.mood || "😊",
    keyAchievements: stats.keyAchievements,
    moodDistribution: stats.moodDistribution,
    topCategories: stats.topCategories,
    personalInsights: stats.personalInsights
  } : {
    period: currentPeriod,
    totalEntries: 0,
    streakDays: 0,
    topMood: "😊",
    keyAchievements: [],
    moodDistribution: [],
    topCategories: [],
    personalInsights: []
  };

  const aiQuotes = [
    "Твой путь к цели в 10км начался с первого шага. И ты его сделал! 🏃‍♂️",
    "Каждая прочитанная книга - это новый мир, который ты открыл для себя 📚",
    "Твоя благодарность семье показывает, что ты ценишь близких людей ❤️"
  ];

  // Weekly stats (currently unused but kept for future use)
  // const weeklyStats = [
  //   { week: "1 неделя", entries: 6, mood: 4.2 },
  //   { week: "2 неделя", entries: 5, mood: 4.5 },
  //   { week: "3 неделя", entries: 7, mood: 4.8 },
  //   { week: "4 неделя", entries: 5, mood: 4.3 }
  // ];

  if (isLoading) {
    return (
      <div className="pb-20 min-h-screen bg-background transition-colors duration-300">
        {/* Skeleton for reports header */}
        <div className="p-4 space-y-4">
          {/* Period selector skeleton */}
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 flex-1 rounded-[12px]" />
            ))}
          </div>

          {/* AI Report card skeleton */}
          <Card className="bg-card transition-colors duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              {/* Stats grid skeleton */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="text-center space-y-1">
                    <Skeleton className="h-8 w-16 mx-auto" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </div>
                ))}
              </div>

              {/* AI insights skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </CardContent>
          </Card>

          {/* Stats cards skeleton */}
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="bg-card transition-colors duration-300">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-background overflow-x-hidden scrollbar-hide">
      {/* Заголовок */}
      <div className="bg-linear-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-card/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Brain className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl">{t('ai_reviews', 'AI Обзоры')}</h2>
            <p className="text-muted-foreground opacity-90">{t('analysis_achievements', 'Анализ твоих достижений')}</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {["week", "month", "quarter"].map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? "" : "border-card/30 text-white hover:bg-card/10"}
            >
              {period === "week" ? t('week', 'Неделя') : period === "month" ? t('month', 'Месяц') : t('quarter', 'Квартал')}
            </Button>
          ))}
        </div>
      </div>

      {/* Основной отчет */}
      <div className="p-4">
        <Card className="border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[var(--action-ai)]" strokeWidth={2} />
                  Отчет за {monthlyReport.period}
                </CardTitle>
                <p className="text-sm text-muted-foreground">Персональный анализ от AI</p>
              </div>
              <Badge className="bg-[var(--ios-bg-secondary)] text-[var(--ios-purple)]">
                <Crown className="h-3 w-3 mr-1" strokeWidth={2} />
                Премиум
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl text-[var(--ios-purple)] mb-1">{monthlyReport.totalEntries}</div>
                <div className="text-sm text-muted-foreground">{t('entries_count', 'Записей')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-[var(--ios-green)] mb-1">{monthlyReport.streakDays}</div>
                <div className="text-sm text-muted-foreground">Активных дней</div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full bg-[var(--ios-purple)] hover:bg-[var(--ios-purple)]/90"
                onClick={() => toast.info("Эта функция доступна в премиум версии")}
              >
                <Download className="h-5 w-5 mr-2" strokeWidth={2} />
                Скачать PDF отчет
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast.info("Эта функция доступна в премиум версии")}
              >
                <Share2 className="h-5 w-5 mr-2" strokeWidth={2} />
                Поделиться достижениями
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Вкладки с деталями */}
      <div className="px-4">
        <Tabs defaultValue="mood" data-testid="stats-tab">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mood">{t('mood', 'Настроение')}</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="insights">Инсайты</TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" strokeWidth={2} />
                  Анализ настроения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyReport.moodDistribution.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="flex items-center gap-3">
                      <div className="text-2xl">{item.mood}</div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span>{item.label}</span>
                          <span className="text-sm text-muted-foreground">{item.count} записей</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                      <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-pink-50 rounded-lg">
                  <p className="text-sm text-pink-800">
                    <strong>Вывод AI:</strong> В этом месяце преобладали позитивные эмоции. 
                    Особенно заметен рост записей с восторгом - это говорит о том, что ты 
                    активнее достигаешь своих целей! 🎉
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" strokeWidth={2} />
                  Категории активности
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyReport.topCategories.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h4>{category.name}</h4>
                          <p className="text-sm text-muted-foreground">{category.count} записей</p>
                        </div>
                      </div>
                      <Badge 
                        variant={category.trend.startsWith('+') ? 'default' : 
                                category.trend.startsWith('-') ? 'destructive' : 'secondary'}
                      >
                        {category.trend.startsWith('+') && <TrendingUp className="h-3 w-3 mr-1" strokeWidth={2} />}
                        {category.trend}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Наблюдение AI:</strong> Твой фокус на спорте значительно усилился. 
                    Это отличная тенденция для здоровья и дисциплины! 💪
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-[var(--ios-purple)]" strokeWidth={2} />
                    Персональные инсайты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyReport.personalInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[var(--ios-bg-secondary)] rounded-lg">
                        <Star className="h-5 w-5 text-[var(--ios-purple)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                        <p className="text-sm text-foreground">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" strokeWidth={2} />
                    AI цитаты месяца
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiQuotes.map((quote, index) => (
                      <div key={index} className="p-4 bg-linear-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-sm text-foreground italic">"{quote}"</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-[var(--ios-green)]" strokeWidth={2} />
                    Рекомендации на следующий месяц
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-[var(--ios-bg-secondary)] rounded-lg">
                      <h4 className="text-[var(--ios-green)] mb-1">Продолжай бегать</h4>
                      <p className="text-sm text-muted-foreground">Ты на правильном пути к цели в 10км!</p>
                    </div>
                    <div className="p-3 bg-[var(--ios-bg-secondary)] rounded-lg">
                      <h4 className="text-[var(--ios-blue)] mb-1">Больше записей о работе</h4>
                      <p className="text-sm text-muted-foreground">Попробуй фиксировать небольшие рабочие победы</p>
                    </div>
                    <div className="p-3 bg-[var(--ios-bg-secondary)] rounded-lg">
                      <h4 className="text-[var(--ios-purple)] mb-1">Новая категория</h4>
                      <p className="text-sm text-muted-foreground">Как насчет добавить записи о творчестве?</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
export default ReportsScreen;
