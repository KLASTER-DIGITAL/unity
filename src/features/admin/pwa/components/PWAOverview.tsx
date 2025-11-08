import {
	BarChart3,
	Bell,
	Database,
	Loader2,
	Settings,
	Smartphone,
	TrendingUp,
	Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { createClient } from '@/utils/supabase/client';

type PWAStats = {
	totalInstalls: number;
	retentionRate: number;
	activeUsers: number;
	pushSubscriptions: number;
	pushSubscriptionRate: number;
	installsGrowth: number;
};

type InstallationData = {
	month: string;
	installs: number;
	uninstalls: number;
};

// Simple Chart Component (из PWASettingsTab)
function SimpleChart({ data }: { data: InstallationData[] }) {
	const maxValue = Math.max(...data.map((d) => Math.max(d.installs, d.uninstalls)));

	return (
		<div className="space-y-4">
			{data.map((item, index) => (
				<div className="space-y-2" key={index}>
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium">{item.month}</span>
						<div className="flex gap-4">
							<span className="text-green-600">+{item.installs}</span>
							<span className="text-red-600">-{item.uninstalls}</span>
						</div>
					</div>
					<div className="flex gap-2">
						<div
							className="h-2 rounded-full bg-green-500 transition-all"
							style={{ width: `${(item.installs / maxValue) * 100}%` }}
						/>
						<div
							className="h-2 rounded-full bg-red-500 transition-all"
							style={{ width: `${(item.uninstalls / maxValue) * 100}%` }}
						/>
					</div>
				</div>
			))}
		</div>
	);
}

export function PWAOverview() {
	const [isLoading, setIsLoading] = useState(false);
	const [stats, setStats] = useState<PWAStats>({
		totalInstalls: 0,
		retentionRate: 0,
		activeUsers: 0,
		pushSubscriptions: 0,
		pushSubscriptionRate: 0,
		installsGrowth: 0,
	});
	const [_installationData, _setInstallationData] = useState<InstallationData[]>([
		{ month: 'Apr', installs: 180, uninstalls: 20 },
		{ month: 'May', installs: 250, uninstalls: 22 },
		{ month: 'Jun', installs: 300, uninstalls: 25 },
	]);

	const supabase = createClient();

	// ✅ FIX: Define function BEFORE useEffect with useCallback
	const loadStats = useCallback(async () => {
		setIsLoading(true);
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				toast.error('Ошибка авторизации');
				return;
			}

			// Загрузка статистики PWA
			const { data: profiles, error } = await supabase
				.from('profiles')
				.select('pwa_installed, last_active');

			if (error) {
				throw error;
			}

			if (profiles) {
				const totalInstalls = profiles.filter((p) => p.pwa_installed).length;
				const activeUsers = profiles.filter((p) => {
					if (!p.last_active) {
						return false;
					}
					const lastActive = new Date(p.last_active);
					const weekAgo = new Date();
					weekAgo.setDate(weekAgo.getDate() - 7);
					return lastActive >= weekAgo;
				}).length;

				// Загрузка push подписок
				const { data: pushSubs } = await supabase.from('push_subscriptions').select('id');

				const pushSubscriptions = pushSubs?.length || 0;
				const pushSubscriptionRate =
					totalInstalls > 0 ? Math.round((pushSubscriptions / totalInstalls) * 100) : 0;

				setStats({
					totalInstalls,
					retentionRate: 75, // TODO: Calculate from real data
					activeUsers,
					pushSubscriptions,
					pushSubscriptionRate,
					installsGrowth: 12, // TODO: Calculate from real data
				});
			}
		} catch (error) {
			console.error('Error loading PWA stats:', error);
			toast.error('Ошибка загрузки статистики');
		} finally {
			setIsLoading(false);
		}
	}, [supabase]);

	// ✅ FIX: useEffect AFTER function definition
	useEffect(() => {
		loadStats();
	}, [loadStats]);

	const handleQuickAction = (action: string) => {
		toast.info(`Действие "${action}" будет реализовано в следующих версиях`);
	};

	if (isLoading) {
		return (
			<div className="flex h-96 items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Заголовок */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="flex items-center gap-2 font-bold text-2xl">
						<Smartphone className="h-6 w-6" />
						PWA Overview
					</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Обзор Progressive Web App функциональности
					</p>
				</div>
				<Badge className="gap-1" variant="default">
					<div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
					Активен
				</Badge>
			</div>

			{/* Статистические карточки */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{/* Главная метрика - Всего установок */}
				<Card className="border-primary/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-primary text-sm">Всего установок</CardTitle>
						<Smartphone className="h-4 w-4 text-primary" />
					</CardHeader>
					<CardContent className="pt-0">
						<div className="font-bold text-4xl text-primary">
							{stats.totalInstalls.toLocaleString()}
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							+{stats.installsGrowth}% за последний месяц
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Retention Rate</CardTitle>
						<BarChart3 className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent className="pt-0">
						<div className="font-bold text-2xl">{stats.retentionRate}%</div>
						<Progress className="mt-1" value={stats.retentionRate} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Активные пользователи</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent className="pt-0">
						<div className="font-bold text-2xl">{stats.activeUsers.toLocaleString()}</div>
						<p className="mt-1 text-muted-foreground text-xs">За последние 7 дней</p>
					</CardContent>
				</Card>

				{/* Главная метрика - Push подписки */}
				<Card className="border-primary/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-primary text-sm">Push подписки</CardTitle>
						<Bell className="h-4 w-4 text-primary" />
					</CardHeader>
					<CardContent className="pt-0">
						<div className="font-bold text-4xl text-primary">
							{stats.pushSubscriptions.toLocaleString()}
						</div>
						<p className="mt-1 text-muted-foreground text-xs">
							{stats.pushSubscriptionRate}% от установок
						</p>
					</CardContent>
				</Card>
			</div>

			{/* График установок */}
			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-base">
						<TrendingUp className="h-5 w-5" />
						Динамика установок
					</CardTitle>
					<CardDescription className="text-sm">Последние 3 месяца</CardDescription>
				</CardHeader>
				<CardContent>
					<SimpleChart data={_installationData} />
				</CardContent>
			</Card>

			{/* Быстрые действия */}
			<div>
				<h3 className="mb-4 font-semibold text-lg">Быстрые действия</h3>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<Card
						className="cursor-pointer transition-colors hover:bg-muted/50"
						onClick={() => handleQuickAction('Отправить Push')}
					>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Bell className="h-5 w-5" />
								Отправить Push
							</CardTitle>
							<CardDescription>Отправить уведомление всем пользователям</CardDescription>
						</CardHeader>
					</Card>

					<Card
						className="cursor-pointer transition-colors hover:bg-muted/50"
						onClick={() => handleQuickAction('Очистить кэш')}
					>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Database className="h-5 w-5" />
								Очистить кэш
							</CardTitle>
							<CardDescription>Очистить кэш всех пользователей</CardDescription>
						</CardHeader>
					</Card>

					<Card
						className="cursor-pointer transition-colors hover:bg-muted/50"
						onClick={() => handleQuickAction('Настройки PWA')}
					>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Settings className="h-5 w-5" />
								Настройки PWA
							</CardTitle>
							<CardDescription>Изменить параметры приложения</CardDescription>
						</CardHeader>
					</Card>
				</div>
			</div>
		</div>
	);
}
