# Sentry + Performance Monitoring Integration

**Date:** 2025-10-24  
**Status:** ✅ ACTIVE  
**Version:** 1.0.0

---

## 📊 Overview

Интеграция Performance Monitoring с Sentry для автоматического отслеживания Web Vitals и производительности приложения в production.

**Ключевые возможности:**
- ✅ Автоматический трекинг Core Web Vitals (LCP, FID, CLS, FCP, TTFB, INP)
- ✅ Отправка метрик в Sentry как breadcrumbs
- ✅ Алерты при плохой производительности
- ✅ Performance summary reports
- ✅ Интеграция с Sentry Performance Monitoring

---

## 🏗️ Architecture

### Components

1. **PerformanceMonitor** (`src/shared/lib/performance/monitoring.ts`)
   - Собирает Web Vitals через PerformanceObserver API
   - Оценивает метрики (good/needs-improvement/poor)
   - Уведомляет подписчиков о новых метриках

2. **Sentry Integration** (`src/shared/lib/performance/sentry-integration.ts`)
   - Подписывается на PerformanceMonitor
   - Отправляет метрики в Sentry
   - Создает алерты при плохой производительности

3. **App Integration** (`src/App.tsx`, `src/main.tsx`)
   - Инициализирует мониторинг при старте
   - Интегрирует с Sentry user tracking

---

## 🚀 Usage

### Initialization

Инициализация происходит автоматически в `main.tsx`:

```typescript
import { initSentry } from "@/shared/lib/monitoring";
import { initSentryPerformanceIntegration } from "@/shared/lib/performance";

// Initialize Sentry
initSentry();

// Initialize Sentry Performance Integration
initSentryPerformanceIntegration();
```

### Automatic Tracking

После инициализации все Web Vitals автоматически отслеживаются и отправляются в Sentry:

```typescript
// В App.tsx
useEffect(() => {
  if (import.meta.env.PROD) {
    reportWebVitals((metric) => {
      // Автоматически отправляется в Sentry через integration
      addBreadcrumb({
        category: 'performance',
        message: `${metric.name}: ${metric.value.toFixed(2)}ms`,
        level: metric.rating === 'good' ? 'info' : 
               metric.rating === 'needs-improvement' ? 'warning' : 'error',
        data: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          timestamp: metric.timestamp,
        },
      });
    });
  }
}, []);
```

### Manual Performance Summary

Отправка сводки производительности:

```typescript
import { reportPerformanceSummary } from '@/shared/lib/performance';

// Отправить сводку всех метрик в Sentry
reportPerformanceSummary();
```

---

## 📈 Metrics Tracked

### Core Web Vitals

| Metric | Description | Good | Needs Improvement | Poor |
|--------|-------------|------|-------------------|------|
| **LCP** | Largest Contentful Paint | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** | First Input Delay | ≤ 100ms | 100ms - 300ms | > 300ms |
| **CLS** | Cumulative Layout Shift | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| **FCP** | First Contentful Paint | ≤ 1.8s | 1.8s - 3.0s | > 3.0s |
| **TTFB** | Time to First Byte | ≤ 800ms | 800ms - 1800ms | > 1800ms |
| **INP** | Interaction to Next Paint | ≤ 200ms | 200ms - 500ms | > 500ms |

### Sentry Integration

**Breadcrumbs:**
- Все метрики отправляются как breadcrumbs
- Level зависит от rating: `info` (good), `warning` (needs-improvement), `error` (poor)

**Messages:**
- Автоматические алерты при `rating === 'poor'`
- Performance summary reports

**Contexts:**
- Полная информация о метрике
- Timestamp для анализа трендов

---

## 🔍 Sentry Dashboard

### Viewing Performance Data

1. **Breadcrumbs View:**
   - Sentry → Issues → Select Issue → Breadcrumbs
   - Фильтр по `category: performance`

2. **Performance View:**
   - Sentry → Performance → Web Vitals
   - Автоматические графики LCP, FID, CLS

3. **Alerts:**
   - Sentry → Alerts → Create Alert
   - Условие: `message contains "Poor"`
   - Уведомления при плохой производительности

### Example Breadcrumb

```json
{
  "category": "performance",
  "message": "LCP: 3245.67ms",
  "level": "warning",
  "data": {
    "name": "lcp",
    "value": 3245.67,
    "rating": "needs-improvement",
    "timestamp": 1729785600000
  }
}
```

### Example Alert Message

```
Poor LCP performance: 4567.89ms

Tags:
  metric: lcp
  rating: poor

Context:
  performance:
    name: lcp
    value: 4567.89
    rating: poor
    timestamp: 1729785600000
```

