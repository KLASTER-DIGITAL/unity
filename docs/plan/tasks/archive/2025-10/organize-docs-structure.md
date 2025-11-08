# Задача: Организация структуры документации

**ID**: TASK-009  
**Приоритет**: P2 (Medium)  
**Статус**: 📅 Готово к старту  
**Оценка**: 4 часа  
**Исполнитель**: TBD  
**Создано**: 2025-10-21  

---

## 📋 Описание

Организовать 69 файлов из корня `/docs` в логические подпапки для улучшения навигации и поддержки.

**Текущая проблема**:
- 69 файлов в корне `/docs` без структуры
- Сложно найти нужный документ
- Нарушение принципа "не более 3 уровней вложенности"

**Ожидаемый результат**:
- Все файлы организованы в подпапки
- Легкая навигация по категориям
- Обновленный INDEX.md с новой структурой

---

## 🎯 Цели

1. Создать логическую структуру подпапок
2. Переместить файлы в соответствующие категории
3. Обновить все ссылки в документах
4. Обновить INDEX.md и README.md

---

## 📁 Предлагаемая структура

```
docs/
├── README.md                    # Главный README
├── INDEX.md                     # Быстрый индекс
├── RECOMMENDATIONS.md           # AI рекомендации
│
├── plan/                        # ✅ Уже создано
│   ├── BACKLOG.md
│   ├── ROADMAP.md
│   ├── SPRINT.md
│   └── tasks/
│
├── changelog/                   # ✅ Уже создано
│   ├── CHANGELOG.md
│   ├── FIX.md
│   └── archive/
│
├── architecture/                # 🆕 Архитектурные документы
│   ├── MASTER_PLAN.md
│   ├── UNITY_MASTER_PLAN_2025.md
│   ├── UNITY_VISION_AND_ROADMAP_2026.md
│   ├── CSS_ARCHITECTURE_AI_FRIENDLY.md
│   ├── EDGE_FUNCTIONS_REFACTORING_PLAN.md
│   ├── EDGE_FUNCTIONS_REFACTORING_REPORT.md
│   └── API_ENDPOINTS_MIGRATION.md
│
├── design/                      # 🆕 Дизайн система
│   ├── IOS_DESIGN_SYSTEM.md
│   ├── IOS_TYPOGRAPHY_IMPLEMENTATION.md
│   ├── DESIGN_SYSTEM_FINAL_REPORT.md
│   ├── DESIGN_SYSTEM_IMPROVEMENT_PLAN.md
│   ├── DARK_THEME_CHECKLIST.md
│   ├── ios-theme-guidelines.md
│   └── ios_font_guidelines.md
│
├── i18n/                        # 🆕 Интернационализация
│   ├── I18N_SYSTEM_DOCUMENTATION.md
│   ├── I18N_API_REFERENCE.md
│   ├── I18N_MIGRATION_GUIDE.md
│   ├── I18N_PERFORMANCE_MONITORING_GUIDE.md
│   ├── I18N_OPTIMIZATION_GUIDE.md
│   ├── I18N_FORMATTING_GUIDE.md
│   ├── I18N_PLURALIZATION_GUIDE.md
│   ├── I18N_RTL_GUIDE.md
│   ├── I18N_TYPESCRIPT_TYPES_GUIDE.md
│   ├── I18N_COMPLETE_IMPLEMENTATION_PLAN.md
│   ├── I18N_E2E_TEST_RESULTS.md
│   └── I18N_FINAL_TEST_REPORT.md
│
├── performance/                 # 🆕 Производительность
│   ├── PERFORMANCE_OPTIMIZATION_COMPLETE.md
│   ├── PERFORMANCE_FINAL_REPORT.md
│   └── PERFORMANCE_OPTIMIZATION_REPORT.md
│
├── testing/                     # 🆕 Тестирование
│   ├── TESTING_REPORT_2025.md
│   ├── TESTING_REPORT_2025-10-19.md
│   ├── COMPREHENSIVE_TESTING_REPORT_2025-10-18.md
│   └── FULL_USER_FLOW_TEST_REPORT.md
│
├── mobile/                      # 🆕 React Native и мобильная разработка
│   ├── REACT_NATIVE_MIGRATION_PLAN.md
│   ├── REACT_NATIVE_MIGRATION_GUIDE.md
│   ├── REACT_NATIVE_EXPO_RECOMMENDATIONS.md
│   ├── MOBILE_ANALYSIS_AND_RECOMMENDATIONS.md
│   ├── MOBILE_NAVIGATION_UPGRADE.md
│   ├── IPHONE_SE_ADAPTATION_PLAN.md
│   └── IPHONE_SE_ADAPTATION_COMPLETE_REPORT.md
│
├── admin/                       # 🆕 Админ-панель
│   ├── ADMIN_PANEL_REVISION_REPORT.md
│   ├── ADMIN_DESIGN_MIGRATION_PROGRESS.md
│   ├── ADMIN_DESIGN_UNIFICATION_PLAN.md
│   ├── ADMIN_CLEANUP_PLAN.md
│   ├── ADMIN_TRANSLATIONS_DUPLICATION_ANALYSIS.md
│   ├── FINAL_ADMIN_MIGRATION_SUMMARY.md
│   ├── LANGUAGES_NAVIGATION_IMPLEMENTATION_REPORT.md
│   └── LANGUAGES_TAB_IMPLEMENTATION_REPORT.md
│
├── features/                    # 🆕 Специфичные фичи
│   ├── SETTINGS_SCREEN_IMPLEMENTATION_PLAN.md
│   ├── SETTINGS_SCREEN_IOS_COMPLIANCE_REPORT.md
│   ├── SETTINGS_LAYOUT_MIGRATION_REPORT.md
│   ├── AI_ANALYTICS_IMPLEMENTATION.md
│   ├── AI_ANALYTICS_FIX_REPORT.md
│   └── ai-usage-system.md
│
├── reports/                     # 🆕 Отчеты о завершении
│   ├── FINAL_SUMMARY_2025.md
│   ├── COMPLETION_CHECKLIST.md
│   ├── PHASE_1_COMPLETION_REPORT.md
│   ├── PHASE_2_COMPLETION_REPORT.md
│   ├── PHASE_3_COMPLETION_REPORT.md
│   ├── PHASE_4_COMPLETION_REPORT.md
│   └── WEEK3_COMPLETION_SUMMARY.md
│
└── guides/                      # 🆕 Руководства
    ├── PROJECT_CONCEPT_AND_VALUE.md
    ├── DEVELOPMENT_ROADMAP_2025.md
    ├── DOCUMENTATION_HIERARCHY.md
    ├── PROJECT_RESTRUCTURE_PLAN.md
    └── ONBOARDING_FLOW_FIX_REPORT.md
```

