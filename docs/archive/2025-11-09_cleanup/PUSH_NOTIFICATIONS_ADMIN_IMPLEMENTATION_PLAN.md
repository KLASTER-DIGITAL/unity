# 🚀 Push Notifications + Admin Panel - Implementation Plan

**Дата**: 2025-11-09  
**Версия**: 2.0 (Extended with Admin Features)  
**Статус**: Ready for Implementation

---

## 📊 EXECUTIVE SUMMARY

### Цель
Реализовать полноценную систему push-уведомлений с админ-панелью для супер-админа, которая будет **лучше чем SendPulse** по функционалу и UX.

### Ключевые компоненты
1. **Для пользователей**: Простой интерфейс настройки уведомлений (iOS Design System)
2. **Для супер-админа**: Мощная панель управления рассылками с сегментацией и аналитикой
3. **Backend**: Edge Functions для отправки, планирования, аналитики
4. **React Native**: Platform Adapters для полной совместимости

### Время реализации
- **Фаза 1-2** (Пользовательский интерфейс): 4 дня
- **Фаза 3** (React Native адаптация): 3 дня
- **Фаза 4** (Админ-панель + Аналитика): 5-7 дней
- **ИТОГО**: 12-14 дней

### ROI
- Экономия: $2,328/год vs SendPulse
- Полный контроль над функционалом
- React Native готовность
- Интеграция с i18n (7 языков)

---

## 🎯 ПРИОРИТИЗАЦИЯ ЗАДАЧ

### 🔴 КРИТИЧНО (Неделя 1: Дни 1-4)
**Цель**: Базовый функционал для пользователей

1. **Миграция БД** (День 1)
   - Добавить поля в profiles
   - Создать push_notification_analytics
   - Создать push_campaigns (для админ-рассылок)
   - Создать push_campaign_segments (для сегментации)

2. **Модальное окно онбординга** (День 2)
   - PushNotificationOnboardingModal
   - Интеграция в MobileApp
   - i18n ключи (7 языков)

3. **Настройки уведомлений** (День 3)
   - NotificationTimeSelector (iOS-style)
   - NotificationTypeToggles
   - Auto-save с debounce

4. **Тестирование PWA** (День 4)
   - Проверка всех сценариев
   - 0 errors в консоли
   - Supabase Advisors check

### 🟡 ВАЖНО (Неделя 2: Дни 5-7)
**Цель**: React Native готовность

5. **Platform Adapter** (День 5)
   - push-notifications.web.ts
   - push-notifications.native.ts
   - Expo Notifications интеграция

6. **Universal Components** (День 6)
   - UniversalPushNotificationModal (.web + .native)
   - UniversalNotificationTimeSelector (.web + .native)

7. **Тестирование React Native** (День 7)
   - Expo Go тестирование
   - Визуальная консистентность
   - Функциональная консистентность

### 🟢 РАСШИРЕНИЕ (Неделя 3: Дни 8-14)
**Цель**: Админ-панель для супер-админа

8. **Backend для рассылок** (Дни 8-9)
   - Edge Function: push-campaign-api
   - Edge Function: push-segmentation-api
   - Cron Jobs для планирования

9. **Админ UI - Создание рассылок** (Дни 10-11)
   - CampaignCreator компонент
   - SegmentBuilder компонент
   - TemplateEditor компонент

10. **Админ UI - Аналитика** (Дни 12-13)
    - CampaignAnalytics компонент
    - Real-time статистика (Supabase Realtime)
    - Charts и графики

11. **Финальное тестирование** (День 14)
    - Полное тестирование всех сценариев
    - Документация
    - Деплой

---

## 📁 СТРУКТУРА ФАЙЛОВ

### Новые файлы (35+ файлов)

