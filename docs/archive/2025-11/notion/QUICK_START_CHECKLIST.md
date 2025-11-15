# ✅ Quick Start Checklist - Notion Integration

**Дата**: 2025-11-09  
**Время на настройку**: 30-40 минут

---

## 🎯 Цель

Полностью настроить интеграцию Notion + GitHub + Vercel для UNITY-v2

---

## 📋 Чеклист

### **Шаг 1: Notion Setup** (10 минут)

- [ ] **1.1** Открыть [Unity Project Hub](https://www.notion.so/Unity-Project-Hub-be47b86245634bf08c2a02888fec4a11)
- [ ] **1.2** Проверить что все 4 базы данных созданы:
  - [ ] Tasks
  - [ ] Roadmap
  - [ ] Releases
  - [ ] Stakeholder Comms
- [ ] **1.3** Создать Notion Integration:
  - [ ] Перейти на https://www.notion.so/my-integrations
  - [ ] Нажать "+ New integration"
  - [ ] Название: "UNITY GitHub Integration"
  - [ ] Выбрать workspace
  - [ ] Скопировать "Internal Integration Token"
- [ ] **1.4** Дать доступ Integration к базам данных:
  - [ ] Открыть Tasks database → "..." → "Connections" → "UNITY GitHub Integration"
  - [ ] Открыть Roadmap database → "..." → "Connections" → "UNITY GitHub Integration"
  - [ ] Открыть Releases database → "..." → "Connections" → "UNITY GitHub Integration"
  - [ ] Открыть Stakeholder Comms database → "..." → "Connections" → "UNITY GitHub Integration"

---

### **Шаг 2: GitHub Secrets** (5 минут)

- [ ] **2.1** Перейти в репозиторий: https://github.com/KLASTER-DIGITAL/unity
- [ ] **2.2** Settings → Secrets and variables → Actions
- [ ] **2.3** Добавить следующие secrets:
  - [ ] `NOTION_API_KEY` = (скопированный токен из шага 1.3)
  - [ ] `NOTION_TASKS_DB_ID` = `33d47291493f43b988a331ca975521d7`
  - [ ] `NOTION_ROADMAP_DB_ID` = `04e2b6d469bd4e2c8a5af8480b6d715d`
  - [ ] `NOTION_RELEASES_DB_ID` = `603c0f2896224c819e1ec68883dd9841`

---

### **Шаг 3: Импорт задач** (5 минут)

- [ ] **3.1** Установить зависимости:
  ```bash
  npm install @notionhq/client
  ```
- [ ] **3.2** Установить переменные окружения:
  ```bash
  export NOTION_API_KEY="secret_ваш_токен"
  export NOTION_TASKS_DB_ID="33d47291493f43b988a331ca975521d7"
  export NOTION_ROADMAP_DB_ID="04e2b6d469bd4e2c8a5af8480b6d715d"
  ```
- [ ] **3.3** Запустить импорт:
  ```bash
  node .github/scripts/import-backlog-to-notion.js
  ```
- [ ] **3.4** Проверить результат:
  - [ ] Открыть Tasks database в Notion
  - [ ] Убедиться что все 27 задач импортированы
  - [ ] Проверить что статусы и приоритеты правильные

---

### **Шаг 4: Тестирование автоматизации** (10 минут)

- [ ] **4.1** Создать тестовый Issue:
  ```bash
  gh issue create --title "Test Issue" --body "Test automation" --label "P1-High,PWA"
  ```
- [ ] **4.2** Проверить в Notion:
  - [ ] Task создан
  - [ ] Title: "Test Issue"
  - [ ] Status: Ready
  - [ ] Priority: P1-High
  - [ ] Product Area: Mobile
- [ ] **4.3** Закрыть тестовый Issue:
  ```bash
  gh issue close <номер_issue>
  ```
- [ ] **4.4** Проверить в Notion:
  - [ ] Task обновлен
  - [ ] Status: Done
- [ ] **4.5** Удалить тестовый Issue (опционально)

---

### **Шаг 5: Создание Dashboards** (10 минут)

- [ ] **5.1** Создать Team Dashboard:
  - [ ] Следовать инструкциям в [NOTION_DASHBOARDS.md](./NOTION_DASHBOARDS.md)
  - [ ] Добавить Tasks Board
  - [ ] Добавить My Tasks
  - [ ] Добавить Sprint Tasks
- [ ] **5.2** Создать Owner Dashboard:
  - [ ] Следовать инструкциям в [NOTION_DASHBOARDS.md](./NOTION_DASHBOARDS.md)
  - [ ] Добавить Roadmap Timeline
  - [ ] Добавить This Week Tasks
  - [ ] Добавить KPI Metrics
- [ ] **5.3** Создать Marketing Dashboard (опционально):
  - [ ] Следовать инструкциям в [NOTION_DASHBOARDS.md](./NOTION_DASHBOARDS.md)
- [ ] **5.4** Создать Investor Update (опционально):
  - [ ] Следовать инструкциям в [NOTION_DASHBOARDS.md](./NOTION_DASHBOARDS.md)

---

### **Шаг 6: Обновление документации** (5 минут)

- [ ] **6.1** Добавить note в BACKLOG.md:
  ```markdown
  > **ВАЖНО**: Этот файл устарел. Все задачи теперь управляются через Notion.
  > 👉 [Unity Project Hub](https://www.notion.so/Unity-Project-Hub-be47b86245634bf08c2a02888fec4a11)
  ```
- [ ] **6.2** Обновить docs/00_START_HERE.md:
  - [ ] Добавить ссылку на Notion Project Hub
  - [ ] Добавить ссылку на NOTION_SETUP_GUIDE.md
- [ ] **6.3** Архивировать старые файлы (опционально):
  - [ ] Переместить BACKLOG.md в docs/archive/
  - [ ] Переместить ROADMAP.md в docs/archive/
  - [ ] Переместить SPRINT.md в docs/archive/

---

## ✅ Проверка готовности

После выполнения всех шагов, проверьте:

- [ ] ✅ Notion Project Hub открывается
- [ ] ✅ Все 4 базы данных заполнены
- [ ] ✅ GitHub Actions workflows работают (проверить в Actions tab)
- [ ] ✅ Тестовый Issue создал Task в Notion
- [ ] ✅ Dashboards созданы и отображают данные
- [ ] ✅ Команда имеет доступ к Notion workspace

---

## 🎉 Готово!

Теперь у вас полностью настроенная интеграция:

✅ **Notion** - единый источник истины для задач  
✅ **GitHub Actions** - автоматическая синхронизация  
✅ **Vercel** - preview URLs в задачах  
✅ **Dashboards** - для разных аудиторий  

---

## 📚 Дополнительные ресурсы

- 📖 [NOTION_SETUP_GUIDE.md](./NOTION_SETUP_GUIDE.md) - Полная инструкция
- 🔄 [NOTION_AUTOMATION.md](./NOTION_AUTOMATION.md) - Как работает автоматизация
- 🎨 [NOTION_DASHBOARDS.md](./NOTION_DASHBOARDS.md) - Создание Dashboard
- 📋 [README.md](./README.md) - Обзор интеграции

---

## 🆘 Проблемы?

Если что-то не работает:

1. Проверьте GitHub Actions logs: https://github.com/KLASTER-DIGITAL/unity/actions
2. Проверьте что все GitHub Secrets добавлены
3. Проверьте что Integration имеет доступ к базам данных
4. Прочитайте [NOTION_AUTOMATION.md](./NOTION_AUTOMATION.md) → Troubleshooting

---

**Удачи! 🚀**

