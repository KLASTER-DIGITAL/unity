"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { SimpleChart } from '../../../../shared/components/SimpleChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Smartphone, Save, Rocket, BarChart3, Download, Upload, Star, Users, TrendingUp, Bell, Settings } from 'lucide-react';

const installationData = [
  { month: 'Jan', installs: 120, uninstalls: 15 },
  { month: 'Feb', installs: 150, uninstalls: 12 },
  { month: 'Mar', installs: 200, uninstalls: 18 },
  { month: 'Apr', installs: 180, uninstalls: 20 },
  { month: 'May', installs: 250, uninstalls: 22 },
  { month: 'Jun', installs: 300, uninstalls: 25 },
];

const platformData = [
  { name: 'Desktop', value: 45, color: '#3b82f6' },
  { name: 'Mobile', value: 35, color: '#10b981' },
  { name: 'Tablet', value: 20, color: '#f59e0b' },
];

export const PWASettingsTab: React.FC = () => {
  const [manifest, setManifest] = useState({
    appName: 'Дневник Достижений',
    shortName: 'Дневник',
    description: 'Персональный дневник для отслеживания достижений',
    themeColor: '#3b82f6',
    backgroundColor: '#ffffff'
  });

  const [settings, setSettings] = useState({
    enableNotifications: true,
    enableOfflineMode: true,
    enableInstallPrompt: true
  });

  const [stats, setStats] = useState({
    totalInstalls: 0,
    retentionRate: 0,
    averageRating: 0,
    activeUsers: 0
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    loadPWAStats();
  }, []);

  const loadPWAStats = async () => {
    setIsLoadingStats(true);
    try {
      const supabase = createClient();

      // Get total users with PWA installed
      const { count: totalInstalls, error: installsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('pwa_installed', true);

      if (installsError) throw installsError;

      // Get active users (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { count: activeUsers, error: activeError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', sevenDaysAgo.toISOString());

      if (activeError) throw activeError;

      // Calculate retention rate (active users / total installs * 100)
      const retentionRate = totalInstalls && totalInstalls > 0
        ? Math.round((activeUsers || 0) / totalInstalls * 100)
        : 0;

      // Get total users for average rating calculation
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) throw usersError;

      // Calculate average rating based on user activity
      // Users with entries in last 30 days = 5 stars
      // Users with entries in last 90 days = 4 stars
      // Others = 3 stars
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentEntries, error: entriesError } = await supabase
        .from('entries')
        .select('user_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (entriesError) throw entriesError;

      const activeUserIds = new Set(recentEntries?.map(e => e.user_id) || []);
      const averageRating = activeUserIds.size > 0 && totalUsers && totalUsers > 0
        ? Math.min(5, 3 + (activeUserIds.size / totalUsers) * 2)
        : 0;

      setStats({
        totalInstalls: totalInstalls || 0,
        retentionRate,
        averageRating: Math.round(averageRating * 10) / 10,
        activeUsers: activeUsers || 0
      });

      toast.success('PWA статистика загружена');
    } catch (error: any) {
      console.error('Error loading PWA stats:', error);
      toast.error(`Ошибка загрузки статистики: ${error.message}`);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSaveManifest = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();

      // Save manifest settings to admin_settings
      const { error: manifestError } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'pwa_manifest',
          value: JSON.stringify(manifest),
          category: 'pwa',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (manifestError) throw manifestError;

      // Save PWA settings to admin_settings
      const { error: settingsError } = await supabase
        .from('admin_settings')
        .upsert({
          key: 'pwa_settings',
          value: JSON.stringify(settings),
          category: 'pwa',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (settingsError) throw settingsError;

      toast.success('Настройки PWA успешно сохранены! 📱');
    } catch (error: any) {
      console.error('Error saving PWA settings:', error);
      toast.error(`Ошибка сохранения: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishUpdate = async () => {
    try {
      toast.info('Публикация обновления PWA в разработке... 🚀');
      // Здесь будет реальная логика публикации
    } catch (error) {
      toast.error('Ошибка публикации обновления');
    }
  };

  const handleAnalyzeMetrics = async () => {
    try {
      toast.info('Анализ метрик PWA в разработке... 📊');
      // Здесь будет реальная логика анализа
    } catch (error) {
      toast.error('Ошибка анализа метрик');
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок раздела */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Smartphone className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Настройки PWA</h2>
            <p className="text-sm text-muted-foreground">
              Настройки Progressive Web App для лучшего пользовательского опыта
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="success" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Активен
          </Badge>
          <Badge variant="outline">
            <Smartphone className="w-3 h-3 mr-1" />
            {stats.totalInstalls.toLocaleString()} установок
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основные настройки PWA */}
        <div className="lg:col-span-2 space-y-6">
          {/* Манифест PWA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Манифест PWA
              </CardTitle>
              <CardDescription>
                Настройка веб-манифеста приложения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="app-name">Название приложения</Label>
                  <Input
                    id="app-name"
                    type="text"
                    value={manifest.appName}
                    onChange={(e) => setManifest(prev => ({ ...prev, appName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short-name">Короткое название</Label>
                  <Input
                    id="short-name"
                    type="text"
                    value={manifest.shortName}
                    onChange={(e) => setManifest(prev => ({ ...prev, shortName: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Input
                  id="description"
                  type="text"
                  value={manifest.description}
                  onChange={(e) => setManifest(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme-color">Цвет темы</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="theme-color"
                      type="text"
                      value={manifest.themeColor}
                      onChange={(e) => setManifest(prev => ({ ...prev, themeColor: e.target.value }))}
                      className="flex-1"
                    />
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: manifest.themeColor }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bg-color">Цвет фона</Label>
                  <div className="flex gap-3 items-center">
                    <Input
                      id="bg-color"
                      type="text"
                      value={manifest.backgroundColor}
                      onChange={(e) => setManifest(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="flex-1"
                    />
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: manifest.backgroundColor }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Функции PWA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Функции PWA
              </CardTitle>
              <CardDescription>
                Включение и отключение возможностей приложения
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Push-уведомления</div>
                      <p className="text-sm text-muted-foreground">
                        Разрешить отправку уведомлений
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="enable-notifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Офлайн режим</div>
                      <p className="text-sm text-muted-foreground">
                        Работа без интернета
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="enable-offline"
                    checked={settings.enableOfflineMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableOfflineMode: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                    <div>
                      <div className="font-medium">Подсказка установки</div>
                      <p className="text-sm text-muted-foreground">
                        Предложить установить приложение
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="enable-install-prompt"
                    checked={settings.enableInstallPrompt}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableInstallPrompt: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Визуализация и статистика */}
        <div className="space-y-6">
          {/* График установок */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Установки PWA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleChart
                data={installationData}
                dataKey="installs"
                xAxisKey="month"
                title="Установки PWA по месяцам"
                type="line"
              />
            </CardContent>
          </Card>

          {/* Распределение по платформам */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                По платформам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleChart
                data={platformData}
                dataKey="value"
                xAxisKey="name"
                title="Распределение по платформам"
                type="pie"
              />
            </CardContent>
          </Card>

          {/* Статистика установок */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Метрики
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-12">
                  <RotateCcw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 bg-primary/5 rounded-lg text-center border border-primary/20">
                    <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-primary mb-1">
                      <Download className="w-5 h-5" />
                      {stats.totalInstalls.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground text-sm">Всего установок</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-semibold text-green-600 dark:text-green-500 mb-1">{stats.retentionRate}%</div>
                    <div className="text-muted-foreground text-sm">Retention rate</div>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg text-center border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-center gap-2 text-2xl font-semibold text-yellow-600 dark:text-yellow-500 mb-1">
                      <Star className="w-5 h-5" />
                      {stats.averageRating}
                    </div>
                    <div className="text-muted-foreground text-sm">Средняя оценка</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Действия и кнопки */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleSaveManifest}
          disabled={isSaving}
          variant="default"
        >
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Сохраняю...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Сохранить настройки
            </>
          )}
        </Button>
        <Button
          onClick={handlePublishUpdate}
          variant="secondary"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Опубликовать обновление
        </Button>
        <Button
          onClick={handleAnalyzeMetrics}
          variant="outline"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Анализ метрик
        </Button>
      </div>
    </div>
  );
};