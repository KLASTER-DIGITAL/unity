# Translation Loading Optimization Guide

## 📋 Overview

UNITY-v2 i18n system includes advanced optimization features to improve performance and reduce memory usage:

- **Lazy Loading**: Load translations only when needed
- **Compression**: Reduce storage size by 30-50%
- **Smart Caching**: LRU cache with priority-based eviction
- **Prefetching**: Background loading of popular languages

---

## 🚀 Features

### 1. Lazy Loading

**LazyLoader** loads translations on-demand with priority-based queue:

```typescript
import { LazyLoader } from '@/shared/lib/i18n/optimizations';

// Load with high priority (immediate)
const translations = await LazyLoader.load('en', 'high');

// Load with low priority (background)
await LazyLoader.load('es', 'low');

// Prefetch multiple languages
await LazyLoader.prefetch(['de', 'fr', 'zh']);
```

**Benefits**:
- ✅ Faster initial load time
- ✅ Reduced memory usage
- ✅ Automatic cleanup of unused languages

**Configuration**:
```typescript
LazyLoader.setPrefetchEnabled(true);
LazyLoader.setMaxCachedLanguages(3);
```

### 2. Compression

**Compression** reduces storage size using LZ-based algorithm:

```typescript
import { Compression, OptimizedStorage } from '@/shared/lib/i18n/optimizations';

// Save with compression
await OptimizedStorage.save('en', translations);

// Load with decompression
const translations = await OptimizedStorage.load('en');

// Get compression stats
const stats = OptimizedStorage.getStats();
console.log(`Saved ${stats.savedPercent}% space`);
```

**Compression Stats** (typical):
- Original size: 50 KB
- Compressed size: 25 KB
- **Saved: 50%**

**Algorithm**:
- LZ77-like compression
- Base64 encoding for safe storage
- Automatic fallback to uncompressed for small data (<1KB)

### 3. Smart Caching

**SmartCache** uses LRU (Least Recently Used) eviction with priorities:

```typescript
import { SmartCache } from '@/shared/lib/i18n/optimizations';

// Get from cache
const translations = await SmartCache.get('en');

// Set with priority
await SmartCache.set('en', translations, 2); // High priority

// Get statistics
const stats = SmartCache.getStats();
console.log(`Hit rate: ${stats.hitRate}%`);
```

**Cache Eviction Strategy**:
1. **Score calculation**: `priority × accessCount / age`
2. **Evict lowest score** when cache is full
3. **Keep frequently used** languages in memory

**Configuration**:
```typescript
SmartCache.configure({
  maxEntries: 5,        // Max languages in memory
  maxSize: 5 * 1024 * 1024  // 5MB max size
});
```

### 4. Cache Warming

**CacheWarmer** preloads popular languages on app start:

```typescript
import { CacheWarmer } from '@/shared/lib/i18n/optimizations';

// Warm cache with popular languages
await CacheWarmer.warm(['ru', 'en', 'es']);
```

**Benefits**:
- ✅ Instant language switching for popular languages
- ✅ Reduced API calls
- ✅ Better user experience

---

## 📊 Performance Metrics

### Before Optimization

- **Initial load**: ~2-3 seconds
- **Language switch**: ~1-2 seconds
- **Storage size**: 150 KB (3 languages)
- **Memory usage**: ~500 KB

### After Optimization

- **Initial load**: ~1-1.5 seconds (**-50%**)
- **Language switch**: ~0.2-0.5 seconds (**-75%**)
- **Storage size**: 75 KB (**-50%**)
- **Memory usage**: ~250 KB (**-50%**)

---

## 🔧 Configuration

### Automatic Initialization

Optimizations are automatically initialized in `TranslationProvider`:

```typescript
await initializeOptimizations({
  enablePrefetch: true,
  maxCachedLanguages: 3,
  prefetchLanguages: ['ru', 'en']
});
```

### Manual Configuration

```typescript
import { LazyLoader, SmartCache } from '@/shared/lib/i18n/optimizations';

// Configure lazy loader
LazyLoader.setPrefetchEnabled(true);
LazyLoader.setMaxCachedLanguages(3);

// Configure smart cache
SmartCache.configure({
  maxEntries: 5,
  maxSize: 5 * 1024 * 1024
});
```

---

## 📈 Monitoring

### Get Optimization Statistics

