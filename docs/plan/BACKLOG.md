# 📋 Product Backlog UNITY-v2

**Последнее обновление**: 2025-11-08 (MVP Cleanup)
**Версия проекта**: 2.0.1 ✅
**Всего задач**: 27 | **В работе**: 0 | **Готово к старту**: 21 | **Завершено**: 7 | **Идеи**: 2

> **Единый источник истины** для всех задач проекта с приоритетами и статусами

---

## 🎉 Текущий статус проекта

**UNITY-v2 v2.0.1** - MVP Ready! ✅

**Завершённые фазы**:
- ✅ ФАЗА 1: Stabilize (146 тестов, Edge Functions оптимизированы)
- ✅ ФАЗА 2: React Native готовность (6 Platform Adapters, 11 Universal Components)
- ✅ ФАЗА 3: Тестирование (277 тестов, 100% passing)
- ✅ ФАЗА 4: Финальная проверка (0 ошибок в консоли, финальный отчёт)
- ✅ ФАЗА 5: PWA + React Native Architecture Separation (2025-10-29)
- ✅ ФАЗА 6: MVP Cleanup (Lint errors fix, Database optimization) (2025-11-08)

**Ключевые метрики**:
- Тесты: 277/277 (100% passing)
- React Native готовность: 95%+ (архитектура готова)
- TypeScript errors: 0 ✅
- Lint errors: 160 (было 3,901 → улучшение 96%) ✅
- Lint warnings: 701 (было 3,240 → улучшение 78%) ✅
- Total lint issues: 861 (было 7,141 → улучшение 88%) ✅
- Консоль браузера: 0 критических ошибок ✅
- Coverage: 85%+
- Production build: работает ИДЕАЛЬНО (10.01s)
- Database: оптимизирован (удалены 2 unused indexes)

**Документация**:
- `docs/FINAL_REPORT_2025-10-26.md`
- `docs/architecture/ARCHITECTURE_PWA_RN.md` (2025-10-29)
- `docs/plan/PRIORITY_TASKS_2025-10-29.md` (2025-10-29)
- `docs/plan/MVP_CLEANUP_COMPLETED_2025-11-08.md` (NEW - 2025-11-08)

---

## 🔥 Критический приоритет (P0)

### [TASK-028] MVP Cleanup - Подготовка к тестированию
**Статус**: ✅ Завершено (2025-11-08)
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 4-6 часов
**Фактически**: ~2 часа
**Команда**: AI Assistant
**Зависимости**: Нет
**Основание**: Подготовка MVP к тестированию 20-50 пользователей
**Отчет**: → [MVP_CLEANUP_COMPLETED_2025-11-08.md](./tasks/archive/2025-11/MVP_CLEANUP_COMPLETED_2025-11-08.md)

**Описание**:
Подготовка чистой кодовой базы для MVP запуска с реальными пользователями.

**Ключевые метрики**:
- ✅ Lint errors: 3,901 → 160 (улучшение 96%)
- ✅ Lint warnings: 3,240 → 701 (улучшение 78%)
- ✅ Total lint issues: 7,141 → 861 (улучшение 88%)
- ✅ Unused indexes: 6 → 4 (улучшение 33%)
- ✅ Production build: успешный (10.01s)
- ✅ TypeScript errors: 0

**Прогресс**:
- [x] Шаг 1: Исправление lint ошибок (автоматически + вручную)
- [x] Шаг 2: Удаление неиспользуемых индексов (subscriptions)
- [x] Шаг 3: Тестирование и проверка качества
- [x] Шаг 4: Обновление структуры задач (BACKLOG.md)
- [ ] Шаг 5: Продолжение Варианта 3 (UX + Performance + Bug fixes)

**Acceptance Criteria**:
- ✅ Lint issues <1,000 (цель достигнута: 861)
- ✅ Production build успешный
- ✅ TypeScript errors: 0
- ✅ Database оптимизирован
- ✅ Документация обновлена (CHANGELOG.md, FIX.md)

---

