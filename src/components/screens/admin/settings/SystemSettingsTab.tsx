import { useState } from "react";
import { Database, Zap, Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { Progress } from "../../../ui/progress";

export function SystemSettingsTab() {
  const [systemStats, setSystemStats] = useState({
    databaseSize: 2.4, // GB
    storageUsed: 15.7, // GB
    storageTotal: 100, // GB
    apiCallsToday: 8456,
    apiLimit: 50000,
    uptime: "99.98%",
    lastBackup: "2024-03-10 03:00",
  });

  const handleClearCache = () => {
    if (confirm('Очистить весь кэш приложения?')) {
      alert('Кэш очищен');
    }
  };

  const handleBackupNow = () => {
    if (confirm('Создать резервную копию базы данных?')) {
      alert('Резервное копирование запущено');
    }
  };

  const handleRestartServer = () => {
    if (confirm('Перезапустить сервер? Приложение будет недоступно 1-2 минуты.')) {
      alert('Сервер перезапускается...');
    }
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="!text-[18px] !font-semibold">Статус системы</CardTitle>
          <CardDescription>Текущее состояние сервисов и ресурсов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="!text-[14px] !font-semibold text-foreground">API Сервер</p>
                <p className="!text-[12px] text-muted-foreground">Supabase Edge Functions</p>
              </div>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                ● Online
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="!text-[14px] !font-semibold text-foreground">База данных</p>
                <p className="!text-[12px] text-muted-foreground">PostgreSQL 15</p>
              </div>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                ● Online
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="!text-[14px] !font-semibold text-foreground">OpenAI API</p>
                <p className="!text-[12px] text-muted-foreground">GPT-4</p>
              </div>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                ● Online
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="!text-[14px] !font-semibold text-foreground">Storage</p>
                <p className="!text-[12px] text-muted-foreground">Supabase Storage</p>
              </div>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                ● Online
              </Badge>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="!text-[14px] text-foreground">Uptime (30 дней)</span>
              <span className="!text-[16px] !font-semibold text-foreground">{systemStats.uptime}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="!text-[18px] !font-semibold flex items-center gap-2">
            <Database className="w-5 h-5" />
            Использование ресурсов
          </CardTitle>
          <CardDescription>Мониторинг хранилища и API лимитов</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="!text-[14px] text-foreground">Размер базы данных</span>
              <span className="!text-[14px] !font-semibold">{systemStats.databaseSize} GB</span>
            </div>
            <Progress value={(systemStats.databaseSize / 10) * 100} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="!text-[14px] text-foreground">Использование Storage</span>
              <span className="!text-[14px] !font-semibold">
                {systemStats.storageUsed} / {systemStats.storageTotal} GB
              </span>
            </div>
            <Progress value={(systemStats.storageUsed / systemStats.storageTotal) * 100} className="h-2" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="!text-[14px] text-foreground">API запросы (сегодня)</span>
              <span className="!text-[14px] !font-semibold">
                {systemStats.apiCallsToday.toLocaleString()} / {systemStats.apiLimit.toLocaleString()}
              </span>
            </div>
            <Progress value={(systemStats.apiCallsToday / systemStats.apiLimit) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="!text-[18px] !font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Резервное копирование
          </CardTitle>
          <CardDescription>Управление бэкапами базы данных</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="!text-[14px] !font-semibold text-foreground">Последний бэкап</p>
              <p className="!text-[12px] text-muted-foreground">{systemStats.lastBackup}</p>
            </div>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Успешно
            </Badge>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleBackupNow} variant="outline" className="flex-1">
              <Database className="w-4 h-4 mr-2" />
              Создать бэкап сейчас
            </Button>
            <Button variant="outline">
              Настроить расписание
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="!text-[18px] !font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Системные действия
          </CardTitle>
          <CardDescription>Управление работой сервера</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
              <div className="flex-1">
                <p className="!text-[14px] !font-semibold text-foreground">Осторожно!</p>
                <p className="!text-[13px] text-muted-foreground !font-normal mt-1">
                  Эти действия могут временно нарушить работу приложения. Используйте с осторожностью.
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleClearCache} variant="outline" className="w-full justify-start">
            <RefreshCw className="w-4 h-4 mr-2" />
            Очистить кэш приложения
          </Button>

          <Button onClick={handleRestartServer} variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
            <Zap className="w-4 h-4 mr-2" />
            Перезапустить сервер
          </Button>
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="!text-[18px] !font-semibold">Информация о окружении</CardTitle>
          <CardDescription>Версии и конфигурация</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground !text-[12px]">Node.js версия</p>
              <p className="!text-[14px] !font-semibold">v20.10.0</p>
            </div>
            <div>
              <p className="text-muted-foreground !text-[12px]">React версия</p>
              <p className="!text-[14px] !font-semibold">v18.3.1</p>
            </div>
            <div>
              <p className="text-muted-foreground !text-[12px]">Supabase</p>
              <p className="!text-[14px] !font-semibold">v2.39.0</p>
            </div>
            <div>
              <p className="text-muted-foreground !text-[12px]">OpenAI API</p>
              <p className="!text-[14px] !font-semibold">v4.0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
