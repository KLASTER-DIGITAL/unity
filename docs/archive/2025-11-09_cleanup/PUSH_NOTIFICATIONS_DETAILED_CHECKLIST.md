# ✅ Push Notifications + Admin Panel - Detailed Checklist

**Дата**: 2025-11-09  
**Версия**: 2.0  
**Для**: Разработчиков

---

## 🔴 ФАЗА 1: КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ (Дни 1-4)

### День 1: Миграция БД и базовая логика

#### 1.1 Создать миграцию БД
- [ ] **Файл**: `supabase/migrations/20251109_add_push_notification_settings.sql`
- [ ] Добавить `has_completed_onboarding BOOLEAN DEFAULT false` в profiles
- [ ] Добавить `notification_settings JSONB` в profiles
- [ ] Добавить `notification_time_preferences JSONB` в profiles
- [ ] Создать таблицу `push_notification_analytics`
- [ ] Создать индексы для analytics
- [ ] Добавить RLS policies для analytics
- [ ] Запустить миграцию: `supabase migration up`
- [ ] Проверить Supabase Advisors (security + performance)

#### 1.2 Создать PushNotificationManager
- [ ] **Файл**: `src/shared/lib/notifications/PushNotificationManager.ts`
- [ ] Функция: `savePushSettings(userId, settings)` - сохранение настроек
- [ ] Функция: `getPushSettings(userId)` - получение настроек
- [ ] Функция: `validateTimePreferences(prefs)` - валидация времени
- [ ] Функция: `calculateNextNotificationTime(prefs)` - расчет следующего времени
- [ ] Добавить error handling с try-catch
- [ ] Добавить logging для отладки
- [ ] Добавить TypeScript типы
- [ ] Написать JSDoc комментарии

#### 1.3 Создать usePushNotifications hook
- [ ] **Файл**: `src/shared/hooks/usePushNotifications.ts`
- [ ] Hook: `useNotificationSettings()` - state для настроек
- [ ] Hook: `useNotificationTimePreferences()` - state для времени
- [ ] Hook: `useSavePushSettings()` - mutation для сохранения
- [ ] Добавить loading states
- [ ] Добавить error handling
- [ ] Добавить debounce для auto-save (1 сек)
- [ ] Интеграция с Supabase
- [ ] Написать JSDoc комментарии

---

### День 2: Модальное окно онбординга

#### 2.1 Создать PushNotificationOnboardingModal
- [ ] **Файл**: `src/features/mobile/auth/components/onboarding/PushNotificationOnboardingModal.tsx`
- [ ] Компонент: Modal header с заголовком и описанием
- [ ] Компонент: Notification type toggles (4 типа)
- [ ] Компонент: Time selector (morning/evening/both)
- [ ] Компонент: Enable button (запрос разрешения)
- [ ] Компонент: Skip button (пропустить)
- [ ] Добавить i18n поддержку через useTranslation
- [ ] Добавить accessibility (ARIA labels, keyboard navigation)
- [ ] Добавить анимации (Framer Motion)
- [ ] Добавить iOS Design System стили
- [ ] Touch targets 44x44px минимум

#### 2.2 Интегрировать в MobileApp.tsx
- [ ] **Файл**: `src/pwa/mobile/MobileApp.tsx`
- [ ] Добавить state: `showPushModal` (boolean)
- [ ] Добавить useEffect для проверки `has_completed_onboarding`
- [ ] Показывать модальное окно при первом входе
- [ ] Сохранять флаг `has_completed_onboarding = true` после завершения
- [ ] Обработать ошибки при сохранении
- [ ] Добавить toast notifications для feedback
- [ ] Тестировать на новом пользователе

#### 2.3 Добавить i18n ключи
- [ ] **Через админ-панель или SQL**
- [ ] Ключ: `notifications.modal.title` (7 языков)
- [ ] Ключ: `notifications.modal.description` (7 языков)
- [ ] Ключ: `notifications.types.dailyReminder` (7 языков)
- [ ] Ключ: `notifications.types.weeklyReport` (7 языков)
- [ ] Ключ: `notifications.types.achievements` (7 языков)
- [ ] Ключ: `notifications.types.motivational` (7 языков)
- [ ] Ключ: `notifications.time.morning` (7 языков)
- [ ] Ключ: `notifications.time.evening` (7 языков)
- [ ] Ключ: `notifications.button.enable` (7 языков)
- [ ] Ключ: `notifications.button.skip` (7 языков)

