"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { SimpleChart } from '../../../../shared/components/SimpleChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Bell, Send, Save, BarChart3, Star, Settings, Users } from 'lucide-react';

const notificationStats = [
  { metric: 'Отправлено', value: 12345, color: '#3b82f6' },
  { metric: 'Доставлено', value: 89, color: '#10b981', percentage: true },
  { metric: 'Открыто', value: 23, color: '#8b5cf6', percentage: true },
  { metric: 'CTR', value: 5.2, color: '#f59e0b', percentage: true },
];

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

  const [rating, setRating] = useState(4);
  const [isSending, setIsSending] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleSendNotification = async () => {
    if (!notification.title || !notification.body) {
      toast.error('Заполните заголовок и текст уведомления');
      return;
    }

    setIsSending(true);
    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      if (!token) {
        toast.error('Ошибка авторизации');
        return;
      }

      // ✅ Используем admin-api вместо make-server
      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/admin-api/notifications/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: notification.title,
          body: notification.body,
          icon: notification.icon,
          badge: notification.badge
        })
      });

      if (response.ok) {
        toast.success('Уведомление успешно отправлено! 🚀');
        // Очистка формы после успешной отправки
        setNotification({
          title: '🎉 Новое достижение!',
          body: 'Поздравляем! Вы достигли новой цели в вашем дневнике достижений.',
          icon: '',
          badge: ''
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Ошибка при отправке уведомления');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Ошибка соединения с сервером');
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      if (!token) {
        toast.error('Ошибка авторизации');
        return;
      }

      // ✅ Используем admin-api вместо make-server
      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/admin-api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'push_notification_settings',
          value: JSON.stringify(settings)
        })
      });

      if (response.ok) {
        toast.success('Настройки push-уведомлений сохранены! 🔔');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Ошибка сохранения настроек');
      }
    } catch (error) {
      console.error('Error saving push settings:', error);
      toast.error('Ошибка соединения с сервером');
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
              <div className="grid grid-cols-1 gap-3">
                {notificationStats.map((stat, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg text-center border">
                    <div className={`text-2xl font-semibold mb-2 ${stat.percentage ? 'text-green-600 dark:text-green-500' : 'text-primary'}`}>
                      {stat.percentage ? `${stat.value}%` : stat.value.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground text-sm">{stat.metric}</div>
                  </div>
                ))}
              </div>

              {/* Рейтинговая система */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-center mb-4">
                  <div className="font-medium mb-2">Оценка качества уведомлений</div>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((starValue) => (
                      <button
                        key={starValue}
                        onClick={() => setRating(starValue)}
                        className="transition-all duration-200 transform hover:scale-110"
                        aria-label={`Оценка ${starValue} из 5`}
                      >
                        <Star
                          className={`w-8 h-8 ${
                            starValue <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="text-sm mt-2">
                    Средняя оценка: <span className="font-semibold text-yellow-600 dark:text-yellow-500">{rating}/5</span>
                  </div>
                </div>
              </div>
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