# 🔄 Notion Automation для UNITY-v2

**Дата**: 2025-11-09  
**Статус**: ✅ Настроено

---

## 📊 Схема автоматизации

```
GitHub Issues/PRs → GitHub Actions → Notion API → Notion Tasks
Vercel Deployments → GitHub Actions → Notion API → Notion Tasks
GitHub Releases → GitHub Actions → Notion API → Notion Releases
```

---

## 🔧 GitHub Actions Workflows

### **1. Sync PR/Issue to Notion**

**Файл**: `.github/workflows/sync-pr-issue-to-notion.yml`

**Триггеры**:
- `issues`: opened, edited, closed, reopened, assigned
- `pull_request`: opened, edited, closed, reopened, ready_for_review, converted_to_draft
- `pull_request_review`: submitted

**Логика**:

#### **Issue Events**
```javascript
Issue opened → 
  Создать Task в Notion:
    - Title: из Issue title
    - Status: Ready
    - Priority: из labels (P0/P1/P2/P3)
    - Product Area: из labels (PWA/Backend/Admin)
    - GitHub Issue URL: ссылка на Issue

Issue closed → 
  Обновить Task:
    - Status: Done

Issue reopened → 
  Обновить Task:
    - Status: Ready
```

#### **PR Events**
```javascript
PR opened (not draft) → 
  Найти Task по Issue URL:
    - Status: In Review
    - GitHub PR URLs: добавить ссылку на PR

PR draft → 
  Обновить Task:
    - Status: In Progress

PR merged → 
  Обновить Task:
    - Status: Done

PR closed (not merged) → 
  Обновить Task:
    - Status: Blocked
```

---

### **2. Create Notion Release**

**Файл**: `.github/workflows/release-to-notion.yml`

**Триггеры**:
- `release`: published
- `push`: tags (v*)

**Логика**:
```javascript
Release published → 
  1. Получить commit SHA
  2. Получить список коммитов с момента последнего релиза
  3. Извлечь Issue/PR номера из коммитов
  4. Найти связанные Tasks в Notion
  5. Создать Release в Notion:
     - Version: tag name
     - Date: published_at
     - Environment: Production
     - Git Commit SHA: commit hash
     - Linked Tasks: связанные задачи
  6. Обновить статус связанных Tasks на Done
```

**Парсинг Release Notes**:
```javascript
## ✨ Новые возможности → Highlights
## 🐛 Исправления → Highlights
## ⚡ Производительность → Highlights
## 🚨 Breaking Changes → Breaking Changes
```

---

### **3. Update Notion with Vercel Deployment**

**Файл**: `.github/workflows/vercel-deploy-to-notion.yml`

**Триггеры**:
- `deployment_status`: success

**Логика**:
```javascript
Vercel deployment успешен → 
  1. Получить deployment URL
  2. Получить PR/commit из deployment
  3. Найти Tasks связанные с PR
  4. Обновить Tasks:
     - Vercel Preview URL: deployment URL
```

---

## 📋 Маппинг полей

### **GitHub Issue → Notion Task**

| GitHub | Notion | Логика |
|--------|--------|--------|
| `title` | Title | Прямой маппинг |
| `state` (open) | Status (Ready) | Маппинг статусов |
| `state` (closed) | Status (Done) | Маппинг статусов |
| `labels` (P0-Critical) | Priority (P0-Critical) | Извлечение из labels |
| `labels` (PWA) | Product Area (Mobile) | Маппинг по категориям |
| `labels` (Backend) | Product Area (Backend) | Маппинг по категориям |
| `html_url` | GitHub Issue URL | Прямой маппинг |
| `assignee` | Assignee | Требует маппинг GitHub user → Notion user |

### **GitHub PR → Notion Task**

| GitHub PR | Notion Task | Логика |
|-----------|-------------|--------|
| `state` (open, not draft) | Status (In Review) | Маппинг статусов |
| `draft` (true) | Status (In Progress) | Маппинг статусов |
| `merged` (true) | Status (Done) | Маппинг статусов |
| `state` (closed, not merged) | Status (Blocked) | Маппинг статусов |
| `html_url` | GitHub PR URLs | Добавление в список |

### **GitHub Release → Notion Release**

