# 🔧 Проблемы и решения системы Push-уведомлений

**Дата**: 2025-11-09  
**Версия**: 1.0

---

## ❌ ПРОБЛЕМА 1: Модальное окно НЕ появляется после первого входа

### Симптомы
- Новый пользователь входит в кабинет
- Модальное окно с настройками push НЕ показывается
- Пользователь не может включить уведомления

### Корневая причина
1. **Отсутствует флаг** `has_completed_onboarding` в таблице `profiles`
2. **Нет логики** в MobileApp.tsx для проверки флага
3. **Нет компонента** `PushNotificationOnboardingModal`
4. **Нет сохранения** флага после завершения

### Решение

**Шаг 1**: Добавить миграцию БД
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS 
  has_completed_onboarding BOOLEAN DEFAULT false;
```

**Шаг 2**: Создать компонент `PushNotificationOnboardingModal.tsx`
```typescript
export function PushNotificationOnboardingModal({
  isOpen,
  onClose,
  userId,
  language
}: Props) {
  // Modal UI with notification settings
  // Save settings on confirm
  // Set has_completed_onboarding = true
}
```

**Шаг 3**: Добавить логику в MobileApp.tsx
```typescript
const [showPushModal, setShowPushModal] = useState(false);

useEffect(() => {
  if (user && !user.has_completed_onboarding) {
    setShowPushModal(true);
  }
}, [user]);

return (
  <>
    <PushNotificationOnboardingModal
      isOpen={showPushModal}
      onClose={() => setShowPushModal(false)}
      userId={user.id}
    />
    {/* Rest of app */}
  </>
);
```

**Шаг 4**: Сохранить флаг после завершения
```typescript
await updateUserProfile(userId, {
  has_completed_onboarding: true,
  notification_settings: settings
});
```

---

## ❌ ПРОБЛЕМА 2: Логика выбора времени работает некорректно

### Симптомы
- Выбранное время НЕ сохраняется
- При переходе в Settings время сбрасывается
- Уведомления приходят в неправильное время

### Корневая причина
1. **Нет сохранения** в БД (только в state)
2. **Нет синхронизации** между компонентами
3. **Нет валидации** времени
4. **Нет обработки** временных зон

### Решение

**Шаг 1**: Создать структуру для хранения
```typescript
interface NotificationTimePreferences {
  morningTime: string; // "08:00"
  eveningTime: string; // "21:00"
  selectedTimes: ('morning' | 'evening' | 'both')[];
  timezone: string; // "UTC+3"
}
```

**Шаг 2**: Сохранять в profiles.notification_time_preferences
```typescript
await updateUserProfile(userId, {
  notification_time_preferences: {
    morningTime: '08:00',
    eveningTime: '21:00',
    selectedTimes: ['morning', 'evening'],
    timezone: 'UTC+3'
  }
});
```

**Шаг 3**: Загружать при открытии Settings
```typescript
useEffect(() => {
  if (user?.notification_time_preferences) {
    setTimePreferences(user.notification_time_preferences);
  }
}, [user]);
```

**Шаг 4**: Валидировать время
```typescript
function validateTime(time: string): boolean {
  const [hours, minutes] = time.split(':').map(Number);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}
```

---

## ❌ ПРОБЛЕМА 3: Настройки НЕ сохраняются в БД

### Симптомы
- Пользователь меняет настройки
- После перезагрузки страницы настройки сбросились
- Уведомления не приходят согласно выбранным настройкам

### Корневая причина
1. **Нет вызова** updateUserProfile
2. **Нет обработки** ошибок при сохранении
3. **Нет debounce** для оптимизации
4. **Нет feedback** пользователю

### Решение

**Шаг 1**: Добавить auto-save с debounce
```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    saveNotificationSettings(userId, settings);
  }, 1000); // Debounce 1 second
  
  return () => clearTimeout(timeoutId);
}, [settings, userId]);
```

**Шаг 2**: Реализовать saveNotificationSettings
```typescript
async function saveNotificationSettings(
  userId: string,
  settings: NotificationSettings
) {
  try {
    await updateUserProfile(userId, {
      notification_settings: settings
    });
    toast.success('Настройки сохранены');
  } catch (error) {
    console.error('Error saving settings:', error);
    toast.error('Ошибка сохранения');
  }
}
```

**Шаг 3**: Добавить loading state
```typescript
const [isSaving, setIsSaving] = useState(false);

