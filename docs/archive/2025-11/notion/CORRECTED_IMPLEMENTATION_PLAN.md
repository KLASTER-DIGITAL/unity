# ✅ ИСПРАВЛЕННЫЙ ПЛАН ВНЕДРЕНИЯ NOTION (с учетом ВСЕХ правил)

**Дата**: 2025-11-09  
**Статус**: Готов к выполнению

---

## 🚨 ЧТО МЫ УПУСТИЛИ В ПЕРВОМ ПЛАНЕ

### ❌ **1. Documentation Ratio Rule**
- **Проблема**: Создали 5 новых `.md` файлов без удаления старых
- **Текущее состояние**: 269 `.md` файлов / 545 `.ts/.tsx` файлов = 49% ✅
- **Решение**: МАССОВАЯ очистка неактуальной документации ПЕРЕД импортом

### ❌ **2. Completeness Rule**
- **Проблема**: НЕ архивировали BACKLOG.md, ROADMAP.md, SPRINT.md
- **Решение**: Скрипт `cleanup-docs.sh` автоматически архивирует

### ❌ **3. Notion MCP Capabilities**
- **Проблема**: НЕ использовали Notion MCP для проверки структуры
- **Решение**: Использовать `search_pages` и `read_database` перед импортом

### ❌ **4. Импорт 45+ завершенных задач**
- **Проблема**: Скрипт импортировал ТОЛЬКО 27 задач из BACKLOG.md
- **Решение**: Улучшенный скрипт импортирует ИЗ архивов тоже

### ❌ **5. Огромное количество неактуальной документации**
- **Проблема**: 50+ дублирующихся отчетов в `docs/plan/` (2025-11-08)
- **Решение**: Скрипт `cleanup-docs.sh` архивирует все дубликаты

---

## ✅ ИСПРАВЛЕННЫЙ ПОШАГОВЫЙ ПЛАН

### **Шаг 1: ОЧИСТКА документации** (КРИТИЧНО!) - 30 минут

```bash
# 1. Сделать скрипт исполняемым
chmod +x .github/scripts/cleanup-docs.sh

# 2. Запустить очистку
./.github/scripts/cleanup-docs.sh

# Результат:
# - Архивировано ~100+ файлов
# - BACKLOG.md, ROADMAP.md, SPRINT.md → архив
# - Дублирующиеся отчеты → архив
# - Соотношение документации: 49% → ~30%
```

**Что будет архивировано**:
- ✅ 50+ дублирующихся отчетов `docs/plan/*2025-11-08*.md`
- ✅ 30+ устаревших файлов `docs/archive/2025-10/*.md`
- ✅ Старые handoff отчеты `docs/handoff/2025-10-*.md`
- ✅ Дублирующиеся Push Notifications анализы
- ✅ BACKLOG.md, ROADMAP.md, SPRINT.md (переезжают в Notion)

---

### **Шаг 2: Проверка Notion структуры через MCP** - 10 минут

```bash
# Использовать Notion MCP для проверки
# (через Augment Agent)

# 1. Найти Unity Project Hub
notion.search_pages({ query: "Unity Project Hub" })

# 2. Проверить Tasks Database
notion.read_database({ database_id: "33d47291493f43b988a331ca975521d7" })

# 3. Проверить Roadmap Database
notion.read_database({ database_id: "04e2b6d469bd4e2c8a5af8480b6d715d" })

# 4. Проверить Releases Database
notion.read_database({ database_id: "603c0f2896224c819e1ec68883dd9841" })
```

**Цель**: Убедиться что структура создана правильно

---

### **Шаг 3: Настройка GitHub Secrets** - 5 минут

```bash
# Добавить в GitHub Secrets:
# https://github.com/KLASTER-DIGITAL/unity/settings/secrets/actions

NOTION_API_KEY = secret_ваш_токен
NOTION_TASKS_DB_ID = 33d47291493f43b988a331ca975521d7
NOTION_ROADMAP_DB_ID = 04e2b6d469bd4e2c8a5af8480b6d715d
NOTION_RELEASES_DB_ID = 603c0f2896224c819e1ec68883dd9841
```

---

### **Шаг 4: Импорт ВСЕХ задач** (включая архивы) - 10 минут

