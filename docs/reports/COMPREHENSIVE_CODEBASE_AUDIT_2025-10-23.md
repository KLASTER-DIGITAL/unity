# 🔍 Комплексный аудит кодовой базы UNITY-v2

**Дата:** 2025-10-23  
**Версия:** 1.0  
**Статус:** 📊 АНАЛИЗ БЕЗ ИЗМЕНЕНИЙ КОДА

---

## 📋 Executive Summary

### Общее состояние проекта
- **Архитектура:** Feature-Sliced Design (FSD) с разделением на PWA и Admin
- **Технологический стек:** React 18.3.1 + TypeScript + Vite 6.3.5 + Supabase
- **Масштаб:** 334 исходных файла, 92 документа (27% ratio)
- **Готовность к React Native:** ~90% (Platform Adapters реализованы)
- **Производительность:** Оптимизирована (17 manual chunks, lazy loading, WebP assets)

### Ключевые находки
✅ **Сильные стороны:**
- Четкая архитектура FSD с разделением mobile/admin
- Полная система i18n с 7 активными языками
- PWA 100% готов (manifest, service worker, push notifications)
- Строгий RBAC (user/super_admin) с 3 точками контроля
- Platform Adapters для React Native готовы

⚠️ **Требует внимания:**
- Дублирование UI компонентов (src/components vs src/shared/components)
- 6 WARN в Supabase Security Advisors (function search_path)
- 21 WARN в Performance Advisors (RLS policies, unused indexes)
- Backup файлы в Edge Functions (*.backup)
- Legacy код в src/components/ и src/utils/

---

## 1️⃣ Code Quality Analysis

### 1.1 Дублирование кода

#### 🔴 КРИТИЧЕСКОЕ: Дублирование UI компонентов

**Проблема:** Одни и те же компоненты существуют в двух местах:
```
src/components/ui/shadcn-io/counter/index.tsx
src/shared/components/ui/shadcn-io/counter/index.tsx

src/components/ui/shadcn-io/shimmering-text/index.tsx
src/shared/components/ui/shadcn-io/shimmering-text/index.tsx

src/components/ui/shadcn-io/magnetic-button/index.tsx
src/shared/components/ui/shadcn-io/magnetic-button/index.tsx
```

**Обоснование дублирования:** НЕТ - это технический долг
**Рекомендация:** Удалить `src/components/ui/shadcn-io/` и использовать только `src/shared/components/ui/`

**Затронутые файлы:**
- `src/components/ui/shadcn-io/counter/index.tsx` → DELETE
- `src/components/ui/shadcn-io/shimmering-text/index.tsx` → DELETE
- `src/components/ui/shadcn-io/magnetic-button/index.tsx` → DELETE
- `src/components/ui/shadcn-io/pill/index.tsx` → DELETE
- `src/components/ui/utils.ts` → DELETE (дубликат `src/shared/components/ui/utils.ts`)

#### 🟡 УМЕРЕННОЕ: Lazy Loading обертки

**Проблема:** Множественные lazy loading паттерны:
```typescript
// src/shared/components/ui/lazy/LazyComponents.tsx
export const LazyCounter = (props: any) => (
  <Suspense fallback={<UILoadingFallback className="h-16" />}>
    <Counter {...props} />
  </Suspense>
);

// src/utils/lazyLoad.ts
export function lazyWithPreload<T extends ComponentType<any>>(...)
```

**Обоснование дублирования:** ДА - разные use cases
- `LazyComponents.tsx` - для UI компонентов с fallback
- `lazyLoad.ts` - для preloading с hover/focus

**Рекомендация:** Оставить как есть, добавить комментарии о различиях

### 1.2 Мертвый код

#### 🔴 УДАЛИТЬ: Backup файлы Edge Functions

**Файлы:**
```
supabase/functions/admin-api/index.ts.backup
supabase/functions/ai-analysis/index.ts.backup
supabase/functions/entries/index.ts.backup
```

**Обоснование:** Backup файлы не должны быть в production, используйте Git для истории

#### 🔴 УДАЛИТЬ: Legacy компоненты

**Файлы:**
```
src/components/MediaLightbox.ts (re-export, использовать прямой импорт)
src/shared/components/SimpleChart.tsx (временная замена recharts, больше не нужна)
```

**Обоснование:** 
- `MediaLightbox.ts` - только re-export, можно импортировать напрямую из `@/features/mobile/media`
- `SimpleChart.tsx` - временная замена, recharts уже работает через LazyCharts

#### 🟡 ПЕРЕМЕСТИТЬ В /old: Устаревшие скрипты

**Файлы:**
```
scripts/fix-react-imports.js (одноразовый скрипт, уже выполнен)
scripts/optimize-react-imports.js (одноразовый скрипт, уже выполнен)
scripts/update-imports.js (одноразовый скрипт, уже выполнен)
scripts/update-imports.ts (дубликат .js версии)
scripts/update-image-imports.js (одноразовый скрипт, уже выполнен)
```

