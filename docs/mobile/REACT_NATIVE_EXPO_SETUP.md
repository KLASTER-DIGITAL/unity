# 📱 React Native Expo Setup для UNITY-v2

**Дата**: 2025-10-30  
**Версия**: 1.0  
**Статус**: ✅ Готово к настройке

---

## 📋 Содержание

1. [Почему исключаем `/android/` в `.gitignore`?](#1-почему-исключаем-android-в-gitignore)
2. [Архитектура PWA vs React Native](#2-архитектура-pwa-vs-react-native)
3. [Настройка Expo для тестирования](#3-настройка-expo-для-тестирования)

---

## 1. Почему исключаем `/android/` в `.gitignore`?

### ✅ Причина исключения `/android/` из git

**Короткий ответ**: `/android/` и `ios/` директории **генерируются автоматически** Expo и **НЕ должны коммититься** в git.

### 📋 Детальное объяснение

#### Expo Managed Workflow vs Bare Workflow

UNITY-v2 использует **Expo Managed Workflow** (не Bare Workflow):

- **Managed Workflow**: Expo управляет нативным кодом автоматически
  - ✅ НЕ нужно коммитить `/android/` и `ios/`
  - ✅ Генерируются автоматически через `npx expo prebuild`
  - ✅ Конфигурация через `app.json`/`app.config.js`
  
- **Bare Workflow**: Вы управляете нативным кодом вручную
  - ❌ Нужно коммитить `/android/` и `ios/`
  - ❌ Ручная настройка Xcode/Android Studio
  - ❌ Не используется в UNITY-v2

#### Что генерирует Expo?

Когда вы запускаете `npx expo prebuild` или `npx expo run:android/ios`, Expo автоматически создает:

```bash
/android/          # Android Studio проект
  ├── app/
  ├── gradle/
  ├── build.gradle
  └── settings.gradle

/ios/              # Xcode проект
  ├── unity.xcodeproj
  ├── unity.xcworkspace
  ├── Podfile
  └── Pods/
```

Эти директории генерируются на основе:
- `app.json` / `app.config.js` (конфигурация)
- `plugins` в app.json (expo-router, expo-font, expo-sqlite)
- Установленных Expo пакетов

#### Почему используется `/android/` с ведущим слэшем?

**Критическая разница**:
- `android/` (БЕЗ слэша) → исключает **ВСЕ** директории с именем `android` в проекте
- `/android/` (С слэшем) → исключает **ТОЛЬКО** корневую директорию `/android/`

**Почему это важно?**:
- У нас есть UI компонент `src/shared/components/ui/shadcn-io/android/index.tsx`
- Если использовать `android/` → файл НЕ попадет в git → Vercel build упадет ❌
- С `/android/` → только корневая директория исключена → UI компонент в git ✅

### 📁 Какие файлы/директории React Native/Expo должны быть в git?

#### ✅ **ДОЛЖНЫ быть в git** (Managed Workflow):

```bash
✅ app.json                    # Expo конфигурация
✅ app.config.js               # Динамическая Expo конфигурация
✅ metro.config.js             # Metro bundler конфигурация
✅ babel.config.js             # Babel конфигурация
✅ index.js                    # React Native entry point
✅ /app/                       # Expo Router файлы (НЕ нативный код!)
✅ package.json                # Зависимости
✅ .npmrc                      # npm конфигурация
```

#### ❌ **НЕ должны быть в git** (генерируются автоматически):

```bash
❌ /android/                   # Expo-generated Android native code
❌ ios/                        # Expo-generated iOS native code
❌ .expo/                      # Expo cache
❌ __generated__/              # Auto-generated files
❌ node_modules/               # npm packages
```

#### ⚠️ **Опционально** (для EAS Build):

```bash
⚠️ eas.json                    # EAS Build конфигурация (создается через `eas build:configure`)
```

**Текущий статус**: `eas.json` **НЕ создан** в UNITY-v2 (см. раздел 3)

---

## 2. Архитектура PWA vs React Native

### 🏗️ Гибридная архитектура: PWA + React Native Expo

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

### 📂 Структура директорий

#### 1. **PWA компоненты** (`src/` директория)

**Entry point**: `src/main.tsx`

```typescript
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// ✅ PWA: Регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
  });
}
```

**Используется для**:
- ✅ PWA build через Vite
- ✅ Vercel deployment
- ✅ Web-only код (Service Worker, localStorage, DOM API)

#### 2. **React Native компоненты** (`/app/` директория)

**Entry point**: `index.js`

```javascript
/**
 * Entry point for React Native Expo
 * 
 * This file is the entry point for the React Native version of UNITY-v2.
 * It uses Expo Router for file-based routing.
 * 
 * For PWA version, use src/main.tsx instead.
 */

import 'expo-router/entry';
```

**Используется для**:
- ✅ React Native build через Metro
- ✅ Expo Go testing
- ✅ EAS Build deployment
- ✅ Native-only код (AsyncStorage, expo-file-system, React Navigation)

#### 3. **Shared код** (Platform Adapters)

Platform Adapters обеспечивают **platform-agnostic** API:

```typescript
// src/shared/lib/platform/storage/index.ts
import { WebStorageAdapter } from './storage.web';
export const storage: StorageAdapter = new WebStorageAdapter();

// /app/shared/lib/platform/storage.native.ts (для React Native)
import AsyncStorage from '@react-native-async-storage/async-storage';
export const storage: StorageAdapter = new NativeStorageAdapter();
```

**Примеры Platform Adapters**:
- `animation/` - Framer Motion (web) vs Reanimated (native)
- `storage/` - localStorage (web) vs AsyncStorage (native)
- `media/` - FileReader (web) vs expo-file-system (native)
- `navigation/` - window.history (web) vs @react-navigation (native)

### 🔧 Build системы

#### **PWA Build (Vite)**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'build',
    rollupOptions: {
      external: [
        /^react-native/,
        /^expo-/,
        /^@react-navigation/,
      ]
    }
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    }
  }
})
```

**Особенности**:
- ✅ Externalize React Native модули (tree-shaking)
- ✅ Alias `react-native` → `react-native-web`
- ✅ React 18.3.1 принудительно через npm overrides
- ✅ Output: `build/` директория

#### **React Native Build (Metro)**

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
```

