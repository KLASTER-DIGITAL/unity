/**
 * Performance utilities for UNITY-v2
 * Includes prefetching, lazy loading helpers, and performance monitoring
 */

export {
  prefetchComponent,
  prefetchComponents,
  createHoverPrefetch,
  prefetchOnIdle,
  prefetchOnInteraction,
  prefetchOnVisible,
  smartPrefetch,
  RoutePrefetcher,
  routePrefetcher,
} from './prefetch';

export {
  PerformanceMonitor,
  performanceMonitor,
  reportWebVitals,
  PERFORMANCE_THRESHOLDS,
  type WebVitalsMetrics,
  type CustomMetrics,
  type PerformanceEntry
} from './monitoring';

export {
  initSentryPerformanceIntegration,
  reportPerformanceSummary
} from './sentry-integration';