**Обоснование:** Скрипты миграции выполнены, оставить для истории в /old/scripts/

#### 🟢 ОСТАВИТЬ: Полезные скрипты

**Файлы:**
```
scripts/analyze-bundle.js ✅
scripts/check-admin-role.ts ✅
scripts/check-broken-links.sh ✅
scripts/check-docs-ratio.sh ✅
scripts/generate-translation-types.ts ✅
scripts/lighthouse-audit.js ✅
scripts/monitor-query-performance.ts ✅
scripts/optimize-images.js ✅
scripts/weekly-docs-audit.sh ✅
```

**Обоснование:** Активно используются для CI/CD и мониторинга

### 1.3 Кандидаты на перенос в /old

#### Высокий приоритет (P0)
```
src/components/ui/shadcn-io/counter/
src/components/ui/shadcn-io/shimmering-text/
src/components/ui/shadcn-io/magnetic-button/
src/components/ui/shadcn-io/pill/
src/components/ui/utils.ts
src/components/MediaLightbox.ts
src/shared/components/SimpleChart.tsx
```

#### Средний приоритет (P1)
```
scripts/fix-react-imports.js
scripts/optimize-react-imports.js
scripts/update-imports.js
scripts/update-imports.ts
scripts/update-image-imports.js
supabase/functions/*/index.ts.backup
```

#### Низкий приоритет (P2)
```
src/supabase/functions/server/index.tsx (старый монолитный сервер, заменен микросервисами)
deploy_edge_function.sh (устаревший скрипт деплоя, используется Supabase MCP)
```

---

## 2️⃣ Documentation Analysis

### 2.1 Соответствие документации коду

#### ✅ ТОЧНАЯ документация (100% соответствие)

**PWA:**
- `docs/pwa/PWA_MASTER_PLAN_2025.md` - полностью соответствует реализации
- `docs/pwa/PUSH_NOTIFICATIONS_GUIDE.md` - актуальная информация
- `docs/pwa/PWA_COMPONENTS_INTEGRATION_GUIDE.md` - точные примеры кода

**Admin Panel:**
- `docs/admin/ADMIN_PANEL_GAP_ANALYSIS_2025-10-22.md` - актуальный анализ
- `docs/architecture/ROLE_BASED_ACCESS_CONTROL.md` - точное описание RBAC

**i18n:**
- `docs/i18n/I18N_SYSTEM_DOCUMENTATION.md` - полное описание системы
- `docs/i18n/I18N_API_REFERENCE.md` - актуальный API reference

#### ⚠️ ЧАСТИЧНО УСТАРЕВШАЯ документация (70-90% соответствие)

**Architecture:**
- `docs/architecture/MASTER_PLAN.md` - содержит устаревшие планы monorepo (не реализовано)
- `docs/architecture/EDGE_FUNCTIONS_REFACTORING_PLAN.md` - частично реализовано

**Mobile:**
- `docs/mobile/REACT_NATIVE_MIGRATION_PLAN.md` - план миграции, но миграция не начата
- `docs/mobile/REACT_NATIVE_EXPO_RECOMMENDATIONS.md` - рекомендации, но не реализовано

#### 🔴 УСТАРЕВШАЯ документация (< 70% соответствие)

**Changelog:**
- `docs/changelog/archive/` - старые отчеты, можно архивировать

### 2.2 Пробелы в документации

#### 🔴 КРИТИЧЕСКИЕ пробелы

**Отсутствует:**
1. **Edge Functions API Reference** - нет единого документа с описанием всех эндпоинтов
2. **Database Schema Documentation** - нет актуальной схемы БД с описанием таблиц
3. **Error Handling Guide** - нет руководства по обработке ошибок
4. **Testing Strategy** - нет документа о стратегии тестирования

#### 🟡 ЖЕЛАТЕЛЬНЫЕ дополнения

**Нужно добавить:**
1. **Component Library Catalog** - каталог всех UI компонентов с примерами
2. **Performance Benchmarks** - бенчмарки производительности
3. **Security Audit Report** - отчет о безопасности
4. **Deployment Checklist** - чеклист для деплоя

### 2.3 Понимание PWA кабинета

#### Архитектура PWA
```
app/mobile/MobileApp.tsx (главный компонент)
├── features/mobile/auth/ (авторизация)
│   ├── WelcomeScreen
│   ├── OnboardingScreen2-4
│   └── AuthScreenNew
├── features/mobile/home/ (главный экран)
│   ├── AchievementHomeScreen
│   ├── AchievementHeader
│   ├── ChatInputSection
│   └── RecentEntriesFeed
├── features/mobile/history/ (история)
│   └── HistoryScreen
├── features/mobile/achievements/ (достижения)
│   └── AchievementsScreen
├── features/mobile/reports/ (отчеты)
│   └── ReportsScreen
├── features/mobile/settings/ (настройки)
│   └── SettingsScreen
└── features/mobile/media/ (медиа)
    ├── MediaLightbox
    ├── MediaPreview
    ├── VoiceRecordingModal
    └── PermissionGuide
```

