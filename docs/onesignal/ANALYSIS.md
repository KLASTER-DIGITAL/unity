# OneSignal vs. Custom Push in UNITY-v2 — Анализ и стратегия

**Версия:** 1.0  
**Статус:** Черновик (архитектурное решение принято)  
**Дата:** 2025-11-17

---

## 1. Контекст

UNITY — AI-дневник с фокусом на привычки, достижения, AI-отчёты и премиум‑подписку. Сейчас:

- Есть **собственная push-система**: Edge Functions (`push-*`, `unified-notification-sender`), таблицы `push_subscriptions`, `push_campaigns`, сложный фронтенд.
- Push до телефона **нестабилен** (особенно Web Push), отладка занимает дни.
- Уже есть мощная **i18n-система**, streak, achievements, weekly AI‑reports, Freemium → Premium логика.
- Цель фаундера: **минимум тратить время на программирование пушей**, максимум — на маркетинг, Journeys и рост.

---

## 2. Текущая кастомная push-система UNITY (high level)

**Фронтенд:**
- Онбординг: `OnboardingScreen*`, `PushNotificationOnboardingModal` собирают язык, привычки, слоты времени.
- Управление подписками: `PushSubscriptionManager`, список устройств, статусы и настройки в профиле.
- Админ‑UI: разделы для кампаний, сегментов, аналитики, истории пушей.

**Backend (Supabase Edge Functions):**
- `push-sender` — низкоуровневая отправка Web Push (VAPID, шифрование).
- `push-scheduled` — крон‑кампании (daily, weekly, motivational).
- `push-realtime-trigger` — push по событиям (новая запись, streak, achievements).
- `unified-notification-sender` — единая точка маршрутизации (Web Push, Telegram, Email fallback).
- `push-analytics-api`, `push-campaign-sender` и др.

**БД:**
- `push_subscriptions` — хранение endpoint + ключей для Web Push.
- `push_campaigns`, шаблоны и статистика кампаний.
- `profiles.notification_settings` + `notification_time_preferences` — предпочтения пользователя.

**Проблемы:**
- Сложность отладки Web Push (VAPID, сервис‑воркер, разные браузеры, устройства).
- Дубли в коде и документации (несколько панелей аналитики/тестов).
- Сильно завязан на Web Push, но не покрывает полноценно email/in‑app/SMS.

---

## 3. Возможности OneSignal (для UNITY)

OneSignal даёт:

- **Каналы:** Mobile & Web Push, Email, In‑App, SMS, RCS.
- **Journeys:** визуальный конструктор сценариев (онбординг, ре‑активация, upsell).
- **Segmentation:** таргетинг по атрибутам/событиям (язык, streak, premium, активность).
- **A/B‑тесты:** тексты, тайминги, офферы без изменения кода.
- **Analytics:** CTR пушей, конверсии, retention.
- **Localization:** многозадачные сообщения с контентом по locale.

Для UNITY это означает:

- Возможность **быстро запускать и менять маркетинговые сценарии** без доработки кода.
- Единый центр для push + email + in‑app.
- Снижение техподдержки по доставке уведомлений.

---

## 4. Стратегическое решение для UNITY

**Решение фаундера (подтверждено):**

> OneSignal становится **основным каналом доставки** (push, email, in‑app, SMS).
> UNITY отвечает за **продуктовую логику, онбординг, настройки и данные**.

Отсюда **гибридный подход**:

- UI онбординга, настройки, streak, achievements, Premium — реализованы в UNITY.
- Все тупо “отправить сообщение пользователю Х” — делаем через OneSignal.
- Journeys, кампании, мотивация, A/B, аналитика — в OneSignal Dashboard.

---

## 5. Границы ответственности

### 5.1. UNITY (код и БД)

- Регистрация, авторизация, выбор языка.
- Онбординг (экраны 1–4, кабинет, `has_completed_onboarding`).
- Хранение настроек: `notification_settings`, `notification_time_preferences`.
- Модель Freemium/Premium (`is_premium`, лимиты, AI‑фичи, отчёты).
- Расчёт streak, achievements, weekly AI‑отчётов.
- Отправка событий в OneSignal (через SDK/API).

### 5.2. OneSignal

- Регистрация устройств и токенов.
- Доставка push/email/in‑app/SMS.
- Journeys: онбординг‑цепочки, ре‑активация, upsell Premium, win‑back.
- Сегментация, частотные ограничения, best‑time delivery.
- Маркетинговая аналитика и A/B‑тесты.

---

## 6. Что оставляем / что упрощаем в текущей системе

**Оставляем как ядро:**
- Онбординг UI и логика установки флагов/настроек.
- Профиль пользователя и все поля, связанные с уведомлениями и Premium.
- Edge‑функции, считающие метрики (streak, achievements, weekly/stats).

**Переводим в OneSignal:**
- Маркетинговые рассылки (daily/weekly мотивация, re‑engagement, upsell).
- Email‑онбординг и промо.
- Ре‑активация после паузы (на основе событий и атрибутов).

**Постепенно выключаем/упрощаем:**
- `push-sender`, `push-scheduled`, `push-campaign-sender` как основной delivery‑слой.
- Сложный admin UI для кампаний/сегментов (замена ссылкой на OneSignal Dashboard + минимальные настройки в UNITY).
- Таблицу `push_subscriptions` — оставляем как аналитический backup или удаляем после полной миграции.

---

## 7. Риски и преимущества

**Риски:**
- Vendor lock‑in (зависимость от OneSignal pricing и SLA).
- Необходимость аккуратно мигрировать существующие кампании и настройки.

**Преимущества:**
- Существенная экономия времени фаундера (без отладки Web Push/Email‑движка).
- Быстрый запуск сложных сценариев (Journeys, multi‑channel).
- Единый центр аналитики по engagement/retention/monetизации.

---

## 8. Рекомендации (как профессиональный подход)

1. **Оставить UNITY “мозгом” продукта**, а OneSignal — “мускулами” доставки.
2. **Сначала интегрировать события и атрибуты**, затем переносить кампании (не наоборот).
3. Использовать OneSignal **только для того, что реально ускоряет маркетинг** (Journeys, email, A/B), а не пытаться дублировать всю бизнес‑логику внутрь OneSignal.
4. Вести **Single Source of Truth** для push‑архитектуры в папке `docs/onesignal/` и постепенно помечать старые push‑документы как `DEPRECATED`.
5. Не пытаться “идеально переписать всё сразу” — идти итерациями (см. `INTEGRATION_PLAN.md` и `MIGRATION_STRATEGY.md`).

