# 🏗️ UNITY-v2 - Техническая архитектура и реструктуризация

**Дата обновления**: 2025-10-20
**Версия**: 2.1
**Статус**: Edge Functions рефакторинг завершен (Фаза 1-3)
**Автор**: Команда UNITY

> **Важно**: Этот документ содержит техническую детализацию архитектуры из [UNITY_MASTER_PLAN_2025.md](./UNITY_MASTER_PLAN_2025.md)

> **Обновление 2025-10-20**: Завершен рефакторинг Edge Functions - монолитный make-server-9729c493 разбит на микросервисы. См. [EDGE_FUNCTIONS_REFACTORING_REPORT.md](../archive/completed/2025-10/architecture/EDGE_FUNCTIONS_REFACTORING_REPORT.md)

---

## 📋 Executive Summary

### Цели проекта
1. ✅ **Разделить архитектуру**: Мобильное PWA приложение (max-w-md) + Админ-панель (full-width)
2. ✅ **Устранить дубликаты**: Удалить мертвый код из `admin/old/`
3. ✅ **Оптимизировать структуру**: Feature-based архитектура с подготовкой к React Native Expo
4. ✅ **Улучшить производительность**: Code splitting, lazy loading, оптимизация бандла
5. ✅ **Обеспечить качество**: Тестирование на каждом этапе, zero breaking changes

### Ключевые метрики
- **Время выполнения**: 15 рабочих дней
- **Риск поломок**: Минимальный (пошаговая миграция с тестами)
- **Покрытие тестами**: 100% критических путей
- **Улучшение производительности**: -30% размер бандла, +50% скорость загрузки

---

## 📊 Текущее состояние проекта

### ✅ Что работает хорошо
- PWA с правильным mobile-first дизайном
- Telegram OAuth авторизация
- shadcn/ui компоненты
- Supabase backend с RLS
- Роутинг через `?view=admin`
- Интернационализация (7 языков)

### ❌ Проблемы
1. **Смешанная архитектура**: Мобильные и десктопные компоненты в одной папке
2. **Дубликаты кода**: `src/components/screens/admin/old/` - полные дубли
3. **Неоптимальная структура**: Компоненты не сгруппированы по фичам
4. **Большой бандл**: 2,041 kB (494 kB gzipped)
5. **Нет code splitting**: Все загружается сразу
6. **Не готов к React Native**: Веб-специфичный код не выделен

---

## 🎯 Целевая архитектура

### Структура проекта (Monorepo-ready)

```
UNITY-v2/
├── src/
│   ├── app/                      # 🆕 Точки входа приложений
│   │   ├── mobile/              # PWA мобильное приложение
│   │   │   ├── App.tsx          # Главный компонент (max-w-md)
│   │   │   └── routes.tsx       # Мобильный роутинг
│   │   └── admin/               # Админ-панель
│   │       ├── AdminApp.tsx     # Главный компонент (full-width)
│   │       └── routes.tsx       # Админ роутинг
│   │
│   ├── features/                 # 🆕 Feature-based модули
│   │   ├── mobile/              # Мобильные фичи
│   │   │   ├── home/           # Главный экран
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── api/        # 🆕 API для фичи
│   │   │   │   ├── types/      # 🆕 Типы для фичи
│   │   │   │   └── index.ts
│   │   │   ├── history/
│   │   │   ├── achievements/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   ├── auth/
│   │   │   └── media/
│   │   │
│   │   └── admin/               # Админ фичи
│   │       ├── dashboard/
│   │       ├── users/
│   │       ├── subscriptions/
│   │       ├── settings/
│   │       └── auth/
│   │
│   ├── shared/                   # 🆕 Общий код (Web + будущий RN)
│   │   ├── components/
│   │   │   ├── layout/         # Лейауты
│   │   │   ├── modals/         # Модальные окна
│   │   │   ├── pwa/            # PWA компоненты
│   │   │   └── ui/             # shadcn/ui
│   │   │
│   │   ├── lib/                 # Бизнес-логика (platform-agnostic)
│   │   │   ├── api/            # API клиенты
│   │   │   │   ├── client.ts   # 🆕 Базовый HTTP клиент
│   │   │   │   ├── supabase/   # Supabase клиент
│   │   │   │   └── repositories/ # 🆕 Repository pattern
│   │   │   ├── auth/           # Авторизация
│   │   │   ├── i18n/           # Интернационализация
│   │   │   ├── pwa/            # PWA утилиты
│   │   │   ├── media/          # Медиа обработка
│   │   │   └── stats/          # Статистика
│   │   │
│   │   ├── hooks/               # Общие React хуки
│   │   │   ├── useAuth.ts
│   │   │   ├── useApi.ts
│   │   │   └── usePlatform.ts  # 🆕 Определение платформы
│   │   │
│   │   └── types/               # TypeScript типы
│   │       ├── database.ts     # 🆕 Supabase generated types
│   │       ├── api.ts
│   │       └── index.ts
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   ├── mobile.css          # 🆕 Мобильные стили
│   │   └── admin.css           # 🆕 Админ стили
│   │
│   ├── App.tsx                  # 🔄 Главный роутер (?view=admin)
│   ├── main.tsx
│   └── index.css
│
├── tests/                        # 🆕 Тесты
│   ├── e2e/                     # Playwright E2E
│   ├── integration/             # Integration tests
│   └── unit/                    # Unit tests
│
├── scripts/                      # 🆕 Утилиты
│   ├── update-imports.ts        # Автообновление импортов
│   ├── generate-types.ts        # Генерация типов из Supabase
│   └── analyze-bundle.ts        # Анализ размера бандла
│
├── old/                          # Архив мертвого кода
│   ├── CLEANUP_REPORT.md
│   └── ...
│
└── docs/
    ├── MASTER_PLAN.md           # 👈 Этот документ
    ├── PROJECT_RESTRUCTURE_PLAN.md
    ├── MOBILE_ANALYSIS_AND_RECOMMENDATIONS.md
    └── ARCHITECTURE.md          # 🆕 Архитектурная документация
```