```
src/
├── features/mobile/
│   ├── auth/components/onboarding/
│   │   └── PushNotificationOnboardingModal.tsx (NEW)
│   │
│   └── settings/components/
│       ├── NotificationSettingsPanel.tsx (NEW)
│       ├── NotificationTimeSelector.tsx (NEW)
│       └── NotificationTypeToggles.tsx (NEW)
│
├── features/admin/
│   └── push-notifications/
│       ├── components/
│       │   ├── CampaignCreator.tsx (NEW)
│       │   ├── SegmentBuilder.tsx (NEW)
│       │   ├── TemplateEditor.tsx (NEW)
│       │   ├── CampaignAnalytics.tsx (NEW)
│       │   ├── CampaignList.tsx (NEW)
│       │   ├── TestSender.tsx (NEW)
│       │   └── ScheduleManager.tsx (NEW)
│       │
│       ├── hooks/
│       │   ├── useCampaigns.ts (NEW)
│       │   ├── useSegments.ts (NEW)
│       │   └── useAnalytics.ts (NEW)
│       │
│       └── types/
│           └── campaign.ts (NEW)
│
├── shared/
│   ├── lib/
│   │   ├── notifications/
│   │   │   ├── PushNotificationManager.ts (NEW)
│   │   │   ├── NotificationTimeCalculator.ts (NEW)
│   │   │   └── notificationTypes.ts (NEW)
│   │   │
│   │   └── platform/push-notifications/
│   │       ├── index.ts (NEW)
│   │       ├── push-notifications.web.ts (NEW)
│   │       └── types.ts (NEW)
│   │
│   ├── hooks/
│   │   └── usePushNotifications.ts (NEW)
│   │
│   └── components/ui/universal/
│       ├── UniversalPushNotificationModal.tsx (NEW)
│       └── UniversalNotificationTimeSelector.tsx (NEW)
│
supabase/
├── migrations/
│   ├── 20251109_add_push_notification_settings.sql (NEW)
│   └── 20251109_add_push_campaigns.sql (NEW)
│
└── functions/
    ├── push-campaign-api/
    │   └── index.ts (NEW)
    ├── push-segmentation-api/
    │   └── index.ts (NEW)
    └── push-analytics/
        └── index.ts (NEW)
```

---

## 🗄️ DATABASE SCHEMA

### Таблица: profiles (изменения)
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS (
  has_completed_onboarding BOOLEAN DEFAULT false,
  notification_settings JSONB DEFAULT '{
    "dailyReminder": true,
    "weeklyReport": true,
    "achievements": true,
    "motivational": true
  }',
  notification_time_preferences JSONB DEFAULT '{
    "morningTime": "08:00",
    "eveningTime": "21:00",
    "timezone": "UTC+3"
  }'
);
```

### Таблица: push_campaigns (NEW)
```sql
CREATE TABLE push_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  icon TEXT,
  url TEXT,
  segment_id UUID REFERENCES push_campaign_segments(id),
  status TEXT CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_opened INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Таблица: push_campaign_segments (NEW)
```sql
CREATE TABLE push_campaign_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Таблица: push_notification_analytics (NEW)
```sql
CREATE TABLE push_notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  campaign_id UUID REFERENCES push_campaigns(id),
  notification_id UUID REFERENCES push_notifications_history(id),
  event_type TEXT CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked')),
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_campaign ON push_notification_analytics(campaign_id);
CREATE INDEX idx_analytics_event_type ON push_notification_analytics(event_type);
CREATE INDEX idx_analytics_timestamp ON push_notification_analytics(event_timestamp DESC);
```

---

## 🔐 SECURITY & RLS POLICIES

### Super Admin Access
```sql
-- Only super_admin can create campaigns
CREATE POLICY "Super admins can create campaigns"
ON push_campaigns FOR INSERT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Only super_admin can view all campaigns
CREATE POLICY "Super admins can view all campaigns"
ON push_campaigns FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);

