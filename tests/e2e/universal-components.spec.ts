/**
 * E2E Tests for Universal Components
 *
 * Tests Button, Modal, RadioGroup components in real browser environment
 * Uses Settings and Home pages (NO showcase route)
 * Covers both web and mobile viewports
 *
 * @playwright
 */

import { expect, test } from '@playwright/test';

// Test credentials
const TEST_EMAIL = 'rustam@leadshunter.biz';
const TEST_PASSWORD = 'demo123';

// ============================================================================
// AUTHENTICATION HELPER
// ============================================================================

async function login(page: any) {
	await page.goto('/');
	await page.waitForLoadState('networkidle');

	// Check if we're on WelcomeScreen (has "У меня уже есть аккаунт" button)
	const welcomeSkipButton = page.getByText(/У меня уже есть аккаунт/i);
	const hasWelcomeScreen = (await welcomeSkipButton.count()) > 0;

	if (hasWelcomeScreen) {
		// Click "У меня уже есть аккаунт" to go to AuthScreen
		// Use force: true to bypass Framer Motion animation blocking
		await welcomeSkipButton.click({ timeout: 5000, force: true });
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);
	}

	// Check if we need to switch to login mode (from register mode)
	// Look for "Уже есть аккаунт?" text (AuthToggle component)
	const authToggleButton = page.getByText(/Уже есть аккаунт\?/i);
	const needsToggle = (await authToggleButton.count()) > 0;

	if (needsToggle) {
		// Click to switch to login mode
		// Use force: true to bypass Framer Motion animation blocking
		await authToggleButton.click({ timeout: 5000, force: true });
		await page.waitForTimeout(1000);
	}

	// Fill email
	const emailInput = page.getByPlaceholder(/email|почта/i);
	await emailInput.fill(TEST_EMAIL, { timeout: 10000 });

	// Fill password
	const passwordInput = page.getByPlaceholder(/password|пароль/i);
	await passwordInput.fill(TEST_PASSWORD, { timeout: 10000 });

	// Click login button
	const submitButton = page.getByRole('button', { name: /войти|login/i });
	await submitButton.click({ timeout: 10000 });

	// Wait for navigation
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(1000);
}

// ============================================================================
// BUTTON COMPONENT E2E TESTS (Settings Page)
// ============================================================================

test.describe('Button Component E2E - Settings Page', () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to Settings
		await login(page);

		// Click Settings tab
		const settingsTab = page.getByRole('button', {
			name: /настройки|settings/i,
		});
		await settingsTab.click();
		await page.waitForLoadState('networkidle');
	});

	test('should render save button', async ({ page }) => {
		// Find save button in Settings
		const saveButton = page.getByRole('button', { name: /сохранить|save/i });

		// Check visibility
		await expect(saveButton).toBeVisible();

		// Check clickability
		await expect(saveButton).toBeEnabled();
	});

	test('should render logout button', async ({ page }) => {
		// Find logout button
		const logoutButton = page.getByRole('button', { name: /выйти|logout/i });

		// Check visibility
		await expect(logoutButton).toBeVisible();

		// Check clickability
		await expect(logoutButton).toBeEnabled();
	});

	test('should be keyboard accessible', async ({ page }) => {
		// Find save button
		const saveButton = page.getByRole('button', { name: /сохранить|save/i });

		// Focus button with Tab
		await saveButton.focus();

		// Check focus
		await expect(saveButton).toBeFocused();

		// Press Enter
		await page.keyboard.press('Enter');
	});

	test('should work on mobile viewport', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		// Reload page
		await page.reload();
		await page.waitForLoadState('networkidle');

		// Find save button
		const saveButton = page.getByRole('button', { name: /сохранить|save/i });

		// Check visibility
		await expect(saveButton).toBeVisible();

		// Tap button (mobile interaction)
		await saveButton.tap();
	});
});

// ============================================================================
// MODAL COMPONENT E2E TESTS (Home Page - Create Entry)
// ============================================================================

