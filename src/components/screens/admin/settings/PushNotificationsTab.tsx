"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/send-notification', {
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

      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/settings', {
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
    <div className="admin-space-y-8">
      {/* Заголовок раздела */}
      <header className="admin-flex admin-items-center admin-gap-4 admin-pb-4 admin-border-b admin-border-gray-200">
        <div className="admin-p-3 admin-bg-admin-primary-lighter admin-rounded-lg admin-text-2xl" aria-hidden="true">
          🔔
        </div>
        <div>
          <h2 className="admin-text-2xl admin-font-semibold admin-text-gray-900">
            Push-уведомления
          </h2>
          <p className="admin-text-sm admin-text-gray-600 admin-mt-1">
            Создание и управление push уведомлениями для пользователей
          </p>
        </div>
        <div className="admin-ml-auto admin-flex admin-gap-2">
          <div className="admin-px-3 admin-py-1 admin-bg-admin-success-lighter admin-text-admin-success admin-rounded-full admin-text-xs admin-font-medium admin-flex admin-items-center admin-gap-1">
            <div className="admin-w-2 admin-h-2 admin-bg-admin-success admin-rounded-full" aria-hidden="true"></div>
            Активен
          </div>
          <div className="admin-px-3 admin-py-1 admin-bg-admin-primary-lighter admin-text-admin-primary admin-rounded-full admin-text-xs admin-font-medium">
            📨 12,345 отправлено
          </div>
        </div>
      </header>

      <div className="admin-grid admin-grid-cols-1 lg:admin-grid-cols-3 admin-gap-8">
        {/* Основная форма создания уведомления */}
        <div className="lg:admin-col-span-2 admin-space-y-6">
          {/* Форма создания уведомления */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                📝 Создание уведомления
              </h3>
              <p className="admin-card-description">
                Отправка push уведомлений пользователям
              </p>
            </div>
            <div className="admin-card-content admin-space-y-6">
              <div className="admin-space-y-4">
                <div className="admin-space-y-3">
                  <label htmlFor="notification-title" className="admin-font-medium admin-text-gray-900">
                    Заголовок уведомления
                  </label>
                  <input
                    id="notification-title"
                    type="text"
                    value={notification.title}
                    onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Введите заголовок уведомления"
                    className="admin-input"
                  />
                </div>

                <div className="admin-space-y-3">
                  <label htmlFor="notification-body" className="admin-font-medium admin-text-gray-900">
                    Текст уведомления
                  </label>
                  <textarea
                    id="notification-body"
                    value={notification.body}
                    onChange={(e) => setNotification(prev => ({ ...prev, body: e.target.value }))}
                    placeholder="Введите текст уведомления"
                    rows={4}
                    className="admin-input admin-textarea"
                  />
                </div>

                <div className="admin-grid admin-grid-cols-1 md:admin-grid-cols-2 admin-gap-6">
                  <div className="admin-space-y-3">
                    <label htmlFor="notification-icon" className="admin-font-medium admin-text-gray-900">
                      Иконка (URL)
                    </label>
                    <input
                      id="notification-icon"
                      type="text"
                      value={notification.icon}
                      onChange={(e) => setNotification(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="https://example.com/icon.png"
                      className="admin-input"
                    />
                  </div>
                  <div className="admin-space-y-3">
                    <label htmlFor="notification-badge" className="admin-font-medium admin-text-gray-900">
                      Бейдж (URL)
                    </label>
                    <input
                      id="notification-badge"
                      type="text"
                      value={notification.badge}
                      onChange={(e) => setNotification(prev => ({ ...prev, badge: e.target.value }))}
                      placeholder="https://example.com/badge.png"
                      className="admin-input"
                    />
                  </div>
                </div>

                <div className="admin-flex admin-justify-center admin-pt-4">
                  <button
                    onClick={handleSendNotification}
                    disabled={!notification.title || !notification.body || isSending}
                    className="admin-btn admin-btn-primary admin-font-medium admin-text-lg"
                  >
                    {isSending ? (
                      <div className="admin-flex admin-items-center admin-gap-2">
                        <div className="admin-spinner" />
                        Отправляю уведомление...
                      </div>
                    ) : (
                      <>
                        <span className="mr-2">🚀</span>
                        Отправить уведомление
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Статистика и настройки */}
        <div className="admin-space-y-6">
          {/* Статистика уведомлений */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                📊 Статистика
              </h3>
              <p className="admin-card-description">
                Эффективность уведомлений
              </p>
            </div>
            <div className="admin-card-content admin-space-y-4">
              <div className="admin-grid admin-grid-cols-1 admin-gap-4">
                {notificationStats.map((stat, index) => (
                  <div key={index} className="admin-p-4 admin-bg-gray-50 admin-rounded-lg admin-text-center admin-border admin-border-gray-200">
                    <div className={`admin-text-2xl admin-font-semibold admin-mb-2 ${stat.percentage ? 'admin-text-admin-success' : 'admin-text-admin-primary'}`}>
                      {stat.percentage ? `${stat.value}%` : stat.value.toLocaleString()}
                    </div>
                    <div className="admin-text-gray-600 admin-text-sm">{stat.metric}</div>
                  </div>
                ))}
              </div>

              {/* Рейтинговая система */}
              <div className="admin-p-4 admin-bg-admin-warning-lighter admin-rounded-lg admin-border admin-border-admin-warning-light">
                <div className="admin-text-center admin-mb-4">
                  <div className="admin-font-medium admin-text-gray-900 admin-mb-2">Оценка качества уведомлений</div>
                  <div className="admin-flex admin-justify-center admin-gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={`admin-text-3xl admin-transition-all admin-duration-200 admin-transform hover:admin-scale-110 ${
                          star <= rating ? 'admin-text-admin-warning' : 'admin-text-gray-400'
                        }`}
                        aria-label={`Оценка ${star} из 5`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="admin-text-gray-700 admin-text-sm admin-mt-2">
                    Средняя оценка: <span className="admin-font-semibold admin-text-admin-warning">{rating}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Настройки уведомлений */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                ⚙️ Настройки
              </h3>
              <p className="admin-card-description">
                Управление параметрами уведомлений
              </p>
            </div>
            <div className="admin-card-content admin-space-y-6">
              <div className="admin-space-y-4">
                <div className="admin-flex admin-items-center admin-justify-between admin-p-4 admin-bg-gray-50 admin-rounded-lg admin-border admin-border-gray-200">
                  <div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">
                      🔔 Включить push уведомления
                    </div>
                    <p className="admin-text-sm admin-text-gray-600">
                      Разрешить отправку уведомлений
                    </p>
                  </div>
                  <div className="admin-switch">
                    <input
                      id="enable-push"
                      type="checkbox"
                      checked={settings.enablePush}
                      onChange={(e) => setSettings(prev => ({ ...prev, enablePush: e.target.checked }))}
                      className="admin-sr-only"
                    />
                    <div className="admin-switch-slider"></div>
                  </div>
                </div>

                <div className="admin-flex admin-items-center admin-justify-between admin-p-4 admin-bg-gray-50 admin-rounded-lg admin-border admin-border-gray-200">
                  <div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">
                      ⏰ Отложенная отправка
                    </div>
                    <p className="admin-text-sm admin-text-gray-600">
                      Планирование отправки
                    </p>
                  </div>
                  <div className="admin-switch">
                    <input
                      id="enable-scheduled"
                      type="checkbox"
                      checked={settings.enableScheduled}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableScheduled: e.target.checked }))}
                      className="admin-sr-only"
                    />
                    <div className="admin-switch-slider"></div>
                  </div>
                </div>

                <div className="admin-flex admin-items-center admin-justify-between admin-p-4 admin-bg-gray-50 admin-rounded-lg admin-border admin-border-gray-200">
                  <div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">
                      🎯 Сегментация аудитории
                    </div>
                    <p className="admin-text-sm admin-text-gray-600">
                      Отправка разным группам
                    </p>
                  </div>
                  <div className="admin-switch">
                    <input
                      id="enable-segmentation"
                      type="checkbox"
                      checked={settings.enableSegmentation}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableSegmentation: e.target.checked }))}
                      className="admin-sr-only"
                    />
                    <div className="admin-switch-slider"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Действия и кнопки */}
      <div className="admin-flex admin-justify-center admin-gap-4">
        <button
          onClick={handleSaveSettings}
          disabled={isSavingSettings}
          className="admin-btn admin-btn-success admin-font-medium"
        >
          {isSavingSettings ? (
            <div className="admin-flex admin-items-center admin-gap-2">
              <div className="admin-spinner" />
              Сохраняю...
            </div>
          ) : (
            <>
              <span className="mr-2">💾</span>
              Сохранить настройки
            </>
          )}
        </button>
        <button
          onClick={() => {
            toast.info('Анализ кампаний в разработке 📊');
          }}
          className="admin-btn admin-btn-outline admin-font-medium"
        >
          <span className="mr-2">📊</span>
          Анализ кампаний
        </button>
        <button
          onClick={() => {
            toast.info('A/B тестирование в разработке 🎯');
          }}
          className="admin-btn admin-btn-outline admin-font-medium"
        >
          <span className="mr-2">🎯</span>
          A/B тестирование
        </button>
      </div>
    </div>
  );
};