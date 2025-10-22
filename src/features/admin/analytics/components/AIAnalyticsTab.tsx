import { useState, useEffect } from "react";
import { Brain, TrendingUp, DollarSign, Zap, RefreshCw, Download, Calendar, AlertTriangle, Lightbulb, TrendingDown, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { SimpleChart } from "@/shared/components/SimpleChart";

interface AIUsageLog {
  id: string;
  user_id: string;
  operation_type: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface AIStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgCostPerRequest: number;
  topUsers: Array<{ user_id: string; user_name: string; requests: number; cost: number }>;
  operationBreakdown: Array<{ operation: string; requests: number; cost: number }>;
  modelBreakdown: Array<{ model: string; requests: number; cost: number }>;
  dailyUsage: Array<{ date: string; requests: number; cost: number; tokens: number }>;
}

interface AIRecommendation {
  type: 'warning' | 'info' | 'success';
  title: string;
  description: string;
  impact?: string;
}

interface CostForecast {
  nextMonth: number;
  nextQuarter: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
}



export function AIAnalyticsTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<AIUsageLog[]>([]);
  const [stats, setStats] = useState<AIStats>({
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    avgCostPerRequest: 0,
    topUsers: [],
    operationBreakdown: [],
    modelBreakdown: [],
    dailyUsage: []
  });
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [forecast, setForecast] = useState<CostForecast | null>(null);

  useEffect(() => {
    loadAIAnalytics();
  }, [period]);

  const loadAIAnalytics = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();

      // Calculate date range
      let startDate = new Date();
      if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else if (period === '90d') {
        startDate.setDate(startDate.getDate() - 90);
      } else {
        startDate = new Date('2020-01-01'); // All time
      }

      // Fetch AI usage logs with user info
      const { data: logsData, error: logsError } = await supabase
        .from('openai_usage')
        .select(`
          *,
          profiles!user_id (
            name,
            email
          )
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Process logs
      const processedLogs: AIUsageLog[] = (logsData || []).map((log: any) => ({
        ...log,
        user_name: log.profiles?.name || 'Unknown',
        user_email: log.profiles?.email || 'unknown@example.com'
      }));

      setLogs(processedLogs);

      // Calculate statistics
      const totalRequests = processedLogs.length;
      const totalTokens = processedLogs.reduce((sum, log) => sum + (log.total_tokens || 0), 0);
      const totalCost = processedLogs.reduce((sum, log) => sum + (log.estimated_cost || 0), 0);
      const avgCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;

      // Top users
      const userMap = new Map<string, { user_id: string; user_name: string; requests: number; cost: number }>();
      processedLogs.forEach(log => {
        const existing = userMap.get(log.user_id) || { user_id: log.user_id, user_name: log.user_name || 'Unknown', requests: 0, cost: 0 };
        existing.requests += 1;
        existing.cost += log.estimated_cost || 0;
        userMap.set(log.user_id, existing);
      });
      const topUsers = Array.from(userMap.values())
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5);

      // Operation breakdown
      const operationMap = new Map<string, { operation: string; requests: number; cost: number }>();
      processedLogs.forEach(log => {
        const existing = operationMap.get(log.operation_type) || { operation: log.operation_type, requests: 0, cost: 0 };
        existing.requests += 1;
        existing.cost += log.estimated_cost || 0;
        operationMap.set(log.operation_type, existing);
      });
      const operationBreakdown = Array.from(operationMap.values());

      // Model breakdown
      const modelMap = new Map<string, { model: string; requests: number; cost: number }>();
      processedLogs.forEach(log => {
        const existing = modelMap.get(log.model) || { model: log.model, requests: 0, cost: 0 };
        existing.requests += 1;
        existing.cost += log.estimated_cost || 0;
        modelMap.set(log.model, existing);
      });
      const modelBreakdown = Array.from(modelMap.values());

      // Daily usage
      const dailyMap = new Map<string, { date: string; requests: number; cost: number; tokens: number }>();
      processedLogs.forEach(log => {
        const date = new Date(log.created_at).toLocaleDateString('ru-RU');
        const existing = dailyMap.get(date) || { date, requests: 0, cost: 0, tokens: 0 };
        existing.requests += 1;
        existing.cost += log.estimated_cost || 0;
        existing.tokens += log.total_tokens || 0;
        dailyMap.set(date, existing);
      });
      const dailyUsage = Array.from(dailyMap.values())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14); // Last 14 days

      const newStats = {
        totalRequests,
        totalTokens,
        totalCost,
        avgCostPerRequest,
        topUsers,
        operationBreakdown,
        modelBreakdown,
        dailyUsage
      };

      setStats(newStats);

      // Generate recommendations
      const recs = generateRecommendations(newStats);
      setRecommendations(recs);

      // Calculate forecast
      const forecastData = calculateForecast(dailyUsage);
      setForecast(forecastData);

      toast.success('AI аналитика загружена');
    } catch (error: any) {
      console.error('Error loading AI analytics:', error);
      toast.error(`Ошибка загрузки: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const csv = [
      ['Date', 'User', 'Operation', 'Model', 'Tokens', 'Cost'].join(','),
      ...logs.map(log => [
        new Date(log.created_at).toLocaleString('ru-RU'),
        log.user_name,
        log.operation_type,
        log.model,
        log.total_tokens,
        `$${log.estimated_cost.toFixed(6)}`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-usage-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV файл экспортирован');
  };

  const generateRecommendations = (stats: AIStats): AIRecommendation[] => {
    const recs: AIRecommendation[] = [];

    // High cost alert
    if (stats.totalCost > 100) {
      recs.push({
        type: 'warning',
        title: 'Высокие расходы на AI',
        description: `Общая стоимость за период составляет $${stats.totalCost.toFixed(2)}. Рекомендуем оптимизировать использование API.`,
        impact: 'Критично'
      });
    }

    // Expensive model usage
    const expensiveModels = stats.modelBreakdown.filter(m =>
      m.model.includes('gpt-4') && m.requests > stats.totalRequests * 0.5
    );
    if (expensiveModels.length > 0) {
      recs.push({
        type: 'info',
        title: 'Оптимизация моделей',
        description: 'Более 50% запросов используют дорогие модели GPT-4. Рассмотрите использование GPT-3.5-turbo для простых задач.',
        impact: 'Экономия до 90%'
      });
    }

    // High average cost per request
    if (stats.avgCostPerRequest > 0.05) {
      recs.push({
        type: 'warning',
        title: 'Высокая средняя стоимость запроса',
        description: `Средняя стоимость запроса $${stats.avgCostPerRequest.toFixed(4)} выше нормы. Проверьте размеры промптов и контекста.`,
        impact: 'Средне'
      });
    }

    // Low usage - good news
    if (stats.totalCost < 10 && stats.totalRequests > 0) {
      recs.push({
        type: 'success',
        title: 'Эффективное использование',
        description: 'Расходы на AI находятся в пределах нормы. Продолжайте в том же духе!',
        impact: 'Отлично'
      });
    }

    // No usage
    if (stats.totalRequests === 0) {
      recs.push({
        type: 'info',
        title: 'Нет активности',
        description: 'За выбранный период не было AI запросов. Убедитесь, что API настроен корректно.',
        impact: 'Информация'
      });
    }

    return recs;
  };

  const calculateForecast = (dailyUsage: Array<{ date: string; cost: number }>): CostForecast | null => {
    if (dailyUsage.length < 7) return null;

    // Calculate average daily cost for last 7 days
    const last7Days = dailyUsage.slice(-7);
    const avgDailyCost = last7Days.reduce((sum, day) => sum + day.cost, 0) / 7;

    // Calculate trend
    const first3Days = last7Days.slice(0, 3).reduce((sum, day) => sum + day.cost, 0) / 3;
    const last3Days = last7Days.slice(-3).reduce((sum, day) => sum + day.cost, 0) / 3;
    const percentageChange = first3Days > 0 ? ((last3Days - first3Days) / first3Days) * 100 : 0;

    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (percentageChange > 10) trend = 'increasing';
    else if (percentageChange < -10) trend = 'decreasing';

    return {
      nextMonth: avgDailyCost * 30,
      nextQuarter: avgDailyCost * 90,
      trend,
      percentageChange
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="!text-[26px] text-foreground flex items-center gap-2">
            <Brain className="w-7 h-7 text-accent" />
            AI Analytics
          </h3>
          <p className="!text-[15px] text-muted-foreground !font-normal">
            Аналитика использования OpenAI API
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 дней</SelectItem>
              <SelectItem value="30d">30 дней</SelectItem>
              <SelectItem value="90d">90 дней</SelectItem>
              <SelectItem value="all">Все время</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={logs.length === 0}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Экспорт CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAIAnalytics}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="!text-[13px] !font-medium text-muted-foreground">Всего запросов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="!text-[28px] !font-bold text-foreground">{stats.totalRequests}</div>
              <div className="w-10 h-10 rounded-[var(--radius)] bg-accent/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="!text-[13px] !font-medium text-muted-foreground">Всего токенов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="!text-[28px] !font-bold text-foreground">{stats.totalTokens.toLocaleString()}</div>
              <div className="w-10 h-10 rounded-[var(--radius)] bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="!text-[13px] !font-medium text-muted-foreground">Общая стоимость</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="!text-[28px] !font-bold text-foreground">${stats.totalCost.toFixed(2)}</div>
              <div className="w-10 h-10 rounded-[var(--radius)] bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="!text-[13px] !font-medium text-muted-foreground">Средняя стоимость</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="!text-[28px] !font-bold text-foreground">${stats.avgCostPerRequest.toFixed(4)}</div>
              <div className="w-10 h-10 rounded-[var(--radius)] bg-orange-500/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations & Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="!text-[17px] flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              AI Рекомендации
            </CardTitle>
            <CardDescription className="!text-[13px] !font-normal">
              Автоматические рекомендации по оптимизации
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.length === 0 ? (
              <p className="text-center text-muted-foreground !text-[13px] py-8">
                Загрузите данные для получения рекомендаций
              </p>
            ) : (
              recommendations.map((rec, index) => (
                <Alert
                  key={index}
                  variant={rec.type === 'warning' ? 'destructive' : 'default'}
                  className={
                    rec.type === 'success'
                      ? 'border-green-500/50 bg-green-500/10'
                      : rec.type === 'info'
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : ''
                  }
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="!text-[14px] !font-semibold">
                    {rec.title}
                    {rec.impact && (
                      <Badge variant="outline" className="ml-2 !text-[11px]">
                        {rec.impact}
                      </Badge>
                    )}
                  </AlertTitle>
                  <AlertDescription className="!text-[13px] !font-normal">
                    {rec.description}
                  </AlertDescription>
                </Alert>
              ))
            )}
          </CardContent>
        </Card>

        {/* Cost Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="!text-[17px] flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Прогноз затрат
            </CardTitle>
            <CardDescription className="!text-[13px] !font-normal">
              Прогнозирование расходов на основе текущих трендов
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!forecast ? (
              <p className="text-center text-muted-foreground !text-[13px] py-8">
                Недостаточно данных для прогноза (минимум 7 дней)
              </p>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="!text-[13px] text-muted-foreground">Следующий месяц</span>
                    <span className="!text-[20px] !font-bold text-foreground">
                      ${forecast.nextMonth.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {forecast.trend === 'increasing' ? (
                      <>
                        <TrendingUp className="w-4 h-4 text-red-500" />
                        <span className="!text-[12px] text-red-500">
                          Рост {Math.abs(forecast.percentageChange).toFixed(1)}%
                        </span>
                      </>
                    ) : forecast.trend === 'decreasing' ? (
                      <>
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        <span className="!text-[12px] text-green-500">
                          Снижение {Math.abs(forecast.percentageChange).toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <span className="!text-[12px] text-muted-foreground">
                        Стабильно
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="!text-[13px] text-muted-foreground">Следующий квартал</span>
                    <span className="!text-[20px] !font-bold text-foreground">
                      ${forecast.nextQuarter.toFixed(2)}
                    </span>
                  </div>
                  <p className="!text-[12px] text-muted-foreground">
                    Прогноз на 90 дней при текущем уровне использования
                  </p>
                </div>

                {forecast.trend === 'increasing' && forecast.percentageChange > 20 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="!text-[14px]">Внимание!</AlertTitle>
                    <AlertDescription className="!text-[13px]">
                      Расходы растут быстрыми темпами. Рекомендуем пересмотреть стратегию использования AI.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="!text-[17px]">Использование по дням</CardTitle>
            <CardDescription className="!text-[13px] !font-normal">Запросы и стоимость за последние 14 дней</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={stats.dailyUsage}
              dataKey="requests"
              xAxisKey="date"
              title="Использование по дням"
              type="line"
            />
          </CardContent>
        </Card>

        {/* Model Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="!text-[17px]">Распределение по моделям</CardTitle>
            <CardDescription className="!text-[13px] !font-normal">Использование разных моделей OpenAI</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={stats.modelBreakdown}
              dataKey="requests"
              xAxisKey="model"
              title="Распределение по моделям"
              type="pie"
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operation Breakdown Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="!text-[17px]">Распределение по операциям</CardTitle>
            <CardDescription className="!text-[13px] !font-normal">Типы AI операций и их стоимость</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart
              data={stats.operationBreakdown}
              dataKey="requests"
              xAxisKey="operation"
              title="Распределение по операциям"
              type="bar"
            />
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle className="!text-[17px]">Топ пользователей</CardTitle>
            <CardDescription className="!text-[13px] !font-normal">Пользователи с наибольшими расходами</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topUsers.length === 0 ? (
                <p className="text-center text-muted-foreground !text-[13px] py-8">Нет данных</p>
              ) : (
                stats.topUsers.map((user, index) => (
                  <div key={user.user_id} className="flex items-center justify-between p-3 rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center !text-[13px] !font-semibold text-accent">
                        {index + 1}
                      </div>
                      <div>
                        <p className="!text-[15px] !font-medium text-foreground">{user.user_name}</p>
                        <p className="!text-[13px] text-muted-foreground">{user.requests} запросов</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                      ${user.cost.toFixed(4)}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="!text-[17px]">Последние запросы</CardTitle>
          <CardDescription className="!text-[13px] !font-normal">100 последних AI запросов</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground !text-[15px]">Нет данных за выбранный период</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="!text-[13px]">Дата</TableHead>
                    <TableHead className="!text-[13px]">Пользователь</TableHead>
                    <TableHead className="!text-[13px]">Операция</TableHead>
                    <TableHead className="!text-[13px]">Модель</TableHead>
                    <TableHead className="!text-[13px] text-right">Токены</TableHead>
                    <TableHead className="!text-[13px] text-right">Стоимость</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="!text-[13px]">
                        {new Date(log.created_at).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="!text-[13px]">
                        <div>
                          <p className="!font-medium">{log.user_name}</p>
                          <p className="text-muted-foreground !text-[11px]">{log.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="!text-[13px]">
                        <Badge variant="outline" className="bg-accent/10 text-accent">
                          {log.operation_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="!text-[13px]">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                          {log.model}
                        </Badge>
                      </TableCell>
                      <TableCell className="!text-[13px] text-right !font-mono">
                        {log.total_tokens.toLocaleString()}
                      </TableCell>
                      <TableCell className="!text-[13px] text-right !font-mono text-green-600">
                        ${log.estimated_cost.toFixed(6)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

