# ⚡ Оптимизация производительности - Детальный план задачи

**Дата обновления**: 2025-01-18
**Версия**: 2.0 (обновлено на основе анализа кодовой базы)
**Статус**: Фаза 1 - Q1 2025
**MCP инструменты**: Chrome DevTools, Supabase

> **Связь с мастер-планом**: Эта задача детализирует **Задачу 2** из [UNITY_MASTER_PLAN_2025.md](../UNITY_MASTER_PLAN_2025.md)

---

## 🎯 Цель задачи

Улучшить производительность PWA приложения на 50% через оптимизацию бандла, code splitting и улучшение Core Web Vitals.

### ✅ Анализ текущего состояния
- **Vite 6.3.5**: Уже настроен (современный сборщик)
- **TypeScript**: Полная типизация (оптимизация на этапе компиляции)
- **Service Worker**: Уже есть (кэширование ресурсов)
- **Tailwind CSS**: JIT компиляция настроена

### ❌ Проблемы (найдены в кодовой базе)
- **vite.config.ts:46**: `manualChunks: undefined` - нет code splitting
- **Большие зависимости**: 49 Radix UI компонентов, recharts только в админке
- **Неоптимизированные импорты**: `import * as React` в нескольких файлах

### Ключевые метрики
- **Размер бандла**: с ~2.5MB до 1.8MB (-30%)
- **Время загрузки**: улучшение на 50%
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Lighthouse Score**: > 90 баллов

---

## 📋 Детальные задачи

### Неделя 1: Code Splitting и Lazy Loading

#### 1.1 Route-based Code Splitting
**Файлы для изменения**:
- `src/App.tsx` - добавить React.lazy для роутов
- `src/app/mobile/MobileApp.tsx` - lazy loading экранов
- `src/app/admin/AdminApp.tsx` - lazy loading админ-панели

**Реализация**:
```typescript
// Пример для App.tsx
const MobileApp = React.lazy(() => import('./app/mobile/MobileApp'));
const AdminApp = React.lazy(() => import('./app/admin/AdminApp'));

// Обернуть в Suspense с loading компонентом
<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route path="/" element={<MobileApp />} />
    <Route path="/admin" element={<AdminApp />} />
  </Routes>
</Suspense>
```

#### 1.2 Component-based Lazy Loading
**Тяжелые компоненты для оптимизации**:
- `src/shared/components/charts/` - графики (recharts)
- `src/features/mobile/media/` - медиа компоненты
- `src/features/admin/analytics/` - аналитика
- `src/shared/components/ui/shadcn-io/` - сложные UI компоненты

**Стратегия**:
- Lazy load компонентов, которые не видны сразу
- Preload критических компонентов при hover/focus
- Использовать React.memo для предотвращения ре-рендеров

### Неделя 2: Bundle Optimization

#### 2.1 Tree Shaking
**Библиотеки для оптимизации**:
- `lucide-react` - импортировать только нужные иконки
- `motion` - использовать только нужные компоненты
- `@radix-ui` - заменить на universal components

**Пример оптимизации**:
```typescript
// ❌ Плохо - импорт всей библиотеки
import * as Icons from 'lucide-react';

// ✅ Хорошо - импорт конкретных иконок
import { Home, Settings, User } from 'lucide-react';
```

#### 2.2 Asset Optimization
**Задачи**:
- Сжать все изображения в `public/` (WebP формат)
- Минифицировать SVG иконки
- Оптимизировать шрифты (subset для нужных символов)
- Добавить preload для критических ресурсов

#### 2.3 Vite Configuration
**Файл**: `vite.config.ts`
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

---

## 🧪 Тестирование

### Performance Testing
1. **Lighthouse CI** - автоматические тесты в GitHub Actions
2. **WebPageTest** - детальный анализ загрузки
3. **Chrome DevTools** - профилирование производительности
4. **Real User Monitoring** - метрики реальных пользователей

### Тестовые сценарии
1. **Холодная загрузка** - первый визит пользователя
2. **Повторная загрузка** - с кэшированными ресурсами
3. **Медленное соединение** - 3G/4G симуляция
4. **Мобильные устройства** - различные разрешения экрана

---

## 📊 Мониторинг

### Метрики для отслеживания
- **Bundle Size** - размер каждого чанка
- **Load Time** - время до First Contentful Paint
- **Core Web Vitals** - LCP, FID, CLS
- **Memory Usage** - потребление памяти
- **Network Requests** - количество и размер запросов

### Инструменты
- **Bundlephobia** - анализ размера зависимостей
- **Webpack Bundle Analyzer** - визуализация бандла
- **Sentry Performance** - мониторинг в production
- **Google Analytics** - Core Web Vitals отчеты

---

## ✅ Критерии готовности

### Definition of Done
- [ ] Bundle size уменьшен на 30%
- [ ] Lighthouse Score > 90 баллов
- [ ] Core Web Vitals в зеленой зоне
- [ ] Все lazy loading компоненты работают
- [ ] Performance CI тесты проходят
- [ ] Документация обновлена

### Риски и митигация
1. **Сломанные lazy imports** → Тщательное тестирование всех роутов
2. **Увеличение сложности** → Документирование всех изменений
3. **Регрессия функциональности** → Полное E2E тестирование

---

## 🔗 Связанные документы

- [UNITY_MASTER_PLAN_2025.md](../UNITY_MASTER_PLAN_2025.md) - общая стратегия
- [REACT_NATIVE_MIGRATION_PLAN.md](../REACT_NATIVE_MIGRATION_PLAN.md) - подготовка к миграции
- [MASTER_PLAN.md](../MASTER_PLAN.md) - техническая архитектура

---

**🎯 Результат**: PWA приложение с производительностью мирового класса, готовое к масштабированию и React Native миграции.
