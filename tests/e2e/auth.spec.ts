/**
 * Authentication E2E Tests
 * 
 * Tests for user authentication flows:
 * - Login
 * - Logout
 * - Session persistence
 * - Role-based access control
 * 
 * @author UNITY Team
 * @date 2025-10-24
 */

import { test, expect } from '@playwright/test';

// Test accounts from docs/testing/TEST_ACCOUNTS.md
const TEST_USERS = {
  user: {
    email: 'rustam@leadshunter.biz',
    password: process.env.TEST_USER_PASSWORD || '',
  },
  admin: {
    email: 'diary@leadshunter.biz',
    password: process.env.TEST_ADMIN_PASSWORD || '',
  },
};

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show welcome screen for unauthenticated users', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Should show welcome screen or login form
    const hasWelcome = await page.locator('text=Добро пожаловать').isVisible().catch(() => false);
    const hasLogin = await page.locator('text=Войти').isVisible().catch(() => false);
    
    expect(hasWelcome || hasLogin).toBeTruthy();
  });

  test('should login as regular user', async ({ page }) => {
    // Skip if no password provided
    if (!TEST_USERS.user.password) {
      test.skip();
      return;
    }

    // Find and fill login form
    await page.fill('input[type="email"]', TEST_USERS.user.email);
    await page.fill('input[type="password"]', TEST_USERS.user.password);
    
    // Click login button
    await page.click('button:has-text("Войти")');
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Should redirect to main app (not admin panel)
    const url = page.url();
    expect(url).not.toContain('view=admin');
    
    // Should show user interface elements
    const hasUserUI = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);
    expect(hasUserUI).toBeTruthy();
  });

  test('should login as admin and access admin panel', async ({ page }) => {
    // Skip if no password provided
    if (!TEST_USERS.admin.password) {
      test.skip();
      return;
    }

    // Navigate to admin login
    await page.goto('/?view=admin');
    
    // Fill login form
    await page.fill('input[type="email"]', TEST_USERS.admin.email);
    await page.fill('input[type="password"]', TEST_USERS.admin.password);
    
    // Click login button
    await page.click('button:has-text("Войти")');
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Should be in admin panel
    const url = page.url();
    expect(url).toContain('view=admin');
    
    // Should show admin interface
    const hasAdminUI = await page.locator('text=Админ-панель').isVisible().catch(() => false);
    expect(hasAdminUI).toBeTruthy();
  });

  test('should prevent regular user from accessing admin panel', async ({ page }) => {
    // Skip if no password provided
    if (!TEST_USERS.user.password) {
      test.skip();
      return;
    }

    // Login as regular user
    await page.fill('input[type="email"]', TEST_USERS.user.email);
    await page.fill('input[type="password"]', TEST_USERS.user.password);
    await page.click('button:has-text("Войти")');
    await page.waitForLoadState('networkidle');
    
    // Try to access admin panel
    await page.goto('/?view=admin');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to user view
    const url = page.url();
    expect(url).not.toContain('view=admin');
  });

  test('should logout successfully', async ({ page }) => {
    // Skip if no password provided
    if (!TEST_USERS.user.password) {
      test.skip();
      return;
    }

    // Login first
    await page.fill('input[type="email"]', TEST_USERS.user.email);
    await page.fill('input[type="password"]', TEST_USERS.user.password);
    await page.click('button:has-text("Войти")');
    await page.waitForLoadState('networkidle');
    
    // Open settings or user menu
    await page.click('[data-testid="user-menu"]').catch(() => {
      // Fallback: try to find logout button directly
    });
    
    // Click logout
    await page.click('button:has-text("Выйти")');
    await page.waitForLoadState('networkidle');
    
    // Should show welcome screen again
    const hasWelcome = await page.locator('text=Добро пожаловать').isVisible().catch(() => false);
    const hasLogin = await page.locator('text=Войти').isVisible().catch(() => false);
    
    expect(hasWelcome || hasLogin).toBeTruthy();
  });

  test('should persist session after page reload', async ({ page }) => {
    // Skip if no password provided
    if (!TEST_USERS.user.password) {
      test.skip();
      return;
    }

    // Login
    await page.fill('input[type="email"]', TEST_USERS.user.email);
    await page.fill('input[type="password"]', TEST_USERS.user.password);
    await page.click('button:has-text("Войти")');
    await page.waitForLoadState('networkidle');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be logged in
    const hasUserUI = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);
    expect(hasUserUI).toBeTruthy();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Try to login with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Войти")');
    
    // Wait a bit for error message
    await page.waitForTimeout(2000);
    
    // Should show error message
    const hasError = await page.locator('text=Неверный').isVisible().catch(() => false);
    expect(hasError).toBeTruthy();
  });
});

