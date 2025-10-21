/**
 * Performance Monitor for i18n System
 * 
 * Collects and analyzes performance metrics for translation system
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface PerformanceStats {
  // Translation metrics
  translationLookups: number;
  translationMisses: number;
  averageLookupTime: number;
  
  // Cache metrics
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number;
  cacheSize: number;
  
  // Loading metrics
  languageLoads: number;
  averageLoadTime: number;
  totalLoadTime: number;
  
  // Memory metrics
  memoryUsage: number;
  estimatedSize: number;
  
  // Error metrics
  errors: number;
  lastError?: string;
  
  // Timing metrics
  p50: number;  // 50th percentile
  p95: number;  // 95th percentile
  p99: number;  // 99th percentile
}

class PerformanceMonitorClass {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics
  
  // Counters
  private translationLookups = 0;
  private translationMisses = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private languageLoads = 0;
  private errors = 0;
  private lastError?: string;
  
  // Timing arrays for percentile calculation
  private lookupTimes: number[] = [];
  private loadTimes: number[] = [];
  
  /**
   * Record a translation lookup
   */
  recordLookup(key: string, found: boolean, duration: number): void {
    this.translationLookups++;
    if (!found) {
      this.translationMisses++;
    }
    
    this.lookupTimes.push(duration);
    if (this.lookupTimes.length > this.maxMetrics) {
      this.lookupTimes.shift();
    }
    
    this.addMetric({
      name: 'translation_lookup',
      value: duration,
      timestamp: Date.now(),
      metadata: { key, found }
    });
  }
  
  /**
   * Record a cache hit or miss
   */
  recordCache(hit: boolean, duration: number): void {
    if (hit) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }
    
    this.addMetric({
      name: 'cache_access',
      value: duration,
      timestamp: Date.now(),
      metadata: { hit }
    });
  }
  
  /**
   * Record a language load
   */
  recordLanguageLoad(language: string, duration: number, success: boolean): void {
    this.languageLoads++;
    
    this.loadTimes.push(duration);
    if (this.loadTimes.length > this.maxMetrics) {
      this.loadTimes.shift();
    }
    
    this.addMetric({
      name: 'language_load',
      value: duration,
      timestamp: Date.now(),
      metadata: { language, success }
    });
  }
  
  /**
   * Record an error
   */
  recordError(error: Error, context?: string): void {
    this.errors++;
    this.lastError = error.message;
    
    this.addMetric({
      name: 'error',
      value: 1,
      timestamp: Date.now(),
      metadata: { message: error.message, context }
    });
    
    console.error('📊 i18n Performance Error:', error, context);
  }
  
  /**
   * Record memory usage
   */
  recordMemory(bytes: number): void {
    this.addMetric({
      name: 'memory_usage',
      value: bytes,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get current performance statistics
   */
  getStats(): PerformanceStats {
    const cacheTotal = this.cacheHits + this.cacheMisses;
    const cacheHitRate = cacheTotal > 0 ? this.cacheHits / cacheTotal : 0;
    
    const avgLookupTime = this.calculateAverage(this.lookupTimes);
    const avgLoadTime = this.calculateAverage(this.loadTimes);
    const totalLoadTime = this.loadTimes.reduce((sum, time) => sum + time, 0);
    
    // Calculate percentiles
    const sortedLookupTimes = [...this.lookupTimes].sort((a, b) => a - b);
    const p50 = this.calculatePercentile(sortedLookupTimes, 50);
    const p95 = this.calculatePercentile(sortedLookupTimes, 95);
    const p99 = this.calculatePercentile(sortedLookupTimes, 99);
    
    // Estimate memory usage
    const memoryMetrics = this.metrics.filter(m => m.name === 'memory_usage');
    const latestMemory = memoryMetrics.length > 0 
      ? memoryMetrics[memoryMetrics.length - 1].value 
      : 0;
    
    return {
      translationLookups: this.translationLookups,
      translationMisses: this.translationMisses,
      averageLookupTime: avgLookupTime,
      
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      cacheHitRate: cacheHitRate,
      cacheSize: cacheTotal,
      
      languageLoads: this.languageLoads,
      averageLoadTime: avgLoadTime,
      totalLoadTime: totalLoadTime,
      
      memoryUsage: latestMemory,
      estimatedSize: this.estimateSize(),
      
      errors: this.errors,
      lastError: this.lastError,
      
      p50,
      p95,
      p99
    };
  }
  
  /**
   * Get metrics for a specific time range
   */
  getMetrics(startTime?: number, endTime?: number): PerformanceMetric[] {
    let filtered = this.metrics;
    
    if (startTime) {
      filtered = filtered.filter(m => m.timestamp >= startTime);
    }
    
    if (endTime) {
      filtered = filtered.filter(m => m.timestamp <= endTime);
    }
    
    return filtered;
  }
  
  /**
   * Get metrics by name
   */
  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name);
  }
  
  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.translationLookups = 0;
    this.translationMisses = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.languageLoads = 0;
    this.errors = 0;
    this.lastError = undefined;
    this.lookupTimes = [];
    this.loadTimes = [];
    
    console.log('📊 Performance metrics cleared');
  }
  
  /**
   * Export metrics as JSON
   */
  export(): string {
    return JSON.stringify({
      stats: this.getStats(),
      metrics: this.metrics
    }, null, 2);
  }
  
  /**
   * Get performance report
   */
  getReport(): string {
    const stats = this.getStats();
    
    return `
📊 i18n Performance Report
========================

Translation Metrics:
- Total Lookups: ${stats.translationLookups}
- Misses: ${stats.translationMisses}
- Average Lookup Time: ${stats.averageLookupTime.toFixed(2)}ms
- P50: ${stats.p50.toFixed(2)}ms
- P95: ${stats.p95.toFixed(2)}ms
- P99: ${stats.p99.toFixed(2)}ms

Cache Metrics:
- Hits: ${stats.cacheHits}
- Misses: ${stats.cacheMisses}
- Hit Rate: ${(stats.cacheHitRate * 100).toFixed(1)}%
- Cache Size: ${stats.cacheSize}

Loading Metrics:
- Language Loads: ${stats.languageLoads}
- Average Load Time: ${stats.averageLoadTime.toFixed(2)}ms
- Total Load Time: ${stats.totalLoadTime.toFixed(2)}ms

Memory Metrics:
- Current Usage: ${this.formatBytes(stats.memoryUsage)}
- Estimated Size: ${this.formatBytes(stats.estimatedSize)}

Error Metrics:
- Total Errors: ${stats.errors}
- Last Error: ${stats.lastError || 'None'}
    `.trim();
  }
  
  // Private helper methods
  
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }
  
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }
  
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)] || 0;
  }
  
  private estimateSize(): number {
    // Rough estimate of memory usage
    const metricsSize = this.metrics.length * 100; // ~100 bytes per metric
    const timingsSize = (this.lookupTimes.length + this.loadTimes.length) * 8; // 8 bytes per number
    return metricsSize + timingsSize;
  }
  
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  }
}

// Singleton instance
export const PerformanceMonitor = new PerformanceMonitorClass();