---

### День 3: Выбор времени (iOS-style)

#### 3.1 Создать NotificationTimeSelector
- [ ] **Файл**: `src/features/mobile/settings/components/NotificationTimeSelector.tsx`
- [ ] Компонент: Предустановленные варианты (09:00, 12:00, 18:00, 21:00)
- [ ] Компонент: Кастомный time picker (iOS-style)
- [ ] Функция: Валидация времени (HH:MM формат)
- [ ] Функция: Форматирование времени для отображения
- [ ] Добавить i18n поддержку
- [ ] Добавить accessibility
- [ ] Добавить анимации при выборе
- [ ] Touch targets 44x44px

#### 3.2 Улучшить TimePickerModal
- [ ] **Файл**: `src/components/TimePickerModal.tsx` (если существует) или создать новый
- [ ] Компонент: iOS-style picker с часами и минутами
- [ ] Компонент: Confirm/Cancel кнопки
- [ ] Добавить accessibility (ARIA labels)
- [ ] Добавить keyboard navigation
- [ ] Добавить анимации открытия/закрытия

#### 3.3 Интегрировать в SettingsScreen
- [ ] **Файл**: `src/features/mobile/settings/components/SettingsScreen.tsx`
- [ ] Добавить NotificationTimeSelector в NotificationsSection
- [ ] Добавить auto-save при изменении времени
- [ ] Добавить loading state во время сохранения
- [ ] Добавить error handling
- [ ] Добавить toast notifications для feedback

---

### День 4: Типы уведомлений и тестирование

#### 4.1 Создать NotificationTypeToggles
- [ ] **Файл**: `src/features/mobile/settings/components/NotificationTypeToggles.tsx`
- [ ] Toggle: Daily reminders (ежедневные напоминания)
- [ ] Toggle: Weekly reports (еженедельные отчеты)
- [ ] Toggle: Achievements (достижения)
- [ ] Toggle: Motivational messages (мотивационные сообщения)
- [ ] Добавить i18n поддержку
- [ ] Добавить визуальный feedback при toggle
- [ ] Добавить accessibility

#### 4.2 Реализовать auto-save
- [ ] Добавить useEffect с debounce (1 сек)
- [ ] Вызывать `savePushSettings` при изменении
- [ ] Показывать toast "Настройки сохранены"
- [ ] Обработать ошибки с toast "Ошибка сохранения"
- [ ] Добавить retry logic (3 попытки)

#### 4.3 Тестирование PWA
- [ ] Запустить: `npm run dev`
- [ ] Проверить: Модальное окно появляется после первого входа
- [ ] Проверить: Время сохраняется в БД
- [ ] Проверить: Настройки загружаются при повторном входе
- [ ] Проверить: Нет ошибок в консоли (F12)
- [ ] Проверить: Нет warnings в консоли
- [ ] Проверить: Supabase Advisors = 0 issues
- [ ] Проверить: TypeScript errors = 0
- [ ] Проверить: Lint errors = 0

---

## 🟡 ФАЗА 2: REACT NATIVE АДАПТАЦИЯ (Дни 5-7)

### День 5: Platform Adapter

#### 5.1 Создать Platform Adapter структуру
- [ ] **Файл**: `src/shared/lib/platform/push-notifications/index.ts`
- [ ] **Файл**: `src/shared/lib/platform/push-notifications/push-notifications.web.ts`
- [ ] **Файл**: `app-shared/lib/platform/push-notifications/push-notifications.native.ts`
- [ ] **Файл**: `src/shared/lib/platform/push-notifications/types.ts`

#### 5.2 Реализовать Web версию
- [ ] Использовать Web Push API
- [ ] Использовать Supabase для сохранения subscription
- [ ] Использовать существующий webPush.ts
- [ ] Добавить error handling
- [ ] Добавить logging

