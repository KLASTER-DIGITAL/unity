/**
 * Analytics Dashboard Component
 *
 * Real-time analytics for push notification campaigns
 * Features:
 * - Overall metrics (sent, delivered, opened, failed)
 * - Campaign statistics
 * - Trends over time (Chart.js Line Chart)
 * - Device/Browser breakdown (Chart.js Bar Charts)
 * - Supabase Realtime integration
 * - Export to CSV/Excel/PDF
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
// ✅ PERFORMANCE: Lazy loaded Chart.js components для уменьшения bundle size
// Expected reduction: ~30 KB
import { BarChart3, Download, FileSpreadsheet, FileText, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/select';
import { exportToCSV, exportToExcel, exportToPDF } from '@/shared/lib/export/dataExport';
import { createClient } from '@/utils/supabase/client';
import { LazyBarChart, LazyLineChart } from './charts/LazyCharts';

const supabase = createClient();

interface CampaignStats {
	id: string;
	title: string;
	status: string;
	total_recipients: number;
	total_sent: number;
	total_delivered: number;
	total_opened: number;
	total_failed: number;
	created_at: string;
	sent_at?: string;
}

interface OverallAnalytics {
	total: number;
	sent: number;
	delivered: number;
	failed: number;
	opened: number;
	deliveryRate: number;
	openRate: number;
	failureRate: number;
	deviceBreakdown: Record<string, number>;
	browserBreakdown: Record<string, number>;
}

interface TrendData {
	date: string;
	total: number;
	delivered: number;
	opened: number;
	failed: number;
	deliveryRate: string;
	openRate: string;
}

interface CampaignCardProps {
	campaign: CampaignStats;
	calculateDeliveryRate: (campaign: CampaignStats) => string;
	calculateOpenRate: (campaign: CampaignStats) => string;
	getStatusBadge: (status: string) => JSX.Element;
}

function CampaignCard({
	campaign,
	calculateDeliveryRate,
	calculateOpenRate,
	getStatusBadge,
}: CampaignCardProps) {
	return (
		<div className="space-y-3 rounded-lg border p-4 transition-colors hover:bg-accent">
			<div className="flex items-start justify-between">
				<div>
					<h3 className="font-semibold">{campaign.title}</h3>
					<p className="text-sm text-muted-foreground">
						Создано: {new Date(campaign.created_at).toLocaleString('ru-RU')}
					</p>
					{campaign.sent_at && (
						<p className="text-sm text-muted-foreground">
							Отправлено: {new Date(campaign.sent_at).toLocaleString('ru-RU')}
						</p>
					)}
				</div>
				<div className="flex items-center gap-2">{getStatusBadge(campaign.status)}</div>
			</div>

			<div className="grid grid-cols-5 gap-4">
				<div className="space-y-1">
					<p className="text-xs text-muted-foreground">Получателей</p>
					<p className="text-2xl font-bold">{campaign.total_recipients}</p>
				</div>
				<div className="space-y-1">
					<p className="text-xs text-muted-foreground">Отправлено</p>
					<p className="text-2xl font-bold">{campaign.total_sent}</p>
				</div>
				<div className="space-y-1">
					<p className="text-xs text-muted-foreground">Доставлено</p>
					<p className="text-2xl font-bold">{campaign.total_delivered}</p>
					<p className="text-xs text-green-600 dark:text-green-400">
						{calculateDeliveryRate(campaign)}%
					</p>
				</div>
				<div className="space-y-1">
					<p className="text-xs text-muted-foreground">Открыто</p>
					<p className="text-2xl font-bold">{campaign.total_opened}</p>
					<p className="text-xs text-blue-600 dark:text-blue-400">{calculateOpenRate(campaign)}%</p>
				</div>
				<div className="space-y-1">
					<p className="text-xs text-muted-foreground">Ошибки</p>
					<p className="text-2xl font-bold text-red-600 dark:text-red-400">
						{campaign.total_failed}
					</p>
				</div>
			</div>
		</div>
	);
}

export function AnalyticsDashboard() {
	const [campaigns, setCampaigns] = useState<CampaignStats[]>([]);
	const [overallAnalytics, setOverallAnalytics] = useState<OverallAnalytics | null>(null);
	const [trends, setTrends] = useState<TrendData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
	const [trendsDays, setTrendsDays] = useState<number>(7);

	useEffect(() => {
		loadCampaigns();
		loadOverallAnalytics();
		loadTrends();
		setupRealtime();

		return () => {
			if (realtimeChannel) {
				realtimeChannel.unsubscribe();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loadCampaigns, loadOverallAnalytics, loadTrends, realtimeChannel, setupRealtime]);

	const loadCampaigns = async () => {
		try {
			const { data, error } = await supabase
				.from('push_campaigns')
				.select('*')
				.order('created_at', { ascending: false })
				.limit(10);

			if (error) {
				throw error;
			}

			setCampaigns(data || []);
		} catch (error) {
			console.error('[Analytics Dashboard] Error loading campaigns:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const loadOverallAnalytics = async () => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) return;

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-analytics-api`,
				{
					headers: {
						Authorization: `Bearer ${session.access_token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error('Failed to load overall analytics');
			}

			const data = await response.json();
			setOverallAnalytics(data);
		} catch (error) {
			console.error('[Analytics Dashboard] Error loading overall analytics:', error);
		}
	};

	const loadTrends = async (days: number = trendsDays) => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) return;

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-analytics-api/trends?days=${days}`,
				{
					headers: {
						Authorization: `Bearer ${session.access_token}`,
					},
				}
			);

			if (!response.ok) {
				throw new Error('Failed to load trends');
			}

			const data = await response.json();
			setTrends(data);
		} catch (error) {
			console.error('[Analytics Dashboard] Error loading trends:', error);
		}
	};

	const setupRealtime = () => {
		const channel = supabase
			.channel('push_campaigns_changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'push_campaigns',
				},
				(payload) => {
					console.log('[Analytics Dashboard] Realtime update:', payload);
					loadCampaigns();
				}
			)
			.subscribe();

		setRealtimeChannel(channel);
	};

	const calculateDeliveryRate = (campaign: CampaignStats) => {
		if (campaign.total_sent === 0) return 0;
		return Math.round((campaign.total_delivered / campaign.total_sent) * 100);
	};

	const calculateOpenRate = (campaign: CampaignStats) => {
		if (campaign.total_delivered === 0) return 0;
		return Math.round((campaign.total_opened / campaign.total_delivered) * 100);
	};

	// Export functions
	const handleExportCSV = () => {
		const exportData = campaigns.map((c) => ({
			Название: c.title,
			Статус: c.status,
			Получателей: c.total_recipients,
			Отправлено: c.total_sent,
			Доставлено: c.total_delivered,
			Открыто: c.total_opened,
			Ошибки: c.total_failed,
			'Delivery Rate %': calculateDeliveryRate(c),
			'Open Rate %': calculateOpenRate(c),
			Создано: new Date(c.created_at).toLocaleString('ru-RU'),
		}));
		exportToCSV(exportData, `push-campaigns-${new Date().toISOString().split('T')[0]}`);
	};

	const handleExportExcel = () => {
		const exportData = campaigns.map((c) => ({
			Название: c.title,
			Статус: c.status,
			Получателей: c.total_recipients,
			Отправлено: c.total_sent,
			Доставлено: c.total_delivered,
			Открыто: c.total_opened,
			Ошибки: c.total_failed,
			'Delivery Rate %': calculateDeliveryRate(c),
			'Open Rate %': calculateOpenRate(c),
			Создано: new Date(c.created_at).toLocaleString('ru-RU'),
		}));
		exportToExcel(exportData, `push-campaigns-${new Date().toISOString().split('T')[0]}`);
	};

	const handleExportPDF = () => {
		const exportData = campaigns.map((c) => ({
			Название: c.title,
			Статус: c.status,
			Получателей: c.total_recipients,
			Отправлено: c.total_sent,
			Доставлено: c.total_delivered,
			Открыто: c.total_opened,
			Ошибки: c.total_failed,
			'Delivery Rate %': calculateDeliveryRate(c),
			'Open Rate %': calculateOpenRate(c),
		}));
		exportToPDF(
			exportData,
			`push-campaigns-${new Date().toISOString().split('T')[0]}`,
			'Push Notifications Analytics'
		);
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Аналитика уведомлений</CardTitle>
					<CardDescription>Загрузка...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Overall Metrics */}
			{overallAnalytics && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Всего отправлено</CardTitle>
							<BarChart3 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{overallAnalytics.total}</div>
							<p className="text-xs text-muted-foreground">
								Доставлено: {overallAnalytics.delivered} ({overallAnalytics.deliveryRate.toFixed(1)}
								%)
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Открыто</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{overallAnalytics.opened}</div>
							<p className="text-xs text-muted-foreground">
								Open Rate: {overallAnalytics.openRate.toFixed(1)}%
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Ошибки</CardTitle>
							<BarChart3 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-red-600 dark:text-red-400">
								{overallAnalytics.failed}
							</div>
							<p className="text-xs text-muted-foreground">
								Failure Rate: {overallAnalytics.failureRate.toFixed(1)}%
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
							<TrendingUp className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-green-600 dark:text-green-400">
								{overallAnalytics.deliveryRate.toFixed(1)}%
							</div>
							<p className="text-xs text-muted-foreground">
								{overallAnalytics.delivered} из {overallAnalytics.total}
							</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Trends Chart */}
			{trends.length > 0 && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>
									Тренды за последние {trendsDays} {trendsDays === 1 ? 'день' : 'дней'}
								</CardTitle>
								<CardDescription>Динамика отправки и открытия уведомлений</CardDescription>
							</div>
							<Select
								value={trendsDays.toString()}
								onValueChange={(value) => {
									const days = parseInt(value, 10);
									setTrendsDays(days);
									loadTrends(days);
								}}
							>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Выберите период" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="1">1 день</SelectItem>
									<SelectItem value="7">7 дней</SelectItem>
									<SelectItem value="14">14 дней</SelectItem>
									<SelectItem value="30">30 дней</SelectItem>
									<SelectItem value="90">90 дней</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardHeader>
					<CardContent>
						{/* ✅ Lazy Loaded Line Chart */}
						<div className="h-[300px]">
							<LazyLineChart
								data={{
									labels: trends.map((t) => t.date),
									datasets: [
										{
											label: 'Доставлено',
											data: trends.map((t) => t.delivered),
											borderColor: 'hsl(var(--primary))',
											backgroundColor: 'hsla(var(--primary), 0.1)',
											fill: true,
											tension: 0.4,
										},
										{
											label: 'Открыто',
											data: trends.map((t) => t.opened),
											borderColor: 'hsl(var(--chart-2))',
											backgroundColor: 'hsla(var(--chart-2), 0.1)',
											fill: true,
											tension: 0.4,
										},
									],
								}}
								options={{
									responsive: true,
									maintainAspectRatio: false,
									plugins: {
										legend: {
											position: 'top' as const,
										},
										tooltip: {
											mode: 'index' as const,
											intersect: false,
										},
									},
									scales: {
										y: {
											beginAtZero: true,
											ticks: {
												precision: 0,
											},
										},
									},
								}}
							/>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Device & Browser Breakdown */}
			{overallAnalytics && (
				<div className="grid gap-4 md:grid-cols-2">
					{/* Device Breakdown */}
					<Card>
						<CardHeader>
							<CardTitle>Распределение по устройствам</CardTitle>
							<CardDescription>Типы устройств получателей</CardDescription>
						</CardHeader>
						<CardContent>
							{/* ✅ Lazy Loaded Bar Chart */}
							<div className="h-[250px]">
								<LazyBarChart
									data={{
										labels: Object.keys(overallAnalytics.deviceBreakdown).map((name) =>
											name === 'mobile'
												? 'Мобильные'
												: name === 'desktop'
													? 'Десктоп'
													: name === 'tablet'
														? 'Планшеты'
														: 'Неизвестно'
										),
										datasets: [
											{
												label: 'Количество',
												data: Object.values(overallAnalytics.deviceBreakdown),
												backgroundColor: [
													'hsla(var(--chart-1), 0.8)',
													'hsla(var(--chart-2), 0.8)',
													'hsla(var(--chart-3), 0.8)',
													'hsla(var(--chart-4), 0.8)',
												],
												borderColor: [
													'hsl(var(--chart-1))',
													'hsl(var(--chart-2))',
													'hsl(var(--chart-3))',
													'hsl(var(--chart-4))',
												],
												borderWidth: 1,
											},
										],
									}}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: {
												display: false,
											},
										},
										scales: {
											y: {
												beginAtZero: true,
												ticks: {
													precision: 0,
												},
											},
										},
									}}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Browser Breakdown */}
					<Card>
						<CardHeader>
							<CardTitle>Распределение по браузерам</CardTitle>
							<CardDescription>Браузеры получателей</CardDescription>
						</CardHeader>
						<CardContent>
							{/* ✅ Lazy Loaded Bar Chart */}
							<div className="h-[250px]">
								<LazyBarChart
									data={{
										labels: Object.entries(overallAnalytics.browserBreakdown)
											.sort((a, b) => b[1] - a[1])
											.slice(0, 5)
											.map(([name]) => (name === 'unknown' ? 'Неизвестно' : name)),
										datasets: [
											{
												label: 'Количество',
												data: Object.entries(overallAnalytics.browserBreakdown)
													.sort((a, b) => b[1] - a[1])
													.slice(0, 5)
													.map(([, value]) => value),
												backgroundColor: [
													'hsla(var(--chart-1), 0.8)',
													'hsla(var(--chart-2), 0.8)',
													'hsla(var(--chart-3), 0.8)',
													'hsla(var(--chart-4), 0.8)',
													'hsla(var(--chart-5), 0.8)',
												],
												borderColor: [
													'hsl(var(--chart-1))',
													'hsl(var(--chart-2))',
													'hsl(var(--chart-3))',
													'hsl(var(--chart-4))',
													'hsl(var(--chart-5))',
												],
												borderWidth: 1,
											},
										],
									}}
									options={{
										responsive: true,
										maintainAspectRatio: false,
										plugins: {
											legend: {
												display: false,
											},
										},
										scales: {
											y: {
												beginAtZero: true,
												ticks: {
													precision: 0,
												},
											},
										},
									}}
								/>
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Campaign Statistics */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle>Статистика кампаний</CardTitle>
							<CardDescription>Последние 10 кампаний</CardDescription>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm">
									<Download className="mr-2 h-4 w-4" />
									Экспорт
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onClick={handleExportCSV}>
									<FileText className="mr-2 h-4 w-4" />
									Экспорт в CSV
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleExportExcel}>
									<FileSpreadsheet className="mr-2 h-4 w-4" />
									Экспорт в Excel
								</DropdownMenuItem>
								<DropdownMenuItem onClick={handleExportPDF}>
									<FileText className="mr-2 h-4 w-4" />
									Экспорт в PDF
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{campaigns.length === 0 ? (
							<p className="text-sm text-muted-foreground">Нет кампаний для отображения</p>
						) : (
							campaigns.map((campaign) => (
								<CampaignCard
									key={campaign.id}
									campaign={campaign}
									calculateDeliveryRate={calculateDeliveryRate}
									calculateOpenRate={calculateOpenRate}
									getStatusBadge={getStatusBadge}
								/>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
