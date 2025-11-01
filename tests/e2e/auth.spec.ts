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

import { expect, test } from '@playwright/test';

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

/**
 * Helper function to navigate through WelcomeScreen and login
 * Handles Framer Motion animation blocking with force: true
 */
async function login(page: any, email: string, password: string) {
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
	await emailInput.fill(email, { timeout: 10000 });

	// Fill password
	const passwordInput = page.getByPlaceholder(/password|пароль/i);
	await passwordInput.fill(password, { timeout: 10000 });

	// Click login button
	const submitButton = page.getByRole('button', { name: /войти|login/i });
	await submitButton.click({ timeout: 10000 });

	// Wait for navigation
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(1000);
}

test.describe('Authentication', () => {
	test.beforeEach(async ({ page, context }) => {
		// Clear cookies and localStorage to ensure clean state
		await context.clearCookies();
		await page.goto('/');

		// Force logout by calling Supabase signOut
		await page.evaluate(async () => {
			// Clear all storage
			localStorage.clear();
			sessionStorage.clear();

			// Clear IndexedDB (Supabase stores session here)
			const databases = await indexedDB.databases();
			for (const db of databases) {
				if (db.name) {
					indexedDB.deleteDatabase(db.name);
				}
			}
		});

		await page.reload();
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000); // Wait for IndexedDB cleanup
	});

	test('should show welcome screen for unauthenticated users', async ({ page }) => {
		// Wait for page to load
		await page.waitForLoadState('networkidle');

		// Should show welcome screen or login form
		const hasWelcome = await page
			.locator('text=Добро пожаловать')
			.isVisible()
			.catch(() => false);
		const hasLogin = await page
			.locator('text=Войти')
			.isVisible()
			.catch(() => false);

		expect(hasWelcome || hasLogin).toBeTruthy();
	});

	test('should login as regular user', async ({ page }) => {
		// Skip if no password provided
		if (!TEST_USERS.user.password) {
			test.skip();
			return;
		}

		// Login using helper (handles WelcomeScreen navigation)
		await login(page, TEST_USERS.user.email, TEST_USERS.user.password);

		// Should redirect to main app (not admin panel)
		const url = page.url();
		expect(url).not.toContain('view=admin');

		// Should show user interface elements
		const hasUserUI = await page
			.locator('[data-testid="user-menu"]')
			.isVisible()
			.catch(() => false);
		expect(hasUserUI).toBeTruthy();
	});

	test('should login as admin and access admin panel', async ({ page }) => {
		// Skip if no password provided
		if (!TEST_USERS.admin.password) {
			test.skip();
			return;
		}

		// Navigate to admin login (skip WelcomeScreen)
		await page.goto('/?view=admin');
		await page.waitForLoadState('networkidle');

		// Fill login form (admin login doesn't have WelcomeScreen)
		const emailInput = page.getByPlaceholder(/email|почта/i);
		await emailInput.fill(TEST_USERS.admin.email, { timeout: 10000 });

		const passwordInput = page.getByPlaceholder(/password|пароль/i);
		await passwordInput.fill(TEST_USERS.admin.password, { timeout: 10000 });

		// Click login button
		const submitButton = page.getByRole('button', { name: /войти|login/i });
		await submitButton.click({ timeout: 10000 });

		// Wait for navigation
		await page.waitForLoadState('networkidle');

		// Should be in admin panel
		const url = page.url();
		expect(url).toContain('view=admin');

		// Should show admin interface
		const hasAdminUI = await page
			.locator('text=Админ-панель')
			.isVisible()
			.catch(() => false);
		expect(hasAdminUI).toBeTruthy();
	});

	test('should prevent regular user from accessing admin panel', async ({ page }) => {
		// Skip if no password provided
		if (!TEST_USERS.user.password) {
			test.skip();
			return;
		}

		// Login as regular user using helper
		await login(page, TEST_USERS.user.email, TEST_USERS.user.password);

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

		// Login first using helper
		await login(page, TEST_USERS.user.email, TEST_USERS.user.password);

		// Open settings or user menu
		await page.click('[data-testid="user-menu"]').catch(() => {
			// Fallback: try to find logout button directly
		});

		// Click logout
		await page.click('button:has-text("Выйти")');
		await page.waitForLoadState('networkidle');

		// Should show welcome screen again
		const hasWelcome = await page
			.locator('text=Добро пожаловать')
			.isVisible()
			.catch(() => false);
		const hasLogin = await page
			.locator('text=Войти')
			.isVisible()
			.catch(() => false);

		expect(hasWelcome || hasLogin).toBeTruthy();
	});

	test('should persist session after page reload', async ({ page }) => {
		// Skip if no password provided
		if (!TEST_USERS.user.password) {
			test.skip();
			return;
		}

		// Login using helper
		await login(page, TEST_USERS.user.email, TEST_USERS.user.password);

		// Reload page
		await page.reload();
		await page.waitForLoadState('networkidle');

		// Should still be logged in
		const hasUserUI = await page
			.locator('[data-testid="user-menu"]')
			.isVisible()
			.catch(() => false);
		expect(hasUserUI).toBeTruthy();
	});

	test('should show error for invalid credentials', async ({ page }) => {
		await page.goto('/');
		await page.waitForLoadState('networkidle');

		// Navigate through WelcomeScreen if present
		const welcomeSkipButton = page.getByText(/У меня уже есть аккаунт/i);
		const hasWelcomeScreen = (await welcomeSkipButton.count()) > 0;

		if (hasWelcomeScreen) {
			await welcomeSkipButton.click({ timeout: 5000, force: true });
			await page.waitForLoadState('networkidle');
			await page.waitForTimeout(1000);
		}

		// Check if we need to switch to login mode
		const authToggleButton = page.getByText(/Уже есть аккаунт\?/i);
		const needsToggle = (await authToggleButton.count()) > 0;

		if (needsToggle) {
			await authToggleButton.click({ timeout: 5000, force: true });
			await page.waitForTimeout(1000);
		}

		// Try to login with invalid credentials
		const emailInput = page.getByPlaceholder(/email|почта/i);
		await emailInput.fill('invalid@example.com', { timeout: 10000 });

		const passwordInput = page.getByPlaceholder(/password|пароль/i);
		await passwordInput.fill('wrongpassword', { timeout: 10000 });

		const submitButton = page.getByRole('button', { name: /войти|login/i });
		await submitButton.click({ timeout: 10000 });

		// Wait a bit for error message
		await page.waitForTimeout(2000);

		// Should show error message
		const hasError = await page
			.locator('text=Неверный')
			.isVisible()
			.catch(() => false);
		expect(hasError).toBeTruthy();
	});
});
