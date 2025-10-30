# React Versions Strategy - UNITY-v2

**Дата**: 2025-10-29
**Последнее обновление**: 2025-10-29 21:35
**Версия**: 1.1
**Статус**: ✅ Реализовано и протестировано
**Автор**: UNITY Team

---

## 📋 Обзор

UNITY-v2 использует **гибридный подход** для управления версиями React в PWA и React Native builds. Это **архитектурное решение**, а НЕ временный хак.

### Ключевые принципы

1. **PWA build** (src/) → React 18.3.1 + react-native-web
2. **React Native build** (/app/) → React 19.1.0 + react-native
3. **npm overrides** → принудительная установка React 18.3.1 для PWA
4. **Vite alias** → `'react-native': 'react-native-web'` для PWA
5. **Vite manualChunks** → React и React-DOM в одном vendor-react chunk (КРИТИЧНО!)

---

## 🎯 Почему разные версии React?

### PWA Build (React 18.3.1)

**Причины:**
- ✅ **Radix UI совместимость**: Все компоненты Radix UI протестированы с React 18
- ✅ **Стабильность**: React 18.3.1 - стабильная LTS версия
- ✅ **react-native-web**: Полная совместимость с React 18
- ✅ **Минимальный риск**: Нет breaking changes при обновлении библиотек

**Зависимости требующие React 18:**
```json
{
  "@radix-ui/react-*": "^1.x",  // 30+ компонентов
  "react-native-web": "^0.21.2",
  "framer-motion": "^11.x",
  "next-themes": "^0.4.6"
}
```

### React Native Build (React 19.1.0)

**Причины:**
- ✅ **Expo SDK 54 требование**: Официально требует React 19.1.0
- ✅ **React Native 0.81**: Поставляется с React 19.1 как peer dependency
- ✅ **Новая архитектура**: React 19 оптимизирован для New Architecture
- ✅ **Производительность**: React 19 включает улучшения для мобильных устройств

**Официальные требования:**
```
Expo SDK 54 → React Native 0.81 → React 19.1.0
```

---

## 🏗️ Техническая реализация

### 1. package.json конфигурация

```json
{
  "dependencies": {
    "react": "^18.3.1",           // Базовая версия для PWA
    "react-dom": "^18.3.1",
    "react-native": "0.81.5",     // Для React Native build
    "react-native-web": "^0.21.2" // Для PWA build
  },
  "overrides": {
    "react": "^18.3.1",           // Принудительно для ВСЕХ пакетов
    "react-dom": "^18.3.1"
  }
}
```

**Как работает npm overrides:**
- Принудительно устанавливает React 18.3.1 для ВСЕХ зависимостей
- Решает конфликты версий (react-native требует React 19)
- Применяется ТОЛЬКО к PWA build (Vite)

### 2. Vite конфигурация

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
    ],
    alias: {
      // ✅ КРИТИЧЕСКИ ВАЖНО: Принудительно использовать React 18.3.1
      // Проблема: @expo/cli содержит React 19.2.0-canary в своих node_modules
      // Vite может случайно импортировать canary версию вместо 18.3.1
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react/jsx-runtime': path.resolve(__dirname, './node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': path.resolve(__dirname, './node_modules/react/jsx-dev-runtime'),

      // ✅ PWA + React Native Architecture
      'react-native': 'react-native-web',
      '@': path.resolve(__dirname, './src'),
      // ...
    }
  }
});
```

**Как работает dedupe:**
- Дедупликация React для предотвращения множественных копий
- Работает вместе с alias для максимальной надежности

**Как работает alias для React:**
- **Явно указывает путь к React 18.3.1** из корневого node_modules
- Предотвращает импорт React 19 canary из @expo/cli
- Решает проблему множественных копий React

**Как работает alias для react-native:**
- Перенаправляет импорты `react-native` → `react-native-web`
- Позволяет использовать react-native API в PWA
- Работает ТОЛЬКО в Vite build (PWA)

### 3. Vite manualChunks (КРИТИЧНО!)

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        // ✅ КРИТИЧЕСКИ ВАЖНО: React и React-DOM ДОЛЖНЫ быть в ОДНОМ chunk
        // Проблема: Vite создавал два разных chunks (chunk-QJTFJ6OV.js для React, chunk-YQ5BCTVV.js для React-DOM)
        // Это вызывало Invalid Hook Call Error из-за несинхронизированных копий
        // Решение: Принудительно объединяем React и React-DOM в один vendor-react chunk
        if (id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')) {
          return 'vendor-react';
        }
      }
    }
  }
}
```

**Почему это критично:**
- Vite по умолчанию создает отдельные chunks для React и React-DOM
- Это приводит к несинхронизированным копиям → Invalid Hook Call Error
- Принудительное объединение в один chunk решает проблему
- **Без этого PWA НЕ РАБОТАЕТ!**

### 4. Metro конфигурация (React Native)

```javascript
// metro.config.js (для /app/)
module.exports = {
  // Metro НЕ использует npm overrides
  // Использует настоящий react-native с React 19.1.0
};
```

---

## 📊 Архитектура разделения

### PWA Build (Vite)

```
src/
├── app/                    # PWA приложение
├── features/               # PWA фичи
├── shared/
│   ├── lib/
│   │   └── platform/       # Platform Adapters
│   │       ├── storage.web.ts      # localStorage
│   │       ├── media.web.ts        # FileReader
│   │       └── animation.web.ts    # Framer Motion
│   └── components/
│       └── ui/
│           └── universal/  # Universal Components
│               ├── Button.tsx      # Web implementation
│               └── Modal.tsx       # Radix UI based
```

**Build процесс:**
1. Vite читает `src/`
2. Применяет alias `react-native` → `react-native-web`
3. Применяет npm overrides (React 18.3.1)
4. Bundling с React 18.3.1

