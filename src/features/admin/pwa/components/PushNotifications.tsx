import {
	BarChart3,
	Bell,
	FileText,
	FlaskConical,
	History,
	Send,
	TestTube,
	Users,
} from 'lucide-react';
import { useState } from 'react';
import { PushNotificationTester } from '@/components/screens/admin/settings/PushNotificationTester';
import {
	AnalyticsDashboard,
	CampaignCreator,
	CampaignHistory,
} from '@/features/admin/campaigns/components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ABTestManager } from './ABTestManager';
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
				{/* ✅ FIX: Адаптивный layout с горизонтальным скроллом на маленьких экранах */}
				<div className="w-full overflow-x-auto">
					<TabsList className="inline-flex h-auto w-auto min-w-full flex-nowrap gap-1 p-1">
						<TabsTrigger className="flex items-center gap-2 whitespace-nowrap" value="campaigns">
							<Send className="h-4 w-4" />
							<span className="hidden sm:inline">Рассылки</span>
							<span className="sm:hidden">Рассылки</span>
						</TabsTrigger>
						<TabsTrigger className="flex items-center gap-2 whitespace-nowrap" value="segments">
							<Users className="h-4 w-4" />
							<span className="hidden sm:inline">Сегменты</span>
							<span className="sm:hidden">Сегменты</span>
						</TabsTrigger>
						<TabsTrigger className="flex items-center gap-2 whitespace-nowrap" value="analytics">
							<BarChart3 className="h-4 w-4" />
							<span className="hidden sm:inline">Аналитика</span>
							<span className="sm:hidden">Аналитика</span>
						</TabsTrigger>
						<TabsTrigger className="flex items-center gap-2 whitespace-nowrap" value="history">
							<History className="h-4 w-4" />
							<span className="hidden sm:inline">История</span>
							<span className="sm:hidden">История</span>
						</TabsTrigger>
						<TabsTrigger className="flex items-center gap-2 whitespace-nowrap" value="ab-testing">
							<FlaskConical className="h-4 w-4" />
							<span className="hidden sm:inline">A/B Testing</span>
							<span className="sm:hidden">A/B</span>
						</TabsTrigger>
						<TabsTrigger className="flex items-center gap-2 whitespace-nowrap" value="test">
							<TestTube className="h-4 w-4" />
							<span className="hidden sm:inline">Тестирование</span>
							<span className="sm:hidden">Тест</span>
						</TabsTrigger>
						<TabsTrigger className="flex items-center gap-2 whitespace-nowrap" value="templates">
							<FileText className="h-4 w-4" />
							<span className="hidden sm:inline">Шаблоны</span>
							<span className="sm:hidden">Шаблоны</span>
						</TabsTrigger>
					</TabsList>
				</div>

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

				{/* A/B Testing */}
				<TabsContent className="space-y-6" value="ab-testing">
					<ABTestManager />
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
