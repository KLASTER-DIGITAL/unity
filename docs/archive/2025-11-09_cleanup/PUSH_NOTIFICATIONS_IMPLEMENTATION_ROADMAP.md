# 🗺️ Пошаговый план реализации Push-уведомлений

**Дата**: 2025-11-09  
**Версия**: 1.0  
**Время**: 7-10 дней

---

## 📅 ФАЗА 1: КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ (Дни 1-2)

### День 1: Миграция БД и базовая логика

**Задача 1.1**: Создать миграцию БД
```bash
# Файл: supabase/migrations/20251109_add_push_notification_settings.sql
# Добавить:
# - has_completed_onboarding в profiles
# - notification_settings в profiles
# - notification_time_preferences в profiles
# - push_notification_analytics таблица
```

**Задача 1.2**: Создать PushNotificationManager
```typescript
# Файл: src/shared/lib/notifications/PushNotificationManager.ts
# Функции:
# - savePushSettings(userId, settings)
# - getPushSettings(userId)
# - validateTimePreferences(prefs)
# - calculateNextNotificationTime(prefs)
```

**Задача 1.3**: Создать usePushNotifications hook
```typescript
# Файл: src/shared/hooks/usePushNotifications.ts
# Функции:
# - useNotificationSettings()
# - useNotificationTimePreferences()
# - useSavePushSettings()
```

### День 2: Модальное окно онбординга

**Задача 2.1**: Создать PushNotificationOnboardingModal
```typescript
# Файл: src/features/mobile/auth/components/onboarding/
#       PushNotificationOnboardingModal.tsx
# Компоненты:
# - Modal header
# - Notification type toggles
# - Time selector
# - Enable button
# - Close button
```

**Задача 2.2**: Интегрировать в MobileApp.tsx
```typescript
# Добавить:
# - Проверка has_completed_onboarding
# - Показ модального окна
# - Сохранение флага после завершения
```

**Задача 2.3**: Добавить i18n ключи
```typescript
# Файл: supabase/migrations/i18n_push_notifications.sql
# Ключи:
# - notifications.modal.title
# - notifications.modal.description
# - notifications.types.dailyReminder
# - notifications.time.morning
# - notifications.time.evening
```

---

## 📅 ФАЗА 2: UX УЛУЧШЕНИЯ (Дни 3-4)

### День 3: Выбор времени (iOS-style)

**Задача 3.1**: Создать NotificationTimeSelector
```typescript
# Файл: src/features/mobile/settings/components/
#       NotificationTimeSelector.tsx
# Функции:
# - Предустановленные варианты (09:00, 12:00, 18:00, 21:00)
# - Кастомный time picker
# - Валидация времени
```

**Задача 3.2**: Создать TimePickerModal
```typescript
# Файл: src/components/TimePickerModal.tsx (улучшить существующий)
# Функции:
# - iOS-style picker
# - Часы и минуты
# - Confirm/Cancel
```

**Задача 3.3**: Интегрировать в SettingsScreen
```typescript
# Файл: src/features/mobile/settings/components/SettingsScreen.tsx
# Добавить:
# - NotificationTimeSelector компонент
# - Auto-save при изменении
# - Loading state
```

### День 4: Типы уведомлений и сохранение

**Задача 4.1**: Создать NotificationTypeToggles
```typescript
# Файл: src/features/mobile/settings/components/
#       NotificationTypeToggles.tsx
# Типы:
# - Daily reminders
# - Weekly reports
# - Achievements
# - Motivational messages
```

**Задача 4.2**: Реализовать auto-save
```typescript
# Добавить в SettingsScreen:
# - useEffect с debounce (1 сек)
# - Вызов saveNotificationSettings
# - Toast notifications
# - Error handling
```

**Задача 4.3**: Тестирование PWA
```bash
# npm run dev
# Проверить:
# - Модальное окно появляется
# - Время сохраняется
# - Настройки загружаются
# - Нет ошибок в консоли
```

---

## 📅 ФАЗА 3: REACT NATIVE АДАПТАЦИЯ (Дни 5-7)

### День 5: Platform Adapter

**Задача 5.1**: Создать Platform Adapter структуру
```typescript
# Файлы:
# - src/shared/lib/platform/push-notifications/index.ts
# - src/shared/lib/platform/push-notifications/push-notifications.web.ts
# - app-shared/lib/platform/push-notifications/push-notifications.native.ts
# - src/shared/lib/platform/push-notifications/types.ts
```

**Задача 5.2**: Реализовать Web версию
```typescript
# push-notifications.web.ts:
# - Использовать Web Push API
# - Использовать Supabase
# - Использовать существующий webPush.ts
```

**Задача 5.3**: Реализовать Native версию
```typescript
# push-notifications.native.ts:
# - Использовать Expo Notifications
# - Использовать AsyncStorage
# - Использовать expo-localization
```