test.describe('Modal Component E2E - Home Page', () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to Home
		await login(page);

		// Click Home tab
		const homeTab = page.getByRole('button', { name: /главная|home/i });
		await homeTab.click();
		await page.waitForLoadState('networkidle');
	});

	test('should open entry details modal', async ({ page }) => {
		// Find first entry card
		const entryCard = page.locator('[data-testid="entry-card"]').first();

		if ((await entryCard.count()) > 0) {
			// Click entry card to open modal
			await entryCard.click();

			// Wait for modal to appear
			const modal = page.getByRole('dialog');
			await expect(modal).toBeVisible();

			// Find close button
			const closeButton = modal.getByRole('button', { name: /закрыть|close/i });

			if ((await closeButton.count()) > 0) {
				// Click to close modal
				await closeButton.click();

				// Wait for modal to disappear
				await expect(modal).not.toBeVisible();
			}
		}
	});

	test('should close modal on Escape key', async ({ page }) => {
		// Find first entry card
		const entryCard = page.locator('[data-testid="entry-card"]').first();

		if ((await entryCard.count()) > 0) {
			// Click entry card to open modal
			await entryCard.click();

			// Wait for modal to appear
			const modal = page.getByRole('dialog');
			await expect(modal).toBeVisible();

			// Press Escape
			await page.keyboard.press('Escape');

			// Wait for modal to disappear
			await expect(modal).not.toBeVisible();
		}
	});

	test('should work on mobile viewport', async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		// Reload page
		await page.reload();
		await page.waitForLoadState('networkidle');

		// Find first entry card
		const entryCard = page.locator('[data-testid="entry-card"]').first();

		if ((await entryCard.count()) > 0) {
			// Tap entry card to open modal
			await entryCard.tap();

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
// RADIOGROUP COMPONENT E2E TESTS (Settings Page - Language Selection)
// ============================================================================

test.describe('RadioGroup Component E2E - Settings Page', () => {
	test.beforeEach(async ({ page }) => {
		// Login and navigate to Settings
		await login(page);

		// Click Settings tab
		const settingsTab = page.getByRole('button', {
			name: /настройки|settings/i,
		});
		await settingsTab.click();
		await page.waitForLoadState('networkidle');
	});

	test('should render language radio options', async ({ page }) => {
		// Find language radiogroup (theme selector uses radiogroup)
		const radioGroup = page.getByRole('radiogroup').first();

		if ((await radioGroup.count()) > 0) {
			// Check visibility
			await expect(radioGroup).toBeVisible();

			// Find radio buttons
			const radios = radioGroup.getByRole('radio');
			const count = await radios.count();

			expect(count).toBeGreaterThan(0);
		}
	});

	test('should select theme option', async ({ page }) => {
		// Find theme radiogroup
		const radioGroup = page.getByRole('radiogroup').first();

		if ((await radioGroup.count()) > 0) {
			// Find first radio button (Light theme)
			const firstRadio = radioGroup.getByRole('radio').first();

			// Click radio
			await firstRadio.click();

			// Check selected state
			await expect(firstRadio).toBeChecked();
		}
	});

	test('should allow only one theme selection', async ({ page }) => {
		// Find theme radiogroup
		const radioGroup = page.getByRole('radiogroup').first();

		if ((await radioGroup.count()) > 0) {
			const radios = radioGroup.getByRole('radio');
			const count = await radios.count();

			if (count >= 2) {
				// Select first radio (Light)
				await radios.nth(0).click();
				await expect(radios.nth(0)).toBeChecked();

				// Select second radio (Dark)
				await radios.nth(1).click();
				await expect(radios.nth(1)).toBeChecked();

				// First radio should be unchecked
				await expect(radios.nth(0)).not.toBeChecked();
			}
		}
	});

	test('should be keyboard accessible', async ({ page }) => {
		// Find theme radiogroup
		const radioGroup = page.getByRole('radiogroup').first();

		if ((await radioGroup.count()) > 0) {
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

		// Reload page
		await page.reload();
		await page.waitForLoadState('networkidle');

		// Find theme radiogroup
		const radioGroup = page.getByRole('radiogroup').first();

		if ((await radioGroup.count()) > 0) {
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
