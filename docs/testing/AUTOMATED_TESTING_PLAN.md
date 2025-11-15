# Automated Testing Plan для UNITY-v2

**Дата**: 2025-11-15  
**Статус**: В разработке  
**Цель**: Автоматизация тестирования для быстрой проверки работы приложения

---

## 🎯 Проблема

**Текущая ситуация**:
- Ручное тестирование через браузер (открыть → F12 → проверить консоль)
- Chrome MCP недоступен (браузер уже запущен)
- Нет автоматических тестов для критических флоу
- Долгое время на проверку каждого изменения

**Требования пользователя**:
> "так же найди решение быстрых тестом с помошь. mcp или unit тестов что бы проверять работу если возможно"

---

## 📋 Варианты решения

### Вариант 1: Unit тесты (Vitest) ✅ РЕКОМЕНДУЕТСЯ

**Преимущества**:
- ✅ Быстрые (миллисекунды)
- ✅ Изолированные (тестируют конкретную логику)
- ✅ Легко интегрируются в CI/CD
- ✅ Уже настроен Vitest в проекте

**Недостатки**:
- ❌ Не тестируют UI взаимодействие
- ❌ Требуют моки для Supabase

**Что тестировать**:
1. **Hooks**:
   - `useHomeScreenData`: проверка realtime subscription
   - `useEntries`: проверка optimistic updates
   - `useMotivationCards`: проверка загрузки карточек

2. **Utilities**:
   - `statsCalculator`: проверка расчета статистики
   - `detectCardType`: проверка определения типа карточки
   - `formatDate`: проверка форматирования дат

3. **API**:
   - `getHomeScreenData`: проверка формата ответа
   - `getMotivationCards`: проверка фильтрации карточек

**Пример теста**:
```typescript
// src/shared/hooks/__tests__/useHomeScreenData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useHomeScreenData } from '../useHomeScreenData';

describe('useHomeScreenData', () => {
  it('should fetch data on mount', async () => {
    const { result } = renderHook(() => useHomeScreenData('user-123'));
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
  });
  
  it('should setup realtime subscription', async () => {
    const mockChannel = vi.fn();
    vi.mock('@/utils/supabase/client', () => ({
      createClient: () => ({
        channel: mockChannel,
      }),
    }));
    
    renderHook(() => useHomeScreenData('user-123'));
    
    expect(mockChannel).toHaveBeenCalledWith('home-screen:user-123');
  });
});
```

---

### Вариант 2: Integration тесты (Playwright) 🔄 СРЕДНИЙ ПРИОРИТЕТ

**Преимущества**:
- ✅ Тестируют реальное взаимодействие с UI
- ✅ Проверяют E2E флоу
- ✅ Могут проверять консоль браузера

**Недостатки**:
- ❌ Медленные (секунды)
- ❌ Требуют запущенный dev server
- ❌ Сложнее настроить

**Что тестировать**:
1. Создание записи через чат
2. Проверка появления карточек
3. Проверка обновления ленты
4. Проверка консоли на ошибки

**Пример теста**:
```typescript
// tests/e2e/home-screen.spec.ts
import { test, expect } from '@playwright/test';

test('should update cards after creating entry', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Войти в систему
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login"]');
  
  // Создать запись
  await page.fill('[data-testid="chat-input"]', 'Test entry');
  await page.click('[data-testid="send-button"]');
  
  // Проверить что карточки обновились БЕЗ перезагрузки
  await expect(page.locator('[data-testid="motivation-card"]')).toBeVisible();
  
  // Проверить консоль на ошибки
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  expect(errors).toHaveLength(0);
});
```

---

### Вариант 3: Snapshot тесты (Vitest) ⏳ НИЗКИЙ ПРИОРИТЕТ

**Преимущества**:
- ✅ Быстрые
- ✅ Проверяют что UI не изменился

**Недостатки**:
- ❌ Не тестируют логику
- ❌ Ломаются при любом изменении UI

---

## 🚀 Рекомендуемый план

### Фаза 1: Unit тесты (1-2 часа)

**Шаг 1**: Настроить Vitest (если еще не настроен)
```bash
npm install -D vitest @testing-library/react @testing-library/react-hooks
```

**Шаг 2**: Создать тесты для критических hooks
- `useHomeScreenData.test.ts`
- `useEntries.test.ts`
- `useMotivationCards.test.ts`

**Шаг 3**: Добавить npm script
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Шаг 4**: Интегрировать в pre-commit hook
```bash
# .husky/pre-commit
npm run test
```

---

### Фаза 2: Integration тесты (2-3 часа)

**Шаг 1**: Установить Playwright
```bash
npm install -D @playwright/test
npx playwright install
```

**Шаг 2**: Создать E2E тесты
- `home-screen.spec.ts` (создание записи, карточки)
- `auth.spec.ts` (вход, выход)
- `settings.spec.ts` (изменение настроек)

**Шаг 3**: Добавить npm script
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## 📊 Метрики успеха

**Цель**:
- ✅ 80%+ покрытие кода unit тестами
- ✅ 100% критических флоу покрыты E2E тестами
- ✅ 0 ошибок в консоли браузера
- ✅ Все тесты проходят за < 30 секунд

**Критические флоу для E2E**:
1. Создание записи через чат
2. Просмотр мотивационных карточек
3. Просмотр ленты последних записей
4. Вход/выход из системы
5. Изменение языка интерфейса

---

## 🔧 Следующие шаги

1. ✅ Создать этот документ
2. ⏳ Настроить Vitest для unit тестов
3. ⏳ Написать тесты для useHomeScreenData
4. ⏳ Написать тесты для useEntries
5. ⏳ Настроить Playwright для E2E тестов
6. ⏳ Написать E2E тест для создания записи
7. ⏳ Интегрировать в pre-commit hook
8. ⏳ Добавить в GitHub Actions CI/CD

---

**Статус**: Документ создан, ожидает реализации

