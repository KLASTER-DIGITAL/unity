# 📋 Project Planning - UNITY-v2

**Дата обновления**: 2025-11-09  
**Статус**: Миграция в Notion завершена ✅

---

## 🚨 ВАЖНОЕ ИЗМЕНЕНИЕ

**Все задачи, roadmap и sprint planning переехали в Notion!**

### ❌ **Устаревшие файлы** (архивированы 2025-11-09):
- ~~BACKLOG.md~~ → **Notion Tasks Database**
- ~~ROADMAP.md~~ → **Notion Roadmap Database**
- ~~SPRINT.md~~ → **Notion Tasks Database** (фильтр по Sprint)

### ✅ **Новое местоположение**:

👉 **[Unity Project Hub в Notion](https://www.notion.so/Unity-Project-Hub-be47b86245634bf08c2a02888fec4a11)**

---

## 📊 Notion Databases

### **1. Tasks Database**
- **URL**: https://www.notion.so/33d47291493f43b988a331ca975521d7
- **Назначение**: Все задачи проекта (текущие + архивные)
- **Автосинхронизация**: GitHub Issues/PRs → Notion Tasks

### **2. Roadmap Database**
- **URL**: https://www.notion.so/04e2b6d469bd4e2c8a5af8480b6d715d
- **Назначение**: Долгосрочное планирование (Q4 2025 - Q3 2026)
- **Представления**: Timeline, Board, Table

### **3. Releases Database**
- **URL**: https://www.notion.so/603c0f2896224c819e1ec68883dd9841
- **Назначение**: История релизов + changelog
- **Автосинхронизация**: GitHub Releases → Notion Releases

### **4. Stakeholder Communications**
- **URL**: https://www.notion.so/c8ea309c4e70454192681f7e4c41c866
- **Назначение**: Коммуникации для разных аудиторий

---

## 🔄 Автоматизация

### **GitHub → Notion**

Автоматическая синхронизация через GitHub Actions:

```
Issue created → Task created (Status: Ready)
PR opened → Task updated (Status: In Review)
PR merged → Task updated (Status: Done)
Release published → Release created + Tasks updated
Vercel deployed → Preview URL added to Task
```

**Workflows**:
- `.github/workflows/sync-pr-issue-to-notion.yml`
- `.github/workflows/release-to-notion.yml`
- `.github/workflows/vercel-deploy-to-notion.yml`

---

## 📚 Документация

Все инструкции по работе с Notion находятся в `docs/notion/`:

- 📖 **[README.md](../notion/README.md)** - Обзор интеграции
- ✅ **[QUICK_START_CHECKLIST.md](../notion/QUICK_START_CHECKLIST.md)** - Быстрый старт
- 🔧 **[NOTION_SETUP_GUIDE.md](../notion/NOTION_SETUP_GUIDE.md)** - Настройка
- 🔄 **[NOTION_AUTOMATION.md](../notion/NOTION_AUTOMATION.md)** - Автоматизация
- 🎨 **[NOTION_DASHBOARDS.md](../notion/NOTION_DASHBOARDS.md)** - Dashboards
- 📋 **[CORRECTED_IMPLEMENTATION_PLAN.md](../notion/CORRECTED_IMPLEMENTATION_PLAN.md)** - План внедрения

---

## 🎯 Для разных аудиторий

### **Для команды разработки**
👉 [Team Dashboard в Notion](https://www.notion.so/) (создать по инструкции)
- Tasks Board (по Status)
- My Tasks
- Sprint Tasks

### **Для владельца проекта**
👉 [Owner Dashboard в Notion](https://www.notion.so/) (создать по инструкции)
- Roadmap Timeline
- This Week Tasks
- KPI Metrics

### **Для маркетинга**
👉 [Marketing Dashboard в Notion](https://www.notion.so/) (создать по инструкции)
- Upcoming Releases
- Highlights to Announce

### **Для инвесторов**
👉 [Investor Update в Notion](https://www.notion.so/) (создать по инструкции)
- Quarterly Progress
- Shipped Epics

---

## 📁 Архив

Старые файлы находятся в:
- `docs/archive/2025-11-09_cleanup/BACKLOG_DEPRECATED.md`
- `docs/archive/2025-11-09_cleanup/ROADMAP_DEPRECATED.md`
- `docs/archive/2025-11-09_cleanup/SPRINT_DEPRECATED.md`

---

## ❓ FAQ

### **Q: Где теперь создавать новые задачи?**
A: В Notion Tasks Database или через GitHub Issues (автоматически синхронизируется)

### **Q: Как посмотреть текущий спринт?**
A: Notion Tasks Database → фильтр по Sprint

### **Q: Где roadmap?**
A: Notion Roadmap Database → Timeline view

### **Q: Нужно ли обновлять задачи вручную?**
A: Нет! Автоматическая синхронизация через GitHub Actions

---

**Готово! Теперь все управление проектом в Notion! 🎉**

