# 🚀 Notion Setup Guide для UNITY-v2

**Дата создания**: 2025-11-09  
**Статус**: ✅ Готово к использованию

---

## 📊 Структура проекта в Notion

### **Главная страница**: [Unity Project Hub](https://www.notion.so/Unity-Project-Hub-be47b86245634bf08c2a02888fec4a11)

### **4 основные базы данных**:

1. **[Tasks](https://www.notion.so/33d47291493f43b988a331ca975521d7)** - Задачи разработки
2. **[Roadmap](https://www.notion.so/04e2b6d469bd4e2c8a5af8480b6d715d)** - Долгосрочное планирование
3. **[Releases / Changelog](https://www.notion.so/603c0f2896224c819e1ec68883dd9841)** - История релизов
4. **[Stakeholder Comms](https://www.notion.so/c8ea309c4e70454192681f7e4c41c866)** - Коммуникации

---

## 🔧 Настройка GitHub Secrets

Для работы автоматизации нужно добавить следующие secrets в GitHub:

### **1. Получить Notion API Key**

1. Перейти на https://www.notion.so/my-integrations
2. Нажать "+ New integration"
3. Название: "UNITY GitHub Integration"
4. Выбрать workspace
5. Скопировать "Internal Integration Token"

### **2. Получить Database IDs**

Database IDs находятся в URL базы данных:

```
https://www.notion.so/33d47291493f43b988a331ca975521d7
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                      Это и есть Database ID
```

**Tasks DB ID**: `33d47291493f43b988a331ca975521d7`  
**Roadmap DB ID**: `04e2b6d469bd4e2c8a5af8480b6d715d`  
**Releases DB ID**: `603c0f2896224c819e1ec68883dd9841`

### **3. Добавить Secrets в GitHub**

1. Перейти в репозиторий: https://github.com/KLASTER-DIGITAL/unity
2. Settings → Secrets and variables → Actions
3. Нажать "New repository secret"
4. Добавить следующие secrets:

```
NOTION_API_KEY = secret_ваш_токен_здесь
NOTION_TASKS_DB_ID = 33d47291493f43b988a331ca975521d7
NOTION_ROADMAP_DB_ID = 04e2b6d469bd4e2c8a5af8480b6d715d
NOTION_RELEASES_DB_ID = 603c0f2896224c819e1ec68883dd9841
```

### **4. Дать доступ Integration к базам данных**

1. Открыть каждую базу данных в Notion
2. Нажать "..." (три точки) → "Connections"
3. Выбрать "UNITY GitHub Integration"
4. Нажать "Confirm"

Повторить для всех 4 баз данных.

---

## 📥 Импорт текущих задач

### **Автоматический импорт из BACKLOG.md**

```bash
# 1. Установить зависимости
npm install @notionhq/client

# 2. Установить переменные окружения
export NOTION_API_KEY="secret_ваш_токен"
export NOTION_TASKS_DB_ID="33d47291493f43b988a331ca975521d7"
export NOTION_ROADMAP_DB_ID="04e2b6d469bd4e2c8a5af8480b6d715d"

# 3. Запустить импорт
node .github/scripts/import-backlog-to-notion.js
```

**Результат**:
- Импортирует все 27 задач из BACKLOG.md
- Сохраняет статусы (Done, Ready, In Progress)
- Сохраняет приоритеты (P0-Critical, P1-High, P2-Medium, P3-Low)
- Пропускает уже существующие задачи

---

## 🔄 Автоматизация

### **GitHub Actions Workflows**

После добавления secrets в GitHub, автоматизация заработает автоматически:

#### **1. Sync PR/Issue to Notion** (`.github/workflows/sync-pr-issue-to-notion.yml`)

**Триггеры**:
- Issue opened/edited/closed/reopened
- PR opened/edited/closed/merged
- PR review submitted

**Действия**:
- Issue opened → создает Task в Notion (Status: Ready)
- Issue closed → обновляет Task (Status: Done)
- PR opened → обновляет Task (Status: In Review)
- PR draft → обновляет Task (Status: In Progress)
- PR merged → обновляет Task (Status: Done)
- PR closed (not merged) → обновляет Task (Status: Blocked)

#### **2. Create Notion Release** (`.github/workflows/release-to-notion.yml`)

**Триггеры**:
- GitHub Release published
- Git tag pushed (v*)

**Действия**:
- Создает Release в Notion
- Собирает все закрытые Issues/PRs с момента последнего релиза
- Связывает Tasks с Release
- Обновляет статус связанных Tasks на Done

#### **3. Update Notion with Vercel Deployment** (`.github/workflows/vercel-deploy-to-notion.yml`)

**Триггеры**:
- Vercel deployment успешен

**Действия**:
- Находит связанные Tasks по PR
- Добавляет Vercel Preview URL в поле Task

---

## 📱 Использование Notion MCP

### **Что такое Notion MCP**

Notion MCP (Model Context Protocol) позволяет AI агентам (Augment, Claude) напрямую работать с Notion:
- Читать задачи
- Создавать новые задачи
- Обновлять статусы
- Генерировать changelog

### **Настройка в VS Code**

1. Убедитесь что Notion MCP подключен к Augment Agent
2. Используйте команды:
   - "Create Notion task from selection"
   - "Open linked Vercel preview"
   - "Generate changelog from last sprint"

---

## 🎯 Представления для разных аудиторий

### **Для команды разработки**

**Страница**: Team Dashboard (создать в Notion)

**Виджеты**:
- Tasks Board (по Status)
- Sprint Tasks (фильтр по Sprint)
- My Tasks (фильтр по Assignee)

### **Для владельца проекта**

**Страница**: Owner Dashboard (создать в Notion)

**Виджеты**:
- Roadmap Timeline
- This Week Tasks
- In Progress Tasks
- Risks

### **Для маркетинга**

**Страница**: Marketing Dashboard (создать в Notion)

**Виджеты**:
- Upcoming Releases
- Highlights to Announce
- Communications Calendar

### **Для инвесторов**

**Страница**: Investor Update (создать в Notion)

**Виджеты**:
- Quarterly Progress
- Shipped Epics
- KPI Dashboard

---

## ✅ Чеклист настройки

- [ ] Получить Notion API Key
- [ ] Добавить GitHub Secrets (4 шт.)
- [ ] Дать доступ Integration к базам данных (4 шт.)
- [ ] Запустить импорт задач из BACKLOG.md
- [ ] Проверить автоматизацию (создать тестовый Issue)
- [ ] Создать Dashboard для команды
- [ ] Создать Dashboard для владельца
- [ ] Обучить команду работе с Notion

---

**Готово! Теперь Notion полностью интегрирован с UNITY-v2! 🎉**

