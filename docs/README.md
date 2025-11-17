# 📚 UNITY-v2 - Документация проекта

**Дата обновления**: 2025-11-15
**Статус**: ✅ Документация реорганизована
**Версия проекта**: UNITY-v2 v2.0.1
**Documentation Ratio**: ~60 активных документов (архивировано ~40)

🎯 **Документация упрощена!** Архивировано устаревшие документы, создана понятная навигация.

Добро пожаловать в документацию проекта UNITY - кроссплатформенного PWA приложения для личностного роста через ведение дневника достижений с AI-анализом.

---

## 🚀 НАЧНИ ОТСЮДА!

👉 **[docs/START_HERE.md](START_HERE.md)** - Простая навигация по всей документации

**Быстрые ссылки**:
- 📋 [implementation-status.md](implementation-status.md) - Что работает / не работает
- 🎯 [STEP_BY_STEP_PLAN.md](STEP_BY_STEP_PLAN.md) - План реализации (3 недели)
- 📝 [unity-roadmap-tasks.md](unity-roadmap-tasks.md) - Все задачи P0/P1/P2
- 🔥 [docs/new/](new/) - ГЛАВНЫЕ документы (карточки, достижения, отчеты)
- 🧠 [AI Control Center](new/ai-control-center-summary.md) - Управление AI операциями (НОВОЕ!)

---

## 🆕 Структура документации (обновлено 2025-11-09)

### 📋 Планирование (`/plan`)
Все, что связано с планированием задач и стратегией проекта.

- **[plan/README.md](plan/README.md)** - указатель на Notion (НОВОЕ!)
- **[plan/tasks/](plan/tasks/)** - детальные технические планы
  - `active/` - задачи в работе
  - `archive/` - завершенные задачи

### 📝 История изменений (`/changelog`) - НОВОЕ!
Все завершенные изменения и обновления проекта.

- **[changelog/CHANGELOG.md](changelog/CHANGELOG.md)** - пользовательские изменения (✨🐛🔒⚡)
- **[changelog/FIX.md](changelog/FIX.md)** - технические изменения (🗑️🔄📚✅🏗️)
- **[changelog/archive/](changelog/archive/)** - отчеты старше 6 месяцев

### 🎯 AI Рекомендации - НОВОЕ!
Автоматически генерируемые рекомендации по улучшению кодовой базы.

- **[RECOMMENDATIONS.md](RECOMMENDATIONS.md)** - 8 приоритизированных рекомендаций
  - 🔴 P0 (Критические): Error Boundary, Sentry integration
  - 🟡 P1 (Важные): recharts optimization, N+1 queries fix
  - 🟢 P2 (Желательные): TypeScript strict, Web Vitals monitoring

### 🧠 AI Control Center - НОВОЕ! (2025-11-15)
Централизованное управление AI операциями, промптами и моделями.

- **[new/ai-control-center-summary.md](new/ai-control-center-summary.md)** - Краткий summary (НАЧНИ ОТСЮДА!)
- **[new/ai-control-center-implementation.md](new/ai-control-center-implementation.md)** - Отчет о реализации UI
- **[new/ai-control-center-integration-plan.md](new/ai-control-center-integration-plan.md)** - План интеграции с Edge Functions
- **[new/ai-prompts-cards.md](new/ai-prompts-cards.md)** - Промпты для мотивационных карточек
- **[new/ai-superadmin-settings.md](new/ai-superadmin-settings.md)** - Настройки AI в админ-панели

**Функционал**:
- ✅ UI для управления 6 AI операциями (cards, push, reports)
- ✅ Редактирование промптов БЕЗ редеплоя кода
- ✅ Управление моделями (model, max_tokens, temperature)
- ✅ Включение/выключение операций (is_enabled)
- ⏳ Интеграция с Edge Functions (~2.5 часа)

---

## 📋 Структура документации

### 🏆 Финальные отчеты о завершении
- **[FULL_USER_FLOW_TEST_REPORT.md](archive/completed/2025-10/testing/FULL_USER_FLOW_TEST_REPORT.md)** - Полный отчет о тестировании user flow (2025-10-18) ✅
- **[FINAL_SUMMARY_2025.md](archive/completed/2025-10/reports/FINAL_SUMMARY_2025.md)** - Финальный итоговый отчет проекта ✅
- **[COMPLETION_CHECKLIST.md](archive/completed/2025-10/reports/COMPLETION_CHECKLIST.md)** - Чек-лист завершения всех задач ✅
- **[PERFORMANCE_FINAL_REPORT.md](archive/completed/2025-10/performance/PERFORMANCE_FINAL_REPORT.md)** - Финальный отчет о производительности ✅
- **[PERFORMANCE_OPTIMIZATION_COMPLETE.md](archive/completed/2025-10/performance/PERFORMANCE_OPTIMIZATION_COMPLETE.md)** - Полный отчет оптимизации ✅
- **[WEEK3_COMPLETION_SUMMARY.md](archive/completed/2025-10/reports/WEEK3_COMPLETION_SUMMARY.md)** - Отчет о неделе 3 ✅
- **[TESTING_REPORT_2025.md](archive/completed/2025-10/testing/TESTING_REPORT_2025.md)** - Первичный отчет о тестировании (2025-01-18) ✅
- **[COMPREHENSIVE_TESTING_REPORT_2025-10-18.md](testing/COMPREHENSIVE_TESTING_REPORT_2025-10-18.md)** - Полное функциональное тестирование (2025-10-18) ✅
- **[SETTINGS_SCREEN_IMPLEMENTATION_PLAN.md](features/SETTINGS_SCREEN_IMPLEMENTATION_PLAN.md)** - План реализации SettingsScreen (4 фазы, 19-25 часов) 📋