**Особенности**:
- ✅ Platform-specific extensions (`.web.tsx`, `.native.tsx`)
- ✅ TypeScript path aliases через babel-plugin-module-resolver
- ✅ React Native Reanimated plugin
- ✅ Output: `.expo/` cache директория

### 🚫 Почему в `.vercelignore` исключается `/app/` директория?

**Причины**:

1. **Vercel деплоит ТОЛЬКО PWA** (Vite build)
   - Entry point: `src/main.tsx`
   - Build command: `npm run build`
   - Output: `build/` директория

2. **`/app/` содержит React Native код**
   - Entry point: `index.js` (Expo Router)
   - НЕ используется в PWA build
   - Может вызвать конфликты с Vite

3. **Разделение ответственности**
   - PWA deployment → Vercel
   - React Native deployment → EAS Build (Expo)

4. **Критическая разница**: `/app/` vs `src/app/`
   - `/app/` (с слэшем) → React Native Expo Router файлы ❌ (исключено из Vercel)
   - `src/app/` (без слэша) → PWA компоненты ✅ (включено в Vercel)

### 📊 Сравнительная таблица

| Аспект | PWA Build (Vite) | React Native Build (Metro) |
|--------|------------------|----------------------------|
| **Entry Point** | `src/main.tsx` | `index.js` |
| **Build Command** | `npm run build` | `npx expo start` |
| **Output** | `build/` | `.expo/` |
| **React Version** | 18.3.1 + react-native-web | 19.1.0 (planned) |
| **Deployment** | Vercel | EAS Build / Expo Go |
| **Platform Adapters** | `.web.ts` | `.native.ts` |
| **Routing** | React Router (src/App.tsx) | Expo Router (/app/) |
| **Storage** | localStorage | AsyncStorage |
| **Animation** | Framer Motion | Reanimated |
| **Navigation** | window.history | @react-navigation |

---

## 3. Настройка Expo для тестирования

### 🎯 Два способа тестирования на телефоне

#### **Способ 1: Expo Go (Быстрый старт, БЕЗ EAS Build)** ⚡

