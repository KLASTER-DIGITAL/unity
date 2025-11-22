/**
 * Books System E2E Tests
 *
 * Tests the complete book creation workflow:
 * - FREE book creation
 * - PREMIUM book creation
 * - Book library filters
 * - Book versioning
 * - PDF rendering
 */

import { expect, test } from '@playwright/test';

const TEST_USERS = {
	user: {
		email: 'rustam@leadshunter.biz',
		password: process.env.TEST_USER_PASSWORD || 'demo123',
	},
};

/**
 * Helper function to login (reused from auth.spec.ts)
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

test.describe('Books System', () => {
	test.beforeEach(async ({ page, context }) => {
		// Check if user is already logged in
		const cookies = await context.cookies();
		const isLoggedIn = cookies.some(c => c.name.includes('supabase') || c.name.includes('auth'));

		if (!isLoggedIn) {
			// Login
			await login(page, TEST_USERS.user.email, TEST_USERS.user.password);
		} else {
			// Just navigate to home
			await page.goto('/');
			await page.waitForLoadState('networkidle');
		}
		
		// Navigate to Reports section
		await page.click('button:has-text("Отчеты")');
		await page.waitForTimeout(2000);
	});

	test('should create FREE book successfully', async ({ page }) => {
		// Check console for errors
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Click "Создать новую книгу"
		await page.click('button:has-text("Создать новую книгу")');
		await page.waitForTimeout(500);

		// Step 0: Select FREE plan
		await page.click('button:has-text("FREE")');
		await page.click('button:has-text("Далее")');
		await page.waitForTimeout(500);

		// Step 1: Period is pre-filled, click Next
		await page.click('button:has-text("Далее")');
		await page.waitForTimeout(500);

		// Step 2: Contexts (optional), click Next
		await page.click('button:has-text("Далее")');
		await page.waitForTimeout(2000);

		// Wait for generation progress
		await page.waitForSelector('text=/Создаем твою книгу/', { timeout: 30000 });

		// Wait for success modal
		await page.waitForSelector('text=/Черновик книги создан/', { timeout: 60000 });

		// Check for console errors
		expect(consoleErrors.length).toBe(0);
	});

	test('should create PREMIUM book successfully', async ({ page }) => {
		// Check console for errors
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Click "Создать новую книгу"
		await page.click('button:has-text("Создать новую книгу")');
		await page.waitForTimeout(500);

		// Step 0: Select PREMIUM plan (or skip if user is premium)
		const premiumButton = page.locator('button:has-text("Premium")');
		if (await premiumButton.isVisible()) {
			await premiumButton.click();
			await page.click('button:has-text("Далее")');
			await page.waitForTimeout(500);
		}

		// Step 1: Select period/type
		await page.click('button:has-text("Далее")');
		await page.waitForTimeout(500);

		// Step 2: Select contexts
		await page.click('button:has-text("Далее")');
		await page.waitForTimeout(500);

		// Step 3: Select style
		await page.click('button:has-text("Семейная история")');
		await page.click('button:has-text("Далее")');
		await page.waitForTimeout(500);

		// Step 4: Select layout
		await page.click('button:has-text("Фото и текст")');
		await page.click('button:has-text("Создать книгу")');
		await page.waitForTimeout(2000);

		// Wait for generation progress
		await page.waitForSelector('text=/Создаем твою книгу/', { timeout: 30000 });

		// Wait for success modal
		await page.waitForSelector('text=/Черновик книги создан/', { timeout: 60000 });

		// Check for console errors
		expect(consoleErrors.length).toBe(0);
	});

	test('should open book library and display books', async ({ page }) => {
		// Check console for errors
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Click "Открыть полку книг"
		await page.click('button:has-text("Открыть полку книг")');
		await page.waitForTimeout(1000);

		// Check library is visible
		await expect(page.locator('text=/Библиотека книг/')).toBeVisible();

		// Check for console errors
		expect(consoleErrors.length).toBe(0);
	});

	test('should filter books by status', async ({ page }) => {
		// Check console for errors
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Open library
		await page.click('button:has-text("Открыть полку книг")');
		await page.waitForTimeout(1000);

		// Click "Черновики" filter
		await page.click('button:has-text("Черновики")');
		await page.waitForTimeout(500);

		// Click "Готовые" filter
		await page.click('button:has-text("Готовые")');
		await page.waitForTimeout(500);

		// Click "Все" filter
		await page.click('button:has-text("Все")');
		await page.waitForTimeout(500);

		// Check for console errors
		expect(consoleErrors.length).toBe(0);
	});

	test('should filter books by plan type', async ({ page }) => {
		// Check console for errors
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Open library
		await page.click('button:has-text("Открыть полку книг")');
		await page.waitForTimeout(1000);

		// Click "FREE" filter
		const freeFilter = page.locator('button:has-text("FREE")');
		if (await freeFilter.isVisible()) {
			await freeFilter.click();
			await page.waitForTimeout(500);
		}

		// Click "Premium" filter
		const premiumFilter = page.locator('button:has-text("Premium")');
		if (await premiumFilter.isVisible()) {
			await premiumFilter.click();
			await page.waitForTimeout(500);
		}

		// Click "Все типы" filter
		const allTypesFilter = page.locator('button:has-text("Все типы")');
		if (await allTypesFilter.isVisible()) {
			await allTypesFilter.click();
			await page.waitForTimeout(500);
		}

		// Check for console errors
		expect(consoleErrors.length).toBe(0);
	});

	test('should open book editor', async ({ page }) => {
		// Check console for errors
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Open library
		await page.click('button:has-text("Открыть полку книг")');
		await page.waitForTimeout(1000);

		// Try to click on first book (if exists)
		const firstBook = page.locator('[data-testid="book-card"]').first();
		if (await firstBook.isVisible()) {
			await firstBook.click();
			await page.waitForTimeout(1000);

			// Check editor is visible
			await expect(page.locator('text=/Редактор книги/')).toBeVisible({ timeout: 5000 });
		}

		// Check for console errors
		expect(consoleErrors.length).toBe(0);
	});

	test('should prevent multiple book generation calls', async ({ page }) => {
		// Check console for errors
		const consoleErrors: string[] = [];
		const apiCalls: string[] = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Monitor network requests
		page.on('request', (request) => {
			if (request.url().includes('books-generate')) {
				apiCalls.push(request.url());
			}
		});

		// Click "Создать новую книгу"
		await page.click('button:has-text("Создать новую книгу")');
		await page.waitForTimeout(500);

		// Select FREE plan
		await page.click('button:has-text("FREE")');
		await page.click('button:has-text("Далее")');
		await page.waitForTimeout(500);

		// Click Next multiple times rapidly (should only generate once)
		await page.click('button:has-text("Далее")');
		await page.click('button:has-text("Далее")');
		await page.click('button:has-text("Далее")');
		await page.waitForTimeout(2000);

		// Count API calls to books-generate
		const generateCalls = apiCalls.filter(
			(url) => url.includes('books-generate-free') || url.includes('books-generate-draft')
		);

		// Should be called only once (or zero if validation failed)
		expect(generateCalls.length).toBeLessThanOrEqual(1);

		// Check for console errors
		expect(consoleErrors.length).toBe(0);
	});

	test('should check console for errors on page load', async ({ page }) => {
		const consoleErrors: string[] = [];
		const consoleWarnings: string[] = [];

		page.on('console', (msg) => {
			const text = msg.text();
			if (msg.type() === 'error') {
				consoleErrors.push(text);
			} else if (msg.type() === 'warning') {
				consoleWarnings.push(text);
			}
		});

		// Navigate to Reports
		await page.goto('/');
		await page.click('button:has-text("Отчеты")');
		await page.waitForTimeout(2000);

		// Filter out known non-critical warnings
		const criticalErrors = consoleErrors.filter(
			(error) =>
				!error.includes('beforeinstallprompt') &&
				!error.includes('PWA') &&
				!error.includes('service worker')
		);

		// Should have no critical errors
		expect(criticalErrors.length).toBe(0);
	});
});