### 🎯 Главный документ (Компактный)
- **[UNITY_MASTER_PLAN_2025.md](architecture/UNITY_MASTER_PLAN_2025.md)** - единый источник истины для основателя (~220 строк) ✅ PRODUCTION READY

### 📋 Детальные планы задач
- **[react-native-preparation.md](plan/tasks/planned/react-native-preparation.md)** - Подготовка к React Native
- **[performance-optimization.md](plan/tasks/planned/performance-optimization.md)** - Оптимизация производительности
- **[ai-pdf-books.md](plan/tasks/planned/ai-pdf-books.md)** - AI PDF книги достижений (частично реализовано)
- **[pwa-enhancements.md](plan/tasks/planned/pwa-enhancements.md)** - Улучшения PWA

### 📚 Навигационные документы
- **[DEVELOPMENT_ROADMAP_2025.md](guides/DEVELOPMENT_ROADMAP_2025.md)** - индекс всех задач по фазам
- **[DOCUMENTATION_HIERARCHY.md](guides/DOCUMENTATION_HIERARCHY.md)** - иерархия документов
- **[README.md](README.md)** - этот файл, обзор документации

### 🛠 Стратегические документы
- **[PROJECT_CONCEPT_AND_VALUE.md](guides/PROJECT_CONCEPT_AND_VALUE.md)** - концепция и ценности проекта
- **[UNITY_VISION_AND_ROADMAP_2026.md](architecture/UNITY_VISION_AND_ROADMAP_2026.md)** - долгосрочное видение

### 🏗️ Технические документы
- **[REACT_NATIVE_MIGRATION_PLAN.md](mobile/REACT_NATIVE_MIGRATION_PLAN.md)** - план миграции на React Native
- **[MASTER_PLAN.md](architecture/MASTER_PLAN.md)** - техническая архитектура
- **[ai-usage-system.md](features/ai-usage-system.md)** - система использования AI

### 📋 Детальные планы задач (`plan/tasks/planned/`)
- **[performance-optimization.md](plan/tasks/planned/performance-optimization.md)** - Задача 2: Оптимизация производительности
- **[pwa-enhancements.md](plan/tasks/planned/pwa-enhancements.md)** - Задача 3: PWA улучшения
- **[ai-pdf-books.md](plan/tasks/planned/ai-pdf-books.md)** - Задача 4: AI PDF Книги достижений
- **[advanced-analytics.md](plan/tasks/planned/advanced-analytics.md)** - Задача 5: Расширенная аналитика
- **[react-native-expo-migration.md](plan/tasks/planned/react-native-expo-migration.md)** - Задача 6: React Native миграция
- **[monetization-system.md](plan/tasks/planned/monetization-system.md)** - Задача 7: Монетизация
- **[ecosystem-expansion.md](plan/tasks/planned/ecosystem-expansion.md)** - Задача 8: Расширение экосистемы

### 📚 Служебные документы
- **[DOCUMENTATION_HIERARCHY.md](guides/DOCUMENTATION_HIERARCHY.md)** - структура документации

---

## 🎯 Как использовать документацию

### 👑 Для основателя проекта
1. **Начните с главного** - [UNITY_MASTER_PLAN_2025.md](architecture/UNITY_MASTER_PLAN_2025.md)
2. **Выберите фазу развития** - используйте roadmap из мастер-плана
3. **Контролируйте прогресс** - отслеживайте задачи через [DEVELOPMENT_ROADMAP_2025.md](guides/DEVELOPMENT_ROADMAP_2025.md)

### 👨‍💻 Для команды разработки
1. **Изучите архитектуру** - [MASTER_PLAN.md](architecture/MASTER_PLAN.md)
2. **Найдите задачу** - [DEVELOPMENT_ROADMAP_2025.md](guides/DEVELOPMENT_ROADMAP_2025.md)
3. **Изучите детали** - откройте соответствующий файл в `plan/tasks/planned/`
4. **Реализуйте** - следуйте техническим инструкциям

### 🆕 Для новых участников
1. **Понимание проекта** - [PROJECT_CONCEPT_AND_VALUE.md](guides/PROJECT_CONCEPT_AND_VALUE.md)
2. **Долгосрочное видение** - [UNITY_VISION_AND_ROADMAP_2026.md](architecture/UNITY_VISION_AND_ROADMAP_2026.md)
3. **Техническая архитектура** - [MASTER_PLAN.md](architecture/MASTER_PLAN.md)
4. **Выбор задачи** - [DEVELOPMENT_ROADMAP_2025.md](guides/DEVELOPMENT_ROADMAP_2025.md)

