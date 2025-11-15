# 📚 UNITY-v2 - Documentation Index

**Дата**: 2025-11-15  
**Версия**: 1.0  
**Статус**: Активный индекс документации  
**Цель**: Single Source of Truth для всей документации проекта

---

## 📊 Статистика

**Всего документов**: ~120 файлов  
**Активных**: ~60 файлов  
**Архивных**: ~60 файлов  
**Модулей**: 15 (cards, push, achievements, reports, ai-admin, pdf-books, offline, widgets, i18n, mobile, pwa, admin, testing, architecture, guides)

---

## 🎯 Главные документы (START HERE)

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/new/unity-ai-planner-guide.md` | guide | ✅ active | **ГЛАВНЫЙ ГАЙД** для AI-агента: 4-шаговый процесс планирования |
| `docs/unity-roadmap-tasks.md` | roadmap | ✅ active | **ROADMAP** всех задач P0/P1/P2/P3 с зависимостями |
| `docs/README.md` | overview | ✅ active | Общий обзор проекта UNITY-v2 |
| `.augment/rules/unity.md` | rules | ✅ active | Правила разработки UNITY-v2 (автоматически применяются) |
| `docs/INDEX.md` | index | ⚠️ partial | Старый индекс (частично устарел, заменен на docs-index.md) |

---

## 🃏 Модуль: Motivation Cards

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/new/cards-and-push-tech.md` | tech | ✅ active | **ГЛАВНЫЙ** технический документ: карточки + push система |
| `docs/new/cards-and-push-scenarios.md` | scenarios | ✅ active | Сценарии карточек и push-уведомлений |
| `docs/new/ai-prompts-cards.md` | prompts | ✅ active | Библиотека AI-промптов для карточек |
| `docs/architecture/MOTIVATION_CARDS_SYSTEM.md` | architecture | ⚠️ partial | Архитектура карточек (частично устарела, см. cards-and-push-tech.md) |

**Статус реализации**: 70% (окно 48h вместо 24h, нет типов карточек, хардкод промптов)

---

## 🔔 Модуль: Push Notifications

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/new/cards-and-push-tech.md` | tech | ✅ active | **ГЛАВНЫЙ** технический документ (объединен с карточками) |
| `docs/architecture/PUSH_SYSTEM.md` | architecture | ✅ active | Архитектура push-системы (VAPID, webhooks, cron) |
| `docs/guides/PUSH_NOTIFICATIONS_SCHEDULING_GUIDE.md` | guide | ✅ active | Гайд по настройке cron jobs |
| `docs/guides/PWA_PUSH_TESTING.md` | guide | ✅ active | Гайд по тестированию push в PWA |
| `docs/guides/UNIFIED_NOTIFICATION_SENDER_GUIDE.md` | guide | ✅ active | Гайд по unified-notification-sender Edge Function |
| `docs/architecture/PUSH_RATE_LIMITING.md` | architecture | ✅ active | Rate limiting для push |
| `docs/architecture/PUSH_SENTRY_MONITORING.md` | architecture | ✅ active | Sentry мониторинг push |
| `docs/analysis/README_PUSH_NOTIFICATIONS.md` | analysis | 🗄️ archive | Старый анализ (2025-10), заменен на cards-and-push-tech.md |

**Статус реализации**: 80% (нет health-check, нет типа new_insights, нет achievement_unlocked)

---

## 🏆 Модуль: Achievements

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/new/achievements-review-and-plan.md` | review-and-plan | ✅ active | **ГЛАВНЫЙ** документ: текущее состояние + план развития |
| `docs/new/achievements-and-reports.md` | concept | ✅ active | Общая концепция достижений и отчетов |
| `docs/features/ACHIEVEMENTS_SYSTEM.md` | old-spec | 🗄️ archive | Старая спецификация (2025-10), заменена на achievements-review-and-plan.md |

**Статус реализации**: 40% (client-side только, нет БД, нет персистентности)

---

