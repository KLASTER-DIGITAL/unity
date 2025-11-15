# 🔍 Глубокий анализ документации UNITY-v2

**Дата**: 2025-11-15  
**Цель**: Сократить с 90 до 40-50 активных файлов  
**Метод**: Анализ через codebase-retrieval + проверка актуальности

---

## 📊 Текущее состояние

**Всего активных файлов**: ~90  
**Целевое количество**: 40-50  
**Нужно архивировать**: ~40 файлов

---

## 🗑️ ПЛАН АРХИВАЦИИ

### 1. docs/notion/ (11 файлов) → Оставить 3 файла

**✅ ОСТАВИТЬ (3 файла)**:
- `README.md` - главный файл, актуален
- `NOTION_SETUP_GUIDE.md` - инструкция по настройке, актуален
- `QUICK_REFERENCE.md` - быстрая справка, актуален

**🗄️ АРХИВИРОВАТЬ (8 файлов)** → `docs/archive/2025-11/notion/`:
- `FINAL_REPORT_2025-11-09.md` - отчет о завершении (устарел)
- `IMPORT_SUCCESS_2025-11-09.md` - отчет об импорте (устарел)
- `MIGRATION_COMPLETED_2025-11-09.md` - отчет о миграции (устарел)
- `WHAT_I_DID_2025-11-09.md` - отчет о действиях (устарел)
- `CORRECTED_IMPLEMENTATION_PLAN.md` - план реализации (выполнен)
- `NOTION_AUTOMATION.md` - дублирует NOTION_SETUP_GUIDE.md
- `NOTION_DASHBOARDS.md` - не реализовано, низкий приоритет
- `QUICK_START_CHECKLIST.md` - дублирует NOTION_SETUP_GUIDE.md

**Причина**: Отчеты от 2025-11-09 устарели, миграция завершена, дубликаты

---

### 2. Корневые файлы docs/ (15 файлов) → Оставить 7 файлов

**✅ ОСТАВИТЬ (7 файлов)**:
- `START_HERE.md` - главный навигационный файл ✅
- `README.md` - главный README ✅
- `CHANGELOG.md` - активный changelog ✅
- `FIX.md` - активный fix log ✅
- `implementation-status.md` - актуальный статус (2025-11-15) ✅
- `STEP_BY_STEP_PLAN.md` - актуальный план ✅
- `unity-roadmap-tasks.md` - актуальные задачи ✅

**🗄️ АРХИВИРОВАТЬ (8 файлов)** → `docs/archive/2025-11/root/`:
- `INDEX.md` - устарел (2025-10-23), заменен на START_HERE.md
- `STATUS.md` - устарел (2025-11-09), заменен на implementation-status.md
- `IMPLEMENTATION_STATUS.md` - дубликат implementation-status.md (разный case)
- `RECOMMENDATIONS_2025-11-14.md` - устарел, заменен на RECOMMENDATIONS.md
- `MIGRATION_CHECKLIST.md` - выполнен
- `LANGUAGES_NAVIGATION_IMPLEMENTATION_REPORT.md` - отчет (устарел)
- `CLEANUP_PLAN.md` - план очистки (выполнен)
- `DOCUMENTATION_CLEANUP_REPORT_2025-11-15.md` - отчет (будет заменен этим файлом)
- `docs-index.md` - дубликат, информация в START_HERE.md

**Причина**: Дубликаты, устаревшие отчеты, выполненные планы

---

### 3. docs/guides/ (20 файлов) → Оставить 10 файлов

**✅ ОСТАВИТЬ (10 файлов)** - актуальные гайды:
- `PROJECT_CONCEPT_AND_VALUE.md` - концепция проекта ✅
- `PUSH_NOTIFICATIONS_SCHEDULING_GUIDE.md` - актуален ✅
- `PWA_PUSH_TESTING.md` - актуален ✅
- `UNIFIED_NOTIFICATION_SENDER_GUIDE.md` - актуален ✅
- `SUPABASE_CRON_JOBS_SETUP.md` - актуален ✅
- `SENTRY_ALERTS_SETUP.md` - актуален ✅
- `QUALITY_CHECKS_WORKFLOW.md` - актуален ✅
- `DOCUMENTATION_HIERARCHY.md` - актуален ✅
- `DEPLOYMENT.md` - актуален ✅
- `PRELOADER_SYSTEM.md` - актуален ✅

