#!/usr/bin/env node
/**
 * UI Testing Script
 * Tests the UI changes: Success Modal, Feed, AI Cards
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'rustam@leadshunter.biz';
const PASSWORD = 'demo123';

async function main() {
	console.log('🚀 Starting UI tests...\n');

	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();

	try {
		// 1. Navigate to app
		console.log('📱 Opening app...');
		await page.goto(BASE_URL);
		await page.waitForLoadState('networkidle');

		// 2. Click "У меня уже есть аккаунт"
		console.log('🔐 Clicking login button...');
		await page.click('button:has-text("У меня уже есть аккаунт")');
		await page.waitForTimeout(1000);

		// 3. Fill login form
		console.log('✍️  Filling credentials...');
		await page.fill('input[type="email"]', EMAIL);
		await page.fill('input[type="password"]', PASSWORD);

		// 4. Submit login
		console.log('🔑 Logging in...');
		await page.click('button:has-text("Войти")');
		await page.waitForTimeout(3000);

		// 5. Check console for errors
		console.log('\n📊 Console messages:');
		const logs = [];
		page.on('console', (msg) => {
			const text = msg.text();
			if (msg.type() === 'error') {
				console.log(`  ❌ ERROR: ${text}`);
				logs.push({ type: 'error', text });
			}
		});

		await page.waitForTimeout(2000);

		// 6. Create test entry
		console.log('\n✏️  Creating test entry...');
		const testText = 'Тестовая запись для проверки UI ' + new Date().toLocaleTimeString();

		const textarea = await page.locator('textarea').first();
		await textarea.fill(testText);
		await page.waitForTimeout(500);

		// 7. Click send button (try multiple selectors)
		console.log('📤 Sending entry...');
		try {
			await page.click('button[aria-label="Отправить"]', { timeout: 5000 });
		} catch {
			// Try alternative selector - SVG send icon
			await page.click('button:has(svg)', { timeout: 5000 });
		}

		// 8. Wait for Success Modal to appear
		console.log('\n🎉 Waiting for Success Modal...');
		await page.waitForTimeout(1000);

		// Check for Success Modal
		const successModal = await page.locator('text=Успешно!').isVisible();
		if (successModal) {
			console.log('  ✅ SUCCESS MODAL FOUND (старый дизайн с конфетти)');
			console.log('  ✅ Confetti animation should be visible');
		} else {
			console.log('  ❌ SUCCESS MODAL NOT FOUND');
			// Try to find any modal
			const anyModal = await page.locator('[role="dialog"]').count();
			console.log(`  📝 Found ${anyModal} modal(s) on page`);
		}

		await page.waitForTimeout(4000);

		// 9. Check feed
		console.log('\n📋 Checking Recent Entries Feed...');
		const feedEntries = await page.locator('[data-testid="entry-item"]').count();
		console.log(`  📝 Found ${feedEntries} entries in feed`);

		if (feedEntries > 0) {
			const firstEntry = await page.locator('[data-testid="entry-item"]').first();
			const entryText = await firstEntry.textContent();
			console.log(`  📄 First entry preview: ${entryText?.substring(0, 100)}...`);

			if (entryText?.includes('AI:')) {
				console.log('  ✅ AI ANALYSIS FOUND in feed');
			} else {
				console.log('  ⚠️  AI ANALYSIS NOT FOUND in feed');
			}
		}

		// 10. Check AI Cards
		console.log('\n🎴 Checking AI Motivation Cards...');
		await page.waitForTimeout(2000);

		// Look for card elements
		const cards = await page.locator('.rounded-\\[36px\\]').count();
		console.log(`  🃏 Found ${cards} card elements`);

		// 11. Final console check
		console.log('\n📊 Final Console Check:');
		const errorCount = logs.filter((l) => l.type === 'error').length;
		console.log(`  Total errors: ${errorCount}`);

		if (errorCount === 0) {
			console.log('  ✅ NO CONSOLE ERRORS!');
		} else {
			console.log('  ❌ FOUND CONSOLE ERRORS');
			logs
				.filter((l) => l.type === 'error')
				.forEach((log) => {
					console.log(`    - ${log.text}`);
				});
		}

		// 12. Take screenshot
		console.log('\n📸 Taking screenshot...');
		await page.screenshot({ path: 'test-result.png', fullPage: true });
		console.log('  ✅ Screenshot saved: test-result.png');

		console.log('\n✅ Test completed!');
		console.log('\n📋 Summary:');
		console.log(`  - Success Modal: ${successModal ? '✅' : '❌'}`);
		console.log(`  - Feed entries: ${feedEntries}`);
		console.log(`  - Console errors: ${errorCount}`);
	} catch (error) {
		console.error('\n❌ Test failed:', error);
	} finally {
		await page.waitForTimeout(5000);
		await browser.close();
	}
}

main();
