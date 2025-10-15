"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { QuickStats } from './api/QuickStats';
import { UsageBreakdown } from './api/UsageBreakdown';
import { UsageChart } from './api/UsageChart';
import { UserUsageTable } from './api/UserUsageTable';
import '../../../../styles/admin-design-system.css';

const apiUsageData = [
  { month: 'Jan', requests: 4000, tokens: 120000, cost: 12.50 },
  { month: 'Feb', requests: 3000, tokens: 90000, cost: 9.75 },
  { month: 'Mar', requests: 5000, tokens: 150000, cost: 15.25 },
  { month: 'Apr', requests: 4500, tokens: 135000, cost: 13.80 },
  { month: 'May', requests: 6000, tokens: 180000, cost: 18.50 },
  { month: 'Jun', requests: 5500, tokens: 165000, cost: 16.75 },
];

export const APISettingsTab: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [usageStats, setUsageStats] = useState({
    requests: 1247,
    tokens: 45678,
    cost: 12.34
  });

  useEffect(() => {
    // Load saved API key
    const loadApiKey = async () => {
      try {
        const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
        if (!token) return;

        const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/settings/openai_api_key', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.setting?.value) {
            setApiKey(data.setting.value);
            setIsValid(true);
          }
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      }
    };

    loadApiKey();
  }, []);

  const handleSave = async () => {
    if (!apiKey) {
      toast.error('Введите API ключ');
      return;
    }

    setIsLoading(true);
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
          key: 'openai_api_key',
          value: apiKey
        })
      });

      if (response.ok) {
        setIsValid(true);
        toast.success('API ключ успешно сохранен! 🔑');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Ошибка сохранения API ключа');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey) {
      toast.error('Введите API ключ для проверки');
      return;
    }

    setIsValidating(true);
    try {
      // Simple format validation
      if (apiKey.startsWith('sk-') && apiKey.length > 20) {
        setIsValid(true);
        toast.success('API ключ выглядит корректно! ✅');
      } else {
        setIsValid(false);
        toast.error('API ключ имеет неверный формат. Должен начинаться с "sk-" и содержать более 20 символов');
      }
    } catch (error) {
      setIsValid(false);
      console.error('Error testing API key:', error);
      toast.error('Ошибка при проверке API ключа');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="admin-space-y-10">
      {/* Заголовок раздела */}
      <header className="admin-flex admin-items-center admin-gap-4 admin-pb-4 admin-border-b admin-border-gray-200">
        <div className="admin-p-3 admin-bg-admin-primary-lighter admin-rounded-lg admin-text-2xl" aria-hidden="true">
          🔑
        </div>
        <div>
          <h2 className="admin-text-2xl admin-font-semibold admin-text-gray-900">
            Настройки OpenAI API
          </h2>
          <p className="admin-text-sm admin-text-gray-600 admin-mt-1">
            Управление API ключом и мониторинг использования
          </p>
        </div>
        <div className="admin-ml-auto admin-flex admin-gap-2">
          <div className={`admin-px-3 admin-py-1 admin-rounded-full admin-text-xs admin-font-medium ${isValid ? 'admin-bg-admin-success-lighter admin-text-admin-success' : 'admin-bg-admin-error-lighter admin-text-admin-error'}`}>
            {isValid ? '✅ Активен' : '❌ Неактивен'}
          </div>
          <div className="admin-px-3 admin-py-1 admin-bg-admin-primary-lighter admin-text-admin-primary admin-rounded-full admin-text-xs admin-font-medium">
            🔒 Безопасный
          </div>
        </div>
      </header>

      <div className="admin-grid admin-grid-cols-1 lg:admin-grid-cols-3 admin-gap-8">
        {/* Основная конфигурация */}
        <div className="lg:admin-col-span-2">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                🔧 Конфигурация API
              </h3>
              <p className="admin-card-description">
                Настройка и управление OpenAI API ключом
              </p>
            </div>
            <div className="admin-card-content admin-space-y-8">
              {/* Поле для API ключа */}
              <div className="admin-space-y-4">
                <label htmlFor="api-key" className="admin-font-medium admin-text-gray-900">
                  API Ключ
                </label>
                <div className="admin-flex admin-gap-3">
                  <input
                    id="api-key"
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="admin-input admin-flex-1"
                    aria-describedby="api-key-help"
                  />
                  <button
                    onClick={handleTest}
                    disabled={!apiKey || isValidating}
                    className="admin-btn admin-btn-primary"
                    title="Протестировать формат API ключа"
                    aria-label="Проверить API ключ"
                  >
                    {isValidating ? (
                      <div className="admin-flex admin-items-center admin-gap-2">
                        <div className="admin-spinner" />
                        Тестирую...
                      </div>
                    ) : (
                      '🧪 Тест'
                    )}
                  </button>
                </div>
                <p id="api-key-help" className="admin-text-xs admin-text-gray-500">
                  Введите ваш OpenAI API ключ. Должен начинаться с "sk-" и содержать более 20 символов.
                </p>
              </div>

              {/* Настройки автообновления */}
              <div className="admin-flex admin-items-center admin-gap-4 admin-p-4 admin-bg-admin-gray-50 admin-rounded-lg admin-border admin-border-gray-200">
                <div className="admin-switch">
                  <input
                    id="auto-refresh"
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="admin-sr-only"
                  />
                  <div className="admin-switch-slider"></div>
                </div>
                <div>
                  <label htmlFor="auto-refresh" className="admin-font-medium admin-text-gray-900 admin-cursor-pointer">
                    Автообновление статистики
                  </label>
                  <p className="admin-text-sm admin-text-gray-600">
                    Автоматически обновлять данные использования
                  </p>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="admin-flex admin-gap-4 admin-mt-8">
                <button
                  onClick={handleSave}
                  disabled={!apiKey || !isValid || isLoading}
                  className="admin-btn admin-btn-success admin-font-medium"
                >
                  {isLoading ? (
                    <div className="admin-flex admin-items-center admin-gap-2">
                      <div className="admin-spinner" />
                      Сохраняю...
                    </div>
                  ) : (
                    <>
                      <span className="mr-2">💾</span>
                      Сохранить конфигурацию
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Индикатор статуса */}
        <div className="admin-space-y-6">
          <div className="admin-card">
            <div className="admin-card-content admin-p-6">
              <div className="admin-flex admin-items-center admin-justify-between admin-mb-4">
                <span className="admin-font-medium admin-text-gray-900">Статус API</span>
                <div className={`admin-w-3 admin-h-3 admin-rounded-full ${isValid ? 'admin-bg-admin-success' : 'admin-bg-admin-error'}`} aria-hidden="true"></div>
              </div>
              <div className="admin-text-center">
                <div className={`admin-text-lg admin-font-semibold admin-mb-2 ${isValid ? 'admin-text-admin-success' : 'admin-text-admin-error'}`}>
                  {isValid ? '✅ Ключ валиден' : '❌ Ключ невалиден'}
                </div>
                <p className="admin-text-sm admin-text-gray-600">
                  {isValid ? 'API готов к использованию' : 'Требуется валидный API ключ'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Статистика использования */}
      <QuickStats />

      {/* Разбивка по типам операций */}
      <UsageBreakdown />

      {/* График трендов */}
      <UsageChart />

      {/* Таблица пользователей */}
      <UserUsageTable />
    </div>
  );
};