# ✅ Developer Checklist: Push Notifications Implementation

**Дата**: 2025-11-09  
**Версия**: 1.0  
**Для**: Разработчиков

---

## 📋 ФАЗА 1: КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ (Дни 1-2)

### День 1: Миграция БД и базовая логика

- [ ] **1.1 Создать миграцию БД**
  - [ ] Добавить `has_completed_onboarding` в profiles
  - [ ] Добавить `notification_settings` JSONB в profiles
  - [ ] Добавить `notification_time_preferences` JSONB в profiles
  - [ ] Добавить `notification_timezone` в profiles
  - [ ] Создать таблицу `push_notification_analytics`
  - [ ] Добавить RLS policies
  - [ ] Запустить миграцию: `supabase migration up`

- [ ] **1.2 Создать PushNotificationManager**
  - [ ] Файл: `src/shared/lib/notifications/PushNotificationManager.ts`
  - [ ] Функция: `savePushSettings(userId, settings)`
  - [ ] Функция: `getPushSettings(userId)`
  - [ ] Функция: `validateTimePreferences(prefs)`
  - [ ] Функция: `calculateNextNotificationTime(prefs)`
  - [ ] Добавить error handling
  - [ ] Добавить logging

- [ ] **1.3 Создать usePushNotifications hook**
  - [ ] Файл: `src/shared/hooks/usePushNotifications.ts`
  - [ ] Hook: `useNotificationSettings()`
  - [ ] Hook: `useNotificationTimePreferences()`
  - [ ] Hook: `useSavePushSettings()`
  - [ ] Добавить loading states
  - [ ] Добавить error handling

### День 2: Модальное окно онбординга

- [ ] **2.1 Создать PushNotificationOnboardingModal**
  - [ ] Файл: `src/features/mobile/auth/components/onboarding/PushNotificationOnboardingModal.tsx`
  - [ ] Компонент: Modal header
  - [ ] Компонент: Notification type toggles
  - [ ] Компонент: Time selector
  - [ ] Компонент: Enable button
  - [ ] Компонент: Close button
  - [ ] Добавить i18n поддержку
  - [ ] Добавить accessibility (ARIA labels)

- [ ] **2.2 Интегрировать в MobileApp.tsx**
  - [ ] Добавить state для показа модального окна
  - [ ] Добавить useEffect для проверки `has_completed_onboarding`
  - [ ] Показывать модальное окно при первом входе
  - [ ] Сохранять флаг после завершения
  - [ ] Обработать ошибки при сохранении

- [ ] **2.3 Добавить i18n ключи**
  - [ ] Ключ: `notifications.modal.title`
  - [ ] Ключ: `notifications.modal.description`
  - [ ] Ключ: `notifications.types.dailyReminder`
  - [ ] Ключ: `notifications.types.weeklyReport`
  - [ ] Ключ: `notifications.types.achievements`
  - [ ] Ключ: `notifications.types.motivational`
  - [ ] Ключ: `notifications.time.morning`
  - [ ] Ключ: `notifications.time.evening`
  - [ ] Ключ: `notifications.button.enable`
  - [ ] Ключ: `notifications.button.skip`

---

## 📋 ФАЗА 2: UX УЛУЧШЕНИЯ (Дни 3-4)

### День 3: Выбор времени (iOS-style)

- [ ] **3.1 Создать NotificationTimeSelector**
  - [ ] Файл: `src/features/mobile/settings/components/NotificationTimeSelector.tsx`
  - [ ] Компонент: Предустановленные варианты (09:00, 12:00, 18:00, 21:00)
  - [ ] Компонент: Кастомный time picker
  - [ ] Функция: Валидация времени
  - [ ] Функция: Форматирование времени
  - [ ] Добавить i18n поддержку

- [ ] **3.2 Улучшить TimePickerModal**
  - [ ] Файл: `src/components/TimePickerModal.tsx`
  - [ ] Компонент: iOS-style picker
  - [ ] Компонент: Часы и минуты
  - [ ] Компонент: Confirm/Cancel кнопки
  - [ ] Добавить accessibility