#### 5.3 Реализовать Native версию
- [ ] Использовать Expo Notifications
- [ ] Использовать AsyncStorage для кэширования
- [ ] Использовать expo-localization для timezone
- [ ] Добавить error handling
- [ ] Добавить logging

### День 6: Universal Components

#### 6.1 Создать UniversalPushNotificationModal
- [ ] **Файл**: `src/shared/components/ui/universal/UniversalPushNotificationModal.tsx` (web)
- [ ] **Файл**: `app-shared/components/ui/universal/UniversalPushNotificationModal.native.tsx` (native)
- [ ] Web: Использовать Radix Dialog
- [ ] Native: Использовать React Native Modal
- [ ] Идентичный дизайн (DesignTokens)
- [ ] Идентичная функциональность
- [ ] Добавить TypeScript types
- [ ] Добавить JSDoc комментарии

#### 6.2 Создать UniversalNotificationTimeSelector
- [ ] **Файл**: `src/shared/components/ui/universal/UniversalNotificationTimeSelector.tsx` (web)
- [ ] **Файл**: `app-shared/components/ui/universal/UniversalNotificationTimeSelector.native.tsx` (native)
- [ ] Web: Использовать HTML time input
- [ ] Native: Использовать DateTimePicker
- [ ] Идентичный дизайн
- [ ] Идентичная функциональность

#### 6.3 Обновить существующие компоненты
- [ ] Заменить Radix компоненты на Universal Components
- [ ] Проверить что PWA работает как раньше
- [ ] Проверить что нет breaking changes

### День 7: Тестирование React Native

#### 7.1 Настроить Expo Notifications
- [ ] Установить: `npx expo install expo-notifications`
- [ ] Настроить app.json для push notifications
- [ ] Настроить Firebase Cloud Messaging (Android)
- [ ] Настроить APNs (iOS)

#### 7.2 Тестирование на Expo Go
- [ ] Запустить: `npm run start:expo`
- [ ] Сканировать QR код в Expo Go
- [ ] Проверить: Модальное окно появляется
- [ ] Проверить: Время сохраняется
- [ ] Проверить: Настройки загружаются
- [ ] Проверить: Нет ошибок в Metro bundler
- [ ] Проверить: Визуальная консистентность с PWA

#### 7.3 Проверка консистентности
- [ ] Сравнить PWA и React Native визуально
- [ ] Проверить что цвета идентичны (DesignTokens)
- [ ] Проверить что spacing идентичен
- [ ] Проверить что typography идентичен
- [ ] Проверить что функционал идентичен

---

## 🟢 ФАЗА 3: АДМИН-ПАНЕЛЬ (Дни 8-14)

### День 8: Backend для рассылок (Часть 1)

#### 8.1 Создать миграцию для кампаний
- [ ] **Файл**: `supabase/migrations/20251109_add_push_campaigns.sql`
- [ ] Создать таблицу `push_campaigns`
- [ ] Создать таблицу `push_campaign_segments`
- [ ] Создать таблицу `push_campaign_templates`
- [ ] Добавить RLS policies для super_admin
- [ ] Добавить индексы для производительности
- [ ] Запустить миграцию
- [ ] Проверить Supabase Advisors

#### 8.2 Создать Edge Function: push-campaign-api
- [ ] **Файл**: `supabase/functions/push-campaign-api/index.ts`
- [ ] Endpoint: POST /push-campaign-api - создать кампанию
- [ ] Endpoint: GET /push-campaign-api - получить все кампании
- [ ] Endpoint: GET /push-campaign-api/:id - получить кампанию по ID
- [ ] Endpoint: PUT /push-campaign-api/:id - обновить кампанию
- [ ] Endpoint: DELETE /push-campaign-api/:id - удалить кампанию
- [ ] Добавить super_admin verification middleware
- [ ] Добавить validation (Zod schema)
- [ ] Добавить error handling
- [ ] Добавить logging
- [ ] Максимум 300 строк (standalone pattern)

