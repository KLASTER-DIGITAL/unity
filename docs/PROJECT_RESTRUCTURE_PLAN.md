# 🏗️ UNITY-v2 - План реструктуризации проекта

**Дата**: 2025-10-15  
**Цель**: Разделить мобильное приложение и админ-панель, устранить дубли, оптимизировать структуру

---

## 📊 Текущие проблемы

### 1. **Смешанная архитектура**
❌ Мобильные и десктопные компоненты в одной папке  
❌ Нет четкого разделения между PWA и Admin  
❌ Общие компоненты не выделены в отдельную папку  

### 2. **Дубликаты кода**
❌ `src/components/screens/admin/old/` - полные дубли компонентов  
❌ Повторяющаяся логика в разных экранах  
❌ Дублирование стилей (globals.css vs admin-design-system.css)  

### 3. **Неоптимальная структура**
❌ Компоненты верхнего уровня смешаны с экранами  
❌ Утилиты не сгруппированы по назначению  
❌ PWA компоненты разбросаны  

---

## 🎯 Целевая структура

```
src/
├── app/                          # 🆕 Главные точки входа
│   ├── mobile/                   # Мобильное PWA приложение
│   │   ├── App.tsx              # Главный компонент мобильного приложения
│   │   └── routes.tsx           # Роутинг для мобильного приложения
│   └── admin/                    # Админ-панель для десктопа
│       ├── AdminApp.tsx         # Главный компонент админки
│       └── routes.tsx           # Роутинг для админки
│
├── features/                     # 🆕 Фичи приложения (Feature-based architecture)
│   ├── mobile/                   # Мобильные фичи
│   │   ├── home/                # Главный экран
│   │   │   ├── components/      # Компоненты фичи
│   │   │   │   ├── AchievementHomeScreen.tsx
│   │   │   │   ├── RecentEntriesFeed.tsx
│   │   │   │   └── ChatInputSection.tsx
│   │   │   ├── hooks/           # Хуки фичи
│   │   │   └── index.ts         # Экспорты
│   │   ├── history/             # История записей
│   │   │   ├── components/
│   │   │   │   └── HistoryScreen.tsx
│   │   │   └── index.ts
│   │   ├── achievements/        # Достижения
│   │   │   ├── components/
│   │   │   │   └── AchievementsScreen.tsx
│   │   │   └── index.ts
│   │   ├── reports/             # Отчеты
│   │   │   ├── components/
│   │   │   │   └── ReportsScreen.tsx
│   │   │   └── index.ts
│   │   ├── settings/            # Настройки пользователя
│   │   │   ├── components/
│   │   │   │   └── SettingsScreen.tsx
│   │   │   └── index.ts
│   │   ├── auth/                # Авторизация
│   │   │   ├── components/
│   │   │   │   ├── WelcomeScreen.tsx
│   │   │   │   ├── AuthScreenNew.tsx
│   │   │   │   ├── OnboardingScreen2.tsx
│   │   │   │   ├── OnboardingScreen3.tsx
│   │   │   │   └── OnboardingScreen4.tsx
│   │   │   └── index.ts
│   │   └── media/               # Медиа (фото, голос)
│   │       ├── components/
│   │       │   ├── MediaPreview.tsx
│   │       │   ├── MediaLightbox.tsx
│   │       │   └── VoiceRecordingModal.tsx
│   │       ├── hooks/
│   │       │   ├── useMediaUploader.ts
│   │       │   ├── useVoiceRecorder.ts
│   │       │   └── useSpeechRecognition.ts
│   │       └── index.ts
│   │
│   └── admin/                    # Админ фичи
│       ├── dashboard/           # Главная панель
│       │   ├── components/
│       │   │   └── AdminDashboard.tsx
│       │   └── index.ts
│       ├── users/               # Управление пользователями
│       │   ├── components/
│       │   │   └── UsersManagementTab.tsx
│       │   └── index.ts
│       ├── subscriptions/       # Подписки
│       │   ├── components/
│       │   │   └── SubscriptionsTab.tsx
│       │   └── index.ts
│       ├── settings/            # Настройки системы
│       │   ├── components/
│       │   │   ├── SettingsTab.tsx
│       │   │   ├── APISettingsTab.tsx
│       │   │   ├── LanguagesTab.tsx
│       │   │   ├── PWASettingsTab.tsx
│       │   │   ├── PushNotificationsTab.tsx
│       │   │   ├── GeneralSettingsTab.tsx
│       │   │   ├── SystemSettingsTab.tsx
│       │   │   └── TelegramSettingsTab.tsx
│       │   └── index.ts
│       └── auth/                # Админ авторизация
│           ├── components/
│           │   └── AdminLoginScreen.tsx
│           └── index.ts
│
├── shared/                       # 🆕 Общие компоненты и утилиты
│   ├── components/              # Переиспользуемые компоненты
│   │   ├── layout/              # Лейауты
│   │   │   ├── MobileBottomNav.tsx
│   │   │   ├── MobileHeader.tsx
│   │   │   └── AchievementHeader.tsx
│   │   ├── modals/              # Модальные окна
│   │   │   ├── TimePickerModal.tsx
│   │   │   └── PermissionGuide.tsx
│   │   ├── pwa/                 # PWA компоненты
│   │   │   ├── PWAHead.tsx
│   │   │   ├── PWASplash.tsx
│   │   │   ├── PWAStatus.tsx
│   │   │   ├── PWAUpdatePrompt.tsx
│   │   │   └── InstallPrompt.tsx
│   │   └── ui/                  # shadcn/ui компоненты
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ... (все остальные)
│   │
│   ├── hooks/                   # Общие хуки
│   │   └── use-on-click-outside.ts
│   │
│   ├── lib/                     # Утилиты и хелперы
│   │   ├── api/                 # API клиенты
│   │   │   ├── api.ts
│   │   │   └── supabase/
│   │   │       ├── client.ts
│   │   │       └── info.tsx
│   │   ├── auth/                # Авторизация
│   │   │   └── auth.ts
│   │   ├── i18n/                # Интернационализация
│   │   │   ├── TranslationProvider.tsx
│   │   │   ├── useTranslation.ts
│   │   │   ├── LanguageSelector.tsx
│   │   │   ├── api.ts
│   │   │   ├── cache.ts
│   │   │   ├── loader.ts
│   │   │   └── types.ts
│   │   ├── pwa/                 # PWA утилиты
│   │   │   ├── pwaUtils.ts
│   │   │   └── generatePWAIcons.ts
│   │   ├── media/               # Медиа утилиты
│   │   │   └── imageCompression.ts
│   │   └── stats/               # Статистика
│   │       └── statsCalculator.ts
│   │
│   └── types/                   # TypeScript типы
│       ├── user.ts
│       ├── entry.ts
│       ├── achievement.ts
│       └── index.ts
│
├── assets/                       # Статические ресурсы
│   ├── images/                  # Изображения
│   └── icons/                   # Иконки
│
├── styles/                       # Глобальные стили
│   ├── globals.css              # Общие стили
│   ├── mobile.css               # 🆕 Мобильные стили
│   └── admin.css                # 🆕 Админ стили (переименовать admin-design-system.css)
│
├── public/                       # Публичные файлы
│   ├── manifest.json
│   └── service-worker.js
│
├── App.tsx                       # 🔄 Главный роутер (выбор mobile/admin)
├── main.tsx                      # Точка входа
└── index.css                     # Tailwind imports
```

