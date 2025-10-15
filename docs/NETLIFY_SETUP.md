# 🚀 Настройка Netlify для автоматического деплоя

## 📋 Пошаговая инструкция

### 1. **Создайте аккаунт на Netlify**
1. Перейдите на https://netlify.com
2. Войдите через GitHub аккаунт
3. Подключите ваш репозиторий

### 2. **Настройте сайт в Netlify**
1. В Netlify Dashboard нажмите "New site from Git"
2. Выберите "GitHub" как провайдера
3. Найдите ваш репозиторий `unity`
4. Настройте параметры сборки:
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Node version**: `18`

### 3. **Получите токены для GitHub Actions**

#### Получение NETLIFY_AUTH_TOKEN:
1. В Netlify Dashboard перейдите в **User settings** → **Applications**
2. Нажмите **New access token**
3. Дайте название токену (например, "GitHub Actions")
4. Скопируйте токен

#### Получение NETLIFY_SITE_ID:
1. В Netlify Dashboard выберите ваш сайт
2. Перейдите в **Site settings** → **General**
3. Скопируйте **Site ID**

### 4. **Добавьте секреты в GitHub**
1. Перейдите в ваш GitHub репозиторий
2. **Settings** → **Secrets and variables** → **Actions**
3. Добавьте два секрета:
   - `NETLIFY_AUTH_TOKEN` = ваш токен из шага 3
   - `NETLIFY_SITE_ID` = ваш Site ID из шага 3

### 5. **Проверьте деплой**
1. Сделайте любой коммит в ветку `main`
2. GitHub Actions автоматически запустится
3. Проверьте статус в **Actions** вкладке GitHub
4. После успешного деплоя сайт будет доступен по адресу Netlify

## 🔧 Альтернативный способ (ручной деплой)

Если GitHub Actions не работает, можно деплоить вручную:

```bash
# Установите Netlify CLI
npm install -g netlify-cli

# Войдите в Netlify
netlify login

# Соберите проект
npm run build

# Деплой
netlify deploy --prod --dir=build
```

## 🎯 Результат

После настройки:
- ✅ Автоматический деплой при каждом push в `main`
- ✅ Сайт доступен по адресу Netlify
- ✅ Админ-панель: `https://your-site.netlify.app/?view=admin`
- ✅ Пользовательский интерфейс: `https://your-site.netlify.app`

## 🆘 Устранение проблем

### GitHub Actions не запускается:
1. Проверьте, что файл `.github/workflows/deploy.yml` существует
2. Убедитесь, что секреты добавлены правильно
3. Проверьте логи в **Actions** вкладке

### Ошибки сборки:
1. Проверьте, что все зависимости установлены
2. Убедитесь, что `npm run build` работает локально
3. Проверьте логи сборки в Netlify

### Проблемы с деплоем:
1. Проверьте токены и Site ID
2. Убедитесь, что папка `build` создается после сборки
3. Проверьте настройки в Netlify Dashboard
