"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { SimpleChart } from '../../../../shared/components/SimpleChart';
import '../../../../styles/admin/admin-theme.css';
import '../../../../styles/admin/admin-typography.css';
import '../../../../styles/admin/admin-cards.css';
import '../../../../styles/admin/admin-buttons.css';
import '../../../../styles/admin/admin-forms.css';
import '../../../../styles/admin/admin-tables.css';
import '../../../../styles/admin/admin-utilities.css';
import '../../../../styles/admin/admin-responsive.css';

const systemMetrics = [
  { time: '00:00', cpu: 45, memory: 67, disk: 23, network: 12 },
  { time: '04:00', cpu: 52, memory: 71, disk: 25, network: 15 },
  { time: '08:00', cpu: 78, memory: 84, disk: 28, network: 45 },
  { time: '12:00', cpu: 65, memory: 76, disk: 26, network: 32 },
  { time: '16:00', cpu: 58, memory: 69, disk: 24, network: 28 },
  { time: '20:00', cpu: 49, memory: 63, disk: 22, network: 18 },
];

export const SystemSettingsTab: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState({
    database: 'online',
    api: 'online',
    storage: 'online',
    cache: 'online'
  });

  const [metrics, setMetrics] = useState({
    cpu: 45,
    memory: 67,
    disk: 23,
    network: 12
  });

  const [isRestarting, setIsRestarting] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleRestartService = async (service: string) => {
    setIsRestarting(service);
    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      if (!token) {
        toast.error('Ошибка авторизации');
        return;
      }

      // ✅ Используем admin-api вместо make-server
      const response = await fetch(`https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/admin-api/system/restart/${service.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(`Сервис ${service} успешно перезапущен! 🔄`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || `Ошибка при перезапуске ${service}`);
      }
    } catch (error) {
      console.error(`Error restarting ${service}:`, error);
      toast.error(`Ошибка соединения при перезапуске ${service}`);
    } finally {
      setIsRestarting(null);
    }
  };

  const handleBackupDatabase = async () => {
    setIsBackingUp(true);
    try {
      const token = localStorage.getItem('sb-ecuwuzqlwdkkdncampnc-auth-token');
      if (!token) {
        toast.error('Ошибка авторизации');
        return;
      }

      const response = await fetch('https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/make-server-9729c493/admin/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Резервная копия базы данных успешно создана! 💾');
        
        // Обновление информации о последней копии
        if (data.backupUrl) {
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', data.backupUrl);
          linkElement.setAttribute('download', `unity-backup-${new Date().toISOString().split('T')[0]}.sql`);
          linkElement.click();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Ошибка при создании резервной копии');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Ошибка соединения при создании резервной копии');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = () => {
    toast.info('Функция восстановления из резервной копии в разработке 📂');
  };

  return (
    <div className="admin-space-y-8">
      {/* Заголовок раздела */}
      <header className="admin-flex admin-items-center admin-gap-4 admin-pb-4 admin-border-b admin-border-gray-200">
        <div className="admin-p-3 admin-bg-admin-primary-lighter admin-rounded-lg admin-text-2xl" aria-hidden="true">
          🖥️
        </div>
        <div>
          <h2 className="admin-text-2xl admin-font-semibold admin-text-gray-900">
            Системные настройки
          </h2>
          <p className="admin-text-sm admin-text-gray-600 admin-mt-1">
            Мониторинг и управление системными ресурсами в реальном времени
          </p>
        </div>
        <div className="admin-ml-auto admin-flex admin-gap-2">
          <div className="admin-px-3 admin-py-1 admin-bg-admin-success-lighter admin-text-admin-success admin-rounded-full admin-text-xs admin-font-medium admin-flex admin-items-center admin-gap-1">
            <div className="admin-w-2 admin-h-2 admin-bg-admin-success admin-rounded-full" aria-hidden="true"></div>
            Все системы работают
          </div>
          <div className="admin-px-3 admin-py-1 admin-bg-admin-primary-lighter admin-text-admin-primary admin-rounded-full admin-text-xs admin-font-medium">
            📊 Мониторинг активен
          </div>
        </div>
      </header>

      <div className="admin-grid admin-grid-cols-1 lg:admin-grid-cols-3 admin-gap-8">
        {/* Статус системы */}
        <div className="lg:admin-col-span-2 admin-space-y-6">
          {/* Статус сервисов */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                🔍 Статус системы
              </h3>
              <p className="admin-card-description">
                Мониторинг состояния всех сервисов
              </p>
            </div>
            <div className="admin-card-content">
              <div className="admin-grid admin-grid-cols-1 md:admin-grid-cols-2 admin-gap-6">
                <div className="admin-p-6 admin-bg-admin-success-lighter admin-rounded-lg admin-border admin-border-admin-success-light admin-relative admin-overflow-hidden">
                  <div className="admin-absolute admin-top-2 admin-right-2">
                    <div className="admin-w-3 admin-h-3 admin-bg-admin-success admin-rounded-full" aria-hidden="true"></div>
                  </div>
                  <div className="admin-text-center">
                    <div className="admin-text-3xl admin-font-semibold admin-text-admin-success admin-mb-2" aria-hidden="true">🗄️</div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">База данных</div>
                    <div className="admin-text-gray-600 admin-text-sm admin-mb-3">PostgreSQL</div>
                    <div className="admin-px-3 admin-py-1 admin-bg-admin-success admin-text-white admin-rounded admin-text-xs admin-font-medium">
                      ✅ Работает стабильно
                    </div>
                  </div>
                </div>

                <div className="admin-p-6 admin-bg-admin-primary-lighter admin-rounded-lg admin-border admin-border-admin-primary-light admin-relative admin-overflow-hidden">
                  <div className="admin-absolute admin-top-2 admin-right-2">
                    <div className="admin-w-3 admin-h-3 admin-bg-admin-primary admin-rounded-full" aria-hidden="true"></div>
                  </div>
                  <div className="admin-text-center">
                    <div className="admin-text-3xl admin-font-semibold admin-text-admin-primary admin-mb-2" aria-hidden="true">🚀</div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">API сервер</div>
                    <div className="admin-text-gray-600 admin-text-sm admin-mb-3">Edge Functions</div>
                    <div className="admin-px-3 admin-py-1 admin-bg-admin-primary admin-text-white admin-rounded admin-text-xs admin-font-medium">
                      ✅ Высокая производительность
                    </div>
                  </div>
                </div>

                <div className="admin-p-6 admin-bg-admin-secondary-lighter admin-rounded-lg admin-border admin-border-admin-secondary-light admin-relative admin-overflow-hidden">
                  <div className="admin-absolute admin-top-2 admin-right-2">
                    <div className="admin-w-3 admin-h-3 admin-bg-admin-secondary admin-rounded-full" aria-hidden="true"></div>
                  </div>
                  <div className="admin-text-center">
                    <div className="admin-text-3xl admin-font-semibold admin-text-admin-secondary admin-mb-2" aria-hidden="true">💾</div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">Хранилище</div>
                    <div className="admin-text-gray-600 admin-text-sm admin-mb-3">Supabase Storage</div>
                    <div className="admin-px-3 admin-py-1 admin-bg-admin-secondary admin-text-white admin-rounded admin-text-xs admin-font-medium">
                      ✅ Доступно и стабильно
                    </div>
                  </div>
                </div>

                <div className="admin-p-6 admin-bg-admin-warning-lighter admin-rounded-lg admin-border admin-border-admin-warning-light admin-relative admin-overflow-hidden">
                  <div className="admin-absolute admin-top-2 admin-right-2">
                    <div className="admin-w-3 admin-h-3 admin-bg-admin-warning admin-rounded-full" aria-hidden="true"></div>
                  </div>
                  <div className="admin-text-center">
                    <div className="admin-text-3xl admin-font-semibold admin-text-admin-warning admin-mb-2" aria-hidden="true">⚡</div>
                    <div className="admin-font-medium admin-text-gray-900 admin-mb-1">Кэш</div>
                    <div className="admin-text-gray-600 admin-text-sm admin-mb-3">Redis</div>
                    <div className="admin-px-3 admin-py-1 admin-bg-admin-warning admin-text-white admin-rounded admin-text-xs admin-font-medium">
                      ✅ Быстрый отклик
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Метрики ресурсов */}
        <div className="admin-space-y-6">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
                📊 Ресурсы системы
              </h3>
              <p className="admin-card-description">
                Использование в реальном времени
              </p>
            </div>
            <div className="admin-card-content admin-space-y-6">
              <div className="admin-space-y-4">
                <div className="admin-space-y-2">
                  <div className="admin-flex admin-justify-between">
                    <span className="admin-text-gray-700">CPU</span>
                    <span className="admin-font-medium admin-text-gray-900">{metrics.cpu}%</span>
                  </div>
                  <div className="admin-w-full admin-bg-gray-200 admin-rounded-full admin-h-2">
                    <div
                      className="admin-bg-admin-warning admin-h-2 admin-rounded-full admin-transition-all"
                      style={{ width: `${metrics.cpu}%` }}
                      aria-label={`Использование CPU: ${metrics.cpu}%`}
                    ></div>
                  </div>
                </div>

                <div className="admin-space-y-2">
                  <div className="admin-flex admin-justify-between">
                    <span className="admin-text-gray-700">Память</span>
                    <span className="admin-font-medium admin-text-gray-900">{metrics.memory}%</span>
                  </div>
                  <div className="admin-w-full admin-bg-gray-200 admin-rounded-full admin-h-2">
                    <div
                      className="admin-bg-admin-error admin-h-2 admin-rounded-full admin-transition-all"
                      style={{ width: `${metrics.memory}%` }}
                      aria-label={`Использование памяти: ${metrics.memory}%`}
                    ></div>
                  </div>
                </div>

                <div className="admin-space-y-2">
                  <div className="admin-flex admin-justify-between">
                    <span className="admin-text-gray-700">Диск</span>
                    <span className="admin-font-medium admin-text-gray-900">{metrics.disk}%</span>
                  </div>
                  <div className="admin-w-full admin-bg-gray-200 admin-rounded-full admin-h-2">
                    <div
                      className="admin-bg-admin-primary admin-h-2 admin-rounded-full admin-transition-all"
                      style={{ width: `${metrics.disk}%` }}
                      aria-label={`Использование диска: ${metrics.disk}%`}
                    ></div>
                  </div>
                </div>

                <div className="admin-space-y-2">
                  <div className="admin-flex admin-justify-between">
                    <span className="admin-text-gray-700">Сеть</span>
                    <span className="admin-font-medium admin-text-gray-900">{metrics.network}%</span>
                  </div>
                  <div className="admin-w-full admin-bg-gray-200 admin-rounded-full admin-h-2">
                    <div
                      className="admin-bg-admin-success admin-h-2 admin-rounded-full admin-transition-all"
                      style={{ width: `${metrics.network}%` }}
                      aria-label={`Использование сети: ${metrics.network}%`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Графики метрик */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
            📈 Мониторинг ресурсов (24ч)
          </h3>
          <p className="admin-card-description">
            Графики использования системных ресурсов
          </p>
        </div>
        <div className="admin-card-content">
          <SimpleChart
            data={systemMetrics}
            xAxisKey="time"
            title="Использование системных ресурсов"
            type="line"
          />
        </div>
      </div>

      {/* Управление сервисами */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
            🔧 Управление сервисами
          </h3>
          <p className="admin-card-description">
            Перезапуск и обслуживание системных компонентов
          </p>
        </div>
        <div className="admin-card-content">
          <div className="admin-grid admin-grid-cols-1 md:admin-grid-cols-2 lg:admin-grid-cols-4 admin-gap-4">
            <button
              onClick={() => handleRestartService('API')}
              disabled={isRestarting === 'API'}
              className="admin-btn admin-btn-primary admin-font-medium"
            >
              {isRestarting === 'API' ? (
                <div className="admin-flex admin-items-center admin-gap-2">
                  <div className="admin-spinner" />
                  Перезапуск...
                </div>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  API сервер
                </>
              )}
            </button>

            <button
              onClick={() => handleRestartService('Database')}
              disabled={isRestarting === 'Database'}
              className="admin-btn admin-btn-success admin-font-medium"
            >
              {isRestarting === 'Database' ? (
                <div className="admin-flex admin-items-center admin-gap-2">
                  <div className="admin-spinner" />
                  Перезапуск...
                </div>
              ) : (
                <>
                  <span className="mr-2">🗄️</span>
                  База данных
                </>
              )}
            </button>

            <button
              onClick={() => handleRestartService('Cache')}
              disabled={isRestarting === 'Cache'}
              className="admin-btn admin-btn-warning admin-font-medium"
            >
              {isRestarting === 'Cache' ? (
                <div className="admin-flex admin-items-center admin-gap-2">
                  <div className="admin-spinner" />
                  Очистка...
                </div>
              ) : (
                <>
                  <span className="mr-2">⚡</span>
                  Очистить кэш
                </>
              )}
            </button>

            <button
              onClick={() => handleRestartService('Storage')}
              disabled={isRestarting === 'Storage'}
              className="admin-btn admin-btn-outline admin-font-medium"
            >
              {isRestarting === 'Storage' ? (
                <div className="admin-flex admin-items-center admin-gap-2">
                  <div className="admin-spinner" />
                  Перезапуск...
                </div>
              ) : (
                <>
                  <span className="mr-2">💾</span>
                  Хранилище
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Резервное копирование */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
            💾 Резервное копирование
          </h3>
          <p className="admin-card-description">
            Управление резервными копиями данных
          </p>
        </div>
        <div className="admin-card-content">
          <div className="admin-space-y-6">
            <div className="admin-flex admin-gap-4">
              <button
                onClick={handleBackupDatabase}
                disabled={isBackingUp}
                className="admin-btn admin-btn-success admin-font-medium"
              >
                {isBackingUp ? (
                  <div className="admin-flex admin-items-center admin-gap-2">
                    <div className="admin-spinner" />
                    Создаю копию...
                  </div>
                ) : (
                  <>
                    <span className="mr-2">💾</span>
                    Создать резервную копию
                  </>
                )}
              </button>

              <button
                onClick={handleRestoreBackup}
                className="admin-btn admin-btn-outline admin-font-medium"
              >
                <span className="mr-2">📂</span>
                Восстановить из копии
              </button>
            </div>

            <div className="admin-p-4 admin-bg-gray-50 admin-rounded-lg admin-border admin-border-gray-200">
              <div className="admin-grid admin-grid-cols-1 md:admin-grid-cols-3 admin-gap-4 admin-text-center">
                <div>
                  <div className="admin-font-medium admin-text-gray-900 admin-mb-1">Последняя копия</div>
                  <div className="admin-text-gray-600 admin-text-sm">2 часа назад</div>
                </div>
                <div>
                  <div className="admin-font-medium admin-text-gray-900 admin-mb-1">Размер</div>
                  <div className="admin-text-gray-600 admin-text-sm">45.2 MB</div>
                </div>
                <div>
                  <div className="admin-font-medium admin-text-gray-900 admin-mb-1">Статус</div>
                  <div className="admin-px-3 admin-py-1 admin-bg-admin-success-lighter admin-text-admin-success admin-rounded admin-text-xs admin-font-medium admin-inline-block">
                    ✅ Успешно
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Системные логи */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title admin-flex admin-items-center admin-gap-2">
            📝 Системные логи
          </h3>
          <p className="admin-card-description">
            Последние записи в логах системы
          </p>
        </div>
        <div className="admin-card-content">
          <div className="admin-bg-gray-900 admin-text-green-400 admin-p-6 admin-rounded-lg admin-font-mono admin-text-sm admin-max-h-64 admin-overflow-y-auto admin-border admin-border-gray-700">
            <div className="admin-space-y-1">
              <div className="admin-text-green-300">[2024-01-15 10:30:15] INFO: API request processed successfully</div>
              <div className="admin-text-green-300">[2024-01-15 10:30:12] INFO: User authentication successful</div>
              <div className="admin-text-blue-300">[2024-01-15 10:30:08] INFO: Database connection established</div>
              <div className="admin-text-green-300">[2024-01-15 10:30:05] INFO: Cache cleared successfully</div>
              <div className="admin-text-green-300">[2024-01-15 10:30:02] INFO: System startup completed</div>
              <div className="admin-text-yellow-300">[2024-01-15 10:29:58] WARN: High memory usage detected</div>
              <div className="admin-text-green-300">[2024-01-15 10:29:55] INFO: Scheduled backup completed</div>
              <div className="admin-text-green-300">[2024-01-15 10:29:50] INFO: API rate limit reset</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};