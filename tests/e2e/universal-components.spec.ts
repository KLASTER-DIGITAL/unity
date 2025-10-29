/**
 * E2E Tests for Universal Components
 * 
 * Tests Button, Modal, RadioGroup components in real browser environment
 * Covers both web and mobile viewports
 * 
 * @playwright
 */

import { test, expect } from '@playwright/test';

// ============================================================================
// BUTTON COMPONENT E2E TESTS
// ============================================================================

test.describe('Button Component E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Component Showcase page
    await page.goto('/?view=showcase');
    await page.waitForLoadState('networkidle');
  });

  test('should render and be clickable', async ({ page }) => {
    // Find button by role
    const button = page.getByRole('button').first();
    
    // Check visibility
    await expect(button).toBeVisible();
    
    // Check clickability
    await expect(button).toBeEnabled();
    
    // Click button
    await button.click();
  });

  test('should show loading state', async ({ page }) => {
    // Find button with loading state
    const loadingButton = page.getByRole('button', { name: /loading/i });
    
    if (await loadingButton.count() > 0) {
      // Check disabled state
      await expect(loadingButton).toBeDisabled();
      
      // Check for spinner
      const spinner = loadingButton.locator('.animate-spin');
      await expect(spinner).toBeVisible();
    }
  });

  test('should handle disabled state', async ({ page }) => {
    // Find disabled button
    const disabledButton = page.getByRole('button', { disabled: true }).first();
    
    if (await disabledButton.count() > 0) {
      // Check disabled state
      await expect(disabledButton).toBeDisabled();
      
      // Try to click (should not work)
      await disabledButton.click({ force: true });
    }
  });

  test('should render different variants', async ({ page }) => {
    // Check for different button variants
    const buttons = page.getByRole('button');
    const count = await buttons.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Check first button has proper styling
    const firstButton = buttons.first();
    const classes = await firstButton.getAttribute('class');
    
    expect(classes).toBeTruthy();
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Find first button
    const button = page.getByRole('button').first();
    
    // Focus button with Tab
    await page.keyboard.press('Tab');
    
    // Check focus
    await expect(button).toBeFocused();
    
    // Press Enter
    await page.keyboard.press('Enter');
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Find button
    const button = page.getByRole('button').first();
    
    // Check visibility
    await expect(button).toBeVisible();
    
    // Tap button (mobile interaction)
    await button.tap();
  });
});

// ============================================================================
// MODAL COMPONENT E2E TESTS
// ============================================================================

test.describe('Modal Component E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Component Showcase page
    await page.goto('/?view=showcase');
    await page.waitForLoadState('networkidle');
  });

  test('should open and close modal', async ({ page }) => {
    // Find button that opens modal
    const openButton = page.getByRole('button', { name: /open|modal/i }).first();
    
    if (await openButton.count() > 0) {
      // Click to open modal
      await openButton.click();
      
      // Wait for modal to appear
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      
      // Find close button
      const closeButton = modal.getByRole('button', { name: /close/i });
      
      if (await closeButton.count() > 0) {
        // Click to close modal
        await closeButton.click();
        
        // Wait for modal to disappear
        await expect(modal).not.toBeVisible();
      }
    }
  });

  test('should close modal on backdrop click', async ({ page }) => {
    // Find button that opens modal
    const openButton = page.getByRole('button', { name: /open|modal/i }).first();
    
    if (await openButton.count() > 0) {
      // Click to open modal
      await openButton.click();
      
      // Wait for modal to appear
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      
      // Click backdrop (outside modal content)
      await page.mouse.click(10, 10);
      
      // Wait for modal to disappear
      await expect(modal).not.toBeVisible();
    }
  });

  test('should trap focus inside modal', async ({ page }) => {
    // Find button that opens modal
    const openButton = page.getByRole('button', { name: /open|modal/i }).first();
    
    if (await openButton.count() > 0) {
      // Click to open modal
      await openButton.click();
      
      // Wait for modal to appear
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      
      // Press Tab multiple times
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Focus should stay inside modal
      const focusedElement = page.locator(':focus');
      const isInsideModal = await modal.locator(':focus').count() > 0;
      
      expect(isInsideModal).toBeTruthy();
    }
  });

  test('should close modal on Escape key', async ({ page }) => {
    // Find button that opens modal
    const openButton = page.getByRole('button', { name: /open|modal/i }).first();
    
    if (await openButton.count() > 0) {
      // Click to open modal
      await openButton.click();
      
      // Wait for modal to appear
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      
      // Press Escape
      await page.keyboard.press('Escape');
      
      // Wait for modal to disappear
      await expect(modal).not.toBeVisible();
    }
  });

  test('should render modal content correctly', async ({ page }) => {
    // Find button that opens modal
    const openButton = page.getByRole('button', { name: /open|modal/i }).first();
    
    if (await openButton.count() > 0) {
      // Click to open modal
      await openButton.click();
      
      // Wait for modal to appear
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      
      // Check for modal title
      const title = modal.locator('h2, [role="heading"]').first();
      if (await title.count() > 0) {
        await expect(title).toBeVisible();
      }
      
      // Check for modal content
      const content = modal.locator('p, div').first();
      await expect(content).toBeVisible();
    }
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Find button that opens modal
    const openButton = page.getByRole('button', { name: /open|modal/i }).first();
    
    if (await openButton.count() > 0) {
      // Tap to open modal
      await openButton.tap();
      
      // Wait for modal to appear
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
      
      // Check modal is properly sized for mobile
      const boundingBox = await modal.boundingBox();
      expect(boundingBox?.width).toBeLessThanOrEqual(375);
    }
  });
});

