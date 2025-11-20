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

	// Extract current version
	const versionMatch = swContent.match(/const CACHE_VERSION = ['"]v([^'"]+)['"]/);
	if (!versionMatch) {
		console.error('❌ Could not find CACHE_VERSION in service-worker.js');
		process.exit(1);
	}

	const currentVersion = versionMatch[1];
	console.log(`📦 Current cache version: v${currentVersion}`);

	// Increment version
	const versionParts = currentVersion.split('.');
	const lastPart = parseInt(versionParts[versionParts.length - 1], 10);
	versionParts[versionParts.length - 1] = String(lastPart + 1);
	const newVersion = versionParts.join('.');

	console.log(`📦 New cache version: v${newVersion}`);

	// Update service-worker.js
	swContent = swContent.replace(
		/const CACHE_VERSION = ['"]v[^'"]+['"]/,
		`const CACHE_VERSION = 'v${newVersion}'`
	);
	writeFileSync(SW_PATH, swContent, 'utf-8');

	// Update main.tsx APP_VERSION
	let mainContent = readFileSync(MAIN_PATH, 'utf-8');
	mainContent = mainContent.replace(
		/const APP_VERSION = ['"][^'"]+['"]/,
		`const APP_VERSION = '${newVersion}'`
	);
	writeFileSync(MAIN_PATH, mainContent, 'utf-8');

	console.log('✅ PWA cache version updated!');
	console.log(`   Service Worker: v${newVersion}`);
	console.log(`   App Version: ${newVersion}`);
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