#### Основные фичи PWA
1. **Onboarding** (4 экрана): Welcome → Language → Goals → Notifications
2. **Home** (главный экран): Лента достижений + AI карточки + создание записей
3. **History** (история): Поиск, фильтры, редактирование, удаление записей
4. **Achievements** (достижения): Бейджи, стрики, уровни, прогресс
5. **Reports** (отчеты): AI анализ, статистика, графики
6. **Settings** (настройки): Профиль, язык, тема, уведомления, премиум

#### PWA возможности
- ✅ Offline mode (Service Worker)
- ✅ Install prompt (настраиваемый через админ-панель)
- ✅ Push notifications (Web Push API + VAPID)
- ✅ Media upload (фото/видео с компрессией)
- ✅ Voice recording (голосовые заметки)
- ✅ i18n (7 языков: ru/en/es/de/fr/zh/ja)

### 2.4 Понимание Admin кабинета

#### Архитектура Admin
```
app/admin/AdminApp.tsx (главный компонент)
├── features/admin/auth/
│   └── AdminLoginScreen (вход только для super_admin)
└── features/admin/dashboard/
    └── AdminDashboard (6 вкладок)
        ├── Overview (статистика)
        ├── Users (управление пользователями)
        ├── Subscriptions (подписки)
        ├── AI Analytics (AI аналитика)
        ├── PWA (PWA настройки)
        │   ├── Overview
        │   ├── Settings
        │   ├── Push Notifications
        │   ├── Analytics
        │   └── Cache
        └── Settings (настройки системы)
            ├── Translations (переводы)
            ├── Languages (языки)
            └── API Services (API ключи)
```

#### Основные фичи Admin
1. **Overview**: Статистика (users, entries, revenue, PWA installs)
2. **Users**: Управление пользователями (поиск, фильтры, premium toggle)
3. **Subscriptions**: Управление подписками
4. **AI Analytics**: Мониторинг AI usage и costs
5. **PWA**: Настройки PWA (install prompt, push notifications, cache)
6. **Settings**: Системные настройки (переводы, языки, API ключи)

#### Доступы Admin
- **Email:** diary@leadshunter.biz
- **Role:** super_admin
- **URL:** /?view=admin
- **Проверка:** 3 точки контроля (AuthScreenNew, AdminLoginScreen, App.tsx)
- **Автоматический редирект:** user → PWA, super_admin → Admin

---

## 3️⃣ Architecture Compliance

### 3.1 Feature-Sliced Design (FSD)

#### ✅ СООТВЕТСТВУЕТ FSD

**Структура:**
```
src/
├── app/                    # Точки входа ✅
│   ├── mobile/            # PWA (max-w-md) ✅
│   └── admin/             # Admin (full-width) ✅
├── features/              # Фичи по доменам ✅
│   ├── mobile/           # 6 мобильных фич ✅
│   └── admin/            # 5 админ фич ✅
└── shared/               # Общие компоненты ✅
    ├── components/       # 62 компонента ✅
    ├── lib/             # Утилиты ✅
    └── ui/              # 49 shadcn/ui ✅
```

#### ⚠️ LEGACY структура (требует миграции)

**Проблема:**
```
src/
├── components/           # ❌ Legacy, дублирует shared/components
├── utils/               # ❌ Legacy, дублирует shared/lib
└── supabase/            # ❌ Не используется
```

**Рекомендация:** Постепенная миграция в shared/

### 3.2 AI-friendly code

#### ✅ ХОРОШО

**Читаемость:**
- Явные имена переменных: `userData`, `onboardingComplete`, `selectedLanguage`
- Комментарии для сложной логики: `// 🔒 SECURITY: Проверка роли`
- Структурированные файлы: четкое разделение на секции

**TypeScript:**
- Strict mode включен
- Типы для всех props
- Интерфейсы для API responses

#### ⚠️ ТРЕБУЕТ УЛУЧШЕНИЯ

**Магические числа:**
```typescript
// ❌ Плохо
minDuration={5000}
maxWaitSeconds={600}

// ✅ Хорошо
const PRELOADER_MIN_DURATION = 5000;
const SESSION_CHECK_TIMEOUT = 600;
```

**Комментарии:**
- Недостаточно JSDoc для функций
- Мало комментариев в Edge Functions

### 3.3 React Native готовность

#### ✅ 90% ГОТОВО

**Platform Adapters реализованы:**
```typescript
src/shared/lib/platform/
├── detection.ts      # Platform.OS, Platform.select() ✅
├── storage.ts        # AsyncStorage adapter ✅
├── media.ts          # ImagePicker adapter ✅
└── navigation.ts     # Navigation adapter ✅
```

