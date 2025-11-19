/**
 * Translation Keys Scanner
 *
 * Автоматически сканирует кодовую базу на наличие t() вызовов
 * и синхронизирует ключи с Supabase БД
 *
 * ИСПОЛЬЗОВАНИЕ:
 * npm run scan:translations
 *
 * ЧТО ДЕЛАЕТ:
 * 1. Сканирует все .tsx/.ts файлы в src/pwa/mobile, src/features/mobile, src/shared/components
 * 2. Извлекает все вызовы t('key', 'fallback text')
 * 3. Сравнивает с БД (таблица translations)
 * 4. Добавляет недостающие ключи с русским текстом (fallback)
 * 5. Генерирует отчет о найденных/добавленных ключах
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Загружаем переменные окружения из .env
config();

// Supabase credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('❌ Missing Supabase credentials');
	console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Регулярное выражение для поиска t() вызовов
// Ищет: t('key', 'fallback text') или t("key", "fallback text")
const T_CALL_REGEX = /t\(\s*['"]([^'"]+)['"]\s*(?:,\s*['"]([^'"]*)['"]\s*)?\)/g;

interface TranslationKey {
	key: string;
	fallback: string;
	file: string;
	line: number;
}

/**
 * Сканирует файл на наличие t() вызовов
 */
function scanFile(filePath: string): TranslationKey[] {
	const content = fs.readFileSync(filePath, 'utf-8');
	const lines = content.split('\n');
	const keys: TranslationKey[] = [];

	for (const [index, line] of lines.entries()) {
		let match: RegExpExecArray | null = T_CALL_REGEX.exec(line);
		while (match !== null) {
			const key = match[1];
			const fallback = match[2] || key; // Если нет fallback, используем ключ

			keys.push({
				key,
				fallback,
				file: filePath,
				line: index + 1,
			});

			match = T_CALL_REGEX.exec(line);
		}
	}

	return keys;
}

/**
 * Рекурсивно сканирует директорию
 */
function scanDirectory(dir: string): TranslationKey[] {
	const keys: TranslationKey[] = [];

	const files = fs.readdirSync(dir);

	for (const file of files) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isDirectory()) {
			// Пропускаем node_modules, build, dist
			if (['node_modules', 'build', 'dist', '.git'].includes(file)) {
				continue;
			}
			keys.push(...scanDirectory(filePath));
		} else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
			// Пропускаем .test.ts, .spec.ts, .d.ts
			if (file.endsWith('.test.ts') || file.endsWith('.spec.ts') || file.endsWith('.d.ts')) {
				continue;
			}
			keys.push(...scanFile(filePath));
		}
	}

	return keys;
}

/**
 * Получает все существующие ключи из БД
 */
async function getExistingKeys(): Promise<Set<string>> {
	const { data, error } = await supabase
		.from('translations')
		.select('translation_key')
		.eq('lang_code', 'ru');

	if (error) {
		console.error('❌ Error fetching existing keys:', error);
		return new Set();
	}

	return new Set(data.map((row) => row.translation_key));
}

/**
 * Добавляет недостающие ключи в БД
 */
async function addMissingKeys(keys: TranslationKey[], existingKeys: Set<string>): Promise<number> {
	const missingKeys = keys.filter((k) => !existingKeys.has(k.key));

	if (missingKeys.length === 0) {
		return 0;
	}

	// Группируем по ключу (убираем дубликаты)
	const uniqueKeys = new Map<string, TranslationKey>();
	for (const key of missingKeys) {
		if (!uniqueKeys.has(key.key)) {
			uniqueKeys.set(key.key, key);
		}
	}

	// Добавляем в БД
	const rows = Array.from(uniqueKeys.values()).map((k) => ({
		translation_key: k.key,
		lang_code: 'ru',
		translation_value: k.fallback,
	}));

	const { error } = await supabase.from('translations').insert(rows);

	if (error) {
		console.error('❌ Error adding missing keys:', error);
		return 0;
	}

	return rows.length;
}

/**
 * Главная функция
 */
async function main() {
	console.log('🔍 Translation Keys Scanner');
	console.log('==========================\n');

	// Директории для сканирования (ТОЛЬКО пользовательский кабинет)
	const dirsToScan = [
		'src/pwa/mobile',
		'src/features/mobile',
		'src/shared/components',
		'src/shared/lib/i18n',
	];

	console.log('📂 Scanning directories:');
	for (const dir of dirsToScan) {
		console.log(`   - ${dir}`);
	}
	console.log('');

	// Сканируем все файлы
	const allKeys: TranslationKey[] = [];
	for (const dir of dirsToScan) {
		const keys = scanDirectory(dir);
		allKeys.push(...keys);
	}

	console.log(
		`✅ Found ${allKeys.length} t() calls in ${new Set(allKeys.map((k) => k.file)).size} files\n`
	);

	// Получаем существующие ключи из БД
	console.log('🔍 Checking database...');
	const existingKeys = await getExistingKeys();
	console.log(`✅ Found ${existingKeys.size} existing keys in database\n`);

	// Добавляем недостающие ключи
	console.log('📝 Adding missing keys...');
	const added = await addMissingKeys(allKeys, existingKeys);
	console.log(`✅ Added ${added} new keys to database\n`);

	// Генерируем отчет
	console.log('📊 Summary:');
	console.log(`   Total t() calls: ${allKeys.length}`);
	console.log(`   Unique keys: ${new Set(allKeys.map((k) => k.key)).size}`);
	console.log(`   Existing in DB: ${existingKeys.size}`);
	console.log(`   Added to DB: ${added}`);
}

main().catch(console.error);
