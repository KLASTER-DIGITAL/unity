/**
 * Analytics Dashboard Component
 *
 * Real-time analytics for push notification campaigns
 * Features:
 * - Campaign statistics (sent, delivered, opened, failed)
 * - Supabase Realtime integration
 * - Recharts visualizations
 */

import type { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { supabase } from '@/shared/lib/supabase';

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

export function AnalyticsDashboard() {
	const [campaigns, setCampaigns] = useState<CampaignStats[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

	useEffect(() => {
		loadCampaigns();
		setupRealtime();

		return () => {
			if (realtimeChannel) {
				realtimeChannel.unsubscribe();
			}
		};
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
					<CardTitle>Аналитика кампаний</CardTitle>
					<CardDescription>Загрузка...</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Аналитика кампаний</CardTitle>
					<CardDescription>Статистика отправленных уведомлений в реальном времени</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{campaigns.length === 0 ? (
							<p className="text-sm text-muted-foreground">Нет кампаний для отображения</p>
						) : (
							campaigns.map((campaign) => (
								<div
									key={campaign.id}
									className="rounded-lg border p-4 space-y-3 transition-colors hover:bg-accent"
								>
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
										<div className="flex items-center gap-2">
											<span
												className={`px-2 py-1 rounded text-xs font-medium ${
													campaign.status === 'sent'
														? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
														: campaign.status === 'sending'
															? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
															: campaign.status === 'scheduled'
																? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
																: campaign.status === 'failed'
																	? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
																	: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
												}`}
											>
												{campaign.status === 'sent'
													? 'Отправлено'
													: campaign.status === 'sending'
														? 'Отправка...'
														: campaign.status === 'scheduled'
															? 'Запланировано'
															: campaign.status === 'failed'
																? 'Ошибка'
																: 'Черновик'}
											</span>
										</div>
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
											<p className="text-xs text-blue-600 dark:text-blue-400">
												{calculateOpenRate(campaign)}%
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-xs text-muted-foreground">Ошибки</p>
											<p className="text-2xl font-bold text-red-600 dark:text-red-400">
												{campaign.total_failed}
											</p>
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
