/**
 * Performance utilities for UNITY-v2
 * Includes prefetching, lazy loading helpers, and performance monitoring
 */

export {
	type CustomMetrics,
	PERFORMANCE_THRESHOLDS,
	type PerformanceEntry,
	PerformanceMonitor,
	performanceMonitor,
	reportWebVitals,
	type WebVitalsMetrics,
} from './monitoring';
export {
	createHoverPrefetch,
	prefetchComponent,
	prefetchComponents,
	prefetchOnIdle,
	prefetchOnInteraction,
	prefetchOnVisible,
	RoutePrefetcher,
	routePrefetcher,
	smartPrefetch,
} from './prefetch';

export {
	initSentryPerformanceIntegration,
	reportPerformanceSummary,
} from './sentry-integration';
