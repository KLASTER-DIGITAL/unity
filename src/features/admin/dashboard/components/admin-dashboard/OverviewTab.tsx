import {
  Users,
  Database,
  Activity,
  UserCheck,
  DollarSign,
  RefreshCw,
  Smartphone
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useTranslation } from "@/shared/lib/i18n";
import { StatsCard } from "./StatsCard";
import { QuickActions } from "./QuickActions";
import { SystemStatus } from "./SystemStatus";
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
        <StatsCard
          icon={Users}
          title={t('total_users', 'Всего пользователей')}
          value={stats.totalUsers}
          subtitle={`+${stats.newUsersToday} ${t('new_today', 'сегодня')}`}
        />

        <StatsCard
          icon={Activity}
          title={t('active_users', 'Активные пользователи')}
          value={stats.activeUsers}
          subtitle={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% ${t('of_all', 'от всех')}`}
        />

        <StatsCard
          icon={UserCheck}
          title={t('premium_subscriptions', 'Premium подписки')}
          value={stats.premiumUsers}
          subtitle={`${stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}% ${t('conversion', 'конверсия')}`}
        />

        <StatsCard
          icon={DollarSign}
          title={t('total_revenue', 'Общий доход')}
          value={`$${stats.totalRevenue}`}
          subtitle={`$${stats.premiumUsers > 0 ? Math.round(stats.totalRevenue / stats.premiumUsers) : 0} ARPU`}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <StatsCard
          icon={Database}
          title={t('total_entries', 'Всего записей')}
          value={stats.totalEntries}
          subtitle={`${stats.activeUsers > 0 ? (stats.totalEntries / stats.activeUsers).toFixed(1) : 0} ${t('per_active_user', 'на активного пользователя')}`}
        />

        <StatsCard
          icon={Smartphone}
          title={t('pwa_installs', 'PWA установки')}
          value={stats.pwaInstalls}
          subtitle={`${stats.totalUsers > 0 ? Math.round((stats.pwaInstalls / stats.totalUsers) * 100) : 0}% ${t('of_all_users', 'от всех пользователей')}`}
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* System Status */}
      <SystemStatus />
    </div>
  );
}

