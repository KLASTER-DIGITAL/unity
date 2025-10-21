# 🚀 DEPLOYMENT GUIDE - UNITY-v2

**Дата создания:** 21 октября 2025  
**Статус:** ✅ Актуально  
**Автор:** AI Assistant (Augment Agent)

---

## 📋 СОДЕРЖАНИЕ

1. [Обзор](#обзор)
2. [Требования](#требования)
3. [Vercel Deployment](#vercel-deployment)
4. [Environment Variables](#environment-variables)
5. [Supabase Configuration](#supabase-configuration)
6. [Sentry Integration](#sentry-integration)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 ОБЗОР

UNITY-v2 - это PWA приложение (Progressive Web App) для ведения дневника достижений. Приложение деплоится на **Vercel** с использованием **Supabase** для backend и **Sentry** для мониторинга ошибок.

**Production URL:** https://unity-wine.vercel.app

**Технологический стек:**
- Frontend: React 18.3.1 + TypeScript + Vite 6.3.5
- Backend: Supabase (PostgreSQL + Edge Functions)
- Hosting: Vercel
- Monitoring: Sentry
- CI/CD: GitHub Actions

---

## ✅ ТРЕБОВАНИЯ

### Обязательные аккаунты:

1. **GitHub** - для хранения кода
2. **Vercel** - для hosting
3. **Supabase** - для backend
4. **Sentry** - для мониторинга ошибок

### Локальные требования:

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

---

## 🌐 VERCEL DEPLOYMENT

### Первоначальная настройка

#### 1. Создание проекта на Vercel

**Через веб-интерфейс:**

1. Открыть https://vercel.com
2. Нажать "Add New" → "Project"
3. Выбрать GitHub репозиторий `KLASTER-DIGITAL/unity`
4. Настроить проект:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`

**Через Vercel CLI (альтернатива):**

```bash
# Установить Vercel CLI
npm install -g vercel

# Войти в аккаунт
vercel login

# Деплой проекта
vercel --prod
```

#### 2. Конфигурация проекта

Создать файл `vercel.json` в корне проекта:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "outputDirectory": "build",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### 3. Обновление Vite конфигурации

В `vite.config.ts` установить `base: '/'`:

```typescript
export default defineConfig({
  base: '/', // Для Vercel (не GitHub Pages)
  build: {
    outDir: 'build', // Должно совпадать с vercel.json
    // ...
  }
});
```

### Автоматический деплой

Vercel автоматически деплоит при каждом push в `main` ветку:

1. Push изменений в GitHub:
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   git push origin main
   ```

2. Vercel автоматически:
   - Запускает build
   - Деплоит на production
   - Обновляет URL

3. Проверить статус деплоя:
   - Vercel Dashboard: https://vercel.com/get-leadshunters-projects/unity
   - GitHub Actions: https://github.com/KLASTER-DIGITAL/unity/actions

---

## 🔐 ENVIRONMENT VARIABLES

### Обязательные переменные

Добавить в Vercel Dashboard → Settings → Environment Variables:

```bash
# Supabase
VITE_SUPABASE_URL=https://ecuwuzqlwdkkdncampnc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Sentry
VITE_SENTRY_DSN=https://db7db0cd94954c95ca56f4136c309b55@o4509440459997184.ingest.de.sentry.io/4510227957809232

# App Version
VITE_APP_VERSION=2.0.0
```

### Как добавить переменные:

1. Открыть Vercel Dashboard
2. Перейти в Settings → Environment Variables
3. Добавить каждую переменную:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** `https://ecuwuzqlwdkkdncampnc.supabase.co`
   - **Environment:** Production, Preview, Development
4. Нажать "Save"
5. Redeploy проект для применения изменений

### Локальная разработка

Создать файл `.env` в корне проекта:

```bash
VITE_SUPABASE_URL=https://ecuwuzqlwdkkdncampnc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SENTRY_DSN=https://db7db0cd94954c95ca56f4136c309b55@o4509440459997184.ingest.de.sentry.io/4510227957809232
VITE_APP_VERSION=2.0.0
```

⚠️ **ВАЖНО:** Файл `.env` добавлен в `.gitignore` и НЕ должен коммититься в Git!

---

## 🗄️ SUPABASE CONFIGURATION

### Authentication Settings

1. Открыть Supabase Dashboard: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc
2. Перейти в Authentication → URL Configuration
3. Настроить URLs:

**Site URL:**
```
https://unity-wine.vercel.app
```

**Redirect URLs:**
```
https://unity-wine.vercel.app
https://unity-wine.vercel.app/*
https://unity-wine.vercel.app/?view=admin
```

### Edge Functions

Деплой Edge Functions через Supabase MCP:

```typescript
// Использовать Supabase MCP tool
deploy_edge_function_supabase({
  project_id: "ecuwuzqlwdkkdncampnc",
  name: "admin-api",
  files: [
    { name: "index.ts", content: "..." }
  ]
})
```

### Database Migrations

Применить миграции через Supabase MCP:

```typescript
apply_migration_supabase({
  project_id: "ecuwuzqlwdkkdncampnc",
  name: "migration_name",
  query: "CREATE TABLE ..."
})
```

---

## 📊 SENTRY INTEGRATION

### Настройка проекта

1. **Создать проект в Sentry:**
   - Organization: `klaster-js`
   - Project: `unity-v2`
   - Platform: `javascript-react`

2. **Получить DSN:**
   ```
   https://db7db0cd94954c95ca56f4136c309b55@o4509440459997184.ingest.de.sentry.io/4510227957809232
   ```

3. **Добавить DSN в Vercel Environment Variables**

### Конфигурация

Файл `src/shared/lib/monitoring/sentry.ts`:

```typescript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    browserTracingIntegration(),
    replayIntegration({ maskAllText: true }),
    feedbackIntegration(),
  ],
  tracesSampleRate: 0.1, // 10% транзакций
  replaysSessionSampleRate: 0.1, // 10% сессий
  replaysOnErrorSampleRate: 1.0, // 100% при ошибках
  environment: 'production',
  release: 'unity-v2@2.0.0',
});
```

### Мониторинг

- **Dashboard:** https://klaster-js.sentry.io/projects/unity-v2/
- **Issues:** https://klaster-js.sentry.io/issues/
- **Performance:** https://klaster-js.sentry.io/performance/

---

## 🔄 CI/CD PIPELINE

### GitHub Actions

Файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
```

### Автоматический деплой

1. **Push в main** → автоматический деплой на production
2. **Pull Request** → preview deployment
3. **Другие ветки** → не деплоятся

### Проверка статуса

```bash
# Проверить последний деплой
vercel ls

# Проверить логи
vercel logs
```

---

## 🔧 TROUBLESHOOTING

### Проблема: Build fails на Vercel

**Ошибка:**
```
Error: No Output Directory named "dist" found
```

**Решение:**
1. Проверить `vercel.json`: `outputDirectory: "build"`
2. Проверить `vite.config.ts`: `outDir: 'build'`
3. Убедиться что они совпадают

### Проблема: Supabase Auth возвращает 400

**Ошибка:**
```
400 Bad Request from Supabase Auth
```

**Решение:**
1. Проверить Site URL в Supabase Dashboard
2. Добавить Vercel URL в Redirect URLs
3. Убедиться что URL без trailing slash

### Проблема: Environment variables не работают

**Решение:**
1. Проверить что переменные добавлены в Vercel Dashboard
2. Проверить что выбраны все environments (Production, Preview, Development)
3. Redeploy проект после добавления переменных
4. Проверить что переменные начинаются с `VITE_`

### Проблема: Sentry не отправляет ошибки

**Решение:**
1. Проверить что `VITE_SENTRY_DSN` установлен
2. Проверить что Sentry инициализируется только в production
3. Проверить console для ошибок Sentry
4. Проверить Sentry Dashboard для incoming events

---

## 📞 КОНТАКТЫ И РЕСУРСЫ

### Dashboards

- **Vercel:** https://vercel.com/get-leadshunters-projects/unity
- **Supabase:** https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc
- **Sentry:** https://klaster-js.sentry.io/projects/unity-v2/
- **GitHub:** https://github.com/KLASTER-DIGITAL/unity

### Документация

- [TEST_ACCOUNTS.md](../testing/TEST_ACCOUNTS.md) - Тестовые аккаунты
- [ROLE_BASED_ACCESS_CONTROL.md](../architecture/ROLE_BASED_ACCESS_CONTROL.md) - RBAC
- [SESSION_MANAGEMENT.md](../architecture/SESSION_MANAGEMENT.md) - Управление сессиями
- [VERCEL_PRODUCTION_DEPLOYMENT.md](../changelog/2025-10-21_VERCEL_PRODUCTION_DEPLOYMENT.md) - Отчет о деплое

---

**Автор:** AI Assistant (Augment Agent)  
**Дата:** 21 октября 2025  
**Статус:** ✅ Актуально