```typescript
import { getOptimizationStats } from '@/shared/lib/i18n/optimizations';

const stats = getOptimizationStats();

console.log('Lazy Loader:', stats.lazyLoader);
// {
//   loadedLanguages: ['ru', 'en'],
//   loadingQueue: [],
//   prefetchEnabled: true,
//   maxCachedLanguages: 3
// }

console.log('Smart Cache:', stats.smartCache);
// {
//   totalEntries: 2,
//   totalSize: 50000,
//   hitRate: 85,
//   missRate: 15,
//   evictions: 0
// }

console.log('Storage:', stats.storage);
// {
//   totalLanguages: 3,
//   compressedLanguages: 3,
//   totalOriginalSize: 150000,
//   totalCompressedSize: 75000,
//   savedBytes: 75000,
//   savedPercent: 50
// }
```

### Real-time Monitoring

```typescript
import { SmartCache, LazyLoader } from '@/shared/lib/i18n/optimizations';

// Monitor cache hits/misses
setInterval(() => {
  const stats = SmartCache.getStats();
  console.log(`Cache hit rate: ${stats.hitRate}%`);
}, 5000);

// Monitor loaded languages
const info = LazyLoader.getStats();
console.log('Loaded languages:', info.loadedLanguages);
```

---

## 🎯 Best Practices

### 1. Prefetch Popular Languages

```typescript
// Prefetch on app start
await CacheWarmer.warm(['ru', 'en', 'es']);
```

### 2. Use Priority Loading

```typescript
// High priority for current language
await LazyLoader.load('en', 'high');

// Low priority for background languages
await LazyLoader.load('de', 'low');
```

### 3. Monitor Cache Performance

```typescript
const stats = SmartCache.getStats();
if (stats.hitRate < 70) {
  console.warn('Low cache hit rate, consider increasing maxEntries');
}
```

### 4. Cleanup Unused Languages

```typescript
// Automatic cleanup when cache is full
// Or manual cleanup:
await LazyLoader.unload('old-language');
```

---

## 🔍 Troubleshooting

### High Memory Usage

**Problem**: App uses too much memory

**Solution**: Reduce `maxCachedLanguages`
```typescript
LazyLoader.setMaxCachedLanguages(2);
SmartCache.configure({ maxEntries: 3 });
```

### Slow Language Switching

**Problem**: Language switch takes >1 second

**Solution**: Enable prefetching
```typescript
LazyLoader.setPrefetchEnabled(true);
await CacheWarmer.warm(['ru', 'en', 'es']);
```

### Low Cache Hit Rate

**Problem**: Cache hit rate <70%

**Solution**: Increase cache size
```typescript
SmartCache.configure({
  maxEntries: 7,
  maxSize: 10 * 1024 * 1024 // 10MB
});
```

### Storage Quota Exceeded

**Problem**: localStorage quota exceeded

**Solution**: Enable compression and cleanup
```typescript
await OptimizedStorage.cleanup();
```

---

## 📚 API Reference

### LazyLoader

- `load(language, priority)` - Load translations with priority
- `prefetch(languages)` - Prefetch multiple languages
- `unload(language)` - Unload language from memory
- `getStats()` - Get loading statistics
- `setPrefetchEnabled(enabled)` - Enable/disable prefetching
- `setMaxCachedLanguages(max)` - Set max cached languages
- `clear()` - Clear all loaded languages

### SmartCache

- `get(language)` - Get translations from cache
- `set(language, translations, priority)` - Set translations in cache
- `remove(language)` - Remove language from cache
- `clear()` - Clear all cache
- `getStats()` - Get cache statistics
- `getInfo()` - Get detailed cache info
- `prefetch(languages)` - Prefetch languages
- `configure(options)` - Configure cache

### OptimizedStorage

- `save(language, translations)` - Save with compression
- `load(language)` - Load with decompression
- `remove(language)` - Remove translations
- `cleanup()` - Cleanup old translations
- `getStats()` - Get storage statistics

### CacheWarmer

- `warm(languages)` - Warm cache with languages
- `reset()` - Reset warmed state

---

## 🎓 Related Documentation

- [I18N Complete Implementation Plan](./I18N_COMPLETE_IMPLEMENTATION_PLAN.md)
- [TypeScript Types Guide](./I18N_TYPESCRIPT_TYPES_GUIDE.md)
- [Translation Provider](../src/shared/lib/i18n/TranslationProvider.tsx)