```bash
# 1. Установить зависимости
npm install @notionhq/client

# 2. Установить переменные окружения
export NOTION_API_KEY="secret_ваш_токен"
export NOTION_TASKS_DB_ID="33d47291493f43b988a331ca975521d7"
export NOTION_ROADMAP_DB_ID="04e2b6d469bd4e2c8a5af8480b6d715d"

# 3. Запустить УЛУЧШЕННЫЙ импорт
node .github/scripts/import-backlog-to-notion.js

# Результат:
# ✅ Импортировано 27 задач из BACKLOG.md
# ✅ Импортировано 45+ задач из архивов
# ✅ Всего: ~70+ задач в Notion
```

**Что импортируется**:
- ✅ 27 задач из `BACKLOG.md` (текущие)
- ✅ 45+ задач из `docs/archive/2025-10-25/completed/` (завершенные)
- ✅ Задачи из `docs/plan/tasks/archive/` (архивные)

---

### **Шаг 5: Тестирование автоматизации** - 10 минут

```bash
# 1. Создать тестовый Issue
gh issue create --title "Test Notion Integration" --body "Test" --label "P1-High,PWA"

# 2. Проверить в Notion Tasks Database
# - Task создан
# - Status: Ready
# - Priority: P1-High

# 3. Закрыть Issue
gh issue close <номер>

# 4. Проверить в Notion
# - Status: Done
```

---

### **Шаг 6: Создание Dashboards** - 20 минут

Следовать инструкциям в `NOTION_DASHBOARDS.md`:
- ✅ Team Dashboard (Board + My Tasks + Sprint Tasks)
- ✅ Owner Dashboard (Roadmap Timeline + This Week + KPI)
- ✅ Marketing Dashboard (опционально)
- ✅ Investor Update (опционально)

---

### **Шаг 7: Обновление документации** - 10 минут

```bash
# 1. Создать note в docs/00_START_HERE.md
echo "
> **ВАЖНО**: BACKLOG.md, ROADMAP.md, SPRINT.md устарели.
> Все задачи теперь в Notion: https://www.notion.so/Unity-Project-Hub-be47b86245634bf08c2a02888fec4a11
" >> docs/00_START_HERE.md

# 2. Обновить README.md
# Добавить ссылку на Notion Project Hub
```

---

## ⏱️ ИТОГОВОЕ ВРЕМЯ (ИСПРАВЛЕННОЕ)

| Этап | Время | Критичность |
|------|-------|-------------|
| 1. Очистка документации | 30 мин | 🔴 КРИТИЧНО |
| 2. Проверка Notion MCP | 10 мин | 🟡 ВАЖНО |
| 3. GitHub Secrets | 5 мин | 🔴 КРИТИЧНО |
| 4. Импорт ВСЕХ задач | 10 мин | 🔴 КРИТИЧНО |
| 5. Тестирование | 10 мин | 🟡 ВАЖНО |
| 6. Dashboards | 20 мин | 🟢 ОПЦИОНАЛЬНО |
| 7. Документация | 10 мин | 🟡 ВАЖНО |
| **ИТОГО** | **1.5 часа** | |

---

## 📊 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

### **До**:
- 📄 269 `.md` файлов (49% от кода)
- 📋 27 задач в BACKLOG.md
- 📦 45+ завершенных задач в архивах (НЕ видны)
- 🗂️ 50+ дублирующихся отчетов

### **После**:
- 📄 ~160 `.md` файлов (30% от кода) ✅
- 📋 ~70+ задач в Notion Tasks Database ✅
- 📦 История ВСЕХ завершенных задач видна ✅
- 🗂️ 0 дублирующихся отчетов ✅
- 🔄 Автоматическая синхронизация GitHub → Notion ✅
- 📊 Dashboards для разных аудиторий ✅

---

## ✅ ЧЕКЛИСТ ГОТОВНОСТИ

- [ ] Прочитал `.augment/rules/unity.md`
- [ ] Понял Documentation Ratio Rule (1:1)
- [ ] Понял Completeness Rule (физические действия НЕМЕДЛЕННО)
- [ ] Получил Notion API Key
- [ ] Добавил GitHub Secrets (4 шт.)
- [ ] Дал доступ Integration к базам данных (4 шт.)
- [ ] Готов запустить `cleanup-docs.sh`
- [ ] Готов запустить `import-backlog-to-notion.js`

---

**Готов начать! Жду вашего подтверждения! 🚀**