**Универсальные компоненты:**
```typescript
src/shared/components/ui/universal/
├── Button.tsx        # Cross-platform button ✅
├── Select.tsx        # Cross-platform select ✅
├── Switch.tsx        # Cross-platform switch ✅
└── Modal.tsx         # Cross-platform modal ✅
```

#### ⚠️ 10% ТРЕБУЕТ ДОРАБОТКИ

**Web-only зависимости:**
- `motion/react` (framer-motion) - нужна замена на react-native-reanimated
- `recharts` - нужна замена на react-native-chart-kit
- `sonner` (toast) - нужна замена на react-native-toast-message

**Рекомендация:** Создать Platform-specific импорты:
```typescript
// src/shared/lib/animation/index.ts
export const motion = Platform.select({
  web: () => require('motion/react'),
  native: () => require('react-native-reanimated')
})();
```

---

## 4️⃣ Testing & Logs Results

### 4.1 Supabase Security Advisors

#### ⚠️ 6 WARNINGS

**Function Search Path Mutable (6 шт.):**
```
1. public.update_push_subscription_updated_at
2. public.get_users_with_entries_count
3. public.calculate_user_streak
4. public.get_users_with_stats
5. public.update_api_services_updated_at
6. auth_leaked_password_protection (Auth)
```

**Remediation:**
```sql
-- Добавить SET search_path = public, pg_temp;
CREATE OR REPLACE FUNCTION public.calculate_user_streak(...)
RETURNS ...
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
...
$$;
```

**Leaked Password Protection:**
- Включить в Supabase Dashboard: Auth → Password Protection → Enable

### 4.2 Supabase Performance Advisors

#### ⚠️ 21 WARNINGS

**Auth RLS Initialization Plan (12 шт.):**
```
Tables: push_notifications_history, usage, push_subscriptions
Issue: auth.uid() re-evaluated for each row
Fix: Replace auth.uid() with (select auth.uid())
```

**Example fix:**
```sql
-- ❌ Плохо
CREATE POLICY "Users can view their own usage events"
ON usage FOR SELECT
USING (user_id = auth.uid());

-- ✅ Хорошо
CREATE POLICY "Users can view their own usage events"
ON usage FOR SELECT
USING (user_id = (select auth.uid()));
```

**Unused Indexes (7 шт.):**
```
1. idx_usage_user_id
2. idx_push_subscriptions_endpoint
3. idx_push_history_created_at
4. idx_push_history_status
5. idx_push_history_sent_by
6. idx_profiles_last_active
7. idx_profiles_pwa_installed
```

**Рекомендация:** Удалить неиспользуемые индексы после анализа

**Multiple Permissive Policies (2 шт.):**
```
Tables: push_notifications_history, push_subscriptions, usage
Issue: Multiple policies for same role/action
Fix: Объединить в одну policy с OR
```

### 4.3 Консоль браузера

**Требуется проверка через Chrome DevTools MCP:**
- PWA: http://localhost:5173/
- Admin: http://localhost:5173/?view=admin

**Ожидаемые проверки:**
1. Нет ошибок в Console
2. Нет предупреждений о deprecated API
3. Нет 404 для ресурсов
4. Service Worker регистрируется успешно

### 4.4 Edge Functions Logs

**Требуется проверка через Supabase:**
```bash
# Проверить логи каждой функции
supabase functions logs admin-api
supabase functions logs ai-analysis
supabase functions logs auto-translate
supabase functions logs entries
supabase functions logs media
supabase functions logs profiles
supabase functions logs push-sender
```

**Ожидаемые проверки:**
1. Нет ошибок 500
2. Нет timeout errors
3. Нет memory errors
4. Корректные CORS headers

---

## 5️⃣ Recommendations

### 5.1 Реорганизация кодовой базы

#### P0 (Критично, 1-2 дня)

**1. Удалить дублирующиеся UI компоненты**
```bash
rm -rf src/components/ui/shadcn-io/counter
rm -rf src/components/ui/shadcn-io/shimmering-text
rm -rf src/components/ui/shadcn-io/magnetic-button
rm -rf src/components/ui/shadcn-io/pill
rm src/components/ui/utils.ts
```

**2. Удалить backup файлы**
```bash
rm supabase/functions/*/index.ts.backup
```

**3. Удалить мертвый код**
```bash
rm src/components/MediaLightbox.ts
rm src/shared/components/SimpleChart.tsx
```

#### P1 (Важно, 1 неделя)

**4. Переместить legacy скрипты в /old**
```bash
mkdir -p old/scripts/migration
mv scripts/fix-react-imports.js old/scripts/migration/
mv scripts/optimize-react-imports.js old/scripts/migration/
mv scripts/update-imports.* old/scripts/migration/
mv scripts/update-image-imports.js old/scripts/migration/
```

