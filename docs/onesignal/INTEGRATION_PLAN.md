# OneSignal Integration Plan — UNITY-v2

**Версия:** 1.0  
**Статус:** Черновик (для детализации в задачах Notion)  
**Дата:** 2025-11-17

---

## 1. Цель интеграции

- Сделать **OneSignal основным каналом доставки** (push, email, in‑app, SMS).
- Сохранить и использовать существующий онбординг, настройки и метрики UNITY.
- Дать маркетингу возможность **самостоятельно запускать Journeys** без изменения кода.

---

## 2. Фазы интеграции (high level)

1. **Foundation (база):** SDK, конфигурация, связывание user_id.
2. **Events & Attributes:** отправка ключевых событий/атрибутов из UNITY в OneSignal.
3. **Channel Migration:** перенос основных сценариев пушей + email в Journeys.
4. **Cleanup:** упрощение/отключение старого push‑кода и документации.

---

## 3. Фаза 1 — Foundation

**Цель:** OneSignal подключен, знает пользователей UNITY и их устройства.

### 3.1. Конфигурация

- Создать OneSignal App для PROD (и при необходимости для STAGE).
- Зафиксировать ключи/ID в `.env` / Supabase config (НЕ в коде):
  - APP ID,
  - REST API Key,
  - Web Push настройки (origin, VAPID).
- Добавить запись в `docs/onesignal/CONFIG.md` (по мере необходимости).

### 3.2. SDK интеграция (Web + PWA)

- Подключить OneSignal Web SDK в PWA:
  - Инициализация в основном entry (Vite + React),
  - Регистрация service worker от OneSignal (совместимость с текущим SW продумать отдельно).
- В `PushNotificationOnboardingModal` заменить кастомный `subscribeToPush` на вызовы OneSignal SDK:
  - запрос разрешения,
  - привязка устройства к `external_id` (user_id из Supabase),
  - установка тегов (язык, тип аккаунта, базовые предпочтения).

### 3.3. Подготовка React Native (будущее)

- Спроектировать Platform Adapter для push:
  - `platform/push/push.web.ts` → OneSignal Web SDK,
  - `platform/push/push.native.ts` → OneSignal RN SDK (Expo).
- Не обязательно реализовывать сразу, но архитектура должна быть готова.

---

## 4. Фаза 2 — Events & Attributes

**Цель:** OneSignal получает все данные, нужные для умных Journeys.

### 4.1. Ключевые события

Минимальный набор событий, отправляемых в OneSignal (через SDK/API):

- `user_registered` — пользователь создал аккаунт.
- `onboarding_completed` — завершён онбординг (флаг `has_completed_onboarding`).
- `first_entry_created` — первая запись в дневнике.
- `entry_created` — любая новая запись.
- `weekly_report_generated` — создан недельный AI‑отчёт.
- `streak_milestone` — достижение streak (3/7/14/30/60/90/180/365).
- `premium_activated` / `premium_cancelled` — изменение статуса Premium.

### 4.2. Атрибуты пользователя

Синхронизировать в OneSignal (через теги/attributes):

- `unity_user_id` (external_id),
- `language` (ru/en/es/de/fr/zh/ja),
- `is_premium` (true/false),
- `has_completed_onboarding` (true/false),
- `entries_count`, `current_streak`, `longest_streak` (по возможности),
- `notification_prefs` (daily/weekly/achievements/motivational),
- `preferred_times` (morning/evening).

Эти атрибуты используются в сегментах OneSignal и в условиях Journeys.

---

## 5. Фаза 3 — Channel Migration (Journeys)

**Цель:** основные маркетинговые сценарии живут в OneSignal Journeys.

### 5.1. Стартовые сценарии

Подробности см. в `MARKETING_SCENARIOS.md`, но для плана:

1. **Onboarding Journey (P1)** — серия push/email для новых пользователей.
2. **Re-Engagement Journey (P1)** — возврат пользователей после 3/7/14 дней простоя.
3. **Premium Upsell Journey (P2)** — конверсия активных Free в Premium.
4. **Streak & Achievements Journey (P2)** — празднование и поддержка streak.
5. **Weekly Summary Journey (P3)** — напоминание/доставка отчётов.

Каждый сценарий:

- Использует триггеры/условия на событиях и атрибутах из Фазы 2.
- Конфигурируется в OneSignal UI (маркетинг без изменения кода).

### 5.2. Перенос существующих cron‑push

- Определить, какие пуши сейчас шлёт `push-scheduled`:
  - daily reminder,
  - weekly report,
  - motivational.
- Для каждого решить:
  - заменить на Journey в OneSignal,
  - или оставить как сугубо продуктовую фичу (минимальный набор).

---

## 6. Фаза 4 — Cleanup

**Цель:** убрать дубли и старый код, зафиксировав новый SoT в документации.

### 6.1. Код

- Edge Functions:
  - `push-sender` — пометить как `DEPRECATED`, перевести на вызов OneSignal API или удалить.
  - `push-scheduled` — либо упростить (только продуктовые триггеры), либо выключить.
  - `push-campaign-sender`, маркетинговые части `unified-notification-sender` — выключить.
- Frontend:
  - убрать/упростить UI для ручного создания кампаний, если оно заменено Journeys.

### 6.2. Документация

- Обновить старые файлы в `docs/architecture/`:
  - пометить push‑архитектуру как **legacy**,
  - сослаться на `docs/onesignal/*` как на текущий источник истины.
- Проверить `docs/archive/*` на дубли и устаревшие планы — оставить только ценные исторические записи.

---