### [TASK-027] Протестировать Invalid Hook Call Error fix через unit tests
**Статус**: 📅 Готово к старту
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 2 часа
**Команда**: QA Team
**Зависимости**: Нет
**Основание**: Invalid Hook Call Error исправлен, требуется валидация

**Описание**:
Протестировать исправление Invalid Hook Call Error через unit tests для гарантии стабильности.

**Ключевые метрики**:
- Unit tests coverage: 85%+ → 90%+
- PWA компоненты: 100% тестирование
- React hooks: валидация корректной работы

**Прогресс**:
- [ ] Написать тесты для PWAHead, PWASplash, PWAStatus, PWAUpdatePrompt
- [ ] Проверить что React hooks работают корректно
- [ ] Запустить все тесты: `npm run test`
- [ ] Проверить coverage: `npm run test:coverage`
- [ ] Убедиться что нет регрессий

**Acceptance Criteria**:
- ✅ Все тесты проходят (277/277)
- ✅ Coverage ≥ 90%
- ✅ Нет Invalid Hook Call Error в тестах
- ✅ PWA компоненты рендерятся корректно

---

### [TASK-020] Исправить 401 error translations-api
**Статус**: ✅ Завершено (2025-10-29)
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 30 минут
**Фактически**: 30 минут
**Команда**: Backend Team
**Зависимости**: Нет
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)
**Отчет**: → [RECOMMENDATIONS.md](../RECOMMENDATIONS.md#completed)

**Описание**:
Исправить 401 Unauthorized error при запросе /languages на WelcomeScreen без авторизации.

**Ключевые метрики**:
- ✅ Консоль браузера errors: 1 → 0 (-100%)
- ✅ UX: улучшение загрузки языков

**Прогресс**:
- [x] Добавлен заголовок `apikey` во все публичные запросы к translations-api
- [x] Обновлены файлы: WelcomeScreen.tsx, settingsHandlers.ts, api.ts
- [x] Проверена консоль браузера: 0 ERROR ✅

---

### [TASK-021] Архивировать устаревшую документацию
**Статус**: ✅ Завершено (2025-10-28)
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 1 час
**Фактически**: 1 час
**Команда**: AI Assistant
**Зависимости**: Нет
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)
**Отчет**: → [RECOMMENDATIONS.md](../RECOMMENDATIONS.md#completed)

**Описание**:
Архивировать ~50 устаревших файлов документации для оптимизации структуры.

**Ключевые метрики**:
- ✅ Docs count: 165 → 159 файлов (-6)
- ✅ Архив: 80 → 86 файлов (+6)

**Прогресс**:
- [x] Архивировано 6 файлов в docs/archive/2025-10/
- [x] Обновлены ссылки в актуальных файлах

---

### [TASK-022] Обновить RECOMMENDATIONS.md
**Статус**: 📅 Готово к старту
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 1 час
**Команда**: AI Assistant
**Зависимости**: TASK-021
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)

**Описание**:
Обновить RECOMMENDATIONS.md через codebase-retrieval с топ-10 рекомендациями после аудита.

**Ключевые метрики**:
- Актуальность рекомендаций: 100%
- Приоритизация: P0/P1/P2

**Прогресс**:
- [ ] Запустить codebase-retrieval для анализа
- [ ] Создать топ-10 рекомендаций
- [ ] Приоритизировать по P0/P1/P2

---

## 🟡 Высокий приоритет (P1)