## 📊 Модуль: Reports

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/new/reports-review-and-plan.md` | review-and-plan | ✅ active | **ГЛАВНЫЙ** документ: текущее состояние + план развития |
| `docs/new/achievements-and-reports.md` | concept | ✅ active | Общая концепция достижений и отчетов |
| `docs/features/REPORTS_SYSTEM.md` | old-spec | 🗄️ archive | Старая спецификация (2025-10), заменена на reports-review-and-plan.md |

**Статус реализации**: 30% (client-side только, нет БД, нет AI-отчетов)

---

## 🤖 Модуль: AI Admin (AI Control Center)

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/new/ai-superadmin-settings.md` | prd | ✅ active | **ГЛАВНЫЙ** документ: спецификация AI Control Center |
| `docs/features/ai-usage-system.md` | old-spec | 🗄️ archive | Старая спецификация AI Usage (2025-10), заменена на ai-superadmin-settings.md |

**Статус реализации**: 20% (есть AISettingsTab, но нет таблицы ai_operations)

---

## 📚 Модуль: PDF Books

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/new/ai-pdf-books.md` | tech | ⚠️ missing | **ОТСУТСТВУЕТ** (упоминается в unity-ai-planner-guide.md) |

**Статус реализации**: 10% (есть таблица books_archive, нет AI-генерации)

---

## 📱 Модуль: Mobile (React Native)

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/mobile/REACT_NATIVE_READINESS_REPORT.md` | report | ✅ active | Отчет о готовности к React Native (95%+) |
| `docs/mobile/REACT_NATIVE_MIGRATION_PLAN.md` | plan | ✅ active | План миграции на React Native Expo |
| `docs/mobile/REACT_NATIVE_DESIGN_SYSTEM.md` | design | ✅ active | Design System для React Native |
| `docs/mobile/REACT_NATIVE_EXPO_SETUP.md` | guide | ✅ active | Гайд по настройке Expo |
| `docs/mobile/TESTING_CHECKLIST.md` | checklist | ✅ active | Чеклист тестирования React Native |
| `docs/architecture/REACT_NATIVE_ARCHITECTURE_ANALYSIS.md` | architecture | ✅ active | Анализ архитектуры React Native |

**Статус реализации**: 95% (Platform Adapters готовы, Universal Components частично)

---

## 🌐 Модуль: i18n

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/i18n/I18N_SYSTEM_DOCUMENTATION.md` | documentation | ✅ active | Полная документация i18n системы |
| `docs/i18n/I18N_API_REFERENCE.md` | api | ✅ active | API Reference для i18n |
| `docs/i18n/I18N_README.md` | readme | ✅ active | README для i18n |

**Статус реализации**: 90% (PWA готово, React Native нужен Platform Adapter)

---

## 🏗️ Модуль: Architecture

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/architecture/MASTER_PLAN.md` | master-plan | ✅ active | Мастер-план архитектуры UNITY-v2 |
| `docs/architecture/ARCHITECTURE_PWA_RN.md` | architecture | ✅ active | Гибридная архитектура PWA + React Native |
| `docs/architecture/ROLE_BASED_ACCESS_CONTROL.md` | architecture | ✅ active | RBAC система (super_admin vs user) |
| `docs/architecture/SESSION_MANAGEMENT.md` | architecture | ✅ active | Управление сессиями |
| `docs/architecture/TWO_FACTOR_AUTHENTICATION.md` | architecture | ✅ active | 2FA система |
| `docs/architecture/DB_HEALTH_MONITORING.md` | architecture | ✅ active | Мониторинг здоровья БД |
| `docs/architecture/INDEXEDDB_CACHING.md` | architecture | ✅ active | IndexedDB кэширование для offline |
| `docs/architecture/ANIMATION_SYSTEM.md` | architecture | ✅ active | Система анимаций (Framer Motion + Reanimated) |
| `docs/architecture/CSS_ARCHITECTURE_AI_FRIENDLY.md` | architecture | ✅ active | AI-friendly CSS архитектура |
| `docs/architecture/REACT_19_MIGRATION.md` | architecture | ✅ active | План миграции на React 19 |
| `docs/architecture/REACT_VERSIONS_STRATEGY.md` | architecture | ✅ active | Стратегия версий React (18.3.1 PWA, 19.1.0 RN) |