- [ ] **3.3 Интегрировать в SettingsScreen**
  - [ ] Файл: `src/features/mobile/settings/components/SettingsScreen.tsx`
  - [ ] Добавить NotificationTimeSelector компонент
  - [ ] Добавить auto-save при изменении
  - [ ] Добавить loading state
  - [ ] Добавить error handling

### День 4: Типы уведомлений и сохранение

- [ ] **4.1 Создать NotificationTypeToggles**
  - [ ] Файл: `src/features/mobile/settings/components/NotificationTypeToggles.tsx`
  - [ ] Toggle: Daily reminders
  - [ ] Toggle: Weekly reports
  - [ ] Toggle: Achievements
  - [ ] Toggle: Motivational messages
  - [ ] Добавить i18n поддержку

- [ ] **4.2 Реализовать auto-save**
  - [ ] Добавить useEffect с debounce (1 сек)
  - [ ] Вызывать `saveNotificationSettings`
  - [ ] Показывать toast notifications
  - [ ] Обработать ошибки
  - [ ] Добавить retry logic

- [ ] **4.3 Тестирование PWA**
  - [ ] Запустить: `npm run dev`
  - [ ] Проверить: Модальное окно появляется
  - [ ] Проверить: Время сохраняется
  - [ ] Проверить: Настройки загружаются
  - [ ] Проверить: Нет ошибок в консоли (F12)
  - [ ] Проверить: Нет warnings в консоли

---

## 📋 ФАЗА 3: REACT NATIVE АДАПТАЦИЯ (Дни 5-7)

### День 5: Platform Adapter

- [ ] **5.1 Создать Platform Adapter структуру**
  - [ ] Файл: `src/shared/lib/platform/push-notifications/index.ts`
  - [ ] Файл: `src/shared/lib/platform/push-notifications/push-notifications.web.ts`
  - [ ] Файл: `app-shared/lib/platform/push-notifications/push-notifications.native.ts`
  - [ ] Файл: `src/shared/lib/platform/push-notifications/types.ts`

- [ ] **5.2 Реализовать Web версию**
  - [ ] Использовать Web Push API
  - [ ] Использовать Supabase
  - [ ] Использовать существующий webPush.ts
  - [ ] Добавить error handling

- [ ] **5.3 Реализовать Native версию**
  - [ ] Использовать Expo Notifications
  - [ ] Использовать AsyncStorage
  - [ ] Использовать expo-localization
  - [ ] Добавить error handling

### День 6: Universal Components

- [ ] **6.1 Создать UniversalPushNotificationModal**
  - [ ] Файл: `src/shared/components/ui/universal/UniversalPushNotificationModal.tsx`
  - [ ] Файл: `app-shared/components/ui/universal/UniversalPushNotificationModal.native.tsx`
  - [ ] Компонент: Web версия (Radix UI)
  - [ ] Компонент: Native версия (React Native)

- [ ] **6.2 Создать UniversalNotificationTimeSelector**
  - [ ] Файл: `src/shared/components/ui/universal/UniversalNotificationTimeSelector.tsx`
  - [ ] Файл: `app-shared/components/ui/universal/UniversalNotificationTimeSelector.native.tsx`
  - [ ] Компонент: Web версия
  - [ ] Компонент: Native версия

- [ ] **6.3 Тестирование React Native**
  - [ ] Запустить: `npm run start:expo`
  - [ ] Проверить: Модальное окно работает
  - [ ] Проверить: Time picker работает
  - [ ] Проверить: Настройки сохраняются
  - [ ] Проверить: Нет ошибок в Metro bundler

### День 7: Интеграция и тестирование

- [ ] **7.1 Интегрировать в app/onboarding/step4.tsx**
  - [ ] Использовать UniversalPushNotificationModal
  - [ ] Использовать UniversalNotificationTimeSelector
  - [ ] Сохранять настройки в Supabase

