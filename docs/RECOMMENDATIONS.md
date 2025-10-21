# 🎯 AI Recommendations для UNITY-v2

**Последнее обновление**: 2025-10-21
**Анализ кодовой базы**: Автоматический (еженедельно)
**Статус**: 10 активных рекомендаций (8 код + 2 документация)

> **Цель**: Этот документ содержит рекомендации AI Assistant на основе анализа кодовой базы, архитектуры и best practices.

---

## 🔴 Критические (P0) - Требуют немедленного внимания

### [REC-001] Добавить Error Boundary для всех мобильных экранов
**Приоритет**: 🔴 P0 - Критический
**Категория**: Надежность
**Дата обнаружения**: 2025-10-21
**Влияние**: Высокое (UX, стабильность)

**Проблема**:
- Нет Error Boundary в мобильных экранах (HistoryScreen, AchievementsScreen, ReportsScreen, SettingsScreen)
- При ошибке рендеринга пользователь видит белый экран
- Есть только базовая обработка ошибок в `main.tsx` (vite:preloadError, chunk loading)
- Нет интеграции с Sentry или другими системами логирования

**Текущий код**:
```typescript
// src/main.tsx - только базовая обработка
window.addEventListener('vite:preloadError', (event) => {
  console.error('Vite preload error:', event);
  window.location.reload(); // Грубое решение
});
```

**Рекомендация**:
Добавить Error Boundary wrapper для всех экранов:
```typescript
// src/shared/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // TODO: Отправить в Sentry
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Что-то пошло не так</h2>
            <p className="text-muted-foreground mb-6">
              Произошла ошибка при загрузке экрана. Попробуйте обновить страницу.
            </p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Обновить страницу
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Использование в MobileApp.tsx
<ErrorBoundary>
  <Suspense fallback={<LoadingScreen />}>
    <HistoryScreen userData={userData} />
  </Suspense>
</ErrorBoundary>
```

**Ожидаемый результат**:
- Улучшение UX при ошибках (вместо белого экрана - понятное сообщение)
- Возможность восстановления без перезагрузки приложения
- Логирование ошибок для мониторинга

**Оценка работы**: 4 часа
**Детальный план**: → [docs/plan/tasks/planned/error-boundary-implementation.md]

**Статус**: 📅 Запланировано на Sprint #14

---

### [REC-002] Настроить Sentry для мониторинга ошибок
**Приоритет**: 🔴 P0 - Критический
**Категория**: Мониторинг
**Дата обнаружения**: 2025-10-21
**Влияние**: Высокое (production stability)

**Проблема**:
- Нет системы мониторинга ошибок в production
- Ошибки пользователей не отслеживаются
- Невозможно проактивно находить и исправлять баги
- В `docs/MASTER_PLAN.md` есть пример интеграции Sentry, но не реализовано

**Рекомендация**:
Интегрировать Sentry для отслеживания ошибок:
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
      environment: import.meta.env.MODE,
    });
  }
}

// src/main.tsx
import { initSentry } from '@/shared/lib/monitoring/sentry';
initSentry();

// ErrorBoundary.tsx
componentDidCatch(error: Error, errorInfo: any) {
  Sentry.captureException(error, { contexts: { react: errorInfo } });
}
```

**Ожидаемый результат**:
- Автоматическое отслеживание всех ошибок в production
- Session replay для воспроизведения багов
- Performance monitoring
- Alerts при критических ошибках

**Оценка работы**: 3 часа
**Детальный план**: → [docs/plan/tasks/planned/sentry-integration.md]

**Статус**: 📅 Запланировано на Sprint #14

---

## 🟡 Важные (P1) - Рекомендуется выполнить в ближайшие 2-4 недели

### [REC-003] Оптимизировать recharts через dynamic import
**Приоритет**: 🟡 P1 - Важный
**Категория**: Производительность
**Дата обнаружения**: 2025-10-21
**Влияние**: Среднее (bundle size, load time)

**Проблема**:
- Recharts используется только в админ-панели
- Библиотека загружается в main bundle (~300KB)
- Мобильные пользователи загружают ненужный код
- Уже есть `LazyCharts.tsx`, но не везде используется

**Текущая реализация**:
```typescript
// src/shared/components/ui/charts/LazyCharts.tsx - УЖЕ СОЗДАНО ✅
export const LazyUsageChart = (props: any) => (
  <Suspense fallback={<ChartLoadingFallback />}>
    <UsageChart {...props} />
  </Suspense>
);

// НО: В некоторых местах используется прямой импорт
// src/components/screens/admin/settings/api/UsageChart.tsx
import { LineChart, XAxis, CartesianGrid } from "recharts"; // ❌ Прямой импорт
```

**Рекомендация**:
Заменить все прямые импорты recharts на LazyCharts:
```typescript
// ❌ ПЛОХО - прямой импорт
import { LineChart } from "recharts";

