"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../../../../styles/admin/admin-theme.css';
import '../../../../styles/admin/admin-typography.css';
import '../../../../styles/admin/admin-cards.css';
import '../../../../styles/admin/admin-buttons.css';
import '../../../../styles/admin/admin-forms.css';
import '../../../../styles/admin/admin-tables.css';
import '../../../../styles/admin/admin-utilities.css';
import '../../../../styles/admin/admin-responsive.css';

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
    totalInstalls: 1234,
    retentionRate: 89,
    averageRating: 4.8,
    activeUsers: 567
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveManifest = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      if (!token) {
        toast.error('Ошибка авторизации');
        return;
      }

      // Save manifest settings
      const manifestResponse = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'pwa_manifest',
          value: JSON.stringify(manifest)
        })
      });

      // Save PWA settings
      const settingsResponse = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: 'pwa_settings',
          value: JSON.stringify(settings)
        })
      });

      if (manifestResponse.ok && settingsResponse.ok) {
        toast.success('Настройки PWA успешно сохранены! 📱');
      } else {
        toast.error('Ошибка сохранения настроек PWA');
      }
    } catch (error) {
      console.error('Error saving PWA settings:', error);
      toast.error('Ошибка соединения с сервером');
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
    <div className="admin-space-y-8">
      {/* Заголовок раздела */}
      <header className="admin-flex admin-items-center admin-gap-4 admin-pb-4 admin-border-b admin-border-gray-200">
        <div className="admin-p-3 admin-bg-admin-primary-lighter admin-rounded-lg admin-text-2xl" aria-hidden="true">
          📱
        </div>
        <div>
          <h2 className="admin-text-2xl admin-font-semibold admin-text-gray-900">
            Настройки PWA
          </h2>
          <p className="admin-text-sm admin-text-gray-600 admin-mt-1">
            Настройки Progressive Web App для лучшего пользовательского опыта
          </p>
        </div>
        <div className="admin-ml-auto admin-flex admin-gap-2">
          <div className="admin-px-3 admin-py-1 admin-bg-admin-success-lighter admin-text-admin-success admin-rounded-full admin-text-xs admin-font-medium admin-flex admin-items-center admin-gap-1">
            <div className="admin-w-2 admin-h-2 admin-bg-admin-success admin-rounded-full" aria-hidden="true"></div>
            Активен
          </div>
          <div className="admin-px-3 admin-py-1 admin-bg-admin-primary-lighter admin-text-admin-primary admin-rounded-full admin-text-xs admin-font-medium">
            📱 {stats.totalInstalls.toLocaleString()} установок
          </div>
        </div>
      </header>

      <div className="admin-grid admin-grid-cols-1 lg:admin-grid-cols-3 admin-gap-8">
        {/* Основные настройки PWA */}
        <div className="lg:admin-col-span-2 admin-space-y-6">
          {/* Манифест PWA */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                📋 Манифест PWA
              </h3>
              <p className="admin-card-description">
                Настройка веб-манифеста приложения
              </p>
            </div>
            <div className="admin-card-content admin-space-y-6">
              <div className="admin-grid admin-grid-cols-1 md:admin-grid-cols-2 admin-gap-6">
                <div className="admin-space-y-3">
                  <label htmlFor="app-name" className="admin-font-medium admin-text-gray-900">
                    Название приложения
                  </label>
                  <input
                    id="app-name"
                    type="text"
                    value={manifest.appName}
                    onChange={(e) => setManifest(prev => ({ ...prev, appName: e.target.value }))}
                    className="admin-input"
                  />
                </div>
                <div className="admin-space-y-3">
                  <label htmlFor="short-name" className="admin-font-medium admin-text-gray-900">
                    Короткое название
                  </label>
                  <input
                    id="short-name"
                    type="text"
                    value={manifest.shortName}
                    onChange={(e) => setManifest(prev => ({ ...prev, shortName: e.target.value }))}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-space-y-3">
                <label htmlFor="description" className="admin-font-medium admin-text-gray-900">
                  Описание
                </label>
                <input
                  id="description"
                  type="text"
                  value={manifest.description}
                  onChange={(e) => setManifest(prev => ({ ...prev, description: e.target.value }))}
                  className="admin-input"
                />
              </div>

              <div className="admin-grid admin-grid-cols-1 md:admin-grid-cols-2 admin-gap-6">
                <div className="admin-space-y-3">
                  <label htmlFor="theme-color" className="admin-font-medium admin-text-gray-900">
                    Цвет темы
                  </label>
                  <div className="admin-flex admin-gap-3 admin-items-center">
                    <input
                      id="theme-color"
                      type="text"
                      value={manifest.themeColor}
                      onChange={(e) => setManifest(prev => ({ ...prev, themeColor: e.target.value }))}
                      className="admin-input admin-flex-1"
                    />
                    <div
                      className="admin-w-12 admin-h-12 admin-rounded-lg admin-border-2 admin-border-gray-300 admin-shadow-sm"
                      style={{ backgroundColor: manifest.themeColor }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="admin-space-y-3">
                  <label htmlFor="bg-color" className="admin-font-medium admin-text-gray-900">
                    Цвет фона
                  </label>
                  <div className="admin-flex admin-gap-3 admin-items-center">
                    <input
                      id="bg-color"
                      type="text"
                      value={manifest.backgroundColor}
                      onChange={(e) => setManifest(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="admin-input admin-flex-1"
                    />
                    <div
                      className="admin-w-12 admin-h-12 admin-rounded-lg admin-border-2 admin-border-gray-300 admin-shadow-sm"
                      style={{ backgroundColor: manifest.backgroundColor }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Функции PWA */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                ⚙️ Функции PWA
              </h3>
              <p className="admin-card-description">
                Включение и отключение возможностей приложения
              </p>
            </div>
            <div className="admin-card-content admin-space-y-6">
              <div className="admin-grid admin-grid-cols-1 md:admin-grid-cols-2 admin-gap-6">
                <div className="admin-flex admin-items-center admin-justify-between admin-p-4 admin-bg-gray-50 admin-rounded-lg admin-border admin-border-gray-200">
                  <div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">
                      🔔 Push-уведомления
                    </div>
                    <p className="admin-text-sm admin-text-gray-600">
                      Разрешить отправку уведомлений
                    </p>
                  </div>
                  <div className="admin-switch">
                    <input
                      id="enable-notifications"
                      type="checkbox"
                      checked={settings.enableNotifications}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                      className="admin-sr-only"
                    />
                    <div className="admin-switch-slider"></div>
                  </div>
                </div>

                <div className="admin-flex admin-items-center admin-justify-between admin-p-4 admin-bg-gray-50 admin-rounded-lg admin-border admin-border-gray-200">
                  <div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">
                      📱 Офлайн режим
                    </div>
                    <p className="admin-text-sm admin-text-gray-600">
                      Работа без интернета
                    </p>
                  </div>
                  <div className="admin-switch">
                    <input
                      id="enable-offline"
                      type="checkbox"
                      checked={settings.enableOfflineMode}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableOfflineMode: e.target.checked }))}
                      className="admin-sr-only"
                    />
                    <div className="admin-switch-slider"></div>
                  </div>
                </div>

                <div className="admin-flex admin-items-center admin-justify-between admin-p-4 admin-bg-admin-warning-lighter admin-rounded-lg admin-border admin-border-admin-warning-light md:admin-col-span-2">
                  <div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">
                      💡 Подсказка установки
                    </div>
                    <p className="admin-text-sm admin-text-gray-600">
                      Предложить установить приложение
                    </p>
                  </div>
                  <div className="admin-switch">
                    <input
                      id="enable-install-prompt"
                      type="checkbox"
                      checked={settings.enableInstallPrompt}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableInstallPrompt: e.target.checked }))}
                      className="admin-sr-only"
                    />
                    <div className="admin-switch-slider"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Визуализация и статистика */}
        <div className="admin-space-y-6">
          {/* График установок */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                📈 Установки PWA
              </h3>
            </div>
            <div className="admin-card-content">
              <div className="admin-h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={installationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-gray-200)" />
                    <XAxis dataKey="month" stroke="var(--admin-gray-500)" fontSize={10} />
                    <YAxis stroke="var(--admin-gray-500)" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--admin-white)',
                        border: '1px solid var(--admin-gray-200)',
                        borderRadius: '8px',
                        boxShadow: 'var(--admin-shadow-md)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="installs"
                      stroke="var(--admin-success)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--admin-success)', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Распределение по платформам */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                📱 По платформам
              </h3>
            </div>
            <div className="admin-card-content">
              <div className="admin-h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--admin-white)',
                        border: '1px solid var(--admin-gray-200)',
                        borderRadius: '8px',
                        boxShadow: 'var(--admin-shadow-md)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Статистика установок */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                📊 Метрики
              </h3>
            </div>
            <div className="admin-card-content admin-space-y-4">
              <div className="admin-grid admin-grid-cols-1 admin-gap-4">
                <div className="admin-p-4 admin-bg-admin-primary-lighter admin-rounded-lg admin-text-center admin-border admin-border-admin-primary-light">
                  <div className="admin-text-2xl admin-font-semibold admin-text-admin-primary admin-mb-1">
                    {stats.totalInstalls.toLocaleString()}
                  </div>
                  <div className="admin-text-gray-600 admin-text-sm">Всего установок</div>
                </div>
                <div className="admin-p-4 admin-bg-admin-success-lighter admin-rounded-lg admin-text-center admin-border admin-border-admin-success-light">
                  <div className="admin-text-2xl admin-font-semibold admin-text-admin-success admin-mb-1">{stats.retentionRate}%</div>
                  <div className="admin-text-gray-600 admin-text-sm">Retention rate</div>
                </div>
                <div className="admin-p-4 admin-bg-admin-warning-lighter admin-rounded-lg admin-text-center admin-border admin-border-admin-warning-light">
                  <div className="admin-text-2xl admin-font-semibold admin-text-admin-warning admin-mb-1">⭐ {stats.averageRating}</div>
                  <div className="admin-text-gray-600 admin-text-sm">Средняя оценка</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Действия и кнопки */}
      <div className="admin-flex admin-justify-center admin-gap-4">
        <button
          onClick={handleSaveManifest}
          disabled={isSaving}
          className="admin-btn admin-btn-success admin-font-medium"
        >
          {isSaving ? (
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
          onClick={handlePublishUpdate}
          className="admin-btn admin-btn-warning admin-font-medium"
        >
          <span className="mr-2">🚀</span>
          Опубликовать обновление
        </button>
        <button
          onClick={handleAnalyzeMetrics}
          className="admin-btn admin-btn-primary admin-font-medium"
        >
          <span className="mr-2">📊</span>
          Анализ метрик
        </button>
      </div>
    </div>
  );
};