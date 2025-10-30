import { Smartphone, Activity, Users, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/lib/i18n";

/**
 * Quick Actions Component
 * Displays quick action buttons for common admin tasks
 */

export function QuickActions() {
  const { t } = useTranslation();

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="text-[17px]!">{t('quick_actions', 'Быстрые действия')}</CardTitle>
        <CardDescription className="text-[13px]! font-normal!">{t('quick_actions_desc', 'Управление ключевыми функциями приложения')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="justify-start h-auto py-4 border-border"
            onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: { tab: 'pwa', pwaSubTab: 'settings' } }))}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-(--radius) bg-accent/10 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px]! text-foreground">{t('pwa_settings', 'Настройки PWA')}</p>
                <p className="text-[13px]! text-muted-foreground font-normal!">
                  {t('pwa_settings_desc', 'Управление установкой и обновлениями')}
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4 border-border"
            onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: { tab: 'pwa', pwaSubTab: 'push' } }))}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-(--radius) bg-accent/10 flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px]! text-foreground">{t('push_notifications', 'Push-уведомления')}</p>
                <p className="text-[13px]! text-muted-foreground font-normal!">
                  {t('push_notifications_desc', 'Настройка уведомлений')}
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4 border-border"
            onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: { tab: 'users' } }))}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-(--radius) bg-accent/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px]! text-foreground">{t('user_management', 'Управление пользователями')}</p>
                <p className="text-[13px]! text-muted-foreground font-normal!">
                  {t('user_management_desc', 'Просмотр и редактирование пользователей')}
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto py-4 border-border"
            onClick={() => window.dispatchEvent(new CustomEvent('admin-navigate', { detail: { tab: 'subscriptions' } }))}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 rounded-(--radius) bg-accent/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px]! text-foreground">{t('subscription_management', 'Управление подписками')}</p>
                <p className="text-[13px]! text-muted-foreground font-normal!">
                  {t('subscription_management_desc', 'Premium подписки и платежи')}
                </p>
              </div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

