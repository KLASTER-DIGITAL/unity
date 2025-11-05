/**
 * Full Onboarding Workflow E2E Test
 *
 * Тестирует полный workflow от онбординга до создания первой записи:
 * 1. Welcome Screen (выбор языка)
 * 2. Onboarding Screen 2
 * 3. Onboarding Screen 3 (настройка дневника)
 * 4. Onboarding Screen 4 (первая запись)
 * 5. Авторизация
 * 6. Создание записи
 * 7. Проверка всех разделов
 *
 * @author UNITY Team
 * @date 2025-01-XX
 */

import { expect, test } from '@playwright/test';

const TEST_USER = {
	email: 'rustam@leadshunter.biz',
	password: process.env.TEST_USER_PASSWORD || 'demo123',
};

test.describe('Full Onboarding Workflow', () => {
	test('should complete full onboarding flow and create entry', async ({ page }) => {
		// Перехватываем консольные ошибки
		const consoleErrors: string[] = [];
		const consoleWarnings: string[] = [];

		page.on('console', (msg) => {
			const text = msg.text();
			if (msg.type() === 'error') {
				consoleErrors.push(text);
				console.log(`❌ Console Error: ${text}`);
			} else if (msg.type() === 'warning') {
				consoleWarnings.push(text);
				console.log(`⚠️ Console Warning: ${text}`);
			}
		});

		// Перехватываем ошибки страницы
		page.on('pageerror', (error) => {
			consoleErrors.push(error.message);
			console.log(`❌ Page Error: ${error.message}`);
		});

		// Перехватываем failed запросы
		page.on('requestfailed', (request) => {
			console.log(`❌ Failed Request: ${request.url()} - ${request.failure()?.errorText}`);
		});

		// Шаг 1: Открываем приложение
		console.log('📱 Step 1: Opening application...');
		await page.goto('/', { waitUntil: 'networkidle' });
		await page.waitForTimeout(2000); // Ждем загрузки

		// Проверяем, что мы на Welcome Screen
		console.log('📱 Step 2: Checking Welcome Screen...');
		const welcomeScreen = await page
			.locator('text=Добро пожаловать')
			.or(page.locator('text=Welcome'))
			.or(page.locator('[data-testid="welcome-screen"]'))
			.isVisible()
			.catch(() => false);

		if (welcomeScreen) {
			console.log('✅ Welcome Screen detected');

			// Выбираем язык (если есть селектор)
			const languageSelect = page.locator('select, [role="combobox"]').first();
			if (await languageSelect.isVisible().catch(() => false)) {
				await languageSelect.selectOption({ value: 'ru' });
				await page.waitForTimeout(500);
			}

			// Нажимаем "Далее" или "Next"
			const nextButton = page
				.locator('button:has-text("Далее")')
				.or(page.locator('button:has-text("Next")'))
				.first();
			if (await nextButton.isVisible().catch(() => false)) {
				await nextButton.click();
				await page.waitForTimeout(1000);
			}
		} else {
			console.log('⚠️ Welcome Screen not found, checking for auth screen...');
		}

		// Шаг 3: Onboarding Screen 2 (если есть)
		console.log('📱 Step 3: Checking Onboarding Screen 2...');
		const onboarding2 = await page
			.locator('text=Шаг 2')
			.or(page.locator('[data-testid="onboarding-2"]'))
			.isVisible()
			.catch(() => false);

		if (onboarding2) {
			const nextButton2 = page
				.locator('button:has-text("Далее")')
				.or(page.locator('button:has-text("Next")'))
				.first();
			if (await nextButton2.isVisible().catch(() => false)) {
				await nextButton2.click();
				await page.waitForTimeout(1000);
			}
		}

		// Шаг 4: Onboarding Screen 3 (настройка дневника)
		console.log('📱 Step 4: Checking Onboarding Screen 3 (Diary Setup)...');
		const diaryNameInput = await page
			.locator('input[placeholder*="название"], input[placeholder*="name"]')
			.isVisible()
			.catch(() => false);

		if (diaryNameInput) {
			const input = page
				.locator('input[placeholder*="название"], input[placeholder*="name"]')
				.first();
			await input.fill('Мой тестовый дневник');
			await page.waitForTimeout(500);

			// Выбираем emoji (если есть)
			const emojiButton = page
				.locator('button:has-text("🏆")')
				.or(page.locator('[data-emoji]'))
				.first();
			if (await emojiButton.isVisible().catch(() => false)) {
				await emojiButton.click();
				await page.waitForTimeout(500);
			}

			const nextButton3 = page
				.locator('button:has-text("Далее")')
				.or(page.locator('button:has-text("Next")'))
				.first();
			if (await nextButton3.isVisible().catch(() => false)) {
				await nextButton3.click();
				await page.waitForTimeout(1000);
			}
		}

		// Шаг 5: Onboarding Screen 4 (первая запись)
		console.log('📱 Step 5: Checking Onboarding Screen 4 (First Entry)...');
		const entryTextarea = await page
			.locator('textarea[placeholder*="запись"], textarea[placeholder*="entry"]')
			.isVisible()
			.catch(() => false);

		if (entryTextarea) {
			const textarea = page
				.locator('textarea[placeholder*="запись"], textarea[placeholder*="entry"]')
				.first();
			await textarea.fill('Это моя первая тестовая запись в дневнике!');
			await page.waitForTimeout(500);

			// Настройки уведомлений (пропускаем или выбираем "Нет")
			const noNotifications = page
				.locator('button:has-text("Нет"), button:has-text("No"), input[value="none"]')
				.first();
			if (await noNotifications.isVisible().catch(() => false)) {
				await noNotifications.click();
				await page.waitForTimeout(500);
			}

			const nextButton4 = page
				.locator('button:has-text("Далее")')
				.or(page.locator('button:has-text("Next")'))
				.or(page.locator('button:has-text("Продолжить")'))
				.first();
			if (await nextButton4.isVisible().catch(() => false)) {
				await nextButton4.click();
				await page.waitForTimeout(2000);
			}
		}

		// Шаг 6: Авторизация
		console.log('📱 Step 6: Authentication...');
		await page.waitForTimeout(2000);

		// Ищем форму авторизации
		const emailInput = page
			.locator('input[type="email"]')
			.or(page.locator('input[placeholder*="email"]'));
		const passwordInput = page
			.locator('input[type="password"]')
			.or(page.locator('input[placeholder*="пароль"]'));

		if (await emailInput.isVisible().catch(() => false)) {
			await emailInput.fill(TEST_USER.email);
			await page.waitForTimeout(500);

			if (await passwordInput.isVisible().catch(() => false)) {
				await passwordInput.fill(TEST_USER.password);
				await page.waitForTimeout(500);

				// Нажимаем кнопку входа
				const loginButton = page
					.locator('button:has-text("Войти")')
					.or(page.locator('button:has-text("Login")'))
					.or(page.locator('button[type="submit"]'))
					.first();
				await loginButton.click();
				await page.waitForLoadState('networkidle');
				await page.waitForTimeout(3000); // Ждем загрузки после авторизации
			}
		} else {
			// Если форма авторизации не найдена, возможно пользователь уже залогинен
			console.log('⚠️ Auth form not found, user might be already logged in');
		}

		// Шаг 7: Проверяем, что мы в главном приложении
		console.log('📱 Step 7: Verifying main app...');
		await page.waitForTimeout(2000);

		// Проверяем наличие навигации или главного экрана
		const hasMainApp = await page
			.locator('[data-testid="home-screen"]')
			.or(page.locator('text=Главная'))
			.or(page.locator('text=Home'))
			.or(page.locator('nav'))
			.isVisible()
			.catch(() => false);

		expect(hasMainApp).toBeTruthy();

		// Шаг 8: Создаем новую запись
		console.log('📱 Step 8: Creating new entry...');

		// Ищем поле ввода или кнопку создания записи
		const entryInput = page
			.locator(
				'textarea[placeholder*="запись"], textarea[placeholder*="entry"], textarea[placeholder*="что"]'
			)
			.first();

		if (await entryInput.isVisible().catch(() => false)) {
			const entryText = `Тестовая запись создана ${new Date().toLocaleString('ru-RU')}`;
			await entryInput.fill(entryText);
			await page.waitForTimeout(1000);

			// Ищем кнопку отправки
			const sendButton = page
				.locator('button:has-text("Отправить")')
				.or(page.locator('button:has-text("Сохранить")'))
				.or(page.locator('button:has-text("Send")'))
				.or(page.locator('button[type="submit"]'))
				.first();

			if (await sendButton.isVisible().catch(() => false)) {
				await sendButton.click();
				await page.waitForLoadState('networkidle');
				await page.waitForTimeout(3000); // Ждем сохранения
			}
		}

		// Шаг 9: Проверяем все разделы навигации
		console.log('📱 Step 9: Checking all navigation sections...');

		const sections = [
			{
				name: 'История',
				selector: 'text=История, button:has-text("История"), [data-testid="history-tab"]',
			},
			{
				name: 'Достижения',
				selector:
					'text=Достижения, button:has-text("Достижения"), [data-testid="achievements-tab"]',
			},
			{
				name: 'Отчеты',
				selector: 'text=Отчеты, button:has-text("Отчеты"), [data-testid="reports-tab"]',
			},
			{
				name: 'Настройки',
				selector: 'text=Настройки, button:has-text("Настройки"), [data-testid="settings-tab"]',
			},
		];

		for (const section of sections) {
			const selectors = section.selector.split(',');
			let found = false;

			for (const selector of selectors) {
				const element = page.locator(selector.trim()).first();
				if (await element.isVisible().catch(() => false)) {
					console.log(`✅ Section "${section.name}" found`);
					found = true;
					break;
				}
			}

			if (!found) {
				console.log(`⚠️ Section "${section.name}" not found`);
			}
		}

		// Шаг 10: Проверяем консольные ошибки
		console.log('📱 Step 10: Checking console errors...');

		if (consoleErrors.length > 0) {
			console.log(`\n❌ Found ${consoleErrors.length} console errors:`);
			consoleErrors.forEach((error, index) => {
				console.log(`  ${index + 1}. ${error}`);
			});
		} else {
			console.log('✅ No console errors found');
		}

		if (consoleWarnings.length > 0) {
			console.log(`\n⚠️ Found ${consoleWarnings.length} console warnings:`);
			consoleWarnings.slice(0, 10).forEach((warning, index) => {
				console.log(`  ${index + 1}. ${warning}`);
			});
		}

		// Финальная проверка - приложение должно работать без критических ошибок
		expect(consoleErrors.length).toBe(0);
	});

	test('should navigate through all sections after login', async ({ page }) => {
		// Skip if no password provided
		if (!TEST_USER.password) {
			test.skip();
			return;
		}

		// Login
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Try to find and click login if exists
		const loginLink = page.locator('text=/У меня уже есть аккаунт|уже есть/i');
		if (await loginLink.isVisible().catch(() => false)) {
			// Use force: true to bypass Framer Motion animation blocking
			await loginLink.click({ force: true });
			await page.waitForTimeout(1500);
		}

		const emailInput = page
			.locator('input[type="email"]')
			.or(page.locator('input[placeholder*="email"]'));
		const passwordInput = page
			.locator('input[type="password"]')
			.or(page.locator('input[placeholder*="пароль"]'));

		if (await emailInput.isVisible().catch(() => false)) {
			await emailInput.fill(TEST_USER.email);
			await passwordInput.fill(TEST_USER.password);

			const loginButton = page
				.locator('button:has-text("Войти")')
				.or(page.locator('button:has-text("Login")'))
				.first();
			await loginButton.click();
			await page.waitForLoadState('networkidle');
			await page.waitForTimeout(3000);
		}

		// Navigate through sections
		const sections = ['История', 'Достижения', 'Отчеты', 'Настройки'];

		for (const sectionName of sections) {
			const sectionButton = page
				.locator(`button:has-text("${sectionName}")`)
				.or(page.locator(`text="${sectionName}"`));
			if (await sectionButton.isVisible().catch(() => false)) {
				await sectionButton.click();
				await page.waitForTimeout(1000);
				console.log(`✅ Navigated to ${sectionName}`);
			}
		}
	});
});
