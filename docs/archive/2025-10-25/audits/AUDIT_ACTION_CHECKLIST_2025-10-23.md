# ✅ Action Checklist: Комплексный аудит UNITY-v2

**Дата:** 2025-10-23  
**Связанные документы:**
- [COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md](COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md) - Полный отчет
- [AUDIT_EXECUTIVE_SUMMARY_2025-10-23.md](AUDIT_EXECUTIVE_SUMMARY_2025-10-23.md) - Краткая сводка
- [AUDIT_VISUAL_GUIDE_2025-10-23.md](AUDIT_VISUAL_GUIDE_2025-10-23.md) - Визуальное руководство

---

## 📋 Фаза 1: Очистка кодовой базы (1-2 дня)

### День 1: Удаление дублирующихся файлов

#### 1.1 Удалить дублирующиеся UI компоненты
```bash
# Проверить что компоненты действительно дублируются
diff src/components/ui/shadcn-io/counter/index.tsx src/shared/components/ui/shadcn-io/counter/index.tsx
diff src/components/ui/shadcn-io/shimmering-text/index.tsx src/shared/components/ui/shadcn-io/shimmering-text/index.tsx
diff src/components/ui/shadcn-io/magnetic-button/index.tsx src/shared/components/ui/shadcn-io/magnetic-button/index.tsx
diff src/components/ui/shadcn-io/pill/index.tsx src/shared/components/ui/shadcn-io/pill/index.tsx
diff src/components/ui/utils.ts src/shared/components/ui/utils.ts

# Удалить дубликаты
rm -rf src/components/ui/shadcn-io/counter
rm -rf src/components/ui/shadcn-io/shimmering-text
rm -rf src/components/ui/shadcn-io/magnetic-button
rm -rf src/components/ui/shadcn-io/pill
rm src/components/ui/utils.ts

# Проверить что ничего не сломалось
npm run build
npm run dev
```

- [ ] Проверить дублирование через diff
- [ ] Удалить дублирующиеся файлы
- [ ] Запустить сборку (npm run build)
- [ ] Проверить PWA в браузере
- [ ] Проверить Admin панель
- [ ] Закоммитить изменения

#### 1.2 Удалить backup файлы
```bash
# Проверить что backup файлы не используются
grep -r "index.ts.backup" src/
grep -r "index.ts.backup" supabase/

# Удалить backup файлы
rm supabase/functions/admin-api/index.ts.backup
rm supabase/functions/ai-analysis/index.ts.backup
rm supabase/functions/entries/index.ts.backup

# Проверить Edge Functions
# (через Supabase Dashboard или CLI)
```

- [ ] Проверить что backup не используются
- [ ] Удалить backup файлы
- [ ] Проверить Edge Functions в Supabase
- [ ] Закоммитить изменения

#### 1.3 Удалить мертвый код
```bash
# Проверить что файлы не используются
grep -r "MediaLightbox.ts" src/
grep -r "SimpleChart" src/

# Удалить мертвый код
rm src/components/MediaLightbox.ts
rm src/shared/components/SimpleChart.tsx

# Проверить что ничего не сломалось
npm run build
```

- [ ] Проверить что файлы не используются
- [ ] Удалить мертвый код
- [ ] Запустить сборку
- [ ] Закоммитить изменения

### День 2: Перемещение legacy кода

#### 1.4 Переместить legacy скрипты
```bash
# Создать папку для миграционных скриптов
mkdir -p old/scripts/migration

# Переместить legacy скрипты
mv scripts/fix-react-imports.js old/scripts/migration/
mv scripts/optimize-react-imports.js old/scripts/migration/
mv scripts/update-imports.js old/scripts/migration/
mv scripts/update-imports.ts old/scripts/migration/
mv scripts/update-image-imports.js old/scripts/migration/

# Обновить README в old/scripts/migration/
cat > old/scripts/migration/README.md << 'EOF'
# Migration Scripts Archive

Эти скрипты были использованы для одноразовой миграции кода.
Они больше не нужны, но сохранены для истории.

## Скрипты:
- fix-react-imports.js - Исправление React импортов
- optimize-react-imports.js - Оптимизация React импортов
- update-imports.js - Обновление импортов
- update-image-imports.js - Обновление импортов изображений

**Дата архивации:** 2025-10-23
EOF
```

- [ ] Создать папку old/scripts/migration/
- [ ] Переместить legacy скрипты
- [ ] Создать README.md в old/scripts/migration/
- [ ] Закоммитить изменения