---

## 🔄 План миграции (без поломок!)

### Фаза 1: Подготовка (1 день)

#### Шаг 1.1: Создать новую структуру папок
```bash
mkdir -p src/app/mobile src/app/admin
mkdir -p src/features/mobile/{home,history,achievements,reports,settings,auth,media}
mkdir -p src/features/admin/{dashboard,users,subscriptions,settings,auth}
mkdir -p src/shared/{components/{layout,modals,pwa,ui},hooks,lib/{api,auth,i18n,pwa,media,stats},types}
```

#### Шаг 1.2: Создать index.ts для экспортов
```typescript
// src/features/mobile/home/index.ts
export { AchievementHomeScreen } from './components/AchievementHomeScreen';
export { RecentEntriesFeed } from './components/RecentEntriesFeed';
export { ChatInputSection } from './components/ChatInputSection';
```

### Фаза 2: Миграция shared компонентов (2 дня)

#### Шаг 2.1: Переместить UI компоненты
```bash
# Переместить все shadcn/ui компоненты
mv src/components/ui/* src/shared/components/ui/
```

#### Шаг 2.2: Переместить утилиты
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
```

#### Шаг 2.3: Переместить PWA компоненты
```bash
mv src/components/PWA*.tsx src/shared/components/pwa/
mv src/components/InstallPrompt.tsx src/shared/components/pwa/
```

#### Шаг 2.4: Переместить layout компоненты
```bash
mv src/components/MobileBottomNav.tsx src/shared/components/layout/
mv src/components/MobileHeader.tsx src/shared/components/layout/
mv src/components/AchievementHeader.tsx src/shared/components/layout/
```

### Фаза 3: Миграция мобильных фич (3 дня)

#### Шаг 3.1: Home фича
```bash
mkdir -p src/features/mobile/home/components
mv src/components/screens/AchievementHomeScreen.tsx src/features/mobile/home/components/
mv src/components/RecentEntriesFeed.tsx src/features/mobile/home/components/
mv src/components/ChatInputSection.tsx src/features/mobile/home/components/
```

#### Шаг 3.2: Auth фича
```bash
mkdir -p src/features/mobile/auth/components
mv src/components/WelcomeScreen.tsx src/features/mobile/auth/components/
mv src/components/AuthScreenNew.tsx src/features/mobile/auth/components/
mv src/components/OnboardingScreen*.tsx src/features/mobile/auth/components/
```

#### Шаг 3.3: Остальные фичи
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

# Settings
mkdir -p src/features/mobile/settings/components
mv src/components/screens/SettingsScreen.tsx src/features/mobile/settings/components/

# Media
mkdir -p src/features/mobile/media/{components,hooks}
mv src/components/MediaPreview.tsx src/features/mobile/media/components/
mv src/components/MediaLightbox.tsx src/features/mobile/media/components/
mv src/components/VoiceRecordingModal.tsx src/features/mobile/media/components/
mv src/components/hooks/useMediaUploader.ts src/features/mobile/media/hooks/
mv src/components/hooks/useVoiceRecorder.ts src/features/mobile/media/hooks/
mv src/components/hooks/useSpeechRecognition.ts src/features/mobile/media/hooks/
```