### День 6: Universal Components

**Задача 6.1**: Создать UniversalPushNotificationModal
```typescript
# Файлы:
# - src/shared/components/ui/universal/
#   UniversalPushNotificationModal.tsx
# - app-shared/components/ui/universal/
#   UniversalPushNotificationModal.native.tsx
```

**Задача 6.2**: Создать UniversalNotificationTimeSelector
```typescript
# Файлы:
# - src/shared/components/ui/universal/
#   UniversalNotificationTimeSelector.tsx
# - app-shared/components/ui/universal/
#   UniversalNotificationTimeSelector.native.tsx
```

**Задача 6.3**: Тестирование React Native
```bash
# npm run start:expo
# Проверить:
# - Модальное окно работает
# - Time picker работает
# - Настройки сохраняются
# - Нет ошибок в Metro bundler
```

### День 7: Интеграция и тестирование

**Задача 7.1**: Интегрировать в app/onboarding/step4.tsx
```typescript
# Использовать UniversalPushNotificationModal
# Использовать UniversalNotificationTimeSelector
# Сохранять настройки в Supabase
```

**Задача 7.2**: Интегрировать в app/(tabs)/settings.tsx
```typescript
# Использовать UniversalNotificationTimeSelector
# Использовать UniversalNotificationTypeToggles
# Auto-save при изменении
```

**Задача 7.3**: Полное тестирование
```bash
# PWA: npm run dev + Chrome DevTools
# React Native: npm run start:expo + Expo Go
# Проверить на обеих платформах
```

---

## 📅 ФАЗА 4: АНАЛИТИКА (Дни 8-10)

### День 8: Backend для аналитики

**Задача 8.1**: Создать Edge Function для tracking
```typescript
# Файл: supabase/functions/push-analytics/index.ts
# Функции:
# - trackPushEvent(userId, notificationId, eventType)
# - getAnalytics(filters)
# - getSubscriptionStats()
```

**Задача 8.2**: Обновить push-sender
```typescript
# Добавить:
# - Логирование в push_notification_analytics
# - Отслеживание доставки
# - Отслеживание открытий
```

### День 9: Admin Dashboard

**Задача 9.1**: Создать PushNotificationsAnalytics компонент
```typescript
# Файл: src/features/admin/settings/components/
#       PushNotificationsAnalytics.tsx
# Показывать:
# - Total subscriptions
# - Sent notifications
# - Open rate
# - Click rate
# - Charts
```

**Задача 9.2**: Добавить в админ-панель
```typescript
# Файл: src/features/admin/settings/AdminSettingsScreen.tsx
# Добавить:
# - Tab для Push Notifications
# - PushNotificationsAnalytics компонент
```

### День 10: Финальное тестирование и документация

**Задача 10.1**: Полное тестирование
```bash
# Сценарий 1: Новый пользователь
# - Вход → Модальное окно → Выбор настроек → Сохранение

# Сценарий 2: Существующий пользователь
# - Settings → Изменение настроек → Auto-save

# Сценарий 3: Отправка уведомления
# - Создание записи → Push отправляется → Analytics обновляется

# Сценарий 4: React Native
# - Все вышеперечисленное на React Native
```

**Задача 10.2**: Документация
```markdown
# Файлы:
# - docs/features/PUSH_NOTIFICATIONS_GUIDE.md
# - docs/api/PUSH_NOTIFICATIONS_API.md
# - docs/admin/PUSH_NOTIFICATIONS_ADMIN.md
```

**Задача 10.3**: Проверка консоли
```bash
# npm run build
# npm run preview
# F12 → Console → 0 errors
# npm run lint:fix
```

---

## 🎯 КРИТИЧЕСКИЕ ТОЧКИ

### Проверки перед коммитом
- ✅ Нет ошибок в консоли браузера
- ✅ Нет ошибок в Metro bundler
- ✅ Все тесты проходят
- ✅ Lint проходит
- ✅ TypeScript errors = 0
- ✅ Supabase Advisors = 0 issues

### Тестирование на обеих платформах
- ✅ PWA: npm run dev + Chrome
- ✅ React Native: npm run start:expo + Expo Go
- ✅ Визуальная консистентность
- ✅ Функциональная консистентность

---

## 📊 МЕТРИКИ УСПЕХА

- ✅ Модальное окно появляется после первого входа
- ✅ Настройки сохраняются в БД
- ✅ Уведомления приходят в выбранное время
- ✅ React Native версия работает идентично PWA
- ✅ Аналитика доступна в админ-панели
- ✅ 0 ошибок в консоли
- ✅ 100% тестовое покрытие критических путей

---

**Статус**: Готово к реализации  
**Сложность**: Средняя  
**Время**: 7-10 дней  
**ROI**: Высокий (экономия $2,328/год + гибкость)

