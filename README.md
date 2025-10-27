# 🌟 UNITY-v2 - PWA Дневник Достижений

**Версия**: 2.0.0 ✅
**Статус**: Production Ready
**React Native**: 100% готовность

Современное Progressive Web App для ведения дневника с AI-анализом, системой достижений и мотивационными карточками.

## 🚀 Демо

**Production URL**: https://unity-wine.vercel.app
**Admin Panel**: https://unity-wine.vercel.app/?view=admin

## 🎉 Что нового в v2.0

**Главные достижения**:
- ✅ **100% React Native готовность** - 6 Platform Adapters, 6 Universal Components
- ✅ **277 тестов** (100% passing) - Unit, Integration, E2E
- ✅ **0 ошибок в консоли** - Production ready
- ✅ **Platform Adapters** - Voice, Speech, Storage, Media, Navigation, Animation
- ✅ **Universal Components** - Toast, RadioGroup, Dialog, Select, Switch, Checkbox
- ✅ **Оптимизированные Edge Functions** - Standalone pattern, <300 строк

**Документация**: См. `docs/FINAL_REPORT_2025-10-26.md` и `docs/STATUS.md`

## 📋 Описание

UNITY-v2 - это инновационное PWA приложение с двойной архитектурой:

### 📱 Мобильное PWA приложение
- **AI-анализ записей** с OpenAI GPT-4
- **Голосовые заметки** с транскрипцией
- **Медиафайлы** (фото, видео, аудио)
- **Система достижений** и прогресс-трекинг
- **Мотивационные карточки** на основе AI
- **Многоязычность** (7 языков: ru, en, es, de, fr, zh, ja)
- **PWA функционал** (установка, офлайн режим)

### 🖥️ Админ-панель
- **Управление пользователями** и подписками
- **Настройки системы** и переводов
- **Мониторинг использования** OpenAI API
- **Статистика и аналитика**

## 🛠 Технологии

### Frontend
- **React 18.3.1** + **TypeScript** + **Vite 6.3.5**
- **Tailwind CSS** + **Radix UI** (shadcn/ui)
- **Motion** (анимации) + **Lucide React** (иконки)
- **Recharts** (графики) + **Sonner** (уведомления)

### Backend & Infrastructure
- **Supabase** (Auth, Database, Edge Functions)
- **OpenAI GPT-4** (AI-анализ)
- **Vercel** (hosting & deployment)
- **Sentry** (error monitoring & performance)
- **PWA** (Service Workers, Manifest)

## 🚀 Быстрый старт

### Предварительные требования
- **Node.js** 18+
- **npm** или **yarn**
- **Supabase** аккаунт

### Локальная разработка

```bash
# Клонировать репозиторий
git clone https://github.com/KLASTER-DIGITAL/unity.git
cd unity

# Установить зависимости
npm install

# Настроить переменные окружения
cp .env.example .env
# Заполнить VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY

# Запустить dev сервер
npm run dev
```

Приложение откроется на `http://localhost:5173`

### Production сборка

```bash
npm run build
npm run preview
```

### Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Тесты с UI
npm run test:ui
```

## 📁 Архитектура проекта

UNITY-v2 использует **Feature-Sliced Design** архитектуру с четким разделением на мобильное PWA и админ-панель:

```
UNITY-v2/
├── src/
│   ├── app/                          # 🎯 Точки входа приложений
│   │   ├── mobile/                   # Мобильное PWA (max-w-md)
│   │   │   └── MobileApp.tsx        # Главный компонент PWA
│   │   └── admin/                    # Админ-панель (full-width)
│   │       └── AdminApp.tsx         # Главный компонент админки
│   │
│   ├── features/                     # 🧩 Фичи по доменам
│   │   ├── mobile/                   # Мобильные фичи (6 модулей)
│   │   │   ├── home/                # Главный экран + записи
│   │   │   ├── history/             # История записей
│   │   │   ├── achievements/        # Система достижений
│   │   │   ├── reports/             # Отчеты и статистика
│   │   │   ├── settings/            # Настройки пользователя
│   │   │   └── media/               # Медиа компоненты
│   │   └── admin/                    # Админ фичи (3 модуля)
│   │       ├── dashboard/           # Панель управления
│   │       ├── settings/            # Настройки системы
│   │       └── auth/                # Аутентификация админа
│   │
│   ├── shared/                       # 🔄 Переиспользуемые компоненты
│   │   ├── components/              # UI компоненты
│   │   │   ├── ui/                  # shadcn/ui (49 компонентов)
│   │   │   ├── pwa/                 # PWA компоненты
│   │   │   ├── layout/              # Layout компоненты
│   │   │   └── modals/              # Модальные окна
│   │   ├── lib/                     # Библиотеки и утилиты
│   │   │   ├── api/                 # API клиенты
│   │   │   ├── auth/                # Аутентификация
│   │   │   ├── i18n/                # Интернационализация
│   │   │   └── pwa/                 # PWA утилиты
│   │   └── hooks/                   # Переиспользуемые хуки
│   │
│   └── components/                   # 📦 Legacy компоненты (onboarding)
│
├── supabase/                         # 🗄️ Backend
│   ├── functions/                   # Edge Functions (микросервисы)
│   │   ├── ai-analysis/            # AI анализ записей
│   │   ├── motivations/            # Мотивационные карточки
│   │   ├── media/                  # Обработка медиа
│   │   ├── profiles/               # Управление профилями
│   │   └── entries/                # Управление записями
│   └── migrations/                  # Миграции БД
│
├── docs/                            # 📚 Документация
├── public/                          # 🌐 Статические файлы
└── .github/workflows/               # 🚀 CI/CD
```

### Принципы архитектуры

1. **Разделение ответственности**: Мобильное PWA и админ-панель изолированы
2. **Feature-based структура**: Код организован по бизнес-фичам
3. **Shared компоненты**: Переиспользование UI и логики
4. **Микросервисная архитектура**: Edge Functions разделены по доменам
5. **Monorepo-ready**: Готовность к React Native Expo

## 🔧 Переменные окружения

```env
# Supabase конфигурация
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Опционально для разработки
VITE_DEBUG_MODE=true
VITE_ENABLE_ANALYTICS=false
```

### Настройка Supabase

1. Создайте проект в [Supabase](https://supabase.com)
2. Скопируйте URL и anon key из Settings → API
3. Настройте RLS политики для таблиц
4. Деплойте Edge Functions из папки `supabase/functions/`

### Настройка OpenAI (для AI-анализа)

1. Получите API ключ в [OpenAI](https://platform.openai.com)
2. Добавьте ключ в админ-панели: Settings → OpenAI API Key
3. Ключ сохраняется в таблице `admin_settings` и используется всеми пользователями

## 📚 Документация

Полная документация находится в папке [`docs/`](./docs/):

### 🏗️ Архитектура и планирование
- [**Мастер-план реструктуризации**](./docs/MASTER_PLAN.md) - Полный план развития проекта
- [**Анализ мобильной разработки**](./docs/MOBILE_ANALYSIS_AND_RECOMMENDATIONS.md) - Roadmap для React Native
- [**Профессиональные рекомендации**](./docs/PROFESSIONAL_RECOMMENDATIONS.md) - Best practices

### 🚀 Деплой и настройка
- [**GitHub Actions Setup**](./docs/GITHUB_ACTIONS_SETUP.md) - Настройка CI/CD
- [**Netlify деплой**](./docs/NETLIFY_DEPLOY_GUIDE.md) - Деплой на Netlify
- [**PWA функции**](./docs/PWA_FEATURES.md) - Progressive Web App возможности

### 🔧 Разработка
- [**Руководство по тестированию**](./docs/TESTING_GUIDE.md) - Unit, E2E, интеграционные тесты
- [**Edge Functions**](./docs/EDGE_FUNCTION_DEPLOY.md) - Микросервисы на Supabase
- [**Система интернационализации**](./docs/I18N_IMPLEMENTATION_REPORT.md) - Многоязычность

### 👨‍💼 Админ-панель
- [**Админ-панель**](./docs/ADMIN_PANEL.md) - Функции и возможности
- [**Настройки системы**](./docs/ADMIN_SETTINGS_REDESIGN_COMPLETE.md) - Конфигурация
- [**Быстрый старт для админов**](./docs/ADMIN_QUICKSTART.md) - Руководство администратора

## 🚀 Деплой

### Автоматический деплой

Приложение автоматически деплоится при push в `main` ветку:
- **Vercel Production**: https://unity-wine.vercel.app
- **Vercel Admin Panel**: https://unity-wine.vercel.app/?view=admin

### CI/CD Pipeline

```yaml
# Vercel автоматически деплоит при push в main
- Build с Vite
- Тестирование
- Деплой на Vercel Production
- Sentry error tracking
```

### Мониторинг

- **Vercel Dashboard**: https://vercel.com/get-leadshunters-projects/unity
- **Sentry Dashboard**: https://klaster-js.sentry.io/projects/unity-v2/
- **Supabase Dashboard**: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc

Подробнее см. [DEPLOYMENT.md](./docs/guides/DEPLOYMENT.md)

## 📊 Метрики производительности

### Размер бандла (после оптимизации)
- **Общий размер**: ~1.2MB (было 2.0MB, -40%)
- **Gzipped**: ~350KB (было 494KB, -30%)
- **Время загрузки**: ~1.2s (было 2.1s, +75%)

### Архитектурные улучшения
- ✅ **Code splitting** по фичам
- ✅ **Lazy loading** компонентов
- ✅ **Tree shaking** неиспользуемого кода
- ✅ **Микросервисная архитектура** Edge Functions
- ✅ **Feature-Sliced Design** структура

## 🔗 Полезные ссылки

### 🌐 Приложение
- **Production (Vercel)**: https://unity-wine.vercel.app
- **Admin Panel**: https://unity-wine.vercel.app/?view=admin
- **Telegram Bot**: @unity_diary_bot (в разработке)

### 🛠️ Разработка
- **GitHub Repository**: https://github.com/KLASTER-DIGITAL/unity
- **Vercel Dashboard**: https://vercel.com/get-leadshunters-projects/unity
- **Supabase Dashboard**: https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc
- **Sentry Dashboard**: https://klaster-js.sentry.io/projects/unity-v2/

### 📖 Ресурсы
- **Supabase Docs**: https://supabase.com/docs
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Motion**: https://motion.dev/

## � Roadmap

### Ближайшие планы (Q1 2025)
- [ ] **React Native Expo** приложение
- [ ] **Telegram Mini App** интеграция
- [ ] **Offline-first** архитектура
- [ ] **Push уведомления**
- [ ] **Социальные функции** (друзья, лента)

### Долгосрочные цели
- [ ] **AI-коуч** для личностного роста
- [ ] **Интеграция с носимыми устройствами**
- [ ] **Marketplace** для кастомных шаблонов
- [ ] **Enterprise** версия для команд

## �📄 Лицензия

MIT License - см. [LICENSE](./LICENSE) файл

## 👥 Команда

**KLASTER-DIGITAL** - Full-stack разработка и дизайн
- 🏗️ **Архитектура**: Feature-Sliced Design + микросервисы
- 🎨 **UI/UX**: Mobile-first PWA + админ-панель
- 🤖 **AI Integration**: OpenAI GPT-4 + анализ данных
- 🌍 **Интернационализация**: 7 языков

---

## 🎯 Статус проекта

**✅ Production Ready** - Приложение полностью функционально и готово к использованию!

**📱 PWA**: Установка на мобильные устройства
**🤖 AI**: Умный анализ записей
**� i18n**: Поддержка 7 языков
**⚡ Performance**: Оптимизированная архитектура

**Начните использовать UNITY прямо сейчас!** 🚀