#### 1.5 Добавить константы вместо магических чисел
```bash
# Создать файл с константами
cat > src/shared/constants/timing.ts << 'EOF'
/**
 * Timing constants for UNITY-v2
 * 
 * Используйте эти константы вместо магических чисел
 */

export const TIMING = {
  // Preloader
  PRELOADER_MIN_DURATION: 5000, // 5 секунд
  
  // Session
  SESSION_CHECK_TIMEOUT: 600, // 10 минут
  
  // Animations
  ANIMATION_DURATION: 300, // 300ms
  ANIMATION_DURATION_SLOW: 500, // 500ms
  ANIMATION_DURATION_FAST: 150, // 150ms
  
  // Debounce
  DEBOUNCE_SEARCH: 300, // 300ms
  DEBOUNCE_INPUT: 500, // 500ms
  
  // Polling
  POLL_INTERVAL: 5000, // 5 секунд
  POLL_INTERVAL_FAST: 1000, // 1 секунда
} as const;

export type TimingKey = keyof typeof TIMING;
EOF
```

- [ ] Создать src/shared/constants/timing.ts
- [ ] Заменить магические числа на константы в App.tsx
- [ ] Заменить магические числа в других файлах
- [ ] Закоммитить изменения

---

## 🔐 Фаза 2: Безопасность БД (3-5 дней)

### День 3-4: Исправление Security Warnings

#### 2.1 Добавить SET search_path в функции
```sql
-- 1. calculate_user_streak
CREATE OR REPLACE FUNCTION public.calculate_user_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
-- ... existing code ...
$$;

-- 2. get_users_with_stats
CREATE OR REPLACE FUNCTION public.get_users_with_stats()
RETURNS TABLE (...)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
-- ... existing code ...
$$;

-- 3. get_users_with_entries_count
CREATE OR REPLACE FUNCTION public.get_users_with_entries_count()
RETURNS TABLE (...)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
-- ... existing code ...
$$;

-- 4. update_push_subscription_updated_at
CREATE OR REPLACE FUNCTION public.update_push_subscription_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
-- ... existing code ...
$$;

-- 5. update_api_services_updated_at
CREATE OR REPLACE FUNCTION public.update_api_services_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
-- ... existing code ...
$$;
```

- [ ] Создать миграцию fix_function_search_path.sql
- [ ] Добавить SET search_path в 5 функций
- [ ] Применить миграцию через Supabase
- [ ] Запустить Supabase Advisors (security)
- [ ] Проверить что WARN исчезли

#### 2.2 Включить Leaked Password Protection
```
1. Открыть Supabase Dashboard
2. Перейти в Authentication → Policies
3. Найти "Password Protection"
4. Включить "Leaked Password Protection"
5. Сохранить изменения
```

- [ ] Открыть Supabase Dashboard
- [ ] Включить Leaked Password Protection
- [ ] Запустить Supabase Advisors (security)
- [ ] Проверить что WARN исчез

### День 5-6: Оптимизация Performance

#### 2.3 Оптимизировать RLS policies
```sql
-- Пример оптимизации для usage таблицы
-- ❌ Плохо (re-evaluation для каждой строки)
CREATE POLICY "Users can view their own usage events"
ON usage FOR SELECT
USING (user_id = auth.uid());

-- ✅ Хорошо (вычисляется один раз)
CREATE POLICY "Users can view their own usage events"
ON usage FOR SELECT
USING (user_id = (select auth.uid()));

-- Применить для всех 12 policies:
-- 1. push_notifications_history (2 policies)
-- 2. usage (3 policies)
-- 3. push_subscriptions (5 policies)
```

- [ ] Создать миграцию optimize_rls_policies.sql
- [ ] Оптимизировать 12 RLS policies
- [ ] Применить миграцию
- [ ] Запустить Supabase Advisors (performance)
- [ ] Проверить что WARN уменьшились

#### 2.4 Удалить неиспользуемые индексы
```sql
-- Проверить что индексы действительно не используются
-- через Supabase Dashboard → Database → Indexes

-- Удалить неиспользуемые индексы
DROP INDEX IF EXISTS idx_usage_user_id;
DROP INDEX IF EXISTS idx_push_subscriptions_endpoint;
DROP INDEX IF EXISTS idx_push_history_created_at;
DROP INDEX IF EXISTS idx_push_history_status;
DROP INDEX IF EXISTS idx_push_history_sent_by;
DROP INDEX IF EXISTS idx_profiles_last_active;
DROP INDEX IF EXISTS idx_profiles_pwa_installed;
```

- [ ] Проверить использование индексов в Dashboard
- [ ] Создать миграцию remove_unused_indexes.sql
- [ ] Удалить 7 неиспользуемых индексов
- [ ] Применить миграцию
- [ ] Запустить Supabase Advisors (performance)
- [ ] Проверить что WARN уменьшились