// ✅ ХОРОШО - lazy import
import { LazyLineChart as LineChart } from "@/shared/components/ui/charts/LazyCharts";
```

**Файлы для изменения**:
- `src/components/screens/admin/settings/api/UsageChart.tsx`
- `src/components/screens/admin/settings/api/UsageBreakdown.tsx`
- `src/features/admin/analytics/components/AIAnalyticsTab.tsx`
- `src/shared/components/ui/shadcn-io/bar-chart-01/index.tsx`
- `src/shared/components/ui/shadcn-io/line-chart-01/index.tsx`

**Ожидаемый результат**:
- Main bundle: -300KB (-14%)
- Mobile load time: -20%
- Admin load time: без изменений (lazy load)

**Оценка работы**: 2 часа
**Детальный план**: → [docs/plan/tasks/planned/optimize-recharts-bundle.md]

**Статус**: 📅 Запланировано на Sprint #14

---

### [REC-004] Исправить потенциальные N+1 запросы в admin-api
**Приоритет**: 🟡 P1 - Важный
**Категория**: Производительность
**Дата обнаружения**: 2025-10-21
**Влияние**: Среднее (database load, response time)

**Проблема**:
В `supabase/functions/admin-api/index.ts` есть N+1 запрос при получении списка пользователей:

```typescript
// admin-api/index.ts:164-185
const { data: users } = await supabaseAdmin
  .from('profiles')
  .select('*')
  .order('created_at', { ascending: false });

// N+1 запрос для каждого пользователя!
const usersWithStats = await Promise.all(
  (users || []).map(async (user) => {
    const { count } = await supabaseAdmin
      .from('entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return {
      ...user,
      entriesCount: count || 0
    };
  })
);
```

**Рекомендация**:
Использовать JOIN или агрегацию в одном запросе:
```typescript
// Вариант 1: Использовать Supabase relations
const { data: users } = await supabaseAdmin
  .from('profiles')
  .select(`
    *,
    entries:entries(count)
  `)
  .order('created_at', { ascending: false });

// Вариант 2: Использовать SQL view с агрегацией
// Создать view в миграции:
CREATE VIEW profiles_with_stats AS
SELECT 
  p.*,
  COUNT(e.id) as entries_count
FROM profiles p
LEFT JOIN entries e ON e.user_id = p.id
GROUP BY p.id;

// Использовать в коде:
const { data: users } = await supabaseAdmin
  .from('profiles_with_stats')
  .select('*')
  .order('created_at', { ascending: false });
```

**Ожидаемый результат**:
- Количество запросов: 100+ → 1
- Response time: -80% (для 100 пользователей)
- Database load: -90%

**Оценка работы**: 3 часа
**Детальный план**: → [docs/plan/tasks/planned/fix-admin-n-plus-one.md]

**Статус**: 📅 Запланировано на Sprint #15

---

## 🟢 Желательные (P2) - Можно выполнить в течение 1-2 месяцев

### [REC-005] Добавить TypeScript strict mode
**Приоритет**: 🟢 P2 - Желательный
**Категория**: Качество кода
**Дата обнаружения**: 2025-10-21
**Влияние**: Низкое (долгосрочное качество)

**Проблема**:
- `tsconfig.json` не использует strict mode
- Возможны скрытые баги из-за `any` типов
- Сложнее рефакторить код

**Рекомендация**:
Включить strict mode постепенно:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

**Ожидаемый результат**:
- Меньше runtime ошибок
- Лучшая поддержка IDE
- Проще рефакторинг

**Оценка работы**: 1-2 недели (постепенно)
**Детальный план**: → [docs/plan/tasks/planned/typescript-strict-mode.md]

**Статус**: 💡 Идея

---

### [REC-006] Добавить Web Vitals мониторинг
**Приоритет**: 🟢 P2 - Желательный
**Категория**: Производительность
**Дата обнаружения**: 2025-10-21
**Влияние**: Низкое (мониторинг)

**Проблема**:
- Нет отслеживания Core Web Vitals в production
- Невозможно измерить реальную производительность для пользователей
- В `docs/MASTER_PLAN.md` есть пример, но не реализовано

**Рекомендация**:
Добавить Web Vitals tracking:
```typescript
// src/shared/lib/monitoring/webVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  const sendToAnalytics = (metric: any) => {
    // Отправить в Google Analytics или Sentry
    console.log(metric);
  };

  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}

// src/main.tsx
import { reportWebVitals } from '@/shared/lib/monitoring/webVitals';

