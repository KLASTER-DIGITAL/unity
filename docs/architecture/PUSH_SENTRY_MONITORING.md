# Push Notifications Sentry Monitoring

**Дата**: 2025-11-15  
**Версия**: 1.0  
**Статус**: ✅ Реализовано

---

## 🎯 Цель

Мониторинг успешности доставки push уведомлений через Sentry Metrics для быстрого обнаружения проблем при масштабировании до 100,000 пользователей.

---

## 📊 Метрики

### 1. Push Delivery Counter

**Метрика**: `push_notifications` (increment)

**Tags**:
- `status`: sent | delivered | failed | rate_limited
- `campaign_id`: ID кампании или 'unknown'
- `notification_type`: campaign | realtime | scheduled | ai_personalized | unknown
- `channel`: web_push | telegram | email

**Пример**:
```typescript
trackPushDelivery('sent', {
  campaign_id: 'abc123',
  user_count: 100,
  channel: 'web_push',
  notification_type: 'campaign'
});
```

### 2. User Count Gauge

**Метрика**: `push_notifications_user_count` (gauge)

**Tags**:
- `status`: sent | failed | rate_limited
- `campaign_id`: ID кампании

**Пример**:
```typescript
// Автоматически отслеживается при вызове trackPushDelivery
```

### 3. Campaign Delivery Rate

**Метрика**: `push_campaign_delivery_rate` (gauge)

**Значение**: Процент успешно отправленных уведомлений (0-100%)

**Tags**:
- `campaign_id`: ID кампании

**Пример**:
```typescript
trackPushCampaignStats({
  campaign_id: 'abc123',
  total_users: 1000,
  sent: 950,
  failed: 50,
  rate_limited: 50
});
// Delivery rate: 95% (950/1000)
```

### 4. Campaign Metrics

**Метрики**:
- `push_campaign_total_users` (gauge) - всего пользователей
- `push_campaign_sent` (gauge) - успешно отправлено
- `push_campaign_failed` (gauge) - ошибки отправки
- `push_campaign_rate_limited` (gauge) - заблокировано rate limiting

---

## 🏗️ Архитектура

### Frontend (PWA)

**Файл**: `src/shared/lib/monitoring/push-metrics.ts`

**Функции**:
- `trackPushDelivery(status, metadata)` - отслеживание отдельных отправок
- `trackPushCampaignStats(stats)` - сводная статистика кампании

**Интеграция**: Используется в React компонентах для отслеживания клиентских событий

### Edge Functions (Deno)

**Файл**: `supabase/functions/_shared/push-metrics.ts`

**Функции**:
- `trackPushDelivery(status, metadata)` - логирование в Supabase Logs
- `trackPushCampaignStats(stats)` - сводная статистика
- `trackRateLimitEvent(event)` - события rate limiting

**Интеграция**: 
- `unified-notification-sender` - центральная точка отправки
- Логирование в формате `[PUSH-METRIC]` для парсинга

---

## 📈 Мониторинг в Sentry

### Dashboard Setup

1. **Создать Dashboard** в Sentry:
   - Metrics → Dashboards → Create Dashboard
   - Название: "Push Notifications Monitoring"

2. **Добавить виджеты**:

**Widget 1: Delivery Rate (Line Chart)**
```
Metric: push_campaign_delivery_rate
Aggregation: avg
Group by: campaign_id
Time range: Last 7 days
```

**Widget 2: Total Sent vs Failed (Stacked Bar)**
```
Metrics: 
  - push_notifications (status:sent)
  - push_notifications (status:failed)
Aggregation: sum
Time range: Last 24 hours
```

**Widget 3: Rate Limited Users (Number)**
```
Metric: push_notifications
Filter: status:rate_limited
Aggregation: sum
Time range: Last 1 hour
```

**Widget 4: Channel Distribution (Pie Chart)**
```
Metric: push_notifications
Filter: status:sent
Group by: channel
Time range: Last 24 hours
```

### Alerts Setup

**Alert 1: Low Delivery Rate**
```
Condition: push_campaign_delivery_rate < 80%
Severity: Warning
Action: Notify #engineering channel
```

**Alert 2: High Failure Rate**
```
Condition: push_notifications (status:failed) > 100 in 1 hour
Severity: Critical
Action: Page on-call engineer
```

**Alert 3: Rate Limiting Spike**
```
Condition: push_notifications (status:rate_limited) > 50 in 1 hour
Severity: Warning
Action: Notify #engineering channel
```

---

## 🔍 Debugging

### Проверка метрик в Sentry

1. **Metrics Explorer**:
   - Sentry → Metrics → Explorer
   - Выбрать метрику `push_notifications`
   - Фильтровать по tags (status, campaign_id, channel)

2. **Logs в Supabase**:
   - Supabase Dashboard → Edge Functions → Logs
   - Фильтр: `[PUSH-METRIC]`
   - Формат: JSON structured logging

### Примеры запросов

**Все отправки за последний час**:
```
Metric: push_notifications
Filter: status:sent
Time: Last 1 hour
```

**Ошибки конкретной кампании**:
```
Metric: push_notifications
Filter: status:failed AND campaign_id:abc123
Time: Last 24 hours
```

**Rate limited пользователи**:
```
Metric: push_notifications
Filter: status:rate_limited
Group by: campaign_id
Time: Last 7 days
```

---

## 📝 Changelog

### 2025-11-15 - v1.0 (Initial Release)
- ✅ Создан `src/shared/lib/monitoring/push-metrics.ts` для PWA
- ✅ Создан `supabase/functions/_shared/push-metrics.ts` для Edge Functions
- ✅ Интегрировано в `unified-notification-sender`
- ✅ Метрики: delivery counter, user count gauge, campaign stats
- ✅ Документация

