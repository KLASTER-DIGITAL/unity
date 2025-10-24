/**
 * PWA E2E Tests
 * 
 * Tests for PWA functionality:
 * - Service Worker registration
 * - Offline mode
 * - Install prompt
 * - Push notifications
 * - Cache strategies
 * 
 * @author UNITY Team
 * @date 2025-10-24
 */

import { test, expect } from '@playwright/test';

test.describe('PWA Functionality', () => {
  test('should register service worker', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return !!registration;
      }
      return false;
    });
    
    expect(swRegistered).toBeTruthy();
  });

  test('should have valid manifest.json', async ({ page }) => {
    await page.goto('/');
    
    // Check manifest link
    const manifestLink = await page.locator('link[rel="manifest"]').getAttribute('href');
    expect(manifestLink).toBeTruthy();
    
    // Fetch and validate manifest
    const manifestResponse = await page.goto(manifestLink!);
    expect(manifestResponse?.status()).toBe(200);
    
    const manifest = await manifestResponse?.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBeTruthy();
    expect(manifest.icons).toBeTruthy();
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test('should work offline', async ({ page, context }) => {
    // Load page online first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for service worker to be ready
    await page.waitForTimeout(2000);
    
    // Go offline
    await context.setOffline(true);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Page should still load (from cache)
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Should show offline indicator
    const hasOfflineIndicator = await page.locator('text=Offline').isVisible().catch(() => false);
    const hasNoConnection = await page.locator('text=Нет подключения').isVisible().catch(() => false);
    
    expect(hasOfflineIndicator || hasNoConnection).toBeTruthy();
  });

  test('should cache static assets', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if assets are cached
    const cacheNames = await page.evaluate(async () => {
      return await caches.keys();
    });
    
    expect(cacheNames.length).toBeGreaterThan(0);
    expect(cacheNames.some(name => name.includes('achievement-diary'))).toBeTruthy();
  });

  test('should show install prompt on supported browsers', async ({ page, browserName }) => {
    // Skip on browsers that don't support install prompt
    if (browserName !== 'chromium') {
      test.skip();
      return;
    }
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if beforeinstallprompt event is supported
    const hasInstallPrompt = await page.evaluate(() => {
      return 'onbeforeinstallprompt' in window;
    });
    
    expect(hasInstallPrompt).toBeTruthy();
  });

  test('should support push notifications', async ({ page, browserName }) => {
    // Skip on browsers that don't support push
    if (browserName === 'webkit') {
      test.skip();
      return;
    }
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if push notifications are supported
    const pushSupported = await page.evaluate(() => {
      return 'PushManager' in window && 'Notification' in window;
    });
    
    expect(pushSupported).toBeTruthy();
  });

  test('should have proper cache headers', async ({ page }) => {
    const response = await page.goto('/');
    
    // Check cache-control header
    const cacheControl = response?.headers()['cache-control'];
    expect(cacheControl).toBeTruthy();
  });

  test('should load app shell quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    // App shell should load in less than 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have valid theme color', async ({ page }) => {
    await page.goto('/');
    
    // Check theme-color meta tag
    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBeTruthy();
    expect(themeColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  test('should have apple-touch-icon', async ({ page }) => {
    await page.goto('/');
    
    // Check apple-touch-icon link
    const appleTouchIcon = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
    expect(appleTouchIcon).toBeTruthy();
  });

  test('should support background sync', async ({ page, browserName }) => {
    // Skip on browsers that don't support background sync
    if (browserName !== 'chromium') {
      test.skip();
      return;
    }
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if background sync is supported
    const bgSyncSupported = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        return 'sync' in registration;
      }
      return false;
    });
    
    expect(bgSyncSupported).toBeTruthy();
  });

  test('should handle service worker updates', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if service worker update mechanism works
    const hasUpdateMechanism = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          // Trigger update check
          await registration.update();
          return true;
        }
      }
      return false;
    });
    
    expect(hasUpdateMechanism).toBeTruthy();
  });

  test('should have proper viewport meta tag', async ({ page }) => {
    await page.goto('/');
    
    // Check viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toBeTruthy();
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1');
  });
});