---

## 📝 План выполнения

### Фаза 1: Создание структуры папок (30 мин)

```bash
mkdir -p docs/architecture
mkdir -p docs/design
mkdir -p docs/i18n
mkdir -p docs/performance
mkdir -p docs/testing
mkdir -p docs/mobile
mkdir -p docs/admin
mkdir -p docs/features
mkdir -p docs/reports
mkdir -p docs/guides
```

### Фаза 2: Перемещение файлов (1 час)

**Architecture** (7 файлов):
```bash
mv docs/MASTER_PLAN.md docs/architecture/
mv docs/UNITY_MASTER_PLAN_2025.md docs/architecture/
mv docs/UNITY_VISION_AND_ROADMAP_2026.md docs/architecture/
mv docs/CSS_ARCHITECTURE_AI_FRIENDLY.md docs/architecture/
mv docs/EDGE_FUNCTIONS_REFACTORING_PLAN.md docs/architecture/
mv docs/EDGE_FUNCTIONS_REFACTORING_REPORT.md docs/architecture/
mv docs/API_ENDPOINTS_MIGRATION.md docs/architecture/
```

**Design** (7 файлов):
```bash
mv docs/IOS_DESIGN_SYSTEM.md docs/design/
mv docs/IOS_TYPOGRAPHY_IMPLEMENTATION.md docs/design/
mv docs/DESIGN_SYSTEM_FINAL_REPORT.md docs/design/
mv docs/DESIGN_SYSTEM_IMPROVEMENT_PLAN.md docs/design/
mv docs/DARK_THEME_CHECKLIST.md docs/design/
mv docs/ios-theme-guidelines.md docs/design/
mv docs/ios_font_guidelines.md docs/design/
```

