/**
 * Campaign History Component
 *
 * History of all push notification campaigns
 * Features:
 * - List of all campaigns
 * - Filtering by status
 * - Sorting by date
 */

import { useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface Campaign {
	id: string;
	title: string;
	body: string;
	status: string;
	target_segment: string;
	total_recipients: number;
	total_sent: number;
	total_delivered: number;
	total_opened: number;
	total_failed: number;
	created_at: string;
	sent_at?: string;
	scheduled_at?: string;
}

export function CampaignHistory() {
	const [campaigns, setCampaigns] = useState<Campaign[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('all');

	useEffect(() => {
		loadCampaigns();
	}, [activeTab]);

	const loadCampaigns = async () => {
		try {
			setIsLoading(true);

			let query = supabase
				.from('push_campaigns')
				.select('*')
				.order('created_at', { ascending: false });

			// Filter by status
			if (activeTab !== 'all') {
				query = query.eq('status', activeTab);
			}

			const { data, error } = await query;

			if (error) {
				throw error;
			}

			setCampaigns(data || []);
		} catch (error) {
			console.error('[Campaign History] Error loading campaigns:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const getSegmentLabel = (segment: string) => {
		switch (segment) {
			case 'all':
				return 'Все пользователи';
			case 'premium':
				return 'Premium';
			case 'active':
				return 'Активные';
			case 'inactive':
				return 'Неактивные';
			case 'custom':
				return 'Кастомный сегмент';
			default:
				return segment;
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>История кампаний</CardTitle>
				<CardDescription>Все отправленные и запланированные кампании</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="all">Все</TabsTrigger>
						<TabsTrigger value="sent">Отправлено</TabsTrigger>
						<TabsTrigger value="scheduled">Запланировано</TabsTrigger>
						<TabsTrigger value="draft">Черновики</TabsTrigger>
						<TabsTrigger value="failed">Ошибки</TabsTrigger>
					</TabsList>

					<TabsContent value={activeTab} className="space-y-4 mt-4">
						{isLoading ? (
							<p className="text-sm text-muted-foreground">Загрузка...</p>
						) : campaigns.length === 0 ? (
							<p className="text-sm text-muted-foreground">Нет кампаний</p>
						) : (
							<div className="space-y-3">
								{campaigns.map((campaign) => (
									<div
										key={campaign.id}
										className="rounded-lg border p-4 space-y-2 transition-colors hover:bg-accent"
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h4 className="font-semibold">{campaign.title}</h4>
												<p className="text-sm text-muted-foreground line-clamp-2">
													{campaign.body}
												</p>
											</div>
										</div>

										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											<span>Сегмент: {getSegmentLabel(campaign.target_segment)}</span>
											<span>•</span>
											<span>Получателей: {campaign.total_recipients}</span>
											{campaign.sent_at && (
												<>
													<span>•</span>
													<span>
														Отправлено: {new Date(campaign.sent_at).toLocaleDateString('ru-RU')}
													</span>
												</>
											)}
											{campaign.scheduled_at && !campaign.sent_at && (
												<>
													<span>•</span>
													<span>
														Запланировано:{' '}
														{new Date(campaign.scheduled_at).toLocaleDateString('ru-RU')}
													</span>
												</>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
