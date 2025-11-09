# 🏗️ Архитектура системы Push-уведомлений UNITY-v2

**Дата**: 2025-11-09  
**Версия**: 1.0  
**Статус**: Детальная архитектура

---

## 📐 СИСТЕМНАЯ АРХИТЕКТУРА

### Слои системы

```
┌─────────────────────────────────────────────────────────┐
│                   UI Layer (PWA)                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │ PushNotificationOnboardingModal                  │   │
│  │ NotificationSettingsPanel                        │   │
│  │ NotificationTimeSelector                         │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│              Business Logic Layer                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ usePushNotifications (hook)                      │   │
│  │ PushNotificationManager (service)                │   │
│  │ NotificationTimeCalculator (utils)               │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│           Platform Abstraction Layer                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ push-notifications.web.ts                        │   │
│  │ push-notifications.native.ts                     │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│              API Layer (Supabase)                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ webPush.ts (Web Push API)                        │   │
│  │ profilesApi.ts (user settings)                   │   │
│  │ analyticsApi.ts (tracking)                       │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│            Backend Layer (Supabase)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Edge Functions:                                  │   │
│  │ - push-sender                                    │   │
│  │ - push-scheduled                                 │   │
│  │ - push-realtime-trigger                          │   │
│  └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│              Database Layer                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │ profiles (notification_settings)                 │   │
│  │ push_subscriptions                               │   │
│  │ push_notifications_history                       │   │
│  │ push_notification_analytics                      │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 СТРУКТУРА ФАЙЛОВ

### Новые файлы для создания

```
src/
├── features/mobile/
│   ├── auth/components/
│   │   └── onboarding/
│   │       └── PushNotificationOnboardingModal.tsx (NEW)
│   │
│   └── settings/components/
│       ├── NotificationSettingsPanel.tsx (NEW)
│       ├── NotificationTimeSelector.tsx (NEW)
│       └── NotificationTypeToggles.tsx (NEW)
│
├── shared/
│   ├── lib/
│   │   ├── notifications/
│   │   │   ├── PushNotificationManager.ts (NEW)
│   │   │   ├── NotificationTimeCalculator.ts (NEW)
│   │   │   └── notificationTypes.ts (NEW)
│   │   │
│   │   └── platform/
│   │       └── push-notifications/
│   │           ├── index.ts (NEW)
│   │           ├── push-notifications.web.ts (NEW)
│   │           └── push-notifications.native.ts (NEW)
│   │
│   ├── hooks/
│   │   └── usePushNotifications.ts (NEW)
│   │
│   └── components/ui/universal/
│       ├── UniversalPushNotificationModal.tsx (NEW)
│       └── UniversalNotificationTimeSelector.tsx (NEW)
│
└── features/admin/
    └── settings/components/
        └── PushNotificationsAnalytics.tsx (NEW)

app/ (React Native)
├── shared/
│   └── components/
│       └── notifications/
│           ├── PushNotificationOnboardingModal.native.tsx (NEW)
│           └── NotificationTimeSelector.native.tsx (NEW)
```

---

## 🔄 FLOW ДИАГРАММА

### Сценарий 1: Первый вход (Онбординг)

```
User Login
    ↓
Check: has_completed_onboarding?
    ├─ NO → Show PushNotificationOnboardingModal
    │       ├─ User selects notification types
    │       ├─ User selects time preferences
    │       ├─ User clicks "Enable Notifications"
    │       ├─ Request browser permission
    │       ├─ Subscribe to push (webPush.ts)
    │       ├─ Save settings to profiles table
    │       ├─ Set has_completed_onboarding = true
    │       └─ Close modal
    │
    └─ YES → Skip modal, go to main app
```

### Сценарий 2: Изменение настроек (Settings)

```
User opens Settings
    ↓
NotificationSettingsPanel
    ├─ Show current settings
    ├─ User toggles notification types
    ├─ User changes time preferences
    ├─ Auto-save to profiles table
    └─ Update UI
