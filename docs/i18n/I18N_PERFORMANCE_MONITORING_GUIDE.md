# i18n Performance Monitoring Guide

Complete guide for monitoring and optimizing i18n system performance.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Performance Dashboard](#performance-dashboard)
3. [Metrics Collected](#metrics-collected)
4. [Using the Monitor](#using-the-monitor)
5. [Performance Targets](#performance-targets)
6. [Optimization Tips](#optimization-tips)
7. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

The i18n system includes comprehensive performance monitoring to track:
- Translation lookup times
- Cache hit rates
- Language loading times
- Memory usage
- Error rates

### Access the Dashboard

Navigate to: **http://localhost:3001/?view=performance**

---

## 📊 Performance Dashboard

### Features

- **Real-time Metrics** - Auto-refresh every 2 seconds
- **Key Performance Indicators** - Translation lookups, cache hit rate, avg lookup time, errors
- **Detailed Metrics** - Translation, cache, loading, and memory metrics
- **Health Status** - Visual indicator (Healthy/Warning/Critical)
- **Export Functionality** - Download metrics as JSON
- **Recommendations** - Automated performance suggestions

### Dashboard Sections

#### 1. Key Metrics Cards

| Metric | Description | Target |
|--------|-------------|--------|
| Translation Lookups | Total number of translation requests | N/A |
| Cache Hit Rate | Percentage of cache hits | > 80% |
| Avg Lookup Time | Average time to lookup translation | < 5ms |
| Errors | Total errors encountered | 0 |

#### 2. Detailed Metrics

**Translation Metrics**:
- Total Lookups
- Misses
- Average Time
- P50 (Median)
- P95 (95th percentile)
- P99 (99th percentile)

**Cache Metrics**:
- Cache Hits
- Cache Misses
- Hit Rate (with progress bar)
- Cache Size

**Loading Metrics**:
- Language Loads
- Average Load Time
- Total Load Time

**Memory Metrics**:
- Current Usage
- Estimated Size

#### 3. Recommendations

Automated suggestions based on current metrics:
- ⚠️ Cache hit rate below 70% → Prefetch popular languages
- ⚠️ Average lookup time above 10ms → Check for bottlenecks
- ❌ Errors detected → Review error logs
- ✅ All metrics healthy → System performing optimally

---

## 📈 Metrics Collected

### Translation Metrics

```typescript
interface TranslationMetrics {
  translationLookups: number;      // Total lookups
  translationMisses: number;       // Failed lookups
  averageLookupTime: number;       // Average time in ms
  p50: number;                     // 50th percentile
  p95: number;                     // 95th percentile
  p99: number;                     // 99th percentile
}
```

### Cache Metrics

```typescript
interface CacheMetrics {
  cacheHits: number;               // Successful cache hits
  cacheMisses: number;             // Cache misses
  cacheHitRate: number;            // Hit rate (0-1)
  cacheSize: number;               // Total cache entries
}
```

### Loading Metrics

```typescript
interface LoadingMetrics {
  languageLoads: number;           // Total language loads
  averageLoadTime: number;         // Average load time in ms
  totalLoadTime: number;           // Total time spent loading
}
```

### Memory Metrics

```typescript
interface MemoryMetrics {
  memoryUsage: number;             // Current memory usage in bytes
  estimatedSize: number;           // Estimated total size
}
```

---

## 🔧 Using the Monitor

### Programmatic Access

```typescript
import { PerformanceMonitor } from '@/shared/lib/i18n/monitoring';

// Get current stats
const stats = PerformanceMonitor.getStats();
console.log('Cache Hit Rate:', stats.cacheHitRate);

// Get metrics for last hour
const oneHourAgo = Date.now() - 60 * 60 * 1000;
const metrics = PerformanceMonitor.getMetrics(oneHourAgo);

// Get specific metric type
const lookupMetrics = PerformanceMonitor.getMetricsByName('translation_lookup');

// Export metrics
const json = PerformanceMonitor.export();

// Get text report
const report = PerformanceMonitor.getReport();
console.log(report);

// Clear metrics
PerformanceMonitor.clear();
```

### Recording Custom Metrics

```typescript
// Record translation lookup
PerformanceMonitor.recordLookup('welcome.title', true, 2.5);

// Record cache access
PerformanceMonitor.recordCache(true, 0.5);

// Record language load
PerformanceMonitor.recordLanguageLoad('es', 450, true);

// Record error
PerformanceMonitor.recordError(new Error('Failed to load'), 'TranslationLoader');

// Record memory usage
PerformanceMonitor.recordMemory(256000);
```

---

## 🎯 Performance Targets

### Excellent Performance

| Metric | Target | Status |
|--------|--------|--------|
| Cache Hit Rate | > 85% | ✅ Excellent |
| Avg Lookup Time | < 3ms | ✅ Excellent |
| P95 Lookup Time | < 5ms | ✅ Excellent |
| P99 Lookup Time | < 10ms | ✅ Excellent |
| Language Load Time | < 500ms | ✅ Excellent |
| Memory Usage | < 300KB | ✅ Excellent |
| Errors | 0 | ✅ Excellent |

### Good Performance

| Metric | Target | Status |
|--------|--------|--------|
| Cache Hit Rate | 70-85% | ✅ Good |
| Avg Lookup Time | 3-5ms | ✅ Good |
| P95 Lookup Time | 5-10ms | ✅ Good |
| P99 Lookup Time | 10-20ms | ✅ Good |
| Language Load Time | 500-1000ms | ✅ Good |
| Memory Usage | 300-500KB | ✅ Good |
| Errors | 1-5 | ⚠️ Warning |

### Poor Performance

| Metric | Target | Status |
|--------|--------|--------|
| Cache Hit Rate | < 70% | ⚠️ Warning |
| Avg Lookup Time | > 5ms | ⚠️ Warning |
| P95 Lookup Time | > 10ms | ⚠️ Warning |
| P99 Lookup Time | > 20ms | ⚠️ Warning |
| Language Load Time | > 1000ms | ⚠️ Warning |
| Memory Usage | > 500KB | ⚠️ Warning |
| Errors | > 5 | ❌ Critical |

---

## 💡 Optimization Tips

### 1. Improve Cache Hit Rate

**Problem**: Cache hit rate below 70%

**Solutions**:
```typescript
// Prefetch popular languages on app load
useEffect(() => {
  TranslationLoader.prefetchLanguages(['en', 'es', 'de']);
}, []);

// Increase cache size
SmartCache.setMaxSize(5); // Keep 5 languages in cache
```

### 2. Reduce Lookup Time

**Problem**: Average lookup time above 5ms

**Solutions**:
- Use memoization for frequently accessed translations
- Reduce translation key complexity
- Optimize cache data structure

### 3. Optimize Language Loading

**Problem**: Language load time above 1 second

**Solutions**:
```typescript
// Use compression
import { Compression } from '@/shared/lib/i18n/optimizations';

// Compress translations before storing
const compressed = Compression.compress(translations);

// Lazy load only needed translations
LazyLoader.load('es', 'high'); // High priority
```

### 4. Reduce Memory Usage

**Problem**: Memory usage above 500KB

**Solutions**:
- Limit number of cached languages
- Clear unused language data
- Use compression for stored translations

```typescript
// Unload unused languages
LazyLoader.unload('old-language');

// Clear cache periodically
TranslationCacheManager.clearCache();
```

---

## 🔍 Troubleshooting

### High Error Rate

**Symptoms**: Errors > 5

**Diagnosis**:
```typescript
const stats = PerformanceMonitor.getStats();
console.log('Last Error:', stats.lastError);

const errorMetrics = PerformanceMonitor.getMetricsByName('error');
console.log('Error History:', errorMetrics);
```

**Solutions**:
- Check network connectivity
- Verify Supabase connection
- Review error logs
- Check translation key validity

### Low Cache Hit Rate

**Symptoms**: Cache hit rate < 70%

**Diagnosis**:
```typescript
const stats = PerformanceMonitor.getStats();
console.log('Cache Hits:', stats.cacheHits);
console.log('Cache Misses:', stats.cacheMisses);
```

**Solutions**:
- Prefetch popular languages
- Increase cache size
- Review cache eviction policy

### Slow Lookup Times

**Symptoms**: Average lookup time > 5ms

**Diagnosis**:
```typescript
const lookupMetrics = PerformanceMonitor.getMetricsByName('translation_lookup');
const slowLookups = lookupMetrics.filter(m => m.value > 10);
console.log('Slow Lookups:', slowLookups);
```

**Solutions**:
- Optimize cache data structure
- Reduce translation key complexity
- Use memoization

### High Memory Usage

**Symptoms**: Memory usage > 500KB

**Diagnosis**:
```typescript
const stats = PerformanceMonitor.getStats();
console.log('Memory Usage:', stats.memoryUsage);
console.log('Estimated Size:', stats.estimatedSize);
```

**Solutions**:
- Limit cached languages
- Clear unused data
- Enable compression

---

## 📊 Example Report

```
📊 i18n Performance Report
========================

Translation Metrics:
- Total Lookups: 1,234
- Misses: 12
- Average Lookup Time: 2.45ms
- P50: 1.80ms
- P95: 4.20ms
- P99: 8.50ms

Cache Metrics:
- Hits: 1,050
- Misses: 184
- Hit Rate: 85.1%
- Cache Size: 1,234

Loading Metrics:
- Language Loads: 3
- Average Load Time: 450.00ms
- Total Load Time: 1,350.00ms

Memory Metrics:
- Current Usage: 245.50 KB
- Estimated Size: 12.34 KB

Error Metrics:
- Total Errors: 0
- Last Error: None
```

---

## 📚 Related Documentation

- [System Documentation](./I18N_SYSTEM_DOCUMENTATION.md)
- [Optimization Guide](./I18N_OPTIMIZATION_GUIDE.md)
- [E2E Test Results](./I18N_E2E_TEST_RESULTS.md)

---

**Performance monitoring is essential for maintaining optimal i18n system performance!** 📊