**Что это?**:
- Expo Go - это **готовое приложение** в App Store/Google Play
- Содержит **предустановленные** Expo SDK модули
- **НЕ требует** EAS Build
- **Ограничения**: НЕ поддерживает custom native modules

**Когда использовать?**:
- ✅ Быстрое тестирование UI/UX
- ✅ Разработка без custom native code
- ✅ Проверка базовой функциональности
- ❌ НЕ подходит если используете custom native modules

**Пошаговая инструкция**:

1. **Установить Expo Go на телефон**
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. **Запустить Expo dev server**
   ```bash
   npm run start:expo
   # или
   npx expo start
   ```

3. **Сканировать QR код**
   - iOS: Открыть Camera app → сканировать QR код
   - Android: Открыть Expo Go app → нажать "Scan QR Code"

4. **Проверить подключение**
   - Телефон и компьютер должны быть в **одной Wi-Fi сети**
   - URL будет вида: `exp://192.168.x.x:8081`

**Проблемы Expo Go для UNITY-v2**:

❌ **UNITY-v2 НЕ будет работать в Expo Go** из-за:
- `expo-dev-client` установлен (требует Development Build)
- Custom native modules (expo-sqlite, expo-av, expo-file-system)
- Platform Adapters с native реализациями

**Вывод**: Для UNITY-v2 нужен **Development Build** (Способ 2)

---

#### **Способ 2: Development Build (Рекомендуется для UNITY-v2)** 🚀

**Что это?**:
- **Custom build** вашего приложения с `expo-dev-client`
- Поддерживает **ВСЕ** native modules
- Требует **EAS Build** или **local build**

**Когда использовать?**:
- ✅ Приложение использует custom native modules
- ✅ Нужен полный контроль над native code
- ✅ Production-ready тестирование
- ✅ **UNITY-v2 (наш случай)**

### 📋 Пошаговая настройка Development Build для UNITY-v2

#### **Шаг 1: Установить EAS CLI**

```bash
npm install -g eas-cli
```

#### **Шаг 2: Войти в Expo аккаунт**

```bash
eas login
```

**Ваши credentials**:
- Email: `www.klaster.digital@gmail.com`
- Expo account: https://expo.dev/accounts/klastergital
- Password: Qqq111www222!

#### **Шаг 3: Создать `eas.json` конфигурацию**

```bash
eas build:configure
```

Это создаст файл `eas.json` с базовой конфигурацией. **Замените** его содержимое на:

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
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

**Объяснение профилей**:

- `development`: iOS Simulator build (для Mac)
- `development-device`: Android APK для физических устройств
- `preview`: Internal testing (QA)
- `production`: App Store/Google Play

#### **Шаг 4: Проверить `expo-dev-client` установлен**

```json
{
  "dependencies": {
    "expo-dev-client": "~6.0.16"
  }
}
```

✅ **Уже установлен** в UNITY-v2

#### **Шаг 5: Создать Development Build**

**Для Android (физическое устройство)**:

```bash
eas build --platform android --profile development-device
```

**Для iOS Simulator (только Mac)**:

```bash
eas build --platform ios --profile development
```

**Что происходит?**:
1. EAS Build загружает ваш код на облачные серверы
2. Компилирует native Android/iOS приложение
3. Возвращает ссылку на скачивание APK/IPA
4. Время сборки: ~15-20 минут

**Ожидаемый output**:

```bash
✔ Build credentials
✔ Project configuration
✔ Queue build

Build details: https://expo.dev/accounts/klastergital/projects/unity/builds/[id]
Build started, estimated time: 15-20 minutes
```

#### **Шаг 6: Установить Development Build на телефон**

**Android**:
1. Скачать APK по ссылке из EAS Build
2. Установить APK на телефон (разрешить установку из неизвестных источников)
3. Открыть приложение

**iOS Simulator** (только Mac):
```bash
# После завершения build
eas build:run -p ios --latest
```

#### **Шаг 7: Запустить Expo dev server**

```bash
npm run start:expo
# или
npx expo start --dev-client
```

**Важно**: Используйте флаг `--dev-client` чтобы Metro bundler подключился к Development Build (не Expo Go)

#### **Шаг 8: Подключить телефон к dev server**