```

### Сценарий 3: Отправка уведомления

```
Event triggered (entry created, achievement unlocked, etc.)
    ↓
push-realtime-trigger Edge Function
    ├─ Get user's notification settings
    ├─ Check if notifications enabled
    ├─ Check if current time matches preferences
    ├─ Call push-sender Edge Function
    ├─ Send to all active subscriptions
    ├─ Log to push_notifications_history
    └─ Update analytics
```

---

## 🗄️ СХЕМА БД

### Таблица profiles (изменения)

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
    "selectedTimes": ["morning", "evening"]
  }',
  notification_timezone TEXT DEFAULT 'UTC+3'
);
```

### Новая таблица push_notification_analytics

```sql
CREATE TABLE push_notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notification_id UUID REFERENCES push_notifications_history(id),
  event_type TEXT CHECK (event_type IN ('sent', 'delivered', 'opened', 'clicked')),
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_user_id ON push_notification_analytics(user_id);
CREATE INDEX idx_analytics_event_type ON push_notification_analytics(event_type);
CREATE INDEX idx_analytics_timestamp ON push_notification_analytics(event_timestamp DESC);
```

---

## 🔐 БЕЗОПАСНОСТЬ

### RLS Policies

```sql
-- Users can read their own notification settings
CREATE POLICY "Users can read own notification settings"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own notification settings
CREATE POLICY "Users can update own notification settings"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Super admins can read analytics
CREATE POLICY "Super admins can read analytics"
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

## 📊 ТИПЫ ДАННЫХ

### NotificationSettings

```typescript
interface NotificationSettings {
  dailyReminder: boolean;
  weeklyReport: boolean;
  achievements: boolean;
  motivational: boolean;
}

interface NotificationTimePreferences {
  morningTime: string; // "08:00"
  eveningTime: string; // "21:00"
  selectedTimes: ('morning' | 'evening' | 'both')[];
  timezone: string; // "UTC+3"
}

interface PushNotificationEvent {
  type: 'entry_created' | 'achievement_unlocked' | 'daily_reminder' | 'weekly_report';
  title: string;
  body: string;
  icon?: string;
  data: Record<string, any>;
  timestamp: Date;
}
```

---

## 🚀 ИНТЕГРАЦИЯ С i18n

```typescript
// Все строки через i18n систему
const { t } = useTranslation();

// Примеры ключей
t('notifications.modal.title', 'Включить уведомления')
t('notifications.modal.description', 'Получайте напоминания...')
t('notifications.time.morning', 'Утро (08:00)')
t('notifications.time.evening', 'Вечер (21:00)')
t('notifications.types.dailyReminder', 'Ежедневные напоминания')
```

---

## 📱 REACT NATIVE АДАПТАЦИЯ

### Platform Adapter

```typescript
// src/shared/lib/platform/push-notifications/index.ts
export { default as PushNotificationManager } from './push-notifications.web';

// src/shared/lib/platform/push-notifications/push-notifications.web.ts
export class PushNotificationManager {
  async subscribe(userId: string): Promise<void> {
    // Web Push API implementation
  }
}

// app-shared/lib/platform/push-notifications/push-notifications.native.ts
export class PushNotificationManager {
  async subscribe(userId: string): Promise<void> {
    // Expo Notifications implementation
  }
}
```

---

## ✅ ЧЕКЛИСТ РЕАЛИЗАЦИИ

- [ ] Миграция БД (profiles + analytics)
- [ ] PushNotificationManager (service)
- [ ] usePushNotifications (hook)
- [ ] PushNotificationOnboardingModal
- [ ] NotificationSettingsPanel
- [ ] NotificationTimeSelector
- [ ] Platform Adapter (.web.ts + .native.ts)
- [ ] Universal Components
- [ ] Admin Analytics Dashboard
- [ ] Тестирование PWA
- [ ] Тестирование React Native
- [ ] Документация

---

**Статус**: Готово к реализации  
**Сложность**: Средняя  
**Время**: 7-10 дней