### Фаза 4: Миграция админ фич (2 дня)

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

# Settings
mkdir -p src/features/admin/settings/components
mv src/components/screens/admin/SettingsTab.tsx src/features/admin/settings/components/
mv src/components/screens/admin/settings/* src/features/admin/settings/components/

# Auth
mkdir -p src/features/admin/auth/components
mv src/components/AdminLoginScreen.tsx src/features/admin/auth/components/
```

### Фаза 5: Обновление импортов (2 дня)

Создать скрипт для автоматического обновления импортов:

```typescript
// scripts/update-imports.ts
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const importMappings = {
  // UI components
  '@/components/ui/': '@/shared/components/ui/',
  
  // Layout
  '@/components/MobileBottomNav': '@/shared/components/layout/MobileBottomNav',
  '@/components/MobileHeader': '@/shared/components/layout/MobileHeader',
  
  // PWA
  '@/components/PWAHead': '@/shared/components/pwa/PWAHead',
  
  // Utils
  '@/utils/api': '@/shared/lib/api/api',
  '@/utils/auth': '@/shared/lib/auth/auth',
  '@/utils/i18n': '@/shared/lib/i18n',
  
  // Screens
  '@/components/screens/AchievementHomeScreen': '@/features/mobile/home',
  '@/components/screens/HistoryScreen': '@/features/mobile/history',
  // ... и так далее
};

// Обновить все импорты в файлах
const files = glob.sync('src/**/*.{ts,tsx}');
files.forEach(file => {
  let content = readFileSync(file, 'utf-8');
  
  Object.entries(importMappings).forEach(([oldPath, newPath]) => {
    content = content.replace(
      new RegExp(oldPath.replace(/\//g, '\\/'), 'g'),
      newPath
    );
  });
  
  writeFileSync(file, content);
});
```

### Фаза 6: Разделение App.tsx (1 день)

#### Создать src/app/mobile/App.tsx
```typescript
// Мобильное приложение с max-w-md
export function MobileApp() {
  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {/* Мобильные экраны */}
    </div>
  );
}
```

#### Создать src/app/admin/AdminApp.tsx
```typescript
// Админ-панель без ограничения ширины
export function AdminApp() {
  return (
    <div className="min-h-screen bg-background">
      {/* Админ панель */}
    </div>
  );
}
```

#### Обновить src/App.tsx
```typescript
import { MobileApp } from './app/mobile/App';
import { AdminApp } from './app/admin/AdminApp';

export function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  return isAdminRoute ? <AdminApp /> : <MobileApp />;
}
```

### Фаза 7: Очистка (1 день)

```bash
# Удалить старые папки
rm -rf src/components/screens
rm -rf src/components/hooks
rm -rf src/components/i18n
rm -rf src/utils

# Переместить оставшиеся файлы
mv src/components/figma src/shared/components/
mv src/hooks/* src/shared/hooks/
```

---

## ✅ Чеклист выполнения

- [ ] Фаза 1: Создать структуру папок
- [ ] Фаза 2: Мигрировать shared компоненты
- [ ] Фаза 3: Мигрировать мобильные фичи
- [ ] Фаза 4: Мигрировать админ фичи
- [ ] Фаза 5: Обновить все импорты
- [ ] Фаза 6: Разделить App.tsx
- [ ] Фаза 7: Очистить старые файлы
- [ ] Тестирование: Проверить сборку `npm run build`
- [ ] Тестирование: Проверить мобильное приложение
- [ ] Тестирование: Проверить админ-панель
- [ ] Деплой: Задеплоить на Netlify

---

## 📈 Ожидаемые результаты

### До реструктуризации:
- ❌ Смешанная архитектура
- ❌ Дубликаты кода
- ❌ Сложно найти нужный компонент
- ❌ Импорты запутаны

### После реструктуризации:
- ✅ Четкое разделение mobile/admin
- ✅ Feature-based архитектура
- ✅ Нет дублей
- ✅ Легко найти любой компонент
- ✅ Чистые импорты
- ✅ Готовность к масштабированию

---

**Общее время**: ~12 дней работы  
**Риск поломок**: Минимальный (пошаговая миграция с тестированием)