#### 8.3 Создать Edge Function: push-segmentation-api
- [ ] **Файл**: `supabase/functions/push-segmentation-api/index.ts`
- [ ] Endpoint: POST /push-segmentation-api - создать сегмент
- [ ] Endpoint: GET /push-segmentation-api - получить все сегменты
- [ ] Endpoint: POST /push-segmentation-api/calculate - рассчитать количество пользователей
- [ ] Функция: `calculateSegmentSize(filters)` - подсчет пользователей
- [ ] Функция: `getUsersBySegment(segmentId)` - получить пользователей
- [ ] Добавить super_admin verification
- [ ] Добавить validation
- [ ] Максимум 300 строк

### День 9: Backend для рассылок (Часть 2)

#### 9.1 Создать Edge Function: push-analytics
- [ ] **Файл**: `supabase/functions/push-analytics/index.ts`
- [ ] Endpoint: GET /push-analytics/:campaignId - статистика кампании
- [ ] Endpoint: GET /push-analytics/overview - общая статистика
- [ ] Endpoint: POST /push-analytics/track - трекинг событий
- [ ] Функция: `calculateDeliveryRate(campaignId)`
- [ ] Функция: `calculateOpenRate(campaignId)`
- [ ] Функция: `calculateClickRate(campaignId)`
- [ ] Добавить super_admin verification
- [ ] Максимум 300 строк

#### 9.2 Настроить Cron Jobs для планирования
- [ ] **SQL**: Создать cron job для scheduled campaigns
- [ ] Функция: Проверять `push_campaigns` с `status = 'scheduled'`
- [ ] Функция: Отправлять кампании в нужное время
- [ ] Функция: Обновлять статус на 'sending' → 'sent'
- [ ] Добавить error handling
- [ ] Добавить retry logic

#### 9.3 Тестирование Backend
- [ ] Тестировать создание кампании через Postman
- [ ] Тестировать создание сегмента
- [ ] Тестировать расчет размера сегмента
- [ ] Тестировать отправку тестового уведомления
- [ ] Тестировать планирование кампании
- [ ] Проверить Supabase Advisors
- [ ] Проверить логи Edge Functions

### День 10: Админ UI - Создание рассылок (Часть 1)

#### 10.1 Создать CampaignCreator компонент
- [ ] **Файл**: `src/features/admin/push-notifications/components/CampaignCreator.tsx`
- [ ] Form: Заголовок кампании (input)
- [ ] Form: Текст уведомления (textarea)
- [ ] Form: Иконка (URL input)
- [ ] Form: URL для клика (input)
- [ ] Form: Выбор сегмента (select)
- [ ] Form: Планирование (date + time picker)
- [ ] Button: Тестовая отправка
- [ ] Button: Сохранить как черновик
- [ ] Button: Запланировать отправку
- [ ] Button: Отправить сейчас
- [ ] Добавить validation (React Hook Form + Zod)
- [ ] Добавить i18n поддержку
- [ ] Добавить error handling
- [ ] Добавить loading states

#### 10.2 Создать SegmentBuilder компонент
- [ ] **Файл**: `src/features/admin/push-notifications/components/SegmentBuilder.tsx`
- [ ] Filter: Язык (multi-select)
- [ ] Filter: Дата регистрации (date range)
- [ ] Filter: Последний вход (date range)
- [ ] Filter: Количество записей (number range)
- [ ] Filter: Активность (active/inactive)
- [ ] Filter: Настройки уведомлений (boolean)
- [ ] Display: Количество пользователей в сегменте (real-time)
- [ ] Button: Сохранить сегмент
- [ ] Button: Применить фильтры
- [ ] Добавить drag-and-drop для фильтров
- [ ] Добавить validation
- [ ] Добавить i18n поддержку

#### 10.3 Создать LivePreview компонент
- [ ] **Файл**: `src/features/admin/push-notifications/components/LivePreview.tsx`
- [ ] Preview: Как будет выглядеть уведомление на iOS
- [ ] Preview: Как будет выглядеть уведомление на Android
- [ ] Preview: Как будет выглядеть уведомление в браузере
- [ ] Обновлять preview в real-time при изменении формы
- [ ] Добавить переключатель платформ (iOS/Android/Web)

### День 11: Админ UI - Создание рассылок (Часть 2)

