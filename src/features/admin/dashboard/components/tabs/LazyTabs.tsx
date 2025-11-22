/**
 * Lazy Tabs для AdminDashboard
 *
 * Разбивает тяжелые табы на отдельные chunks для оптимизации производительности.
 * Цель: уменьшить initial bundle size и улучшить FCP/LCP метрики.
 *
 * @author UNITY Team
 * @date 2025-11-08
 */

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/shared/components/ui/skeleton';

// ============================================
// Lazy Loading для тяжелых табов
// ============================================

// PWA Tab Components (тяжелые - много компонентов)
const PWAOverview = lazy(() =>
	import('@/features/admin/pwa/components/PWAOverview').then((m) => ({ default: m.PWAOverview }))
);
const PWASettings = lazy(() =>
	import('@/features/admin/pwa/components/PWASettings').then((m) => ({ default: m.PWASettings }))
);
const PushNotifications = lazy(() =>
	import('@/features/admin/pwa/components/PushNotifications').then((m) => ({
		default: m.PushNotifications,
	}))
);
const PWAAnalytics = lazy(() =>
	import('@/features/admin/pwa/components/PWAAnalytics').then((m) => ({ default: m.PWAAnalytics }))
);
const PWACache = lazy(() =>
	import('@/features/admin/pwa/components/PWACache').then((m) => ({ default: m.PWACache }))
);

// Settings Tab Components
const SettingsTab = lazy(() =>
	import('@/features/admin/settings/components/SettingsTab').then((m) => ({
		default: m.SettingsTab,
	}))
);

// Test Lab (тяжелый - много тестов)
const TestLab = lazy(() =>
	import('@/features/admin/components/TestLab/TestLab').then((m) => ({ default: m.TestLab }))
);

// Developer Tab (тяжелый - PerformanceDashboard + React Native тесты)
const PerformanceDashboard = lazy(() =>
	import('@/shared/lib/i18n/monitoring/PerformanceDashboard').then((m) => ({
		default: m.PerformanceDashboard,
	}))
);
const ReactNativeReadinessTest = lazy(() =>
	import('@/features/admin/components/ReactNativeReadinessTest').then((m) => ({
		default: m.ReactNativeReadinessTest,
	}))
);

// Users Management Tab (411 строк)
const UsersManagementTab = lazy(() =>
	import('../UsersManagementTab').then((m) => ({ default: m.UsersManagementTab }))
);

// Languages Management Tab (529 строк)
const LanguagesManagementTab = lazy(() =>
	import('@/features/admin/settings/components/LanguagesManagementTab').then((m) => ({
		default: m.LanguagesManagementTab,
	}))
);

// AI Analytics Tab (462 строк)
const AIAnalyticsTab = lazy(() =>
	import('@/features/admin/analytics/components/AIAnalyticsTab').then((m) => ({
		default: m.AIAnalyticsTab,
	}))
);

// ============================================
// Loading Fallback Components
// ============================================

const TabLoadingFallback = () => (
	<div className="space-y-4">
		<Skeleton className="h-8 w-64" />
		<Skeleton className="h-64 w-full" />
		<div className="grid gap-4 md:grid-cols-2">
			<Skeleton className="h-32 w-full" />
			<Skeleton className="h-32 w-full" />
		</div>
	</div>
);

// ============================================
// Wrapper Components with Suspense
// ============================================

export const LazyPWAOverview = () => (
	<Suspense fallback={<TabLoadingFallback />}>
		<PWAOverview />
	</Suspense>
);

export const LazyPWASettings = () => (
	<Suspense fallback={<TabLoadingFallback />}>
		<PWASettings />
	</Suspense>
);

export const LazyPushNotifications = () => (
	<Suspense fallback={<TabLoadingFallback />}>
		<PushNotifications />
	</Suspense>
);

export const LazyPWAAnalytics = () => (
	<Suspense fallback={<TabLoadingFallback />}>
		<PWAAnalytics />
	</Suspense>
);

export const LazyPWACache = () => (
	<Suspense fallback={<TabLoadingFallback />}>
		<PWACache />
	</Suspense>
);

export const LazySettingsTab = (props: React.ComponentProps<typeof SettingsTab>) => (
	<Suspense fallback={<TabLoadingFallback />}>
		<SettingsTab {...props} />
	</Suspense>
);

export const LazyTestLab = () => (
	<Suspense fallback={<TabLoadingFallback />}>
		<TestLab />
	</Suspense>
);

export const LazyDeveloperTab = () => (
	<Suspense fallback={<TabLoadingFallback />}>
		<div className="space-y-6">
			<PerformanceDashboard />
			<ReactNativeReadinessTest />
		</div>
	</Suspense>
);

export const LazyUsersManagementTab = () => (
	<Suspense fallback={<TabLoadingFallback />}>
		<UsersManagementTab />
	</Suspense>
);

export const LazyLanguagesManagementTab = ({
	onNavigateToTranslations,
}: {
	onNavigateToTranslations?: (languageCode: string) => void;
} = {}) => (
	<Suspense fallback={<TabLoadingFallback />}>
		<LanguagesManagementTab onNavigateToTranslations={onNavigateToTranslations} />
	</Suspense>
);

export const LazyAIAnalyticsTab = () => (
	<Suspense fallback={<TabLoadingFallback />}>
		<AIAnalyticsTab />
	</Suspense>
);

// ============================================
// Preload Functions
// ============================================

export const preloadTabs = {
	pwaOverview: () => import('@/features/admin/pwa/components/PWAOverview'),
	pwaSettings: () => import('@/features/admin/pwa/components/PWASettings'),
	pushNotifications: () => import('@/features/admin/pwa/components/PushNotifications'),
	pwaAnalytics: () => import('@/features/admin/pwa/components/PWAAnalytics'),
	pwaCache: () => import('@/features/admin/pwa/components/PWACache'),
	settings: () => import('@/features/admin/settings/components/SettingsTab'),
	testLab: () => import('@/features/admin/components/TestLab/TestLab'),
	performance: () => import('@/shared/lib/i18n/monitoring/PerformanceDashboard'),
	reactNative: () => import('@/features/admin/components/ReactNativeReadinessTest'),
	users: () => import('../UsersManagementTab'),
	languages: () => import('@/features/admin/settings/components/LanguagesManagementTab'),
	aiAnalytics: () => import('@/features/admin/analytics/components/AIAnalyticsTab'),
};

// ============================================
// Hook для preloading табов при hover
// ============================================

export const useTabPreload = () => {
	const preloadOnHover = (tabType: keyof typeof preloadTabs) => ({
		onMouseEnter: () => preloadTabs[tabType](),
		onFocus: () => preloadTabs[tabType](),
	});

	return { preloadOnHover };
};
