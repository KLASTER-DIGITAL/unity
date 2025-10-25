/**
 * Performance Dashboard for i18n System
 * 
 * Visual dashboard for monitoring i18n performance metrics
 */

import { useState, useEffect } from 'react';
import { PerformanceMonitor, type PerformanceStats } from './PerformanceMonitor';
import { Activity, Zap, AlertCircle, TrendingUp, Download } from 'lucide-react';

export function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Update stats
  const updateStats = () => {
    const currentStats = PerformanceMonitor.getStats();
    setStats(currentStats);
  };

  // Auto-refresh every 2 seconds
  useEffect(() => {
    updateStats();
    
    if (autoRefresh) {
      const interval = setInterval(updateStats, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Export metrics
  const handleExport = () => {
    const data = PerformanceMonitor.export();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `i18n-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear metrics
  const handleClear = () => {
    if (confirm('Clear all performance metrics?')) {
      PerformanceMonitor.clear();
      updateStats();
    }
  };

  if (!stats) {
    return <div className="p-6">Loading metrics...</div>;
  }

  const getHealthStatus = () => {
    if (stats.errors > 10) return { color: 'red', label: 'Critical' };
    if (stats.cacheHitRate < 0.7) return { color: 'yellow', label: 'Warning' };
    if (stats.averageLookupTime > 10) return { color: 'yellow', label: 'Warning' };
    return { color: 'green', label: 'Healthy' };
  };

  const health = getHealthStatus();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">i18n Performance Dashboard</h1>
            <p className="text-gray-600">Real-time monitoring of translation system</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                health.color === 'green' ? 'bg-green-100 text-green-800' :
                health.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {health.label}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-semibold ${
              autoRefresh 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </button>
          
          <button
            onClick={updateStats}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
          >
            Refresh Now
          </button>
          
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Translation Lookups */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Translation Lookups</h3>
          </div>
          <p className="text-3xl font-bold">{stats.translationLookups}</p>
          <p className="text-sm text-gray-600 mt-1">
            {stats.translationMisses} misses
          </p>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold">Cache Hit Rate</h3>
          </div>
          <p className="text-3xl font-bold">
            {(stats.cacheHitRate * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {stats.cacheHits} hits / {stats.cacheMisses} misses
          </p>
        </div>

        {/* Average Lookup Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Avg Lookup Time</h3>
          </div>
          <p className="text-3xl font-bold">
            {stats.averageLookupTime.toFixed(2)}ms
          </p>
          <p className="text-sm text-gray-600 mt-1">
            P95: {stats.p95.toFixed(2)}ms
          </p>
        </div>

        {/* Errors */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold">Errors</h3>
          </div>
          <p className="text-3xl font-bold">{stats.errors}</p>
          <p className="text-sm text-gray-600 mt-1 truncate">
            {stats.lastError || 'No errors'}
          </p>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Translation Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Translation Metrics</h2>
          <div className="space-y-3">
            <MetricRow label="Total Lookups" value={stats.translationLookups} />
            <MetricRow label="Misses" value={stats.translationMisses} />
            <MetricRow label="Average Time" value={`${stats.averageLookupTime.toFixed(2)}ms`} />
            <MetricRow label="P50 (Median)" value={`${stats.p50.toFixed(2)}ms`} />
            <MetricRow label="P95" value={`${stats.p95.toFixed(2)}ms`} />
            <MetricRow label="P99" value={`${stats.p99.toFixed(2)}ms`} />
          </div>
        </div>

        {/* Cache Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Cache Metrics</h2>
          <div className="space-y-3">
            <MetricRow label="Cache Hits" value={stats.cacheHits} />
            <MetricRow label="Cache Misses" value={stats.cacheMisses} />
            <MetricRow label="Hit Rate" value={`${(stats.cacheHitRate * 100).toFixed(1)}%`} />
            <MetricRow label="Cache Size" value={stats.cacheSize} />
            
            {/* Progress bar */}
            <div className="pt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Hit Rate</span>
                <span>{(stats.cacheHitRate * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stats.cacheHitRate >= 0.8 ? 'bg-green-600' :
                    stats.cacheHitRate >= 0.6 ? 'bg-yellow-600' :
                    'bg-red-600'
                  }`}
                  style={{ width: `${stats.cacheHitRate * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Loading Metrics</h2>
          <div className="space-y-3">
            <MetricRow label="Language Loads" value={stats.languageLoads} />
            <MetricRow label="Average Load Time" value={`${stats.averageLoadTime.toFixed(2)}ms`} />
            <MetricRow label="Total Load Time" value={`${stats.totalLoadTime.toFixed(2)}ms`} />
          </div>
        </div>

        {/* Memory Metrics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Memory Metrics</h2>
          <div className="space-y-3">
            <MetricRow label="Current Usage" value={formatBytes(stats.memoryUsage)} />
            <MetricRow label="Estimated Size" value={formatBytes(stats.estimatedSize)} />
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Recommendations</h2>
        <div className="space-y-2">
          {stats.cacheHitRate < 0.7 && (
            <Recommendation
              type="warning"
              message="Cache hit rate is below 70%. Consider prefetching popular languages."
            />
          )}
          {stats.averageLookupTime > 10 && (
            <Recommendation
              type="warning"
              message="Average lookup time is above 10ms. Check for performance bottlenecks."
            />
          )}
          {stats.errors > 0 && (
            <Recommendation
              type="error"
              message={`${stats.errors} errors detected. Last error: ${stats.lastError}`}
            />
          )}
          {stats.cacheHitRate >= 0.8 && stats.averageLookupTime <= 5 && stats.errors === 0 && (
            <Recommendation
              type="success"
              message="All metrics are healthy! System is performing optimally."
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components

function MetricRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-b-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Recommendation({ type, message }: { type: 'success' | 'warning' | 'error'; message: string }) {
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[type]}`}>
      <p className="text-sm">{message}</p>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

