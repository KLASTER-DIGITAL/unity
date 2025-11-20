#!/usr/bin/env node

/**
 * Clear PWA Cache Script
 *
 * This script increments the Service Worker cache version to force cache invalidation
 * on the next deployment. This ensures users see the latest changes immediately.
 *
 * Usage:
 *   node scripts/clear-pwa-cache.js
 *
 * What it does:
 *   1. Reads current cache version from public/service-worker.js
 *   2. Increments the version number
 *   3. Updates service-worker.js with new version
 *   4. Updates main.tsx APP_VERSION
 *
 * Example:
 *   Before: const CACHE_VERSION = 'v1.0.0';
 *   After:  const CACHE_VERSION = 'v1.0.1';
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SW_PATH = join(process.cwd(), 'public', 'service-worker.js');
const MAIN_PATH = join(process.cwd(), 'src', 'main.tsx');

console.log('🔄 Clearing PWA Cache...');

try {
	// Read service-worker.js
	let swContent = readFileSync(SW_PATH, 'utf-8');

	// Extract current version from CACHE_NAME (format: 'achievement-diary-v4af247e')
	const cacheNameMatch = swContent.match(/const CACHE_NAME = ['"]achievement-diary-v([^'"]+)['"]/);
	if (!cacheNameMatch) {
		console.error('❌ Could not find CACHE_NAME in service-worker.js');
		process.exit(1);
	}

	const currentVersion = cacheNameMatch[1];
	console.log(`📦 Current cache version: v${currentVersion}`);

	// Generate new version (timestamp-based to ensure uniqueness)
	const timestamp = Date.now().toString(36);
	const newVersion = timestamp;

	console.log(`📦 New cache version: v${newVersion}`);

	// Update all CACHE_NAME constants in service-worker.js
	swContent = swContent.replace(
		/const CACHE_NAME = ['"]achievement-diary-v[^'"]+['"]/,
		`const CACHE_NAME = 'achievement-diary-v${newVersion}'`
	);
	swContent = swContent.replace(
		/const CACHE_NAME_API = ['"]achievement-diary-api-v[^'"]+['"]/,
		`const CACHE_NAME_API = 'achievement-diary-api-v${newVersion}'`
	);
	swContent = swContent.replace(
		/const CACHE_NAME_STATIC = ['"]achievement-diary-static-v[^'"]+['"]/,
		`const CACHE_NAME_STATIC = 'achievement-diary-static-v${newVersion}'`
	);
	writeFileSync(SW_PATH, swContent, 'utf-8');

	// Update main.tsx APP_VERSION (use package.json version)
	const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));
	const appVersion = packageJson.version;

	let mainContent = readFileSync(MAIN_PATH, 'utf-8');
	mainContent = mainContent.replace(
		/const APP_VERSION = ['"][^'"]+['"]/,
		`const APP_VERSION = '${appVersion}'`
	);
	writeFileSync(MAIN_PATH, mainContent, 'utf-8');

	console.log('✅ PWA cache version updated!');
	console.log(`   Service Worker: v${newVersion}`);
	console.log(`   App Version: ${appVersion}`);
	console.log('');
	console.log('💡 Next steps:');
	console.log('   1. Test locally: npm run dev');
	console.log('   2. Open browser: http://localhost:5173');
	console.log('   3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)');
	console.log('   4. Check Application > Service Workers > Unregister');
	console.log('   5. Reload page to see changes');
} catch (error) {
	console.error('❌ Error:', error.message);
	process.exit(1);
}