**Статус**: Актуальные документы, регулярно обновляются

---

## 📖 Модуль: Guides

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/guides/DEPLOYMENT.md` | guide | ✅ active | Гайд по деплою на Vercel |
| `docs/guides/QUALITY_CHECKS_WORKFLOW.md` | guide | ✅ active | Workflow проверки качества (Advisors, Console, Lint) |
| `docs/guides/DOCUMENTATION_HIERARCHY.md` | guide | ✅ active | Иерархия документации |
| `docs/guides/PROJECT_CONCEPT_AND_VALUE.md` | guide | ✅ active | Концепция и ценность проекта |
| `docs/guides/DEVELOPMENT_ROADMAP_2025.md` | guide | ⚠️ partial | Roadmap 2025 (частично устарел, см. unity-roadmap-tasks.md) |
| `docs/guides/TYPESCRIPT_ERRORS_FIX_PLAN.md` | guide | 🗄️ archive | План исправления TypeScript ошибок (выполнен) |

**Статус**: Большинство актуальны, некоторые требуют обновления

---

## 🧪 Модуль: Testing

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/testing/E2E_TESTING_PLAN.md` | plan | ✅ active | План E2E тестирования |
| `docs/testing/E2E_TESTS_STATUS.md` | status | ✅ active | Статус E2E тестов |
| `docs/testing/MANUAL_TEST_CHECKLIST.md` | checklist | ✅ active | Чеклист ручного тестирования |
| `docs/testing/PWA_TEST_SCENARIOS.md` | scenarios | ✅ active | Сценарии тестирования PWA |
| `docs/testing/OFFLINE_MODE_TEST_SCENARIO.md` | scenario | ✅ active | Сценарий тестирования offline режима |
| `docs/testing/TEST_ACCOUNTS.md` | reference | ✅ active | Тестовые аккаунты |
| `docs/testing/CONSOLE_TESTING_REPORT_2025-11-09.md` | report | ✅ active | Последний отчет о тестировании консоли |
| `docs/testing/PWA_TESTING_REPORT_2025-11-09.md` | report | ✅ active | Последний отчет о тестировании PWA |

**Статус**: Актуальные документы, регулярно обновляются

---

## 🔧 Модуль: Admin

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/admin/ADMIN_CLEANUP_PLAN.md` | plan | ✅ active | План очистки админ-панели |
| `docs/architecture/ADMIN_LOGIN_RATE_LIMITING.md` | architecture | ✅ active | Rate limiting для админ-логина |

**Статус**: Актуальные документы

---

## 📊 Модуль: Performance

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/performance/DATABASE_OPTIMIZATION_100K.md` | optimization | ✅ active | Оптимизация БД для 100K пользователей |
| `docs/performance/PERFORMANCE_OPTIMIZATION_REPORT.md` | report | ✅ active | Отчет об оптимизации производительности |
| `docs/performance/LIGHTHOUSE_CI_SETUP.md` | guide | ✅ active | Настройка Lighthouse CI |

**Статус**: Актуальные документы

---

## 📝 Модуль: Notion Integration

| Файл | Тип | Статус | Описание |
|------|-----|--------|----------|
| `docs/notion/README.md` | readme | ✅ active | README для Notion интеграции |
| `docs/notion/QUICK_START_CHECKLIST.md` | checklist | ✅ active | Быстрый старт с Notion |
| `docs/notion/NOTION_AUTOMATION.md` | guide | ✅ active | Автоматизация Notion (GitHub Actions) |
| `docs/notion/NOTION_DASHBOARDS.md` | guide | ✅ active | Дашборды в Notion |
| `docs/notion/IMPORT_SUCCESS_2025-11-09.md` | report | ✅ active | Отчет об успешном импорте задач |