#### 11.1 Создать TemplateEditor компонент
- [ ] **Файл**: `src/features/admin/push-notifications/components/TemplateEditor.tsx`
- [ ] Form: Название шаблона (input)
- [ ] Form: Текст для каждого языка (7 textarea)
- [ ] Variables: {username}, {entry_count}, {achievement}
- [ ] Button: Сохранить шаблон
- [ ] Button: Загрузить шаблон
- [ ] Display: Библиотека шаблонов
- [ ] Добавить validation
- [ ] Добавить i18n поддержку

#### 11.2 Создать TestSender компонент
- [ ] **Файл**: `src/features/admin/push-notifications/components/TestSender.tsx`
- [ ] Input: Email пользователя для тестовой отправки
- [ ] Button: Отправить тест
- [ ] Display: Результат отправки (success/error)
- [ ] Добавить validation email
- [ ] Добавить error handling

#### 11.3 Создать CampaignList компонент
- [ ] **Файл**: `src/features/admin/push-notifications/components/CampaignList.tsx`
- [ ] Table: Список всех кампаний
- [ ] Columns: Название, Статус, Дата, Получатели, Доставлено, Открыто
- [ ] Filter: По статусу (draft/scheduled/sent)
- [ ] Filter: По дате
- [ ] Search: По названию
- [ ] Actions: Редактировать, Удалить, Дублировать
- [ ] Pagination: 20 кампаний на страницу
- [ ] Добавить sorting
- [ ] Добавить i18n поддержку

### День 12: Админ UI - Аналитика (Часть 1)

#### 12.1 Создать CampaignAnalytics компонент
- [ ] **Файл**: `src/features/admin/push-notifications/components/CampaignAnalytics.tsx`
- [ ] Card: Total recipients (всего получателей)
- [ ] Card: Sent (отправлено)
- [ ] Card: Delivered (доставлено) + delivery rate %
- [ ] Card: Opened (открыто) + open rate %
- [ ] Card: Clicked (кликнуто) + click rate %
- [ ] Chart: Line chart (динамика по времени)
- [ ] Chart: Bar chart (сравнение кампаний)
- [ ] Chart: Pie chart (распределение по сегментам)
- [ ] Добавить real-time updates (Supabase Realtime)
- [ ] Добавить date range picker
- [ ] Добавить export to CSV

#### 12.2 Интегрировать Supabase Realtime
- [ ] Подписка на изменения `push_campaigns`
- [ ] Подписка на изменения `push_notification_analytics`
- [ ] Обновлять UI в real-time при новых событиях
- [ ] Показывать toast при обновлении данных
- [ ] Добавить reconnection logic

#### 12.3 Создать Charts компоненты
- [ ] Использовать библиотеку: recharts или chart.js
- [ ] LineChart: Динамика отправок по времени
- [ ] BarChart: Сравнение кампаний
- [ ] PieChart: Распределение по сегментам
- [ ] Добавить responsive design
- [ ] Добавить accessibility

### День 13: Админ UI - Аналитика (Часть 2)

#### 13.1 Создать AnalyticsOverview компонент
- [ ] **Файл**: `src/features/admin/push-notifications/components/AnalyticsOverview.tsx`
- [ ] Card: Всего кампаний
- [ ] Card: Всего отправлено уведомлений
- [ ] Card: Средний delivery rate
- [ ] Card: Средний open rate
- [ ] Card: Средний click rate
- [ ] Chart: Тренд по неделям
- [ ] Chart: Топ-5 кампаний по open rate
- [ ] Добавить date range picker
- [ ] Добавить export to PDF

#### 13.2 Создать hooks для аналитики
- [ ] **Файл**: `src/features/admin/push-notifications/hooks/useAnalytics.ts`
- [ ] Hook: `useCampaignAnalytics(campaignId)` - статистика кампании
- [ ] Hook: `useOverviewAnalytics()` - общая статистика
- [ ] Hook: `useRealtimeAnalytics()` - real-time обновления
- [ ] Добавить caching (React Query)
- [ ] Добавить error handling

