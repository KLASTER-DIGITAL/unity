# 🚀 Инструкции для завершения деплоя через Netlify CLI

## ✅ Текущий статус:
- ✅ Netlify CLI установлен и авторизован
- ✅ Аккаунт: www.klaster.digital@gmail.com
- ✅ Команда: www-klaster-digital's team

## 🔄 Следующие шаги:

### Вариант 1: Завершить через веб-интерфейс (рекомендуется)

1. **Откройте Netlify**: https://app.netlify.com
2. **Нажмите "Add new site"** → **"Import an existing project"**
3. **Выберите "Deploy with GitHub"**
4. **Найдите репозиторий** `KLASTER-DIGITAL/unity`
5. **Настройки сборки** (автоматически из netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `build`
6. **Добавьте переменные окружения**:
   - `VITE_SUPABASE_URL` = `https://ecuwuzqlwdkkdncampnc.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88`
7. **Нажмите "Deploy site"**

### Вариант 2: Продолжить через CLI (интерактивно)

Если хотите продолжить через CLI, выполните команды вручную:

```bash
# 1. Создать сайт (выбрать команду интерактивно)
netlify sites:create --name unity-diary-app

# 2. Связать с локальной папкой
netlify link

# 3. Добавить переменные окружения
netlify env:set VITE_SUPABASE_URL "https://ecuwuzqlwdkkdncampnc.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88"

# 4. Деплой
netlify deploy --prod
```

## 🎯 Рекомендация:

**Используйте веб-интерфейс** - это быстрее и проще для первого деплоя. CLI можно использовать для последующих обновлений.

## 📋 После деплоя проверить:

1. **Открыть production URL**
2. **Проверить консоль браузера** на ошибки
3. **Протестировать авторизацию** Supabase
4. **Проверить основные функции** приложения

## 🔧 Готовые файлы:
- ✅ `netlify.toml` - конфигурация сборки
- ✅ `public/_redirects` - SPA редиректы
- ✅ `.env.example` - шаблон переменных
- ✅ Код в GitHub: https://github.com/KLASTER-DIGITAL/unity

**Приложение готово к деплою!** 🚀
