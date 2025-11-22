/**
 * Complete Books System Workflow Tests
 *
 * Full UI/UX testing including:
 * - Complete book creation workflow
 * - Console error checking at each step
 * - Library interactions
 * - Editor functionality
 */

import { expect, test } from '@playwright/test';

const TEST_USERS = {
	user: {
		email: 'rustam@leadshunter.biz',
		password: process.env.TEST_USER_PASSWORD || 'demo123',
	},
};

/**
 * Helper function to login
 */
async function login(page: any, email: string, password: string) {
	await page.goto('https://unity-wine.vercel.app');
	await page.waitForLoadState('networkidle');

	const welcomeSkipButton = page.getByText(/У меня уже есть аккаунт/i);
	const hasWelcomeScreen = (await welcomeSkipButton.count()) > 0;

	if (hasWelcomeScreen) {
		await welcomeSkipButton.click({ timeout: 5000, force: true });
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(1000);
	}

	const authToggleButton = page.getByText(/Уже есть аккаунт\?/i);
	const needsToggle = (await authToggleButton.count()) > 0;

	if (needsToggle) {
		await authToggleButton.click({ timeout: 5000, force: true });
		await page.waitForTimeout(1000);
	}

	const emailInput = page.getByPlaceholder(/email|почта/i);
	await emailInput.fill(email, { timeout: 10000 });

	const passwordInput = page.getByPlaceholder(/password|пароль/i);
	await passwordInput.fill(password, { timeout: 10000 });

	const submitButton = page.getByRole('button', { name: /войти|login/i });
	await submitButton.click({ timeout: 10000 });

	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(1000);
}