### [TASK-026] Разбить sidebar.tsx
**Статус**: ✅ Завершено (2025-10-29)
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 4 часа
**Фактически**: 4 часа
**Команда**: Frontend Team
**Зависимости**: TASK-025
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)
**Отчет**: → [FIX.md](../FIX.md#модульность)

**Описание**:
Разбить sidebar.tsx (727 строк) на компоненты по <250 строк.

**Ключевые метрики**:
- ✅ sidebar.tsx: 726 строк → 871 строка в 5 файлах (avg 174 строки/файл)
- ✅ Компонентов: 1 → 5 модулей
- ✅ AI анализ: 30-60 сек → 3-5 сек

**Прогресс**:
- [x] Создать sidebar-context.tsx (138 строк)
- [x] Создать sidebar-components-base.tsx (284 строки)
- [x] Создать sidebar-components-group.tsx (91 строка)
- [x] Создать sidebar-components-menu.tsx (300 строк)
- [x] Обновить sidebar.tsx (58 строк - main export)
- [x] Проверить консоль браузера (0 ошибок ✅)

---

### [TASK-028] Разбить i18n.ts
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 4 часа
**Команда**: Backend Team
**Зависимости**: TASK-026
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)

**Описание**:
Разбить i18n.ts (709 строк) на микросервисы по <300 строк.

**Ключевые метрики**:
- i18n.ts: 709 строк → <300 строк
- Микросервисов: 1 → 3

**Прогресс**:
- [ ] Создать i18n-loader.ts (загрузка переводов)
- [ ] Создать i18n-cache.ts (кеширование)
- [ ] Создать i18n-utils.ts (утилиты)
- [ ] Обновить импорты
- [ ] Проверить консоль браузера

---

## 🔥 Критический приоритет (P0)

### [TASK-001] PWA Push Notifications
**Статус**: 📅 Готово к старту
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 2 недели
**Команда**: Frontend Team
**Зависимости**: Supabase Realtime setup
**Детали**: → [tasks/planned/pwa-enhancements.md](tasks/planned/pwa-enhancements.md)

**Описание**:
Реализовать push-уведомления через Supabase Realtime для мотивационных карточек и напоминаний.

**Ключевые метрики**:
- Push delivery rate: 80%+
- Notification open rate: 30%+
- User engagement: +25%

**Прогресс**:
- [ ] Supabase Realtime интеграция
- [ ] Service Worker настройка
- [ ] UI для управления подписками
- [ ] Тестирование на iOS/Android

---

### [TASK-002] Offline Mode для критических функций
**Статус**: 📅 Готово к старту
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 3 недели
**Команда**: Frontend Team
**Зависимости**: Service Worker optimization
**Детали**: → [tasks/planned/pwa-enhancements.md](tasks/planned/pwa-enhancements.md)

**Описание**:
Реализовать полноценный offline-режим для создания записей, просмотра истории и достижений.

**Ключевые метрики**:
- Offline functionality: 100% критических функций
- Sync success rate: 95%+
- User satisfaction: +30%

**Прогресс**:
- [ ] IndexedDB для локального хранения
- [ ] Sync queue для отложенных операций
- [ ] Conflict resolution
- [ ] UI индикаторы offline/online

---

### [TASK-028] Разбить admin-api Edge Function
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 4 часа
**Команда**: Backend Team
**Зависимости**: TASK-027
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)

**Описание**:
Разбить admin-api (482 строки) на 2-3 Edge Functions по <300 строк.

**Ключевые метрики**:
- admin-api: 482 строки → 0 (удален)
- Edge Functions: 1 → 3

**Прогресс**:
- [ ] Создать admin-users-api (управление пользователями)
- [ ] Создать admin-settings-api (настройки)
- [ ] Создать admin-stats-api (статистика)
- [ ] Обновить импорты в админ-панели
- [ ] Деплой через Supabase MCP

---

### [TASK-029] Разбить media Edge Function
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 4 часа
**Команда**: Backend Team
**Зависимости**: TASK-028
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)

**Описание**:
Разбить media (444 строки) на 2 Edge Functions по <300 строк.

**Ключевые метрики**:
- media: 444 строки → 0 (удален)
- Edge Functions: 1 → 2

**Прогресс**:
- [ ] Создать media-upload (загрузка файлов)
- [ ] Создать media-process (обработка медиа)
- [ ] Обновить импорты в PWA
- [ ] Деплой через Supabase MCP

---

### [TASK-030] Разбить motivations Edge Function
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 4 часа
**Команда**: Backend Team
**Зависимости**: TASK-029
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)

