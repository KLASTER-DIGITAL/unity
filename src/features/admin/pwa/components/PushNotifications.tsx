import { BarChart3, Bell, FileText, History, Send, TestTube, Users } from 'lucide-react';
import { useState } from 'react';
import { PushNotificationTester } from '@/components/screens/admin/settings/PushNotificationTester';
import {
	AnalyticsDashboard,
	CampaignCreator,
	CampaignHistory,
} from '@/features/admin/campaigns/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { SegmentManager } from './SegmentManager';

export function PushNotifications() {
	const [activeTab, setActiveTab] = useState('campaigns');

	return (
		<div className="space-y-6">
			{/* Заголовок */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="flex items-center gap-2 font-bold text-2xl">
						<Bell className="h-6 w-6" />
						Push Notifications
					</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Управление push уведомлениями и рассылками для пользователей
					</p>
				</div>
			</div>

			{/* Tabs */}
			<Tabs className="space-y-6" onValueChange={setActiveTab} value={activeTab}>
				<TabsList className="grid w-full max-w-4xl grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
					<TabsTrigger className="flex items-center gap-2" value="campaigns">
						<Send className="h-4 w-4" />
						Рассылки
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="segments">
						<Users className="h-4 w-4" />
						Сегменты
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="analytics">
						<BarChart3 className="h-4 w-4" />
						Аналитика
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="history">
						<History className="h-4 w-4" />
						История
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="test">
						<TestTube className="h-4 w-4" />
						Тестирование
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="templates">
						<FileText className="h-4 w-4" />
						Шаблоны
					</TabsTrigger>
				</TabsList>

				{/* Campaign Creator */}
				<TabsContent className="space-y-6" value="campaigns">
					<CampaignCreator />
				</TabsContent>

				{/* Segment Manager */}
				<TabsContent className="space-y-6" value="segments">
					<SegmentManager />
				</TabsContent>

				{/* Analytics Dashboard */}
				<TabsContent className="space-y-6" value="analytics">
					<AnalyticsDashboard />
				</TabsContent>

				{/* Campaign History */}
				<TabsContent className="space-y-6" value="history">
					<CampaignHistory />
				</TabsContent>

				{/* Test Push */}
				<TabsContent className="space-y-6" value="test">
					<PushNotificationTester />
				</TabsContent>

				{/* Templates - Coming Soon */}
				<TabsContent className="space-y-6" value="templates">
					<div className="rounded-lg border border-dashed p-12 text-center">
						<FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-50" />
						<h3 className="mb-2 font-semibold text-lg">Шаблоны уведомлений</h3>
						<p className="text-muted-foreground text-sm">
							Управление шаблонами будет реализовано в следующей версии
						</p>
						<p className="mt-2 text-muted-foreground text-sm">
							Сейчас используются встроенные шаблоны для 7 языков (ru/en/es/de/fr/zh/ja)
						</p>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