test.describe('Books System - Complete Workflow', () => {
	let consoleErrors: string[] = [];
	let consoleWarnings: string[] = [];

	test.beforeEach(async ({ page }) => {
		consoleErrors = [];
		consoleWarnings = [];

		// Monitor console
		page.on('console', (msg) => {
			const text = msg.text();
			if (msg.type() === 'error') {
				consoleErrors.push(text);
			} else if (msg.type() === 'warning') {
				consoleWarnings.push(text);
			}
		});

		// Navigate to production
		await page.goto('https://unity-wine.vercel.app');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Check if already logged in
		const reportsButton = page.getByRole('button', { name: /Отчеты|Reports/i });
		const isLoggedIn = await reportsButton.isVisible({ timeout: 5000 }).catch(() => false);

		if (!isLoggedIn) {
			// Login
			await login(page, TEST_USERS.user.email, TEST_USERS.user.password);
		}

		// Navigate to Reports
		await page.click('button:has-text("Отчеты")');
		await page.waitForTimeout(2000);
		await page.waitForSelector('text=/Отчеты|PDF книги/', { timeout: 10000 });
	});

	test.afterEach(async () => {
		// Filter out known non-critical errors
		const criticalErrors = consoleErrors.filter(
			(error) =>
				!error.includes('beforeinstallprompt') &&
				!error.includes('PWA') &&
				!error.includes('service worker') &&
				!error.includes('favicon') &&
				!error.includes('Sentry')
		);

		// Log results
		if (criticalErrors.length > 0) {
			console.log('Critical console errors:', criticalErrors);
		}
		if (consoleWarnings.length > 0) {
			console.log('Console warnings:', consoleWarnings);
		}

		// Assert no critical errors
		expect(criticalErrors.length).toBe(0);
	});

	test('Complete FREE book workflow: creation → editor → library', async ({ page }) => {
		// Step 1: Open book creation wizard
		const createButton = page.getByRole('button', { name: /Создать новую книгу|Create/i });
		await createButton.click({ timeout: 10000 });
		await page.waitForTimeout(1000);
		expect(consoleErrors.length).toBe(0);

		// Step 2: Select FREE plan
		const freeButton = page.getByRole('button', { name: /FREE/i });
		if (await freeButton.isVisible({ timeout: 5000 })) {
			await freeButton.click();
			await page.waitForTimeout(500);
			expect(consoleErrors.length).toBe(0);

			const nextButton = page.getByRole('button', { name: /Далее|Next/i });
			await nextButton.click();
			await page.waitForTimeout(1000);
		}

		// Step 3: Period selection (pre-filled)
		const nextButton1 = page.getByRole('button', { name: /Далее|Next/i });
		await nextButton1.click({ timeout: 10000 });
		await page.waitForTimeout(1000);
		expect(consoleErrors.length).toBe(0);

		// Step 4: Contexts (optional) - this triggers generation for FREE
		const nextButton2 = page.getByRole('button', { name: /Далее|Next/i });
		await nextButton2.click({ timeout: 10000 });
		await page.waitForTimeout(2000);

		// Step 5: Wait for generation (progress modal or success)
		try {
			await page.waitForSelector('text=/Создаем твою книгу|Черновик книги создан|Готово/', {
				timeout: 30000,
			});
		} catch {
			// If modal doesn't appear, check for success directly
			await page.waitForSelector('text=/Черновик книги создан|Готово/', { timeout: 60000 });
		}
		expect(consoleErrors.length).toBe(0);

		// Step 6: Click "Открыть редактор" or wait for auto-navigation
		const editorButton = page.getByRole('button', { name: /Открыть редактор|Open editor/i });
		if (await editorButton.isVisible({ timeout: 5000 })) {
			await editorButton.click();
			await page.waitForTimeout(2000);
		} else {
			// Editor might open automatically
			await page.waitForSelector('text=/Редактор книги|Editor/i', { timeout: 10000 });
		}
		expect(consoleErrors.length).toBe(0);

		// Step 7: Verify editor is open
		await expect(page.locator('text=/Редактор книги|Editor|Название книги/i')).toBeVisible({
			timeout: 10000,
		});
		expect(consoleErrors.length).toBe(0);

		// Step 8: Navigate to library
		const backButton = page.getByRole('button', { name: /Назад|Back/i }).first();
		if (await backButton.isVisible({ timeout: 5000 })) {
			await backButton.click();
			await page.waitForTimeout(1000);
		} else {
			// Or click library button
			await page.click('button:has-text("Открыть полку книг")');
			await page.waitForTimeout(2000);
		}

		// Step 9: Verify library is visible
		await expect(page.locator('text=/Библиотека книг|Library/i')).toBeVisible({ timeout: 10000 });
		expect(consoleErrors.length).toBe(0);
	});

	test('Complete PREMIUM book workflow: creation → editor → PDF', async ({ page }) => {
		// Check if user is premium
		const createButton = page.getByRole('button', { name: /Создать новую книгу|Create/i });
		await createButton.click({ timeout: 10000 });
		await page.waitForTimeout(1000);

		// Select PREMIUM plan (or skip if auto-selected)
		const premiumButton = page.getByRole('button', { name: /Premium/i });
		if (await premiumButton.isVisible({ timeout: 5000 })) {
			await premiumButton.click();
			await page.waitForTimeout(500);
			await page.getByRole('button', { name: /Далее|Next/i }).click();
			await page.waitForTimeout(1000);
		}

		// Step 1: Period/Type selection
		await page.getByRole('button', { name: /Далее|Next/i }).click({ timeout: 10000 });
		await page.waitForTimeout(1000);
		expect(consoleErrors.length).toBe(0);

		// Step 2: Contexts
		await page.getByRole('button', { name: /Далее|Next/i }).click({ timeout: 10000 });
		await page.waitForTimeout(1000);
		expect(consoleErrors.length).toBe(0);

		// Step 3: Style selection
		const styleButton = page.getByRole('button', { name: /Семейная история|Warm family/i });
		if (await styleButton.isVisible({ timeout: 5000 })) {
			await styleButton.click();
			await page.waitForTimeout(500);
		}
		await page.getByRole('button', { name: /Далее|Next/i }).click({ timeout: 10000 });
		await page.waitForTimeout(1000);
		expect(consoleErrors.length).toBe(0);

		// Step 4: Layout selection
		const layoutButton = page.getByRole('button', { name: /Фото и текст|Photo and text/i });
		if (await layoutButton.isVisible({ timeout: 5000 })) {
			await layoutButton.click();
			await page.waitForTimeout(500);
		}
		await page
			.getByRole('button', { name: /Создать книгу|Create book/i })
			.click({ timeout: 10000 });
		await page.waitForTimeout(2000);

		// Wait for generation
		try {
			await page.waitForSelector('text=/Создаем твою книгу|Черновик книги создан/', {
				timeout: 30000,
			});
		} catch {
			await page.waitForSelector('text=/Черновик книги создан|Готово/', { timeout: 60000 });
		}
		expect(consoleErrors.length).toBe(0);

		// Open editor
		const editorButton = page.getByRole('button', { name: /Открыть редактор|Open editor/i });
		if (await editorButton.isVisible({ timeout: 5000 })) {
			await editorButton.click();
			await page.waitForTimeout(2000);
		} else {
			await page.waitForSelector('text=/Редактор книги|Editor/i', { timeout: 10000 });
		}
		expect(consoleErrors.length).toBe(0);

		// Verify editor
		await expect(page.locator('text=/Редактор книги|Editor/i')).toBeVisible({ timeout: 10000 });
		expect(consoleErrors.length).toBe(0);
	});

	test('Library filters and interactions', async ({ page }) => {
		// Open library
		const libraryButton = page.getByRole('button', { name: /Открыть полку книг|Open library/i });
		await libraryButton.click({ timeout: 10000 });
		await page.waitForTimeout(2000);
		expect(consoleErrors.length).toBe(0);

		// Verify library is visible
		await expect(page.locator('text=/Библиотека книг|Library/i')).toBeVisible({ timeout: 10000 });
		expect(consoleErrors.length).toBe(0);

		// Test status filters
		const allFilter = page.getByRole('button', { name: /Все|All/i }).first();
		if (await allFilter.isVisible({ timeout: 5000 })) {
			await allFilter.click();
			await page.waitForTimeout(500);
			expect(consoleErrors.length).toBe(0);
		}

		const draftsFilter = page.getByRole('button', { name: /Черновики|Drafts/i });
		if (await draftsFilter.isVisible({ timeout: 5000 })) {
			await draftsFilter.click();
			await page.waitForTimeout(500);
			expect(consoleErrors.length).toBe(0);
		}

		const finalFilter = page.getByRole('button', { name: /Готовые|Final/i });
		if (await finalFilter.isVisible({ timeout: 5000 })) {
			await finalFilter.click();
			await page.waitForTimeout(500);
			expect(consoleErrors.length).toBe(0);
		}

		// Test plan type filters
		const allTypesFilter = page.getByRole('button', { name: /Все типы|All types/i });
		if (await allTypesFilter.isVisible({ timeout: 5000 })) {
			await allTypesFilter.click();
			await page.waitForTimeout(500);
			expect(consoleErrors.length).toBe(0);
		}

		const freeFilter = page.getByRole('button', { name: /^FREE$/i });
		if (await freeFilter.isVisible({ timeout: 5000 })) {
			await freeFilter.click();
			await page.waitForTimeout(500);
			expect(consoleErrors.length).toBe(0);
		}

		const premiumFilter = page.getByRole('button', { name: /^Premium$/i });
		if (await premiumFilter.isVisible({ timeout: 5000 })) {
			await premiumFilter.click();
			await page.waitForTimeout(500);
			expect(consoleErrors.length).toBe(0);
		}
	});

	test('Book editor functionality', async ({ page }) => {
		// Open library first
		const libraryButton = page.getByRole('button', { name: /Открыть полку книг|Open library/i });
		await libraryButton.click({ timeout: 10000 });
		await page.waitForTimeout(2000);

		// Try to open first book (if exists)
		const firstBookCard = page.locator('[data-testid="book-card"], .book-card, article').first();
		if (await firstBookCard.isVisible({ timeout: 5000 })) {
			await firstBookCard.click();
			await page.waitForTimeout(2000);
			expect(consoleErrors.length).toBe(0);

			// Verify editor is open
			await expect(page.locator('text=/Редактор книги|Editor|Название книги/i')).toBeVisible({
				timeout: 10000,
			});
			expect(consoleErrors.length).toBe(0);

			// Check tabs
			const editTab = page.getByRole('tab', { name: /Редактировать|Edit/i });
			const previewTab = page.getByRole('tab', { name: /Предпросмотр|Preview/i });

			if (await editTab.isVisible({ timeout: 5000 })) {
				await editTab.click();
				await page.waitForTimeout(500);
				expect(consoleErrors.length).toBe(0);
			}

			if (await previewTab.isVisible({ timeout: 5000 })) {
				await previewTab.click();
				await page.waitForTimeout(500);
				expect(consoleErrors.length).toBe(0);
			}
		}
	});

	test('Console check at each workflow step', async ({ page }) => {
		const stepErrors: Record<string, string[]> = {};

		// Step 1: Initial page load
		await page.waitForLoadState('networkidle');
		stepErrors.page_load = [...consoleErrors];
		expect(consoleErrors.length).toBe(0);

		// Step 2: Open Reports
		await page.click('button:has-text("Отчеты")');
		await page.waitForTimeout(2000);
		stepErrors.reports_open = [...consoleErrors];
		expect(consoleErrors.length).toBe(0);

		// Step 3: Open library
		const libraryButton = page.getByRole('button', { name: /Открыть полку книг|Open library/i });
		await libraryButton.click({ timeout: 10000 });
		await page.waitForTimeout(2000);
		stepErrors.library_open = [...consoleErrors];
		expect(consoleErrors.length).toBe(0);

		// Step 4: Open creation wizard
		const createButton = page.getByRole('button', { name: /Создать новую книгу|Create/i });
		await createButton.click({ timeout: 10000 });
		await page.waitForTimeout(1000);
		stepErrors.wizard_open = [...consoleErrors];
		expect(consoleErrors.length).toBe(0);

		// Log results
		console.log('Console errors by step:', stepErrors);
	});
});
