import { Activity, CreditCard, Smartphone, Users } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useTranslation } from '@/shared/lib/i18n';

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
        <CardDescription className="font-normal! text-[13px]!">
          {t('quick_actions_desc', 'Управление ключевыми функциями приложения')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Button
            className="h-auto justify-start border-border py-4"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('admin-navigate', { detail: { tab: 'pwa', pwaSubTab: 'settings' } })
              )
            }
            variant="outline"
          >
            <div className="flex w-full items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius) bg-accent/10">
                <Smartphone className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px]! text-foreground">{t('pwa_settings', 'Настройки PWA')}</p>
                <p className="font-normal! text-[13px]! text-muted-foreground">
                  {t('pwa_settings_desc', 'Управление установкой и обновлениями')}
                </p>
              </div>
            </div>
          </Button>

          <Button
            className="h-auto justify-start border-border py-4"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('admin-navigate', { detail: { tab: 'pwa', pwaSubTab: 'push' } })
              )
            }
            variant="outline"
          >
            <div className="flex w-full items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius) bg-accent/10">
                <Activity className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px]! text-foreground">
                  {t('push_notifications', 'Push-уведомления')}
                </p>
                <p className="font-normal! text-[13px]! text-muted-foreground">
                  {t('push_notifications_desc', 'Настройка уведомлений')}
                </p>
              </div>
            </div>
          </Button>

          <Button
            className="h-auto justify-start border-border py-4"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('admin-navigate', { detail: { tab: 'users' } }))
            }
            variant="outline"
          >
            <div className="flex w-full items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius) bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px]! text-foreground">
                  {t('user_management', 'Управление пользователями')}
                </p>
                <p className="font-normal! text-[13px]! text-muted-foreground">
                  {t('user_management_desc', 'Просмотр и редактирование пользователей')}
                </p>
              </div>
            </div>
          </Button>

          <Button
            className="h-auto justify-start border-border py-4"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent('admin-navigate', { detail: { tab: 'subscriptions' } })
              )
            }
            variant="outline"
          >
            <div className="flex w-full items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-(--radius) bg-accent/10">
                <CreditCard className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px]! text-foreground">
                  {t('subscription_management', 'Управление подписками')}
                </p>
                <p className="font-normal! text-[13px]! text-muted-foreground">
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
