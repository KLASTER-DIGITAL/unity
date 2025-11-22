/**
 * Books System Console Check
 * 
 * Simple test to check console for errors on production
 */

import { expect, test } from '@playwright/test';

test('should have no console errors on Reports page', async ({ page }) => {
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

	// Navigate to production
	await page.goto('https://unity-wine.vercel.app');
	await page.waitForLoadState('networkidle');
	await page.waitForTimeout(3000);

	// Filter out known non-critical warnings
	const criticalErrors = consoleErrors.filter(error => 
		!error.includes('beforeinstallprompt') &&
		!error.includes('PWA') &&
		!error.includes('service worker') &&
		!error.includes('favicon')
	);

	// Should have no critical errors
	expect(criticalErrors.length).toBe(0);
	
	console.log(`Console errors: ${consoleErrors.length}`);
	console.log(`Console warnings: ${consoleWarnings.length}`);
	if (criticalErrors.length > 0) {
		console.log('Critical errors:', criticalErrors);
	}
});