#### 13.3 Создать hooks для кампаний
- [ ] **Файл**: `src/features/admin/push-notifications/hooks/useCampaigns.ts`
- [ ] Hook: `useCampaigns()` - список кампаний
- [ ] Hook: `useCreateCampaign()` - создание кампании
- [ ] Hook: `useUpdateCampaign()` - обновление кампании
- [ ] Hook: `useDeleteCampaign()` - удаление кампании
- [ ] Hook: `useSendTestNotification()` - тестовая отправка
- [ ] Добавить optimistic updates
- [ ] Добавить error handling

### День 14: Финальное тестирование и документация

#### 14.1 Тестирование всех сценариев
- [ ] Создать кампанию с сегментацией
- [ ] Отправить тестовое уведомление
- [ ] Запланировать кампанию на будущее
- [ ] Проверить что кампания отправилась в нужное время
- [ ] Проверить аналитику (delivery/open/click rates)
- [ ] Проверить real-time обновления
- [ ] Проверить фильтрацию и поиск
- [ ] Проверить экспорт данных
- [ ] Проверить на разных языках (7 языков)
- [ ] Проверить на мобильных устройствах

#### 14.2 Проверка безопасности
- [ ] Проверить RLS policies (только super_admin)
- [ ] Проверить rate limiting
- [ ] Проверить validation на backend
- [ ] Проверить XSS защиту
- [ ] Проверить CSRF защиту
- [ ] Проверить Supabase Advisors (security)

#### 14.3 Проверка производительности
- [ ] Проверить скорость загрузки админ-панели
- [ ] Проверить скорость отправки кампаний
- [ ] Проверить индексы БД
- [ ] Проверить N+1 проблемы
- [ ] Проверить Supabase Advisors (performance)

#### 14.4 Документация
- [ ] Обновить CHANGELOG.md (пользовательские изменения)
- [ ] Обновить FIX.md (технические изменения)
- [ ] Создать USER_GUIDE.md для пользователей
- [ ] Создать ADMIN_GUIDE.md для супер-админов
- [ ] Обновить README.md

#### 14.5 Деплой
- [ ] Запустить: `npm run build`
- [ ] Проверить production build локально: `npm run preview`
- [ ] Проверить консоль браузера (0 errors)
- [ ] Деплой Edge Functions: `deploy_edge_function_supabase`
- [ ] Коммит: `git commit -m "feat: push notifications admin panel"`
- [ ] Push: `git push origin main`
- [ ] Проверить Vercel deployment
- [ ] Проверить production на https://unity-wine.vercel.app

---

## ✅ КРИТЕРИИ ЗАВЕРШЕНИЯ

### Пользовательский интерфейс
- [x] Модальное окно появляется после первого входа
- [x] Время уведомлений сохраняется в БД
- [x] Настройки загружаются при повторном входе
- [x] iOS-style дизайн (44x44px touch targets)
- [x] i18n поддержка (7 языков)
- [x] 0 errors в консоли браузера
- [x] 0 TypeScript errors
- [x] 0 Lint errors

### React Native
- [x] Platform Adapter создан (.web + .native)
- [x] Universal Components созданы
- [x] Визуальная консистентность с PWA
- [x] Функциональная консистентность с PWA
- [x] 0 errors в Metro bundler
- [x] Тестирование на Expo Go успешно

### Админ-панель
- [x] Создание кампаний работает
- [x] Сегментация пользователей работает
- [x] Тестовая отправка работает
- [x] Планирование кампаний работает
- [x] Аналитика показывает корректные данные
- [x] Real-time обновления работают
- [x] Только super_admin имеет доступ
- [x] i18n поддержка (7 языков)

### Backend
- [x] Edge Functions деплоятся успешно
- [x] Cron Jobs работают
- [x] RLS policies настроены
- [x] Индексы созданы
- [x] Supabase Advisors = 0 issues (security + performance)

### Документация
- [x] CHANGELOG.md обновлен
- [x] FIX.md обновлен
- [x] USER_GUIDE.md создан
- [x] ADMIN_GUIDE.md создан

---

**Статус**: ✅ Чеклист готов к использованию
**Следующий шаг**: Начать реализацию с Фазы 1