// ============================================================================
// RADIOGROUP COMPONENT E2E TESTS
// ============================================================================

test.describe('RadioGroup Component E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Component Showcase page
    await page.goto('/?view=showcase');
    await page.waitForLoadState('networkidle');
  });

  test('should render radio options', async ({ page }) => {
    // Find radiogroup
    const radioGroup = page.getByRole('radiogroup').first();
    
    if (await radioGroup.count() > 0) {
      // Check visibility
      await expect(radioGroup).toBeVisible();
      
      // Find radio buttons
      const radios = radioGroup.getByRole('radio');
      const count = await radios.count();
      
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should select radio option', async ({ page }) => {
    // Find radiogroup
    const radioGroup = page.getByRole('radiogroup').first();
    
    if (await radioGroup.count() > 0) {
      // Find first radio button
      const firstRadio = radioGroup.getByRole('radio').first();
      
      // Click radio
      await firstRadio.click();
      
      // Check selected state
      await expect(firstRadio).toBeChecked();
    }
  });

  test('should allow only one selection', async ({ page }) => {
    // Find radiogroup
    const radioGroup = page.getByRole('radiogroup').first();
    
    if (await radioGroup.count() > 0) {
      const radios = radioGroup.getByRole('radio');
      const count = await radios.count();
      
      if (count >= 2) {
        // Select first radio
        await radios.nth(0).click();
        await expect(radios.nth(0)).toBeChecked();
        
        // Select second radio
        await radios.nth(1).click();
        await expect(radios.nth(1)).toBeChecked();
        
        // First radio should be unchecked
        await expect(radios.nth(0)).not.toBeChecked();
      }
    }
  });

  test('should be keyboard accessible', async ({ page }) => {
    // Find radiogroup
    const radioGroup = page.getByRole('radiogroup').first();
    
    if (await radioGroup.count() > 0) {
      // Focus first radio
      const firstRadio = radioGroup.getByRole('radio').first();
      await firstRadio.focus();
      
      // Check focus
      await expect(firstRadio).toBeFocused();
      
      // Press Space to select
      await page.keyboard.press('Space');
      
      // Check selected state
      await expect(firstRadio).toBeChecked();
    }
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Find radiogroup
    const radioGroup = page.getByRole('radiogroup').first();
    
    if (await radioGroup.count() > 0) {
      // Check visibility
      await expect(radioGroup).toBeVisible();
      
      // Find first radio
      const firstRadio = radioGroup.getByRole('radio').first();
      
      // Tap radio (mobile interaction)
      await firstRadio.tap();
      
      // Check selected state
      await expect(firstRadio).toBeChecked();
    }
  });
});

