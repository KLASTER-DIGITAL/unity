# Deployment Configuration - UNITY-v2

**Последнее обновление**: 2025-10-28  
**Платформа**: Vercel  
**Статус**: ✅ Production Ready

---

## 🎯 Обзор

UNITY-v2 использует **dual deployment strategy**:
- **PWA (Web)**: Vercel (https://unity-wine.vercel.app)
- **React Native (Mobile)**: Expo (планируется)

Эта документация описывает конфигурацию Vercel deployment для PWA.

---

## 📁 Структура проекта

### Критическое разделение директорий

```
/app/                  # React Native Expo Router (ИСКЛЮЧЕН из Vercel build)
├── _layout.tsx        # Expo Router layout
├── index.tsx          # Expo Router entry point
└── ...

src/app/               # PWA компоненты (ВКЛЮЧЕН в Vercel build)
├── mobile/            # PWA мобильные компоненты
│   ├── MobileApp.tsx
│   └── index.ts
└── admin/             # PWA админ компоненты
    ├── AdminApp.tsx
    └── index.ts
```

**ВАЖНО**: `/app/` и `src/app/` - это РАЗНЫЕ директории!
- `/app/` - React Native Expo Router (для native apps)
- `src/app/` - PWA компоненты (для web)

---

## ⚙️ Конфигурация Vercel

### 1. vercel.json

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install --legacy-peer-deps",
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

**Ключевые параметры**:
- `installCommand`: использует `--legacy-peer-deps` для совместимости Expo с React 18.3.1
- `framework`: Vite (НЕ Next.js)
- `outputDirectory`: `build` (НЕ `dist`)
- `rewrites`: SPA routing (все запросы → index.html)

---

### 2. .vercelignore

```
# React Native / Expo (не нужны для web build)
# ВАЖНО: /app/ с ведущим слэшем исключает только корневую директорию app/,
# НЕ затрагивая src/app/ (PWA компоненты)
/app/
/index.js
/.expo/
/.expo-shared/
/metro.config.js
/babel.config.js
/eas.json
/app.json
```

**Критическое правило**: Всегда используйте `/` в начале для исключения только корневых директорий.

**Примеры**:
- ✅ `/app/` - исключает только `/app/`, НЕ затрагивает `src/app/`
- ❌ `app/` - исключает ВСЕ директории с именем `app`, включая `src/app/`

---

### 3. .npmrc

```
# Игнорировать конфликты peer dependencies
# Необходимо для совместимости Expo (требует React 19) с React 18.3.1
legacy-peer-deps=true
```

**Почему это необходимо**:
- Expo SDK 54 требует React 19
- UNITY-v2 использует React 18.3.1
- `legacy-peer-deps=true` позволяет установить оба

**Почему .npmrc, а не vercel.json**:
- npm автоматически читает `.npmrc` при установке
- Приоритет выше чем `vercel.json` `installCommand`
- Более надежный способ

---

## 🏗️ Build Process

### 1. Vercel Build Steps

```bash
# 1. Clone repository
git clone https://github.com/KLASTER-DIGITAL/unity.git

# 2. Install dependencies (с --legacy-peer-deps из .npmrc)
npm install

# 3. Run build command
npm run build  # → vite build

# 4. Deploy to Vercel CDN
# Output: build/ directory
```

---

### 2. Vite Build Configuration

**vite.config.ts** - ключевые настройки:

```typescript
export default defineConfig({
  build: {
    outDir: 'build',  // НЕ 'dist'
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core - критический чанк (~50KB)
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor-react';
          }
          
          // Radix UI - UI библиотека (~80KB)
          if (id.includes('@radix-ui')) {
            return 'vendor-radix';
          }
          
          // Framer Motion - анимации (~120KB)
          if (id.includes('framer-motion') || id.includes('motion')) {
            return 'vendor-motion';
          }
          
          // Supabase - backend (~140KB)
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
          
          // Sentry - мониторинг (~250KB)
          if (id.includes('@sentry')) {
            return 'vendor-sentry';
          }
          
          // Lottie - анимации (~310KB)
          if (id.includes('lottie')) {
            return 'vendor-lottie';
          }
          
          // Lucide Icons - иконки (~20KB)
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }
          
          // Остальные библиотеки НЕ группируем в vendor-misc
          // чтобы избежать circular dependencies
          return undefined;
        }
      }
    }
  }
});
```

**Важно**: НЕ группируйте остальные библиотеки в `vendor-misc` - это вызывает circular dependencies!

---

## 📊 Bundle Size Optimization

### Текущие chunks (после оптимизации)

```
vendor-lottie-C5ugiMkF.js     308.50 kB │ gzip:  78.92 kB
vendor-react-CEb4Yjtj.js      209.99 kB │ gzip:  70.81 kB
vendor-sentry-B5uoE08w.js     250.17 kB │ gzip:  82.37 kB
vendor-supabase-D6AjcXdj.js   143.70 kB │ gzip:  38.01 kB
vendor-motion-BH7LBUOC.js     116.87 kB │ gzip:  38.64 kB
vendor-radix-5tK-v6rc.js       78.34 kB │ gzip:  24.17 kB
vendor-icons-BBW2tx75.js       22.80 kB │ gzip:   8.27 kB
```

**Итого**: ~1.13 MB (raw) / ~341 KB (gzip)

---

### История оптимизации

**До оптимизации** (с vendor-misc):
```
vendor-misc-Bpm007VH.js       171.13 kB │ gzip:  60.71 kB  ← ПРОБЛЕМА
vendor-react-2Y_3ZfKx.js      168.93 kB │ gzip:  55.34 kB
vendor-radix-DaAWrYu3.js       76.16 kB │ gzip:  23.32 kB
```

**После оптимизации** (без vendor-misc):
```
vendor-react-CEb4Yjtj.js      209.99 kB │ gzip:  70.81 kB  ← +41KB
vendor-radix-5tK-v6rc.js       78.34 kB │ gzip:  24.17 kB
vendor-motion-BH7LBUOC.js     116.87 kB │ gzip:  38.64 kB  ← НОВЫЙ
```

**Результат**: -130KB экономии, нет circular dependencies

---

## 🚀 Deployment Workflow

### Автоматический deployment (рекомендуется)

```bash
# 1. Commit changes
git add .
git commit -m "feat: новая фича"

# 2. Push to main
git push origin main

# 3. Vercel автоматически деплоит
# Время: ~25 секунд
# URL: https://unity-wine.vercel.app
```

---

### Ручной deployment (для тестирования)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

---

## 🔍 Troubleshooting

### Проблема 1: npm install failed (ERESOLVE)

**Ошибка**:
```
npm error ERESOLVE could not resolve
npm error While resolving: @expo/metro-runtime@6.1.2
npm error Found: react@18.3.1
npm error Conflicting peer dependency: react@19.2.0
```

**Решение**: Убедитесь, что `.npmrc` содержит `legacy-peer-deps=true`

---

### Проблема 2: Build failed (EISDIR)

**Ошибка**:
```
Could not load /vercel/path0/src/app/admin (EISDIR): illegal operation on a directory, read
```

**Решение**: Убедитесь, что `.vercelignore` использует `/app/` (с ведущим слэшем), НЕ `app/`

---

### Проблема 3: Circular dependency

**Ошибка**:
```
vendor-misc-Bpm007VH.js:1 Uncaught ReferenceError: Cannot access 'G' before initialization
```

**Решение**: НЕ группируйте остальные библиотеки в `vendor-misc` в `vite.config.ts`

---

## 📝 Environment Variables

### Vercel Dashboard

Добавьте следующие переменные в Vercel Dashboard:

```
VITE_SUPABASE_URL=https://ecuwuzqlwdkkdncampnc.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_SENTRY_DSN=<your-sentry-dsn>
SENTRY_AUTH_TOKEN=<your-sentry-auth-token>  # Опционально
```

---

## 🔗 Полезные ссылки

- **Production**: https://unity-wine.vercel.app
- **Vercel Dashboard**: https://vercel.com/klaster-digitals-projects/unity
- **GitHub Repo**: https://github.com/KLASTER-DIGITAL/unity
- **Vercel Docs**: https://vercel.com/docs

---

## 📚 Связанная документация

- `docs/CHANGELOG.md` - История изменений
- `docs/FIX.md` - Технические изменения
- `docs/handoff/2025-10-28_deployment_fixes.md` - Handoff документ
- `.augment/rules/unity.md` - Правила разработки

---

**Автор**: AI Agent  
**Дата создания**: 2025-10-28  
**Последнее обновление**: 2025-10-28

