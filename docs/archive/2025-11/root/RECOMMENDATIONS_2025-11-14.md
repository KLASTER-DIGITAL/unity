# Рекомендации по улучшению UNITY-v2

**Дата**: 2025-11-14  
**Версия**: 2.0.1  
**Цель**: Масштабирование до 100,000 пользователей + React Native готовность

---

## 🎯 Приоритеты

### P0 - КРИТИЧНО (выполнить в течение 1 недели)

#### 1. Rate Limiting для Push Notifications
**Проблема**: Отсутствие rate limiting может привести к спаму и перегрузке при 100K пользователей

**Решение**:
```typescript
// supabase/functions/push-campaign-sender/index.ts
const RATE_LIMITS = {
  MAX_PUSH_PER_HOUR: 100,  // Максимум 100 push/час на пользователя
  MAX_PUSH_PER_DAY: 500,   // Максимум 500 push/день на пользователя
};

async function checkRateLimit(userId: string): Promise<boolean> {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const { count } = await supabase
    .from('push_history')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', hourAgo.toISOString());
  
  return count < RATE_LIMITS.MAX_PUSH_PER_HOUR;
}
```

**Оценка**: 2-3 часа  
**Impact**: Предотвращение спама, оптимизация для 100K пользователей

---

#### 2. Sentry мониторинг delivery rate
**Проблема**: Нет мониторинга успешности доставки push уведомлений

**Решение**:
```typescript
// src/shared/lib/performance/sentry-integration.ts
import * as Sentry from '@sentry/react';

export function trackPushDelivery(status: 'sent' | 'delivered' | 'failed', metadata: any) {
  Sentry.metrics.increment('push_notifications', 1, {
    tags: { status, ...metadata },
  });
}

// В push-campaign-sender Edge Function
trackPushDelivery('sent', { campaign_id, user_count });
```

**Оценка**: 1-2 часа  
**Impact**: Visibility в успешность доставки, быстрое обнаружение проблем

---

### P1 - ВАЖНО (выполнить в течение 2 недель)

#### 3. IndexedDB кэширование AI Insights карточек
**Проблема**: Карточки загружаются каждый раз при открытии приложения

**Решение**:
```typescript
// src/shared/lib/storage/indexedDB.ts
import { openDB } from 'idb';

const DB_NAME = 'unity_cache';
const STORE_NAME = 'motivation_cards';

export async function cacheMotivationCards(userId: string, cards: any[]) {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
  await db.put(STORE_NAME, { cards, timestamp: Date.now() }, userId);
}

export async function getCachedMotivationCards(userId: string, maxAge = 3600000) {
  const db = await openDB(DB_NAME, 1);
  const cached = await db.get(STORE_NAME, userId);
  
  if (!cached || Date.now() - cached.timestamp > maxAge) {
    return null;
  }
  
  return cached.cards;
}
```

**Оценка**: 3-4 часа  
**Impact**: Offline support, улучшение производительности, меньше API запросов

---

#### 4. Pagination для истории записей
**Проблема**: `getEntries(userId, limit = 50)` загружает только 50 записей, нет пагинации

**Решение**:
```typescript
// src/shared/lib/api/services/entries.ts
export async function getEntriesPaginated(
  userId: string,
  page = 1,
  pageSize = 20
): Promise<{ entries: DiaryEntry[]; hasMore: boolean; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  const { data, error, count } = await supabase
    .from('entries')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);
  
  return {
    entries: data || [],
    hasMore: (count || 0) > to + 1,
    total: count || 0,
  };
}
```

**Оценка**: 2-3 часа  
**Impact**: Оптимизация для пользователей с большим количеством записей (>1000)

---

### P2 - СРЕДНИЙ ПРИОРИТЕТ (выполнить в течение 1 месяца)

#### 5. Universal Components .native.tsx версии
**Проблема**: Universal Components НЕ имеют .native.tsx версий, блокирует React Native миграцию

**Компоненты требующие адаптации**:
- UniversalToast (Radix Toast → React Native Toast)
- UniversalDialog (Radix Dialog → React Native Modal)
- UniversalSelect (Radix Select → React Native Picker)
- UniversalSwitch (Radix Switch → React Native Switch)
- UniversalCheckbox (Radix Checkbox → React Native Checkbox)
- UniversalRadioGroup (Radix RadioGroup → React Native RadioButton)

**Решение**:
```typescript
// src/shared/components/ui/universal/Toast.native.tsx
import { ToastAndroid, Platform, Alert } from 'react-native';

export function UniversalToast({ title, description, variant }: ToastProps) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(`${title}: ${description}`, ToastAndroid.SHORT);
  } else {
    Alert.alert(title, description);
  }
}
```

**Оценка**: 8-10 часов (все компоненты)  
**Impact**: КРИТИЧНО для React Native миграции (Q3 2025)

