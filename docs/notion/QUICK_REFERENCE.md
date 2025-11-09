# 📋 Notion Quick Reference - UNITY-v2

**Быстрая справка по работе с Notion для UNITY-v2**

---

## 🔗 Ссылки

### Notion Databases

- **Unity Project Hub**: https://www.notion.so/Unity-Project-Hub-be47b86245634bf08c2a02888fec4a11
- **Tasks**: https://www.notion.so/33d47291493f43b988a331ca975521d7
- **Roadmap**: https://www.notion.so/04e2b6d469bd4e2c8a5af8480b6d715d
- **Releases**: https://www.notion.so/603c0f2896224c819e1ec68883dd9841
- **Stakeholder Comms**: https://www.notion.so/c8ea309c4e70454192681f7e4c41c866

### Notion API

- **API Key**: Stored in `NOTION_API_KEY` environment variable (GitHub Secrets)
- **Integration**: UNITY GitHub Integration

---

## 📝 Создание новой задачи

### В Notion UI

1. Откройте Unity — Tasks
2. Нажмите "New" или "+"
3. Заполните поля:
   - **Title**: Название задачи
   - **Priority**: P0/P1/P2/P3
   - **Labels**: Security, Performance, UX, Bugs, General
   - **Estimate (h)**: Оценка времени в часах
   - **Status**: In progress / Done / Blocked

### Через GitHub Issue

1. Создайте Issue в GitHub
2. Добавьте labels: `P0-Critical`, `P1-High`, `P2-Medium`, `P3-Low`
3. GitHub Action автоматически создаст задачу в Notion

---

## 🔄 Автоматическая синхронизация

### GitHub → Notion

**Issues**:
- Issue opened → Task created (Status: "Ready")
- Issue closed → Task updated (Status: "Done")
- Issue assigned → Task assigned

**Pull Requests**:
- PR draft → Task (Status: "In Progress")
- PR ready for review → Task (Status: "In Review")
- PR merged → Task (Status: "Done")
- PR closed (not merged) → Task (Status: "Blocked")

**Releases**:
- Release published → Notion Release created

**Vercel Deployments**:
- Deployment success → Vercel Preview URL added to Task

---

## 🏷️ Priority Mapping

| GitHub Label | Notion Priority |
|--------------|-----------------|
| P0-Critical  | P0              |
| P1-High      | P1              |
| P2-Medium    | P2              |
| P3-Low       | P3              |

---

## 📊 Tasks Database Schema

| Property | Type | Description |
|----------|------|-------------|
| **title** | Title | Название задачи |
| **Status** | Status | In progress, Done, Blocked |
| **Priority** | Select | P0, P1, P2, P3 |
| **Labels** | Multi-select | Security, Performance, UX, Bugs, General |
| **Estimate (h)** | Number | Оценка времени в часах |
| **Epic** | Text | Связь с эпиком |
| **Sprint** | Text | Номер спринта |
| **GitHub Issue URL** | URL | Ссылка на GitHub Issue |
| **PR URL** | URL | Ссылка на Pull Request |
| **Vercel Preview URL** | URL | Ссылка на preview deployment |
| **Assignee** | Person | Исполнитель |
| **Due** | Date | Дедлайн |

---

## 🛠️ Скрипты

### Импорт задач из PRIORITY_ROADMAP

```bash
node scripts/import-to-notion.js
```

### Проверка схемы базы данных

```bash
node scripts/check-notion-schema.js
```

### Настройка структуры базы данных

```bash
node scripts/setup-notion-database.js
```

---

## ⚠️ Правила

### ВСЕГДА

- ✅ Создавать задачи в Notion Tasks (НЕ в BACKLOG.md)
- ✅ Обновлять статус задач при изменениях
- ✅ Добавлять GitHub Issue URL и PR URL
- ✅ Указывать Priority (P0/P1/P2/P3)
- ✅ Добавлять Labels для категоризации

### НИКОГДА

- ❌ НЕ использовать BACKLOG.md (deprecated)
- ❌ НЕ использовать ROADMAP.md (deprecated)
- ❌ НЕ использовать SPRINT.md (deprecated)

---

## 📚 Документация

- **Setup Guide**: `docs/notion/NOTION_SETUP_GUIDE.md`
- **Automation**: `docs/notion/NOTION_AUTOMATION.md`
- **Dashboards**: `docs/notion/NOTION_DASHBOARDS.md`
- **Import Success**: `docs/notion/IMPORT_SUCCESS_2025-11-09.md`
- **Unity Rules**: `.augment/rules/unity.md`

---

**Последнее обновление**: 2025-11-09

