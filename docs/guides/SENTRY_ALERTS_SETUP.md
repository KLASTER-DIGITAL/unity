# 🔔 SENTRY ALERTS SETUP GUIDE

**Дата создания:** 21 октября 2025  
**Проект:** UNITY-v2  
**Автор:** AI Assistant (Augment Agent)

---

## 📋 СОДЕРЖАНИЕ

1. [Обзор](#обзор)
2. [Типы алертов](#типы-алертов)
3. [Настройка Email уведомлений](#настройка-email-уведомлений)
4. [Настройка Slack интеграции](#настройка-slack-интеграции)
5. [Правила алертов](#правила-алертов)
6. [Тестирование](#тестирование)

---

## 🎯 ОБЗОР

Sentry Alerts позволяют получать уведомления о критических ошибках в реальном времени. Это помогает быстро реагировать на проблемы в production.

**Sentry Dashboard:** https://klaster-js.sentry.io/projects/unity-v2/

---

## 📧 ТИПЫ АЛЕРТОВ

### 1. Issue Alerts (Алерты по ошибкам)

Срабатывают когда:
- Новая ошибка появляется впервые
- Ошибка происходит N раз за период времени
- Ошибка затрагивает N пользователей
- Ошибка регрессирует (появляется снова после resolve)

### 2. Metric Alerts (Алерты по метрикам)

Срабатывают когда:
- Error rate превышает порог
- Transaction duration превышает порог
- Apdex score падает ниже порога

---

## 📧 НАСТРОЙКА EMAIL УВЕДОМЛЕНИЙ

### Шаг 1: Открыть настройки алертов

1. Открыть https://klaster-js.sentry.io/settings/projects/unity-v2/alerts/
2. Нажать "Create Alert"

### Шаг 2: Выбрать тип алерта

**Для критических ошибок:**
- Выбрать "Issues"
- Выбрать "When an event is captured"

### Шаг 3: Настроить условия

**Условие 1: Новая ошибка**
```
When an event is first seen
AND the issue's level is equal to error or fatal
THEN send a notification to Team
```

**Условие 2: Частые ошибки**
```
When an event is seen
AND the issue is seen more than 10 times in 1 hour
THEN send a notification to Team
```

**Условие 3: Ошибки затрагивающие много пользователей**
```
When an event is seen
AND the issue is seen by more than 100 users in 1 hour
THEN send a notification to Team
```

### Шаг 4: Выбрать получателей

- **Team:** Выбрать команду (например, "Engineering")
- **Email:** Добавить конкретные email адреса
- **Slack:** Настроить Slack канал (см. ниже)

### Шаг 5: Сохранить правило

- Дать имя правилу (например, "Critical Errors - Production")
- Нажать "Save Rule"

---

## 💬 НАСТРОЙКА SLACK ИНТЕГРАЦИИ

### Шаг 1: Установить Sentry App в Slack

1. Открыть https://klaster-js.sentry.io/settings/integrations/slack/
2. Нажать "Add Workspace"
3. Выбрать Slack workspace
4. Авторизовать приложение

### Шаг 2: Подключить канал

1. В Slack создать канал (например, `#sentry-alerts`)
2. Пригласить Sentry бота: `/invite @Sentry`
3. В Sentry Dashboard выбрать канал для уведомлений

### Шаг 3: Настроить формат уведомлений

**Рекомендуемый формат:**
```
🔴 [PRODUCTION] New Error in unity-v2
Error: Cannot read property 'map' of undefined
Users affected: 5
First seen: 2 minutes ago
View in Sentry: [Link]
```

---

## ⚙️ ПРАВИЛА АЛЕРТОВ

### Рекомендуемые правила для UNITY-v2

#### 1. Critical Errors (P0)

**Название:** `[P0] Critical Errors - Production`

**Условия:**
- Issue level = `error` или `fatal`
- Environment = `production`
- First seen (новая ошибка)

**Действия:**
- Email → `diary@leadshunter.biz`
- Slack → `#sentry-critical`

**Частота:** Немедленно

---

#### 2. High Frequency Errors (P1)

**Название:** `[P1] High Frequency Errors`

**Условия:**
- Issue seen > 50 times in 1 hour
- Environment = `production`

**Действия:**
- Email → Team
- Slack → `#sentry-alerts`

**Частота:** Раз в час (не чаще)

---

#### 3. User Impact Errors (P1)

**Название:** `[P1] User Impact Errors`

**Условия:**
- Issue affects > 100 users in 1 hour
- Environment = `production`

**Действия:**
- Email → Team
- Slack → `#sentry-alerts`

**Частота:** Раз в час

---

#### 4. Regression Errors (P2)

**Название:** `[P2] Regression Errors`

**Условия:**
- Issue regressed (появилась снова после resolve)
- Environment = `production`

**Действия:**
- Email → Team
- Slack → `#sentry-alerts`

**Частота:** Немедленно

---

#### 5. Performance Degradation (P2)

**Название:** `[P2] Performance Degradation`

**Условия:**
- Transaction duration > 3 seconds
- Occurs > 10 times in 10 minutes

**Действия:**
- Email → Team
- Slack → `#sentry-performance`

**Частота:** Раз в 30 минут

---

## 🧪 ТЕСТИРОВАНИЕ

### Тест 1: Проверить Email уведомления

1. Создать тестовую ошибку в production:
   ```typescript
   // В AdminDashboard.tsx
   throw new Error('🧪 TEST ALERT: Email notification test');
   ```

2. Задеплоить на Vercel
3. Вызвать ошибку в браузере
4. Проверить email (должен прийти в течение 1-2 минут)

### Тест 2: Проверить Slack уведомления

1. Использовать ту же тестовую ошибку
2. Проверить Slack канал `#sentry-alerts`
3. Убедиться что сообщение содержит:
   - Название ошибки
   - Stacktrace
   - Ссылку на Sentry
   - Количество затронутых пользователей

### Тест 3: Проверить частоту уведомлений

1. Вызвать ошибку 10 раз подряд
2. Убедиться что пришло только 1 уведомление (не 10)
3. Это подтверждает что rate limiting работает

---

## 📊 МОНИТОРИНГ АЛЕРТОВ

### Dashboard для мониторинга

1. **Alerts Dashboard:**
   - https://klaster-js.sentry.io/alerts/rules/

2. **Alert History:**
   - Показывает когда алерты срабатывали
   - Показывает кто получил уведомления

3. **Alert Performance:**
   - Показывает сколько алертов срабатывает
   - Помогает настроить пороги

### Метрики для отслеживания

- **Alert Volume:** Сколько алертов в день
- **False Positives:** Сколько алертов не требовали действий
- **Response Time:** Как быстро реагируют на алерты
- **Resolution Time:** Как быстро исправляют ошибки

---

## 🔧 TROUBLESHOOTING

### Проблема: Email уведомления не приходят

**Решение:**
1. Проверить email в Sentry User Settings
2. Проверить spam папку
3. Проверить что правило алерта активно
4. Проверить что условия правила выполняются

### Проблема: Slack уведомления не приходят

**Решение:**
1. Проверить что Sentry бот приглашен в канал
2. Проверить что интеграция активна
3. Проверить что канал выбран в правиле алерта
4. Переустановить Slack интеграцию

### Проблема: Слишком много уведомлений

**Решение:**
1. Увеличить пороги (например, > 100 раз вместо > 10)
2. Добавить rate limiting (раз в час вместо немедленно)
3. Добавить фильтры (только production, только critical)
4. Использовать Sentry's "Mute" функцию для известных ошибок

---

## 💡 BEST PRACTICES

### 1. Приоритизация

- **P0 (Critical):** Немедленные уведомления, 24/7
- **P1 (High):** Уведомления в рабочее время
- **P2 (Medium):** Дневной digest
- **P3 (Low):** Недельный digest

### 2. Rate Limiting

- Не отправлять больше 1 уведомления в час для одной ошибки
- Группировать похожие ошибки
- Использовать digest для низкоприоритетных ошибок

### 3. Фильтрация

- Игнорировать browser extension ошибки
- Игнорировать network errors (они часто временные)
- Игнорировать ad blocker ошибки

### 4. Мониторинг

- Еженедельно проверять Alert Dashboard
- Настраивать пороги на основе реальных данных
- Удалять неиспользуемые правила

---

## 📞 РЕСУРСЫ

- **Sentry Alerts Docs:** https://docs.sentry.io/product/alerts/
- **Slack Integration:** https://docs.sentry.io/product/integrations/notification-incidents/slack/
- **Email Notifications:** https://docs.sentry.io/product/alerts/notifications/

---

**Автор:** AI Assistant (Augment Agent)  
**Дата:** 21 октября 2025  
**Статус:** ✅ Готово к использованию