---

## 📊 Performance Scoring

### Score Calculation

Каждая метрика получает score от 0 до 100:

- **100-80:** Good (зеленый)
- **80-50:** Needs Improvement (желтый)
- **50-0:** Poor (красный)

### Overall Score

Overall score = среднее арифметическое всех метрик:

```typescript
const overallScore = (lcpScore + fidScore + clsScore + fcpScore + ttfbScore + inpScore) / 6;
```

### Performance Summary

```typescript
{
  "metrics": {
    "lcp": 2345.67,
    "fid": 89.12,
    "cls": 0.08,
    "fcp": 1567.89,
    "ttfb": 456.78,
    "inp": 123.45
  },
  "scores": {
    "lcp": 85,
    "fid": 92,
    "cls": 95,
    "fcp": 88,
    "ttfb": 90,
    "inp": 94
  },
  "overallScore": 91
}
```

---

## 🎯 Best Practices

### 1. Monitor Trends

- Отслеживайте изменения метрик после деплоя
- Используйте Sentry Performance для графиков
- Настройте алерты на деградацию

### 2. Investigate Poor Performance

При получении алерта:
1. Проверьте Sentry breadcrumbs для контекста
2. Посмотрите Session Replay для воспроизведения
3. Проверьте Network tab в Sentry
4. Анализируйте Flame Graph в Performance

### 3. Optimize Based on Data

- LCP > 4s → оптимизируйте загрузку изображений
- FID > 300ms → уменьшите JavaScript execution time
- CLS > 0.25 → фиксируйте размеры элементов
- TTFB > 1800ms → оптимизируйте backend/CDN

### 4. Set Up Alerts

Рекомендуемые алерты в Sentry:

```yaml
Alert 1: Poor LCP
  Condition: message contains "Poor LCP"
  Threshold: > 5 events in 1 hour
  Action: Email + Slack

Alert 2: Overall Score < 50
  Condition: message contains "Performance Summary" AND overallScore < 50
  Threshold: > 1 event in 1 hour
  Action: Email + Slack

Alert 3: Multiple Poor Metrics
  Condition: message contains "Poor" AND category = "performance"
  Threshold: > 10 events in 1 hour
  Action: Email + Slack + PagerDuty
```

---

## 🔧 Configuration

### Environment Variables

```env
# Sentry DSN (required for production)
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# App version for release tracking
VITE_APP_VERSION=2.0.0
```

### Sentry Settings

В `src/shared/lib/monitoring/sentry.ts`:

```typescript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 0.3, // 30% транзакций
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% обычных сессий
  replaysOnErrorSampleRate: 1.0, // 100% сессий с ошибками
  
  // Profiling
  profilesSampleRate: 0.3, // 30% профилирования
});
```

---

## 📝 Troubleshooting

### Metrics Not Appearing in Sentry

1. **Check Sentry DSN:**
   ```bash
   echo $VITE_SENTRY_DSN
   ```

2. **Check Production Mode:**
   ```typescript
   console.log(import.meta.env.PROD); // должно быть true
   ```

3. **Check Browser Console:**
   ```
   ✅ [Sentry] Инициализирован для production
   ✅ [Sentry Performance] Integration initialized
   ```

### Performance Observer Not Supported

Некоторые браузеры не поддерживают PerformanceObserver API:

```typescript
// Автоматически обрабатывается в monitoring.ts
try {
  const observer = new PerformanceObserver(...);
} catch (error) {
  console.warn('Performance observation not supported:', error);
}
```

### Too Many Breadcrumbs

Если слишком много breadcrumbs, настройте фильтрацию:

```typescript
// В sentry-integration.ts
if (metric.rating === 'good') {
  // Не отправляем good metrics как breadcrumbs
  return;
}
```

---

## 🎉 Benefits

1. **Proactive Monitoring:** Узнавайте о проблемах до пользователей
2. **Data-Driven Optimization:** Оптимизируйте на основе реальных данных
3. **User Experience:** Улучшайте UX через мониторинг производительности
4. **Trend Analysis:** Отслеживайте изменения после деплоев
5. **Alerting:** Автоматические уведомления при деградации

---

## 📚 Related Documentation

- [Performance Monitoring](./MONITORING_AND_SCALING_STRATEGY.md)
- [Sentry Setup](../guides/SENTRY_ALERTS_SETUP.md)
- [Database Optimization](./DATABASE_OPTIMIZATION_100K.md)
- [Phase P2 Completion Report](./PHASE_P2_COMPLETION_REPORT.md)

---

**Status:** ✅ Active in Production  
**Last Updated:** 2025-10-24