**5. Исправить Supabase Security Warnings**
- Добавить `SET search_path` в 5 функций
- Включить Leaked Password Protection

#### P2 (Желательно, 1 месяц)

**6. Исправить Supabase Performance Warnings**
- Оптимизировать RLS policies (12 шт.)
- Удалить неиспользуемые индексы (7 шт.)
- Объединить duplicate policies (2 шт.)

**7. Миграция legacy кода**
- Переместить `src/components/` → `src/shared/components/`
- Переместить `src/utils/` → `src/shared/lib/`

### 5.2 Улучшение архитектуры для React Native

#### P0 (Критично для миграции)

**1. Platform-specific imports**
```typescript
// src/shared/lib/animation/index.ts
import { Platform } from '@/shared/lib/platform';

export const motion = Platform.select({
  web: () => require('motion/react'),
  native: () => require('react-native-reanimated')
})();
```

**2. Chart library abstraction**
```typescript
// src/shared/lib/charts/index.ts
export const Charts = Platform.select({
  web: () => require('recharts'),
  native: () => require('react-native-chart-kit')
})();
```

#### P1 (Важно для миграции)

**3. Toast abstraction**
```typescript
// src/shared/lib/toast/index.ts
export const toast = Platform.select({
  web: () => require('sonner'),
  native: () => require('react-native-toast-message')
})();
```

### 5.3 Улучшение AI-friendly кода

#### P1 (Важно)

**1. Константы вместо магических чисел**
```typescript
// src/shared/constants/timing.ts
export const TIMING = {
  PRELOADER_MIN_DURATION: 5000,
  SESSION_CHECK_TIMEOUT: 600,
  ANIMATION_DURATION: 300,
} as const;
```

**2. JSDoc для всех публичных функций**
```typescript
/**
 * Checks user session and returns user data
 * @param {string} userId - User ID to check
 * @returns {Promise<UserData>} User data with profile
 * @throws {Error} If session is invalid
 */
export async function checkSession(userId: string): Promise<UserData> {
  // ...
}
```

**3. Комментарии в Edge Functions**
```typescript
// supabase/functions/admin-api/index.ts
/**
 * Admin API Edge Function
 * 
 * Endpoints:
 * - GET /stats - Get system statistics
 * - GET /users - List all users
 * - POST /settings - Update settings
 * 
 * @requires super_admin role
 */
```

### 5.4 Приоритизация задач

#### Матрица Impact vs Effort

```
High Impact, Low Effort (DO FIRST):
├── Удалить дублирующиеся UI компоненты (2 часа)
├── Удалить backup файлы (10 минут)
├── Исправить Security Warnings (4 часа)
└── Добавить константы (2 часа)

High Impact, High Effort (SCHEDULE):
├── Исправить Performance Warnings (2 дня)
├── Миграция legacy кода (1 неделя)
└── Platform-specific imports (3 дня)

Low Impact, Low Effort (FILL IN):
├── Переместить legacy скрипты (30 минут)
├── Добавить JSDoc (1 день)
└── Комментарии в Edge Functions (4 часа)

Low Impact, High Effort (DON'T DO):
└── Полная миграция на React Native (3 месяца)
```

---

## 6️⃣ Action Plan

### Фаза 1: Очистка (1-2 дня)

**День 1:**
- [ ] Удалить дублирующиеся UI компоненты
- [ ] Удалить backup файлы
- [ ] Удалить мертвый код
- [ ] Переместить legacy скрипты в /old

**День 2:**
- [ ] Исправить Security Warnings (5 функций)
- [ ] Включить Leaked Password Protection
- [ ] Добавить константы вместо магических чисел

### Фаза 2: Оптимизация БД (3-5 дней)

**День 3-4:**
- [ ] Оптимизировать RLS policies (12 шт.)
- [ ] Удалить неиспользуемые индексы (7 шт.)
- [ ] Объединить duplicate policies (2 шт.)

**День 5:**
- [ ] Проверить производительность запросов
- [ ] Запустить Supabase Advisors снова
- [ ] Убедиться что все WARN исправлены

### Фаза 3: Документация (1 неделя)

**Неделя 1:**
- [ ] Создать Edge Functions API Reference
- [ ] Создать Database Schema Documentation
- [ ] Создать Error Handling Guide
- [ ] Создать Testing Strategy
- [ ] Создать Component Library Catalog

### Фаза 4: React Native подготовка (2-3 недели)

**Неделя 2:**
- [ ] Platform-specific imports (animation, charts, toast)
- [ ] Тестирование Platform Adapters
- [ ] Создать React Native Migration Checklist

**Неделя 3:**
- [ ] Миграция legacy кода в shared/
- [ ] Добавить JSDoc для всех публичных функций
- [ ] Финальное тестирование

### Фаза 5: Финальная проверка (1 день)