#### 2.5 Объединить duplicate policies
```sql
-- Пример объединения для push_subscriptions
-- ❌ Плохо (2 отдельные policies)
CREATE POLICY "Super admins can view all subscriptions" ...
CREATE POLICY "Users can view their own subscriptions" ...

-- ✅ Хорошо (1 объединенная policy)
CREATE POLICY "View subscriptions"
ON push_subscriptions FOR SELECT
USING (
  user_id = (select auth.uid()) OR
  (select role from profiles where id = (select auth.uid())) = 'super_admin'
);
```

- [ ] Создать миграцию merge_duplicate_policies.sql
- [ ] Объединить duplicate policies
- [ ] Применить миграцию
- [ ] Запустить Supabase Advisors (performance)
- [ ] Проверить что WARN исчезли

### День 7: Финальная проверка БД

#### 2.6 Проверить производительность
```bash
# Запустить скрипт мониторинга
npm run monitor:queries

# Проверить медленные запросы в Supabase Dashboard
# Database → Query Performance
```

- [ ] Запустить monitor-query-performance.ts
- [ ] Проверить медленные запросы в Dashboard
- [ ] Оптимизировать медленные запросы (если есть)
- [ ] Запустить Supabase Advisors (security + performance)
- [ ] Убедиться что все WARN исправлены

---

## 📚 Фаза 3: Документация (1 неделя)

### День 8-9: Edge Functions API Reference

#### 3.1 Создать Edge Functions API Reference
```markdown
# Edge Functions API Reference

## admin-api (v8)
### GET /stats
**Описание:** Получить статистику системы
**Требования:** super_admin role
**Response:**
```json
{
  "success": true,
  "totalUsers": 100,
  "activeUsers": 50,
  ...
}
```

... (для всех 13 Edge Functions)
```

- [ ] Создать docs/architecture/EDGE_FUNCTIONS_API_REFERENCE.md
- [ ] Документировать все 13 Edge Functions
- [ ] Добавить примеры запросов/ответов
- [ ] Добавить требования к авторизации
- [ ] Обновить INDEX.md

### День 10-11: Database Schema Documentation

#### 3.2 Создать Database Schema Documentation
```markdown
# Database Schema Documentation

## Таблицы (15 шт.)

### profiles
**Описание:** Профили пользователей
**Columns:**
- id (uuid, PK)
- email (string, unique)
- name (string)
- role (string, default: 'user')
...

**Indexes:**
- idx_profiles_telegram_id
- idx_profiles_theme
...

**RLS Policies:**
- Users can view their own profile
- Super admins can view all profiles
...

... (для всех 15 таблиц)
```

- [ ] Создать docs/architecture/DATABASE_SCHEMA.md
- [ ] Документировать все 15 таблиц
- [ ] Добавить ER диаграмму (Mermaid)
- [ ] Документировать все 4 функции
- [ ] Обновить INDEX.md

### День 12: Error Handling Guide

#### 3.3 Создать Error Handling Guide
```markdown
# Error Handling Guide

## Frontend Error Handling

### Toast Notifications
```typescript
import { toast } from 'sonner';

// Success
toast.success('Запись создана!');

// Error
toast.error('Ошибка создания записи');

// Info
toast.info('Загрузка...');
```

... (все паттерны обработки ошибок)
```

- [ ] Создать docs/guides/ERROR_HANDLING_GUIDE.md
- [ ] Документировать frontend error handling
- [ ] Документировать backend error handling
- [ ] Добавить примеры кода
- [ ] Обновить INDEX.md

### День 13: Testing Strategy

#### 3.4 Создать Testing Strategy
```markdown
# Testing Strategy

## Unit Tests
- Тестирование утилит и хуков
- Coverage: > 80%

## Integration Tests
- Тестирование API endpoints
- Тестирование Edge Functions

## E2E Tests
- Playwright для критических флоу
- PWA: Onboarding → Create Entry → View History
- Admin: Login → Manage Users → Update Settings

... (полная стратегия тестирования)
```

- [ ] Создать docs/testing/TESTING_STRATEGY.md
- [ ] Документировать unit tests
- [ ] Документировать integration tests
- [ ] Документировать E2E tests
- [ ] Обновить INDEX.md

### День 14: Component Library Catalog

#### 3.5 Создать Component Library Catalog
```markdown
# Component Library Catalog

## UI Components (49 шт.)

### Button
**Путь:** `src/shared/components/ui/button.tsx`
**Props:**
- variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
- size: 'default' | 'sm' | 'lg' | 'icon'

**Example:**
```tsx
<Button variant="default" size="lg">
  Click me
</Button>
```

... (для всех 49 компонентов)
```

