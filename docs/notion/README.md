# 📊 Notion Integration для UNITY-v2

**Статус**: ✅ Настроено и готово к использованию  
**Дата**: 2025-11-09

---

## 🎯 Что это дает

### **Для вас (владелец проекта)**
✅ Видите весь проект в одном месте (Notion)  
✅ Не нужно разбираться в GitHub  
✅ Автоматическое обновление статусов задач  
✅ Roadmap с визуализацией прогресса  
✅ История всех релизов  

### **Для команды**
✅ Единый источник истины для задач  
✅ Автоматическая синхронизация с GitHub  
✅ Видят Vercel preview URLs прямо в задачах  
✅ Понятные статусы (Ready → In Progress → In Review → Done)  

### **Для маркетинга**
✅ Готовые тексты для анонсов (из Releases)  
✅ Календарь публикаций  
✅ Highlights для пользователей  

### **Для инвесторов**
✅ Квартальный прогресс  
✅ KPI метрики  
✅ Shipped features  
✅ Без технических деталей  

---

## 🚀 Быстрый старт

### **Шаг 1: Откройте Notion Project Hub**

👉 **[Unity Project Hub](https://www.notion.so/Unity-Project-Hub-be47b86245634bf08c2a02888fec4a11)**

Здесь вы найдете:
- 📋 Tasks - все задачи проекта
- 🗺️ Roadmap - долгосрочное планирование
- 📦 Releases - история релизов
- 💬 Communications - сообщения для разных аудиторий

---

### **Шаг 2: Настройте автоматизацию** (для разработчиков)

📖 **[Полная инструкция по настройке](./NOTION_SETUP_GUIDE.md)**

**Кратко**:
1. Получить Notion API Key
2. Добавить 4 GitHub Secrets
3. Дать доступ Integration к базам данных
4. Запустить импорт задач

**Время**: 15-20 минут

---

### **Шаг 3: Импортируйте текущие задачи**

```bash
# Установить зависимости
npm install @notionhq/client

# Установить переменные окружения
export NOTION_API_KEY="secret_ваш_токен"
export NOTION_TASKS_DB_ID="33d47291493f43b988a331ca975521d7"

# Запустить импорт
node .github/scripts/import-backlog-to-notion.js
```

**Результат**: Все 27 задач из BACKLOG.md будут в Notion

---

## 📚 Документация

### **Основные документы**
- 📖 [NOTION_SETUP_GUIDE.md](./NOTION_SETUP_GUIDE.md) - Полная инструкция по настройке
- 🔄 [NOTION_AUTOMATION.md](./NOTION_AUTOMATION.md) - Как работает автоматизация
- 🎨 [NOTION_DASHBOARDS.md](./NOTION_DASHBOARDS.md) - Создание Dashboard для разных аудиторий

### **Notion Bases**
- 📋 [Tasks Database](https://www.notion.so/33d47291493f43b988a331ca975521d7)
- 🗺️ [Roadmap Database](https://www.notion.so/04e2b6d469bd4e2c8a5af8480b6d715d)
- 📦 [Releases Database](https://www.notion.so/603c0f2896224c819e1ec68883dd9841)
- 💬 [Stakeholder Comms Database](https://www.notion.so/c8ea309c4e70454192681f7e4c41c866)

---

## 🔄 Как работает автоматизация

### **GitHub → Notion**

```
Issue created → Task created (Status: Ready)
PR opened → Task updated (Status: In Review)
PR merged → Task updated (Status: Done)
Release published → Release created + Tasks updated
Vercel deployed → Preview URL added to Task
```

### **Notion → GitHub**

```
Task created → можно создать GitHub Issue (вручную или через MCP)
Task updated → синхронизация через GitHub Actions
```

---

## 🎯 Следующие шаги

### **Для владельца проекта**
1. ✅ Откройте [Unity Project Hub](https://www.notion.so/Unity-Project-Hub-be47b86245634bf08c2a02888fec4a11)
2. ✅ Изучите Tasks Database
3. ✅ Посмотрите Roadmap
4. ✅ Создайте Owner Dashboard (инструкция в NOTION_DASHBOARDS.md)

### **Для команды разработки**
1. ✅ Прочитайте [NOTION_SETUP_GUIDE.md](./NOTION_SETUP_GUIDE.md)
2. ✅ Настройте GitHub Secrets
3. ✅ Запустите импорт задач
4. ✅ Создайте тестовый Issue для проверки автоматизации

### **Для маркетинга**
1. ✅ Откройте Releases Database
2. ✅ Изучите Highlights
3. ✅ Создайте Marketing Dashboard

---

## ❓ FAQ

### **Q: Нужно ли вручную обновлять задачи в Notion?**
A: Нет! Задачи обновляются автоматически при работе с GitHub (Issues, PRs, Releases).

### **Q: Можно ли создавать задачи прямо в Notion?**
A: Да! Можно создавать задачи в Notion, но для полной автоматизации лучше создавать GitHub Issues.

### **Q: Как добавить новых членов команды?**
A: Пригласите их в Notion workspace и дайте доступ к Unity Project Hub.

### **Q: Можно ли изменить структуру баз данных?**
A: Да, но будьте осторожны - это может сломать автоматизацию. Лучше добавлять новые поля, а не удалять существующие.

---

## 🆘 Поддержка

**Проблемы с настройкой?**
- Проверьте [NOTION_SETUP_GUIDE.md](./NOTION_SETUP_GUIDE.md)
- Убедитесь что все GitHub Secrets добавлены
- Проверьте что Integration имеет доступ к базам данных

**Автоматизация не работает?**
- Проверьте GitHub Actions logs
- Убедитесь что NOTION_API_KEY валиден
- Проверьте что Database IDs правильные

---

**Готово! Теперь у вас полная интеграция Notion + GitHub + Vercel! 🎉**

