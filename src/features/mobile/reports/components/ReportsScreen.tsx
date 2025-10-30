import {
  BarChart3,
  Brain,
  Crown,
  Download,
  Heart,
  Share2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { type DiaryEntry, getEntries } from '@/shared/lib/api';
import { calculateUserStats, type UserStats } from '@/shared/lib/api/statsCalculator';
import { useTranslation } from '@/shared/lib/i18n';

export function ReportsScreen({ userData }: { userData?: any }) {
  // Получаем переводы для языка пользователя
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [_entries, setEntries] = useState<DiaryEntry[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      setIsLoading(true);
      // ✅ FIXED: userData has structure {user: {...}, profile: {...}}
      const userId = userData?.user?.id || userData?.id || 'anonymous';
      console.log('[REPORTS] Loading data for user:', userId);
      const entriesData = await getEntries(userId, 100);

      console.log('Loaded entries for reports:', entriesData);
      setEntries(entriesData);

      // Вычислить статистику
      const calculatedStats = calculateUserStats(entriesData);
      setStats(calculatedStats);

      console.log('Calculated stats:', calculatedStats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Не удалось загрузить данные');
    } finally {
      setIsLoading(false);
    }
  };

  // Получить текущий месяц и год
  const currentPeriod = new Date().toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
  });

  const monthlyReport = stats
    ? {
        period: currentPeriod,
        totalEntries: stats.totalEntries,
        streakDays: stats.currentStreak,
        topMood: stats.moodDistribution[0]?.mood || '😊',
        keyAchievements: stats.keyAchievements,
        moodDistribution: stats.moodDistribution,
        topCategories: stats.topCategories,
        personalInsights: stats.personalInsights,
      }
    : {
        period: currentPeriod,
        totalEntries: 0,
        streakDays: 0,
        topMood: '😊',
        keyAchievements: [],
        moodDistribution: [],
        topCategories: [],
        personalInsights: [],
      };

  const aiQuotes = [
    'Твой путь к цели в 10км начался с первого шага. И ты его сделал! 🏃‍♂️',
    'Каждая прочитанная книга - это новый мир, который ты открыл для себя 📚',
    'Твоя благодарность семье показывает, что ты ценишь близких людей ❤️',
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
      <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
        {/* Skeleton for reports header */}
        <div className="space-y-4 p-4">
          {/* Period selector skeleton */}
          <div className="flex gap-2">
            {[...new Array(3)].map((_, i) => (
              <Skeleton className="h-10 flex-1 rounded-[12px]" key={i} />
            ))}
          </div>

          {/* AI Report card skeleton */}
          <Card className="bg-card transition-colors duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              {/* Stats grid skeleton */}
              <div className="mb-6 grid grid-cols-2 gap-4">
                {[...new Array(2)].map((_, i) => (
                  <div className="space-y-1 text-center" key={i}>
                    <Skeleton className="mx-auto h-8 w-16" />
                    <Skeleton className="mx-auto h-4 w-20" />
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
          {[...new Array(2)].map((_, i) => (
            <Card className="bg-card transition-colors duration-300" key={i}>
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
    <div className="scrollbar-hide min-h-screen overflow-x-hidden bg-background pb-20">
      {/* Заголовок */}
      <div className="bg-linear-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm">
            <Brain className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl">{t('ai_reviews', 'AI Обзоры')}</h2>
            <p className="text-muted-foreground opacity-90">
              {t('analysis_achievements', 'Анализ твоих достижений')}
            </p>
          </div>
        </div>

        <div className="scrollbar-hide flex gap-2 overflow-x-auto">
          {['week', 'month', 'quarter'].map((period) => (
            <Button
              className={
                selectedPeriod === period ? '' : 'border-card/30 text-white hover:bg-card/10'
              }
              key={period}
              onClick={() => setSelectedPeriod(period)}
              size="sm"
              variant={selectedPeriod === period ? 'secondary' : 'outline'}
            >
              {period === 'week'
                ? t('week', 'Неделя')
                : period === 'month'
                  ? t('month', 'Месяц')
                  : t('quarter', 'Квартал')}
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
                <p className="text-muted-foreground text-sm">Персональный анализ от AI</p>
              </div>
              <Badge className="bg-[var(--ios-bg-secondary)] text-[var(--ios-purple)]">
                <Crown className="mr-1 h-3 w-3" strokeWidth={2} />
                Премиум
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="mb-1 text-2xl text-[var(--ios-purple)]">
                  {monthlyReport.totalEntries}
                </div>
                <div className="text-muted-foreground text-sm">{t('entries_count', 'Записей')}</div>
              </div>
              <div className="text-center">
                <div className="mb-1 text-2xl text-[var(--ios-green)]">
                  {monthlyReport.streakDays}
                </div>
                <div className="text-muted-foreground text-sm">Активных дней</div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full bg-[var(--ios-purple)] hover:bg-[var(--ios-purple)]/90"
                onClick={() => toast.info('Эта функция доступна в премиум версии')}
              >
                <Download className="mr-2 h-5 w-5" strokeWidth={2} />
                Скачать PDF отчет
              </Button>
              <Button
                className="w-full"
                onClick={() => toast.info('Эта функция доступна в премиум версии')}
                variant="outline"
              >
                <Share2 className="mr-2 h-5 w-5" strokeWidth={2} />
                Поделиться достижениями
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Вкладки с деталями */}
      <div className="px-4">
        <Tabs data-testid="stats-tab" defaultValue="mood">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mood">{t('mood', 'Настроение')}</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="insights">Инсайты</TabsTrigger>
          </TabsList>

          <TabsContent className="mt-4" value="mood">
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
                    <div className="flex items-center gap-3" key={`${item.label}-${index}`}>
                      <div className="text-2xl">{item.mood}</div>
                      <div className="flex-1">
                        <div className="mb-1 flex justify-between">
                          <span>{item.label}</span>
                          <span className="text-muted-foreground text-sm">
                            {item.count} записей
                          </span>
                        </div>
                        <Progress className="h-2" value={item.percentage} />
                      </div>
                      <div className="text-muted-foreground text-sm">{item.percentage}%</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg bg-pink-50 p-4">
                  <p className="text-pink-800 text-sm">
                    <strong>Вывод AI:</strong> В этом месяце преобладали позитивные эмоции. Особенно
                    заметен рост записей с восторгом - это говорит о том, что ты активнее достигаешь
                    своих целей! 🎉
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className="mt-4" value="categories">
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
                    <div className="flex items-center justify-between" key={category.name}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <span className="text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <h4>{category.name}</h4>
                          <p className="text-muted-foreground text-sm">{category.count} записей</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          category.trend.startsWith('+')
                            ? 'default'
                            : category.trend.startsWith('-')
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {category.trend.startsWith('+') && (
                          <TrendingUp className="mr-1 h-3 w-3" strokeWidth={2} />
                        )}
                        {category.trend}
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-lg bg-blue-50 p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Наблюдение AI:</strong> Твой фокус на спорте значительно усилился. Это
                    отличная тенденция для здоровья и дисциплины! 💪
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className="mt-4" value="insights">
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
                      <div
                        className="flex items-start gap-3 rounded-lg bg-[var(--ios-bg-secondary)] p-3"
                        key={index}
                      >
                        <Star
                          className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--ios-purple)]"
                          strokeWidth={2}
                        />
                        <p className="text-foreground text-sm">{insight}</p>
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
                      <div
                        className="rounded-lg border-yellow-400 border-l-4 bg-linear-to-r from-yellow-50 to-orange-50 p-4"
                        key={index}
                      >
                        <p className="text-foreground text-sm italic">"{quote}"</p>
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
                    <div className="rounded-lg bg-[var(--ios-bg-secondary)] p-3">
                      <h4 className="mb-1 text-[var(--ios-green)]">Продолжай бегать</h4>
                      <p className="text-muted-foreground text-sm">
                        Ты на правильном пути к цели в 10км!
                      </p>
                    </div>
                    <div className="rounded-lg bg-[var(--ios-bg-secondary)] p-3">
                      <h4 className="mb-1 text-[var(--ios-blue)]">Больше записей о работе</h4>
                      <p className="text-muted-foreground text-sm">
                        Попробуй фиксировать небольшие рабочие победы
                      </p>
                    </div>
                    <div className="rounded-lg bg-[var(--ios-bg-secondary)] p-3">
                      <h4 className="mb-1 text-[var(--ios-purple)]">Новая категория</h4>
                      <p className="text-muted-foreground text-sm">
                        Как насчет добавить записи о творчестве?
                      </p>
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
