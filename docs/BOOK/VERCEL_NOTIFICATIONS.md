# 🔔 Настройка уведомлений Vercel

**Дата**: 2025-01-30  
**Проблема**: Не приходят email уведомления от Vercel о деплоях

---

## ✅ Проверка статуса деплоя

### 1. Проверить в Vercel Dashboard

Откройте: https://vercel.com/klaster-digitals-projects/unity

**Что проверить**:
- Последний деплой должен быть с коммитом `779f8f5`
- Статус деплоя: ✅ Ready или ⏳ Building
- Время деплоя должно совпадать с временем push

### 2. Проверить через GitHub

Vercel автоматически создает статус-чек в GitHub:
- Откройте: https://github.com/KLASTER-DIGITAL/unity/commits/main
- Найдите коммит `779f8f5`
- Должен быть статус-чек от Vercel (✅ или ⏳)

---

## 🔔 Включение email уведомлений

### Способ 1: Через Vercel Dashboard

1. Откройте: https://vercel.com/klaster-digitals-projects/unity/settings
2. Перейдите в раздел **"Notifications"** или **"Integrations"**
3. Найдите настройки **"Email Notifications"**
4. Включите уведомления для:
   - ✅ Deployment Success
   - ✅ Deployment Failure
   - ✅ Deployment Ready

### Способ 2: Через Vercel Account Settings

1. Откройте: https://vercel.com/account/notifications
2. Включите уведомления для:
   - ✅ Deployment notifications
   - ✅ Team activity

### Способ 3: Через GitHub Integration

Vercel может отправлять уведомления через GitHub:
1. Откройте: https://github.com/settings/notifications
2. Найдите интеграцию **Vercel**
3. Включите уведомления для:
   - ✅ Pull requests
   - ✅ Pushes

---

## 🔍 Альтернативные способы проверки деплоя

### 1. Проверить Production URL

Откройте: https://unity-wine.vercel.app

Если сайт работает и показывает последние изменения - деплой успешен.

### 2. Проверить через Vercel CLI

```bash
# Проверить последние деплои
vercel ls

# Проверить конкретный деплой
vercel inspect https://unity-wine.vercel.app
```

### 3. Проверить через GitHub Actions

Если настроены GitHub Actions:
- Откройте: https://github.com/KLASTER-DIGITAL/unity/actions
- Найдите последний workflow run

---

## ⚙️ Настройка автоматических уведомлений

### Slack Integration (рекомендуется)

1. Откройте: https://vercel.com/klaster-digitals-projects/unity/settings/integrations
2. Добавьте интеграцию **Slack**
3. Настройте канал для уведомлений о деплоях

### Discord Integration

1. Добавьте интеграцию **Discord**
2. Настройте webhook для уведомлений

### Custom Webhook

1. Создайте webhook endpoint
2. Добавьте в Vercel Settings → Webhooks
3. Настройте события: `deployment.created`, `deployment.ready`

---

## 📝 Проверка текущего статуса

### Коммит в репозитории:
```
779f8f5 fix(books): исправление критических проблем системы книг
```

### Ожидаемое поведение:
1. ✅ Push в `main` → Vercel автоматически запускает деплой
2. ⏳ Build процесс (обычно 1-3 минуты)
3. ✅ Deployment Ready → сайт обновлен

### Если деплой не запустился:
1. Проверьте интеграцию GitHub → Vercel
2. Проверьте настройки проекта в Vercel
3. Проверьте, что ветка `main` подключена к деплою

---

## 🔗 Полезные ссылки

- **Vercel Dashboard**: https://vercel.com/klaster-digitals-projects/unity
- **Production URL**: https://unity-wine.vercel.app
- **GitHub Repo**: https://github.com/KLASTER-DIGITAL/unity
- **Vercel Notifications Settings**: https://vercel.com/account/notifications

---

**Примечание**: Vercel может не отправлять email уведомления по умолчанию. Рекомендуется использовать Slack/Discord интеграции для более надежных уведомлений.