-- Only super_admin can view analytics
CREATE POLICY "Super admins can view analytics"
ON push_notification_analytics FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  )
);
```

---

## 📊 ADMIN PANEL FEATURES

### 1. Campaign Creator
**Функционал**:
- ✅ Создание рассылки с заголовком, текстом, иконкой
- ✅ Выбор сегмента пользователей
- ✅ Планирование отправки (дата + время)
- ✅ Тестовая отправка на конкретного пользователя
- ✅ Live preview уведомления
- ✅ i18n поддержка (шаблоны на 7 языках)

**UI/UX**:
- Drag-and-drop для создания сегментов
- Visual editor для текста
- Real-time preview
- Validation перед отправкой

### 2. Segment Builder
**Сегментация по**:
- ✅ Язык (ru, en, es, de, fr, zh, ja)
- ✅ Дата регистрации (новые/старые пользователи)
- ✅ Активность (активные/неактивные)
- ✅ Количество записей (0, 1-10, 10+)
- ✅ Последний вход (сегодня, неделя, месяц)
- ✅ Настройки уведомлений (включены/выключены)
- ✅ Timezone (для правильного времени отправки)

**Примеры сегментов**:
```json
{
  "name": "Активные русскоязычные пользователи",
  "filters": {
    "language": "ru",
    "last_login": "within_7_days",
    "total_entries": ">10",
    "notification_settings.dailyReminder": true
  }
}
```

### 3. Template Editor
**Функционал**:
- ✅ Создание шаблонов уведомлений
- ✅ Переменные: {username}, {entry_count}, {achievement}
- ✅ i18n версии для каждого языка
- ✅ Сохранение в библиотеку шаблонов

**Примеры шаблонов**:
```json
{
  "daily_reminder": {
    "ru": "Привет, {username}! Не забудь сделать запись сегодня 📝",
    "en": "Hi, {username}! Don't forget to make an entry today 📝"
  },
  "achievement_unlocked": {
    "ru": "🎉 Поздравляем! Вы разблокировали достижение: {achievement}",
    "en": "🎉 Congratulations! You unlocked: {achievement}"
  }
}
```

### 4. Campaign Analytics
**Метрики**:
- ✅ Total recipients (всего получателей)
- ✅ Sent (отправлено)
- ✅ Delivered (доставлено)
- ✅ Opened (открыто)
- ✅ Clicked (кликнуто)
- ✅ Delivery rate (% доставки)
- ✅ Open rate (% открытий)
- ✅ Click rate (% кликов)

**Визуализация**:
- Line charts (динамика по времени)
- Bar charts (сравнение кампаний)
- Pie charts (распределение по сегментам)
- Real-time updates (Supabase Realtime)

### 5. Schedule Manager
**Функционал**:
- ✅ Планирование рассылок
- ✅ Recurring campaigns (ежедневные, еженедельные)
- ✅ Timezone-aware отправка
- ✅ Автоматическая отмена при ошибках

---

## 🔄 SUPABASE REALTIME INTEGRATION

### Real-time Updates
```typescript
// Подписка на изменения кампаний
const subscription = supabase
  .channel('campaign-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'push_campaigns'
    },
    (payload) => {
      // Update UI in real-time
      updateCampaignStatus(payload.new);
    }
  )
  .subscribe();

// Подписка на аналитику
const analyticsSubscription = supabase
  .channel('analytics-updates')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'push_notification_analytics'
    },
    (payload) => {
      // Update charts in real-time
      updateAnalytics(payload.new);
    }
  )
  .subscribe();
```

---

## 🤖 AUTOMATION

### 1. Scheduled Campaigns (Cron Jobs)
```sql
-- Ежедневная рассылка в 21:00
SELECT cron.schedule(
  'daily-push-campaign',
  '0 21 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-campaign-api',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"type": "daily_reminder"}'::jsonb
  );
  $$
);
```

### 2. Auto-Segmentation
```typescript
// Автоматическое создание сегментов
const autoSegments = [
  {
    name: "Новые пользователи (< 7 дней)",
    filters: { registered_within: "7_days" }
  },
  {
    name: "Неактивные (> 30 дней)",
    filters: { last_login: "more_than_30_days" }
  },
  {
    name: "Активные писатели (> 50 записей)",
    filters: { total_entries: ">50" }
  }
];
```

### 3. A/B Testing
```typescript
// Создание A/B теста
const abTest = {
  name: "Daily Reminder - Time Test",
  variants: [
    { name: "Morning (09:00)", time: "09:00", segment: "50%" },
    { name: "Evening (21:00)", time: "21:00", segment: "50%" }
  ],
  metric: "open_rate",
  duration: "7_days"
};
```

### 4. Retry Logic
```typescript
// Автоматический retry для failed deliveries
async function retryFailedDeliveries() {
  const failed = await getFailedDeliveries();

  for (const delivery of failed) {
    if (delivery.retry_count < 3) {
      await retryDelivery(delivery.id);
    }
  }
}
```

---

## 📱 REACT NATIVE ГОТОВНОСТЬ

### Platform Adapter Pattern
```typescript
// src/shared/lib/platform/push-notifications/index.ts
export { PushNotificationManager } from './push-notifications.web';

// src/shared/lib/platform/push-notifications/push-notifications.web.ts
export class PushNotificationManager {
  async subscribe(userId: string): Promise<void> {
    // Web Push API implementation
    const subscription = await navigator.serviceWorker.ready
      .then(reg => reg.pushManager.subscribe({...}));
  }
}

// app-shared/lib/platform/push-notifications/push-notifications.native.ts
import * as Notifications from 'expo-notifications';

export class PushNotificationManager {
  async subscribe(userId: string): Promise<void> {
    // Expo Notifications implementation
    const token = await Notifications.getExpoPushTokenAsync();
  }
}
```

---

**Статус**: ✅ План готов к обсуждению
**Следующий шаг**: Обсудить приоритеты и начать реализацию