### Ключевые принципы архитектуры

1. **Feature-Sliced Design (FSD)**
   - Каждая фича - самодостаточный модуль
   - Четкие границы между слоями
   - Легко тестировать и поддерживать

2. **Platform-Agnostic Core**
   - Бизнес-логика в `shared/lib/` не зависит от платформы
   - Готовность к React Native Expo
   - Переиспользование кода между Web и Mobile

3. **Dependency Injection**
   - API клиенты через DI контейнер
   - Легко мокать для тестов
   - Гибкая конфигурация

4. **Repository Pattern**
   - Абстракция над Supabase
   - Единая точка доступа к данным
   - Легко переключить backend

5. **Microservices Architecture (Edge Functions)** ✅ **НОВОЕ 2025-10-20**
   - Каждый Edge Function - отдельная зона ответственности
   - Максимум 500 строк на микросервис
   - Shared utilities в `_shared/` для переиспользования кода
   - Деплой через Supabase MCP
   - AI-friendly структура с комментариями и JSDoc

---

## 🚀 Edge Functions Архитектура (2025-10-20)

### Текущие микросервисы (12 шт.)

**Документация:**
- [EDGE_FUNCTIONS_REFACTORING_PLAN.md](./EDGE_FUNCTIONS_REFACTORING_PLAN.md) - детальный план рефакторинга
- [API_ENDPOINTS_MIGRATION.md](./API_ENDPOINTS_MIGRATION.md) - маппинг старых и новых endpoints
- [EDGE_FUNCTIONS_REFACTORING_REPORT.md](../archive/completed/2025-10/architecture/EDGE_FUNCTIONS_REFACTORING_REPORT.md) - финальный отчет

**Статус**: ✅ Фаза 1-3 завершена (2025-10-20)

**Было:**
- 1 монолитный файл `make-server-9729c493/index.ts` (2312 строк)
- 31 endpoint в одном файле
- Дублирование кода с существующими микросервисами
- Невозможность деплоя через Supabase MCP (>2000 строк)

**Стало:**
- 12 микросервисов (средний размер ~350 строк)
- 0 дублирования кода
- Все микросервисы деплоятся через Supabase MCP
- AI-friendly структура

**Следующие шаги:**
1. Обновить frontend API клиенты (14 файлов)
2. Задеплоить новые микросервисы через Supabase MCP
3. Протестировать локально и на production
4. Удалить монолитный `make-server-9729c493`

---

## 🔄 План выполнения (8 фаз)

### Фаза 0: Подготовка и анализ (1 день)

#### Задачи
- [ ] Создать ветку `feature/restructure`
- [ ] Установить зависимости для тестирования
- [ ] Настроить Vitest и Playwright
- [ ] Создать baseline метрики (bundle size, performance)

#### Команды
```bash
# Создать ветку
git checkout -b feature/restructure

# Установить dev зависимости
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
npm install -D playwright @playwright/test
npm install -D @supabase/supabase-js@latest

# Инициализировать Playwright
npx playwright install
```

#### Тесты
```bash
# Baseline сборка
npm run build

# Проверить текущий размер бандла
ls -lh dist/assets/*.js

# Запустить dev сервер
npm run dev
```

**Критерии успеха**:
- ✅ Ветка создана
- ✅ Зависимости установлены
- ✅ Baseline метрики зафиксированы
- ✅ Проект собирается без ошибок

---

### Фаза 1: Очистка дубликатов (1 день)

#### Задачи
- [ ] Удалить `src/components/screens/admin/old/`
- [ ] Проверить что активные компоненты не зависят от old/
- [ ] Обновить документацию

#### Команды
```bash
# Проверить зависимости от old/
grep -r "admin/old" src/

# Удалить дубликаты
rm -rf src/components/screens/admin/old/

# Коммит
git add .
git commit -m "chore: remove duplicate admin components from old/ folder"
```

#### Тесты
```bash
# Проверить сборку
npm run build

# Запустить dev
npm run dev

# Проверить админ панель
# Открыть http://localhost:5173/?view=admin
```

**Критерии успеха**:
- ✅ Папка `admin/old/` удалена
- ✅ Проект собирается
- ✅ Админ панель работает
- ✅ Нет ошибок в консоли

---

### Фаза 2: Создание новой структуры (1 день)

#### Задачи
- [ ] Создать папки для новой структуры
- [ ] Создать index.ts файлы для экспортов
- [ ] Настроить path aliases в tsconfig.json

#### Команды
```bash
# Создать структуру
mkdir -p src/app/{mobile,admin}
mkdir -p src/features/mobile/{home,history,achievements,reports,settings,auth,media}/{components,hooks,api,types}
mkdir -p src/features/admin/{dashboard,users,subscriptions,settings,auth}/{components,hooks,api,types}
mkdir -p src/shared/{components/{layout,modals,pwa,ui},lib/{api/{supabase,repositories},auth,i18n,pwa,media,stats},hooks,types}
mkdir -p tests/{e2e,integration,unit}
mkdir -p scripts
```

#### Обновить tsconfig.json
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  }
}
```

#### Тесты
```bash
# Проверить что структура создана
tree src/ -L 3

