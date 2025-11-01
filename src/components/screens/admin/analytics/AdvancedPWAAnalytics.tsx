/**
 * Advanced PWA Analytics Dashboard
 *
 * Расширенная аналитика PWA с:
 * - Retention rate по когортам
 * - Funnel анализ
 * - Time series графики
 * - Экспорт в CSV/JSON
 */

import { BarChart3, Calendar, Download, Filter, RefreshCw, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { SimpleChart } from '@/shared/components/SimpleChart';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import {
	type CohortData,
	exportToCSV,
	exportToJSON,
	type FunnelData,
	getCohortRetention,
	getFunnelAnalysis,
	getTimeSeriesData,
	type TimeSeriesData,
} from '@/shared/lib/analytics/advanced-pwa-analytics';

export function AdvancedPWAAnalytics() {
	const [isLoading, setIsLoading] = useState(false);
	const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

	const [cohorts, setCohorts] = useState<CohortData[]>([]);
	const [funnel, setFunnel] = useState<FunnelData[]>([]);
	const [timeSeries, setTimeSeries] = useState<TimeSeriesData[]>([]);

	// Load analytics data
	const loadAnalytics = useCallback(async () => {
		setIsLoading(true);
		try {
			const endDate = new Date().toISOString();
			const startDate = new Date();

			if (period === '7d') {
				startDate.setDate(startDate.getDate() - 7);
			} else if (period === '30d') {
				startDate.setDate(startDate.getDate() - 30);
			} else {
				startDate.setDate(startDate.getDate() - 90);
			}

			const [cohortData, funnelData, timeSeriesData] = await Promise.all([
				getCohortRetention(startDate.toISOString(), endDate),
				getFunnelAnalysis(),
				getTimeSeriesData(startDate.toISOString(), endDate),
			]);

			setCohorts(cohortData);
			setFunnel(funnelData);
			setTimeSeries(timeSeriesData);
		} catch (error) {
			console.error('[AdvancedPWAAnalytics] Failed to load analytics:', error);
			toast.error('Ошибка загрузки аналитики');
		} finally {
			setIsLoading(false);
		}
	}, [period]);

	useEffect(() => {
		loadAnalytics();
	}, [loadAnalytics]);

	// Export handlers
	const handleExportCSV = () => {
		exportToCSV(timeSeries, `pwa-analytics-${period}-${Date.now()}.csv`);
		toast.success('Экспорт в CSV завершен');
	};

	const handleExportJSON = () => {
		const data = {
			period,
			exportDate: new Date().toISOString(),
			cohorts,
			funnel,
			timeSeries,
		};

		exportToJSON(data, `pwa-analytics-${period}-${Date.now()}.json`);
		toast.success('Экспорт в JSON завершен');
	};

	// Calculate overall retention
	const overallRetention =
		cohorts.length > 0
			? {
					week1: Math.round(cohorts.reduce((sum, c) => sum + c.week1, 0) / cohorts.length),
					week2: Math.round(cohorts.reduce((sum, c) => sum + c.week2, 0) / cohorts.length),
					week3: Math.round(cohorts.reduce((sum, c) => sum + c.week3, 0) / cohorts.length),
					week4: Math.round(cohorts.reduce((sum, c) => sum + c.week4, 0) / cohorts.length),
				}
			: { week1: 0, week2: 0, week3: 0, week4: 0 };

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-bold text-2xl">Расширенная аналитика PWA</h2>
					<p className="text-muted-foreground text-sm">
						Детальная статистика, retention, funnel анализ
					</p>
				</div>

				<div className="flex gap-2">
					<Button disabled={isLoading} onClick={loadAnalytics} size="sm" variant="outline">
						<RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
						Обновить
					</Button>

					<Button onClick={handleExportCSV} size="sm" variant="outline">
						<Download className="mr-2 h-4 w-4" />
						CSV
					</Button>

					<Button onClick={handleExportJSON} size="sm" variant="outline">
						<Download className="mr-2 h-4 w-4" />
						JSON
					</Button>
				</div>
			</div>

			{/* Period Filter */}
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center gap-2">
						<Filter className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium text-sm">Период:</span>
						<div className="flex gap-2">
							{(['7d', '30d', '90d'] as const).map((p) => (
								<Button
									key={p}
									onClick={() => setPeriod(p)}
									size="sm"
									variant={period === p ? 'default' : 'outline'}
								>
									{p === '7d' && '7 дней'}
									{p === '30d' && '30 дней'}
									{p === '90d' && '90 дней'}
								</Button>
							))}
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Retention Rate */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="h-5 w-5" />
						Retention Rate
					</CardTitle>
					<CardDescription>
						Процент пользователей, вернувшихся через N недель после установки
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-6 grid grid-cols-4 gap-4">
						<div className="rounded-lg bg-muted p-4 text-center">
							<div className="font-bold text-2xl">{overallRetention.week1}%</div>
							<div className="text-muted-foreground text-sm">Неделя 1</div>
						</div>
						<div className="rounded-lg bg-muted p-4 text-center">
							<div className="font-bold text-2xl">{overallRetention.week2}%</div>
							<div className="text-muted-foreground text-sm">Неделя 2</div>
						</div>
						<div className="rounded-lg bg-muted p-4 text-center">
							<div className="font-bold text-2xl">{overallRetention.week3}%</div>
							<div className="text-muted-foreground text-sm">Неделя 3</div>
						</div>
						<div className="rounded-lg bg-muted p-4 text-center">
							<div className="font-bold text-2xl">{overallRetention.week4}%</div>
							<div className="text-muted-foreground text-sm">Неделя 4</div>
						</div>
					</div>

					{cohorts.length > 0 && (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b">
										<th className="p-2 text-left">Когорта</th>
										<th className="p-2 text-right">Пользователей</th>
										<th className="p-2 text-right">Неделя 1</th>
										<th className="p-2 text-right">Неделя 2</th>
										<th className="p-2 text-right">Неделя 3</th>
										<th className="p-2 text-right">Неделя 4</th>
									</tr>
								</thead>
								<tbody>
									{cohorts.map((cohort) => (
										<tr className="border-b" key={cohort.cohort}>
											<td className="p-2">{cohort.cohort}</td>
											<td className="p-2 text-right">{cohort.totalUsers}</td>
											<td className="p-2 text-right">
												<Badge variant={cohort.week1 >= 50 ? 'success' : 'secondary'}>
													{cohort.week1}%
												</Badge>
											</td>
											<td className="p-2 text-right">
												<Badge variant={cohort.week2 >= 40 ? 'success' : 'secondary'}>
													{cohort.week2}%
												</Badge>
											</td>
											<td className="p-2 text-right">
												<Badge variant={cohort.week3 >= 30 ? 'success' : 'secondary'}>
													{cohort.week3}%
												</Badge>
											</td>
											<td className="p-2 text-right">
												<Badge variant={cohort.week4 >= 25 ? 'success' : 'secondary'}>
													{cohort.week4}%
												</Badge>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Funnel Analysis */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Funnel Analysis
					</CardTitle>
					<CardDescription>Конверсия пользователей на каждом этапе</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{funnel.map((stage, index) => (
							<div className="space-y-2" key={stage.stage}>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-medium text-sm">
											{index + 1}
										</div>
										<span className="font-medium">{stage.stage}</span>
									</div>
									<div className="flex items-center gap-4">
										<span className="text-muted-foreground text-sm">
											{stage.users.toLocaleString()} пользователей
										</span>
										<Badge variant={stage.percentage >= 50 ? 'success' : 'secondary'}>
											{stage.percentage}%
										</Badge>
									</div>
								</div>

								<div className="h-3 w-full rounded-full bg-muted">
									<div
										className="h-3 rounded-full bg-primary transition-all"
										style={{ width: `${stage.percentage}%` }}
									/>
								</div>

								{stage.dropoff > 0 && (
									<div className="pl-10 text-muted-foreground text-sm">
										Отсев: {stage.dropoff.toLocaleString()} пользователей
									</div>
								)}
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Time Series */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="h-5 w-5" />
						Динамика установок
					</CardTitle>
					<CardDescription>Установки и активность по дням</CardDescription>
				</CardHeader>
				<CardContent>
					{timeSeries.length > 0 && (
						<SimpleChart
							data={timeSeries}
							dataKey="installs"
							title="Установки по дням"
							type="line"
							xAxisKey="date"
						/>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
