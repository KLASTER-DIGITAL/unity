# 🔧 Настройка GitHub Actions для автоматического деплоя

## ✅ **Текущий статус:**
- **Netlify CLI**: ✅ Настроен и авторизован
- **Проект**: ✅ `unity-diary-app`
- **Site ID**: ✅ `e1ad1205-eab6-44dc-b329-3f4ed87d9b9a`
- **URL**: ✅ `https://unity-diary-app.netlify.app`

## 🔑 **Настройка секретов в GitHub:**

### 1. **Получите NETLIFY_AUTH_TOKEN:**
```bash
# Выполните в терминале:
netlify api getCurrentUser
# Скопируйте account_id: "68e911991825da0c21a20993"
```

### 2. **Добавьте секреты в GitHub:**
1. Перейдите в репозиторий: https://github.com/KLASTER-DIGITAL/unity
2. **Settings** → **Secrets and variables** → **Actions**
3. Добавьте секреты:
   - `NETLIFY_AUTH_TOKEN`: `68e911991825da0c21a20993`
   - `NETLIFY_SITE_ID`: `e1ad1205-eab6-44dc-b329-3f4ed87d9b9a`

## 🚀 **Проверка автоматического деплоя:**

После добавления секретов:
1. Сделайте любой коммит в ветку `main`
2. GitHub Actions автоматически запустится
3. Проверьте статус в **Actions** вкладке
4. Сайт обновится на Netlify

## 📊 **Текущие URLs:**

- **Продакшн**: https://unity-diary-app.netlify.app
- **Админ-панель**: https://unity-diary-app.netlify.app/?view=admin
- **GitHub**: https://github.com/KLASTER-DIGITAL/unity
- **Netlify Dashboard**: https://app.netlify.com/projects/unity-diary-app

## 🎯 **Workflow:**

1. **Разработка**: `npm run dev` → `http://localhost:3001`
2. **Коммит**: `git add . && git commit -m "message" && git push`
3. **Автодеплой**: GitHub Actions → Netlify
4. **Продакшн**: https://unity-diary-app.netlify.app

## 🆘 **Устранение проблем:**

### GitHub Actions не запускается:
- Проверьте файл `.github/workflows/deploy.yml`
- Убедитесь, что секреты добавлены правильно

### Ошибки деплоя:
- Проверьте логи в **Actions** вкладке GitHub
- Убедитесь, что `npm run build` работает локально

### Проблемы с Netlify:
- Проверьте статус: `netlify status`
- Проверьте логи: `netlify logs`
