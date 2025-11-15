# 🗑️ UNITY-v2 - План очистки документации

**Дата**: 2025-11-15  
**Цель**: Навести порядок в документации, оставить только актуальное

---

## 📊 Текущее состояние

**Всего документов**: ~120 файлов  
**Проблема**: Слишком много папок и файлов, сложно ориентироваться

### Структура папок (сейчас):
```
docs/
├── admin/           ← 1 файл (ADMIN_CLEANUP_PLAN.md)
├── analysis/        ← 5 файлов (старые анализы)
├── architecture/    ← 20 файлов (архитектура)
├── archive/         ← ~60 файлов (архив)
├── changelog/       ← 2 файла + archive/
├── decisions/       ← 1 файл
├── design/          ← 4 файла
├── features/        ← 5 файлов (старые спецификации)
├── guides/          ← 20 файлов (гайды)
├── handoff/         ← 1 файл
├── i18n/            ← 3 файла
├── mobile/          ← 6 файлов
├── new/             ← 10 файлов (ГЛАВНЫЕ документы) ✅
├── notion/          ← 10 файлов
├── performance/     ← 4 файла
├── plan/            ← 5 файлов + tasks/ + active/
├── pwa/             ← 2 файла
├── reports/         ← 2 файла
└── testing/         ← 15 файлов
```

---

## 🎯 Целевая структура (после очистки)

```
docs/
├── START_HERE.md                    ← 🔥 НАЧНИ ОТСЮДА
├── STEP_BY_STEP_PLAN.md            ← План реализации
├── implementation-status.md         ← Статус реализации
├── unity-roadmap-tasks.md          ← Все задачи
├── CHANGELOG.md                     ← Changelog
├── FIX.md                           ← Fix log
│
├── new/                             ← 🔥 ГЛАВНЫЕ ДОКУМЕНТЫ (10 файлов)
│   ├── unity-ai-planner-guide.md
│   ├── cards-and-push-tech.md
│   ├── achievements-review-and-plan.md
│   ├── reports-review-and-plan.md
│   ├── ai-superadmin-settings.md
│   └── ai-prompts-cards.md
│
├── architecture/                    ← Архитектура (10 файлов, остальное в архив)
│   ├── PUSH_SYSTEM.md
│   ├── MOTIVATION_CARDS_SYSTEM.md
│   ├── ROLE_BASED_ACCESS_CONTROL.md
│   └── ... (только актуальные)
│
├── guides/                          ← Гайды (10 файлов, остальное в архив)
│   ├── PUSH_NOTIFICATIONS_SCHEDULING_GUIDE.md
│   ├── PWA_PUSH_TESTING.md
│   └── ... (только актуальные)
│
├── mobile/                          ← React Native (6 файлов)
│   ├── REACT_NATIVE_READINESS_REPORT.md
│   └── ...
│
├── testing/                         ← Тестирование (5 файлов, остальное в архив)
│   ├── MANUAL_TEST_CHECKLIST.md
│   └── ...
│
└── archive/                         ← 🗄️ Архив (~80 файлов)
    └── 2025-11/                    ← Новая папка для архивации
        ├── analysis/               ← Старые анализы
        ├── features/               ← Старые спецификации
        ├── plan/                   ← Старые планы
        └── ...
```

---

## 📋 Что архивировать (список файлов)

### 1. Папка `docs/analysis/` → `docs/archive/2025-11/analysis/`
**Причина**: Старые анализы (2025-10), заменены на новые документы

- `00_START_HERE.md` → заменен на `docs/START_HERE.md`
- `FREE_TRIAL_PREMIUM_ANALYSIS.md` → старый анализ
- `PREMIUM_MODAL_SYSTEM_ANALYSIS.md` → старый анализ
- `README_PUSH_NOTIFICATIONS.md` → заменен на `docs/new/cards-and-push-tech.md`
- `SENDPULSE_VS_CUSTOM_COMPARISON.md` → старый анализ

### 2. Папка `docs/features/` → `docs/archive/2025-11/features/`
**Причина**: Старые спецификации, заменены на `docs/new/*-review-and-plan.md`

- `ACHIEVEMENTS_SYSTEM.md` → заменен на `docs/new/achievements-review-and-plan.md`
- `REPORTS_SYSTEM.md` → заменен на `docs/new/reports-review-and-plan.md`
- `ai-usage-system.md` → заменен на `docs/new/ai-superadmin-settings.md`
- `SETTINGS_SCREEN_IMPLEMENTATION_PLAN.md` → старый план
- `SETTINGS_SCREEN_IOS_COMPLIANCE_REPORT.md` → старый отчет

### 3. Папка `docs/plan/` → `docs/archive/2025-11/plan/`
**Причина**: Старые планы, заменены на `docs/unity-roadmap-tasks.md`

- `00_START_HERE_IMPLEMENTATION.md` → заменен на `docs/STEP_BY_STEP_PLAN.md`
- `GOALS_HABITS_TASKS_ROADMAP.md` → старый roadmap
- `LINT_CLEANUP_PLAN.md` → выполнен
- `ONBOARDING_SCREEN4_REFACTORING.md` → выполнен
- `README.md` → старый README
- `active/` → старые активные задачи
- `tasks/` → старые задачи

