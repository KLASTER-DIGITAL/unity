import type React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import type { MobileSettingsProps } from './types';

export const OnboardingSettings: React.FC<MobileSettingsProps> = ({ settings, onChange }) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Онбординг</CardTitle>
          <CardDescription>Настройки экранов онбординга</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Включить онбординг</Label>
              <p className="text-muted-foreground text-sm">
                Показывать экраны онбординга новым пользователям
              </p>
            </div>
            <Switch
              checked={settings.onboarding_enabled}
              onCheckedChange={(checked) => handleChange('onboarding_enabled', checked)}
            />
          </div>

          {settings.onboarding_enabled && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Разрешить пропуск</Label>
                  <p className="text-muted-foreground text-sm">
                    Пользователь может пропустить онбординг
                  </p>
                </div>
                <Switch
                  checked={settings.onboarding_skip_enabled}
                  onCheckedChange={(checked) => handleChange('onboarding_skip_enabled', checked)}
                />
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="mb-2 font-medium text-sm">Экраны онбординга:</p>
                <p className="text-muted-foreground text-sm">
                  Количество экранов: {settings.onboarding_screens.length}
                </p>
                <p className="mt-2 text-muted-foreground text-xs">
                  Детальная настройка экранов будет доступна в следующей версии
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
