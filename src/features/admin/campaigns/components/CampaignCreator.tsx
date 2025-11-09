/**
 * Campaign Creator Component
 *
 * Admin UI for creating push notification campaigns
 * Features:
 * - i18n support (7 languages)
 * - Segment targeting
 * - Scheduling
 * - Template editor
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { createClient } from '@/utils/supabase/client';
import { ScheduleManager } from './ScheduleManager';
import { SegmentBuilder } from './SegmentBuilder';
import { TemplateEditor } from './TemplateEditor';

const supabase = createClient();

interface CampaignData {
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	image?: string;
	target_segment: 'all' | 'premium' | 'active' | 'inactive' | 'custom';
	custom_segment_id?: string;
	scheduled_at?: string;
	translations: Record<string, { title: string; body: string }>;
}

export function CampaignCreator() {
	const [campaignData, setCampaignData] = useState<CampaignData>({
		title: '',
		body: '',
		target_segment: 'all',
		translations: {},
	});
	const [isCreating, setIsCreating] = useState(false);
	const [activeTab, setActiveTab] = useState('content');

	const handleCreateCampaign = async () => {
		try {
			setIsCreating(true);

			// Validate required fields
			if (!campaignData.title || !campaignData.body) {
				toast.error('Заполните обязательные поля');
				return;
			}

			// Get current user
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast.error('Пользователь не авторизован');
				return;
			}

			// Create campaign
			const { data, error } = await supabase
				.from('push_campaigns')
				.insert({
					title: campaignData.title,
					body: campaignData.body,
					icon: campaignData.icon,
					badge: campaignData.badge,
					image: campaignData.image,
					target_segment: campaignData.target_segment,
					custom_segment_id: campaignData.custom_segment_id,
					scheduled_at: campaignData.scheduled_at,
					translations: campaignData.translations,
					created_by: user.id,
					status: campaignData.scheduled_at ? 'scheduled' : 'draft',
				})
				.select()
				.single();

			if (error) {
				throw error;
			}

			toast.success('Кампания создана успешно');
			console.log('[Campaign Creator] Created campaign:', data);

			// Reset form
			setCampaignData({
				title: '',
				body: '',
				target_segment: 'all',
				translations: {},
			});
			setActiveTab('content');
		} catch (error) {
			console.error('[Campaign Creator] Error:', error);
			toast.error('Ошибка при создании кампании');
		} finally {
			setIsCreating(false);
		}
	};

	const handleSendNow = async () => {
		try {
			setIsCreating(true);

			// Create campaign first
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast.error('Пользователь не авторизован');
				return;
			}

			const { data: campaign, error: createError } = await supabase
				.from('push_campaigns')
				.insert({
					title: campaignData.title,
					body: campaignData.body,
					icon: campaignData.icon,
					badge: campaignData.badge,
					image: campaignData.image,
					target_segment: campaignData.target_segment,
					custom_segment_id: campaignData.custom_segment_id,
					translations: campaignData.translations,
					created_by: user.id,
					status: 'sending',
				})
				.select()
				.single();

			if (createError) {
				throw createError;
			}

			// Trigger push-campaign-sender Edge Function
			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-campaign-sender`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
					},
					body: JSON.stringify({ campaign_id: campaign.id }),
				}
			);

			if (!response.ok) {
				throw new Error('Failed to send campaign');
			}

			toast.success('Кампания отправлена');
		} catch (error) {
			console.error('[Campaign Creator] Error:', error);
			toast.error('Ошибка при отправке кампании');
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle>Создать рассылку</CardTitle>
				<CardDescription>
					Создайте новую push-уведомление кампанию для пользователей
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="content">Контент</TabsTrigger>
						<TabsTrigger value="targeting">Таргетинг</TabsTrigger>
						<TabsTrigger value="schedule">Расписание</TabsTrigger>
					</TabsList>

					<TabsContent value="content" className="space-y-4">
						<TemplateEditor data={campaignData} onChange={setCampaignData} />
					</TabsContent>

					<TabsContent value="targeting" className="space-y-4">
						<SegmentBuilder
							targetSegment={campaignData.target_segment}
							customSegmentId={campaignData.custom_segment_id}
							onChange={(segment, customId) => {
								setCampaignData({
									...campaignData,
									target_segment: segment,
									custom_segment_id: customId,
								});
							}}
						/>
					</TabsContent>

					<TabsContent value="schedule" className="space-y-4">
						<ScheduleManager
							scheduledAt={campaignData.scheduled_at}
							onChange={(scheduledAt) => {
								setCampaignData({
									...campaignData,
									scheduled_at: scheduledAt,
								});
							}}
						/>
					</TabsContent>
				</Tabs>

				<div className="mt-6 flex gap-3">
					<Button
						onClick={handleSendNow}
						disabled={isCreating || !campaignData.title || !campaignData.body}
						className="flex-1"
					>
						{isCreating ? 'Отправка...' : 'Отправить сейчас'}
					</Button>
					<Button
						onClick={handleCreateCampaign}
						disabled={isCreating || !campaignData.title || !campaignData.body}
						variant="outline"
						className="flex-1"
					>
						{isCreating
							? 'Создание...'
							: campaignData.scheduled_at
								? 'Запланировать'
								: 'Сохранить черновик'}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
