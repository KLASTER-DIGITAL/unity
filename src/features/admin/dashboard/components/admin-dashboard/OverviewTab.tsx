import {
  Users,
  CreditCard,
  Smartphone,
  Database,
  Activity,
  UserCheck,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useTranslation } from "@/shared/lib/i18n";
import type { OverviewTabProps } from "./types";

/**
 * Overview Tab Component
 * Displays admin dashboard statistics and quick actions
 */
export function OverviewTab({ stats, isLoading, onRefresh }: OverviewTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[26px]! text-foreground">Обзор системы</h3>
          <p className="text-[15px]! text-muted-foreground font-normal!">Статистика и метрики приложения</p>
        </div>
        <Button 
          onClick={onRefresh} 
          disabled={isLoading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Обновить
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px]! font-normal! text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('total_users', 'Всего пользователей')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[34px]! text-foreground">{stats.totalUsers}</div>
            <p className="text-[13px]! text-accent font-normal! mt-1">
              +{stats.newUsersToday} {t('new_today', 'сегодня')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px]! font-normal! text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {t('active_users', 'Активные пользователи')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[34px]! text-foreground">{stats.activeUsers}</div>
            <p className="text-[13px]! text-muted-foreground font-normal! mt-1">
              {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% {t('of_all', 'от всех')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px]! font-normal! text-muted-foreground flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              {t('premium_subscriptions', 'Premium подписки')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[34px]! text-foreground">{stats.premiumUsers}</div>
            <p className="text-[13px]! text-muted-foreground font-normal! mt-1">
              {stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}% {t('conversion', 'конверсия')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px]! font-normal! text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              {t('total_revenue', 'Общий доход')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[34px]! text-foreground">${stats.totalRevenue}</div>
            <p className="text-[13px]! text-muted-foreground font-normal! mt-1">
              ${stats.premiumUsers > 0 ? Math.round(stats.totalRevenue / stats.premiumUsers) : 0} ARPU
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px]! font-normal! text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4" />
              {t('total_entries', 'Всего записей')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[34px]! text-foreground">{stats.totalEntries}</div>
            <p className="text-[13px]! text-muted-foreground font-normal! mt-1">
              {stats.activeUsers > 0 ? (stats.totalEntries / stats.activeUsers).toFixed(1) : 0} {t('per_active_user', 'на активного пользователя')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-[13px]! font-normal! text-muted-foreground flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              {t('pwa_installs', 'PWA установки')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-[34px]! text-foreground">{stats.pwaInstalls}</div>
            <p className="text-[13px]! text-muted-foreground font-normal! mt-1">
              {stats.totalUsers > 0 ? Math.round((stats.pwaInstalls / stats.totalUsers) * 100) : 0}% {t('of_all_users', 'от всех пользователей')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
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

      {/* System Status */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[17px]!">
            <Activity className="w-5 h-5" />
            Статус системы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[15px]! text-foreground">База данных</span>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[13px]!">
                Работает
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[15px]! text-foreground">API сервер</span>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[13px]!">
                Работает
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[15px]! text-foreground">Service Worker</span>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[13px]!">
                Активен v1.0.3
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[15px]! text-foreground">Push-уведомления</span>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[13px]!">
                Включено
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

