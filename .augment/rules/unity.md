---
type: "always_apply"
---

# UNITY-v2 - Правила разработки

**Версия**: 1.0
**Дата**: 2025-10-24
**Применение**: Автоматически во всех разговорах Augment Chat и Agent

---

## 🏗️ Архитектура

### Платформа и технологии
- **PWA приложение** (НЕ Telegram Mini App), фокус на мобильном опыте
- **React Native Expo**: platform-agnostic архитектура, миграция планируется Q3 2025
- **Feature-Sliced Design**: `app/mobile` (PWA max-w-md) + `app/admin` (full-width ?view=admin)
- **Стек**: React 18.3.1 + TypeScript + Vite 6.3.5 + Supabase + Tailwind CSS + shadcn/ui
- **Deployment**: ТОЛЬКО Vercel (https://unity-wine.vercel.app), автоматический деплой через Git Integration

### Edge Functions
- **Standalone pattern**: embedded utilities, НЕ shared imports
- **Лимит**: максимум 300 строк на функцию
- **Деплой**: ТОЛЬКО через Supabase MCP команду `deploy_edge_function_supabase`
- **Тестирование**: Chrome MCP + console logs
- **ЗАПРЕТ**: НИКОГДА не использовать Docker для деплоя

### RBAC (Role-Based Access Control)
- **super_admin**: доступ ТОЛЬКО к `/?view=admin`, управление системой
- **user**: доступ ТОЛЬКО к PWA кабинету
- **3 точки контроля**: AuthScreenNew.tsx, AdminLoginScreen.tsx, App.tsx
- **Автоматический редирект**: при попытке доступа к неправильному интерфейсу

### Platform Adapters (React Native готовность)
- **ПРИНЦИП**: Для ЛЮБЫХ новых фич с platform-specific реализацией (анимации, storage, media, navigation, UI) ОБЯЗАТЕЛЬНО создавать Platform Adapter с web и native реализациями
- **Структура**: `src/shared/lib/platform/{feature}/` с `{feature}.web.ts` и `{feature}.native.ts`
- **Примеры**: animation, storage, media, navigation
- **ПРАВИЛО**: Все новые компоненты ДОЛЖНЫ использовать Universal Components из `@/shared/components/ui/universal`
- **ЗАПРЕТ**: НЕ использовать Radix UI напрямую в новых компонентах
- **ЦЕЛЬ**: Предотвращение технического долга при миграции на React Native Expo (Q3 2025)

### i18n система
- **Динамическая CRUD**: управление через админ-панель
- **Хранение**: Supabase таблицы `languages` + `translations`
- **Языки**: 7 активных (ru/en/es/de/fr/zh/ja), возможность добавления неограниченного количества
- **Автоперевод**: через AI GPT-4o-mini

### AI-Friendly Code принципы
- **Модульность**: файлы < 300 строк (CSS < 200, компоненты < 250)
- **Читаемость**: явные имена, избегать сокращений, комментарии для сложной логики
- **Context7 MCP**: использовать для документации библиотек (React, Supabase, shadcn/ui)
- **Цвета**: НИКОГДА хардкод (`bg-white`, `bg-gray-*`), ВСЕГДА CSS переменные (`bg-card`, `text-foreground`)
- **Transitions**: ВСЕГДА добавлять `transition-colors duration-300` для темной темы
- **Время AI-анализа**: оптимизация для быстрого анализа (3-5 сек вместо 30-60 сек)

### Mobile UI Best Practices
- **iOS Design System**: 100% соответствие iOS Human Interface Guidelines
- **Touch Targets**: минимум 44x44px для всех интерактивных элементов
- **Responsive Typography**: адаптивные размеры текста для iPhone SE (320px) до iPhone Pro Max (430px)
- **Breakpoints**: 320px (base) → 375px (sm) → 390px (md) → 430px (lg)
- **PWA max-width**: `max-w-md` (448px) для мобильного интерфейса
- **Accessibility**: поддержка reduced motion, high contrast, достаточный контраст текста
- **Spacing**: responsive padding через CSS переменные (`--spacing-modal-padding`, `--spacing-section-padding-x`)
- **Animations**: Universal Animation Adapter (Framer Motion для PWA, Reanimated для RN)

### Vite Code Splitting (предотвращение circular dependencies)
- **ЗАПРЕТ**: НЕ использовать ручную группировку app code в `manualChunks`
  - НЕ группировать `src/app/`, `src/features/`, `src/shared/` в отдельные chunks
  - Позволить Vite автоматически управлять code splitting для app code
- **РАЗРЕШЕНО**: Группировка ТОЛЬКО vendor chunks (node_modules)
  - `vendor-react`, `vendor-supabase`, `vendor-motion`, `vendor-radix`, etc.
- **ЗАПРЕТ**: Barrel exports (index.ts файлы) - создают circular dependencies
  - Импортировать напрямую из конкретных файлов
- **ОБЯЗАТЕЛЬНО**: Проверять build warnings о circular dependencies
  - НЕ игнорировать предупреждения Vite/Rollup
- **ОБЯЗАТЕЛЬНО**: Тестировать production build локально
  - `npm run build` → `npm run preview` → проверка консоли браузера
- **Root Cause**: Circular dependency возникает когда chunk A импортирует из chunk B, а chunk B импортирует из chunk A
  - Пример: `admin-features` → `shared-ui` → `admin-features` (цикл)
  - Rollup не может определить порядок инициализации → ReferenceError

---

## ⚠️ Критические правила

### Обязательные проверки
1. **Supabase Advisors**: ОБЯЗАТЕЛЬНО перед КАЖДЫМ изменением кода/БД
   ```typescript
   get_advisors_supabase({
     project_id: "ecuwuzqlwdkkdncampnc",
     type: "security"
   })
   get_advisors_supabase({
     project_id: "ecuwuzqlwdkkdncampnc",
     type: "performance"
   })
   ```
   - НИКОГДА не продолжать при ошибках Advisors
   - ВСЕГДА исправлять проблемы НЕМЕДЛЕННО перед новым кодом

2. **Консоль браузера**: ВСЕГДА проверять через Chrome MCP перед коммитом
   - Если есть ошибки → НЕМЕДЛЕННО исправлять
   - НИКОГДА не коммитить код с ошибками в консоли

3. **Completeness rule**: ВСЕГДА выполнять ВСЕ физические действия НЕМЕДЛЕННО
   - Перемещение файлов
   - Создание папок
   - Обновление содержимого
   - НЕ только обновлять содержимое файлов

### Documentation ratio
- **Правило 1:1**: docs count ≤ source files count
- **Автоматизация**: GitHub Action `docs-ratio-check.yml` + `scripts/check-docs-ratio.sh`
- **Цель**: Предотвращение раздувания документации

### Масштабирование
- **Цель**: 100,000 пользователей за 1 год
- **ВСЕГДА**: оптимизировать код/БД с учетом цели
- **ВСЕГДА**: добавлять индексы для частых запросов
- **ВСЕГДА**: проверять N+1 проблемы
- **ВСЕГДА**: учитывать производительность при новых функциях

---

## 📚 Документация

### Single Source of Truth
- **BACKLOG.md**: единый источник истины всех задач
- **ROADMAP.md**: стратегия 6-12 месяцев
- **SPRINT.md**: тактика 1-2 недели
- **RECOMMENDATIONS.md**: AI-рекомендации, обновляется еженедельно через `codebase-retrieval`

### Naming conventions
- `changelog/archive/`: `YYYY-MM-DD_snake_case.md`
- `plan/tasks/`: `kebab-case.md`
- `architecture/`: `UPPER_SNAKE_CASE.md`
- `guides/`: `НАЗВАНИЕ_GUIDE.md`

### Workflow задач
1. Создание → `planned/`
2. Старт → `active/`
3. Завершение → `archive/`

### Changelog правила

**Два файла**:
- **CHANGELOG.md**: пользовательские изменения (что видит пользователь)
- **FIX.md**: технические изменения (что видит разработчик)

**CHANGELOG.md категории**:
- ✨ Новые возможности (features)
- 🐛 Исправления (bug fixes)
- 🔒 Безопасность (security)
- ⚡ Производительность (performance)
- 🗄️ База данных (database changes)
- 📚 Документация (user-facing docs)

**FIX.md категории**:
- 🗑️ Удалено (removed code/files)
- 🔄 Изменено (refactoring)
- 📚 Документация (dev docs)
- ✅ Тестирование (tests)
- 🏗️ Инфраструктура (build/deploy)

**Формат записи**:
```markdown
## [Unreleased] - YYYY-MM-DD

### ✨ Новые возможности
- **Компонент**: Краткое описание (детали)
  - Подробность 1
  - Подробность 2
```

**Архивация**:
- Детальные отчеты → `docs/changelog/archive/YYYY-MM-DD_название.md`
- Когда: после завершения спринта/фичи
- Naming: `2025-10-21_vercel_deployment.md`

**Запреты**:
- ❌ НЕ смешивать пользовательские и технические изменения
- ❌ НЕ дублировать информацию между CHANGELOG и FIX
- ❌ НЕ создавать записи без категории
- ❌ НЕ использовать общие фразы ("улучшения", "исправления")

---

## 🔀 Гибридный подход PWA + React Native

### Архитектура разделения

UNITY-v2 использует **уникальную гибридную архитектуру** с двумя параллельными build системами:

```
UNITY-v2
├── PWA Build (Vite)           → Vercel deployment
│   ├── Entry: src/main.tsx
│   ├── Build: npm run build
│   ├── Output: build/
│   └── React: 18.3.1 + react-native-web
│
└── React Native Build (Metro) → Expo Go / EAS Build
    ├── Entry: index.js
    ├── Build: npx expo start
    ├── Output: .expo/
    └── React: 19.1.0 (planned)
```

### Критическое разделение директорий

**ВАЖНО**: `/app/` и `src/app/` - это РАЗНЫЕ директории!

```
/app/                  # React Native Expo Router (ИСКЛЮЧЕН из Vercel)
├── _layout.tsx        # Expo Router layout
├── index.tsx          # Expo Router entry point
└── (tabs)/            # Expo Router tabs

src/app/               # PWA компоненты (ВКЛЮЧЕН в Vercel)
├── mobile/            # PWA мобильные компоненты
│   ├── MobileApp.tsx
│   └── index.ts
└── admin/             # PWA админ компоненты
    ├── AdminApp.tsx
    └── index.ts
```

### Правила разработки фич

#### 1. **ОБЯЗАТЕЛЬНО создавать реализацию для ОБОИХ платформ**

При разработке ЛЮБОЙ новой фичи или улучшении дизайна:

- ✅ **ВСЕГДА** создавать `.web.ts` И `.native.ts` версии для platform-specific кода
- ✅ **ВСЕГДА** тестировать на обеих платформах ПЕРЕД коммитом
- ❌ **ЗАПРЕТ** на создание фич только для одной платформы без адаптации для другой

**Пример**:
```typescript
// ✅ ПРАВИЛЬНО: Platform Adapter
src/shared/lib/platform/storage/
├── index.ts           # Экспорт для PWA
├── storage.web.ts     # Web реализация (localStorage)
├── storage.native.ts  # Native реализация (AsyncStorage)
└── types.ts           # Shared types

// ❌ НЕПРАВИЛЬНО: Только web версия
src/shared/lib/storage.ts  // Только localStorage, нет native версии
```

#### 2. **Platform Adapters обязательность**

Для ЛЮБЫХ новых фич с platform-specific реализацией ОБЯЗАТЕЛЬНО создавать Platform Adapter:

**Категории требующие Platform Adapters**:
- **Анимации**: Framer Motion (web) vs Reanimated (native)
- **Storage**: localStorage (web) vs AsyncStorage (native)
- **Media**: FileReader (web) vs expo-file-system (native)
- **Navigation**: window.history (web) vs @react-navigation (native)
- **UI компоненты**: Radix UI (web) vs React Native components (native)
- **Offline**: Service Worker (web) vs NetInfo (native)
- **Push notifications**: Web Push API (web) vs Expo Notifications (native)

**Структура Platform Adapter**:
```typescript
src/shared/lib/platform/{feature}/
├── index.ts              # Экспорт (автоматически выбирает .web или .native)
├── {feature}.web.ts      # Web реализация
├── {feature}.native.ts   # Native реализация (в /app/shared/ для RN build)
└── types.ts              # Shared TypeScript types
```

**Цель**: Предотвращение технического долга при React Native миграции (Q3 2025)

#### 3. **Universal Components обязательность**

**ПРАВИЛО**: Все новые UI компоненты ДОЛЖНЫ использовать Universal Components из `@/shared/components/ui/universal`

**ЗАПРЕТ**: НЕ использовать Radix UI напрямую в новых компонентах

**Примеры Universal Components**:
- `UniversalToast` - Toast notifications (Radix → RN Toast)
- `UniversalDialog` - Модальные окна (Radix Dialog → RN Modal)
- `UniversalSelect` - Выпадающие списки (Radix Select → RN Picker)
- `UniversalSwitch` - Переключатели (Radix Switch → RN Switch)
- `UniversalCheckbox` - Чекбоксы (Radix Checkbox → RN Checkbox)
- `UniversalRadioGroup` - Радио кнопки (Radix RadioGroup → RN RadioButton)

### Конфигурационные файлы

#### 1. `.gitignore` - КРИТИЧЕСКИ ВАЖНО

```gitignore
# Android (Expo generated, not committed)
# ВАЖНО: Используем /android/ с ведущим слэшем чтобы исключить только корневую директорию,
# НЕ затрагивая src/shared/components/ui/shadcn-io/android/
/android/

# iOS (Expo generated, not committed)
ios/
```

**Критическое правило**: ВСЕГДА используйте `/` в начале для исключения только корневых директорий

**Примеры**:
- ✅ `/android/` - исключает только `/android/`, НЕ затрагивает `src/.../android/`
- ❌ `android/` - исключает ВСЕ директории с именем `android` (ОШИБКА!)

**Почему это важно**:
- У нас есть UI компонент `src/shared/components/ui/shadcn-io/android/index.tsx`
- Если использовать `android/` → файл НЕ попадет в git → Vercel build упадет ❌
- С `/android/` → только корневая директория исключена → UI компонент в git ✅

#### 2. `.vercelignore` - Исключение React Native из PWA build

```
# React Native / Expo (не нужны для web build)
# ВАЖНО: /app/ с ведущим слэшем исключает только корневую директорию app/,
# НЕ затрагивая src/app/ (PWA компоненты)
/app/
/index.js
/.expo/
/metro.config.js
/babel.config.js
/eas.json
/app.json
```

**Критическое правило**: `/app/` (с слэшем) vs `src/app/` (без слэша)

**Примеры**:
- ✅ `/app/` - исключает только `/app/` (React Native), НЕ затрагивает `src/app/` (PWA)
- ❌ `app/` - исключает ВСЕ директории с именем `app`, включая `src/app/` (ОШИБКА!)

#### 3. `eas.json` - EAS Build конфигурация

**Создание**: `eas build:configure`

**Рекомендуемая конфигурация**:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "development-device": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

**Профили**:
- `development`: iOS Simulator build (для Mac)
- `development-device`: Android APK для физических устройств
- `preview`: Internal testing (QA)
- `production`: App Store/Google Play

### Build и Deployment

#### PWA Build (Vite)

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Deployment
git push origin main  # Автоматический деплой на Vercel
```

**Output**: `build/` директория → Vercel

#### React Native Build (Metro)

```bash
# Development server (Expo Go)
npm run start:expo
# или
npx expo start

# Development Build (EAS)
eas build --platform android --profile development-device
eas build --platform ios --profile development

# Production Build (EAS)
eas build --platform android --profile production
eas build --platform ios --profile production
```

**Output**: `.expo/` cache → Expo Go / EAS Build

### Критические ошибки которых избегать

#### 1. ❌ НЕ использовать `android/` без ведущего слэша в `.gitignore`

**Проблема**: Исключит ВСЕ директории с именем `android`, включая UI компоненты

**Последствия**:
- Файл `src/shared/components/ui/shadcn-io/android/index.tsx` НЕ попадет в git
- Local build успешен (файл существует локально)
- Vercel build упадет с `ENOENT: no such file or directory`

**Решение**: Использовать `/android/` (с ведущим слэшем)

#### 2. ❌ НЕ использовать `app/` без ведущего слэша в `.vercelignore`

**Проблема**: Исключит `src/app/` PWA компоненты из Vercel build

**Последствия**:
- PWA компоненты (`src/app/mobile/`, `src/app/admin/`) НЕ попадут в build
- Vercel build упадет с `Cannot find module`

**Решение**: Использовать `/app/` (с ведущим слэшем)

#### 3. ❌ НЕ создавать фичи только для PWA без React Native адаптации

**Проблема**: Технический долг при React Native миграции

**Последствия**:
- Миграция займет 7-10 дней вместо 3-5 дней
- Нужно будет переписывать код
- Потеря времени и ресурсов

**Решение**: ВСЕГДА создавать Platform Adapters для platform-specific кода

#### 4. ❌ НЕ использовать Radix UI напрямую в новых компонентах

**Проблема**: Radix UI работает только в web, не совместим с React Native

**Последствия**:
- Компонент НЕ будет работать в React Native
- Нужно будет переписывать на Universal Components

**Решение**: Использовать Universal Components из `@/shared/components/ui/universal`

### Тестирование на обеих платформах

#### PWA Testing

```bash
# 1. Запустить dev server
npm run dev

# 2. Открыть в браузере
# http://localhost:5173

# 3. Проверить консоль браузера (Chrome MCP)
# - 0 errors
# - 0 warnings

# 4. Проверить production build
npm run build
npm run preview
```

#### React Native Testing

**Способ 1: Expo Go (быстрый старт)**

```bash
# 1. Установить Expo Go на телефон
# iOS: App Store
# Android: Google Play

# 2. Запустить dev server
npm run start:expo

# 3. Сканировать QR код в Expo Go app
```

**Ограничения Expo Go**:
- ❌ НЕ поддерживает custom native modules
- ❌ НЕ подходит для UNITY-v2 (используем expo-dev-client)

**Способ 2: Development Build (рекомендуется)**

```bash
# 1. Установить EAS CLI
npm install -g eas-cli

# 2. Войти в Expo
eas login

# 3. Создать Development Build
eas build --platform android --profile development-device

# 4. Установить APK на телефон

# 5. Запустить dev server
npm run start:expo --dev-client

# 6. Сканировать QR код в Development Build app
```

### Expo Account

- **Email**: www.klaster.digital@gmail.com
- **Account**: https://expo.dev/accounts/klastergital
- **Password**: Qqq111www222!

---

## 🔑 Доступы (Критическая информация)

### Supabase
- **Project ID**: ecuwuzqlwdkkdncampnc
- **Access Token**: sbp_f074a7f31380ee22d963995ee889291985c7ba57
- **URL**: https://ecuwuzqlwdkkdncampnc.supabase.co

### Тестовые аккаунты
1. **Super Admin**: diary@leadshunter.biz admin123 (role: super_admin) 
2. **Rustam**: rustam@leadshunter.biz demo123 (role: user) - реальный пользователь
3. **Anna**: an@leadshunter.biz (role: user) - демо с предзаполненными данными

### Production
- **URL**: https://unity-wine.vercel.app
- **Deployment**: Vercel + GitHub Actions auto при push main

---

## 📝 Примечания

- Эти правила применяются автоматически во всех разговорах
- При конфликте правил - спросить пользователя
- При неясности - спросить пользователя
- Всегда приоритет: безопасность > скорость
