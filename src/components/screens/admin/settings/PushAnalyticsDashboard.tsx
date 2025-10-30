/**
 * Push Analytics Dashboard
 *
 * Отображает статистику push уведомлений:
 * - Общие метрики (sent, delivered, opened, rates)
 * - Статистика по браузерам
 * - Статистика по времени (часы, дни)
 * - Графики и визуализация
 */

import {
	AlertTriangle,
	BarChart3,
	Bell,
	Calendar,
	Clock,
	RefreshCw,
	TrendingUp,
	Users,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { SimpleChart } from '@/shared/components/SimpleChart';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { getPushAnalytics, type PushAnalyticsStats } from '@/shared/lib/analytics/push-analytics';

export const PushAnalyticsDashboard: React.FC = () => {
	const [stats, setStats] = useState<PushAnalyticsStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [period, setPeriod] = useState<'7d' | '30d' | 'all'>('7d');

	const loadAnalytics = async () => {
		console.log('[PushAnalyticsDashboard] Loading analytics, period:', period);
		setLoading(true);
		try {
			let startDate: Date | undefined;
			const endDate = new Date();

			if (period === '7d') {
				startDate = new Date();
				startDate.setDate(startDate.getDate() - 7);
			} else if (period === '30d') {
				startDate = new Date();
				startDate.setDate(startDate.getDate() - 30);
			}

			console.log('[PushAnalyticsDashboard] Calling getPushAnalytics with:', {
				startDate,
				endDate,
			});
			const data = await getPushAnalytics(startDate, endDate);
			console.log('[PushAnalyticsDashboard] Received data:', data);
			setStats(data);
		} catch (error) {
			console.error('[PushAnalyticsDashboard] Failed to load push analytics:', error);
		} finally {
			setLoading(false);
			console.log('[PushAnalyticsDashboard] Loading complete');
		}
	};

	useEffect(() => {
		loadAnalytics();
	}, [loadAnalytics]);

	console.log('[PushAnalyticsDashboard] Render state:', {
		loading,
		stats: !!stats,
	});

	if (loading) {
		console.log('[PushAnalyticsDashboard] Rendering loading state');
		return (
			<Card>
				<CardContent className="p-8">
					<div className="flex items-center justify-center gap-2">
						<RefreshCw className="h-5 w-5 animate-spin" />
						<span>Загрузка аналитики...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!stats) {
		console.log('[PushAnalyticsDashboard] Rendering no stats state');
		return (
			<Card>
				<CardContent className="p-8">
					<div className="text-center text-muted-foreground">Не удалось загрузить аналитику</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Заголовок и фильтры */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="flex items-center gap-2 font-semibold text-lg">
						<BarChart3 className="h-5 w-5" />
						Push Аналитика
					</h3>
					<p className="text-muted-foreground text-sm">Статистика эффективности push уведомлений</p>
				</div>
				<div className="flex gap-2">
					<Button
						onClick={() => setPeriod('7d')}
						size="sm"
						variant={period === '7d' ? 'default' : 'outline'}
					>
						7 дней
					</Button>
					<Button
						onClick={() => setPeriod('30d')}
						size="sm"
						variant={period === '30d' ? 'default' : 'outline'}
					>
						30 дней
					</Button>
					<Button
						onClick={() => setPeriod('all')}
						size="sm"
						variant={period === 'all' ? 'default' : 'outline'}
					>
						Все время
					</Button>
					<Button onClick={loadAnalytics} size="sm" variant="ghost">
						<RefreshCw className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Основные метрики */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{/* Total Sent */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">Отправлено</p>
								<p className="font-bold text-2xl">{stats.total_sent.toLocaleString()}</p>
							</div>
							<Bell className="h-8 w-8 text-blue-500 opacity-50" />
						</div>
					</CardContent>
				</Card>

				{/* Delivery Rate */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">Доставлено</p>
								<p className="font-bold text-2xl">{stats.total_delivered.toLocaleString()}</p>
								<Badge className="mt-1" variant="secondary">
									{stats.delivery_rate.toFixed(1)}%
								</Badge>
							</div>
							<TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
						</div>
					</CardContent>
				</Card>

				{/* Open Rate */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">Открыто</p>
								<p className="font-bold text-2xl">{stats.total_opened.toLocaleString()}</p>
								<Badge className="mt-1" variant="secondary">
									{stats.open_rate.toFixed(1)}%
								</Badge>
							</div>
							<Users className="h-8 w-8 text-purple-500 opacity-50" />
						</div>
					</CardContent>
				</Card>

				{/* CTR */}
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-muted-foreground text-sm">CTR</p>
								<p className="font-bold text-2xl">{stats.ctr.toFixed(1)}%</p>
								<p className="mt-1 text-muted-foreground text-xs">Click-through rate</p>
							</div>
							<BarChart3 className="h-8 w-8 text-orange-500 opacity-50" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Критичные алерты */}
			{stats.delivery_rate < 50 && stats.total_sent > 0 && (
				<Alert className="border-red-500 bg-red-50 dark:bg-red-950/20" variant="destructive">
					<AlertTriangle className="h-5 w-5" />
					<AlertTitle className="font-semibold text-lg">
						Критично низкий процент доставки!
					</AlertTitle>
					<AlertDescription className="mt-2 space-y-2">
						<p className="text-base">
							Только <strong>{stats.delivery_rate.toFixed(1)}%</strong> уведомлений доставлено (
							{stats.total_delivered} из {stats.total_sent}).
						</p>
						<p className="text-sm">
							<strong>Возможные причины:</strong>
						</p>
						<ul className="ml-2 list-inside list-disc space-y-1 text-sm">
							<li>Неверные VAPID keys в настройках</li>
							<li>Проблемы с Service Worker</li>
							<li>Пользователи отозвали разрешения на уведомления</li>
							<li>Неактивные подписки (истёк срок действия)</li>
						</ul>
						<p className="mt-2 text-sm">
							<strong>Рекомендации:</strong> Проверьте VAPID keys в разделе "Push Notifications" и
							обновите Service Worker.
						</p>
					</AlertDescription>
				</Alert>
			)}

			{/* Графики */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* График по дням */}
				{stats.by_day.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Calendar className="h-5 w-5" />
								Статистика по дням
							</CardTitle>
							<CardDescription>Динамика отправки и открытия уведомлений</CardDescription>
						</CardHeader>
						<CardContent>
							<SimpleChart
								data={stats.by_day.map((d) => ({
									date: new Date(d.date).toLocaleDateString('ru-RU', {
										day: '2-digit',
										month: 'short',
									}),
									Доставлено: d.delivered,
									Открыто: d.opened,
								}))}
								type="line"
								xAxisKey="date"
							/>
						</CardContent>
					</Card>
				)}

				{/* График по часам */}
				{stats.by_hour.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="h-5 w-5" />
								Статистика по часам
							</CardTitle>
							<CardDescription>Лучшее время для отправки уведомлений</CardDescription>
						</CardHeader>
						<CardContent>
							<SimpleChart
								data={stats.by_hour.map((h) => ({
									hour: `${h.hour}:00`,
									Доставлено: h.delivered,
									Открыто: h.opened,
								}))}
								type="bar"
								xAxisKey="hour"
							/>
						</CardContent>
					</Card>
				)}
			</div>

			{/* Статистика по браузерам */}
			{stats.by_browser.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Статистика по браузерам
						</CardTitle>
						<CardDescription>Эффективность push уведомлений в разных браузерах</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{stats.by_browser.map((browser) => (
								<div
									className="flex items-center justify-between rounded-lg border p-4"
									key={browser.browser}
								>
									<div className="flex-1">
										<p className="font-medium">{browser.browser}</p>
										<div className="mt-2 flex gap-4 text-muted-foreground text-sm">
											<span>Доставлено: {browser.delivered}</span>
											<span>Открыто: {browser.opened}</span>
										</div>
									</div>
									<div className="flex gap-2">
										<Badge variant="secondary">Delivery: {browser.delivery_rate.toFixed(1)}%</Badge>
										<Badge variant="secondary">Open: {browser.open_rate.toFixed(1)}%</Badge>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Рекомендации */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Рекомендации
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2 text-sm">
						{stats.delivery_rate < 80 && (
							<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
								<p className="font-medium text-yellow-800 dark:text-yellow-500">
									⚠️ Низкий процент доставки ({stats.delivery_rate.toFixed(1)}%)
								</p>
								<p className="mt-1 text-yellow-700 dark:text-yellow-400">
									Проверьте VAPID keys и настройки Service Worker
								</p>
							</div>
						)}
						{stats.open_rate < 20 && stats.total_delivered > 0 && (
							<div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20">
								<p className="font-medium text-blue-800 dark:text-blue-500">
									💡 Низкий процент открытия ({stats.open_rate.toFixed(1)}%)
								</p>
								<p className="mt-1 text-blue-700 dark:text-blue-400">
									Попробуйте улучшить заголовки и текст уведомлений
								</p>
							</div>
						)}
						{stats.by_hour.length > 0 && (
							<div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20">
								<p className="font-medium text-green-800 dark:text-green-500">
									✅ Лучшее время для отправки
								</p>
								<p className="mt-1 text-green-700 dark:text-green-400">
									{(() => {
										const bestHour = stats.by_hour.reduce((best, current) =>
											current.opened > best.opened ? current : best
										);
										return `${bestHour.hour}:00 - ${bestHour.hour + 1}:00 (${bestHour.opened} открытий)`;
									})()}
								</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