---

#### 6. i18n Platform Adapter для React Native
**Проблема**: i18n система НЕ адаптирована для React Native

**Решение**:
```typescript
// src/shared/lib/platform/i18n/i18n.native.ts
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getCurrentLanguage(): Promise<string> {
  // 1. Проверить сохраненный язык
  const saved = await AsyncStorage.getItem('unity_language');
  if (saved) return saved;
  
  // 2. Автоопределение через expo-localization
  const deviceLanguage = Localization.locale.split('-')[0];
  return deviceLanguage;
}

export async function cacheTranslations(language: string, translations: any) {
  await AsyncStorage.setItem(`unity_translations_${language}`, JSON.stringify(translations));
}
```

**Оценка**: 4-5 часов
**Impact**: КРИТИЧНО для React Native миграции, offline support

---

## 📊 Масштабирование БД (100K пользователей)

### Текущее состояние
- ✅ 45 индексов созданы
- ✅ N+1 проблемы исправлены (admin-api, translations-management)
- ✅ RLS policies оптимизированы (28 политик, 0 warnings)
- ❌ Партиционирование НЕ настроено
- ❌ Архивация старых данных НЕ настроена
- ❌ Мониторинг метрик НЕ настроен

### Рекомендации

#### 7. Партиционирование таблицы entries (P1)
**Когда**: При достижении 1M записей (~10K пользователей)

**Решение**:
```sql
-- Партиционирование по месяцам
CREATE TABLE entries_partitioned (
  LIKE entries INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE entries_2025_01 PARTITION OF entries_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE entries_2025_02 PARTITION OF entries_partitioned
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

**Оценка**: 2-3 часа
**Impact**: Улучшение производительности запросов на 50-70%

---

#### 8. Архивация старых данных (P1)
**Проблема**: Старые записи (>2 года) замедляют запросы

**Решение**:
```sql
-- Создать архивную таблицу
CREATE TABLE entries_archive (LIKE entries INCLUDING ALL);

-- Переместить старые записи (cron job раз в месяц)
INSERT INTO entries_archive
SELECT * FROM entries
WHERE created_at < NOW() - INTERVAL '2 years';

DELETE FROM entries
WHERE created_at < NOW() - INTERVAL '2 years';
```

**Оценка**: 1-2 часа
**Impact**: Уменьшение размера БД, улучшение производительности

---

#### 9. Мониторинг метрик БД (P0)
**Проблема**: Нет visibility в производительность БД

**Решение**:
```sql
-- Создать view для мониторинга
CREATE VIEW db_health_metrics AS
SELECT
  -- Database size
  pg_size_pretty(pg_database_size(current_database())) as db_size,

  -- Active connections
  (SELECT count(*) FROM pg_stat_activity) as active_connections,

  -- Index hit ratio
  (SELECT sum(idx_blks_hit) / nullif(sum(idx_blks_hit + idx_blks_read), 0) * 100
   FROM pg_statio_user_indexes) as index_hit_ratio,

  -- Slow queries (>500ms)
  (SELECT count(*) FROM pg_stat_statements WHERE mean_exec_time > 500) as slow_queries;
```

**Интеграция с Sentry**:
```typescript
// Cron job каждый час
const metrics = await supabase.rpc('get_db_health_metrics');
Sentry.metrics.gauge('db_size_mb', metrics.db_size);
Sentry.metrics.gauge('active_connections', metrics.active_connections);
Sentry.metrics.gauge('index_hit_ratio', metrics.index_hit_ratio);
```

**Оценка**: 2-3 часа
**Impact**: Раннее обнаружение проблем, proactive optimization

---

## 🚀 React Native готовность

### Текущее состояние
- ✅ Platform Adapters созданы (animation, storage, media, navigation, i18n)
- ✅ Dual-platform development workflow настроен
- ✅ DesignTokens для идентичного дизайна
- ❌ Universal Components НЕ имеют .native.tsx версий
- ❌ i18n Platform Adapter НЕ адаптирован для RN
- ❌ Некоторые компоненты используют Radix UI напрямую

### Блокеры миграции

#### 10. Аудит использования Radix UI (P1)
**Проблема**: Некоторые компоненты используют Radix UI напрямую

**Решение**:
```bash
# Найти все прямые импорты Radix UI
grep -r "from '@radix-ui" src/ --include="*.tsx" --include="*.ts"

