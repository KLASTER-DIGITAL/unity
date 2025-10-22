"use client";

import React, { useState } from 'react';
import { toast } from 'sonner';
import { SimpleChart } from '../../../../shared/components/SimpleChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Monitor, Database, Server, HardDrive, Wifi, RotateCw, Save, Activity, AlertCircle } from 'lucide-react';

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
    <div className="space-y-8">
      {/* Заголовок раздела */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Monitor className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Системные настройки</h2>
            <p className="text-sm text-muted-foreground">
              Мониторинг и управление системными ресурсами в реальном времени
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="success" className="gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Все системы работают
          </Badge>
          <Badge variant="outline">
            <Activity className="w-3 h-3 mr-1" />
            Мониторинг активен
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Статус системы */}
        <div className="lg:col-span-2 space-y-6">
          {/* Статус сервисов */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Статус системы
              </CardTitle>
              <CardDescription>
                Мониторинг состояния всех сервисов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                  <div className="text-center">
                    <Database className="w-12 h-12 text-green-600 dark:text-green-500 mx-auto mb-2" />
                    <div className="font-medium mb-1">База данных</div>
                    <div className="text-muted-foreground text-sm mb-3">PostgreSQL</div>
                    <Badge variant="success">Работает стабильно</Badge>
                  </div>
                </div>

                <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  </div>
                  <div className="text-center">
                    <Server className="w-12 h-12 text-blue-600 dark:text-blue-500 mx-auto mb-2" />
                    <div className="font-medium mb-1">API сервер</div>
                    <div className="text-muted-foreground text-sm mb-3">Edge Functions</div>
                    <Badge className="bg-blue-600 text-white">Высокая производительность</Badge>
                  </div>
                </div>

                <div className="p-6 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  </div>
                  <div className="text-center">
                    <HardDrive className="w-12 h-12 text-purple-600 dark:text-purple-500 mx-auto mb-2" />
                    <div className="font-medium mb-1">Хранилище</div>
                    <div className="text-muted-foreground text-sm mb-3">Supabase Storage</div>
                    <Badge className="bg-purple-600 text-white">Доступно и стабильно</Badge>
                  </div>
                </div>

                <div className="p-6 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  </div>
                  <div className="text-center">
                    <Wifi className="w-12 h-12 text-yellow-600 dark:text-yellow-500 mx-auto mb-2" />
                    <div className="font-medium mb-1">Кэш</div>
                    <div className="text-muted-foreground text-sm mb-3">Redis</div>
                    <Badge className="bg-yellow-600 text-white">Быстрый отклик</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Метрики ресурсов */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Ресурсы системы
              </CardTitle>
              <CardDescription>
                Использование в реальном времени
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CPU</span>
                    <span className="font-medium">{metrics.cpu}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${metrics.cpu}%` }}
                      aria-label={`Использование CPU: ${metrics.cpu}%`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Память</span>
                    <span className="font-medium">{metrics.memory}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all"
                      style={{ width: `${metrics.memory}%` }}
                      aria-label={`Использование памяти: ${metrics.memory}%`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Диск</span>
                    <span className="font-medium">{metrics.disk}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${metrics.disk}%` }}
                      aria-label={`Использование диска: ${metrics.disk}%`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Сеть</span>
                    <span className="font-medium">{metrics.network}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${metrics.network}%` }}
                      aria-label={`Использование сети: ${metrics.network}%`}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Графики метрик */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Мониторинг ресурсов (24ч)
          </CardTitle>
          <CardDescription>
            Графики использования системных ресурсов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleChart
            data={systemMetrics}
            xAxisKey="time"
            title="Использование системных ресурсов"
            type="line"
          />
        </CardContent>
      </Card>

      {/* Управление сервисами */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Управление сервисами
          </CardTitle>
          <CardDescription>
            Перезапуск и обслуживание системных компонентов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => handleRestartService('API')}
              disabled={isRestarting === 'API'}
              variant="default"
            >
              {isRestarting === 'API' ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Перезапуск...
                </>
              ) : (
                <>
                  <Server className="w-4 h-4 mr-2" />
                  API сервер
                </>
              )}
            </Button>

            <Button
              onClick={() => handleRestartService('Database')}
              disabled={isRestarting === 'Database'}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isRestarting === 'Database' ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Перезапуск...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  База данных
                </>
              )}
            </Button>

            <Button
              onClick={() => handleRestartService('Cache')}
              disabled={isRestarting === 'Cache'}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isRestarting === 'Cache' ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Очистка...
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 mr-2" />
                  Очистить кэш
                </>
              )}
            </Button>

            <Button
              onClick={() => handleRestartService('Storage')}
              disabled={isRestarting === 'Storage'}
              variant="outline"
            >
              {isRestarting === 'Storage' ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Перезапуск...
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4 mr-2" />
                  Хранилище
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Резервное копирование */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Резервное копирование
          </CardTitle>
          <CardDescription>
            Управление резервными копиями данных
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-3">
              <Button
                onClick={handleBackupDatabase}
                disabled={isBackingUp}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isBackingUp ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Создаю копию...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Создать резервную копию
                  </>
                )}
              </Button>

              <Button
                onClick={handleRestoreBackup}
                variant="outline"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Восстановить из копии
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-medium mb-1">Последняя копия</div>
                  <div className="text-sm text-muted-foreground">2 часа назад</div>
                </div>
                <div>
                  <div className="font-medium mb-1">Размер</div>
                  <div className="text-sm text-muted-foreground">45.2 MB</div>
                </div>
                <div>
                  <div className="font-medium mb-1">Статус</div>
                  <Badge variant="success">Успешно</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Системные логи */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Системные логи
          </CardTitle>
          <CardDescription>
            Последние записи в логах системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-950 text-green-400 p-6 rounded-lg font-mono text-sm max-h-64 overflow-y-auto border border-slate-800">
            <div className="space-y-1">
              <div className="text-green-300">[2024-01-15 10:30:15] INFO: API request processed successfully</div>
              <div className="text-green-300">[2024-01-15 10:30:12] INFO: User authentication successful</div>
              <div className="text-blue-300">[2024-01-15 10:30:08] INFO: Database connection established</div>
              <div className="text-green-300">[2024-01-15 10:30:05] INFO: Cache cleared successfully</div>
              <div className="text-green-300">[2024-01-15 10:30:02] INFO: System startup completed</div>
              <div className="text-yellow-300">[2024-01-15 10:29:58] WARN: High memory usage detected</div>
              <div className="text-green-300">[2024-01-15 10:29:55] INFO: Scheduled backup completed</div>
              <div className="text-green-300">[2024-01-15 10:29:50] INFO: API rate limit reset</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};