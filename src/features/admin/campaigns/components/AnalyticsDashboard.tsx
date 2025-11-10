/**
 * Analytics Dashboard Component
 *
 * Real-time analytics for push notification campaigns
 * Features:
 * - Overall metrics (sent, delivered, opened, failed)
 * - Campaign statistics
 * - Trends over time (Recharts)
 * - Device/Browser breakdown
 * - Supabase Realtime integration
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import { BarChart3, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { createClient } from '@/utils/supabase/client';

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
	campaign: any;
	calculateDeliveryRate: (campaign: any) => string;
	calculateOpenRate: (campaign: any) => string;
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
	}, []);

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

	const loadTrends = async () => {
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) return;

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-analytics-api/trends?days=7`,
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
						<CardTitle>Тренды за последние 7 дней</CardTitle>
						<CardDescription>Динамика отправки и открытия уведомлений</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer height={300} width="100%">
							<AreaChart data={trends}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="date" />
								<YAxis />
								<Tooltip />
								<Area
									dataKey="delivered"
									fill="hsl(var(--primary))"
									name="Доставлено"
									stroke="hsl(var(--primary))"
									type="monotone"
								/>
								<Area
									dataKey="opened"
									fill="hsl(var(--chart-2))"
									name="Открыто"
									stroke="hsl(var(--chart-2))"
									type="monotone"
								/>
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>
			)}

			{/* Campaign Statistics */}
			<Card>
				<CardHeader>
					<CardTitle>Статистика кампаний</CardTitle>
					<CardDescription>Последние 10 кампаний</CardDescription>
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