**🗄️ АРХИВИРОВАТЬ (10 файлов)** → `docs/archive/2025-11/guides/`:
- `DEVELOPMENT_ROADMAP_2025.md` - устарел, заменен на unity-roadmap-tasks.md
- `TYPESCRIPT_ERRORS_FIX_PLAN.md` - выполнен
- `PUSH_TEMPLATES_TESTING_GUIDE.md` - дублирует PWA_PUSH_TESTING.md
- `SETUP_CRON_JOBS_MANUAL.md` - дублирует SUPABASE_CRON_JOBS_SETUP.md
- `SUBSCRIPTION_EXPIRY_CHECKER_GUIDE.md` - не реализовано
- `TELEGRAM_NOTIFICATIONS_GUIDE.md` - не реализовано
- `TIMEZONE_TESTING_GUIDE.md` - выполнен
- `UNIFIED_NOTIFICATION_API_GUIDE.md` - дублирует UNIFIED_NOTIFICATION_SENDER_GUIDE.md

**Причина**: Дубликаты, выполненные планы, не реализованные фичи

---

### 4. docs/performance/ (5 файлов) → Оставить 2 файла

**✅ ОСТАВИТЬ (2 файла)**:
- `DATABASE_OPTIMIZATION_100K.md` - актуален для масштабирования ✅
- `PERFORMANCE_OPTIMIZATION_REPORT.md` - актуален ✅

**🗄️ АРХИВИРОВАТЬ (3 файла)** → `docs/archive/2025-11/performance/`:
- `SESSION_SUMMARY_2025-10-24.md` - старый отчет
- `SESSION_SUMMARY_2025-10-24_E2E.md` - старый отчет
- `LIGHTHOUSE_CI_SETUP.md` - не реализовано

**Причина**: Старые отчеты, не реализованные фичи

---

### 5. docs/design/ (4 файла) → Оставить 2 файла

**✅ ОСТАВИТЬ (2 файла)**:
- `IOS_DESIGN_SYSTEM.md` - актуален ✅
- `ios-theme-guidelines.md` - актуален ✅

**🗄️ АРХИВИРОВАТЬ (2 файла)** → `docs/archive/2025-11/design/`:
- `ai-design-system.md` - устарел
- `DARK_THEME_CHECKLIST.md` - выполнен

**Причина**: Устаревшие, выполненные чеклисты

---

### 6. docs/pwa/ (2 файла) → Оставить 1 файл

**✅ ОСТАВИТЬ (1 файл)**:
- `PUSH_NOTIFICATIONS_GUIDE.md` - актуален ✅

**🗄️ АРХИВИРОВАТЬ (1 файл)** → `docs/archive/2025-11/pwa/`:
- `INDEX.md` - дублирует информацию из других файлов

**Причина**: Дубликат

---

### 7. docs/handoff/ (1 файл) → Архивировать

**🗄️ АРХИВИРОВАТЬ (1 файл)** → `docs/archive/2025-11/handoff/`:
- `README.md` - handoff завершен

**Причина**: Handoff завершен, файл не актуален

---

### 8. docs/decisions/ (1 файл) → Оставить

**✅ ОСТАВИТЬ (1 файл)**:
- `2025-10-27_radix-ui-migration-decision.md` - важное архитектурное решение ✅

---

### 9. docs/changelog/ (2 файла) → Оставить 1 файл

**✅ ОСТАВИТЬ (1 файл)**:
- `README.md` - актуален ✅

**🗄️ АРХИВИРОВАТЬ (1 файл)** → `docs/archive/2025-11/changelog/`:
- Папка `archive/` уже существует, ничего не делать

---

## 📊 ИТОГОВАЯ СТАТИСТИКА

### До очистки:
- docs/notion/: 11 файлов
- docs/ (root): 15 файлов
- docs/guides/: 20 файлов
- docs/performance/: 5 файлов
- docs/design/: 4 файлов
- docs/pwa/: 2 файла
- docs/handoff/: 1 файл
- docs/decisions/: 1 файл
- docs/changelog/: 2 файла
- **ИТОГО**: 61 файл

### После очистки:
- docs/notion/: 3 файла (-8)
- docs/ (root): 7 файлов (-8)
- docs/guides/: 10 файлов (-10)
- docs/performance/: 2 файла (-3)
- docs/design/: 2 файла (-2)
- docs/pwa/: 1 файл (-1)
- docs/handoff/: 0 файлов (-1)
- docs/decisions/: 1 файл (0)
- docs/changelog/: 1 файл (-1)
- **ИТОГО**: 27 файлов (-34)

### Архивировано: 34 файла

---

## 🎯 Следующие шаги

1. ✅ Создать папки для архивации
2. ✅ Переместить файлы в архив
3. ✅ Обновить START_HERE.md
4. ✅ Создать финальный отчет

**Последнее обновление**: 2025-11-15