| GitHub Release | Notion Release | Логика |
|----------------|----------------|--------|
| `tag_name` | Version | Прямой маппинг |
| `published_at` | Date | Прямой маппинг |
| `name` | Summary | Прямой маппинг |
| `body` | Highlights + Breaking Changes | Парсинг markdown |
| commit SHA | Git Commit SHA | Из git |
| связанные Issues | Linked Tasks | Поиск по Issue URL |

---

## 🔍 Поиск и связывание

### **Как находятся связанные Tasks**

#### **По Issue URL**
```javascript
// В Notion ищем Task с GitHub Issue URL
const pages = await notion.databases.query({
  database_id: tasksDbId,
  filter: {
    property: 'GitHub Issue URL',
    url: {
      equals: 'https://github.com/KLASTER-DIGITAL/unity/issues/123'
    }
  }
});
```

#### **По PR URL**
```javascript
// В Notion ищем Task с GitHub PR URLs содержащим URL
const pages = await notion.databases.query({
  database_id: tasksDbId,
  filter: {
    property: 'GitHub PR URLs',
    rich_text: {
      contains: 'https://github.com/KLASTER-DIGITAL/unity/pull/456'
    }
  }
});
```

#### **По Issue номеру из PR**
```javascript
// Извлекаем Issue номер из PR title или body
const issueMatch = pr.title.match(/#(\d+)/) || pr.body?.match(/#(\d+)/);
if (issueMatch) {
  const issueNumber = issueMatch[1];
  const issueUrl = `https://github.com/KLASTER-DIGITAL/unity/issues/${issueNumber}`;
  // Ищем Task по Issue URL
}
```

---

## ⚙️ Настройка переменных окружения

### **GitHub Secrets** (обязательно)

```bash
NOTION_API_KEY = secret_ваш_токен_здесь
NOTION_TASKS_DB_ID = 33d47291493f43b988a331ca975521d7
NOTION_ROADMAP_DB_ID = 04e2b6d469bd4e2c8a5af8480b6d715d
NOTION_RELEASES_DB_ID = 603c0f2896224c819e1ec68883dd9841
```

### **Автоматические переменные** (предоставляются GitHub)

```bash
GITHUB_TOKEN = автоматически
GITHUB_REPOSITORY = KLASTER-DIGITAL/unity
GITHUB_EVENT_PATH = путь к event payload
```

---

## 🧪 Тестирование автоматизации

### **1. Тест Issue → Task**

```bash
# Создать тестовый Issue
gh issue create --title "Test Issue" --body "Test" --label "P1-High,PWA"

# Проверить в Notion:
# - Task создан
# - Title: "Test Issue"
# - Status: Ready
# - Priority: P1-High
# - Product Area: Mobile
```

### **2. Тест PR → Task**

```bash
# Создать тестовый PR
gh pr create --title "Test PR #123" --body "Fixes #123"

# Проверить в Notion:
# - Task обновлен
# - Status: In Review
# - GitHub PR URLs: содержит ссылку на PR
```

### **3. Тест Release → Release**

```bash
# Создать тестовый Release
gh release create v2.0.2 --title "Test Release" --notes "## ✨ Test feature"

# Проверить в Notion:
# - Release создан
# - Version: v2.0.2
# - Highlights: "Test feature"
# - Linked Tasks: связанные задачи
```

---

## 🐛 Troubleshooting

### **Автоматизация не работает**

1. **Проверить GitHub Actions logs**:
   - https://github.com/KLASTER-DIGITAL/unity/actions
   - Найти failed workflow
   - Посмотреть error message

2. **Проверить Notion API Key**:
   ```bash
   curl -X GET https://api.notion.com/v1/users/me \
     -H "Authorization: Bearer secret_ваш_токен" \
     -H "Notion-Version: 2022-06-28"
   ```

3. **Проверить Database IDs**:
   - Открыть базу данных в Notion
   - Скопировать ID из URL
   - Сравнить с GitHub Secret

4. **Проверить доступ Integration**:
   - Открыть базу данных
   - "..." → "Connections"
   - Убедиться что "UNITY GitHub Integration" подключен

---

**Готово! Автоматизация настроена и работает! 🎉**

