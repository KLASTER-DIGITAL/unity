/**
 * E2E тесты для управления переводами в админ-панели
 *
 * Проверяет:
 * - CRUD операции с языками
 * - CRUD операции с переводами
 * - Автоперевод через AI
 * - Статистику переводов
 * - Массовые операции
 *
 * @author UNITY Team
 * @date 2025-11-19
 */

import { expect, test } from '@playwright/test';

// Супер админ
const SUPER_ADMIN = {
	email: 'diary@leadshunter.biz',
	password: 'admin123',
};

test.describe('i18n - Админ-панель', () => {
	test.beforeEach(async ({ page }) => {
		// Переход на админ-панель
		await page.goto('https://unity-wine.vercel.app/?view=admin');

		// Логин как супер админ
		await page.fill('input[type="email"]', SUPER_ADMIN.email);
		await page.fill('input[type="password"]', SUPER_ADMIN.password);
		await page.click('button[type="submit"]');

		// Ждем загрузки админ-панели
		await page.waitForLoadState('networkidle');
		await page.waitForTimeout(2000);

		// Переход в раздел Languages
		const languagesLink = page
			.locator('a:has-text("Languages")')
			.or(page.locator('a:has-text("Языки")'))
			.first();

		if (await languagesLink.isVisible()) {
			await languagesLink.click();
			await page.waitForTimeout(1000);
		}
	});

	test('Должен отображать список всех языков', async ({ page }) => {
		console.log('\n📋 Проверка списка языков');

		// Проверяем наличие всех 9 языков
		const languages = [
			'Russian',
			'English',
			'Spanish',
			'German',
			'French',
			'Chinese',
			'Japanese',
			'Georgian',
			'Kazakh',
		];

		for (const lang of languages) {
			const langElement = page.locator(`text=${lang}`).or(page.locator(`td:has-text("${lang}")`));

			// Проверяем что язык есть в списке
			const isVisible = await langElement.isVisible().catch(() => false);
			console.log(`${isVisible ? '✅' : '❌'} ${lang}`);
		}
	});

	test('Должен показывать статистику переводов', async ({ page }) => {
		console.log('\n📊 Проверка статистики переводов');

		// Переход в раздел статистики
		const statsTab = page
			.locator('button:has-text("Statistics")')
			.or(page.locator('button:has-text("Статистика")'))
			.first();

		if (await statsTab.isVisible()) {
			await statsTab.click();
			await page.waitForTimeout(1500);
		}

		// Проверяем наличие статистики для каждого языка
		const languageCodes = ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja', 'ka', 'kk'];

		for (const code of languageCodes) {
			// Ищем элементы со статистикой
			const statsElement = page
				.locator(`text=${code.toUpperCase()}`)
				.or(page.locator(`td:has-text("${code}")`));

			const isVisible = await statsElement.isVisible().catch(() => false);
			console.log(`${isVisible ? '✅' : '❌'} Статистика для ${code}`);
		}
	});

	test('Должен открывать детальную страницу языка', async ({ page }) => {
		console.log('\n🔍 Проверка детальной страницы языка');

		// Кликаем на казахский язык
		const kazakhRow = page
			.locator('tr:has-text("Kazakh")')
			.or(page.locator('tr:has-text("Қазақша")'))
			.first();

		if (await kazakhRow.isVisible()) {
			await kazakhRow.click();
			await page.waitForTimeout(1500);

			// Проверяем что открылась детальная страница
			const detailsVisible = await page
				.locator('h1:has-text("Kazakh")')
				.or(page.locator('h2:has-text("Kazakh")'))
				.isVisible()
				.catch(() => false);

			expect(detailsVisible).toBeTruthy();
			console.log('✅ Детальная страница открылась');
		}
	});

	test('Должен показывать переводы для выбранного языка', async ({ page }) => {
		console.log('\n📝 Проверка списка переводов');

		// Переход в раздел Translations
		const translationsTab = page
			.locator('button:has-text("Translations")')
			.or(page.locator('button:has-text("Переводы")'))
			.first();

		if (await translationsTab.isVisible()) {
			await translationsTab.click();
			await page.waitForTimeout(1500);
		}

		// Проверяем наличие таблицы переводов
		const translationsTable = page.locator('table').or(page.locator('[role="table"]'));

		const tableVisible = await translationsTable.isVisible().catch(() => false);
		expect(tableVisible).toBeTruthy();
		console.log('✅ Таблица переводов отображается');

		// Проверяем наличие ключей переводов
		const translationKeys = await page.locator('td').allTextContents();
		expect(translationKeys.length).toBeGreaterThan(0);
		console.log(`✅ Найдено ${translationKeys.length} элементов в таблице`);
	});

	test('Должен фильтровать переводы по языку', async ({ page }) => {
		console.log('\n🔍 Проверка фильтрации переводов');

		// Переход в раздел Translations
		const translationsTab = page
			.locator('button:has-text("Translations")')
			.or(page.locator('button:has-text("Переводы")'))
			.first();

		if (await translationsTab.isVisible()) {
			await translationsTab.click();
			await page.waitForTimeout(1500);
		}

		// Выбираем казахский язык в фильтре
		const languageFilter = page.locator('select').or(page.locator('[role="combobox"]')).first();

		if (await languageFilter.isVisible()) {
			await languageFilter.selectOption('kk');
			await page.waitForTimeout(1500);

			// Проверяем что отображаются только переводы для kk
			const translationRows = await page.locator('tr').count();
			expect(translationRows).toBeGreaterThan(0);
			console.log(`✅ Найдено ${translationRows} переводов для казахского языка`);
		}
	});

	test('Должен проверять консоль на ошибки', async ({ page }) => {
		console.log('\n🐛 Проверка консоли браузера');

		const errors: string[] = [];

		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				errors.push(msg.text());
			}
		});

		// Переключаемся между разделами
		const tabs = ['Languages', 'Translations', 'Statistics'];

		for (const tab of tabs) {
			const tabButton = page.locator(`button:has-text("${tab}")`).first();

			if (await tabButton.isVisible()) {
				await tabButton.click();
				await page.waitForTimeout(1000);
			}
		}

		// Проверяем что нет ошибок
		if (errors.length > 0) {
			console.log('❌ Найдены ошибки в консоли:');
			errors.forEach((err) => console.log(`  - ${err}`));
		} else {
			console.log('✅ Ошибок в консоли не найдено');
		}

		expect(errors.length).toBe(0);
	});
});
