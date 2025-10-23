/**
 * Advanced PWA Analytics Dashboard
 * 
 * Расширенная аналитика PWA с:
 * - Retention rate по когортам
 * - Funnel анализ
 * - Time series графики
 * - Экспорт в CSV/JSON
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  TrendingUp,
  Users,
  Download,
  Calendar,
  BarChart3,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  getCohortRetention,
  getFunnelAnalysis,
  getTimeSeriesData,
  exportToCSV,
  exportToJSON,
  type CohortData,
  type FunnelData,
  type TimeSeriesData,
} from '@/shared/lib/analytics/advanced-pwa-analytics';
import { SimpleChart } from '@/shared/components/SimpleChart';
import { toast } from 'sonner';

export function AdvancedPWAAnalytics() {
  const [isLoading, setIsLoading] = useState(false);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [funnel, setFunnel] = useState<FunnelData[]>([]);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);

  // Load analytics data
  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date();
      
      if (period === '7d') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate.setDate(startDate.getDate() - 30);
      } else {
        startDate.setDate(startDate.getDate() - 90);
      }

      const [cohortData, funnelData, timeSeriesData] = await Promise.all([
        getCohortRetention(startDate.toISOString(), endDate),
        getFunnelAnalysis(),
        getTimeSeriesData(startDate.toISOString(), endDate),
      ]);

      setCohorts(cohortData);
      setFunnel(funnelData);
      setTimeSeries(timeSeriesData);
    } catch (error) {
      console.error('[AdvancedPWAAnalytics] Failed to load analytics:', error);
      toast.error('Ошибка загрузки аналитики');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  // Export handlers
  const handleExportCSV = () => {
    const data = {
      cohorts,
      funnel,
      timeSeries,
    };
    
    exportToCSV(timeSeries, `pwa-analytics-${period}-${Date.now()}.csv`);
    toast.success('Экспорт в CSV завершен');
  };

  const handleExportJSON = () => {
    const data = {
      period,
      exportDate: new Date().toISOString(),
      cohorts,
      funnel,
      timeSeries,
    };
    
    exportToJSON(data, `pwa-analytics-${period}-${Date.now()}.json`);
    toast.success('Экспорт в JSON завершен');
  };

  // Calculate overall retention
  const overallRetention = cohorts.length > 0 ? {
    week1: Math.round(cohorts.reduce((sum, c) => sum + c.week1, 0) / cohorts.length),
    week2: Math.round(cohorts.reduce((sum, c) => sum + c.week2, 0) / cohorts.length),
    week3: Math.round(cohorts.reduce((sum, c) => sum + c.week3, 0) / cohorts.length),
    week4: Math.round(cohorts.reduce((sum, c) => sum + c.week4, 0) / cohorts.length),
  } : { week1: 0, week2: 0, week3: 0, week4: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Расширенная аналитика PWA</h2>
          <p className="text-sm text-muted-foreground">
            Детальная статистика, retention, funnel анализ
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={loadAnalytics}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
          
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          
          <Button
            onClick={handleExportJSON}
            variant="outline"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Период:</span>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <Button
                  key={p}
                  onClick={() => setPeriod(p)}
                  variant={period === p ? 'default' : 'outline'}
                  size="sm"
                >
                  {p === '7d' && '7 дней'}
                  {p === '30d' && '30 дней'}
                  {p === '90d' && '90 дней'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retention Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Retention Rate
          </CardTitle>
          <CardDescription>
            Процент пользователей, вернувшихся через N недель после установки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{overallRetention.week1}%</div>
              <div className="text-sm text-muted-foreground">Неделя 1</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{overallRetention.week2}%</div>
              <div className="text-sm text-muted-foreground">Неделя 2</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{overallRetention.week3}%</div>
              <div className="text-sm text-muted-foreground">Неделя 3</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{overallRetention.week4}%</div>
              <div className="text-sm text-muted-foreground">Неделя 4</div>
            </div>
          </div>

          {cohorts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Когорта</th>
                    <th className="text-right p-2">Пользователей</th>
                    <th className="text-right p-2">Неделя 1</th>
                    <th className="text-right p-2">Неделя 2</th>
                    <th className="text-right p-2">Неделя 3</th>
                    <th className="text-right p-2">Неделя 4</th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map((cohort) => (
                    <tr key={cohort.cohort} className="border-b">
                      <td className="p-2">{cohort.cohort}</td>
                      <td className="text-right p-2">{cohort.totalUsers}</td>
                      <td className="text-right p-2">
                        <Badge variant={cohort.week1 >= 50 ? 'success' : 'secondary'}>
                          {cohort.week1}%
                        </Badge>
                      </td>
                      <td className="text-right p-2">
                        <Badge variant={cohort.week2 >= 40 ? 'success' : 'secondary'}>
                          {cohort.week2}%
                        </Badge>
                      </td>
                      <td className="text-right p-2">
                        <Badge variant={cohort.week3 >= 30 ? 'success' : 'secondary'}>
                          {cohort.week3}%
                        </Badge>
                      </td>
                      <td className="text-right p-2">
                        <Badge variant={cohort.week4 >= 25 ? 'success' : 'secondary'}>
                          {cohort.week4}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Funnel Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Funnel Analysis
          </CardTitle>
          <CardDescription>
            Конверсия пользователей на каждом этапе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {funnel.map((stage, index) => (
              <div key={stage.stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{stage.stage}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {stage.users.toLocaleString()} пользователей
                    </span>
                    <Badge variant={stage.percentage >= 50 ? 'success' : 'secondary'}>
                      {stage.percentage}%
                    </Badge>
                  </div>
                </div>
                
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary rounded-full h-3 transition-all"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
                
                {stage.dropoff > 0 && (
                  <div className="text-sm text-muted-foreground pl-10">
                    Отсев: {stage.dropoff.toLocaleString()} пользователей
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Series */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Динамика установок
          </CardTitle>
          <CardDescription>
            Установки и активность по дням
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeSeries.length > 0 && (
            <SimpleChart
              data={timeSeries}
              dataKey="installs"
              xAxisKey="date"
              title="Установки по дням"
              type="line"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

