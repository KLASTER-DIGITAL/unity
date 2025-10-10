# Инструкции для завершения деплоя UNITY

## ✅ Выполнено:
- ✅ Настроены переменные окружения (.env, .env.example)
- ✅ Обновлен Supabase клиент для использования переменных окружения
- ✅ Создан .gitignore
- ✅ Инициализирован Git репозиторий
- ✅ Создан netlify.toml для конфигурации деплоя
- ✅ Создан _redirects для SPA редиректов
- ✅ Добавлен скрипт preview в package.json
- ✅ Исправлены проблемы с зависимостями
- ✅ Протестирована сборка (npm run build успешно)
- ✅ Создан первый коммит

## 🔄 Следующие шаги:

### 1. Создать репозиторий на GitHub:
1. Зайдите на https://github.com/new
2. Название репозитория: `UNITY`
3. Сделайте репозиторий публичным или приватным
4. НЕ добавляйте README, .gitignore или лицензию (уже есть)
5. Нажмите "Create repository"

### 2. Подключить локальный репозиторий к GitHub:
```bash
cd /Users/rustamkarimov/DEV/UNITY
git remote add origin https://github.com/[ВАШ_USERNAME]/UNITY.git
git push -u origin main
```

### 3. Деплой на Netlify:

#### Вариант А: Через веб-интерфейс (рекомендуется)
1. Зайдите на https://netlify.com
2. Нажмите "Add new site" → "Import an existing project"
3. Выберите GitHub и репозиторий UNITY
4. Настройки сборки:
   - Build command: `npm run build`
   - Publish directory: `build`
5. Нажмите "Deploy site"

#### Вариант Б: Через Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

### 4. Настроить переменные окружения в Netlify:
1. В панели Netlify перейдите в Site settings → Environment variables
2. Добавьте переменные:
   - `VITE_SUPABASE_URL` = `https://ecuwuzqlwdkkdncampnc.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88`
3. Нажмите "Save"
4. Пересоберите сайт: Deploys → Trigger deploy

### 5. Проверить работу:
- Откройте URL от Netlify
- Проверьте работу авторизации Supabase
- Проверьте все основные функции приложения

## 📁 Структура проекта готова:
- `.env` - переменные окружения (не в Git)
- `.env.example` - шаблон переменных
- `.gitignore` - исключения для Git
- `netlify.toml` - конфигурация Netlify
- `public/_redirects` - редиректы для SPA
- `package.json` - обновлен с preview скриптом

## 🚀 Команды для локального тестирования:
```bash
npm run dev      # разработка
npm run build    # сборка
npm run preview  # тест продакшн сборки
```
