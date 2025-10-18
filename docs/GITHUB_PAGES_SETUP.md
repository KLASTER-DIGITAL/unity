# 🚀 GitHub Pages Setup для UNITY-v2

## ✅ Что уже настроено

1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
   - Автоматическая сборка при push в main
   - Деплой на GitHub Pages
   - Поддержка переменных окружения

2. **Vite Configuration** (`vite.config.ts`)
   - Base path настроен для GitHub Pages: `/unity/`
   - Сборка в папку `build/`

3. **Jekyll отключен** (`public/.nojekyll`)
   - Файл создан для корректной работы SPA

## 🔧 Что нужно настроить в GitHub

### 1. Добавить Secrets в GitHub Repository

Перейдите в **Settings → Secrets and variables → Actions** и добавьте:

```
VITE_SUPABASE_URL = https://ecuwuzqlwdkkdncampnc.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1ODY5NCwiZXhwIjoyMDUwMTYyNjk0fQ.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88
```

### 2. Включить GitHub Pages

1. Перейдите в **Settings → Pages**
2. В разделе **Source** выберите **GitHub Actions**
3. Сохраните настройки

### 3. Проверить деплой

После push в main ветку:
1. Перейдите в **Actions** tab
2. Дождитесь завершения workflow "Deploy to GitHub Pages"
3. Приложение будет доступно по адресу: **https://klaster-digital.github.io/unity/**

## 🎯 Ожидаемый результат

После настройки приложение будет автоматически деплоиться на:
**https://klaster-digital.github.io/unity/**

## 🔍 Troubleshooting

### Если деплой не работает:

1. **Проверьте Secrets**
   - Убедитесь, что VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY добавлены

2. **Проверьте GitHub Pages настройки**
   - Source должен быть "GitHub Actions"

3. **Проверьте логи Actions**
   - Перейдите в Actions tab и посмотрите ошибки

### Если приложение не загружается:

1. **Проверьте Console в браузере**
   - Возможны ошибки с базовым путем

2. **Проверьте Network tab**
   - Убедитесь, что ресурсы загружаются с правильных путей

## 📝 Дополнительные настройки

### Custom Domain (опционально)

Если хотите использовать свой домен:
1. Создайте файл `public/CNAME` с вашим доменом
2. Настройте DNS записи у регистратора домена

### Environment Variables

Все переменные окружения должны начинаться с `VITE_` для Vite.js:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🎉 Готово!

После выполнения всех шагов UNITY-v2 будет автоматически деплоиться на GitHub Pages при каждом push в main ветку!
