---
type: "always_apply"
---

# UNITY-v2 - Правила разработки

**Версия**: 1.0
**Дата**: 2025-10-24
**Применение**: Автоматически во всех разговорах Augment Chat и Agent

---

## 🏗️ Архитектура

### Платформа и технологии
- **PWA приложение** (НЕ Telegram Mini App), фокус на мобильном опыте
- **React Native Expo готовность**: 95%+ кода готово к миграции, platform-agnostic архитектура реализована
- **Feature-Sliced Design**: `app/mobile` (PWA max-w-md) + `app/admin` (full-width ?view=admin)
- **Стек**: React 18.3.1 + TypeScript + Vite 6.3.5 + Supabase + Tailwind CSS + shadcn/ui
- **Deployment**: ТОЛЬКО Vercel (https://unity-wine.vercel.app), автоматический деплой через Git Integration

### Edge Functions
- **Standalone pattern**: embedded utilities, НЕ shared imports
- **Лимит**: максимум 300 строк на функцию
- **Деплой**: ТОЛЬКО через Supabase MCP команду `deploy_edge_function_supabase`
- **Тестирование**: Chrome MCP + console logs
- **ЗАПРЕТ**: НИКОГДА не использовать Docker для деплоя

### RBAC (Role-Based Access Control)
- **super_admin**: доступ ТОЛЬКО к `/?view=admin`, управление системой
- **user**: доступ ТОЛЬКО к PWA кабинету
- **3 точки контроля**: AuthScreenNew.tsx, AdminLoginScreen.tsx, App.tsx
- **Автоматический редирект**: при попытке доступа к неправильному интерфейсу

### React Native Expo
- **Статус**: 95%+ готовность, миграция отложена до Q3 2025
- **Platform Adapters**: storage, media, navigation - реализованы
- **Universal Components**: Button, Select, Switch, Modal - готовы
- **ПРАВИЛО**: Все новые компоненты ДОЛЖНЫ использовать Universal Components из `@/shared/components/ui/universal`
- **ЗАПРЕТ**: НЕ использовать Radix UI напрямую в новых компонентах

### i18n система
- **Динамическая CRUD**: управление через админ-панель
- **Хранение**: Supabase таблицы `languages` + `translations`
- **Языки**: 7 активных (ru/en/es/de/fr/zh/ja), возможность добавления неограниченного количества
- **Автоперевод**: через AI GPT-4o-mini

### AI-Friendly Code принципы
- **Модульность**: файлы < 300 строк (CSS < 200, компоненты < 250)
- **Читаемость**: явные имена, избегать сокращений, комментарии для сложной логики
- **Context7 MCP**: использовать для документации библиотек (React, Supabase, shadcn/ui)
- **Цвета**: НИКОГДА хардкод (`bg-white`, `bg-gray-*`), ВСЕГДА CSS переменные (`bg-card`, `text-foreground`)
- **Transitions**: ВСЕГДА добавлять `transition-colors duration-300` для темной темы
- **Время AI-анализа**: оптимизация для быстрого анализа (3-5 сек вместо 30-60 сек)

### Mobile UI Best Practices
- **iOS Design System**: 100% соответствие iOS Human Interface Guidelines
- **Touch Targets**: минимум 44x44px для всех интерактивных элементов
- **Responsive Typography**: адаптивные размеры текста для iPhone SE (320px) до iPhone Pro Max (430px)
- **Breakpoints**: 320px (base) → 375px (sm) → 390px (md) → 430px (lg)
- **PWA max-width**: `max-w-md` (448px) для мобильного интерфейса
- **Accessibility**: поддержка reduced motion, high contrast, достаточный контраст текста
- **Spacing**: responsive padding через CSS переменные (`--spacing-modal-padding`, `--spacing-section-padding-x`)
- **Animations**: Framer Motion с spring physics для нативного ощущения

---

## ⚠️ Критические правила

### Обязательные проверки
1. **Supabase Advisors**: ОБЯЗАТЕЛЬНО перед КАЖДЫМ изменением кода/БД
   ```typescript
   get_advisors_supabase({
     project_id: "ecuwuzqlwdkkdncampnc",
     type: "security"
   })
   get_advisors_supabase({
     project_id: "ecuwuzqlwdkkdncampnc",
     type: "performance"
   })
   ```
   - НИКОГДА не продолжать при ошибках Advisors
   - ВСЕГДА исправлять проблемы НЕМЕДЛЕННО перед новым кодом

2. **Консоль браузера**: ВСЕГДА проверять через Chrome MCP перед коммитом
   - Если есть ошибки → НЕМЕДЛЕННО исправлять
   - НИКОГДА не коммитить код с ошибками в консоли

3. **Completeness rule**: ВСЕГДА выполнять ВСЕ физические действия НЕМЕДЛЕННО
   - Перемещение файлов
   - Создание папок
   - Обновление содержимого
   - НЕ только обновлять содержимое файлов

### Documentation ratio
- **Правило 1:1**: docs count ≤ source files count
- **Текущий**: 27% (92 docs / 334 source files) ✅
- **Автоматизация**: GitHub Action `docs-ratio-check.yml` + `scripts/check-docs-ratio.sh`
- **Цель**: Предотвращение раздувания документации

### Масштабирование
- **Цель**: 100,000 пользователей за 1 год
- **ВСЕГДА**: оптимизировать код/БД с учетом цели
- **ВСЕГДА**: добавлять индексы для частых запросов
- **ВСЕГДА**: проверять N+1 проблемы
- **ВСЕГДА**: учитывать производительность при новых функциях

---

## 🤖 AI Workflow

### Перед редактированием
1. **ВСЕГДА** `codebase-retrieval` детальный анализ
2. Спрашивать о ВСЕХ символах/классах/методах (низкий уровень детализации)
3. Один вызов, не множественные
4. Подтверждать существование и сигнатуры функций перед использованием

### После редактирования
1. **ВСЕГДА** `codebase-retrieval` для downstream changes:
   - Все callers и call sites
   - Все implementations интерфейсов
   - Все subclasses
   - Существующие тесты
   - Type definitions, interfaces, schemas
   - Документация
   - Import statements
   - Конфигурационные файлы

2. **ВСЕГДА** обновлять существующие тесты
3. **НИКОГДА** не создавать новые тесты без запроса

### Параллельные вызовы
- **ВСЕГДА** максимизировать параллельные вызовы инструментов
- При чтении 3 файлов → 3 параллельных вызова `view`
- Read-only команды → ВСЕГДА параллельно
- Ошибаться в сторону максимизации параллелизма

---

## 🚫 Запреты

### Создание файлов
- **НИКОГДА** не создавать файлы без необходимости
- **ВСЕГДА** предпочитать редактирование существующих
- **НИКОГДА** не создавать .md проактивно без запроса
- **НИКОГДА** не суммировать действия в файлах без запроса

### Deployment
- **НИКОГДА** не упоминать Netlify (только Vercel)
- **НИКОГДА** не использовать Docker для Edge Functions
- **НИКОГДА** не коммитить без проверки консоли

### Package Management
- **ВСЕГДА** использовать package managers (npm, pip, cargo)
- **НИКОГДА** не редактировать package.json/requirements.txt вручную
- **Исключение**: только для сложных конфигураций, недоступных через CLI

---

## 📚 Документация

### Single Source of Truth
- **BACKLOG.md**: единый источник истины всех задач
- **ROADMAP.md**: стратегия 6-12 месяцев
- **SPRINT.md**: тактика 1-2 недели
- **RECOMMENDATIONS.md**: AI-рекомендации, обновляется еженедельно через `codebase-retrieval`

### Naming conventions
- `changelog/archive/`: `YYYY-MM-DD_snake_case.md`
- `plan/tasks/`: `kebab-case.md`
- `architecture/`: `UPPER_SNAKE_CASE.md`
- `guides/`: `НАЗВАНИЕ_GUIDE.md`

### Workflow задач
1. Создание → `planned/`
2. Старт → `active/`
3. Завершение → `archive/`

### Changelog правила

**Два файла**:
- **CHANGELOG.md**: пользовательские изменения (что видит пользователь)
- **FIX.md**: технические изменения (что видит разработчик)

**CHANGELOG.md категории**:
- ✨ Новые возможности (features)
- 🐛 Исправления (bug fixes)
- 🔒 Безопасность (security)
- ⚡ Производительность (performance)
- 🗄️ База данных (database changes)
- 📚 Документация (user-facing docs)

**FIX.md категории**:
- 🗑️ Удалено (removed code/files)
- 🔄 Изменено (refactoring)
- 📚 Документация (dev docs)
- ✅ Тестирование (tests)
- 🏗️ Инфраструктура (build/deploy)

**Формат записи**:
```markdown
## [Unreleased] - YYYY-MM-DD

### ✨ Новые возможности
- **Компонент**: Краткое описание (детали)
  - Подробность 1
  - Подробность 2
```

**Архивация**:
- Детальные отчеты → `docs/changelog/archive/YYYY-MM-DD_название.md`
- Когда: после завершения спринта/фичи
- Naming: `2025-10-21_vercel_deployment.md`

**Запреты**:
- ❌ НЕ смешивать пользовательские и технические изменения
- ❌ НЕ дублировать информацию между CHANGELOG и FIX
- ❌ НЕ создавать записи без категории
- ❌ НЕ использовать общие фразы ("улучшения", "исправления")

---

## 🔧 Task Management

### Когда использовать
- Сложные задачи, требующие планирования
- Разбиение больших задач на маленькие шаги
- Отслеживание прогресса

### Правила
- **КРИТИЧЕСКИ**: отмечать COMPLETE сразу после завершения (не батчить)
- Давать пользователю видимость прогресса
- Использовать ОЧЕНЬ часто для сложных задач

---

## 🆘 Recovery Strategy

### Если AI зацикливается
- Вызывает один инструмент многократно для одной задачи
- Ходит по кругу или в rabbit hole
- **ДЕЙСТВИЕ**: НЕМЕДЛЕННО попросить помощи у пользователя
- **НЕ** продолжать безрезультатные попытки

---

## 🔑 Доступы (Критическая информация)

### Supabase
- **Project ID**: ecuwuzqlwdkkdncampnc
- **Access Token**: sbp_f074a7f31380ee22d963995ee889291985c7ba57
- **URL**: https://ecuwuzqlwdkkdncampnc.supabase.co

### Тестовые аккаунты
1. **Super Admin**: diary@leadshunter.biz admin123 (role: super_admin) 
2. **Rustam**: rustam@leadshunter.biz demo123 (role: user) - реальный пользователь
3. **Anna**: an@leadshunter.biz (role: user) - демо с предзаполненными данными

### Production
- **URL**: https://unity-wine.vercel.app
- **Deployment**: Vercel + GitHub Actions auto при push main

---

## 📝 Примечания

- Эти правила применяются автоматически во всех разговорах
- При конфликте правил - спросить пользователя
- При неясности - спросить пользователя
- Всегда приоритет: безопасность > скорость