**Описание**:
Разбить motivations (372 строки) на 2 Edge Functions по <300 строк.

**Ключевые метрики**:
- motivations: 372 строки → 0 (удален)
- Edge Functions: 1 → 2

**Прогресс**:
- [ ] Создать motivations-generate (генерация карточек)
- [ ] Создать motivations-schedule (планирование)
- [ ] Обновить импорты в PWA
- [ ] Деплой через Supabase MCP

---

## ⚡ Высокий приоритет (P1)

### [TASK-015] Оптимизация БД индексов
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 2 часа
**Команда**: Backend Team
**Зависимости**: Нет
**Детали**: → [REFACTORING_STRATEGY_2025-10-23.md](REFACTORING_STRATEGY_2025-10-23.md#13-оптимизация-бд-индексов-2-часа)
**Основание**: → [COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md](../reports/COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md)

**Описание**:
Добавить 2 индекса для foreign keys, удалить 7 неиспользуемых индексов для оптимизации производительности БД.

**Ключевые метрики**:
- Unused indexes: 7 → 0 (-100%)
- Query performance: +30%

**Прогресс**:
- [ ] Добавить индексы для foreign keys
- [ ] Удалить неиспользуемые индексы
- [ ] Проверить через get_advisors_supabase

---

### [TASK-016] Разбиение больших файлов
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 3 дня
**Команда**: Full Stack Team
**Зависимости**: TASK-014 (удаление дубликатов)
**Детали**: → [REFACTORING_STRATEGY_2025-10-23.md](REFACTORING_STRATEGY_2025-10-23.md#фаза-3-разбиение-больших-файлов-p1---3-дня)
**Основание**: → [COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md](../reports/COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md)

**Описание**:
Разбить 51 файл >300 строк на меньшие модули для AI-friendly кода: api.ts (1177 строк), server/index.tsx (1079 строк), большие компоненты.

**Ключевые метрики**:
- Файлов >300 строк: 51 → 20 (-60%)
- AI-friendly score: 75% → 95%

**Прогресс**:
- [ ] Разбить api.ts на микросервисы
- [ ] Разбить server/index.tsx на Edge Functions
- [ ] Разбить большие компоненты
- [ ] Проверить консоль браузера

---

### [TASK-017] Миграция legacy кода
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 2 дня
**Команда**: Frontend Team
**Зависимости**: TASK-014 (удаление дубликатов)
**Детали**: → [REFACTORING_STRATEGY_2025-10-23.md](REFACTORING_STRATEGY_2025-10-23.md#фаза-4-миграция-legacy-кода-p1---2-дня)
**Основание**: → [COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md](../reports/COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md)

**Описание**:
Завершить миграцию legacy кода: components/ → shared/components/, utils/ → shared/lib/, архивировать в /old.

**Ключевые метрики**:
- Legacy файлов: 62 → 0 (-100%)
- FSD compliance: 95% → 100%

**Прогресс**:
- [ ] Миграция components/ (62 файла)
- [ ] Миграция utils/ (частично)
- [ ] Архивация в /old
- [ ] Проверить консоль браузера

---

### [TASK-003] AI PDF Books Migration
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 2 недели
**Команда**: AI Team
**Зависимости**: Нет
**Детали**: → [tasks/planned/ai-pdf-books.md](tasks/planned/ai-pdf-books.md)

**Описание**:
Мигрировать компоненты PDF-книг из /old в новую архитектуру, обновить UI под shadcn/ui.

**Ключевые метрики**:
- PDF generation time: < 10s
- User satisfaction: 90%+
- Monthly PDF downloads: 1000+

**Прогресс**:
- [ ] Миграция компонентов из /old
- [ ] UI обновление под shadcn/ui
- [ ] Мобильная оптимизация
- [ ] Тестирование PDF генерации

---

### [TASK-004] Advanced Analytics Dashboard
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 4 недели
**Команда**: Frontend + Backend Team
**Зависимости**: Нет
**Детали**: → [tasks/planned/advanced-analytics.md](tasks/planned/advanced-analytics.md)

**Описание**:
Создать расширенную аналитику с графиками прогресса, трендами эмоций, статистикой привычек.

**Ключевые метрики**:
- User engagement: +40%
- Session duration: +50%
- Feature adoption: 70%+

**Прогресс**:
- [ ] Дизайн dashboard
- [ ] Графики прогресса (recharts)
- [ ] Тренды эмоций
- [ ] Статистика привычек
- [ ] Экспорт данных

---

## 📊 Средний приоритет (P2)

### [TASK-031] PWA + React Native Architecture Separation
**Статус**: ✅ Завершено (2025-10-29)
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 4-6 часов
**Фактически**: 3 часа
**Команда**: AI Assistant
**Зависимости**: Нет
**Детали**: → [ARCHITECTURE_PWA_RN.md](../architecture/ARCHITECTURE_PWA_RN.md)
**Отчет**: → [PRIORITY_TASKS_2025-10-29.md](PRIORITY_TASKS_2025-10-29.md)

**Описание**:
Исправить критическую ошибку "Invalid Hook Call" путем создания четкой архитектуры PWA + React Native с разделением кода.

**Ключевые метрики**:
- ✅ Консоль браузера: 0 errors (только 1 ожидаемая Supabase refresh token)
- ✅ Production build: работает ИДЕАЛЬНО (7.64s)
- ✅ React Native готовность: 95%+
- ✅ НЕТ circular dependencies

**Прогресс**:
- [x] Исправлено 11 Universal Components
- [x] Исправлено 2 Platform Adapters
- [x] Исправлен Supabase client (убран expo-constants)
- [x] Создана документация ARCHITECTURE_PWA_RN.md
- [x] Dev server работает БЕЗ ошибок react-native
- [x] Production build успешен

---

### [TASK-018] React Native подготовка
**Статус**: 🔄 В работе (95% готово)
**Приоритет**: 🟢 P2 - Средний
**Оценка**: 2 недели
**Команда**: Mobile Team
**Зависимости**: TASK-031 (завершена)
**Детали**: → [REFACTORING_STRATEGY_2025-10-23.md](REFACTORING_STRATEGY_2025-10-23.md#фаза-5-react-native-подготовка-p2---2-недели)
**Основание**: → [COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md](../reports/COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md)

**Описание**:
Довести React Native готовность до 100%: реализовать Native адаптеры (Storage, Media, Navigation), создать 15+ Universal Components.

**Ключевые метрики**:
- React Native готовность: 95% → 100%
- Universal Components: 11 → 15+
- Test coverage: 80%+

**Прогресс**:
- [x] Реализовать NativeStorageAdapter (DONE)
- [x] Реализовать NativeMediaAdapter (DONE)
- [x] Реализовать NativeNavigationAdapter (DONE)
- [x] Создать 11 Universal Components (DONE)
- [ ] Создать еще 4+ Universal Components
- [ ] Написать тесты

---

### [TASK-005] React Native Expo Migration
**Статус**: 📅 Готово к старту
**Приоритет**: 🟢 P2 - Средний
**Оценка**: 3-5 дней
**Команда**: Mobile Team
**Зависимости**: React Native подготовка (90% готово)
**Детали**: → [tasks/planned/react-native-expo-migration.md](tasks/planned/react-native-expo-migration.md)

**Описание**:
Мигрировать PWA на React Native Expo для нативных iOS/Android приложений.

**Ключевые метрики**:
- Migration time: 3-5 дней (вместо 7-10)
- Code reuse: 90%+
- Performance: нативная

**Прогресс**:
- [x] Platform adapters созданы (90%)
- [ ] Создание монорепо структуры
- [ ] Портирование UI компонентов
- [ ] Тестирование на iOS/Android
- [ ] Публикация в App Store/Google Play

---

### [TASK-006] Monetization System
**Статус**: 📅 Готово к старту
**Приоритет**: 🟢 P2 - Средний
**Оценка**: 4 недели
**Команда**: Full Stack Team
**Зависимости**: Нет
**Детали**: → [tasks/planned/monetization-system.md](tasks/planned/monetization-system.md)

**Описание**:
Реализовать систему монетизации с Premium подпиской, Family планом и Lifetime доступом.

**Ключевые метрики**:
- Conversion rate: 5%+
- MRR: $10K+
- Churn rate: < 5%

**Прогресс**:
- [ ] Stripe интеграция
- [ ] Premium features
- [ ] Paywall UI
- [ ] Subscription management
- [ ] Analytics

---

## 🎯 Низкий приоритет (P3)

### [TASK-007] Ecosystem Expansion
**Статус**: 💡 Идея
**Приоритет**: 🔵 P3 - Низкий
**Оценка**: 8 недель
**Команда**: Full Stack Team
**Зависимости**: React Native Migration
**Детали**: → [tasks/planned/ecosystem-expansion.md](tasks/planned/ecosystem-expansion.md)

**Описание**:
Расширить экосистему UNITY: Telegram Mini App, Desktop приложение, Browser Extension.

**Ключевые метрики**:
- Platform coverage: 5+ платформ
- User base: +50%
- Cross-platform sync: 100%

**Прогресс**:
- [ ] Telegram Mini App
- [ ] Desktop приложение (Electron)
- [ ] Browser Extension
- [ ] API для интеграций

---

### [TASK-008] Voice AI Coach
**Статус**: 💡 Идея
**Приоритет**: 🔵 P3 - Низкий
**Оценка**: 6 недель
**Команда**: AI Team
**Зависимости**: Advanced Analytics
**Детали**: Нет детального плана

**Описание**:
Создать голосового AI-коуча для персональных рекомендаций и мотивации.

**Ключевые метрики**:
- User engagement: +60%
- Session duration: +80%
- Premium conversion: +20%

**Прогресс**:
- [ ] Концепция и дизайн
- [ ] OpenAI Whisper интеграция
- [ ] Voice synthesis
- [ ] Персонализация
- [ ] Тестирование

---

### [TASK-009] Организация структуры документации
**Статус**: ✅ Завершено
**Приоритет**: 🟢 P2 - Средний
**Оценка**: 4 часа
**Команда**: Documentation Team
**Зависимости**: Нет
**Детали**: → [tasks/planned/organize-docs-structure.md](tasks/planned/organize-docs-structure.md)
**Отчет**: → [changelog/2025-10-21_docs_structure_reorganization.md](../changelog/2025-10-21_docs_structure_reorganization.md)

**Описание**:
Организовать 69 файлов из корня `/docs` в логические подпапки для улучшения навигации.

**Ключевые метрики**:
- Files organized: 69 → 3 (в корне) ✅
- Folder structure: 12 категорий ✅
- Broken links: TBD (TASK-010)

**Прогресс**:
- [x] Создание структуры папок
- [x] Перемещение файлов
- [ ] Обновление ссылок (TASK-010)
- [ ] Проверка и тестирование (TASK-010)

---

### [TASK-010] Обновление ссылок в документации
**Статус**: ✅ Завершено
**Приоритет**: 🟢 P2 - Средний
**Оценка**: 2 часа
**Фактически**: 1.5 часа
**Команда**: Documentation Team
**Зависимости**: TASK-009 (завершена)
**Детали**: → [tasks/archive/2025-10/update-documentation-links.md](tasks/archive/2025-10/update-documentation-links.md)
**Отчет**: → [changelog/archive/2025-10-21_documentation_links_cleanup.md](../changelog/archive/2025-10-21_documentation_links_cleanup.md)

**Описание**:
Обновить все внутренние ссылки в документации после реорганизации структуры (TASK-009).

**Ключевые метрики**:
- Битых ссылок: 76 → 53 (-30%) ✅
- Критичные файлы: 0 битых ссылок ✅
- Исправлено ссылок: 23 ✅

**Прогресс**:
- [x] Создать скрипт check-broken-links.sh
- [x] Запустить скрипт и найти все битые ссылки (76 шт.)
- [x] Исправить битые ссылки в docs/README.md (4 ссылки)
- [x] Исправить битые ссылки в docs/INDEX.md (16 ссылок)
- [x] Исправить битые ссылки в docs/plan/ (1 ссылка)
- [x] Исправить битые ссылки в docs/architecture/ (3 ссылки)
- [x] Проверить финальный результат (53 битых ссылки, некритичные)
- [x] Создать отчет в changelog/archive/

---

### [TASK-011] Улучшение тестовых данных для демо-аккаунта
**Статус**: 📅 Готово к старту
**Приоритет**: 🟢 P2 - Средний
**Оценка**: 1 неделя
**Команда**: Backend + QA Team
**Зависимости**: Нет
**Детали**: → [testing/TEST_ACCOUNTS.md](../testing/TEST_ACCOUNTS.md)

**Описание**:
Создать реалистичные демо-данные для аккаунта Anna (an@leadshunter.biz) для демонстраций и UI/UX тестирования.

**Ключевые метрики**:
- Demo entries: 30+ за последний месяц
- Achievements: 10+ разных категорий
- Media files: 5+ фото/аудио
- AI analysis: 100% записей проанализировано

**Прогресс**:
- [ ] Создать демо-данные для Anna:
  - [ ] Заполнить 30+ записей за последний месяц
  - [ ] Создать 10+ достижений разных категорий
  - [ ] Добавить медиафайлы (фото, аудио)
  - [ ] Сгенерировать AI-анализ для всех записей
- [ ] Добавить скриншоты в документацию:
  - [ ] Скриншот входа в мобильное приложение
  - [ ] Скриншот админ-панели
  - [ ] Скриншот демо-данных Anna
- [ ] Создать скрипт для сброса демо-данных:
  - [ ] `scripts/reset-demo-account.sh`
  - [ ] Автоматическое заполнение данных для Anna
  - [ ] Документация по использованию скрипта

---

## 📊 Статистика

### По приоритетам
- 🔴 P0 (Критические): 4 задачи (1 завершена - TASK-031)
- 🟡 P1 (Высокие): 5 задач
- 🟢 P2 (Средние): 5 задач (1 в работе - TASK-018)
- 🔵 P3 (Низкие): 2 задачи

### По статусам
- ✅ Завершено: 3 задачи (TASK-009, TASK-010, TASK-031)
- 🔄 В работе: 1 задача (TASK-018 - 95% готово)
- 📅 Готово к старту: 13 задач
- 💡 Идея: 2 задачи

### По командам
- Frontend Team: 4 задачи
- Backend Team: 3 задачи
- AI Team: 2 задачи (1 завершена - TASK-031)
- Mobile Team: 2 задачи (1 в работе - TASK-018)
- Full Stack Team: 3 задачи
- Frontend + Backend Team: 1 задача
- Backend + QA Team: 1 задача
- Documentation Team: 2 задачи (2 завершены)

### Новые задачи из аудита (23 октября 2025)
- TASK-012: Supabase Security Fixes (P0)
- TASK-013: RLS Политики Оптимизация (P0)
- TASK-014: Удаление критичных дубликатов (P0)
- TASK-015: Оптимизация БД индексов (P1)
- TASK-016: Разбиение больших файлов (P1)
- TASK-017: Миграция legacy кода (P1)
- TASK-018: React Native подготовка (P2)

---

## 🔄 Правила обновления

### Ежедневно
- Обновлять статусы задач
- Обновлять прогресс (чекбоксы)
- Добавлять новые задачи из спринтов

### Еженедельно
- Удалять завершенные задачи (переносить в changelog)
- Пересматривать приоритеты
- Обновлять оценки

### Ежемесячно
- Архивировать старые задачи
- Обновлять статистику
- Review backlog с командой

---

**Автор**: Product Team UNITY
**Дата создания**: 21 октября 2025
**Последнее обновление**: 23 октября 2025 (добавлено 7 задач из аудита)

