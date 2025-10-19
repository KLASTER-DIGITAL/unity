"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';

export const GeneralSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    appName: 'Дневник Достижений',
    appDescription: 'Персональный дневник для отслеживания достижений и целей',
    supportEmail: 'support@diary.com',
    maxEntriesPerDay: 10,
    enableAnalytics: true,
    enableErrorReporting: true,
    maintenanceMode: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
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
          key: 'general_settings',
          value: JSON.stringify(settings)
        })
      });

      if (response.ok) {
        toast.success('Настройки успешно сохранены! ✅');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Ошибка сохранения настроек');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Ошибка соединения с сервером');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      // Сброс к значениям по умолчанию
      setSettings({
        appName: 'Дневник Достижений',
        appDescription: 'Персональный дневник для отслеживания достижений и целей',
        supportEmail: 'support@diary.com',
        maxEntriesPerDay: 10,
        enableAnalytics: true,
        enableErrorReporting: true,
        maintenanceMode: false
      });
      
      toast.success('Настройки сброшены к значениям по умолчанию! 🔄');
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Ошибка при сбросе настроек');
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportSettings = () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'unity-general-settings.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success('Настройки экспортированы! 📤');
    } catch (error) {
      toast.error('Ошибка экспорта настроек');
    }
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedSettings = JSON.parse(content);
        setSettings(importedSettings);
        toast.success('Настройки импортированы! 📥');
      } catch (error) {
        toast.error('Ошибка импорта файла настроек');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="admin-space-y-8">
      {/* Заголовок раздела */}
      <header className="admin-flex admin-items-center admin-gap-4 admin-pb-4 admin-border-b admin-border-gray-200">
        <div className="admin-p-3 admin-bg-admin-primary-lighter admin-rounded-lg admin-text-2xl" aria-hidden="true">
          ⚙️
        </div>
        <div>
          <h2 className="admin-text-2xl admin-font-semibold admin-text-gray-900">
            Общие настройки
          </h2>
          <p className="admin-text-sm admin-text-gray-600 admin-mt-1">
            Основные параметры и конфигурация приложения
          </p>
        </div>
        <div className="admin-ml-auto admin-flex admin-gap-2">
          <div className="admin-px-3 admin-py-1 admin-bg-admin-success-lighter admin-text-admin-success admin-rounded-full admin-text-xs admin-font-medium admin-flex admin-items-center admin-gap-1">
            <div className="admin-w-2 admin-h-2 admin-bg-admin-success admin-rounded-full" aria-hidden="true"></div>
            Активен
          </div>
          <div className="admin-px-3 admin-py-1 admin-bg-admin-primary-lighter admin-text-admin-primary admin-rounded-full admin-text-xs admin-font-medium">
            🔧 Готов к настройке
          </div>
        </div>
      </header>

      <div className="admin-grid admin-grid-cols-1 lg:admin-grid-cols-3 admin-gap-8">
        {/* Основные настройки приложения */}
        <div className="lg:admin-col-span-2 admin-space-y-6">
          {/* Основные параметры */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                📋 Основные параметры
              </h3>
              <p className="admin-card-description">
                Базовая конфигурация приложения
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
                    value={settings.appName}
                    onChange={(e) => setSettings(prev => ({ ...prev, appName: e.target.value }))}
                    className="admin-input"
                  />
                </div>
                <div className="admin-space-y-3">
                  <label htmlFor="support-email" className="admin-font-medium admin-text-gray-900">
                    Email поддержки
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                    className="admin-input"
                  />
                </div>
              </div>

              <div className="admin-space-y-3">
                <label htmlFor="app-description" className="admin-font-medium admin-text-gray-900">
                  Описание приложения
                </label>
                <textarea
                  id="app-description"
                  value={settings.appDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, appDescription: e.target.value }))}
                  rows={3}
                  className="admin-input admin-textarea"
                />
              </div>

              <div className="admin-space-y-3">
                <label htmlFor="max-entries" className="admin-font-medium admin-text-gray-900">
                  Максимум записей в день
                </label>
                <input
                  id="max-entries"
                  type="number"
                  value={settings.maxEntriesPerDay}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxEntriesPerDay: parseInt(e.target.value) || 0 }))}
                  className="admin-input"
                />
              </div>
            </div>
          </div>

          {/* Системные функции */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                🔧 Системные функции
              </h3>
              <p className="admin-card-description">
                Конфигурация дополнительных возможностей
              </p>
            </div>
            <div className="admin-card-content admin-space-y-6">
              <div className="admin-grid admin-grid-cols-1 md:admin-grid-cols-2 admin-gap-6">
                <div className="admin-flex admin-items-center admin-justify-between admin-p-4 admin-bg-admin-gray-50 admin-rounded-lg admin-border admin-border-gray-200">
                  <div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">
                      📊 Аналитика
                    </div>
                    <p className="admin-text-sm admin-text-gray-600">
                      Сбор данных об использовании
                    </p>
                  </div>
                  <div className="admin-switch">
                    <input
                      id="enable-analytics"
                      type="checkbox"
                      checked={settings.enableAnalytics}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableAnalytics: e.target.checked }))}
                      className="admin-sr-only"
                    />
                    <div className="admin-switch-slider"></div>
                  </div>
                </div>

                <div className="admin-flex admin-items-center admin-justify-between admin-p-4 admin-bg-admin-gray-50 admin-rounded-lg admin-border admin-border-gray-200">
                  <div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">
                      🐛 Отчеты об ошибках
                    </div>
                    <p className="admin-text-sm admin-text-gray-600">
                      Автоматическая отправка отчетов
                    </p>
                  </div>
                  <div className="admin-switch">
                    <input
                      id="enable-error-reporting"
                      type="checkbox"
                      checked={settings.enableErrorReporting}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableErrorReporting: e.target.checked }))}
                      className="admin-sr-only"
                    />
                    <div className="admin-switch-slider"></div>
                  </div>
                </div>

                <div className="admin-flex admin-items-center admin-justify-between admin-p-4 admin-bg-admin-warning-lighter admin-rounded-lg admin-border admin-border-admin-warning-light md:admin-col-span-2">
                  <div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">
                      🔧 Режим обслуживания
                    </div>
                    <p className="admin-text-sm admin-text-gray-600">
                      Временно отключить приложение
                    </p>
                  </div>
                  <div className="admin-switch">
                    <input
                      id="maintenance-mode"
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMode: e.target.checked }))}
                      className="admin-sr-only"
                    />
                    <div className="admin-switch-slider"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Управление данными */}
        <div className="admin-space-y-6">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                💾 Управление данными
              </h3>
              <p className="admin-card-description">
                Экспорт и импорт настроек
              </p>
            </div>
            <div className="admin-card-content admin-space-y-6">
              <div className="admin-space-y-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="admin-btn admin-btn-success admin-w-full admin-font-medium"
                >
                  {isSaving ? (
                    <div className="admin-flex admin-items-center admin-gap-2">
                      <div className="admin-spinner" />
                      Сохраняю настройки...
                    </div>
                  ) : (
                    <>
                      <span className="mr-2">💾</span>
                      Сохранить настройки
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="admin-btn admin-btn-outline admin-w-full admin-font-medium"
                >
                  {isResetting ? (
                    <div className="admin-flex admin-items-center admin-gap-2">
                      <div className="admin-spinner" />
                      Сбрасываю...
                    </div>
                  ) : (
                    <>
                      <span className="mr-2">🔄</span>
                      Сбросить настройки
                    </>
                  )}
                </button>
              </div>

              <div className="admin-grid admin-grid-cols-1 admin-gap-4">
                <div className="admin-p-4 admin-bg-admin-primary-lighter admin-rounded-lg admin-text-center admin-border admin-border-admin-primary-light">
                  <div className="admin-text-xl admin-font-semibold admin-text-admin-primary admin-mb-2">
                    📤 Экспорт
                  </div>
                  <button
                    onClick={handleExportSettings}
                    className="admin-btn admin-btn-outline admin-btn-sm"
                  >
                    Скачать JSON
                  </button>
                </div>
                <div className="admin-p-4 admin-bg-admin-success-lighter admin-rounded-lg admin-text-center admin-border admin-border-admin-success-light">
                  <div className="admin-text-xl admin-font-semibold admin-text-admin-success admin-mb-2">
                    📥 Импорт
                  </div>
                  <button
                    onClick={() => document.getElementById('import-settings-file')?.click()}
                    className="admin-btn admin-btn-outline admin-btn-sm"
                  >
                    Загрузить файл
                  </button>
                  <input
                    id="import-settings-file"
                    type="file"
                    accept=".json"
                    className="admin-hidden"
                    onChange={handleImportSettings}
                    aria-label="Импорт настроек из файла"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};