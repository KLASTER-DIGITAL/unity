# 🔔 Комплексный технический анализ системы Push-уведомлений UNITY-v2

**Дата**: 2025-11-09  
**Версия**: 1.0  
**Статус**: Детальный анализ с рекомендациями

---

## 📊 EXECUTIVE SUMMARY

### Текущее состояние
✅ **Реализовано**:
- Web Push API интеграция (webPush.ts)
- Service Worker конфигурация
- Edge Functions для отправки (push-sender, push-scheduled, push-realtime-trigger)
- Таблицы БД (push_subscriptions, push_notifications_history)
- Базовая UI в OnboardingScreen4 и SettingsScreen
- i18n система с динамической CRUD

❌ **Проблемы**:
1. **Онбординг**: Модальное окно НЕ появляется после первого входа
2. **Настройки времени**: Логика выбора времени работает некорректно
3. **Сохранение**: Настройки НЕ сохраняются в БД
4. **React Native**: Нет Platform Adapter для push-уведомлений
5. **Аналитика**: Отсутствует в админ-панели

### Рекомендация
**Использовать СОБСТВЕННУЮ реализацию** (не SendPulse) потому что:
- ✅ Полный контроль над логикой
- ✅ Гибкость для кастомных сценариев
- ✅ Уже 80% реализовано
- ✅ Масштабируемость для 100K пользователей
- ✅ Интеграция с i18n и мобильным подходом

---

## 🏗️ АРХИТЕКТУРА РЕШЕНИЯ

### Текущая инфраструктура
```
┌─────────────────────────────────────────────────────────┐
│                    PWA Frontend                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ OnboardingScreen4 / SettingsScreen               │   │
│  │ - Выбор времени уведомлений                      │   │
│  │ - Кнопка "Включить уведомления"                 │   │
│  │ - Переключатели типов уведомлений               │   │
│  └──────────────────────────────────────────────────┘   │
│                         ↓                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ PushSubscriptionManager (webPush.ts)             │   │
│  │ - Запрос разрешения браузера                     │   │
│  │ - Подписка на push                               │   │
│  │ - Сохранение subscription в БД                   │   │
│  └──────────────────────────────────────────────────┘   │
│                         ↓                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Service Worker (public/service-worker.js)        │   │
│  │ - Получение push событий                         │   │
│  │ - Отображение уведомлений                        │   │
│  │ - Обработка click событий                        │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│                  Supabase Backend                        │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Таблицы:                                         │   │
│  │ - push_subscriptions (user subscriptions)        │   │
│  │ - push_notifications_history (analytics)         │   │
│  │ - profiles (notification_settings)               │   │
│  └──────────────────────────────────────────────────┘   │
│                         ↓                                │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Edge Functions:                                  │   │
│  │ - push-sender (отправка уведомлений)            │   │
│  │ - push-scheduled (запланированные)              │   │
│  │ - push-realtime-trigger (real-time события)     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 ДЕТАЛЬНЫЙ АНАЛИЗ ПРОБЛЕМ

### Проблема 1: Онбординг не показывает модальное окно

**Текущее состояние**:
- OnboardingScreen4 существует и имеет UI для настроек
- Но модальное окно НЕ появляется после первого входа в кабинет
- Логика показа окна не реализована в MobileApp.tsx

**Причина**:
- Отсутствует проверка `isFirstLogin` в MobileApp
- Нет логики для показа модального окна после входа
- Нет сохранения флага `hasCompletedOnboarding` в профиле

**Решение**:
1. Добавить поле `has_completed_onboarding` в таблицу `profiles`
2. Создать компонент `PushNotificationOnboardingModal`
3. Добавить логику в MobileApp для показа модального окна
4. Сохранять флаг после завершения онбординга

---

## 📋 ПЛАН РЕАЛИЗАЦИИ (Приоритизированный)

### Фаза 1: Критические исправления (1-2 дня)

**1.1 Миграция БД**
- Добавить `has_completed_onboarding` в profiles
- Добавить `notification_settings` (JSON) в profiles
- Добавить `notification_time_preferences` в profiles

**1.2 Модальное окно онбординга**
- Создать `PushNotificationOnboardingModal.tsx`
- Интегрировать в MobileApp.tsx
- Логика показа после первого входа

**1.3 Сохранение настроек**
- Реализовать сохранение в БД
- Синхронизация с UI

### Фаза 2: Улучшение UX (2-3 дня)

**2.1 Выбор времени (iOS-style)**
- Создать `NotificationTimeSelector.tsx`
- Предустановленные варианты (09:00, 12:00, 18:00, 21:00)
- Кастомный time picker

**2.2 Типы уведомлений**
- Переключатели для каждого типа
- Сохранение выбора

### Фаза 3: React Native адаптация (3-5 дней)

**3.1 Platform Adapter**
- `src/shared/lib/platform/push-notifications/`
- `.web.ts` (Web Push API)
- `.native.ts` (Expo Notifications)

**3.2 Universal Components**
- `UniversalPushNotificationModal`
- `UniversalNotificationTimeSelector`

### Фаза 4: Аналитика в админ-панели (2-3 дня)

**4.1 Dashboard**
- Статистика подписок
- История отправок
- Метрики открытий

---

## 💾 СТРУКТУРА БД (Требуемые изменения)

```sql
-- Добавить в profiles
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
  }'
);

-- Новая таблица для аналитики
CREATE TABLE push_notification_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  notification_id UUID REFERENCES push_notifications_history(id),
  event_type TEXT ('sent', 'delivered', 'opened', 'clicked'),
  event_timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

---

## 🚀 СЛЕДУЮЩИЕ ШАГИ

1. **Немедленно** (сегодня):
   - Создать миграцию БД
   - Создать PushNotificationOnboardingModal
   - Интегрировать в MobileApp

2. **На этой неделе**:
   - Реализовать выбор времени
   - Добавить сохранение в БД
   - Тестирование на PWA

3. **На следующей неделе**:
   - Platform Adapter для React Native
   - Аналитика в админ-панели
   - Полное тестирование

---

**Статус**: Готово к реализации  
**Сложность**: Средняя (80% уже реализовано)  
**Время**: 7-10 дней для полной реализации