if (import.meta.env.PROD) {
  reportWebVitals();
}
```

**Ожидаемый результат**:
- Отслеживание Core Web Vitals в production
- Данные для оптимизации производительности
- Alerts при деградации метрик

**Оценка работы**: 2 часа
**Детальный план**: → [docs/plan/tasks/planned/web-vitals-monitoring.md]

**Статус**: 💡 Идея

---

### [REC-007] Оптимизировать импорты lucide-react
**Приоритет**: 🟢 P2 - Желательный
**Категория**: Производительность
**Дата обнаружения**: 2025-10-21
**Влияние**: Низкое (bundle size)

**Проблема**:
- Lucide-react используется во всех компонентах
- Возможно неоптимальное tree-shaking
- Можно уменьшить bundle size

**Рекомендация**:
Проверить, что используются именованные импорты:
```typescript
// ✅ ХОРОШО - tree-shaking работает
import { Home, Settings, User } from 'lucide-react';

// ❌ ПЛОХО - импорт всей библиотеки
import * as Icons from 'lucide-react';
```

**Ожидаемый результат**:
- Bundle size: -50KB (потенциально)
- Лучшее tree-shaking

**Оценка работы**: 1 час
**Детальный план**: Нет (простая задача)

**Статус**: 💡 Идея

---

### [REC-008] Добавить preload для критических ресурсов
**Приоритет**: 🟢 P2 - Желательный
**Категория**: Производительность
**Дата обнаружения**: 2025-10-21
**Влияние**: Низкое (load time)

**Проблема**:
- Нет preload для критических ресурсов (шрифты, CSS)
- Можно улучшить First Contentful Paint (FCP)

**Рекомендация**:
Добавить preload в `index.html`:
```html
<head>
  <!-- Preload критических ресурсов -->
  <link rel="preload" href="/fonts/sf-pro.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/index.css" as="style">
  
  <!-- Preconnect к внешним сервисам -->
  <link rel="preconnect" href="https://ecuwuzqlwdkkdncampnc.supabase.co">
  <link rel="preconnect" href="https://api.openai.com">
</head>
```

**Ожидаемый результат**:
- FCP: -200ms
- LCP: -300ms
- Лучший Lighthouse Score

**Оценка работы**: 30 минут
**Детальный план**: Нет (простая задача)

**Статус**: 💡 Идея

---

## 📊 Статистика рекомендаций

### По приоритетам
- 🔴 P0 (Критические): 2
- 🟡 P1 (Важные): 4 (+2 документация)
- 🟢 P2 (Желательные): 4

### По категориям
- Надежность: 1
- Мониторинг: 2
- Производительность: 4
- Качество кода: 1
- Документация: 2

### По статусам
- 📅 Запланировано: 6 (+2 документация)
- 💡 Идея: 4

---

## 🔄 Процесс обновления

### Автоматический анализ (еженедельно)
1. AI Assistant анализирует кодовую базу через `codebase-retrieval`
2. Выявляет проблемы и технический долг
3. Приоритизирует рекомендации (P0/P1/P2)
4. Обновляет этот документ

### Ручной review (ежемесячно)
1. Команда review рекомендации
2. Выбирает приоритетные для реализации
3. Создает задачи в BACKLOG.md
4. Архивирует выполненные рекомендации

---

---

## 📚 ДОКУМЕНТАЦИЯ (2 рекомендации)

### [DOC-001] Архивировать завершенные документы
**Приоритет**: 🟡 P1 - Важно
**Категория**: Документация / Структура
**Оценка**: 2 часа
**Статус**: 📅 Запланировано

**Проблема**: 20+ завершенных документов не архивированы, раздувают корневую структуру

**Решение**:
1. Переместить 15 файлов в `docs/archive/completed/2025-10/`
2. Обновить ссылки в INDEX.md, README.md
3. Запустить `check-broken-links.sh`

**Влияние**: Улучшит читаемость, уменьшит documentation ratio с 30% до 24%

**Детали**: → [DOCS_RECOMMENDATIONS_2025-10-21.md](DOCS_RECOMMENDATIONS_2025-10-21.md#rec-001)

---

### [DOC-002] Создать скрипт еженедельного аудита документации
**Приоритет**: 🟡 P1 - Важно
**Категория**: Документация / Автоматизация
**Оценка**: 3 часа
**Статус**: 📅 Запланировано

**Проблема**: Нет автоматизации для регулярной проверки актуальности документации

**Решение**:
1. Создать `scripts/weekly-docs-audit.sh`
2. Проверять documentation ratio, битые ссылки, naming conventions
3. Находить завершенные документы для архивации
4. Создавать отчет

**Влияние**: Автоматизирует поддержание актуальности документации

**Детали**: → [DOCS_RECOMMENDATIONS_2025-10-21.md](DOCS_RECOMMENDATIONS_2025-10-21.md#rec-002)

---

**Автор**: AI Assistant (Augment Agent)
**Дата создания**: 21 октября 2025
**Последнее обновление**: 21 октября 2025

