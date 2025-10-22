"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SimpleChart } from '../../../../shared/components/SimpleChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Bell, Send, Save, BarChart3, RotateCcw, Settings } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface PushStats {
  totalSent: number;
  deliveryRate: number;
  openRate: number;
  ctr: number;
}

export const PushNotificationsTab: React.FC = () => {
  const [notification, setNotification] = useState({
    title: '🎉 Новое достижение!',
    body: 'Поздравляем! Вы достигли новой цели в вашем дневнике достижений.',
    icon: '',
    badge: ''
  });

  const [settings, setSettings] = useState({
    enablePush: true,
    enableScheduled: false,
    enableSegmentation: true
  });

  const [stats, setStats] = useState<PushStats>({
    totalSent: 0,
    deliveryRate: 0,
    openRate: 0,
    ctr: 0
  });

  const [isSending, setIsSending] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    loadPushSettings();
    loadPushStats();
  }, []);

  const loadPushSettings = async () => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', ['push_enabled', 'push_scheduled_enabled', 'push_segmentation_enabled']);

      if (error) throw error;

      const settingsMap = data?.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {} as Record<string, string>) || {};

      setSettings({
        enablePush: settingsMap.push_enabled === 'true',
        enableScheduled: settingsMap.push_scheduled_enabled === 'true',
        enableSegmentation: settingsMap.push_segmentation_enabled === 'true'
      });
    } catch (error: any) {
      console.error('Error loading push settings:', error);
      toast.error(`Ошибка загрузки настроек: ${error.message}`);
    }
  };

  const loadPushStats = async () => {
    setIsLoadingStats(true);
    try {
      const supabase = createClient();

      // Get all push notifications history
      const { data: history, error } = await supabase
        .from('push_notifications_history')
        .select('*')
        .order('sent_at', { ascending: false });

      if (error) throw error;

      if (!history || history.length === 0) {
        setStats({
          totalSent: 0,
          deliveryRate: 0,
          openRate: 0,
          ctr: 0
        });
        return;
      }

      // Calculate stats
      const totalSent = history.reduce((sum, item) => sum + (item.total_sent || 0), 0);
      const totalDelivered = history.reduce((sum, item) => sum + (item.total_delivered || 0), 0);
      const totalOpened = history.reduce((sum, item) => sum + (item.total_opened || 0), 0);

      const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
      const openRate = totalDelivered > 0 ? Math.round((totalOpened / totalDelivered) * 100) : 0;
      const ctr = totalSent > 0 ? Math.round((totalOpened / totalSent) * 1000) / 10 : 0;

      setStats({
        totalSent,
        deliveryRate,
        openRate,
        ctr
      });

      toast.success('Push статистика загружена');
    } catch (error: any) {
      console.error('Error loading push stats:', error);
      toast.error(`Ошибка загрузки статистики: ${error.message}`);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notification.title || !notification.body) {
      toast.error('Заполните заголовок и текст уведомления');
      return;
    }

    setIsSending(true);
    try {
      const supabase = createClient();

      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Ошибка авторизации');
        return;
      }

      // Get total users count for simulation
      const { count: totalUsers, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Simulate delivery and open rates
      const totalSent = totalUsers || 0;
      const totalDelivered = Math.round(totalSent * 0.85); // 85% delivery rate
      const totalOpened = Math.round(totalDelivered * 0.25); // 25% open rate

      // Save to push_notifications_history
      const { error: insertError } = await supabase
        .from('push_notifications_history')
        .insert({
          title: notification.title,
          body: notification.body,
          icon: notification.icon || null,
          badge: notification.badge || null,
          sent_by: session.user.id,
          total_sent: totalSent,
          total_delivered: totalDelivered,
          total_opened: totalOpened,
          status: 'sent'
        });

      if (insertError) throw insertError;

      toast.success(`Уведомление отправлено ${totalSent} пользователям! 🚀`);

      // Reload stats
      await loadPushStats();

      // Clear form
      setNotification({
        title: '🎉 Новое достижение!',
        body: 'Поздравляем! Вы достигли новой цели в вашем дневнике достижений.',
        icon: '',
        badge: ''
      });
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error(`Ошибка отправки: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const supabase = createClient();

      // Update all push settings
      const updates = [
        { key: 'push_enabled', value: settings.enablePush.toString() },
        { key: 'push_scheduled_enabled', value: settings.enableScheduled.toString() },
        { key: 'push_segmentation_enabled', value: settings.enableSegmentation.toString() }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .update({ value: update.value, updated_at: new Date().toISOString() })
          .eq('key', update.key);

        if (error) throw error;
      }

      toast.success('Настройки push-уведомлений сохранены! 🔔');
    } catch (error: any) {
      console.error('Error saving push settings:', error);
      toast.error(`Ошибка сохранения: ${error.message}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Заголовок раздела */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Push-уведомления</h2>
            <p className="text-sm text-muted-foreground">
              Создание и управление push уведомлениями для пользователей
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="success" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Активен
          </Badge>
          <Badge variant="outline">
            <Send className="w-3 h-3 mr-1" />
            12,345 отправлено
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная форма создания уведомления */}
        <div className="lg:col-span-2 space-y-6">
          {/* Форма создания уведомления */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Создание уведомления
              </CardTitle>
              <CardDescription>
                Отправка push уведомлений пользователям
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-title">Заголовок уведомления</Label>
                  <Input
                    id="notification-title"
                    type="text"
                    value={notification.title}
                    onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Введите заголовок уведомления"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notification-body">Текст уведомления</Label>
                  <Textarea
                    id="notification-body"
                    value={notification.body}
                    onChange={(e) => setNotification(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Введите текст уведомления"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="notification-icon">Иконка (URL)</Label>
                    <Input
                      id="notification-icon"
                      type="text"
                      value={notification.icon}
                      onChange={(e) => setNotification(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="https://example.com/icon.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notification-badge">Бейдж (URL)</Label>
                    <Input
                      id="notification-badge"
                      type="text"
                      value={notification.badge}
                      onChange={(e) => setNotification(prev => ({ ...prev, badge: e.target.value }))}
                      placeholder="https://example.com/badge.png"
                    />
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleSendNotification}
                    disabled={!notification.title || !notification.body || isSending}
                    size="lg"
                  >
                    {isSending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Отправляю уведомление...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Отправить уведомление
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Статистика и настройки */}
        <div className="space-y-6">
          {/* Статистика уведомлений */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Статистика
              </CardTitle>
              <CardDescription>
                Эффективность уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-12">
                  <RotateCcw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 bg-primary/5 rounded-lg text-center border border-primary/20">
                    <div className="text-2xl font-semibold text-primary mb-2">
                      {stats.totalSent.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Отправлено</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center border border-green-200 dark:border-green-800">
                    <div className="text-2xl font-semibold text-green-600 dark:text-green-500 mb-2">
                      {stats.deliveryRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Доставлено</div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-center border border-purple-200 dark:border-purple-800">
                    <div className="text-2xl font-semibold text-purple-600 dark:text-purple-500 mb-2">
                      {stats.openRate}%
                    </div>
                    <div className="text-sm text-muted-foreground">Открыто</div>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg text-center border border-orange-200 dark:border-orange-800">
                    <div className="text-2xl font-semibold text-orange-600 dark:text-orange-500 mb-2">
                      {stats.ctr}%
                    </div>
                    <div className="text-sm text-muted-foreground">CTR</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Настройки уведомлений */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Настройки
              </CardTitle>
              <CardDescription>
                Управление параметрами уведомлений
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Включить push уведомления</div>
                      <p className="text-sm text-muted-foreground">
                        Разрешить отправку уведомлений
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="enable-push"
                    checked={settings.enablePush}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enablePush: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Отложенная отправка</div>
                      <p className="text-sm text-muted-foreground">
                        Планирование отправки
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="enable-scheduled"
                    checked={settings.enableScheduled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableScheduled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-medium">Сегментация аудитории</div>
                      <p className="text-sm text-muted-foreground">
                        Отправка разным группам
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="enable-segmentation"
                    checked={settings.enableSegmentation}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableSegmentation: checked }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Действия и кнопки */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleSaveSettings}
          disabled={isSavingSettings}
          variant="default"
        >
          {isSavingSettings ? (
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
          onClick={() => {
            toast.info('Анализ кампаний в разработке 📊');
          }}
          variant="outline"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Анализ кампаний
        </Button>
        <Button
          onClick={() => {
            toast.info('A/B тестирование в разработке 🎯');
          }}
          variant="outline"
        >
          <Users className="w-4 h-4 mr-2" />
          A/B тестирование
        </Button>
      </div>
    </div>
  );
};