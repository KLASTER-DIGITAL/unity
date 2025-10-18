import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useTranslations } from "@/shared/lib/i18n";
import { getEntries, type DiaryEntry } from "@/shared/lib/api";
import { calculateUserStats, type UserStats } from "@/utils/statsCalculator";
import { toast } from "sonner";
import {
  Download,
  Sparkles,
  TrendingUp,
  BarChart3,
  Calendar,
  Heart,
  Star,
  Brain,
  FileText,
  Share2,
  Crown,
  Target,
  Loader2
} from "lucide-react";

export function ReportsScreen({ userData }: { userData?: any }) {
  // Получаем переводы для языка пользователя
  const t = useTranslations(userData?.language || 'ru');
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [isLoading, setIsLoading] = useState(true);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
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

  const weeklyStats = [
    { week: "1 неделя", entries: 6, mood: 4.2 },
    { week: "2 неделя", entries: 5, mood: 4.5 },
    { week: "3 неделя", entries: 7, mood: 4.8 },
    { week: "4 неделя", entries: 5, mood: 4.3 }
  ];

  if (isLoading) {
    return (
      <div className="pb-20 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-gray-50 overflow-x-hidden scrollbar-hide">
      {/* Заголовок */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl">AI Обзоры</h2>
            <p className="text-purple-100">Анализ твоих достижений</p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {["week", "month", "quarter"].map(period => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "secondary" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? "" : "border-white/30 text-white hover:bg-white/10"}
            >
              {period === "week" ? "Неделя" : period === "month" ? "Месяц" : "Квартал"}
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
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Отчет за {monthlyReport.period}
                </CardTitle>
                <p className="text-sm text-gray-600">Персональный анализ от AI</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                <Crown className="h-3 w-3 mr-1" />
                Премиум
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl text-purple-600 mb-1">{monthlyReport.totalEntries}</div>
                <div className="text-sm text-gray-600">Записей</div>
              </div>
              <div className="text-center">
                <div className="text-2xl text-green-600 mb-1">{monthlyReport.streakDays}</div>
                <div className="text-sm text-gray-600">Активных дней</div>
              </div>
            </div>

            <div className="space-y-4">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Download className="h-4 w-4 mr-2" />
                Скачать PDF отчет
              </Button>
              <Button variant="outline" className="w-full">
                <Share2 className="h-4 w-4 mr-2" />
                Поделиться достижениями
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Вкладки с деталями */}
      <div className="px-4">
        <Tabs defaultValue="mood">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mood">Настроение</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="insights">Инсайты</TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  Анализ настроения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyReport.moodDistribution.map(item => (
                    <div key={item.mood} className="flex items-center gap-3">
                      <div className="text-2xl">{item.mood}</div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span>{item.label}</span>
                          <span className="text-sm text-gray-500">{item.count} записей</span>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                      <div className="text-sm text-gray-600">{item.percentage}%</div>
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
                  <BarChart3 className="h-5 w-5 text-blue-500" />
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
                          <p className="text-sm text-gray-600">{category.count} записей</p>
                        </div>
                      </div>
                      <Badge 
                        variant={category.trend.startsWith('+') ? 'default' : 
                                category.trend.startsWith('-') ? 'destructive' : 'secondary'}
                      >
                        {category.trend.startsWith('+') && <TrendingUp className="h-3 w-3 mr-1" />}
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
                    <Brain className="h-5 w-5 text-purple-500" />
                    Персональные инсайты
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyReport.personalInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <Star className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-purple-800">{insight}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    AI цитаты месяца
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiQuotes.map((quote, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-sm text-gray-800 italic">"{quote}"</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-500" />
                    Рекомендации на следующий месяц
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="text-green-800 mb-1">Продолжай бегать</h4>
                      <p className="text-sm text-green-700">Ты на правильном пути к цели в 10км!</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-blue-800 mb-1">Больше записей о работе</h4>
                      <p className="text-sm text-blue-700">Попробуй фиксировать небольшие рабочие победы</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h4 className="text-purple-800 mb-1">Новая категория</h4>
                      <p className="text-sm text-purple-700">Как насчет добавить записи о творчестве?</p>
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