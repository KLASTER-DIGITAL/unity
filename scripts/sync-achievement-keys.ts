#!/usr/bin/env ts-node

/**
 * Sync Achievement Translation Keys
 *
 * Синхронизирует ключи достижений между языками:
 * 1. Добавляет недостающие ключи achievement.* в русский язык
 * 2. Запускает автоперевод для остальных языков
 *
 * Usage: npx ts-node scripts/sync-achievement-keys.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
	process.env.VITE_SUPABASE_URL || '',
	process.env.VITE_SUPABASE_ANON_KEY || ''
);

// Русские переводы достижений (на основе казахских переводов)
const achievementsTranslationsRU: Record<string, { name: string; description: string }> = {
	// COMMON ACHIEVEMENTS
	first_entry: { name: 'Первые шаги', description: 'Создайте вашу первую запись' },
	entries_5: { name: 'Начало пути', description: 'Создайте 5 записей' },
	entries_10: { name: 'Привычка формируется', description: 'Создайте 10 записей' },
	streak_3: { name: 'Три дня подряд', description: 'Создавайте записи 3 дня подряд' },
	streak_7: { name: 'Сила недели', description: 'Создавайте записи 7 дней подряд' },
	category_family_5: { name: 'Семейные ценности', description: 'Создайте 5 записей о семье' },
	category_health_5: { name: 'Забота о себе', description: 'Создайте 5 записей о здоровье' },
	category_work_5: { name: 'Профессиональный рост', description: 'Создайте 5 записей о работе' },
	category_finance_5: {
		name: 'Финансовая осознанность',
		description: 'Создайте 5 записей о финансах',
	},
	category_growth_5: { name: 'Путь развития', description: 'Создайте 5 записей о личном росте' },
	category_creativity_5: {
		name: 'Творческое начало',
		description: 'Создайте 5 записей о творчестве',
	},
	category_relationships_5: {
		name: 'Связи важны',
		description: 'Создайте 5 записей об отношениях',
	},
	category_gratitude_5: {
		name: 'Первые шаги благодарности',
		description: 'Создайте 5 записей о благодарности',
	},
	emotional_first_steps: {
		name: 'Первые эмоции',
		description: 'Создайте записи с 3 разными настроениями',
	},

	// RARE ACHIEVEMENTS
	entries_25: { name: 'Четверть сотни', description: 'Создайте 25 записей' },
	entries_50: { name: 'Пятьдесят побед', description: 'Создайте 50 записей' },
	streak_14: { name: 'Сила двух недель', description: 'Создавайте записи 14 дней подряд' },
	streak_30: { name: 'Месячная стабильность', description: 'Создавайте записи 30 дней подряд' },
	achievements_5: { name: 'Пять побед', description: 'Отметьте 5 достижений' },
	achievements_10: { name: 'Десять побед', description: 'Отметьте 10 достижений' },
	category_family_20: { name: 'Семья - главное', description: 'Создайте 20 записей о семье' },
	category_health_20: {
		name: 'Здоровый образ жизни',
		description: 'Создайте 20 записей о здоровье',
	},
	category_gratitude_10: {
		name: 'Благодарное сердце',
		description: 'Создайте 10 записей о благодарности',
	},
	category_finance_20: {
		name: 'Финансовый контроль',
		description: 'Создайте 20 записей о финансах',
	},
	category_growth_20: { name: 'Мастер роста', description: 'Создайте 20 записей о личном росте' },
	category_creativity_20: {
		name: 'Творческая душа',
		description: 'Создайте 20 записей о творчестве',
	},
	category_relationships_20: {
		name: 'Мастер отношений',
		description: 'Создайте 20 записей об отношениях',
	},
	category_work_20: { name: 'Фокус на работе', description: 'Создайте 20 записей о работе' },
	honest_difficult_day: {
		name: 'Правда в трудный день',
		description: 'Честно напишите о трудном дне',
	},
	emotional_variety: {
		name: 'Разнообразие чувств',
		description: 'Создайте записи с 6 разными настроениями',
	},
	comeback_7: { name: 'Возвращение', description: 'Вернитесь к записям после 7 дней перерыва' },

	// EPIC ACHIEVEMENTS
	entries_100: { name: 'Сто историй', description: 'Создайте 100 записей' },
	entries_250: { name: 'Четверть тысячи', description: 'Создайте 250 записей' },
	streak_60: { name: 'Сила двух месяцев', description: 'Создавайте записи 60 дней подряд' },
	streak_90: {
		name: 'Девяностодневная стабильность',
		description: 'Создавайте записи 90 дней подряд',
	},
	achievements_25: { name: 'Двадцать пять побед', description: 'Отметьте 25 достижений' },
	achievements_50: { name: 'Пятьдесят побед', description: 'Отметьте 50 достижений' },
	category_family_50: { name: 'Семейный мастер', description: 'Создайте 50 записей о семье' },
	category_health_50: { name: 'Мастер здоровья', description: 'Создайте 50 записей о здоровье' },
	category_work_50: { name: 'Профессионал', description: 'Создайте 50 записей о работе' },
	emotional_balance: {
		name: 'Эмоциональный баланс',
		description: 'Создайте записи с 10 разными настроениями',
	},
	comeback_30: {
		name: 'Великое возвращение',
		description: 'Вернитесь к записям после 30 дней перерыва',
	},

	// LEGENDARY ACHIEVEMENTS
	entries_500: { name: 'Пятьсот историй', description: 'Создайте 500 записей' },
	entries_1000: { name: 'Тысяча историй', description: 'Создайте 1000 записей' },
	streak_180: { name: 'Сила полугода', description: 'Создавайте записи 180 дней подряд' },
	streak_365: { name: 'Годовая стабильность', description: 'Создавайте записи 365 дней подряд' },
	achievements_100: { name: 'Сто побед', description: 'Отметьте 100 достижений' },
	achievements_250: { name: 'Легенда побед', description: 'Отметьте 250 достижений' },
	category_family_100: { name: 'Легенда семьи', description: 'Создайте 100 записей о семье' },
	category_health_100: { name: 'Легенда здоровья', description: 'Создайте 100 записей о здоровье' },
	category_gratitude_50: {
		name: 'Мастер благодарности',
		description: 'Создайте 50 записей о благодарности',
	},
	all_categories: {
		name: 'Мастер всех сфер',
		description: 'Создайте минимум 10 записей в каждой категории',
	},
	year_complete: { name: 'Год с UNITY', description: 'Используйте UNITY весь год' },
	first_honest_difficult_day: {
		name: 'Первый честный трудный день',
		description: 'Отметьте что хотя бы один день был трудным, но вы честно написали об этом',
	},
};

async function syncAchievementKeys() {
	console.log('🔄 Syncing achievement translation keys...\n');

	// 1. Получить все ключи достижений из казахского языка
	console.log('📋 Step 1: Getting achievement keys from Kazakh language...');
	const { data: kkKeys, error: kkError } = await supabase
		.from('translations')
		.select('translation_key')
		.eq('lang_code', 'kk')
		.like('translation_key', 'achievement.%')
		.order('translation_key');

	if (kkError) {
		console.error('❌ Error fetching Kazakh keys:', kkError);
		return;
	}

	console.log(`✅ Found ${kkKeys.length} achievement keys in Kazakh\n`);

	// 2. Получить существующие ключи в русском языке
	console.log('📋 Step 2: Checking existing keys in Russian...');
	const { data: ruKeys, error: ruError } = await supabase
		.from('translations')
		.select('translation_key')
		.eq('lang_code', 'ru')
		.like('translation_key', 'achievement.%');

	if (ruError) {
		console.error('❌ Error fetching Russian keys:', ruError);
		return;
	}

	const existingRuKeys = new Set(ruKeys?.map((k) => k.translation_key) || []);
	console.log(`✅ Found ${existingRuKeys.size} existing achievement keys in Russian\n`);

	// 3. Найти недостающие ключи
	const missingKeys =
		kkKeys?.filter((k) => !existingRuKeys.has(k.translation_key)).map((k) => k.translation_key) ||
		[];

	console.log(`📋 Step 3: Found ${missingKeys.length} missing keys in Russian\n`);

	if (missingKeys.length === 0) {
		console.log('✅ All keys are already synchronized!');
		return;
	}

	// 4. Добавить недостающие ключи в русский язык
	console.log('📋 Step 4: Adding missing keys to Russian...');
	let addedCount = 0;
	let errorCount = 0;

	for (const key of missingKeys) {
		// Извлечь ID достижения из ключа (например, achievement.entries_5.name -> entries_5)
		const match = key.match(/^achievement\.(.+)\.(name|description)$/);
		if (!match) {
			console.warn(`⚠️  Skipping invalid key format: ${key}`);
			continue;
		}

		const achievementId = match[1];
		const field = match[2] as 'name' | 'description';

		// Получить русский перевод
		const translation = achievementsTranslationsRU[achievementId];
		if (!translation) {
			console.warn(`⚠️  No Russian translation found for: ${achievementId}`);
			errorCount++;
			continue;
		}

		const value = translation[field];

		// Добавить в БД
		const { error } = await supabase.from('translations').upsert(
			{
				lang_code: 'ru',
				translation_key: key,
				translation_value: value,
			},
			{
				onConflict: 'lang_code,translation_key',
			}
		);

		if (error) {
			console.error(`❌ Error adding ${key}:`, error.message);
			errorCount++;
		} else {
			addedCount++;
			if (addedCount % 10 === 0) {
				console.log(`   ✅ Added ${addedCount} keys...`);
			}
		}
	}

	console.log(`\n📊 Summary:`);
	console.log(`   ✅ Added: ${addedCount} keys`);
	console.log(`   ❌ Errors: ${errorCount} keys`);
	console.log(`   📝 Total missing: ${missingKeys.length}`);

	if (addedCount > 0) {
		console.log('\n✅ Russian translations added successfully!');
		console.log('📋 Next step: Run auto-translate for other languages');
	}
}

syncAchievementKeys()
	.then(() => {
		console.log('\n✅ Done!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ Fatal error:', error);
		process.exit(1);
	});
