/**
 * Push Analytics Dashboard
 * 
 * Отображает статистику push уведомлений:
 * - Общие метрики (sent, delivered, opened, rates)
 * - Статистика по браузерам
 * - Статистика по времени (часы, дни)
 * - Графики и визуализация
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { BarChart3, TrendingUp, Users, Bell, Clock, Calendar, RefreshCw } from 'lucide-react';
import { getPushAnalytics, type PushAnalyticsStats } from '@/shared/lib/analytics/push-analytics';
import { SimpleChart } from '@/shared/components/SimpleChart';

export const PushAnalyticsDashboard: React.FC = () => {
  const [stats, setStats] = useState<PushAnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('7d');

  const loadAnalytics = async () => {
    console.log('[PushAnalyticsDashboard] Loading analytics, period:', period);
    setLoading(true);
    try {
      let startDate: Date | undefined;
      const endDate = new Date();

      if (period === '7d') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === '30d') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
      }

      console.log('[PushAnalyticsDashboard] Calling getPushAnalytics with:', { startDate, endDate });
      const data = await getPushAnalytics(startDate, endDate);
      console.log('[PushAnalyticsDashboard] Received data:', data);
      setStats(data);
    } catch (error) {
      console.error('[PushAnalyticsDashboard] Failed to load push analytics:', error);
    } finally {
      setLoading(false);
      console.log('[PushAnalyticsDashboard] Loading complete');
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Загрузка аналитики...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center text-muted-foreground">
            Не удалось загрузить аналитику
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок и фильтры */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Push Аналитика
          </h3>
          <p className="text-sm text-muted-foreground">
            Статистика эффективности push уведомлений
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={period === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('7d')}
          >
            7 дней
          </Button>
          <Button
            variant={period === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('30d')}
          >
            30 дней
          </Button>
          <Button
            variant={period === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod('all')}
          >
            Все время
          </Button>
          <Button variant="ghost" size="sm" onClick={loadAnalytics}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sent */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Отправлено</p>
                <p className="text-2xl font-bold">{stats.total_sent.toLocaleString()}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Доставлено</p>
                <p className="text-2xl font-bold">{stats.total_delivered.toLocaleString()}</p>
                <Badge variant="secondary" className="mt-1">
                  {stats.delivery_rate.toFixed(1)}%
                </Badge>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* Open Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Открыто</p>
                <p className="text-2xl font-bold">{stats.total_opened.toLocaleString()}</p>
                <Badge variant="secondary" className="mt-1">
                  {stats.open_rate.toFixed(1)}%
                </Badge>
              </div>
              <Users className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* CTR */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CTR</p>
                <p className="text-2xl font-bold">{stats.ctr.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground mt-1">Click-through rate</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* График по дням */}
        {stats.by_day.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Статистика по дням
              </CardTitle>
              <CardDescription>Динамика отправки и открытия уведомлений</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleChart
                data={stats.by_day.map((d) => ({
                  name: new Date(d.date).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
                  Доставлено: d.delivered,
                  Открыто: d.opened,
                }))}
                xKey="name"
                yKeys={['Доставлено', 'Открыто']}
                colors={['#10b981', '#8b5cf6']}
              />
            </CardContent>
          </Card>
        )}

        {/* График по часам */}
        {stats.by_hour.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Статистика по часам
              </CardTitle>
              <CardDescription>Лучшее время для отправки уведомлений</CardDescription>
            </CardHeader>
            <CardContent>
              <SimpleChart
                data={stats.by_hour.map((h) => ({
                  name: `${h.hour}:00`,
                  Доставлено: h.delivered,
                  Открыто: h.opened,
                }))}
                xKey="name"
                yKeys={['Доставлено', 'Открыто']}
                colors={['#3b82f6', '#f59e0b']}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Статистика по браузерам */}
      {stats.by_browser.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Статистика по браузерам
            </CardTitle>
            <CardDescription>Эффективность push уведомлений в разных браузерах</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.by_browser.map((browser) => (
                <div key={browser.browser} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{browser.browser}</p>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Доставлено: {browser.delivered}</span>
                      <span>Открыто: {browser.opened}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      Delivery: {browser.delivery_rate.toFixed(1)}%
                    </Badge>
                    <Badge variant="secondary">
                      Open: {browser.open_rate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Рекомендации */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Рекомендации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {stats.delivery_rate < 80 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="font-medium text-yellow-800 dark:text-yellow-500">
                  ⚠️ Низкий процент доставки ({stats.delivery_rate.toFixed(1)}%)
                </p>
                <p className="text-yellow-700 dark:text-yellow-400 mt-1">
                  Проверьте VAPID keys и настройки Service Worker
                </p>
              </div>
            )}
            {stats.open_rate < 20 && stats.total_delivered > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="font-medium text-blue-800 dark:text-blue-500">
                  💡 Низкий процент открытия ({stats.open_rate.toFixed(1)}%)
                </p>
                <p className="text-blue-700 dark:text-blue-400 mt-1">
                  Попробуйте улучшить заголовки и текст уведомлений
                </p>
              </div>
            )}
            {stats.by_hour.length > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="font-medium text-green-800 dark:text-green-500">
                  ✅ Лучшее время для отправки
                </p>
                <p className="text-green-700 dark:text-green-400 mt-1">
                  {(() => {
                    const bestHour = stats.by_hour.reduce((best, current) =>
                      current.opened > best.opened ? current : best
                    );
                    return `${bestHour.hour}:00 - ${bestHour.hour + 1}:00 (${bestHour.opened} открытий)`;
                  })()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

