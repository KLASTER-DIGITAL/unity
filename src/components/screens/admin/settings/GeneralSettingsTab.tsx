'use client';

import { Loader2, RotateCcw, Save, Settings } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { createClient } from '@/utils/supabase/client';

export const GeneralSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState({
    appName: '',
    appDescription: '',
    supportEmail: '',
    maxEntriesPerDay: 10,
    enableAnalytics: true,
    enableErrorReporting: true,
    maintenanceMode: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('admin_settings')
        .select('key, value')
        .in('key', [
          'app_name',
          'app_description',
          'support_email',
          'max_entries_per_day',
          'enable_analytics',
          'enable_error_reporting',
          'maintenance_mode',
        ]);

      if (error) throw error;

      const settingsMap =
        data?.reduce(
          (acc, item) => {
            acc[item.key] = item.value;
            return acc;
          },
          {} as Record<string, string>
        ) || {};

      setSettings({
        appName: settingsMap.app_name || '',
        appDescription: settingsMap.app_description || '',
        supportEmail: settingsMap.support_email || '',
        maxEntriesPerDay: Number.parseInt(settingsMap.max_entries_per_day || '10'),
        enableAnalytics: settingsMap.enable_analytics === 'true',
        enableErrorReporting: settingsMap.enable_error_reporting === 'true',
        maintenanceMode: settingsMap.maintenance_mode === 'true',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Ошибка загрузки настроек');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const supabase = createClient();

      const updates = [
        { key: 'app_name', value: settings.appName },
        { key: 'app_description', value: settings.appDescription },
        { key: 'support_email', value: settings.supportEmail },
        { key: 'max_entries_per_day', value: settings.maxEntriesPerDay.toString() },
        { key: 'enable_analytics', value: settings.enableAnalytics.toString() },
        { key: 'enable_error_reporting', value: settings.enableErrorReporting.toString() },
        { key: 'maintenance_mode', value: settings.maintenanceMode.toString() },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('admin_settings')
          .update({ value: update.value, updated_at: new Date().toISOString() })
          .eq('key', update.key);

        if (error) throw error;
      }

      toast.success('Настройки успешно сохранены! ✅');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Ошибка сохранения настроек');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await loadSettings();
      toast.success('Настройки перезагружены! 🔄');
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Ошибка при перезагрузке настроек');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-bold text-2xl">
            <Settings className="h-6 w-6" />
            Общие настройки
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">Основные параметры приложения</p>
        </div>
        <div className="flex gap-2">
          <Button disabled={isResetting || isSaving} onClick={handleReset} variant="outline">
            {isResetting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Перезагрузка...
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Перезагрузить
              </>
            )}
          </Button>
          <Button disabled={isSaving || isResetting} onClick={handleSave}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохраняю...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Сохранить
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Настройки приложения</CardTitle>
          <CardDescription>Основная информация о приложении</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName">Название приложения</Label>
            <Input
              id="appName"
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              placeholder="UNITY Diary"
              value={settings.appName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="appDescription">Описание приложения</Label>
            <Textarea
              id="appDescription"
              onChange={(e) => setSettings({ ...settings, appDescription: e.target.value })}
              placeholder="Персональный дневник достижений"
              rows={3}
              value={settings.appDescription}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportEmail">Email поддержки</Label>
            <Input
              id="supportEmail"
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              placeholder="support@example.com"
              type="email"
              value={settings.supportEmail}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxEntriesPerDay">Максимум записей в день</Label>
            <Input
              id="maxEntriesPerDay"
              max="100"
              min="1"
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maxEntriesPerDay: Number.parseInt(e.target.value) || 10,
                })
              }
              type="number"
              value={settings.maxEntriesPerDay}
            />
            <p className="text-muted-foreground text-xs">
              Ограничение количества записей, которые пользователь может создать за день
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Функции</CardTitle>
          <CardDescription>Включение/отключение функций приложения</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enableAnalytics">Аналитика</Label>
              <p className="text-muted-foreground text-sm">
                Сбор анонимной статистики использования
              </p>
            </div>
            <Switch
              checked={settings.enableAnalytics}
              id="enableAnalytics"
              onCheckedChange={(checked) => setSettings({ ...settings, enableAnalytics: checked })}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <div className="space-y-0.5">
              <Label htmlFor="enableErrorReporting">Отчеты об ошибках</Label>
              <p className="text-muted-foreground text-sm">
                Автоматическая отправка отчетов об ошибках
              </p>
            </div>
            <Switch
              checked={settings.enableErrorReporting}
              id="enableErrorReporting"
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableErrorReporting: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted p-4">
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                <Label htmlFor="maintenanceMode">Режим обслуживания</Label>
                {settings.maintenanceMode && <Badge variant="destructive">Активен</Badge>}
              </div>
              <p className="text-muted-foreground text-sm">
                Временно отключить доступ к приложению для обслуживания
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              id="maintenanceMode"
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
