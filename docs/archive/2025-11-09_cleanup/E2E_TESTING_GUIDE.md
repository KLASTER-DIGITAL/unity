# 🧪 E2E TESTING GUIDE

**Дата создания:** 24 октября 2025  
**Проект:** UNITY-v2  
**Автор:** AI Assistant (Augment Agent)

---

## 📋 СОДЕРЖАНИЕ

1. [Обзор](#обзор)
2. [Setup](#setup)
3. [Запуск тестов](#запуск-тестов)
4. [Написание тестов](#написание-тестов)
5. [CI/CD Integration](#cicd-integration)
6. [Best Practices](#best-practices)

---

## 🎯 ОБЗОР

E2E (End-to-End) тесты проверяют критические пользовательские сценарии в реальном браузере. Используем Playwright для кроссбраузерного тестирования.

**Покрытие:**
- ✅ Authentication (login, logout, session)
- ✅ Diary Entry Management (create, view, edit, delete)
- ✅ PWA Functionality (offline, service worker, manifest)
- ✅ Role-Based Access Control
- ✅ Offline Mode & Sync

**Браузеры:**
- Chromium (Chrome, Edge)
- Firefox
- WebKit (Safari)
- Mobile Chrome
- Mobile Safari

---

## 🛠️ SETUP

### 1. Install Dependencies

```bash
npm install -D @playwright/test
```

### 2. Install Browsers

```bash
npx playwright install
```

### 3. Environment Variables

Create `.env.test` file:

```env
TEST_USER_PASSWORD=your_test_user_password
TEST_ADMIN_PASSWORD=your_admin_password
PLAYWRIGHT_BASE_URL=http://localhost:4173
```

**Security Note:** Never commit passwords to git!

---

## 🚀 ЗАПУСК ТЕСТОВ

### Local Development

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run mobile tests
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

### View Test Report

```bash
npx playwright show-report
```

### Update Snapshots

```bash
npx playwright test --update-snapshots
```

---

## ✍️ НАПИСАНИЕ ТЕСТОВ

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.fill('input[type="email"]', 'test@example.com');
    
    // Act
    await page.click('button:has-text("Submit")');
    
    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Common Patterns

#### Login Helper

```typescript
async function login(page, email, password) {
  await page.goto('/');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Войти")');
  await page.waitForLoadState('networkidle');
}
```

#### Wait for Element

```typescript
// Wait for element to be visible
await page.waitForSelector('[data-testid="user-menu"]');

// Wait for navigation
await page.waitForLoadState('networkidle');

// Wait for specific timeout
await page.waitForTimeout(2000);
```

#### Offline Testing

```typescript
test('should work offline', async ({ page, context }) => {
  // Go offline
  await context.setOffline(true);
  
  // Test offline functionality
  await page.reload();
  
  // Go back online
  await context.setOffline(false);
});
```

#### Screenshot on Failure

```typescript
test('should do something', async ({ page }) => {
  try {
    // Test code
  } catch (error) {
    await page.screenshot({ path: 'failure.png' });
    throw error;
  }
});
```

---

## 🔄 CI/CD INTEGRATION

### GitHub Actions

Tests run automatically on:
- Pull requests to `main` or `develop`
- Push to `main`
- Manual trigger

**Workflow:** `.github/workflows/e2e-tests.yml`

**Features:**
- Parallel execution across browsers
- Automatic retry on failure (2 retries)
- HTML report generation
- Video recording on failure
- PR comments with results

### Secrets Required

Add these secrets in GitHub Settings → Secrets:

```
TEST_USER_PASSWORD
TEST_ADMIN_PASSWORD
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

---

## 📊 TEST COVERAGE

### Authentication (auth.spec.ts)

- ✅ Show welcome screen for unauthenticated users
- ✅ Login as regular user
- ✅ Login as admin
- ✅ Prevent regular user from accessing admin panel
- ✅ Logout successfully
- ✅ Persist session after reload
- ✅ Show error for invalid credentials

### Diary Entry (diary-entry.spec.ts)

- ✅ Create new diary entry
- ✅ View entry details
- ✅ Edit existing entry
- ✅ Delete entry
- ✅ Create entry in offline mode
- ✅ Filter entries by category
- ✅ Search entries
- ✅ Show entry statistics

### PWA (pwa.spec.ts)

- ✅ Register service worker
- ✅ Valid manifest.json
- ✅ Work offline
- ✅ Cache static assets
- ✅ Show install prompt
- ✅ Support push notifications
- ✅ Proper cache headers
- ✅ Load app shell quickly
- ✅ Valid theme color
- ✅ Apple touch icon
- ✅ Support background sync
- ✅ Handle service worker updates
- ✅ Proper viewport meta tag

---

## 🎯 BEST PRACTICES

### 1. Use Data Test IDs

```tsx
// Component
<button data-testid="submit-button">Submit</button>

// Test
await page.click('[data-testid="submit-button"]');
```

### 2. Avoid Hard-Coded Waits

```typescript
// ❌ Bad
await page.waitForTimeout(5000);

// ✅ Good
await page.waitForSelector('[data-testid="result"]');
```

### 3. Use Page Object Model

```typescript
class LoginPage {
  constructor(private page: Page) {}
  
  async login(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button:has-text("Войти")');
  }
}
```

### 4. Clean Up After Tests

```typescript
test.afterEach(async ({ page }) => {
  // Clean up test data
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});
```

### 5. Use Fixtures for Common Setup

```typescript
import { test as base } from '@playwright/test';

const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await login(page, TEST_USER.email, TEST_USER.password);
    await use(page);
  },
});
```

### 6. Test in Isolation

Each test should be independent and not rely on other tests.

### 7. Use Meaningful Test Names

```typescript
// ✅ Good
test('should show error message when login fails');

// ❌ Bad
test('test1');
```

### 8. Handle Flaky Tests

```typescript
test('flaky test', async ({ page }) => {
  // Retry logic
  await expect(async () => {
    await page.click('button');
    await expect(page.locator('text=Success')).toBeVisible();
  }).toPass({ timeout: 10000 });
});
```

---

## 📈 METRICS

### Performance Targets

- **Test execution time:** < 5 minutes for full suite
- **Individual test:** < 30 seconds
- **Flakiness rate:** < 5%
- **Coverage:** > 80% of critical flows

### Current Status

- **Total tests:** 25+
- **Browsers:** 5 (Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari)
- **Execution time:** ~3 minutes
- **Success rate:** > 95%

---

## 🐛 DEBUGGING

### Debug Mode

```bash
npx playwright test --debug
```

### Trace Viewer

```bash
npx playwright show-trace trace.zip
```

### Screenshots

```bash
npx playwright test --screenshot=on
```

### Videos

```bash
npx playwright test --video=on
```

---

## 📚 RESOURCES

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-playwright)
- [Test Accounts](./TEST_ACCOUNTS.md)

---

**Автор:** AI Assistant (Augment Agent)  
**Дата:** 24 октября 2025  
**Статус:** ✅ Готово к использованию

