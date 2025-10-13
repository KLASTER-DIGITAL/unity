import { useState } from "react";
import { Globe, Mail, Shield, DollarSign, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Switch } from "../../../ui/switch";
import { Textarea } from "../../../ui/textarea";
import { Separator } from "../../../ui/separator";

export function GeneralSettingsTab() {
  const [generalSettings, setGeneralSettings] = useState({
    // Основные настройки
    appUrl: "https://diary-app.leadshunter.biz",
    supportEmail: "support@leadshunter.biz",
    companyName: "LeadsHunter",
    
    // Языки
    defaultLanguage: "ru",
    enabledLanguages: ["ru", "en", "es", "de", "fr", "zh", "ja"],
    
    // Регистрация
    allowRegistration: true,
    requireEmailVerification: false,
    allowSocialLogin: true,
    
    // Контент
    maxEntriesPerDay: 50,
    maxMediaSize: 10, // MB
    allowVoiceRecording: true,
    allowPhotoUpload: true,
    
    // Модерация
    enableAutoModeration: false,
    moderationKeywords: "",
    
    // Premium
    premiumMonthlyPrice: 399,
    premiumYearlyPrice: 3990,
    trialDays: 7,
  });

  const handleSave = () => {
    // TODO: Сохранение на сервер
    alert('Общие настройки сохранены!');
  };

  const availableLanguages = [
    { code: "ru", name: "Русский" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "de", name: "Deutsch" },
    { code: "fr", name: "Français" },
    { code: "zh", name: "中文" },
    { code: "ja", name: "日本語" },
  ];

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="!text-[18px] !font-semibold">Основные настройки</CardTitle>
          <CardDescription>Базовая информация о приложении</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="appUrl">URL приложения</Label>
            <Input
              id="appUrl"
              value={generalSettings.appUrl}
              onChange={(e) => setGeneralSettings({...generalSettings, appUrl: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportEmail">Email поддержки</Label>
            <Input
              id="supportEmail"
              type="email"
              value={generalSettings.supportEmail}
              onChange={(e) => setGeneralSettings({...generalSettings, supportEmail: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Название компании</Label>
            <Input
              id="companyName"
              value={generalSettings.companyName}
              onChange={(e) => setGeneralSettings({...generalSettings, companyName: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="!text-[18px] !font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Настройки языков
          </CardTitle>
          <CardDescription>Управление доступными языками интерфейса</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="defaultLanguage">Язык по умолчанию</Label>
            <select
              id="defaultLanguage"
              value={generalSettings.defaultLanguage}
              onChange={(e) => setGeneralSettings({...generalSettings, defaultLanguage: e.target.value})}
              className="w-full h-10 px-3 border border-border rounded-md bg-background text-foreground"
            >
              {availableLanguages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <Label>Доступные языки</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableLanguages.map(lang => (
                <div key={lang.code} className="flex items-center gap-2">
                  <Switch
                    checked={generalSettings.enabledLanguages.includes(lang.code)}
                    onCheckedChange={(checked) => {
                      const languages = checked
                        ? [...generalSettings.enabledLanguages, lang.code]
                        : generalSettings.enabledLanguages.filter(l => l !== lang.code);
                      setGeneralSettings({...generalSettings, enabledLanguages: languages});
                    }}
                  />
                  <span className="!text-[14px]">{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="!text-[18px] !font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Настройки регистрации
          </CardTitle>
          <CardDescription>Управление доступом новых пользователей</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="!text-[14px] !font-semibold">Разрешить регистрацию</Label>
              <p className="!text-[12px] text-muted-foreground !font-normal">
                Пользователи могут создавать новые аккаунты
              </p>
            </div>
            <Switch
              checked={generalSettings.allowRegistration}
              onCheckedChange={(checked) => setGeneralSettings({...generalSettings, allowRegistration: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="!text-[14px] !font-semibold">Требовать подтверждение email</Label>
              <p className="!text-[12px] text-muted-foreground !font-normal">
                Пользователи должны подтвердить email перед использованием
              </p>
            </div>
            <Switch
              checked={generalSettings.requireEmailVerification}
              onCheckedChange={(checked) => setGeneralSettings({...generalSettings, requireEmailVerification: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="!text-[14px] !font-semibold">Вход через соцсети</Label>
              <p className="!text-[12px] text-muted-foreground !font-normal">
                Google, Facebook и другие провайдеры
              </p>
            </div>
            <Switch
              checked={generalSettings.allowSocialLogin}
              onCheckedChange={(checked) => setGeneralSettings({...generalSettings, allowSocialLogin: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="!text-[18px] !font-semibold">Настройки контента</CardTitle>
          <CardDescription>Ограничения на создание записей и медиа</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="maxEntriesPerDay">Макс. записей в день</Label>
            <Input
              id="maxEntriesPerDay"
              type="number"
              value={generalSettings.maxEntriesPerDay}
              onChange={(e) => setGeneralSettings({...generalSettings, maxEntriesPerDay: parseInt(e.target.value)})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxMediaSize">Макс. размер медиафайла (MB)</Label>
            <Input
              id="maxMediaSize"
              type="number"
              value={generalSettings.maxMediaSize}
              onChange={(e) => setGeneralSettings({...generalSettings, maxMediaSize: parseInt(e.target.value)})}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="!text-[14px] !font-semibold">Голосовые записи</Label>
            <Switch
              checked={generalSettings.allowVoiceRecording}
              onCheckedChange={(checked) => setGeneralSettings({...generalSettings, allowVoiceRecording: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="!text-[14px] !font-semibold">Загрузка фото/видео</Label>
            <Switch
              checked={generalSettings.allowPhotoUpload}
              onCheckedChange={(checked) => setGeneralSettings({...generalSettings, allowPhotoUpload: checked})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Premium Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="!text-[18px] !font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Настройки Premium подписки
          </CardTitle>
          <CardDescription>Ценообразование и пробный период</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="premiumMonthly">Месячная подписка (₽)</Label>
              <Input
                id="premiumMonthly"
                type="number"
                value={generalSettings.premiumMonthlyPrice}
                onChange={(e) => setGeneralSettings({...generalSettings, premiumMonthlyPrice: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="premiumYearly">Годовая подписка (₽)</Label>
              <Input
                id="premiumYearly"
                type="number"
                value={generalSettings.premiumYearlyPrice}
                onChange={(e) => setGeneralSettings({...generalSettings, premiumYearlyPrice: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trialDays">Пробный период (дней)</Label>
              <Input
                id="trialDays"
                type="number"
                value={generalSettings.trialDays}
                onChange={(e) => setGeneralSettings({...generalSettings, trialDays: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Отменить</Button>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Сохранить настройки
        </Button>
      </div>
    </div>
  );
}