**День финальный:**
- [ ] Запустить все тесты
- [ ] Проверить консоль браузера (PWA + Admin)
- [ ] Проверить Edge Functions logs
- [ ] Запустить Lighthouse audit
- [ ] Создать финальный отчет

---

## 📊 Метрики успеха

### Текущее состояние
- **Дублирующиеся файлы:** 8
- **Backup файлы:** 3
- **Мертвый код:** 7 файлов
- **Security WARN:** 6
- **Performance WARN:** 21
- **Docs ratio:** 27% (92/334)

### Целевое состояние (после аудита)
- **Дублирующиеся файлы:** 0 ✅
- **Backup файлы:** 0 ✅
- **Мертвый код:** 0 ✅
- **Security WARN:** 0 ✅
- **Performance WARN:** < 5 ✅
- **Docs ratio:** < 30% ✅

---

## 🎯 Заключение

Проект UNITY-v2 находится в **хорошем состоянии** с четкой архитектурой FSD и готовностью к масштабированию. Основные проблемы - технический долг (дублирование UI компонентов, legacy код) и оптимизация БД (RLS policies, индексы).

**Приоритет действий:**
1. **P0:** Очистка кодовой базы (1-2 дня)
2. **P1:** Оптимизация БД (3-5 дней)
3. **P2:** Документация (1 неделя)
4. **P3:** React Native подготовка (2-3 недели)

**Ожидаемый результат:** Чистая кодовая база, оптимизированная БД, полная документация, готовность к React Native миграции.

---

## 📚 Приложения

### Приложение A: Детальный список файлов для удаления

#### Дублирующиеся UI компоненты
```
src/components/ui/shadcn-io/counter/index.tsx
src/components/ui/shadcn-io/shimmering-text/index.tsx
src/components/ui/shadcn-io/magnetic-button/index.tsx
src/components/ui/shadcn-io/pill/index.tsx
src/components/ui/utils.ts
```

#### Backup файлы
```
supabase/functions/admin-api/index.ts.backup
supabase/functions/ai-analysis/index.ts.backup
supabase/functions/entries/index.ts.backup
```

#### Мертвый код
```
src/components/MediaLightbox.ts
src/shared/components/SimpleChart.tsx
src/supabase/functions/server/index.tsx
deploy_edge_function.sh
```

#### Legacy скрипты (переместить в /old/scripts/migration/)
```
scripts/fix-react-imports.js
scripts/optimize-react-imports.js
scripts/update-imports.js
scripts/update-imports.ts
scripts/update-image-imports.js
```

### Приложение B: Edge Functions Inventory

#### Активные Edge Functions (13 шт.)

**1. admin-api** (v8)
- **Назначение:** Админ API для управления системой
- **Эндпоинты:** /stats, /users, /settings, /system-status
- **Зависимости:** Supabase Admin Client
- **Статус:** ✅ Активно используется

**2. ai-analysis** (v3)
- **Назначение:** AI анализ записей через OpenAI GPT-4
- **Эндпоинты:** /analyze
- **Зависимости:** OpenAI API, admin_settings (openai_api_key)
- **Статус:** ✅ Активно используется

**3. auto-translate** (v2)
- **Назначение:** Автоперевод через OpenAI GPT-4o-mini
- **Эндпоинты:** POST /
- **Зависимости:** OpenAI API, translations таблица
- **Статус:** ✅ Активно используется

**4. entries** (v5)
- **Назначение:** CRUD операции с записями дневника
- **Эндпоинты:** GET /, POST /, PUT /:id, DELETE /:id
- **Зависимости:** entries таблица
- **Статус:** ✅ Активно используется

**5. media** (v6)
- **Назначение:** Загрузка медиафайлов (фото/видео)
- **Эндпоинты:** POST /upload, GET /health
- **Зависимости:** Supabase Storage, media_files таблица
- **Статус:** ✅ Активно используется

**6. motivations** (v1)
- **Назначение:** Мотивационные карточки
- **Эндпоинты:** GET /
- **Зависимости:** motivation_cards таблица
- **Статус:** ✅ Активно используется

**7. profiles** (v4)
- **Назначение:** Управление профилями пользователей
- **Эндпоинты:** GET /, POST /, PUT /
- **Зависимости:** profiles таблица
- **Статус:** ✅ Активно используется

**8. push-sender** (v2)
- **Назначение:** Отправка push уведомлений
- **Эндпоинты:** POST /send, POST /test
- **Зависимости:** push_subscriptions, admin_settings (vapid_keys)
- **Статус:** ✅ Активно используется

**9. stats** (v1)
- **Назначение:** Статистика пользователя
- **Эндпоинты:** GET /
- **Зависимости:** entries таблица
- **Статус:** ✅ Активно используется

**10. telegram-auth** (v1)
- **Назначение:** Авторизация через Telegram
- **Эндпоинты:** POST /
- **Зависимости:** profiles таблица
- **Статус:** ⚠️ Частично используется (только для Telegram Login)