const handleSettingChange = async (key: string, value: any) => {
  setIsSaving(true);
  try {
    await updateUserProfile(userId, {
      notification_settings: { ...settings, [key]: value }
    });
  } finally {
    setIsSaving(false);
  }
};
```

---

## ❌ ПРОБЛЕМА 4: React Native НЕ поддерживается

### Симптомы
- Нет компонентов для React Native
- Нет Platform Adapter
- Нет Universal Components

### Корневая причина
1. **Отсутствует** Platform Adapter
2. **Используется** Radix UI (не совместим с RN)
3. **Нет** .native.tsx версий компонентов

### Решение

**Шаг 1**: Создать Platform Adapter
```typescript
// src/shared/lib/platform/push-notifications/index.ts
export { default as PushNotificationManager } from './push-notifications.web';

// src/shared/lib/platform/push-notifications/push-notifications.web.ts
export class PushNotificationManager {
  async subscribe(userId: string): Promise<void> {
    // Web Push API
  }
}

// app-shared/lib/platform/push-notifications/push-notifications.native.ts
export class PushNotificationManager {
  async subscribe(userId: string): Promise<void> {
    // Expo Notifications
  }
}
```

**Шаг 2**: Создать Universal Components
```typescript
// src/shared/components/ui/universal/UniversalPushNotificationModal.tsx
export function UniversalPushNotificationModal(props: Props) {
  // Web version using Radix UI
}

// app-shared/components/ui/universal/UniversalPushNotificationModal.native.tsx
export function UniversalPushNotificationModal(props: Props) {
  // React Native version
}
```

---

## ❌ ПРОБЛЕМА 5: Аналитика отсутствует в админ-панели

### Симптомы
- Нет статистики подписок
- Нет истории отправок
- Нет метрик открытий

### Корневая причина
1. **Нет таблицы** push_notification_analytics
2. **Нет компонента** в админ-панели
3. **Нет Edge Function** для сбора метрик

### Решение

**Шаг 1**: Создать таблицу analytics
```sql
CREATE TABLE push_notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  notification_id UUID REFERENCES push_notifications_history(id),
  event_type TEXT ('sent', 'delivered', 'opened', 'clicked'),
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

**Шаг 2**: Создать компонент PushNotificationsAnalytics.tsx
```typescript
export function PushNotificationsAnalytics() {
  // Dashboard with:
  // - Total subscriptions
  // - Sent notifications
  // - Open rate
  // - Click rate
  // - Charts and graphs
}
```

**Шаг 3**: Добавить Edge Function для tracking
```typescript
// supabase/functions/push-analytics/index.ts
export async function trackPushEvent(
  userId: string,
  notificationId: string,
  eventType: 'sent' | 'delivered' | 'opened' | 'clicked'
) {
  // Insert into push_notification_analytics
}
```

---

## 📋 ПРИОРИТИЗИРОВАННЫЙ ПЛАН ИСПРАВЛЕНИЙ

### Критические (Неделя 1)
1. ✅ Проблема 1: Модальное окно онбординга
2. ✅ Проблема 2: Логика выбора времени
3. ✅ Проблема 3: Сохранение в БД

### Важные (Неделя 2)
4. ✅ Проблема 4: React Native адаптация
5. ✅ Проблема 5: Аналитика

### Оптимизация (Неделя 3)
- Улучшение UX
- Тестирование
- Документация

---

**Статус**: Готово к реализации  
**Сложность**: Средняя  
**Время**: 7-10 дней