# Заменить на Universal Components
# Пример: Dialog → UniversalDialog
```

**Оценка**: 4-5 часов
**Impact**: Предотвращение технического долга при миграции

---

#### 11. Mobile Config админ-панель (P1)
**Проблема**: Нет UI для управления React Native настройками

**Решение**:
```typescript
// src/features/admin/mobile/components/MobileConfigManager.tsx
export function MobileConfigManager() {
  return (
    <Tabs defaultValue="splash">
      <TabsList>
        <TabsTrigger value="splash">Splash Screen</TabsTrigger>
        <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
        <TabsTrigger value="auth">Auth</TabsTrigger>
        <TabsTrigger value="theme">Theme</TabsTrigger>
        <TabsTrigger value="i18n">i18n</TabsTrigger>
      </TabsList>

      <TabsContent value="splash">
        <SplashScreenSettings />
      </TabsContent>
      {/* ... */}
    </Tabs>
  );
}
```

**Оценка**: 3-4 часа
**Impact**: Централизованное управление RN настройками, OTA updates

---

## 📈 Performance оптимизации

### Текущее состояние
- ✅ Lazy loading реализовано (7 компонентов)
- ✅ Code splitting для vendor chunks
- ✅ API optimization (3→1 requests HomeScreen)
- ❌ Main chunk все еще 1.5MB (цель: <1MB)
- ❌ Нет CDN для статических ресурсов
- ❌ Нет Service Worker precaching стратегии

### Рекомендации

#### 12. Дальнейшая оптимизация main chunk (P2)
**Проблема**: Main chunk 1,524.80 KB (505.18 KB gzipped)

**Решение**:
```bash
# Анализ bundle
ANALYZE=true npm run build

# Найти большие зависимости
npx vite-bundle-visualizer

# Возможные оптимизации:
# 1. Tree-shaking для Tailwind CSS (удалить неиспользуемые классы)
# 2. Lazy load Lottie animations
# 3. Lazy load Chart.js (уже сделано)
# 4. Заменить moment.js на date-fns (если используется)
```

**Оценка**: 3-4 часа
**Impact**: Улучшение FCP/LCP на 20-30%

---

#### 13. CDN для статических ресурсов (P2)
**Проблема**: Изображения загружаются с Vercel (медленно для пользователей из других регионов)

**Решение**:
```typescript
// Использовать Vercel Edge Network (автоматически)
// Или настроить Cloudflare CDN

// vite.config.ts
export default defineConfig({
  build: {
    assetsInlineLimit: 4096, // Inline small assets
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
```

**Оценка**: 1-2 часа
**Impact**: Улучшение загрузки для пользователей из разных регионов

---

## 🔒 Security улучшения

### Текущее состояние
- ✅ RLS policies настроены
- ✅ DeleteAllDataDialog с multi-level protection
- ❌ Нет rate limiting для admin login
- ❌ Нет 2FA для super_admin
- ❌ Нет CSRF protection

### Рекомендации

#### 14. Rate Limiting для Admin Login (P0 - ОТЛОЖЕНО)
**Статус**: Отложено до достижения 10K пользователей

**Причина**: Текущий риск низкий (только 1 super_admin)

---

#### 15. 2FA для super_admin (P0 - ОТЛОЖЕНО)
**Статус**: Отложено до достижения 10K пользователей

**Причина**: Текущий риск низкий, можно использовать сильный пароль

---

## 📝 Итоговый план действий

### Неделя 1 (P0 - КРИТИЧНО)
1. ✅ Rate Limiting для Push Notifications (2-3ч)
2. ✅ Sentry мониторинг delivery rate (1-2ч)
3. ✅ Мониторинг метрик БД (2-3ч)

**Общее время**: 5-8 часов

### Неделя 2-3 (P1 - ВАЖНО)
4. ✅ IndexedDB кэширование карточек (3-4ч)
5. ✅ Pagination для истории (2-3ч)
6. ✅ Партиционирование entries (2-3ч)
7. ✅ Архивация старых данных (1-2ч)
8. ✅ Аудит Radix UI (4-5ч)
9. ✅ Mobile Config админ-панель (3-4ч)

**Общее время**: 15-21 час

### Месяц 1 (P2 - СРЕДНИЙ)
10. ✅ Universal Components .native.tsx (8-10ч)
11. ✅ i18n Platform Adapter RN (4-5ч)
12. ✅ Main chunk оптимизация (3-4ч)
13. ✅ CDN для статических ресурсов (1-2ч)

**Общее время**: 16-21 час

---

## 🎯 Ожидаемые результаты

### Производительность
- FCP: 1500ms → 900ms (-40%)
- LCP: 2000ms → 1200ms (-40%)
- Bundle size: 1.5MB → <1MB (-33%)
- API requests: оптимизированы (кэширование + pagination)

### Масштабирование
- Готовность к 100K пользователей
- Мониторинг метрик БД
- Rate limiting для предотвращения спама
- Партиционирование для больших таблиц

### React Native готовность
- 100% Universal Components с .native.tsx
- i18n Platform Adapter для RN
- Mobile Config админ-панель
- 0 блокеров для миграции

---

**Автор**: UNITY Team
**Дата**: 2025-11-14
**Версия**: 1.0