**11. transcription-api** (v1)
- **Назначение:** Транскрипция голосовых заметок
- **Эндпоинты:** POST /transcribe
- **Зависимости:** OpenAI Whisper API
- **Статус:** ⚠️ Не используется (функция не реализована в UI)

**12. translations-api** (v1)
- **Назначение:** API для переводов
- **Эндпоинты:** GET /, POST /
- **Зависимости:** translations таблица
- **Статус:** ✅ Активно используется

**13. translations-management** (v1)
- **Назначение:** Управление переводами (админ)
- **Эндпоинты:** POST /
- **Зависимости:** translations таблица
- **Статус:** ✅ Активно используется

#### Неактивные Edge Functions

**make-server-9729c493** (устаревший монолит)
- **Статус:** ❌ Заменен микросервисами
- **Рекомендация:** Удалить или переместить в /old

### Приложение C: Database Schema Overview

#### Основные таблицы (15 шт.)

**1. profiles** - Профили пользователей
```sql
Columns: id, email, name, role, language, theme, created_at, last_active, pwa_installed
Indexes: idx_profiles_telegram_id, idx_profiles_theme, idx_profiles_last_active, idx_profiles_pwa_installed
RLS: Enabled
```

**2. entries** - Записи дневника
```sql
Columns: id, user_id, text, sentiment, category, mood, media, ai_reply, created_at
Indexes: idx_entries_user_id, idx_entries_created_at
RLS: Enabled
```

**3. media_files** - Медиафайлы
```sql
Columns: id, user_id, entry_id, file_path, file_type, file_size, created_at
Indexes: idx_media_files_user_id, idx_media_files_entry_id
RLS: Enabled
Foreign Keys: user_id → profiles.id, entry_id → entries.id
```

**4. translations** - Переводы
```sql
Columns: id, translation_key, lang_code, translation_value, created_at
Indexes: idx_translations_key_lang
RLS: Enabled
```

**5. translation_keys** - Ключи переводов
```sql
Columns: id, key, description, created_at
Indexes: idx_translation_keys_key
RLS: Enabled
```

**6. languages** - Языки
```sql
Columns: id, code, name, native_name, is_active, created_at
Indexes: idx_languages_active
RLS: Enabled
```

**7. admin_settings** - Настройки админа
```sql
Columns: id, key, value, description, created_at
Indexes: idx_admin_settings_key
RLS: Enabled (только super_admin)
```

**8. push_subscriptions** - Push подписки
```sql
Columns: id, user_id, endpoint, p256dh, auth, created_at
Indexes: idx_push_subscriptions_endpoint
RLS: Enabled
```

**9. push_notifications_history** - История push уведомлений
```sql
Columns: id, user_id, title, body, status, sent_by, created_at
Indexes: idx_push_history_created_at, idx_push_history_status, idx_push_history_sent_by
RLS: Enabled
```

**10. usage** - Логи использования
```sql
Columns: id, user_id, operation_type, metadata, created_at
Indexes: idx_usage_user_id, idx_usage_operation_type
RLS: Enabled
```

**11. openai_usage** - Логи OpenAI
```sql
Columns: id, user_id, operation_type, model, prompt_tokens, completion_tokens, total_tokens, estimated_cost, created_at
Indexes: idx_openai_usage_user_id, idx_openai_usage_created_at
RLS: Enabled
```

**12. motivation_cards** - Мотивационные карточки
```sql
Columns: id, user_id, title, description, category, is_read, created_at
Indexes: idx_motivation_cards_user_id
RLS: Enabled
```

**13. achievements** - Достижения
```sql
Columns: id, user_id, achievement_type, earned_at
Indexes: idx_achievements_user_id
RLS: Enabled
```

**14. api_services** - API сервисы
```sql
Columns: id, service_name, api_key, is_active, created_at
Indexes: idx_api_services_service_name
RLS: Enabled (только super_admin)
```

**15. pwa_analytics** - PWA аналитика
```sql
Columns: id, user_id, event_type, metadata, created_at
Indexes: idx_pwa_analytics_user_id, idx_pwa_analytics_event_type
RLS: Enabled
```

#### Database Functions (4 шт.)

**1. calculate_user_streak(user_id UUID)**
- **Назначение:** Вычисление streak пользователя
- **Возвращает:** INTEGER
- **Статус:** ⚠️ Требует SET search_path

**2. get_users_with_stats()**
- **Назначение:** Получение пользователей со статистикой
- **Возвращает:** TABLE
- **Статус:** ⚠️ Требует SET search_path

**3. get_users_with_entries_count()**
- **Назначение:** Получение пользователей с количеством записей
- **Возвращает:** TABLE
- **Статус:** ⚠️ Требует SET search_path

