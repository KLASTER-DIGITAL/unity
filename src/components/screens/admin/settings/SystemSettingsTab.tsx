"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Monitor, Database, Server, HardDrive, Wifi, RotateCw, Activity, AlertCircle, Info } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface SystemStatus {
  database: 'online' | 'offline' | 'checking';
  api: 'online' | 'offline' | 'checking';
  storage: 'online' | 'offline' | 'checking';
}

export const SystemSettingsTab: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'checking',
    api: 'checking',
    storage: 'checking'
  });

  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const supabase = createClient();

      // Check database status by trying to query
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      // Check API status by checking session
      const { data: { session }, error: apiError } = await supabase.auth.getSession();

      // Check storage status by trying to list buckets
      const { error: storageError } = await supabase.storage.listBuckets();

      setSystemStatus({
        database: dbError ? 'offline' : 'online',
        api: apiError || !session ? 'offline' : 'online',
        storage: storageError ? 'offline' : 'online'
      });

      toast.success('Статус системы обновлен');
    } catch (error: any) {
      console.error('Error checking system status:', error);
      toast.error(`Ошибка проверки статуса: ${error.message}`);
      setSystemStatus({
        database: 'offline',
        api: 'offline',
        storage: 'offline'
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleRefreshStatus = () => {
    checkSystemStatus();
  };

  const handleBackupDatabase = async () => {
    try {
      const supabase = createClient();

      // Get database stats for backup info
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: entriesCount } = await supabase
        .from('entries')
        .select('*', { count: 'exact', head: true });

      toast.info(`База данных содержит ${usersCount} пользователей и ${entriesCount} записей. Резервное копирование доступно через Supabase Dashboard.`, {
        duration: 5000
      });
    } catch (error: any) {
      console.error('Error getting backup info:', error);
      toast.error(`Ошибка: ${error.message}`);
    }
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
              Мониторинг и управление системными ресурсами
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefreshStatus}
          disabled={isCheckingStatus}
          variant="outline"
          size="sm"
        >
          <RotateCw className={`w-4 h-4 mr-2 ${isCheckingStatus ? 'animate-spin' : ''}`} />
          Обновить статус
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Информация о системных метриках</AlertTitle>
        <AlertDescription>
          Детальные метрики производительности (CPU, Memory, Disk) доступны через Supabase Dashboard.
          Здесь отображается статус основных сервисов и информация о базе данных.
        </AlertDescription>
      </Alert>

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
                Мониторинг состояния основных сервисов
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-6 rounded-lg border relative overflow-hidden ${
                  systemStatus.database === 'online'
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                    : systemStatus.database === 'checking'
                    ? 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="absolute top-2 right-2">
                    <div className={`w-3 h-3 rounded-full ${
                      systemStatus.database === 'online' ? 'bg-green-500' :
                      systemStatus.database === 'checking' ? 'bg-gray-500 animate-pulse' :
                      'bg-red-500'
                    }`} />
                  </div>
                  <div className="text-center">
                    <Database className={`w-12 h-12 mx-auto mb-2 ${
                      systemStatus.database === 'online' ? 'text-green-600 dark:text-green-500' :
                      systemStatus.database === 'checking' ? 'text-gray-600 dark:text-gray-500' :
                      'text-red-600 dark:text-red-500'
                    }`} />
                    <div className="font-medium mb-1">База данных</div>
                    <div className="text-muted-foreground text-sm mb-3">PostgreSQL</div>
                    <Badge variant={systemStatus.database === 'online' ? 'success' : systemStatus.database === 'checking' ? 'outline' : 'destructive'}>
                      {systemStatus.database === 'online' ? 'Работает' : systemStatus.database === 'checking' ? 'Проверка...' : 'Недоступна'}
                    </Badge>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border relative overflow-hidden ${
                  systemStatus.api === 'online'
                    ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                    : systemStatus.api === 'checking'
                    ? 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="absolute top-2 right-2">
                    <div className={`w-3 h-3 rounded-full ${
                      systemStatus.api === 'online' ? 'bg-blue-500' :
                      systemStatus.api === 'checking' ? 'bg-gray-500 animate-pulse' :
                      'bg-red-500'
                    }`} />
                  </div>
                  <div className="text-center">
                    <Server className={`w-12 h-12 mx-auto mb-2 ${
                      systemStatus.api === 'online' ? 'text-blue-600 dark:text-blue-500' :
                      systemStatus.api === 'checking' ? 'text-gray-600 dark:text-gray-500' :
                      'text-red-600 dark:text-red-500'
                    }`} />
                    <div className="font-medium mb-1">API</div>
                    <div className="text-muted-foreground text-sm mb-3">Edge Functions</div>
                    <Badge variant={systemStatus.api === 'online' ? 'default' : systemStatus.api === 'checking' ? 'outline' : 'destructive'}>
                      {systemStatus.api === 'online' ? 'Работает' : systemStatus.api === 'checking' ? 'Проверка...' : 'Недоступен'}
                    </Badge>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border relative overflow-hidden ${
                  systemStatus.storage === 'online'
                    ? 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800'
                    : systemStatus.storage === 'checking'
                    ? 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="absolute top-2 right-2">
                    <div className={`w-3 h-3 rounded-full ${
                      systemStatus.storage === 'online' ? 'bg-purple-500' :
                      systemStatus.storage === 'checking' ? 'bg-gray-500 animate-pulse' :
                      'bg-red-500'
                    }`} />
                  </div>
                  <div className="text-center">
                    <HardDrive className={`w-12 h-12 mx-auto mb-2 ${
                      systemStatus.storage === 'online' ? 'text-purple-600 dark:text-purple-500' :
                      systemStatus.storage === 'checking' ? 'text-gray-600 dark:text-gray-500' :
                      'text-red-600 dark:text-red-500'
                    }`} />
                    <div className="font-medium mb-1">Хранилище</div>
                    <div className="text-muted-foreground text-sm mb-3">Supabase Storage</div>
                    <Badge variant={systemStatus.storage === 'online' ? 'default' : systemStatus.storage === 'checking' ? 'outline' : 'destructive'}>
                      {systemStatus.storage === 'online' ? 'Работает' : systemStatus.storage === 'checking' ? 'Проверка...' : 'Недоступно'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Управление базой данных */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Управление базой данных
              </CardTitle>
              <CardDescription>
                Резервное копирование и восстановление
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleBackupDatabase}
                variant="default"
                className="w-full"
              >
                <Database className="w-4 h-4 mr-2" />
                Информация о резервном копировании
              </Button>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Резервное копирование</AlertTitle>
                <AlertDescription className="text-sm">
                  Автоматическое резервное копирование настроено через Supabase.
                  Для ручного создания резервной копии используйте Supabase Dashboard.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Дополнительная информация */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Дополнительная информация
          </CardTitle>
          <CardDescription>
            Полезные ссылки и ресурсы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium mb-2">Supabase Dashboard</div>
              <p className="text-sm text-muted-foreground mb-3">
                Для доступа к детальным метрикам производительности, логам и настройкам используйте Supabase Dashboard.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc', '_blank')}
              >
                Открыть Dashboard
              </Button>
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium mb-2">Документация</div>
              <p className="text-sm text-muted-foreground mb-3">
                Подробная документация по управлению проектом и настройке системы.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://supabase.com/docs', '_blank')}
              >
                Открыть документацию
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Управление сервисами - УДАЛЕНО */}
      {/* Перезапуск сервисов недоступен через API */}
      <Card className="hidden">
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
              onClick={() => {}}
              disabled={true}
              variant="default"
            >
              Disabled
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Старая секция резервного копирования - УДАЛЕНО */}
      <Card className="hidden">
        <CardHeader>
          <CardTitle>Резервное копирование</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="font-medium mb-1">Последняя копия</div>
                  <div className="text-sm text-muted-foreground">Недоступно</div>
                </div>
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};