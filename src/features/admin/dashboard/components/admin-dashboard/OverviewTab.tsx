import {
	Activity,
	Database,
	DollarSign,
	RefreshCw,
	Smartphone,
	UserCheck,
	Users,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { OverviewTabSkeleton } from './OverviewTabSkeleton';
import { QuickActions } from './QuickActions';
import { StatsCard } from './StatsCard';
import { SystemStatus } from './SystemStatus';
import type { OverviewTabProps } from './types';

/**
 * Overview Tab Component
 * Displays admin dashboard statistics and quick actions
 */
export function OverviewTab({ stats, isLoading, onRefresh }: OverviewTabProps) {
	// Show skeleton during initial load
	if (isLoading && stats.totalUsers === 0) {
		return <OverviewTabSkeleton />;
	}

	return (
		<div className="space-y-6">
			{/* Header with Refresh */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-2xl text-foreground">Обзор системы</h3>
					<p className="text-base font-normal text-muted-foreground">
						Статистика и метрики приложения
					</p>
				</div>
				<Button className="gap-2" disabled={isLoading} onClick={onRefresh} variant="outline">
					<RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
					Обновить
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-4">
				<StatsCard
					icon={Users}
					subtitle={`+${stats.newUsersToday} сегодня`}
					title="Всего пользователей"
					value={stats.totalUsers}
				/>

				<StatsCard
					icon={Activity}
					subtitle={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% от всех`}
					title="Активные пользователи"
					value={stats.activeUsers}
				/>

				<StatsCard
					icon={UserCheck}
					subtitle={`${stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}% конверсия`}
					title="Premium подписки"
					value={stats.premiumUsers}
				/>

				<StatsCard
					icon={DollarSign}
					subtitle={`$${stats.premiumUsers > 0 ? Math.round(stats.totalRevenue / stats.premiumUsers) : 0} ARPU`}
					title="Общий доход"
					value={`$${stats.totalRevenue}`}
				/>
			</div>

			{/* Additional Stats */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
				<StatsCard
					icon={Database}
					subtitle={`${stats.activeUsers > 0 ? (stats.totalEntries / stats.activeUsers).toFixed(1) : 0} на активного пользователя`}
					title="Всего записей"
					value={stats.totalEntries}
				/>

				<StatsCard
					icon={Smartphone}
					subtitle={`${stats.totalUsers > 0 ? Math.round((stats.pwaInstalls / stats.totalUsers) * 100) : 0}% от всех пользователей`}
					title="PWA установки"
					value={stats.pwaInstalls}
				/>
			</div>

			{/* Quick Actions */}
			<QuickActions />

			{/* System Status */}
			<SystemStatus />
		</div>
	);
}