**4. update_push_subscription_updated_at()**
- **Назначение:** Обновление updated_at для push_subscriptions
- **Возвращает:** TRIGGER
- **Статус:** ⚠️ Требует SET search_path

### Приложение D: Performance Optimization Checklist

#### Frontend Optimization

**✅ Реализовано:**
- [x] Code splitting (17 manual chunks)
- [x] Lazy loading (React.lazy для всех экранов)
- [x] Image optimization (WebP с PNG fallback)
- [x] CSS code splitting
- [x] Tree shaking
- [x] Minification
- [x] Gzip compression

**⚠️ Требует проверки:**
- [ ] Bundle size < 500KB (проверить через analyze-bundle.js)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Lighthouse Score > 90

#### Backend Optimization

**✅ Реализовано:**
- [x] Database indexes (7 активных)
- [x] RLS policies
- [x] Edge Functions (микросервисная архитектура)
- [x] Connection pooling

**⚠️ Требует оптимизации:**
- [ ] RLS policies (12 шт. с auth.uid() re-evaluation)
- [ ] Unused indexes (7 шт.)
- [ ] Multiple permissive policies (2 шт.)
- [ ] N+1 queries (проверить через monitor-query-performance.ts)

#### Caching Strategy

**✅ Реализовано:**
- [x] Service Worker (offline caching)
- [x] Translation cache (localStorage)
- [x] PWA assets cache

**❌ Не реализовано:**
- [ ] API response caching
- [ ] Database query caching
- [ ] CDN для статических ресурсов

### Приложение E: Security Checklist

#### Authentication & Authorization

**✅ Реализовано:**
- [x] Supabase Auth (email/password, Google, Facebook, Apple, Telegram)
- [x] RBAC (user/super_admin)
- [x] 3 точки контроля доступа
- [x] Автоматический редирект при неправильной роли
- [x] Session management

**⚠️ Требует улучшения:**
- [ ] Leaked Password Protection (включить в Supabase)
- [ ] 2FA для super_admin
- [ ] Rate limiting для API
- [ ] CSRF protection

#### Data Protection

**✅ Реализовано:**
- [x] RLS на всех таблицах
- [x] HTTPS only
- [x] Secure cookies
- [x] Environment variables для секретов

**⚠️ Требует проверки:**
- [ ] SQL injection protection (проверить все raw queries)
- [ ] XSS protection (проверить все user inputs)
- [ ] CORS настройки (проверить все Edge Functions)

#### API Security

**✅ Реализовано:**
- [x] JWT authentication
- [x] API key для OpenAI в admin_settings
- [x] VAPID keys для push notifications

**⚠️ Требует улучшения:**
- [ ] API rate limiting
- [ ] Request validation
- [ ] Error messages (не раскрывать внутренние детали)

### Приложение F: React Native Migration Roadmap

#### Phase 1: Preparation (2 weeks)

**Week 1: Platform Adapters**
- [x] Platform detection (Platform.OS, Platform.select)
- [x] Storage adapter (AsyncStorage)
- [x] Media adapter (ImagePicker)
- [x] Navigation adapter
- [ ] Animation adapter (motion → reanimated)
- [ ] Chart adapter (recharts → react-native-chart-kit)
- [ ] Toast adapter (sonner → react-native-toast-message)

**Week 2: Universal Components**
- [x] Button
- [x] Select
- [x] Switch
- [x] Modal
- [ ] Input
- [ ] Card
- [ ] Avatar
- [ ] Badge

#### Phase 2: Setup (1 week)

**Week 3: Expo Setup**
```bash
npx create-expo-app unity-mobile --template blank-typescript
cd unity-mobile
npx expo install expo-router expo-image-picker expo-notifications
```

**Dependencies:**
```json
{
  "@react-navigation/native": "^6.x",
  "react-native-reanimated": "^3.x",
  "react-native-chart-kit": "^6.x",
  "react-native-toast-message": "^2.x",
  "@supabase/supabase-js": "^2.x",
  "expo-secure-store": "^12.x"
}
```

#### Phase 3: Migration (4-6 weeks)

**Week 4-5: Core Features**
- [ ] Auth screens (Welcome, Onboarding, Login)
- [ ] Home screen (Achievement feed)
- [ ] Entry creation (text, media, voice)

**Week 6-7: Secondary Features**
- [ ] History screen
- [ ] Achievements screen
- [ ] Reports screen
- [ ] Settings screen

**Week 8-9: Testing & Polish**
- [ ] E2E tests
- [ ] Performance optimization
- [ ] UI/UX polish
- [ ] App Store submission

#### Phase 4: Deployment (1 week)

**Week 10: App Stores**
- [ ] iOS App Store submission
- [ ] Google Play Store submission
- [ ] Beta testing (TestFlight, Google Play Beta)

---

**Дата создания:** 2025-10-23
**Автор:** AI Assistant (Augment Agent)
**Версия:** 1.0