- [ ] Создать docs/guides/COMPONENT_LIBRARY_CATALOG.md
- [ ] Документировать все 49 UI компонентов
- [ ] Добавить примеры использования
- [ ] Добавить скриншоты (опционально)
- [ ] Обновить INDEX.md

---

## 📱 Фаза 4: React Native подготовка (2-3 недели)

### Неделя 3: Platform-specific imports

#### 4.1 Создать animation adapter
```typescript
// src/shared/lib/animation/index.ts
import { Platform } from '@/shared/lib/platform';

export const motion = Platform.select({
  web: () => require('motion/react'),
  native: () => require('react-native-reanimated')
})();
```

- [ ] Создать src/shared/lib/animation/index.ts
- [ ] Реализовать Platform.select для motion
- [ ] Обновить все импорты motion/react
- [ ] Тестировать на web
- [ ] Подготовить для React Native

#### 4.2 Создать charts adapter
```typescript
// src/shared/lib/charts/index.ts
import { Platform } from '@/shared/lib/platform';

export const Charts = Platform.select({
  web: () => require('recharts'),
  native: () => require('react-native-chart-kit')
})();
```

- [ ] Создать src/shared/lib/charts/index.ts
- [ ] Реализовать Platform.select для charts
- [ ] Обновить все импорты recharts
- [ ] Тестировать на web
- [ ] Подготовить для React Native

#### 4.3 Создать toast adapter
```typescript
// src/shared/lib/toast/index.ts
import { Platform } from '@/shared/lib/platform';

export const toast = Platform.select({
  web: () => require('sonner'),
  native: () => require('react-native-toast-message')
})();
```

- [ ] Создать src/shared/lib/toast/index.ts
- [ ] Реализовать Platform.select для toast
- [ ] Обновить все импорты sonner
- [ ] Тестировать на web
- [ ] Подготовить для React Native

### Неделя 4: Тестирование и миграция

#### 4.4 Тестирование Platform Adapters
- [ ] Тестировать Platform.OS detection
- [ ] Тестировать storage adapter
- [ ] Тестировать media adapter
- [ ] Тестировать navigation adapter
- [ ] Создать тесты для новых adapters

#### 4.5 Миграция legacy кода
- [ ] Переместить src/components/ → src/shared/components/
- [ ] Переместить src/utils/ → src/shared/lib/
- [ ] Обновить все импорты
- [ ] Тестировать PWA
- [ ] Тестировать Admin

#### 4.6 React Native Migration Checklist
- [ ] Создать docs/mobile/REACT_NATIVE_MIGRATION_CHECKLIST.md
- [ ] Список всех зависимостей для замены
- [ ] Список всех компонентов для адаптации
- [ ] План миграции по фичам
- [ ] Обновить INDEX.md

---

## ✅ Фаза 5: Финальная проверка (1 день)

### День финальный: Тестирование и отчет

#### 5.1 Запустить все тесты
```bash
# Unit tests
npm run test

# Build
npm run build

# Lighthouse audit
npm run lighthouse
```

- [ ] Запустить unit tests
- [ ] Запустить build
- [ ] Запустить Lighthouse audit
- [ ] Проверить bundle size
- [ ] Проверить performance metrics

#### 5.2 Проверить консоль браузера
- [ ] Открыть PWA (http://localhost:5173/)
- [ ] Открыть Chrome DevTools → Console
- [ ] Проверить отсутствие ошибок
- [ ] Открыть Admin (http://localhost:5173/?view=admin)
- [ ] Проверить отсутствие ошибок

#### 5.3 Проверить Edge Functions
```bash
# Проверить логи каждой функции
supabase functions logs admin-api --tail
supabase functions logs ai-analysis --tail
supabase functions logs entries --tail
# ... для всех 13 функций
```

- [ ] Проверить логи admin-api
- [ ] Проверить логи ai-analysis
- [ ] Проверить логи всех Edge Functions
- [ ] Убедиться в отсутствии ошибок

#### 5.4 Запустить Supabase Advisors
```bash
# Security
supabase db lint --level security

# Performance
supabase db lint --level performance
```

- [ ] Запустить Security Advisors
- [ ] Убедиться 0 WARN
- [ ] Запустить Performance Advisors
- [ ] Убедиться < 5 WARN

#### 5.5 Создать финальный отчет
- [ ] Обновить метрики в COMPREHENSIVE_CODEBASE_AUDIT_2025-10-23.md
- [ ] Создать AUDIT_COMPLETION_REPORT_2025-10-23.md
- [ ] Обновить BACKLOG.md
- [ ] Обновить CHANGELOG.md
- [ ] Закоммитить все изменения

---

**Дата создания:** 2025-10-23  
**Автор:** AI Assistant (Augment Agent)  
**Версия:** 1.0

