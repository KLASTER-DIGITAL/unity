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
import { lazy, Suspense, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

// ✅ PERFORMANCE: Lazy load ALL heavy components to reduce initial bundle size
// Expected reduction: 207 KB → 40 KB (initial) + 167 KB (lazy chunks)
// ✅ NEW: CampaignCreator теперь тоже lazy loaded для дальнейшего уменьшения bundle
const CampaignCreator = lazy(() =>
	import('@/features/admin/campaigns/components').then((module) => ({
		default: module.CampaignCreator,
	}))
);

const AnalyticsDashboard = lazy(() =>
	import('@/features/admin/campaigns/components').then((module) => ({
		default: module.AnalyticsDashboard,
	}))
);

const CampaignHistory = lazy(() =>
	import('@/features/admin/campaigns/components').then((module) => ({
		default: module.CampaignHistory,
	}))
);

const SegmentManager = lazy(() =>
	import('./SegmentManager').then((module) => ({
		default: module.SegmentManager,
	}))
);

const TemplateManager = lazy(() =>
	import('./TemplateManager').then((module) => ({
		default: module.TemplateManager,
	}))
);

const ABTestManager = lazy(() =>
	import('./ABTestManager').then((module) => ({
		default: module.ABTestManager,
	}))
);

const PushNotificationTester = lazy(() =>
	import('@/components/screens/admin/settings/PushNotificationTester').then((module) => ({
		default: module.PushNotificationTester,
	}))
);

// Loading fallback component
function TabLoadingFallback() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Загрузка...</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-center py-12">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			</CardContent>
		</Card>
	);
}

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
						<TabsTrigger
							className="flex items-center gap-2 whitespace-nowrap px-3 py-2"
							value="campaigns"
						>
							<Send className="h-4 w-4" />
							<span>Рассылки</span>
						</TabsTrigger>
						<TabsTrigger
							className="flex items-center gap-2 whitespace-nowrap px-3 py-2"
							value="segments"
						>
							<Users className="h-4 w-4" />
							<span>Сегменты</span>
						</TabsTrigger>
						<TabsTrigger
							className="flex items-center gap-2 whitespace-nowrap px-3 py-2"
							value="analytics"
						>
							<BarChart3 className="h-4 w-4" />
							<span>Аналитика</span>
						</TabsTrigger>
						<TabsTrigger
							className="flex items-center gap-2 whitespace-nowrap px-3 py-2"
							value="history"
						>
							<History className="h-4 w-4" />
							<span>История</span>
						</TabsTrigger>
						<TabsTrigger
							className="flex items-center gap-2 whitespace-nowrap px-3 py-2"
							value="ab-testing"
						>
							<FlaskConical className="h-4 w-4" />
							<span>A/B Testing</span>
						</TabsTrigger>
						<TabsTrigger
							className="flex items-center gap-2 whitespace-nowrap px-3 py-2"
							value="test"
						>
							<TestTube className="h-4 w-4" />
							<span>Тестирование</span>
						</TabsTrigger>
						<TabsTrigger
							className="flex items-center gap-2 whitespace-nowrap px-3 py-2"
							value="templates"
						>
							<FileText className="h-4 w-4" />
							<span>Шаблоны</span>
						</TabsTrigger>
					</TabsList>
				</div>

				{/* Campaign Creator - Lazy loaded для уменьшения bundle size */}
				<TabsContent className="space-y-6" value="campaigns">
					<Suspense fallback={<TabLoadingFallback />}>
						<CampaignCreator />
					</Suspense>
				</TabsContent>

				{/* Segment Manager - Lazy loaded */}
				<TabsContent className="space-y-6" value="segments">
					<Suspense fallback={<TabLoadingFallback />}>
						<SegmentManager />
					</Suspense>
				</TabsContent>

				{/* Analytics Dashboard - Lazy loaded (Chart.js heavy) */}
				<TabsContent className="space-y-6" value="analytics">
					<Suspense fallback={<TabLoadingFallback />}>
						<AnalyticsDashboard />
					</Suspense>
				</TabsContent>

				{/* Campaign History - Lazy loaded */}
				<TabsContent className="space-y-6" value="history">
					<Suspense fallback={<TabLoadingFallback />}>
						<CampaignHistory />
					</Suspense>
				</TabsContent>

				{/* A/B Testing - Lazy loaded */}
				<TabsContent className="space-y-6" value="ab-testing">
					<Suspense fallback={<TabLoadingFallback />}>
						<ABTestManager />
					</Suspense>
				</TabsContent>

				{/* Test Push - Lazy loaded */}
				<TabsContent className="space-y-6" value="test">
					<Suspense fallback={<TabLoadingFallback />}>
						<PushNotificationTester />
					</Suspense>
				</TabsContent>

				{/* Templates - Lazy loaded */}
				<TabsContent className="space-y-6" value="templates">
					<Suspense fallback={<TabLoadingFallback />}>
						<TemplateManager />
					</Suspense>
				</TabsContent>
			</Tabs>
		</div>
	);
}
