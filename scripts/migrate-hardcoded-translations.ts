#!/usr/bin/env tsx
/**
 * Migration Script: Hardcoded Translations → Supabase Database
 *
 * Мигрирует все hardcoded переводы из TypeScript файлов в таблицу translations
 *
 * Источники:
 * - src/shared/lib/i18n/pwa-translations.ts (PWA переводы)
 * - src/features/mobile/auth/components/auth-screen/translations.ts (Auth переводы)
 * - src/features/mobile/auth/components/onboarding3/constants.ts (Onboarding3 переводы)
 * - src/features/mobile/auth/components/onboarding4/translations.ts (Onboarding4 переводы)
 *
 * Usage: npm run migrate:translations
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { authTranslations } from '../src/features/mobile/auth/components/auth-screen/translations';
import { translations as onboarding3Translations } from '../src/features/mobile/auth/components/onboarding3/constants';
import { onboarding4Translations } from '../src/features/mobile/auth/components/onboarding4/translations';
import { PWA_TRANSLATION_KEYS } from '../src/shared/lib/i18n/pwa-translations';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
	console.error('❌ Missing environment variables:');
	console.error('   VITE_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
	console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface TranslationEntry {
	translation_key: string;
	lang_code: string;
	translation_value: string;
}

/**
 * Конвертирует PWA переводы в формат для БД
 */
function convertPWATranslations(): TranslationEntry[] {
	const entries: TranslationEntry[] = [];
	const languages = ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja'];

	for (const [key, translations] of Object.entries(PWA_TRANSLATION_KEYS)) {
		for (const lang of languages) {
			const value = translations[lang as keyof typeof translations];
			if (value) {
				entries.push({
					translation_key: key,
					lang_code: lang,
					translation_value: value,
				});
			}
		}
	}

	return entries;
}

/**
 * Конвертирует Auth переводы в формат для БД
 */
function convertAuthTranslations(): TranslationEntry[] {
	const entries: TranslationEntry[] = [];
	const languages = ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja'];

	for (const lang of languages) {
		const translations = authTranslations[lang as keyof typeof authTranslations];
		if (translations) {
			for (const [key, value] of Object.entries(translations)) {
				entries.push({
					translation_key: `auth.${key}`,
					lang_code: lang,
					translation_value: value,
				});
			}
		}
	}

	return entries;
}

/**
 * Конвертирует Onboarding3 переводы в формат для БД
 */
function convertOnboarding3Translations(): TranslationEntry[] {
	const entries: TranslationEntry[] = [];
	const languages = ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja'];

	for (const lang of languages) {
		const translations = onboarding3Translations[lang as keyof typeof onboarding3Translations];
		if (translations) {
			for (const [key, value] of Object.entries(translations)) {
				// Handle arrays (presets)
				if (Array.isArray(value)) {
					value.forEach((item, index) => {
						entries.push({
							translation_key: `onboarding3.${key}.${index}`,
							lang_code: lang,
							translation_value: item,
						});
					});
				} else {
					entries.push({
						translation_key: `onboarding3.${key}`,
						lang_code: lang,
						translation_value: value,
					});
				}
			}
		}
	}

	return entries;
}

/**
 * Конвертирует Onboarding4 переводы в формат для БД
 */
function convertOnboarding4Translations(): TranslationEntry[] {
	const entries: TranslationEntry[] = [];
	const languages = ['ru', 'en', 'es', 'de', 'fr', 'zh', 'ja'];

	for (const lang of languages) {
		const translations = onboarding4Translations[lang as keyof typeof onboarding4Translations];
		if (translations) {
			for (const [key, value] of Object.entries(translations)) {
				entries.push({
					translation_key: `onboarding4.${key}`,
					lang_code: lang,
					translation_value: value,
				});
			}
		}
	}

	return entries;
}

/**
 * Главная функция миграции
 */
async function migrateTranslations() {
	console.log('🚀 Starting translation migration...\n');

	// 1. Собираем все переводы
	console.log('📦 Collecting translations from source files...');
	const pwaEntries = convertPWATranslations();
	const authEntries = convertAuthTranslations();
	const onboarding3Entries = convertOnboarding3Translations();
	const onboarding4Entries = convertOnboarding4Translations();

	const allEntries = [...pwaEntries, ...authEntries, ...onboarding3Entries, ...onboarding4Entries];

	console.log(`   ✅ PWA: ${pwaEntries.length} entries`);
	console.log(`   ✅ Auth: ${authEntries.length} entries`);
	console.log(`   ✅ Onboarding3: ${onboarding3Entries.length} entries`);
	console.log(`   ✅ Onboarding4: ${onboarding4Entries.length} entries`);
	console.log(`   📊 Total: ${allEntries.length} entries\n`);

	// 2. Проверяем существующие ключи
	console.log('🔍 Checking existing keys in database...');
	const { data: existingKeys, error: keysError } = await supabase
		.from('translations')
		.select('translation_key, lang_code');

	if (keysError) {
		console.error('❌ Error fetching existing keys:', keysError);
		process.exit(1);
	}

	const existingSet = new Set(
		existingKeys?.map((k) => `${k.translation_key}:${k.lang_code}`) || []
	);
	console.log(`   📊 Found ${existingSet.size} existing translations\n`);

	// 3. Фильтруем новые записи
	const newEntries = allEntries.filter(
		(entry) => !existingSet.has(`${entry.translation_key}:${entry.lang_code}`)
	);

	console.log(`   ✅ New entries to insert: ${newEntries.length}`);
	console.log(`   ⏭️  Skipping existing: ${allEntries.length - newEntries.length}\n`);

	if (newEntries.length === 0) {
		console.log('✅ All translations already exist in database!');
		return;
	}

	// 4. Вставляем новые переводы батчами по 100
	console.log('💾 Inserting new translations...');
	const BATCH_SIZE = 100;
	let inserted = 0;
	let failed = 0;

	for (let i = 0; i < newEntries.length; i += BATCH_SIZE) {
		const batch = newEntries.slice(i, i + BATCH_SIZE);
		const { error } = await supabase.from('translations').insert(batch);

		if (error) {
			console.error(`   ❌ Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
			failed += batch.length;
		} else {
			inserted += batch.length;
			console.log(`   ✅ Batch ${i / BATCH_SIZE + 1}: ${batch.length} entries inserted`);
		}
	}

	console.log('\n🎉 Migration completed!');
	console.log(`   ✅ Inserted: ${inserted}`);
	console.log(`   ❌ Failed: ${failed}`);
	console.log(`   ⏭️  Skipped: ${allEntries.length - newEntries.length}`);
	console.log(`   📊 Total: ${allEntries.length}`);
}

// Run migration
migrateTranslations()
	.then(() => {
		console.log('\n✅ Done!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ Migration failed:', error);
		process.exit(1);
	});
