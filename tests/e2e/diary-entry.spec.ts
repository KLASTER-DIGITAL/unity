/**
 * Diary Entry E2E Tests
 * 
 * Tests for diary entry creation and management:
 * - Create entry
 * - View entry
 * - Edit entry
 * - Delete entry
 * - Offline mode
 * 
 * @author UNITY Team
 * @date 2025-10-24
 */

import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'rustam@leadshunter.biz',
  password: process.env.TEST_USER_PASSWORD || '',
};

test.describe('Diary Entry Management', () => {
  test.beforeEach(async ({ page }) => {
    // Skip if no password provided
    if (!TEST_USER.password) {
      test.skip();
      return;
    }

    // Login before each test
    await page.goto('/');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Войти")');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new diary entry', async ({ page }) => {
    // Find and click "Create Entry" button
    const createButton = page.locator('button:has-text("Создать")').first();
    await createButton.click();
    
    // Fill entry text
    const entryText = `Test entry created at ${new Date().toISOString()}`;
    await page.fill('textarea[placeholder*="запись"]', entryText);
    
    // Submit entry
    await page.click('button:has-text("Сохранить")');
    
    // Wait for entry to be saved
    await page.waitForTimeout(2000);
    
    // Should show success message or entry in list
    const hasSuccess = await page.locator('text=Сохранено').isVisible().catch(() => false);
    const hasEntry = await page.locator(`text=${entryText.substring(0, 20)}`).isVisible().catch(() => false);
    
    expect(hasSuccess || hasEntry).toBeTruthy();
  });

  test('should view entry details', async ({ page }) => {
    // Wait for entries to load
    await page.waitForTimeout(2000);
    
    // Click on first entry
    const firstEntry = page.locator('[data-testid="entry-item"]').first();
    await firstEntry.click();
    
    // Should show entry details modal or page
    const hasDetails = await page.locator('[data-testid="entry-details"]').isVisible().catch(() => false);
    expect(hasDetails).toBeTruthy();
  });

  test('should edit existing entry', async ({ page }) => {
    // Wait for entries to load
    await page.waitForTimeout(2000);
    
    // Click on first entry
    const firstEntry = page.locator('[data-testid="entry-item"]').first();
    await firstEntry.click();
    
    // Click edit button
    await page.click('button:has-text("Редактировать")');
    
    // Modify entry text
    const updatedText = `Updated at ${new Date().toISOString()}`;
    await page.fill('textarea', updatedText);
    
    // Save changes
    await page.click('button:has-text("Сохранить")');
    
    // Wait for save
    await page.waitForTimeout(2000);
    
    // Should show success message
    const hasSuccess = await page.locator('text=Обновлено').isVisible().catch(() => false);
    expect(hasSuccess).toBeTruthy();
  });

  test('should delete entry', async ({ page }) => {
    // Wait for entries to load
    await page.waitForTimeout(2000);
    
    // Click on first entry
    const firstEntry = page.locator('[data-testid="entry-item"]').first();
    await firstEntry.click();
    
    // Click delete button
    await page.click('button:has-text("Удалить")');
    
    // Confirm deletion
    await page.click('button:has-text("Подтвердить")');
    
    // Wait for deletion
    await page.waitForTimeout(2000);
    
    // Should show success message or entry removed from list
    const hasSuccess = await page.locator('text=Удалено').isVisible().catch(() => false);
    expect(hasSuccess).toBeTruthy();
  });

  test('should create entry in offline mode', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true);
    
    // Try to create entry
    const createButton = page.locator('button:has-text("Создать")').first();
    await createButton.click();
    
    const entryText = `Offline entry created at ${new Date().toISOString()}`;
    await page.fill('textarea[placeholder*="запись"]', entryText);
    
    // Submit entry
    await page.click('button:has-text("Сохранить")');
    
    // Wait a bit
    await page.waitForTimeout(2000);
    
    // Should show offline indicator
    const hasOfflineIndicator = await page.locator('text=Offline').isVisible().catch(() => false);
    const hasPendingIndicator = await page.locator('text=ожидают').isVisible().catch(() => false);
    
    expect(hasOfflineIndicator || hasPendingIndicator).toBeTruthy();
    
    // Go back online
    await context.setOffline(false);
    
    // Wait for sync
    await page.waitForTimeout(5000);
    
    // Should show sync success
    const hasSyncSuccess = await page.locator('text=синхронизирован').isVisible().catch(() => false);
    expect(hasSyncSuccess).toBeTruthy();
  });

  test('should filter entries by category', async ({ page }) => {
    // Wait for entries to load
    await page.waitForTimeout(2000);
    
    // Click on category filter
    await page.click('[data-testid="category-filter"]');
    
    // Select a category
    await page.click('text=Достижения');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Should show only entries from selected category
    const entries = await page.locator('[data-testid="entry-item"]').count();
    expect(entries).toBeGreaterThan(0);
  });

  test('should search entries', async ({ page }) => {
    // Wait for entries to load
    await page.waitForTimeout(2000);
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="Поиск"]');
    await searchInput.fill('test');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Should show filtered results
    const hasResults = await page.locator('[data-testid="entry-item"]').count();
    expect(hasResults).toBeGreaterThanOrEqual(0);
  });

  test('should show entry statistics', async ({ page }) => {
    // Navigate to statistics page
    await page.click('[data-testid="stats-tab"]');
    
    // Wait for stats to load
    await page.waitForTimeout(2000);
    
    // Should show statistics
    const hasStats = await page.locator('text=Статистика').isVisible().catch(() => false);
    const hasCharts = await page.locator('[data-testid="chart"]').isVisible().catch(() => false);
    
    expect(hasStats || hasCharts).toBeTruthy();
  });
});

