/**
 * Performance Dashboard Component
 * 
 * Admin panel component for monitoring Web Vitals and performance metrics
 * 
 * @author UNITY Team
 * @date 2025-10-24
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Activity, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { performanceMonitor, type PerformanceEntry } from '@/shared/lib/performance';

interface MetricData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface MetricStats {
  current: number;
  average: number;
  min: number;
  max: number;
  trend: 'up' | 'down' | 'stable';
}

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<Map<string, MetricData[]>>(new Map());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    // Subscribe to performance metrics
    const unsubscribe = performanceMonitor.addListener((metric: PerformanceEntry) => {
      setMetrics(prev => {
        const newMetrics = new Map(prev);
        const metricHistory = newMetrics.get(metric.name) || [];
        
        // Keep last 50 entries
        const updatedHistory = [...metricHistory, {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          timestamp: metric.timestamp
        }].slice(-50);
        
        newMetrics.set(metric.name, updatedHistory);
        return newMetrics;
      });
      
      setLastUpdate(new Date());
    });

    setIsMonitoring(true);

    return () => {
      unsubscribe();
      setIsMonitoring(false);
    };
  }, []);

  const calculateStats = (metricName: string): MetricStats | null => {
    const history = metrics.get(metricName);
    if (!history || history.length === 0) return null;

    const values = history.map(m => m.value);
    const current = values[values.length - 1];
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate trend (last 10 vs previous 10)
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (values.length >= 20) {
      const recent = values.slice(-10).reduce((a, b) => a + b, 0) / 10;
      const previous = values.slice(-20, -10).reduce((a, b) => a + b, 0) / 10;
      const change = ((recent - previous) / previous) * 100;
      
      if (change > 5) trend = 'up';
      else if (change < -5) trend = 'down';
    }

    return { current, average, min, max, trend };
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRatingEmoji = (rating: string) => {
    switch (rating) {
      case 'good': return '✅';
      case 'needs-improvement': return '⚠️';
      case 'poor': return '❌';
      default: return '❓';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'cls') return value.toFixed(3);
    return `${value.toFixed(0)}ms`;
  };

  const getMetricThreshold = (name: string): { good: number; poor: number } => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 },
      inp: { good: 200, poor: 500 },
    };
    return thresholds[name] || { good: 0, poor: 0 };
  };

  const metricNames = ['lcp', 'fid', 'cls', 'fcp', 'ttfb', 'inp'];
  const metricLabels: Record<string, string> = {
    lcp: 'Largest Contentful Paint',
    fid: 'First Input Delay',
    cls: 'Cumulative Layout Shift',
    fcp: 'First Contentful Paint',
    ttfb: 'Time to First Byte',
    inp: 'Interaction to Next Paint',
  };

  const clearMetrics = () => {
    setMetrics(new Map());
    setLastUpdate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Performance Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Real-time Web Vitals monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {lastUpdate && (
            <div className="text-sm text-gray-600">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {isMonitoring ? 'Monitoring' : 'Stopped'}
            </span>
          </div>

          <Button
            onClick={clearMetrics}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricNames.map(metricName => {
          const history = metrics.get(metricName);
          const stats = calculateStats(metricName);
          const latestMetric = history?.[history.length - 1];
          const threshold = getMetricThreshold(metricName);

          return (
            <Card key={metricName} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 uppercase">
                  {metricLabels[metricName]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats ? (
                  <div className="space-y-3">
                    {/* Current Value */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold">
                          {formatValue(metricName, stats.current)}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Current
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`px-3 py-1 rounded-full border ${getRatingColor(latestMetric?.rating || 'good')}`}>
                          <span className="text-sm font-medium">
                            {getRatingEmoji(latestMetric?.rating || 'good')} {latestMetric?.rating}
                          </span>
                        </div>
                        {getTrendIcon(stats.trend)}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                      <div>
                        <div className="text-xs text-gray-500">Avg</div>
                        <div className="text-sm font-semibold">
                          {formatValue(metricName, stats.average)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Min</div>
                        <div className="text-sm font-semibold text-green-600">
                          {formatValue(metricName, stats.min)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Max</div>
                        <div className="text-sm font-semibold text-red-600">
                          {formatValue(metricName, stats.max)}
                        </div>
                      </div>
                    </div>

                    {/* Threshold Indicator */}
                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Good: {formatValue(metricName, threshold.good)}</span>
                        <span>Poor: {formatValue(metricName, threshold.poor)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            stats.current <= threshold.good ? 'bg-green-500' :
                            stats.current <= threshold.poor ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min((stats.current / threshold.poor) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Sample Count */}
                    <div className="text-xs text-gray-500 text-center pt-2 border-t">
                      {history?.length || 0} samples collected
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Waiting for data...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      {metrics.size === 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-600">ℹ️</div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  How to collect metrics
                </h3>
                <p className="text-sm text-blue-800">
                  Navigate through the application to collect Web Vitals metrics. 
                  Metrics are automatically tracked and displayed here in real-time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

