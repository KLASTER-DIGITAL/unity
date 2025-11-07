#!/usr/bin/env node

/**
 * Генерирует версию для Service Worker на основе git commit hash
 * Обновляет:
 * 1. public/service-worker.js - CACHE_NAME с git hash
 * 2. src/main.tsx - APP_VERSION с package.json version
 *
 * Запускается автоматически перед build через prebuild hook
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

// Получаем git commit hash (короткий, 7 символов)
function getGitHash() {
	try {
		const hash = execSync('git rev-parse --short=7 HEAD', { encoding: 'utf-8' }).trim();
		console.log(`[SW Version] Git hash: ${hash}`);
		return hash;
	} catch (error) {
		console.warn('[SW Version] Failed to get git hash, using timestamp');
		return Date.now().toString(36); // Fallback для CI без git
	}
}

// Получаем версию из package.json
function getPackageVersion() {
	const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
	return packageJson.version;
}

// Обновляем Service Worker
function updateServiceWorker(gitHash) {
	const swPath = path.join(__dirname, '../public/service-worker.js');
	let swContent = fs.readFileSync(swPath, 'utf-8');

	// Заменяем CACHE_NAME версии
	const cacheVersion = `v${gitHash}`;
	swContent = swContent.replace(
		/const CACHE_NAME = 'achievement-diary-v[^']+';/,
		`const CACHE_NAME = 'achievement-diary-${cacheVersion}';`
	);
	swContent = swContent.replace(
		/const CACHE_NAME_API = 'achievement-diary-api-v[^']+';/,
		`const CACHE_NAME_API = 'achievement-diary-api-${cacheVersion}';`
	);
	swContent = swContent.replace(
		/const CACHE_NAME_STATIC = 'achievement-diary-static-v[^']+';/,
		`const CACHE_NAME_STATIC = 'achievement-diary-static-${cacheVersion}';`
	);

	fs.writeFileSync(swPath, swContent, 'utf-8');
	console.log(`[SW Version] Updated Service Worker cache version to: ${cacheVersion}`);
}

// Обновляем main.tsx
function updateMainTsx(packageVersion) {
	const mainPath = path.join(__dirname, '../src/main.tsx');
	let mainContent = fs.readFileSync(mainPath, 'utf-8');

	// Заменяем APP_VERSION
	mainContent = mainContent.replace(
		/const APP_VERSION = '[^']+';/,
		`const APP_VERSION = '${packageVersion}';`
	);

	fs.writeFileSync(mainPath, mainContent, 'utf-8');
	console.log(`[SW Version] Updated main.tsx APP_VERSION to: ${packageVersion}`);
}

// Главная функция
function main() {
	console.log('[SW Version] Generating Service Worker version...');

	const gitHash = getGitHash();
	const packageVersion = getPackageVersion();

	updateServiceWorker(gitHash);
	updateMainTsx(packageVersion);

	console.log('[SW Version] ✅ Done!');
	console.log(`[SW Version] Cache version: v${gitHash}`);
	console.log(`[SW Version] App version: ${packageVersion}`);
}

main();

