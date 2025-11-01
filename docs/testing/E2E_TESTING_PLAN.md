# E2E Testing Plan - UNITY-v2

**Статус**: 📅 Planned  
**Приоритет**: P2 (Medium)  
**Срок**: 1 неделя (2025-11-15 - 2025-11-22)  
**Последнее обновление**: 2025-11-01  

---

## 📊 Executive Summary

### Current State:
- ❌ **E2E Tests**: Не реализованы
- ✅ **Manual Testing**: Выполнено (см. `2025-11-01_e2e_testing_report.md`)
- ⚠️ **Regression Risk**: Высокий (нет автоматизации)

### Planned State:
- ✅ **E2E Tests**: Автоматизированные тесты для критичных workflow
- ✅ **CI/CD Integration**: Автоматический запуск в GitHub Actions
- ✅ **Console Monitoring**: Проверка на ошибки в консоли

### Expected Results:
- **Regression Prevention**: 95%+ критичных багов предотвращены
- **CI/CD Time**: <5 минут на полный E2E suite
- **Test Coverage**: 80%+ критичных user flows

---

## 🎯 Why E2E Testing?

### Problems:
1. **Manual Testing**: Занимает 30-60 минут на полный workflow
2. **Human Error**: Легко пропустить ошибки в консоли
3. **Regression**: Новые фичи ломают существующий функционал
4. **Deployment Confidence**: Нет уверенности что production работает

### Solution:
Автоматизированные E2E тесты с:
- **Chrome DevTools MCP**: Реальный браузер, реальные ошибки
- **Console Monitoring**: Автоматическая проверка на errors/warnings
- **Screenshot Comparison**: Visual regression testing
- **CI/CD Integration**: Запуск перед каждым деплоем

---

## 🧪 Test Framework

### Technology Stack:
- **Test Runner**: Vitest (уже используется в проекте)
- **Browser Automation**: Chrome DevTools MCP
- **Assertions**: Vitest expect + custom matchers
- **CI/CD**: GitHub Actions

### Why Chrome DevTools MCP?
- ✅ Реальный Chrome browser (не headless)
- ✅ Доступ к console logs
- ✅ Network monitoring
- ✅ Performance metrics
- ✅ Screenshot capabilities
- ✅ Уже используется для manual testing

---

## 📋 Test Suites

### Suite 1: Authentication Flow (CRITICAL)
**Priority**: P0  
**Duration**: ~2 minutes  

#### Test Cases:
1. **Onboarding Navigation**
   - Открыть https://unity-wine.vercel.app
   - Проверить что onboarding отображается
   - Кликнуть "Далее" 3 раза
   - Проверить что достигли экрана авторизации
   - **Assertion**: Console 0 errors

2. **Login Flow**
   - Кликнуть "У меня уже есть аккаунт"
   - Заполнить email: rustam@leadshunter.biz
   - Заполнить password: demo123
   - Кликнуть "Войти"
   - Проверить редирект на главную страницу
   - **Assertion**: Console 0 errors, URL contains "/home"

3. **Register Flow**
   - Кликнуть "Создать аккаунт"
   - Заполнить name, email, password
   - Кликнуть "Зарегистрироваться"
   - Проверить редирект на главную страницу
   - **Assertion**: Console 0 errors, user created in DB

---

### Suite 2: Diary Workflow (CRITICAL)
**Priority**: P0  
**Duration**: ~3 minutes  

#### Test Cases:
1. **View Diary Entries**
   - Авторизоваться
   - Открыть главную страницу
   - Проверить что записи отображаются
   - **Assertion**: Console 0 errors, entries count > 0

2. **Create Diary Entry**
   - Кликнуть FAB кнопку
   - Заполнить текст записи
   - Кликнуть "Сохранить"
   - Проверить что запись появилась в списке
   - **Assertion**: Console 0 errors, entry created in DB

3. **Edit Diary Entry**
   - Кликнуть на существующую запись
   - Изменить текст
   - Кликнуть "Сохранить"
   - Проверить что изменения сохранились
   - **Assertion**: Console 0 errors, entry updated in DB

4. **Delete Diary Entry**
   - Кликнуть на запись
   - Кликнуть "Удалить"
   - Подтвердить удаление
   - Проверить что запись исчезла из списка
   - **Assertion**: Console 0 errors, entry deleted from DB

---

### Suite 3: Navigation (HIGH)
**Priority**: P1  
**Duration**: ~2 minutes  

#### Test Cases:
1. **Bottom Navigation**
   - Авторизоваться
   - Кликнуть "История"
   - Проверить что открылась страница истории
   - Кликнуть "Достижения"
   - Проверить что открылась страница достижений
   - Кликнуть "AI Обзоры"
   - Проверить что открылась страница обзоров
   - Кликнуть "Профиль"
   - Проверить что открылась страница профиля
   - **Assertion**: Console 0 errors на каждой странице

2. **Back Navigation**
   - Открыть запись
   - Кликнуть "Назад"
   - Проверить что вернулись на главную
   - **Assertion**: Console 0 errors

---

### Suite 4: Settings & i18n (MEDIUM)
**Priority**: P2  
**Duration**: ~2 minutes  