### 4. Папка `docs/admin/` → `docs/archive/2025-11/admin/`
**Причина**: Старый план cleanup

- `ADMIN_CLEANUP_PLAN.md` → старый план

### 5. Папка `docs/reports/` → `docs/archive/2025-11/reports/`
**Причина**: Старые отчеты

- `PHASE_1_COMPLETION_REPORT.md` → старый отчет
- `README.md` → старый README

### 6. Файлы в `docs/testing/` → `docs/archive/2025-11/testing/`
**Причина**: Старые отчеты тестирования

- `2025-11-01_e2e_test_results.md` → старый отчет
- `2025-11-01_e2e_testing_report.md` → старый отчет
- `CONSOLE_TESTING_REPORT_2025-10-24.md` → старый отчет
- `CONSOLE_TESTING_REPORT_2025-11-09.md` → старый отчет
- `FIXES_APPLIED_2025-11-09.md` → старый отчет
- `PWA_TESTING_REPORT_2025-11-09.md` → старый отчет
- `PWA_UI_UX_ANALYSIS_2025-11-09.md` → старый отчет

**Оставить**:
- `MANUAL_TEST_CHECKLIST.md` ✅
- `E2E_TESTING_PLAN.md` ✅
- `E2E_TESTS_STATUS.md` ✅
- `TEST_ACCOUNTS.md` ✅
- `PWA_TEST_SCENARIOS.md` ✅

### 7. Файлы в `docs/architecture/` → `docs/archive/2025-11/architecture/`
**Причина**: Устаревшие или выполненные

- `API_ENDPOINTS_MIGRATION.md` → выполнен
- `MASTER_PLAN.md` → заменен на `docs/unity-roadmap-tasks.md`
- `REACT_19_MIGRATION.md` → отложен (используем React 18.3.1)
- `REACT_NATIVE_ARCHITECTURE_ANALYSIS.md` → заменен на `REACT_NATIVE_READINESS_REPORT.md`
- `REACT_NATIVE_UI_MIGRATION.md` → заменен на `REACT_NATIVE_READINESS_REPORT.md`

**Оставить**:
- `PUSH_SYSTEM.md` ✅
- `MOTIVATION_CARDS_SYSTEM.md` ✅
- `ROLE_BASED_ACCESS_CONTROL.md` ✅
- `DEPLOYMENT.md` ✅
- `INDEXEDDB_CACHING.md` ✅
- `SESSION_MANAGEMENT.md` ✅
- `TWO_FACTOR_AUTHENTICATION.md` ✅
- `DB_HEALTH_MONITORING.md` ✅
- `PUSH_RATE_LIMITING.md` ✅
- `PUSH_SENTRY_MONITORING.md` ✅
- `UNITY_VISION_AND_ROADMAP_2026.md` ✅

---

## 🚀 План действий

### Шаг 1: Создать папку архива
```bash
mkdir -p docs/archive/2025-11/{analysis,features,plan,admin,reports,testing,architecture}
```

### Шаг 2: Переместить файлы
```bash
# Analysis
mv docs/analysis/* docs/archive/2025-11/analysis/

# Features
mv docs/features/* docs/archive/2025-11/features/

# Plan
mv docs/plan/* docs/archive/2025-11/plan/

# Admin
mv docs/admin/* docs/archive/2025-11/admin/

# Reports
mv docs/reports/* docs/archive/2025-11/reports/

# Testing (выборочно)
mv docs/testing/2025-11-01_* docs/archive/2025-11/testing/
mv docs/testing/CONSOLE_TESTING_REPORT_* docs/archive/2025-11/testing/
mv docs/testing/FIXES_APPLIED_* docs/archive/2025-11/testing/
mv docs/testing/PWA_TESTING_REPORT_* docs/archive/2025-11/testing/
mv docs/testing/PWA_UI_UX_ANALYSIS_* docs/archive/2025-11/testing/

# Architecture (выборочно)
mv docs/architecture/API_ENDPOINTS_MIGRATION.md docs/archive/2025-11/architecture/
mv docs/architecture/MASTER_PLAN.md docs/archive/2025-11/architecture/
mv docs/architecture/REACT_19_MIGRATION.md docs/archive/2025-11/architecture/
mv docs/architecture/REACT_NATIVE_ARCHITECTURE_ANALYSIS.md docs/archive/2025-11/architecture/
mv docs/architecture/REACT_NATIVE_UI_MIGRATION.md docs/archive/2025-11/architecture/
```

### Шаг 3: Удалить пустые папки
```bash
rmdir docs/analysis
rmdir docs/features
rmdir docs/plan
rmdir docs/admin
rmdir docs/reports
```

### Шаг 4: Обновить документацию
- Обновить `docs/docs-index.md` (статус архивированных файлов)
- Обновить `docs/START_HERE.md` (если нужно)

---

**Результат**: ~40 файлов архивировано, структура стала проще и понятнее ✅

**Последнее обновление**: 2025-11-15

