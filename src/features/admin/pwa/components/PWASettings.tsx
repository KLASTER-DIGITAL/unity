import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import {
  Settings,
  Bell,
  Wifi,
  Download,
  Save,
  Loader2,
  Smartphone
} from 'lucide-react';

interface PWASettings {
  enableNotifications: boolean;
  enableOfflineMode: boolean;
  enableInstallPrompt: boolean;
  installPromptTiming: 'immediate' | 'after_visits' | 'after_time' | 'manual';
  installPromptVisitsCount: number;
  installPromptDelayMinutes: number;
  installPromptLocation: 'onboarding' | 'user_cabinet' | 'both' | 'anywhere';
  installPromptTitle: string;
  installPromptDescription: string;
  installPromptButtonText: string;
  installPromptSkipText: string;
}

interface PWAManifest {
  appName: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
}

export function PWASettings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<PWASettings>({
    enableNotifications: true,
    enableOfflineMode: true,
    enableInstallPrompt: true,
    installPromptTiming: 'after_visits',
    installPromptVisitsCount: 3,
    installPromptDelayMinutes: 5,
    installPromptLocation: 'anywhere',
    installPromptTitle: 'pwa.install.title',
    installPromptDescription: 'pwa.install.description',
    installPromptButtonText: 'pwa.install.button',
    installPromptSkipText: 'pwa.install.skip',
  });

  const [manifest, setManifest] = useState<PWAManifest>({
    appName: 'Дневник Достижений',
    shortName: 'Дневник',
    description: 'Персональный дневник для отслеживания достижений',
    themeColor: '#3b82f6',
    backgroundColor: '#ffffff'
  });

  const supabase = createClient();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Ошибка авторизации');
        return;
      }

      // Load PWA settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'pwa_settings');

      if (settingsError) throw settingsError;

      if (settingsData && settingsData.length > 0 && settingsData[0]?.value) {
        setSettings(JSON.parse(settingsData[0].value as string));
      }

      // Load PWA manifest
      const { data: manifestData, error: manifestError } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'pwa_manifest');

      if (manifestError) throw manifestError;

      if (manifestData && manifestData.length > 0 && manifestData[0]?.value) {
        setManifest(JSON.parse(manifestData[0].value as string));
      }
    } catch (error) {
      console.error('Error loading PWA settings:', error);
      toast.error('Ошибка загрузки настроек');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('[PWASettings] Saving settings:', settings);
    console.log('[PWASettings] Saving manifest:', manifest);
    setIsSaving(true);
    try {
      // Save PWA settings
      const settingsPayload = {
        key: 'pwa_settings',
        value: JSON.stringify(settings),
        category: 'pwa',
        updated_at: new Date().toISOString()
      };
      console.log('[PWASettings] Settings upsert payload:', settingsPayload);

      const { data: settingsData, error: settingsError } = await supabase
        .from('admin_settings')
        .upsert(settingsPayload, {
          onConflict: 'key'
        })
        .select();

      console.log('[PWASettings] Settings upsert result:', { data: settingsData, error: settingsError });

      if (settingsError) throw settingsError;

      // Save PWA manifest
      const manifestPayload = {
        key: 'pwa_manifest',
        value: JSON.stringify(manifest),
        category: 'pwa',
        updated_at: new Date().toISOString()
      };
      console.log('[PWASettings] Manifest upsert payload:', manifestPayload);

      const { data: manifestData, error: manifestError } = await supabase
        .from('admin_settings')
        .upsert(manifestPayload, {
          onConflict: 'key'
        })
        .select();

      console.log('[PWASettings] Manifest upsert result:', { data: manifestData, error: manifestError });

      if (manifestError) throw manifestError;

      toast.success('Настройки PWA успешно сохранены! 📱');
    } catch (error: any) {
      console.error('[PWASettings] Error saving PWA settings:', error);
      toast.error(`Ошибка сохранения: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Настройки PWA
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Настройки Progressive Web App для лучшего пользовательского опыта
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Сохраняю...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </>
          )}
        </Button>
      </div>

      {/* Манифест PWA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Манифест PWA
          </CardTitle>
          <CardDescription className="text-sm">
            Настройка веб-манифеста приложения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="app-name">Название приложения</Label>
              <Input
                id="app-name"
                type="text"
                value={manifest.appName}
                onChange={(e) => setManifest(prev => ({ ...prev, appName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short-name">Короткое название</Label>
              <Input
                id="short-name"
                type="text"
                value={manifest.shortName}
                onChange={(e) => setManifest(prev => ({ ...prev, shortName: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Input
              id="description"
              type="text"
              value={manifest.description}
              onChange={(e) => setManifest(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="theme-color">Цвет темы</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="theme-color"
                  type="text"
                  value={manifest.themeColor}
                  onChange={(e) => setManifest(prev => ({ ...prev, themeColor: e.target.value }))}
                  className="flex-1"
                />
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: manifest.themeColor }}
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bg-color">Цвет фона</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="bg-color"
                  type="text"
                  value={manifest.backgroundColor}
                  onChange={(e) => setManifest(prev => ({ ...prev, backgroundColor: e.target.value }))}
                  className="flex-1"
                />
                <div
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: manifest.backgroundColor }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Функции PWA */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Функции PWA
          </CardTitle>
          <CardDescription className="text-sm">
            Включение и отключение возможностей приложения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              settings.enableNotifications
                ? 'border-primary/20 bg-primary/5'
                : 'bg-muted border-border'
            }`}>
              <div className="flex items-center gap-3">
                <Bell className={`w-5 h-5 ${settings.enableNotifications ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="space-y-0.5">
                  <div className={`text-sm font-medium ${settings.enableNotifications ? 'text-primary' : ''}`}>
                    Push-уведомления
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Разрешить отправку уведомлений
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.enableNotifications}
                onCheckedChange={(checked) => setSettings({ ...settings, enableNotifications: checked })}
              />
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              settings.enableOfflineMode
                ? 'border-primary/20 bg-primary/5'
                : 'bg-muted border-border'
            }`}>
              <div className="flex items-center gap-3">
                <Wifi className={`w-5 h-5 ${settings.enableOfflineMode ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="space-y-0.5">
                  <div className={`text-sm font-medium ${settings.enableOfflineMode ? 'text-primary' : ''}`}>
                    Offline режим
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Работа без интернета
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.enableOfflineMode}
                onCheckedChange={(checked) => setSettings({ ...settings, enableOfflineMode: checked })}
              />
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              settings.enableInstallPrompt
                ? 'border-primary/20 bg-primary/5'
                : 'bg-muted border-border'
            }`}>
              <div className="flex items-center gap-3">
                <Download className={`w-5 h-5 ${settings.enableInstallPrompt ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="space-y-0.5">
                  <div className={`text-sm font-medium ${settings.enableInstallPrompt ? 'text-primary' : ''}`}>
                    Install Prompt
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Предложение установки
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.enableInstallPrompt}
                onCheckedChange={(checked) => setSettings({ ...settings, enableInstallPrompt: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Install Prompt настройки */}
      {settings.enableInstallPrompt && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="w-5 h-5" />
              Настройки Install Prompt
            </CardTitle>
            <CardDescription className="text-sm">
              Когда и где показывать предложение установки
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timing */}
            <div className="space-y-2">
              <Label>Когда показывать</Label>
              <Select
                value={settings.installPromptTiming}
                onValueChange={(value: any) => setSettings({ ...settings, installPromptTiming: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Сразу при первом визите</SelectItem>
                  <SelectItem value="after_visits">После N визитов</SelectItem>
                  <SelectItem value="after_time">После N минут на сайте</SelectItem>
                  <SelectItem value="manual">Только вручную</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Visits Count */}
            {settings.installPromptTiming === 'after_visits' && (
              <div className="space-y-2">
                <Label>Количество визитов</Label>
                <Input
                  type="number"
                  min="1"
                  value={settings.installPromptVisitsCount}
                  onChange={(e) => setSettings({ ...settings, installPromptVisitsCount: parseInt(e.target.value) })}
                />
              </div>
            )}

            {/* Delay Minutes */}
            {settings.installPromptTiming === 'after_time' && (
              <div className="space-y-2">
                <Label>Задержка (минуты)</Label>
                <Input
                  type="number"
                  min="1"
                  value={settings.installPromptDelayMinutes}
                  onChange={(e) => setSettings({ ...settings, installPromptDelayMinutes: parseInt(e.target.value) })}
                />
              </div>
            )}

            {/* Location */}
            <div className="space-y-2">
              <Label>Где показывать</Label>
              <Select
                value={settings.installPromptLocation}
                onValueChange={(value: any) => setSettings({ ...settings, installPromptLocation: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">Только на онбординге</SelectItem>
                  <SelectItem value="user_cabinet">Только в личном кабинете</SelectItem>
                  <SelectItem value="both">На онбординге и в кабинете</SelectItem>
                  <SelectItem value="anywhere">Везде</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