---

## 🗂️ Структура проекта UNITY-v2

### Текущая архитектура
```
UNITY-v2/
├── src/
│   ├── app/
│   │   ├── mobile/          # PWA мобильное приложение (max-w-md)
│   │   └── admin/           # Админ-панель (full-width)
│   ├── shared/
│   │   ├── components/      # 62 общих компонента
│   │   ├── lib/            # Утилиты и хелперы
│   │   └── ui/             # 49 shadcn/ui компонентов
│   └── features/           # Feature-Sliced Design
├── supabase/
│   ├── functions/          # 5 Edge Functions (микросервисы)
│   └── migrations/         # Миграции БД
└── docs/                   # Актуальная документация
    ├── tasks/              # 🆕 Детальные планы задач
    └── *.md               # Основные документы
```

### Ключевые технологии
- **Frontend**: React 18.3.1 + TypeScript + Vite 6.3.5
- **UI**: shadcn/ui + Tailwind CSS + Motion (анимации)
- **Backend**: Supabase (PostgreSQL + Edge Functions + Auth + Storage)
- **AI**: OpenAI GPT-4 для анализа записей и мотивационных карточек
- **PWA**: Service Workers + Manifest + Install Prompt
- **i18n**: 7 языков (ru, en, es, de, fr, zh, ja)
- **Deploy**: Netlify (production) + GitHub Actions (CI/CD)

---

## � Текущие приоритеты (Q1 2025)

### 🔥 Фаза 1: Стабилизация PWA
- **Задача 1**: React Native подготовка (4 недели)
- **Задача 2**: Оптимизация производительности (2 недели)
- **Задача 3**: PWA улучшения (2 недели)

### 🤖 Фаза 2: AI и аналитика (Q2 2025)
- **Задача 4**: AI PDF Книги достижений (6 недель)
- **Задача 5**: Расширенная аналитика (4 недели)

### 📱 Фаза 3: Масштабирование (Q3 2025)
- **Задача 6**: React Native миграция (3-5 дней)
- **Задача 7**: Монетизация (4 недели)

### 🌐 Фаза 4: Экосистема (Q4 2025)
- **Задача 8**: Расширение экосистемы (8 недель)

---

## ✅ Принципы документации

### 🎯 Единый источник истины
- **[UNITY_MASTER_PLAN_2025.md](architecture/UNITY_MASTER_PLAN_2025.md)** - главный документ
- Все остальные документы ссылаются на мастер-план
- Нет дублирования задач между документами

### 📋 Детализация по уровням
- **Мастер-план** - стратегическое видение
- **Индекс задач** - навигация по фазам
- **Детальные планы** - техническая реализация

### 🔗 Перекрестные ссылки
- Каждая задача имеет детальный план в `plan/tasks/planned/`
- Все документы связаны между собой
- Легкая навигация от общего к частному

---

## 🤖 Автоматизация документации (НОВОЕ!)

### GitHub Actions
- **Documentation Ratio Check** - еженедельно (каждый понедельник в 9:00 UTC)
  - Проверяет соотношение документации к коду (1:1 правило)
  - Комментирует PR при провале
  - Файл: `.github/workflows/docs-ratio-check.yml`

### Скрипты
- **`scripts/check-docs-ratio.sh`** - проверка documentation ratio
  - Использование: `./scripts/check-docs-ratio.sh`
  - Exit codes: 0 (PASSED/WARNING), 1 (FAILED)
  - Текущий статус: ✅ 27% (healthy)

### Процесс обновления

**Ежедневно**:
- Обновить статусы задач в [plan/BACKLOG.md](plan/BACKLOG.md)
- Обновить прогресс в [plan/SPRINT.md](plan/SPRINT.md)

**Еженедельно**:
- Автоматическая проверка documentation ratio (GitHub Action)
- AI-анализ кодовой базы для [RECOMMENDATIONS.md](RECOMMENDATIONS.md)

**Ежемесячно**:
- Review BACKLOG.md и приоритетов
- Обновление ROADMAP.md
- Архивация старых отчетов (>6 месяцев)

---

## 📝 Naming Conventions (НОВОЕ!)

| Папка | Формат | Пример |
|-------|--------|--------|
| `changelog/archive/` | `YYYY-MM-DD_snake_case.md` | `2025-10-21_admin_panel_refactoring.md` |
| `plan/tasks/` | `kebab-case.md` | `error-boundary-implementation.md` |
| `architecture/` | `UPPER_SNAKE_CASE.md` | `MASTER_PLAN.md` |
| `guides/` | `НАЗВАНИЕ_GUIDE.md` | `I18N_GUIDE.md` |

---

**🎯 Цель**: Обеспечить четкую навигацию по всем аспектам разработки UNITY-v2 без дублей и противоречий!

**Автор**: Product Team UNITY
**Последнее обновление**: 21 октября 2025