### React Native Build (Metro)

```
/app/
├── (tabs)/                 # React Native screens
├── shared/
│   ├── lib/
│   │   └── platform/       # Platform Adapters
│   │       ├── storage.native.ts   # AsyncStorage
│   │       ├── media.native.ts     # expo-file-system
│   │       └── animation.native.ts # Reanimated
│   └── components/
│       └── ui/
│           └── universal/  # Universal Components
│               ├── Button.native.tsx  # Native implementation
│               └── Modal.native.tsx   # React Native based
```

**Build процесс:**
1. Metro читает `/app/`
2. Использует настоящий `react-native`
3. НЕ применяет npm overrides
4. Bundling с React 19.1.0

---

## 🔄 Workflow разработки

### Разработка PWA

```bash
# 1. Установка зависимостей (с overrides)
npm install

# 2. Проверка версии React
npm ls react
# Должно показать: react@18.3.1

# 3. Запуск dev server
npm run dev

# 4. Build для production
npm run build
```

### Разработка React Native

```bash
# 1. Установка зависимостей (БЕЗ overrides для /app/)
cd /app/
npm install

# 2. Проверка версии React
npm ls react
# Должно показать: react@19.1.0

# 3. Запуск Expo
npx expo start

# 4. Build для production
eas build --platform ios
```

---

## ✅ Преимущества гибридного подхода

### 1. Стабильность PWA
- ✅ React 18.3.1 - проверенная версия
- ✅ Нет breaking changes
- ✅ Все библиотеки совместимы

### 2. Совместимость React Native
- ✅ Следование официальным требованиям Expo
- ✅ Полная поддержка New Architecture
- ✅ Оптимальная производительность

### 3. Независимость builds
- ✅ PWA и RN builds НЕ влияют друг на друга
- ✅ Можно обновлять версии независимо
- ✅ Разные зависимости для разных платформ

### 4. Постепенная миграция
- ✅ Можно мигрировать на React 19 постепенно
- ✅ Тестирование RN build отдельно от PWA
- ✅ Минимальный риск для production

---

## ⚠️ Важные замечания

### 1. npm overrides - это НЕ хак

**Это официальная фича npm** для управления версиями зависимостей:
- Документация: https://docs.npmjs.com/cli/v8/configuring-npm/package-json#overrides
- Используется в production проектах
- Рекомендуется npm командой для решения конфликтов

### 2. Разные версии React - это нормально

**Примеры из индустрии:**
- Monorepo проекты часто используют разные версии
- Micro-frontends используют разные версии
- PWA + Native apps используют разные версии

### 3. Когда обновлять React в PWA?

**Обновить до React 19.1.0 когда:**
- ✅ Все библиотеки (Radix UI, etc.) официально поддерживают React 19
- ✅ Проведено полное тестирование PWA на React 19
- ✅ Нет критических breaking changes
- ✅ React Native миграция завершена

**НЕ обновлять если:**
- ❌ Есть библиотеки несовместимые с React 19
- ❌ Нет времени на полное тестирование
- ❌ PWA работает стабильно на React 18

---

## 🔍 Проверка текущей конфигурации

### Проверка npm overrides

```bash
# Проверить что overrides применились
npm ls react

# Ожидаемый результат:
# react@18.3.1
# └── react-native@0.81.5
#     └── react@18.3.1 (overridden)
```

### Проверка Vite alias

```bash
# Проверить что alias работает
npm run build

# В консоли НЕ должно быть:
# ❌ "Cannot resolve 'react-native'"
# ❌ "Invalid Hook Call Error"
```

### Проверка PWA build

```bash
# Запустить dev server
npm run dev

# Открыть http://localhost:3000/
# Проверить консоль браузера:
# ✅ Нет ошибок "Invalid Hook Call"
# ✅ Нет ошибок "Multiple React versions"
```

---

## 📚 Связанная документация

- **Архитектура**: `docs/architecture/ARCHITECTURE_PWA_RN.md`
- **Миграция RN**: `docs/mobile/REACT_NATIVE_MIGRATION_PLAN.md`
- **Platform Adapters**: `docs/architecture/PLATFORM_ADAPTERS.md`
- **Universal Components**: `docs/architecture/UNIVERSAL_COMPONENTS.md`

---

## 🎯 Roadmap

### Q4 2025 (Текущий статус)
- ✅ PWA работает на React 18.3.1
- ✅ npm overrides настроены
- ✅ Vite alias настроен
- ✅ Platform Adapters готовы (95%+)

### Q1 2026 (Планируется)
- 🔄 React Native миграция (Expo SDK 54)
- 🔄 Тестирование RN build с React 19.1.0
- 🔄 Постепенная миграция PWA на React 19

### Q2 2026 (Будущее)
- 📅 Унификация версий React (если возможно)
- 📅 Обновление до Expo SDK 55+
- 📅 Полная поддержка New Architecture

---

## ❓ FAQ

### Q: Почему не обновить PWA до React 19 сейчас?

**A:** Минимизация рисков. React 18.3.1 стабильно работает, все библиотеки совместимы. Обновление до React 19 требует полного тестирования всех компонентов.

### Q: Будут ли проблемы с разными версиями React?

**A:** Нет, потому что PWA и RN builds полностью разделены. Vite bundler для PWA, Metro bundler для RN. Они НЕ пересекаются.

### Q: Когда можно удалить npm overrides?

**A:** Когда PWA обновится до React 19.1.0 и все зависимости будут совместимы.

### Q: Это временное решение?

**A:** Нет, это архитектурное решение для поддержки двух платформ с разными требованиями.

---

**Последнее обновление**: 2025-10-29  
**Автор**: UNITY Team  
**Статус**: ✅ Production Ready