**Статус**: Актуальные документы, Notion интеграция работает

---

## 🗄️ Архивные документы

### Критерии архивации:
1. Есть более новый документ (например, `*-review-and-plan.md` заменяет старые спецификации)
2. Противоречит актуальным `*-review-and-plan.md` документам
3. Не отражен в текущем коде
4. Устаревшие планы и отчеты (старше 1 месяца)

### Архивные директории:
- `docs/archive/2025-10/` - архив октября 2025
- `docs/archive/2025-10-25/` - архив от 25 октября
- `docs/archive/2025-11-09_cleanup/` - архив от 9 ноября (cleanup)
- `docs/changelog/archive/` - архив changelog записей

### Кандидаты на архивацию:
| Файл | Причина | Заменен на |
|------|---------|------------|
| `docs/features/ACHIEVEMENTS_SYSTEM.md` | Устарел | `docs/new/achievements-review-and-plan.md` |
| `docs/features/REPORTS_SYSTEM.md` | Устарел | `docs/new/reports-review-and-plan.md` |
| `docs/features/ai-usage-system.md` | Устарел | `docs/new/ai-superadmin-settings.md` |
| `docs/architecture/MOTIVATION_CARDS_SYSTEM.md` | Частично устарел | `docs/new/cards-and-push-tech.md` |
| `docs/analysis/README_PUSH_NOTIFICATIONS.md` | Устарел | `docs/new/cards-and-push-tech.md` |
| `docs/guides/DEVELOPMENT_ROADMAP_2025.md` | Частично устарел | `docs/unity-roadmap-tasks.md` |
| `docs/INDEX.md` | Частично устарел | `docs/docs-index.md` (этот файл) |

---

## 📋 Рекомендации по документации

### Правила ведения документации (из unity.md):
1. **Краткость**: документация должна быть минимальной но достаточной
2. **Актуальность**: обновлять при изменениях, удалять устаревшее
3. **Структурированность**: использовать четкую иерархию и naming conventions
4. **Автоматизация**: предпочитать автогенерацию (Notion sync, GitHub Actions)
5. **Documentation Ratio**: docs count ≤ source files count (правило 1:1)

### Naming conventions:
- `changelog/archive/`: `YYYY-MM-DD_snake_case.md`
- `plan/tasks/`: `kebab-case.md`
- `architecture/`: `UPPER_SNAKE_CASE.md`
- `guides/`: `НАЗВАНИЕ_GUIDE.md`

### Workflow задач:
1. Создание → `plan/tasks/planned/`
2. Старт → `plan/tasks/active/`
3. Завершение → `plan/tasks/archive/`

### Типы документов:
- **concept** - концептуальные документы (vision, идеи)
- **tech** - технические спецификации (детальная реализация)
- **review-and-plan** - обзор текущего состояния + план развития
- **prd** - Product Requirements Document
- **old-spec** - устаревшие спецификации (кандидаты на архивацию)
- **guide** - гайды и инструкции
- **architecture** - архитектурные документы
- **report** - отчеты о выполненной работе
- **checklist** - чеклисты
- **roadmap** - дорожные карты

---

## 🎯 Следующие шаги

1. **Архивация устаревших документов** (задача DOC-2):
   - Переместить файлы из "Кандидаты на архивацию" в `docs/archive/2025-11/`
   - Добавить пометки `⚠️ ARCHIVED` в начало файлов
   - Обновить этот индекс (статус → 🗄️ archive)

2. **Создание implementation-status.md** (задача DOC-1):
   - Детальный статус реализации по каждому модулю
   - Сравнение документации и кода
   - Ссылки на конкретные файлы и строки кода

3. **Регулярное обновление**:
   - Обновлять этот индекс при создании/архивации документов
   - Проверять актуальность раз в месяц
   - Синхронизировать с Notion Tasks Database

---

**Статус**: 🟢 Active
**Последнее обновление**: 2025-11-15
**Владелец**: AI Agent + Основатель проекта
**Следующий review**: 2025-12-15