#### Test Cases:
1. **Language Change**
   - Открыть профиль
   - Кликнуть "Язык"
   - Выбрать "English"
   - Проверить что интерфейс переключился на английский
   - **Assertion**: Console 0 errors, localStorage language = 'en'

2. **Theme Toggle**
   - Открыть профиль
   - Кликнуть "Темная тема"
   - Проверить что тема переключилась
   - **Assertion**: Console 0 errors, dark mode applied

---

### Suite 5: Performance (LOW)
**Priority**: P3  
**Duration**: ~3 minutes  

#### Test Cases:
1. **Page Load Time**
   - Открыть главную страницу
   - Измерить время загрузки
   - **Assertion**: Load time <3 seconds

2. **Console Errors**
   - Открыть каждую страницу
   - Проверить консоль
   - **Assertion**: 0 errors, 0 warnings

3. **Network Requests**
   - Открыть главную страницу
   - Проверить количество запросов
   - **Assertion**: <20 requests, no failed requests

---

## 🛠️ Implementation

### File Structure:
```
tests/
├── e2e/
│   ├── auth.test.ts           # Suite 1: Authentication
│   ├── diary.test.ts          # Suite 2: Diary Workflow
│   ├── navigation.test.ts     # Suite 3: Navigation
│   ├── settings.test.ts       # Suite 4: Settings & i18n
│   ├── performance.test.ts    # Suite 5: Performance
│   └── helpers/
│       ├── browser.ts         # Chrome DevTools MCP wrapper
│       ├── auth.ts            # Auth helpers
│       ├── console.ts         # Console monitoring
│       └── assertions.ts      # Custom matchers
├── fixtures/
│   ├── users.json             # Test users
│   └── entries.json           # Test diary entries
└── vitest.config.e2e.ts       # E2E config
```

### Example Test:
```typescript
// tests/e2e/auth.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Browser } from './helpers/browser';
import { ConsoleMonitor } from './helpers/console';

describe('Authentication Flow', () => {
  let browser: Browser;
  let console: ConsoleMonitor;

  beforeAll(async () => {
    browser = new Browser();
    console = new ConsoleMonitor(browser);
    await browser.open('https://unity-wine.vercel.app');
  });

  afterAll(async () => {
    await browser.close();
  });

  it('should navigate through onboarding', async () => {
    // Navigate through onboarding
    await browser.click('[data-testid="onboarding-next"]');
    await browser.click('[data-testid="onboarding-next"]');
    await browser.click('[data-testid="onboarding-next"]');

    // Check we reached auth screen
    const authScreen = await browser.find('[data-testid="auth-screen"]');
    expect(authScreen).toBeTruthy();

    // Check console
    const errors = console.getErrors();
    expect(errors).toHaveLength(0);
  });

  it('should login successfully', async () => {
    // Click "Already have account"
    await browser.click('[data-testid="login-tab"]');

    // Fill form
    await browser.fill('[data-testid="email-input"]', 'rustam@leadshunter.biz');
    await browser.fill('[data-testid="password-input"]', 'demo123');

    // Submit
    await browser.click('[data-testid="submit-button"]');

    // Wait for redirect
    await browser.waitForUrl('/home');

    // Check console
    const errors = console.getErrors();
    expect(errors).toHaveLength(0);
  });
});
```

---

## 🚀 CI/CD Integration

### GitHub Actions Workflow:
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          TEST_URL: https://unity-wine.vercel.app
          TEST_USER_EMAIL: rustam@leadshunter.biz
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          
      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-screenshots
          path: tests/e2e/screenshots/
```

---

## 📊 Success Metrics

### Quantitative:
- **Test Coverage**: 80%+ critical user flows
- **Test Duration**: <10 minutes for full suite
- **Flakiness**: <5% flaky tests
- **CI/CD Time**: <5 minutes overhead

### Qualitative:
- **Regression Prevention**: Catch bugs before production
- **Deployment Confidence**: Green tests = safe to deploy
- **Developer Experience**: Fast feedback loop
- **Documentation**: Tests as living documentation

---

## ⚠️ Risks & Mitigation

### Risk 1: Flaky Tests
**Problem**: Tests fail randomly due to timing issues  
**Mitigation**: 
- Use explicit waits (waitForUrl, waitForElement)
- Retry failed tests (max 3 retries)
- Increase timeouts for slow operations

### Risk 2: Maintenance Overhead
**Problem**: Tests break when UI changes  
**Mitigation**:
- Use data-testid attributes (stable selectors)
- Extract helpers for common operations
- Keep tests simple and focused

### Risk 3: CI/CD Slowdown
**Problem**: E2E tests slow down deployment  
**Mitigation**:
- Run only critical tests on every commit
- Run full suite nightly
- Parallelize test execution

---

## 🎯 Definition of Done

- [ ] All 5 test suites implemented
- [ ] CI/CD integration configured
- [ ] Tests passing on main branch
- [ ] Documentation updated
- [ ] Team trained on writing E2E tests
- [ ] Flakiness <5%
- [ ] Test duration <10 minutes

---

**Автор**: QA Team UNITY  
**Дата создания**: 2025-11-01  
**Следующий review**: 2025-11-15  

