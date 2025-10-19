# 📱 React Native Expo миграция - Детальный план задачи

**Дата обновления**: 2025-01-18  
**Версия**: 1.0  
**Статус**: Фаза 3 - Q3 2025  
**Автор**: Команда UNITY

> **Связь с мастер-планом**: Эта задача детализирует **Задачу 6** из [UNITY_MASTER_PLAN_2025.md](../UNITY_MASTER_PLAN_2025.md)

---

## 🎯 Цель задачи

Быстрая миграция PWA на React Native Expo (3-5 дней) благодаря подготовительной работе в Фазе 1. Публикация нативных приложений в App Store и Google Play.

### Ключевые метрики
- **Время миграции**: 3-5 дней (вместо 7-10)
- **Совместимость кода**: 95% переиспользование
- **Performance**: Нативная производительность
- **Store approval**: Первая попытка успешна

---

## 📋 Детальные задачи

### День 1: Создание Expo проекта

#### 1.1 Инициализация проекта
```bash
# Создание нового Expo проекта
npx create-expo-app UNITY-mobile --template blank-typescript

# Установка зависимостей
cd UNITY-mobile
npx expo install expo-router expo-constants expo-status-bar
```

#### 1.2 Настройка конфигурации
**Файлы для создания**:
- `app.json` - конфигурация Expo
- `metro.config.js` - настройка Metro bundler
- `babel.config.js` - Babel конфигурация

**app.json**:
```json
{
  "expo": {
    "name": "UNITY - Дневник достижений",
    "slug": "unity-diary",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.unity.diary"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.unity.diary"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### День 2: Портирование компонентов

#### 2.1 Копирование universal компонентов
**Источники** (уже готовы из Фазы 1):
- `src/shared/components/ui/universal/` → `components/ui/`
- `src/shared/lib/platform/` → `lib/platform/`
- `src/shared/lib/theme/` → `lib/theme/`

#### 2.2 Адаптация экранов
**Экраны для портирования**:
```typescript
// app/(tabs)/index.tsx - Главный экран
import { AchievementHomeScreen } from '../../../components/screens/AchievementHomeScreen';

export default function HomeTab() {
  return <AchievementHomeScreen />;
}

// app/(tabs)/history.tsx - История
import { HistoryScreen } from '../../../components/screens/HistoryScreen';

export default function HistoryTab() {
  return <HistoryScreen />;
}
```

### День 3: Нативные функции

#### 3.1 Камера и медиафайлы
**Установка зависимостей**:
```bash
npx expo install expo-camera expo-image-picker expo-media-library
```

**Реализация**:
```typescript
// lib/platform/media-picker.native.ts
import * as ImagePicker from 'expo-image-picker';

export class NativeMediaPicker implements MediaPickerInterface {
  async pickImage(): Promise<MediaFile | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      return {
        uri: result.assets[0].uri,
        type: 'image',
        name: 'image.jpg'
      };
    }
    return null;
  }
}
```

#### 3.2 Push уведомления
**Установка**:
```bash
npx expo install expo-notifications expo-device
```

**Настройка**:
```typescript
// lib/notifications/expo-notifications.ts
import * as Notifications from 'expo-notifications';

export class ExpoNotificationManager {
  async registerForPushNotifications() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission not granted');
    }

    const token = await Notifications.getExpoPushTokenAsync();
    return token.data;
  }
}
```

### День 4: Тестирование и отладка

#### 4.1 Тестирование на устройствах
**Платформы для тестирования**:
- **iOS Simulator** - базовое тестирование
- **Android Emulator** - проверка Android специфики
- **Физические устройства** - реальное тестирование

#### 4.2 Исправление платформенных различий
**Типичные проблемы**:
- Различия в навигации (iOS vs Android)
- Размеры экранов и safe areas
- Производительность анимаций
- Доступ к файловой системе

### День 5: Подготовка к публикации

#### 5.1 Сборка production версий
```bash
# iOS сборка
eas build --platform ios --profile production

# Android сборка  
eas build --platform android --profile production
```

#### 5.2 Настройка EAS (Expo Application Services)
**Файл**: `eas.json`
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🏪 Публикация в сторах

### App Store (iOS)

#### Подготовка
1. **Apple Developer Account** - $99/год
2. **App Store Connect** - создание приложения
3. **Metadata** - описание, скриншоты, ключевые слова
4. **Privacy Policy** - обязательно для App Store

#### Процесс публикации
```bash
# Сборка для App Store
eas build --platform ios --profile production

# Отправка на ревью
eas submit --platform ios
```

### Google Play (Android)

#### Подготовка
1. **Google Play Console** - $25 одноразово
2. **App Bundle** - формат для Google Play
3. **Store Listing** - описание и медиафайлы
4. **Content Rating** - возрастной рейтинг

#### Процесс публикации
```bash
# Сборка для Google Play
eas build --platform android --profile production

# Отправка в Google Play
eas submit --platform android
```

---

## 🧪 Тестирование

### Функциональное тестирование
1. **Все экраны работают** - навигация и UI
2. **Supabase интеграция** - авторизация и данные
3. **Offline режим** - работа без интернета
4. **Push уведомления** - доставка и обработка
5. **Медиафайлы** - камера и галерея

### Performance тестирование
- **Время запуска** < 3 секунд
- **Плавность анимаций** 60 FPS
- **Потребление памяти** < 100MB
- **Размер приложения** < 50MB

---

## 📊 Мониторинг

### Crash Reporting
```typescript
// Sentry для React Native
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_DSN_HERE',
});
```

### Analytics
```typescript
// Expo Analytics
import { Analytics } from 'expo-analytics';

const analytics = new Analytics('UA-XXXXXXXX-X');
analytics.hit('Home Screen');
```

---

## ✅ Критерии готовности

### Definition of Done
- [ ] Приложение собирается без ошибок
- [ ] Все экраны работают на iOS и Android
- [ ] Push уведомления настроены
- [ ] Камера и галерея работают
- [ ] Offline режим функционирует
- [ ] Приложения опубликованы в сторах
- [ ] Crash reporting настроен

### Store Requirements
- **iOS**: Human Interface Guidelines соблюдены
- **Android**: Material Design принципы
- **Privacy**: Политика конфиденциальности
- **Content**: Возрастной рейтинг 4+

---

## 🔗 Связанные документы

- [UNITY_MASTER_PLAN_2025.md](../UNITY_MASTER_PLAN_2025.md) - общая стратегия
- [REACT_NATIVE_MIGRATION_PLAN.md](../REACT_NATIVE_MIGRATION_PLAN.md) - подготовительная работа
- [performance-optimization.md](./performance-optimization.md) - оптимизация

---

**🎯 Результат**: Нативные iOS и Android приложения в App Store и Google Play с полной функциональностью PWA версии.