**i18n** (12 файлов):
```bash
mv docs/I18N_*.md docs/i18n/
```

**Performance** (3 файла):
```bash
mv docs/PERFORMANCE_*.md docs/performance/
```

**Testing** (4 файла):
```bash
mv docs/TESTING_*.md docs/testing/
mv docs/COMPREHENSIVE_TESTING_REPORT_*.md docs/testing/
mv docs/FULL_USER_FLOW_TEST_REPORT.md docs/testing/
```

**Mobile** (7 файлов):
```bash
mv docs/REACT_NATIVE_*.md docs/mobile/
mv docs/MOBILE_*.md docs/mobile/
mv docs/IPHONE_SE_*.md docs/mobile/
```

**Admin** (8 файлов):
```bash
mv docs/ADMIN_*.md docs/admin/
mv docs/FINAL_ADMIN_*.md docs/admin/
mv docs/LANGUAGES_*.md docs/admin/
```

**Features** (6 файлов):
```bash
mv docs/SETTINGS_*.md docs/features/
mv docs/AI_ANALYTICS_*.md docs/features/
mv docs/ai-usage-system.md docs/features/
```

**Reports** (7 файлов):
```bash
mv docs/FINAL_SUMMARY_*.md docs/reports/
mv docs/COMPLETION_CHECKLIST.md docs/reports/
mv docs/PHASE_*_COMPLETION_REPORT.md docs/reports/
mv docs/WEEK*_COMPLETION_SUMMARY.md docs/reports/
```

**Guides** (5 файлов):
```bash
mv docs/PROJECT_CONCEPT_AND_VALUE.md docs/guides/
mv docs/DEVELOPMENT_ROADMAP_2025.md docs/guides/
mv docs/DOCUMENTATION_HIERARCHY.md docs/guides/
mv docs/PROJECT_RESTRUCTURE_PLAN.md docs/guides/
mv docs/ONBOARDING_FLOW_FIX_REPORT.md docs/guides/
```

### Фаза 3: Обновление ссылок (1.5 часа)

Обновить все внутренние ссылки в документах:
- README.md
- INDEX.md
- BACKLOG.md
- ROADMAP.md
- Все файлы в новых папках

### Фаза 4: Проверка и тестирование (1 час)

1. Проверить все ссылки работают
2. Убедиться, что documentation ratio не изменился
3. Обновить INDEX.md с новой структурой
4. Создать отчет в changelog/

---

## ✅ Критерии успеха

- [ ] Все 69 файлов организованы в подпапки
- [ ] Корень `/docs` содержит только 3 файла: README.md, INDEX.md, RECOMMENDATIONS.md
- [ ] Все внутренние ссылки работают
- [ ] INDEX.md обновлен с новой структурой
- [ ] Documentation ratio остался 27%
- [ ] Создан отчет в changelog/

---

## 🔗 Связанные задачи

- TASK-001: Documentation Reorganization (завершена)
- TASK-010: Update all cross-references (следующая)

---

## 📚 Ресурсы

- [Keep a Changelog](https://keepachangelog.com/)
- [Documentation Best Practices](https://www.writethedocs.org/guide/writing/beginners-guide-to-docs/)

---

**Автор**: Product Team UNITY  
**Последнее обновление**: 21 октября 2025

