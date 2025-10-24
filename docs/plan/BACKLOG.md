# 📋 Product Backlog UNITY-v2

**Последнее обновление**: 2025-10-24
**Всего задач**: 24 | **В работе**: 0 | **Готово к старту**: 21 | **Завершено**: 2 | **Идеи**: 2

> **Единый источник истины** для всех задач проекта с приоритетами и статусами

---

## 🔥 Критический приоритет (P0)

### [TASK-019] Включить Leaked Password Protection
**Статус**: 📅 Готово к старту
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 10 минут
**Команда**: Backend Team
**Зависимости**: Нет
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)

**Описание**:
Включить Leaked Password Protection в Supabase Dashboard для защиты от скомпрометированных паролей.

**Ключевые метрики**:
- Supabase Security WARN: 1 → 0 (-100%)
- Security score: 100%

**Прогресс**:
- [ ] Зайти в Supabase Dashboard → Authentication → Password Protection
- [ ] Включить "Leaked Password Protection"
- [ ] Проверить через get_advisors_supabase

---

### [TASK-020] Исправить 401 error translations-api
**Статус**: 📅 Готово к старту
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 30 минут
**Команда**: Backend Team
**Зависимости**: Нет
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)

**Описание**:
Исправить 401 Unauthorized error при запросе /languages на WelcomeScreen без авторизации.

**Ключевые метрики**:
- Консоль браузера errors: 1 → 0 (-100%)
- UX: улучшение загрузки языков

**Прогресс**:
- [ ] Добавить публичный endpoint GET /languages без авторизации
- [ ] Или добавить fallback в WelcomeScreen
- [ ] Проверить консоль браузера через Chrome MCP

---

### [TASK-021] Архивировать устаревшую документацию
**Статус**: 📅 Готово к старту
**Приоритет**: 🔴 P0 - Критический
**Оценка**: 1 час
**Команда**: AI Assistant
**Зависимости**: Нет
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)

**Описание**:
Архивировать ~50 устаревших файлов документации для оптимизации структуры.

**Ключевые метрики**:
- Documentation Ratio: 0.34:1 → 0.23:1 (-32%)
- Docs count: 150 → ~100 (-33%)

**Прогресс**:
- [ ] Переместить 4 дублирующихся отчета в docs/archive/2025-10/
- [ ] Переместить 4 устаревших плана в docs/archive/2025-10/
- [ ] Переместить 4 устаревших отчета changelog/ в docs/archive/2025-10/
- [ ] Переместить ~38 избыточных файлов по фичам в docs/archive/2025-10/
- [ ] Обновить ссылки в актуальных файлах (если есть)

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

### [TASK-023] Объединить permissive RLS policies
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 2 часа
**Команда**: Backend Team
**Зависимости**: TASK-019, TASK-020
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)

**Описание**:
Объединить 2 permissive policies на таблице admin_settings для оптимизации производительности.

**Ключевые метрики**:
- Supabase Performance WARN: 1 → 0 (-100%)
- RLS policies: 2 → 1 (-50%)

**Прогресс**:
- [ ] Объединить admin_full_access_admin_settings и authenticated_read_pwa_settings
- [ ] Тестировать доступ для super_admin и user
- [ ] Проверить через get_advisors_supabase

---

### [TASK-024] Удалить unused indexes
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 1 час
**Команда**: Backend Team
**Зависимости**: TASK-023
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)

**Описание**:
Удалить 4 неиспользуемых индекса для освобождения ресурсов БД.

**Ключевые метрики**:
- Unused indexes: 4 → 0 (-100%)
- DB storage: -5%

**Прогресс**:
- [ ] Удалить idx_media_files_entry_id
- [ ] Удалить idx_media_files_user_id
- [ ] Удалить idx_push_notifications_history_sent_by
- [ ] Удалить idx_usage_user_id_v2
- [ ] Проверить через get_advisors_supabase

---

### [TASK-025] Модулизировать index.css
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 1 день (8 часов)
**Команда**: Frontend Team
**Зависимости**: TASK-024
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)

**Описание**:
Разбить index.css (5167 строк) на модули по <200 строк для AI-friendly кода.

**Ключевые метрики**:
- index.css: 5167 строк → 0 (удален)
- Модулей CSS: 0 → ~26 файлов
- AI-friendly score: +20%

**Прогресс**:
- [ ] Создать src/shared/styles/base/ (reset, typography, colors)
- [ ] Создать src/shared/styles/components/ (buttons, forms, cards)
- [ ] Создать src/shared/styles/layout/ (grid, flex, spacing)
- [ ] Создать src/shared/styles/themes/ (light, dark)
- [ ] Обновить импорты в App.tsx
- [ ] Проверить консоль браузера

---

### [TASK-026] Разбить sidebar.tsx
**Статус**: 📅 Готово к старту
**Приоритет**: 🟡 P1 - Высокий
**Оценка**: 4 часа
**Команда**: Frontend Team
**Зависимости**: TASK-025
**Основание**: → [AUDIT_REPORT_2025-10-24.md](../reports/AUDIT_REPORT_2025-10-24.md)

**Описание**:
Разбить sidebar.tsx (727 строк) на компоненты по <250 строк.

**Ключевые метрики**:
- sidebar.tsx: 727 строк → <250 строк
- Компонентов: 1 → 4

**Прогресс**:
- [ ] Создать SidebarHeader.tsx
- [ ] Создать SidebarNavigation.tsx
- [ ] Создать SidebarFooter.tsx
- [ ] Обновить импорты
- [ ] Проверить консоль браузера

---

### [TASK-027] Разбить i18n.ts
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

### [TASK-018] React Native подготовка
**Статус**: 📅 Готово к старту
**Приоритет**: 🟢 P2 - Средний
**Оценка**: 2 недели
**Команда**: Mobile Team
**Зависимости**: Нет
**Детали**: → [REFACTORING_STRATEGY_2025-10-23.md](REFACTORING_STRATEGY_2025-10-23.md#фаза-5-react-native-подготовка-p2---2-недели)
**Основание**: → [COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md](../reports/COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md)

**Описание**:
Довести React Native готовность до 100%: реализовать Native адаптеры (Storage, Media, Navigation), создать 15+ Universal Components.

**Ключевые метрики**:
- React Native готовность: 90% → 100%
- Universal Components: 5 → 15+
- Test coverage: 80%+

**Прогресс**:
- [ ] Реализовать NativeStorageAdapter
- [ ] Реализовать NativeMediaAdapter
- [ ] Реализовать NativeNavigationAdapter
- [ ] Создать 10+ Universal Components
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
- 🔴 P0 (Критические): 5 задач (+3 новых из аудита)
- 🟡 P1 (Высокие): 5 задач (+3 новых из аудита)
- 🟢 P2 (Средние): 5 задач (+1 новая из аудита)
- 🔵 P3 (Низкие): 2 задачи

### По статусам
- ✅ Завершено: 2 задачи
- 🔄 В работе: 0 задач
- 📅 Готово к старту: 14 задач (+7 новых из аудита)
- 💡 Идея: 2 задачи

### По командам
- Frontend Team: 4 задачи (+2 новых)
- Backend Team: 3 задачи (+3 новых)
- AI Team: 2 задачи
- Mobile Team: 2 задачи (+1 новая)
- Full Stack Team: 3 задачи (+1 новая)
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