1. Открыть Development Build на телефоне
2. Сканировать QR код из терминала
3. Приложение загрузит JavaScript bundle с вашего компьютера

**Проверка подключения**:
- Телефон и компьютер в одной Wi-Fi сети
- URL: `exp://192.168.x.x:8081`
- Dev menu: встряхнуть телефон → откроется меню разработчика

### 🔄 Workflow разработки с Development Build

```bash
# 1. Запустить dev server
npm run start:expo

# 2. Открыть Development Build на телефоне
# 3. Сканировать QR код
# 4. Приложение загрузится

# 5. Внести изменения в код
# 6. Сохранить файл
# 7. Fast Refresh автоматически обновит приложение на телефоне ⚡

# 8. Если изменили native code (app.json, plugins):
#    - Пересобрать Development Build через EAS
eas build --platform android --profile development-device
```

### ⚠️ Когда нужно пересобирать Development Build?

**НЕ нужно пересобирать** (Fast Refresh):
- ✅ Изменения в JavaScript/TypeScript коде
- ✅ Изменения в React компонентах
- ✅ Изменения в стилях

**Нужно пересобирать** (EAS Build):
- ❌ Изменения в `app.json` / `app.config.js`
- ❌ Добавление/удаление Expo plugins
- ❌ Изменения в native code
- ❌ Обновление Expo SDK версии

### 📊 Сравнение: Expo Go vs Development Build

| Аспект | Expo Go | Development Build |
|--------|---------|-------------------|
| **Установка** | App Store/Google Play | EAS Build (15-20 мин) |
| **Custom Native Modules** | ❌ НЕ поддерживает | ✅ Полная поддержка |
| **Время первого запуска** | ⚡ 1 минута | ⏱️ 15-20 минут (build) |
| **Fast Refresh** | ✅ Да | ✅ Да |
| **Подходит для UNITY-v2** | ❌ Нет | ✅ Да |
| **Требует EAS Build** | ❌ Нет | ✅ Да |
| **Стоимость** | 🆓 Бесплатно | 🆓 Бесплатно (Expo Free tier) |

### 🎯 Рекомендации для UNITY-v2

#### **Для быстрого тестирования UI** (без native функций):

```bash
# 1. Временно отключить expo-dev-client
npm uninstall expo-dev-client

# 2. Запустить Expo Go
npm run start:expo

# 3. Сканировать QR код в Expo Go app
```

**Ограничения**:
- ❌ НЕ будет работать expo-sqlite
- ❌ НЕ будет работать expo-file-system
- ❌ НЕ будет работать Platform Adapters с native реализациями

#### **Для полноценного тестирования** (рекомендуется):

```bash
# 1. Создать eas.json (см. Шаг 3)
# 2. Создать Development Build
eas build --platform android --profile development-device

# 3. Установить APK на телефон
# 4. Запустить dev server
npm run start:expo --dev-client

# 5. Сканировать QR код в Development Build app
```

**Преимущества**:
- ✅ Полная поддержка всех native модулей
- ✅ Production-ready тестирование
- ✅ Работает с Platform Adapters

### 📝 Итоговый чеклист

- [ ] Установить EAS CLI: `npm install -g eas-cli`
- [ ] Войти в Expo: `eas login` (www.klaster.digital@gmail.com)
- [ ] Создать `eas.json`: `eas build:configure` (использовать конфигурацию из Шага 3)
- [ ] Создать Android Development Build: `eas build --platform android --profile development-device`
- [ ] Скачать и установить APK на телефон
- [ ] Запустить dev server: `npm run start:expo --dev-client`
- [ ] Открыть Development Build на телефоне
- [ ] Сканировать QR код
- [ ] Проверить что приложение загрузилось
- [ ] Внести изменения в код → проверить Fast Refresh

---

## 🔗 Полезные ссылки

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Development Builds**: https://docs.expo.dev/develop/development-builds/introduction/
- **Expo Go**: https://docs.expo.dev/get-started/expo-go/
- **Ваш Expo аккаунт**: https://expo.dev/accounts/klastergital

---

**Дата**: 2025-10-30
**Версия**: UNITY-v2
**Статус**: ✅ **Готово к настройке Expo**


