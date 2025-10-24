/**
 * Sentry Integration for Performance Monitoring
 * 
 * Отправляет Web Vitals и custom metrics в Sentry для анализа
 * 
 * @author UNITY Team
 * @date 2025-10-24
 */

import { performanceMonitor, type PerformanceEntry } from './monitoring';
import { addBreadcrumb, captureMessage } from '@/shared/lib/monitoring';

/**
 * Initialize Sentry Performance Integration
 * 
 * Автоматически отправляет все performance metrics в Sentry
 */
export function initSentryPerformanceIntegration(): void {
  if (!import.meta.env.PROD) {
    console.log('ℹ️ [Sentry Performance] Disabled in development');
    return;
  }

  // Subscribe to all performance metrics
  performanceMonitor.addListener((metric: PerformanceEntry) => {
    // Add breadcrumb for all metrics
    addBreadcrumb({
      category: 'performance',
      message: `${metric.name.toUpperCase()}: ${metric.value.toFixed(2)}ms`,
      level: getLogLevel(metric.rating),
      data: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: metric.timestamp,
      },
    });

    // Capture message for poor performance
    if (metric.rating === 'poor') {
      captureMessage(`Poor ${metric.name.toUpperCase()} performance: ${metric.value.toFixed(2)}ms`, {
        level: 'warning',
        tags: {
          metric: metric.name,
          rating: metric.rating,
        },
        contexts: {
          performance: {
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            timestamp: metric.timestamp,
          },
        },
      });
    }
  });

  console.log('✅ [Sentry Performance] Integration initialized');
}

/**
 * Get Sentry log level from performance rating
 */
function getLogLevel(rating: 'good' | 'needs-improvement' | 'poor'): 'info' | 'warning' | 'error' {
  switch (rating) {
    case 'good':
      return 'info';
    case 'needs-improvement':
      return 'warning';
    case 'poor':
      return 'error';
  }
}

/**
 * Report performance summary to Sentry
 * 
 * Отправляет сводку всех метрик в Sentry
 */
export function reportPerformanceSummary(): void {
  if (!import.meta.env.PROD) return;

  const metrics = performanceMonitor.getMetrics();
  
  // Calculate overall score
  const scores = {
    lcp: metrics.lcp ? getScore('lcp', metrics.lcp) : null,
    fid: metrics.fid ? getScore('fid', metrics.fid) : null,
    cls: metrics.cls ? getScore('cls', metrics.cls) : null,
    fcp: metrics.fcp ? getScore('fcp', metrics.fcp) : null,
    ttfb: metrics.ttfb ? getScore('ttfb', metrics.ttfb) : null,
    inp: metrics.inp ? getScore('inp', metrics.inp) : null,
  };

  const validScores = Object.values(scores).filter(s => s !== null) as number[];
  const overallScore = validScores.length > 0
    ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
    : 0;

  // Send summary to Sentry
  captureMessage('Performance Summary', {
    level: overallScore >= 80 ? 'info' : overallScore >= 50 ? 'warning' : 'error',
    tags: {
      overallScore: overallScore.toString(),
    },
    contexts: {
      performance: {
        metrics,
        scores,
        overallScore,
      },
    },
  });
}

/**
 * Get performance score (0-100) for a metric
 */
function getScore(name: string, value: number): number {
  const thresholds: Record<string, { good: number; poor: number }> = {
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    fcp: { good: 1800, poor: 3000 },
    ttfb: { good: 800, poor: 1800 },
    inp: { good: 200, poor: 500 },
  };

  const threshold = thresholds[name];
  if (!threshold) return 50;

  if (value <= threshold.good) {
    // Good: 100-80
    return 100 - Math.round((value / threshold.good) * 20);
  } else if (value <= threshold.poor) {
    // Needs improvement: 80-50
    const range = threshold.poor - threshold.good;
    const position = value - threshold.good;
    return 80 - Math.round((position / range) * 30);
  } else {
    // Poor: 50-0
    const excess = value - threshold.poor;
    const penalty = Math.min(50, Math.round((excess / threshold.poor) * 50));
    return 50 - penalty;
  }
}