# Проверить сборку
npm run build
```

**Критерии успеха**:
- ✅ Все папки созданы
- ✅ Path aliases настроены
- ✅ Проект собирается

---

### Фаза 3: Миграция shared компонентов (2 дня)

#### День 1: UI компоненты и утилиты

```bash
# UI компоненты
mv src/components/ui/* src/shared/components/ui/

# PWA компоненты
mv src/components/PWA*.tsx src/shared/components/pwa/
mv src/components/InstallPrompt.tsx src/shared/components/pwa/

# Layout компоненты
mv src/components/MobileBottomNav.tsx src/shared/components/layout/
mv src/components/MobileHeader.tsx src/shared/components/layout/
mv src/components/AchievementHeader.tsx src/shared/components/layout/

# Modals
mv src/components/TimePickerModal.tsx src/shared/components/modals/
mv src/components/PermissionGuide.tsx src/shared/components/modals/
```

#### День 2: Утилиты и хуки

```bash
# API
mv src/utils/api.ts src/shared/lib/api/
mv src/utils/supabase/* src/shared/lib/api/supabase/

# Auth
mv src/utils/auth.ts src/shared/lib/auth/

# i18n
mv src/utils/i18n/* src/shared/lib/i18n/
mv src/components/i18n/* src/shared/lib/i18n/

# PWA
mv src/utils/pwaUtils.ts src/shared/lib/pwa/
mv src/utils/generatePWAIcons.ts src/shared/lib/pwa/

# Media
mv src/utils/imageCompression.ts src/shared/lib/media/

# Stats
mv src/utils/statsCalculator.ts src/shared/lib/stats/

# Hooks
mv src/hooks/* src/shared/hooks/ 2>/dev/null || true
mv src/components/hooks/* src/shared/hooks/ 2>/dev/null || true
```

#### Создать index.ts для экспортов

```typescript
// src/shared/components/ui/index.ts
export * from './button';
export * from './card';
export * from './dialog';
// ... все остальные

// src/shared/lib/api/index.ts
export * from './api';
export * from './supabase/client';

// src/shared/lib/auth/index.ts
export * from './auth';
```

#### Тесты
```bash
# Проверить сборку после каждого перемещения
npm run build

# Проверить что импорты работают
npm run dev
```

**Критерии успеха**:
- ✅ Все shared компоненты перемещены
- ✅ index.ts файлы созданы
- ✅ Проект собирается
- ✅ Dev сервер запускается

---

### Фаза 4: Миграция мобильных фич (3 дня)

#### День 1: Auth и Home

```bash
# Auth фича
mkdir -p src/features/mobile/auth/components
mv src/components/WelcomeScreen.tsx src/features/mobile/auth/components/
mv src/components/AuthScreenNew.tsx src/features/mobile/auth/components/
mv src/components/AuthScreen.tsx src/features/mobile/auth/components/
mv src/components/OnboardingScreen*.tsx src/features/mobile/auth/components/

# Home фича
mkdir -p src/features/mobile/home/components
mv src/components/screens/AchievementHomeScreen.tsx src/features/mobile/home/components/
mv src/components/RecentEntriesFeed.tsx src/features/mobile/home/components/
mv src/components/ChatInputSection.tsx src/features/mobile/home/components/
```

#### День 2: History, Achievements, Reports

```bash
# History
mkdir -p src/features/mobile/history/components
mv src/components/screens/HistoryScreen.tsx src/features/mobile/history/components/

# Achievements
mkdir -p src/features/mobile/achievements/components
mv src/components/screens/AchievementsScreen.tsx src/features/mobile/achievements/components/

# Reports
mkdir -p src/features/mobile/reports/components
mv src/components/screens/ReportsScreen.tsx src/features/mobile/reports/components/
```

#### День 3: Settings и Media

```bash
# Settings
mkdir -p src/features/mobile/settings/components
mv src/components/screens/SettingsScreen.tsx src/features/mobile/settings/components/

# Media
mkdir -p src/features/mobile/media/{components,hooks}
mv src/components/MediaPreview.tsx src/features/mobile/media/components/
mv src/components/MediaLightbox.tsx src/features/mobile/media/components/
mv src/components/VoiceRecordingModal.tsx src/features/mobile/media/components/
```

#### Создать index.ts для каждой фичи

```typescript
// src/features/mobile/home/index.ts
export { AchievementHomeScreen } from './components/AchievementHomeScreen';
export { RecentEntriesFeed } from './components/RecentEntriesFeed';
export { ChatInputSection } from './components/ChatInputSection';
```

#### Тесты после каждого дня
```bash
npm run build
npm run dev
# Проверить каждый экран вручную
```

**Критерии успеха**:
- ✅ Все мобильные фичи перемещены
- ✅ index.ts созданы
- ✅ Проект собирается
- ✅ Все экраны работают

---

### Фаза 5: Миграция админ фич (2 дня)

#### День 1: Dashboard и Users

```bash
# Dashboard
mkdir -p src/features/admin/dashboard/components
mv src/components/screens/AdminDashboard.tsx src/features/admin/dashboard/components/

# Users
mkdir -p src/features/admin/users/components
mv src/components/screens/admin/UsersManagementTab.tsx src/features/admin/users/components/

# Subscriptions
mkdir -p src/features/admin/subscriptions/components
mv src/components/screens/admin/SubscriptionsTab.tsx src/features/admin/subscriptions/components/
```

#### День 2: Settings и Auth

```bash
# Settings (все табы)
mkdir -p src/features/admin/settings/components
mv src/components/screens/admin/SettingsTab.tsx src/features/admin/settings/components/
mv src/components/screens/admin/settings/*.tsx src/features/admin/settings/components/

# Если есть вложенные папки в settings
mv src/components/screens/admin/settings/api/* src/features/admin/settings/components/ 2>/dev/null || true

# Auth
mkdir -p src/features/admin/auth/components
mv src/components/AdminLoginScreen.tsx src/features/admin/auth/components/
```

#### Создать index.ts

```typescript
// src/features/admin/dashboard/index.ts
export { AdminDashboard } from './components/AdminDashboard';

// src/features/admin/settings/index.ts
export { SettingsTab } from './components/SettingsTab';
export { APISettingsTab } from './components/APISettingsTab';
export { LanguagesTab } from './components/LanguagesTab';
// ... все остальные табы
```

#### Тесты
```bash
npm run build
npm run dev

# Проверить админ панель
# Открыть http://localhost:5173/?view=admin
# Проверить все табы
```

**Критерии успеха**:
- ✅ Все админ фичи перемещены
- ✅ index.ts созданы
- ✅ Проект собирается
- ✅ Админ панель работает полностью

---

### Фаза 6: Разделение App.tsx (1 день)

#### Создать src/app/mobile/App.tsx

```typescript
import { useState, useEffect } from 'react';
import { MobileBottomNav } from '@/shared/components/layout/MobileBottomNav';
import { AchievementHomeScreen } from '@/features/mobile/home';
import { HistoryScreen } from '@/features/mobile/history';
import { AchievementsScreen } from '@/features/mobile/achievements';
import { ReportsScreen } from '@/features/mobile/reports';
import { SettingsScreen } from '@/features/mobile/settings';

export function MobileApp({ userData, onLogout }: any) {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <AchievementHomeScreen userData={userData} />;
      case 'history': return <HistoryScreen userData={userData} />;
      case 'achievements': return <AchievementsScreen userData={userData} />;
      case 'reports': return <ReportsScreen userData={userData} />;
      case 'settings': return <SettingsScreen userData={userData} onLogout={onLogout} />;
      default: return <AchievementHomeScreen userData={userData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      <main className="min-h-screen overflow-x-hidden scrollbar-hide pb-16">
        {renderScreen()}
      </main>

      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
```

#### Создать src/app/admin/AdminApp.tsx

```typescript
import { AdminDashboard } from '@/features/admin/dashboard';

export function AdminApp({ userData, onLogout }: any) {
  return (
    <div className="min-h-screen bg-background">
      <AdminDashboard
        userData={userData}
        onLogout={onLogout}
      />
    </div>
  );
}
```

#### Обновить src/App.tsx

```typescript
import { useState, useEffect } from 'react';
import { MobileApp } from './app/mobile/App';
import { AdminApp } from './app/admin/AdminApp';
import { WelcomeScreen } from '@/features/mobile/auth';
import { AdminLoginScreen } from '@/features/admin/auth';
import { checkSession, signOut } from '@/shared/lib/auth';

export function App() {
  const [userData, setUserData] = useState(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Проверка ?view=admin
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isAdmin = params.get('view') === 'admin';
    setIsAdminView(isAdmin);
  }, []);

  // Проверка сессии
  useEffect(() => {
    checkSession().then(setUserData);
  }, []);

  // Если админ режим и не авторизован
  if (isAdminView && !userData) {
    return <AdminLoginScreen onComplete={setUserData} />;
  }

  // Если админ режим и авторизован
  if (isAdminView && userData) {
    return <AdminApp userData={userData} onLogout={() => {
      signOut();
      setUserData(null);
    }} />;
  }

  // Мобильное приложение
  if (!userData) {
    return <WelcomeScreen onComplete={setUserData} />;
  }

  return <MobileApp userData={userData} onLogout={() => {
    signOut();
    setUserData(null);
  }} />;
}
```

#### Тесты
```bash
npm run build
npm run dev

# Тест 1: Мобильное приложение
# Открыть http://localhost:5173
# Проверить все табы

# Тест 2: Админ панель
# Открыть http://localhost:5173/?view=admin
# Проверить авторизацию
# Проверить все табы админки

# Тест 3: Переключение
# Переключиться между режимами
# Проверить что данные не теряются
```

**Критерии успеха**:
- ✅ MobileApp создан
- ✅ AdminApp создан
- ✅ App.tsx обновлен
- ✅ Роутинг через ?view=admin работает
- ✅ Оба режима работают корректно

---

### Фаза 7: Обновление импортов (2 дня)

#### Создать scripts/update-imports.ts

```typescript
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const importMappings: Record<string, string> = {
  // UI components
  'from "./components/ui/': 'from "@/shared/components/ui/',
  'from "../components/ui/': 'from "@/shared/components/ui/',
  'from "../../components/ui/': 'from "@/shared/components/ui/',

  // Layout
  'from "./components/MobileBottomNav"': 'from "@/shared/components/layout/MobileBottomNav"',
  'from "./components/MobileHeader"': 'from "@/shared/components/layout/MobileHeader"',

  // PWA
  'from "./components/PWAHead"': 'from "@/shared/components/pwa/PWAHead"',
  'from "./components/PWASplash"': 'from "@/shared/components/pwa/PWASplash"',
  'from "./components/PWAStatus"': 'from "@/shared/components/pwa/PWAStatus"',
  'from "./components/PWAUpdatePrompt"': 'from "@/shared/components/pwa/PWAUpdatePrompt"',
  'from "./components/InstallPrompt"': 'from "@/shared/components/pwa/InstallPrompt"',

  // Utils
  'from "./utils/api"': 'from "@/shared/lib/api"',
  'from "../utils/api"': 'from "@/shared/lib/api"',
  'from "../../utils/api"': 'from "@/shared/lib/api"',
  'from "./utils/auth"': 'from "@/shared/lib/auth"',
  'from "../utils/auth"': 'from "@/shared/lib/auth"',
  'from "../../utils/auth"': 'from "@/shared/lib/auth"',
  'from "./utils/supabase/client"': 'from "@/shared/lib/api/supabase/client"',
  'from "../utils/supabase/client"': 'from "@/shared/lib/api/supabase/client"',
  'from "../../utils/supabase/client"': 'from "@/shared/lib/api/supabase/client"',

  // i18n
  'from "./utils/i18n"': 'from "@/shared/lib/i18n"',
  'from "../utils/i18n"': 'from "@/shared/lib/i18n"',
  'from "../../utils/i18n"': 'from "@/shared/lib/i18n"',

  // Screens - Mobile
  'from "./components/screens/AchievementHomeScreen"': 'from "@/features/mobile/home"',
  'from "./components/screens/HistoryScreen"': 'from "@/features/mobile/history"',
  'from "./components/screens/AchievementsScreen"': 'from "@/features/mobile/achievements"',
  'from "./components/screens/ReportsScreen"': 'from "@/features/mobile/reports"',
  'from "./components/screens/SettingsScreen"': 'from "@/features/mobile/settings"',

  // Screens - Admin
  'from "./components/screens/AdminDashboard"': 'from "@/features/admin/dashboard"',
  'from "./components/AdminLoginScreen"': 'from "@/features/admin/auth"',
};

function updateImportsInFile(filePath: string) {
  let content = readFileSync(filePath, 'utf-8');
  let updated = false;

  Object.entries(importMappings).forEach(([oldImport, newImport]) => {
    if (content.includes(oldImport)) {
      content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
      updated = true;
    }
  });

  if (updated) {
    writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  }
}

function walkDirectory(dir: string) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!filePath.includes('node_modules') && !filePath.includes('.git')) {
        walkDirectory(filePath);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      updateImportsInFile(filePath);
    }
  });
}

console.log('🔄 Updating imports...');
walkDirectory('./src');
console.log('✅ Done!');
```

#### Запустить скрипт

```bash
# Установить ts-node если нужно
npm install -D ts-node

# Запустить скрипт
npx ts-node scripts/update-imports.ts

# Проверить изменения
git diff src/
```

#### Ручная проверка

```bash
# Найти оставшиеся старые импорты
grep -r "from \"./components/screens" src/
grep -r "from \"./utils/" src/
grep -r "from \"../utils/" src/

# Исправить вручную если нужно
```

#### Тесты
```bash
# Проверить TypeScript ошибки
npx tsc --noEmit

# Проверить сборку
npm run build

# Запустить dev
npm run dev

# Проверить все экраны
```

**Критерии успеха**:
- ✅ Скрипт обновления создан
- ✅ Все импорты обновлены
- ✅ Нет TypeScript ошибок
- ✅ Проект собирается
- ✅ Все экраны работают

---

### Фаза 8: Оптимизация и финальное тестирование (2 дня)

#### День 1: Оптимизация

**1. Code Splitting**

```typescript
// src/App.tsx
import { lazy, Suspense } from 'react';

const MobileApp = lazy(() => import('./app/mobile/App').then(m => ({ default: m.MobileApp })));
const AdminApp = lazy(() => import('./app/admin/AdminApp').then(m => ({ default: m.AdminApp })));

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}

export function App() {
  // ... existing code

  return (
    <Suspense fallback={<LoadingScreen />}>
      {isAdminView ? <AdminApp /> : <MobileApp />}
    </Suspense>
  );
}
```

**2. Vite Bundle Optimization**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'motion/react'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
          ],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'admin': [
            './src/features/admin/dashboard',
            './src/features/admin/users',
            './src/features/admin/subscriptions',
            './src/features/admin/settings',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

**3. Lazy Loading Images**

```typescript
// src/shared/components/OptimizedImage.tsx
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function OptimizedImage({ src, alt, className }: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          loading="lazy"
          className={className}
        />
      )}
    </div>
  );
}
```

#### День 2: Финальное тестирование

**1. Unit тесты (Vitest)**

```typescript
// tests/unit/auth.test.ts
import { describe, it, expect } from 'vitest';
import { checkSession, signOut } from '@/shared/lib/auth';

describe('Auth', () => {
  it('should check session', async () => {
    const session = await checkSession();
    expect(session).toBeDefined();
  });
});
```

**2. E2E тесты (Playwright)**

```typescript
// tests/e2e/mobile-app.spec.ts
import { test, expect } from '@playwright/test';

test('mobile app navigation', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Проверить главный экран
  await expect(page.locator('text=Главная')).toBeVisible();

  // Переключить на историю
  await page.click('text=История');
  await expect(page.locator('text=История записей')).toBeVisible();

  // Переключить на достижения
  await page.click('text=Достижения');
  await expect(page.locator('text=Мои достижения')).toBeVisible();
});

test('admin panel access', async ({ page }) => {
  await page.goto('http://localhost:5173/?view=admin');

  // Проверить экран авторизации
  await expect(page.locator('text=Вход в админ-панель')).toBeVisible();
});
```

**3. Performance тесты**

```bash
# Lighthouse CI
npm install -D @lhci/cli

# lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173', 'http://localhost:5173/?view=admin'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
      },
    },
  },
};

# Запустить
npm run build
npx lhci autorun
```

**4. Bundle анализ**

```bash
# Установить анализатор
npm install -D rollup-plugin-visualizer

# Добавить в vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      filename: './dist/stats.html',
      open: true,
    }),
  ],
});

# Собрать и проанализировать
npm run build
```

#### Финальные тесты

```bash
# 1. TypeScript проверка
npx tsc --noEmit

# 2. Сборка
npm run build

# 3. Unit тесты
npm run test

# 4. E2E тесты
npm run test:e2e

# 5. Lighthouse
npm run lighthouse

# 6. Проверить размер бандла
ls -lh dist/assets/*.js

# 7. Запустить production build локально
npm run preview
```

**Критерии успеха**:
- ✅ Code splitting работает
- ✅ Bundle size уменьшен на 30%
- ✅ Lighthouse score > 90
- ✅ Все тесты проходят
- ✅ Нет TypeScript ошибок
- ✅ Нет console errors

---

## 💡 Профессиональные рекомендации (Senior Architect)

### 1. Архитектурные паттерны

#### Repository Pattern для работы с данными

```typescript
// src/shared/lib/api/repositories/BaseRepository.ts
export abstract class BaseRepository<T> {
  constructor(protected supabase: SupabaseClient) {}

  abstract getTableName(): string;

  async findAll(): Promise<T[]> {
    const { data, error } = await this.supabase
      .from(this.getTableName())
      .select('*');

    if (error) throw error;
    return data as T[];
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.supabase
      .from(this.getTableName())
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as T;
  }

  async create(item: Partial<T>): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.getTableName())
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async update(id: string, item: Partial<T>): Promise<T> {
    const { data, error } = await this.supabase
      .from(this.getTableName())
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as T;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.getTableName())
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

// src/shared/lib/api/repositories/EntryRepository.ts
import { BaseRepository } from './BaseRepository';
import type { Entry } from '@/shared/types';

export class EntryRepository extends BaseRepository<Entry> {
  getTableName() {
    return 'entries';
  }

  async findByUserId(userId: string): Promise<Entry[]> {
    const { data, error } = await this.supabase
      .from(this.getTableName())
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Entry[];
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Entry[]> {
    const { data, error } = await this.supabase
      .from(this.getTableName())
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;
    return data as Entry[];
  }
}
```

#### Dependency Injection Container

```typescript
// src/shared/lib/di/container.ts
import { createClient } from '@/shared/lib/api/supabase/client';
import { EntryRepository } from '@/shared/lib/api/repositories/EntryRepository';
import { AchievementRepository } from '@/shared/lib/api/repositories/AchievementRepository';

class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.registerServices();
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private registerServices() {
    const supabase = createClient();

    this.services.set('supabase', supabase);
    this.services.set('entryRepository', new EntryRepository(supabase));
    this.services.set('achievementRepository', new AchievementRepository(supabase));
  }

  get<T>(serviceName: string): T {
    return this.services.get(serviceName);
  }
}

export const container = DIContainer.getInstance();

// Использование
// const entryRepo = container.get<EntryRepository>('entryRepository');
```

#### Custom Hooks с DI

```typescript
// src/shared/hooks/useEntries.ts
import { useState, useEffect } from 'react';
import { container } from '@/shared/lib/di/container';
import type { EntryRepository } from '@/shared/lib/api/repositories/EntryRepository';
import type { Entry } from '@/shared/types';

export function useEntries(userId: string) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const entryRepo = container.get<EntryRepository>('entryRepository');

  useEffect(() => {
    loadEntries();
  }, [userId]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const data = await entryRepo.findByUserId(userId);
      setEntries(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const createEntry = async (entry: Partial<Entry>) => {
    const newEntry = await entryRepo.create({ ...entry, user_id: userId });
    setEntries(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const updateEntry = async (id: string, updates: Partial<Entry>) => {
    const updated = await entryRepo.update(id, updates);
    setEntries(prev => prev.map(e => e.id === id ? updated : e));
    return updated;
  };

  const deleteEntry = async (id: string) => {
    await entryRepo.delete(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  return {
    entries,
    isLoading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
    refresh: loadEntries,
  };
}
```

---

### 2. Производительность

#### React.memo для тяжелых компонентов

```typescript
// src/features/mobile/home/components/EntryCard.tsx
import { memo } from 'react';

interface EntryCardProps {
  entry: Entry;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const EntryCard = memo(function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3>{entry.title}</h3>
      <p>{entry.content}</p>
      <div className="flex gap-2 mt-2">
        <button onClick={() => onEdit(entry.id)}>Edit</button>
        <button onClick={() => onDelete(entry.id)}>Delete</button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.entry.id === nextProps.entry.id &&
         prevProps.entry.updated_at === nextProps.entry.updated_at;
});
```

#### Virtual Scrolling для длинных списков

```typescript
// src/features/mobile/history/components/VirtualizedEntryList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function VirtualizedEntryList({ entries }: { entries: Entry[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: entries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <EntryCard entry={entries[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Debounce для поиска

```typescript
// src/shared/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Использование
function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Выполнить поиск
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Поиск..."
    />
  );
}
```

---

### 3. Типизация и валидация

#### Генерация типов из Supabase

```bash
# Установить Supabase CLI
npm install -D supabase

# Сгенерировать типы
npx supabase gen types typescript --project-id xbduutslnrjvobdfdzfs > src/shared/types/database.ts
```

```typescript
// src/shared/types/database.ts (автогенерация)
export type Database = {
  public: {
    Tables: {
      entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      // ... другие таблицы
    };
  };
};

// Экспорт типов
export type Entry = Database['public']['Tables']['entries']['Row'];
export type EntryInsert = Database['public']['Tables']['entries']['Insert'];
export type EntryUpdate = Database['public']['Tables']['entries']['Update'];
```

#### Zod для runtime валидации

```typescript
// src/shared/lib/validation/schemas.ts
import { z } from 'zod';

export const entrySchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен').max(200, 'Максимум 200 символов'),
  content: z.string().min(1, 'Содержание обязательно').max(5000, 'Максимум 5000 символов'),
  mood: z.enum(['happy', 'sad', 'neutral', 'excited', 'anxious']).optional(),
  tags: z.array(z.string()).optional(),
});

export type EntryFormData = z.infer<typeof entrySchema>;

// Использование
function CreateEntryForm() {
  const handleSubmit = (data: unknown) => {
    try {
      const validated = entrySchema.parse(data);
      // Данные валидны
      createEntry(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Показать ошибки валидации
        console.error(error.errors);
      }
    }
  };
}
```

---

### 4. Тестирование

#### Vitest конфигурация

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

#### React Testing Library примеры

```typescript
// tests/unit/features/mobile/home/AchievementHomeScreen.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AchievementHomeScreen } from '@/features/mobile/home';

// Mock useEntries hook
vi.mock('@/shared/hooks/useEntries', () => ({
  useEntries: () => ({
    entries: [
      { id: '1', title: 'Test Entry', content: 'Test content' },
    ],
    isLoading: false,
    error: null,
  }),
}));

describe('AchievementHomeScreen', () => {
  it('renders entries', async () => {
    render(<AchievementHomeScreen userData={{ id: '123' }} />);

    await waitFor(() => {
      expect(screen.getByText('Test Entry')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    vi.mock('@/shared/hooks/useEntries', () => ({
      useEntries: () => ({
        entries: [],
        isLoading: true,
        error: null,
      }),
    }));

    render(<AchievementHomeScreen userData={{ id: '123' }} />);
    expect(screen.getByText(/загрузка/i)).toBeInTheDocument();
  });
});
```

---

### 5. Мониторинг и аналитика

#### Sentry для отслеживания ошибок

```typescript
// src/shared/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/react';

export function initSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}

// src/main.tsx
import { initSentry } from '@/shared/lib/monitoring/sentry';

initSentry();
```

#### Web Vitals tracking

```typescript
// src/shared/lib/monitoring/webVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  onCLS(console.log);
  onFID(console.log);
  onFCP(console.log);
  onLCP(console.log);
  onTTFB(console.log);
}

// src/main.tsx
import { reportWebVitals } from '@/shared/lib/monitoring/webVitals';

if (import.meta.env.PROD) {
  reportWebVitals();
}
```

---

### 6. Безопасность

#### Content Security Policy

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      ].join('; '),
    },
  },
});
```

#### Input Sanitization

```typescript
// src/shared/lib/security/sanitize.ts
import DOMPurify from 'dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .slice(0, 5000); // Limit length
}
```

---

## 🚀 Roadmap для React Native Expo (Будущее)

### Подготовка (уже сделано в текущей реструктуризации)

✅ **Platform-agnostic код в shared/lib/**
- API клиенты не зависят от веб-специфичных API
- Бизнес-логика выделена в отдельные модули
- TypeScript типы переиспользуются

✅ **Feature-based архитектура**
- Легко портировать фичи на React Native
- Четкие границы между модулями
- Минимум зависимостей между фичами

✅ **Repository Pattern**
- Абстракция над Supabase
- Легко адаптировать для React Native

### Фаза 1: Monorepo структура (1 неделя)

```bash
# Установить Turborepo
npx create-turbo@latest

# Структура
UNITY-v2/
├── apps/
│   ├── web/              # Текущее PWA (переместить src/)
│   ├── mobile/           # React Native Expo
│   └── admin/            # Опционально: отдельное админ приложение
├── packages/
│   ├── shared/           # Общая бизнес-логика
│   │   ├── api/
│   │   ├── auth/
│   │   ├── i18n/
│   │   └── types/
│   ├── ui-web/           # Web UI компоненты
│   └── ui-native/        # React Native UI компоненты
├── package.json
└── turbo.json
```

### Фаза 2: Создание Expo приложения (2 недели)

```bash
cd apps
npx create-expo-app mobile --template blank-typescript
cd mobile

# Установить зависимости
npx expo install expo-router react-native-reanimated
npx expo install @supabase/supabase-js react-native-url-polyfill
npx expo install nativewind
npx expo install expo-secure-store expo-file-system
```

#### Настроить NativeWind (Tailwind для RN)

```javascript
// apps/mobile/tailwind.config.js
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

#### Создать адаптеры для UI

```typescript
// packages/ui-native/Button/Button.tsx
import { Pressable, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledPressable = styled(Pressable);
const StyledText = styled(Text);

export function Button({ children, onPress, variant = 'default' }: ButtonProps) {
  return (
    <StyledPressable
      onPress={onPress}
      className={`px-4 py-2 rounded-lg ${
        variant === 'default' ? 'bg-blue-500' : 'bg-gray-200'
      }`}
    >
      <StyledText className="text-white font-semibold">
        {children}
      </StyledText>
    </StyledPressable>
  );
}
```

### Фаза 3: Портирование фич (4 недели)

#### Неделя 1: Auth фича

```typescript
// apps/mobile/app/(auth)/welcome.tsx
import { WelcomeScreen } from '@unity/ui-native/auth';
import { useAuth } from '@unity/shared/hooks';

export default function Welcome() {
  const { signIn } = useAuth();

  return <WelcomeScreen onSignIn={signIn} />;
}
```

#### Неделя 2: Home фича

```typescript
// apps/mobile/app/(tabs)/index.tsx
import { AchievementHomeScreen } from '@unity/ui-native/home';
import { useEntries } from '@unity/shared/hooks';

export default function Home() {
  const { entries, createEntry } = useEntries();

  return (
    <AchievementHomeScreen
      entries={entries}
      onCreateEntry={createEntry}
    />
  );
}
```

#### Неделя 3-4: Остальные фичи

- History
- Achievements
- Reports
- Settings
- Media (Camera, Voice Recording)

### Фаза 4: Нативные фичи (2 недели)

```typescript
// Камера
import { Camera } from 'expo-camera';

// Push уведомления
import * as Notifications from 'expo-notifications';

// Биометрия
import * as LocalAuthentication from 'expo-local-authentication';

// Хранилище
import * as SecureStore from 'expo-secure-store';
```

### Фаза 5: Тестирование и публикация (2 недели)

```bash
# Сборка для iOS
eas build --platform ios

# Сборка для Android
eas build --platform android

# Публикация в App Store
eas submit --platform ios

# Публикация в Google Play
eas submit --platform android
```

---

## ✅ Финальные чеклисты

### Чеклист реструктуризации

#### Фаза 0: Подготовка
- [ ] Создана ветка `feature/restructure`
- [ ] Установлены dev зависимости (Vitest, Playwright)
- [ ] Зафиксированы baseline метрики
- [ ] Проект собирается без ошибок

#### Фаза 1: Очистка
- [ ] Удалена папка `admin/old/`
- [ ] Проверены зависимости
- [ ] Проект собирается
- [ ] Админ панель работает

#### Фаза 2: Структура
- [ ] Созданы все папки
- [ ] Настроены path aliases
- [ ] Созданы index.ts файлы

#### Фаза 3: Shared компоненты
- [ ] UI компоненты перемещены
- [ ] PWA компоненты перемещены
- [ ] Layout компоненты перемещены
- [ ] Утилиты перемещены
- [ ] Хуки перемещены
- [ ] Проект собирается

#### Фаза 4: Мобильные фичи
- [ ] Auth фича перемещена
- [ ] Home фича перемещена
- [ ] History фича перемещена
- [ ] Achievements фича перемещена
- [ ] Reports фича перемещена
- [ ] Settings фича перемещена
- [ ] Media фича перемещена
- [ ] Все экраны работают

#### Фаза 5: Админ фичи
- [ ] Dashboard перемещен
- [ ] Users перемещен
- [ ] Subscriptions перемещен
- [ ] Settings перемещен
- [ ] Auth перемещен
- [ ] Админ панель работает

#### Фаза 6: Разделение App.tsx
- [ ] MobileApp создан
- [ ] AdminApp создан
- [ ] App.tsx обновлен
- [ ] Роутинг ?view=admin работает
- [ ] Оба режима работают

#### Фаза 7: Импорты
- [ ] Скрипт обновления создан
- [ ] Скрипт запущен
- [ ] Ручная проверка выполнена
- [ ] Нет TypeScript ошибок
- [ ] Проект собирается

#### Фаза 8: Оптимизация
- [ ] Code splitting настроен
- [ ] Lazy loading реализован
- [ ] Bundle оптимизирован
- [ ] Unit тесты написаны
- [ ] E2E тесты написаны
- [ ] Lighthouse score > 90
- [ ] Bundle size уменьшен на 30%

### Чеклист тестирования

#### Мобильное приложение
- [ ] Welcome screen работает
- [ ] Onboarding работает
- [ ] Авторизация работает
- [ ] Главный экран загружается
- [ ] История записей работает
- [ ] Достижения отображаются
- [ ] Отчеты генерируются
- [ ] Настройки сохраняются
- [ ] Медиа загружается
- [ ] Голосовые заметки работают
- [ ] PWA устанавливается
- [ ] Офлайн режим работает

#### Админ панель
- [ ] Авторизация работает
- [ ] Dashboard загружается
- [ ] Статистика отображается
- [ ] Управление пользователями работает
- [ ] Управление подписками работает
- [ ] Все табы настроек работают
- [ ] API настройки работают
- [ ] Языки управляются
- [ ] PWA настройки работают
- [ ] Push уведомления настраиваются
- [ ] Telegram настройки работают
- [ ] Выход из системы работает

#### Производительность
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Bundle size < 500 kB (gzipped)
- [ ] No console errors
- [ ] No TypeScript errors

### Чеклист деплоя

- [ ] Все тесты проходят
- [ ] Build успешен
- [ ] Preview deployment проверен
- [ ] Environment variables настроены
- [ ] Supabase RLS политики проверены
- [ ] Edge Functions работают
- [ ] Service Worker обновлен
- [ ] Manifest.json актуален
- [ ] Netlify redirects настроены
- [ ] Production deployment выполнен
- [ ] Smoke tests на production пройдены

---

## 📊 Метрики успеха

### До реструктуризации
- ❌ Bundle size: 2,041 kB (494 kB gzipped)
- ❌ Lighthouse Performance: ~75
- ❌ First Contentful Paint: ~2.5s
- ❌ Time to Interactive: ~4.5s
- ❌ Дубликаты кода: ~15%
- ❌ Структура: Смешанная

### После реструктуризации (цели)
- ✅ Bundle size: < 1,400 kB (< 350 kB gzipped) - **-30%**
- ✅ Lighthouse Performance: > 90 - **+20%**
- ✅ First Contentful Paint: < 1.5s - **-40%**
- ✅ Time to Interactive: < 3s - **-33%**
- ✅ Дубликаты кода: 0% - **-100%**
- ✅ Структура: Feature-based, monorepo-ready

### Качество кода
- ✅ TypeScript strict mode: enabled
- ✅ Test coverage: > 80%
- ✅ ESLint errors: 0
- ✅ Console errors: 0
- ✅ Accessibility issues: 0

---

## 🎯 Заключение

### Что мы получим после реструктуризации

1. **Чистая архитектура**
   - Четкое разделение mobile/admin
   - Feature-based структура
   - Platform-agnostic код

2. **Лучшая производительность**
   - Code splitting
   - Lazy loading
   - Оптимизированный bundle

3. **Готовность к масштабированию**
   - Monorepo-ready структура
   - Подготовка к React Native Expo
   - Легко добавлять новые фичи

4. **Высокое качество**
   - Покрытие тестами
   - TypeScript strict mode
   - Нет дублей кода

5. **Профессиональный подход**
   - Repository Pattern
   - Dependency Injection
   - SOLID принципы
   - Мониторинг и аналитика

### Следующие шаги

1. **Немедленно**: Начать Фазу 0 (Подготовка)
2. **Эта неделя**: Завершить Фазы 1-3 (Очистка, Структура, Shared)
3. **Следующая неделя**: Завершить Фазы 4-6 (Фичи, App.tsx)
4. **Через 2 недели**: Завершить Фазы 7-8 (Импорты, Оптимизация)
5. **Через 3 недели**: Деплой на production

### Поддержка

Если возникнут вопросы или проблемы:
1. Проверить документацию в `docs/`
2. Проверить архив в `old/CLEANUP_REPORT.md`
3. Откатиться на предыдущий коммит если что-то сломалось
4. Запустить тесты для диагностики

---

**Готовы начать? Создайте ветку и начните с Фазы 0!** 🚀

```bash
git checkout -b feature/restructure
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom playwright @playwright/test
npx playwright install
npm run build
```