- [ ] **7.2 Интегрировать в app/(tabs)/settings.tsx**
  - [ ] Использовать UniversalNotificationTimeSelector
  - [ ] Использовать UniversalNotificationTypeToggles
  - [ ] Auto-save при изменении

- [ ] **7.3 Полное тестирование**
  - [ ] PWA: `npm run dev` + Chrome DevTools
  - [ ] React Native: `npm run start:expo` + Expo Go
  - [ ] Проверить на обеих платформах
  - [ ] Визуальная консистентность
  - [ ] Функциональная консистентность

---

## 📋 ФАЗА 4: АНАЛИТИКА (Дни 8-10)

### День 8: Backend для аналитики

- [ ] **8.1 Создать Edge Function для tracking**
  - [ ] Файл: `supabase/functions/push-analytics/index.ts`
  - [ ] Функция: `trackPushEvent(userId, notificationId, eventType)`
  - [ ] Функция: `getAnalytics(filters)`
  - [ ] Функция: `getSubscriptionStats()`

- [ ] **8.2 Обновить push-sender**
  - [ ] Добавить логирование в push_notification_analytics
  - [ ] Отслеживать доставку
  - [ ] Отслеживать открытия

### День 9: Admin Dashboard

- [ ] **9.1 Создать PushNotificationsAnalytics компонент**
  - [ ] Файл: `src/features/admin/settings/components/PushNotificationsAnalytics.tsx`
  - [ ] Показывать: Total subscriptions
  - [ ] Показывать: Sent notifications
  - [ ] Показывать: Open rate
  - [ ] Показывать: Click rate
  - [ ] Добавить: Charts and graphs

- [ ] **9.2 Добавить в админ-панель**
  - [ ] Файл: `src/features/admin/settings/AdminSettingsScreen.tsx`
  - [ ] Добавить: Tab для Push Notifications
  - [ ] Добавить: PushNotificationsAnalytics компонент

### День 10: Финальное тестирование и документация

- [ ] **10.1 Полное тестирование**
  - [ ] Сценарий 1: Новый пользователь (вход → модальное окно → сохранение)
  - [ ] Сценарий 2: Существующий пользователь (Settings → изменение → auto-save)
  - [ ] Сценарий 3: Отправка уведомления (создание → push → analytics)
  - [ ] Сценарий 4: React Native (все вышеперечисленное)

- [ ] **10.2 Проверка консоли**
  - [ ] `npm run build` - успешен
  - [ ] `npm run preview` - работает
  - [ ] F12 → Console → 0 errors
  - [ ] `npm run lint:fix` - успешен
  - [ ] `npm run type-check` - успешен

- [ ] **10.3 Документация**
  - [ ] Файл: `docs/features/PUSH_NOTIFICATIONS_GUIDE.md`
  - [ ] Файл: `docs/api/PUSH_NOTIFICATIONS_API.md`
  - [ ] Файл: `docs/admin/PUSH_NOTIFICATIONS_ADMIN.md`

---

## 🔐 БЕЗОПАСНОСТЬ И КАЧЕСТВО

- [ ] Нет ошибок в консоли браузера
- [ ] Нет ошибок в Metro bundler
- [ ] Все тесты проходят
- [ ] Lint проходит
- [ ] TypeScript errors = 0
- [ ] Supabase Advisors = 0 issues
- [ ] RLS policies настроены
- [ ] VAPID keys в secrets
- [ ] Нет утечек данных

---

## 📊 ФИНАЛЬНАЯ ПРОВЕРКА

- [ ] Модальное окно появляется после первого входа ✅
- [ ] Настройки сохраняются в БД ✅
- [ ] Уведомления приходят в выбранное время ✅
- [ ] React Native версия работает идентично PWA ✅
- [ ] Аналитика доступна в админ-панели ✅
- [ ] 0 ошибок в консоли ✅
- [ ] Документация полная ✅

---

**Статус**: Готово к реализации  
**Сложность**: Средняя  
**Время**: 7-10 дней  
**Приоритет**: 🔴 КРИТИЧНО

