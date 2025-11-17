/**
 * Campaign History Component
 *
 * History of all push notification campaigns
 * Features:
 * - List of all campaigns
 * - Filtering by status
 * - Sorting by date
 */

import { useCallback, useEffect, useState } from 'react';
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

	// ✅ FIX: Define loadCampaigns with useCallback BEFORE useEffect
	const loadCampaigns = useCallback(async () => {
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
	}, [activeTab]); // ✅ Add activeTab to dependencies

	useEffect(() => {
		loadCampaigns();
	}, [loadCampaigns]);

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
					{/* ✅ FIX: Responsive tabs layout */}
					<div className="w-full overflow-x-auto">
						<TabsList className="inline-flex h-auto w-auto min-w-full flex-nowrap gap-1 p-1">
							<TabsTrigger className="whitespace-nowrap px-3 py-2" value="all">
								Все
							</TabsTrigger>
							<TabsTrigger className="whitespace-nowrap px-3 py-2" value="sent">
								Отправлено
							</TabsTrigger>
							<TabsTrigger className="whitespace-nowrap px-3 py-2" value="scheduled">
								Запланировано
							</TabsTrigger>
							<TabsTrigger className="whitespace-nowrap px-3 py-2" value="draft">
								Черновики
							</TabsTrigger>
							<TabsTrigger className="whitespace-nowrap px-3 py-2" value="failed">
								Ошибки
							</TabsTrigger>
						</TabsList>
					</div>

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
										className="rounded-lg border p-4 space-y-3 transition-colors hover:bg-accent"
									>
										{/* ✅ FIX: Улучшенный layout с метриками */}
										<div className="space-y-2">
											<h4 className="font-semibold text-base">{campaign.title}</h4>
											<p className="text-sm text-muted-foreground line-clamp-2">{campaign.body}</p>
										</div>

										{/* ✅ FIX: Метрики в grid layout */}
										<div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t">
											<div>
												<p className="text-xs text-muted-foreground">Отправлено</p>
												<p className="font-semibold text-sm">{campaign.total_sent}</p>
											</div>
											<div>
												<p className="text-xs text-muted-foreground">Доставлено</p>
												<p className="font-semibold text-sm">{campaign.total_delivered}</p>
											</div>
											<div>
												<p className="text-xs text-muted-foreground">Открыто</p>
												<p className="font-semibold text-sm">{campaign.total_opened}</p>
											</div>
											<div>
												<p className="text-xs text-muted-foreground">Ошибки</p>
												<p className="font-semibold text-sm text-destructive">
													{campaign.total_failed}
												</p>
											</div>
										</div>

										{/* ✅ FIX: Дополнительная информация */}
										<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2 border-t">
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
