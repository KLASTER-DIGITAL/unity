# OneSignal Migration Strategy — UNITY-v2

**Версия:** 1.0  
**Дата:** 2025-11-17  
**Статус:** Черновик (для синхронизации с Notion Tasks)

---

## 1. Цель миграции

Перевести систему уведомлений UNITY с кастомного push‑движка на модель:

- **OneSignal = основной канал доставки** и маркетинговой автоматизации.
- **UNITY = источник данных, онбординга, логики Premium и метрик**.

При этом:
- убрать дубли в коде и документации,
- не ломать существующие фичи (streak, achievements, weekly reports),
- сохранить контроль супер‑админа над критичными настройками.

---

## 2. Матрица "оставить / упростить / отключить"

| Компонент / модуль | Текущее назначение | Будущее состояние | Приоритет |
|--------------------|--------------------|-------------------|-----------|
| `PushNotificationOnboardingModal` | Онбординг push, выбор времени, обновление профиля | **Оставить**, переподключить к OneSignal SDK вместо кастомного `subscribeToPush` | P0 |
| `profiles.notification_settings` / `notification_time_preferences` | Предпочтения уведомлений | **Оставить** как SoT, синхронизировать в OneSignal как атрибуты | P0 |
| Edge Function `push-realtime-trigger` | Реакция на события (новая запись, streak) и отправка push | **Разделить:** расчёт метрик оставить, отправку перенести на вызов OneSignal API | P1 |
| Edge Function `push-scheduled` | Крон‑кампании (daily/weekly/motivation) | **Перенести логику кампаний в Journeys OneSignal**, функцию либо упростить, либо отключить | P1 |
| Edge Function `push-sender` | Низкоуровневый Web Push через VAPID | **DEPRECATED** после интеграции OneSignal, перевести вызовы на OneSignal или удалить | P1 |
| Edge Function `unified-notification-sender` | Маршрутизация Web Push / Telegram / Email | **Пересмотреть:** оставить только то, что не может делать OneSignal; push/email маркетинговые убрать | P2 |
| Таблица `push_subscriptions` | Хранение Web Push endpoint/keys | После миграции — **только аналитика / backup** или удалить после периода стабилизации | P2 |
| Таблица `push_campaigns` и их UI | Собственные кампании и аналитика | **Заменить** на Journeys + Analytics в OneSignal, UI в админке упростить до ссылок/конфигурации | P2 |
| `docs/architecture/PUSH_SYSTEM*.md` | Текущая архитектура кастомного пуша | Пометить как **LEGACY**, добавить ссылку на `docs/onesignal/` как новый SoT | P1 |
| `docs/new/cards-and-push-tech.md` и др. | Детали старых push‑экспериментов | Перенести только полезные идеи в `ANALYSIS.md`, остальное оставить в архиве | P3 |

---

## 3. Конфликтующие задачи (для Notion)

Категории задач, которые **конфликтуют с новой стратегией** и должны быть отменены/заморожены:

1. **Развитие кастомного push‑движка:**
   - Новые Edge Functions для кампаний, сегментов, отправки Web Push.
   - Усложнение `push-sender`, дополнительное шифрование и манипуляции с VAPID.
   - Добавление новых UI‑слоёв для ручного создания кампаний в админке.

2. **Собственный email‑движок:**
   - Отдельные Edge Functions для отправки email‑кампаний.
   - Сложные шаблонизаторы писем внутри кода UNITY.

3. **Дублирующая аналитика и UI:**
   - Новые панели аналитики push/email, если то же самое можно сделать в OneSignal.
   - Дублирующие компоненты типа нескольких `PushAnalyticsDashboard`.

**Рекомендация:**
- В Notion создать Epic "Deprecate Custom Push" и явно пометить такие задачи как `Cancelled (migrated to OneSignal)`.

---

## 4. Новые задачи для Notion (скелет)

Предлагаемый набор задач (для ручного переноса в Notion Tasks):

1. **Epic: OneSignal Integration**
   - Task: Настроить OneSignal App и ключи (P0).
   - Task: Подключить OneSignal Web SDK в PWA (P0).
   - Task: Переподключить `PushNotificationOnboardingModal` к OneSignal (P0).
   - Task: Реализовать отправку событий/атрибутов в OneSignal (P1).
   - Task: Сконфигурировать Journeys для сценариев из `MARKETING_SCENARIOS.md` (P1).
   - Task: Обновить документацию `docs/architecture/` и пометить legacy‑файлы (P1).
   - Task: Отключить/упростить `push-sender`, `push-scheduled` после стабилизации (P2).

2. **Epic: Marketing Journeys**
   - Task: Journey "Onboarding 7 days" (P1).
   - Task: Journey "Re-Engagement 3/7/14" (P1).
   - Task: Journey "Premium Upsell" (P2).
   - Task: Journey "Streak & Achievements" (P2).
   - Task: Journey "Weekly Summary" (P3).

---

## 5. Документация и дубли

Для наведения порядка:

1. **Single Source of Truth для push/OneSignal:**
   - `docs/onesignal/ANALYSIS.md`
   - `docs/onesignal/INTEGRATION_PLAN.md`
   - `docs/onesignal/MARKETING_SCENARIOS.md`

2. **Legacy:**
   - Все старые push‑документы в `docs/architecture/` и `docs/archive/2025-11/analysis/*` пометить как `LEGACY` / `DEPRECATED` и добавить ссылку на `docs/onesignal/*`.

3. **Кодовые дубли:**
   - Найти дублирующиеся компоненты (`PushNotificationTester`, `PushAnalyticsDashboard` в разных путях) и оставить **только один** вариант.
   - Внести решение в `FIX.md` и/или отдельный changelog.

---

## 6. Прогресс и контроль

- Все реальные изменения (код/Edge Functions/конфиг) должны сопровождаться обновлением соответствующих разделов в `docs/onesignal/`.
- Перед удалением legacy‑кода — убедиться, что эквиваличная функциональность уже реализована в OneSignal и проверена на устройстве.

