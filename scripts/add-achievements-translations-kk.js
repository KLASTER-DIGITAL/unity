#!/usr/bin/env node

/**
 * Add Kazakh translations for all achievements
 *
 * This script adds translations for achievement names and descriptions
 * to the translations table in Supabase.
 *
 * Usage: node scripts/add-achievements-translations-kk.js
 */

const { createClient } = require('@supabase/supabase-js');

// Use anon key for public access (translations table has RLS policies)
const supabase = createClient(
	'https://ecuwuzqlwdkkdncampnc.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNjI5NzcsImV4cCI6MjA0NDczODk3N30.Uu_qF1eF-VQGzJPKPOLHWnhિ0'
);

// Казахские переводы достижений
const achievementsTranslations = {
	// COMMON ACHIEVEMENTS
	first_entry: { name: 'Алғашқы қадамдар', description: 'Алғашқы жазбаңызды жасаңыз' },
	entries_5: { name: 'Жолдың басы', description: '5 жазба жасаңыз' },
	entries_10: { name: 'Әдет қалыптасуда', description: '10 жазба жасаңыз' },
	streak_3: { name: 'Үш күн қатарынан', description: '3 күн қатарынан жазба жасаңыз' },
	streak_7: { name: 'Апта күші', description: '7 күн қатарынан жазба жасаңыз' },
	category_family_5: {
		name: 'Отбасылық құндылықтар',
		description: 'Отбасы туралы 5 жазба жасаңыз',
	},
	category_health_5: {
		name: 'Өзіңізге қамқорлық',
		description: 'Денсаулық туралы 5 жазба жасаңыз',
	},
	category_work_5: { name: 'Кәсіби өсу', description: 'Жұмыс туралы 5 жазба жасаңыз' },
	category_finance_5: { name: 'Қаржылық саналылық', description: 'Қаржы туралы 5 жазба жасаңыз' },
	category_growth_5: { name: 'Даму жолы', description: 'Жеке өсу туралы 5 жазба жасаңыз' },
	category_creativity_5: {
		name: 'Шығармашылық бастама',
		description: 'Шығармашылық туралы 5 жазба жасаңыз',
	},
	category_relationships_5: {
		name: 'Байланыстар маңызды',
		description: 'Қарым-қатынас туралы 5 жазба жасаңыз',
	},
	category_gratitude_5: {
		name: 'Алғыстың алғашқы қадамдары',
		description: 'Алғыс туралы 5 жазба жасаңыз',
	},
	emotional_first_steps: {
		name: 'Алғашқы эмоциялар',
		description: '3 түрлі көңіл-күймен жазба жасаңыз',
	},

	// RARE ACHIEVEMENTS
	entries_25: { name: 'Ширек жүз', description: '25 жазба жасаңыз' },
	entries_50: { name: 'Елу жеңіс', description: '50 жазба жасаңыз' },
	streak_14: { name: 'Екі апта күші', description: '14 күн қатарынан жазба жасаңыз' },
	streak_30: { name: 'Ай тұрақтылығы', description: '30 күн қатарынан жазба жасаңыз' },
	achievements_5: { name: 'Бес жеңіс', description: '5 жетістікті белгілеңіз' },
	achievements_10: { name: 'Он жеңіс', description: '10 жетістікті белгілеңіз' },
	category_family_20: {
		name: 'Отбасы - басты нәрсе',
		description: 'Отбасы туралы 20 жазба жасаңыз',
	},
	category_health_20: {
		name: 'Салауатты өмір салты',
		description: 'Денсаулық туралы 20 жазба жасаңыз',
	},
	category_gratitude_10: { name: 'Алғысты жүрек', description: 'Алғыс туралы 10 жазба жасаңыз' },
	category_finance_20: { name: 'Қаржылық бақылау', description: 'Қаржы туралы 20 жазба жасаңыз' },
	category_growth_20: { name: 'Өсу шебері', description: 'Жеке өсу туралы 20 жазба жасаңыз' },
	category_creativity_20: {
		name: 'Шығармашыл жан',
		description: 'Шығармашылық туралы 20 жазба жасаңыз',
	},
	category_relationships_20: {
		name: 'Қарым-қатынас шебері',
		description: 'Қарым-қатынас туралы 20 жазба жасаңыз',
	},
	category_work_20: { name: 'Жұмыста фокус', description: 'Жұмыс туралы 20 жазба жасаңыз' },
	honest_difficult_day: {
		name: 'Қиын күндегі шындық',
		description: 'Қиын күн туралы шынайы жазыңыз',
	},
	emotional_variety: {
		name: 'Сезімдердің әртүрлілігі',
		description: '6 түрлі көңіл-күймен жазба жасаңыз',
	},
	comeback_7: { name: 'Қайта оралу', description: '7 күн үзілістен кейін жазбаларға оралыңыз' },

	// EPIC ACHIEVEMENTS
	entries_100: { name: 'Жүз тарих', description: '100 жазба жасаңыз' },
	entries_250: { name: 'Ширек мың', description: '250 жазба жасаңыз' },
	streak_60: { name: 'Екі ай күші', description: '60 күн қатарынан жазба жасаңыз' },
	streak_90: { name: 'Тоқсан тұрақтылығы', description: '90 күн қатарынан жазба жасаңыз' },
	achievements_25: { name: 'Жиырма бес жеңіс', description: '25 жетістікті белгілеңіз' },
	achievements_50: { name: 'Елу жеңіс', description: '50 жетістікті белгілеңіз' },
	category_family_50: { name: 'Отбасылық шебер', description: 'Отбасы туралы 50 жазба жасаңыз' },
	category_health_50: {
		name: 'Денсаулық шебері',
		description: 'Денсаулық туралы 50 жазба жасаңыз',
	},
	category_work_50: { name: 'Кәсіби', description: 'Жұмыс туралы 50 жазба жасаңыз' },
	emotional_balance: {
		name: 'Эмоционалдық тепе-теңдік',
		description: '10 түрлі көңіл-күймен жазба жасаңыз',
	},
	comeback_30: {
		name: 'Ұлы қайта оралу',
		description: '30 күн үзілістен кейін жазбаларға оралыңыз',
	},

	// LEGENDARY ACHIEVEMENTS
	entries_500: { name: 'Бес жүз тарих', description: '500 жазба жасаңыз' },
	entries_1000: { name: 'Мың тарих', description: '1000 жазба жасаңыз' },
	streak_180: { name: 'Жарты жыл күші', description: '180 күн қатарынан жазба жасаңыз' },
	streak_365: { name: 'Жыл тұрақтылығы', description: '365 күн қатарынан жазба жасаңыз' },
	achievements_100: { name: 'Жүз жеңіс', description: '100 жетістікті белгілеңіз' },
	achievements_250: { name: 'Жеңістер аңызы', description: '250 жетістікті белгілеңіз' },
	category_family_100: { name: 'Отбасы аңызы', description: 'Отбасы туралы 100 жазба жасаңыз' },
	category_health_100: {
		name: 'Денсаулық аңызы',
		description: 'Денсаулық туралы 100 жазба жасаңыз',
	},
	category_gratitude_50: { name: 'Алғыс шебері', description: 'Алғыс туралы 50 жазба жасаңыз' },
	all_categories: {
		name: 'Барлық салалардың шебері',
		description: 'Әр санатта кемінде 10 жазба жасаңыз',
	},
	year_complete: { name: 'UNITY-мен бір жыл', description: 'UNITY-ді бүкіл жыл бойы пайдаланыңыз' },
	first_honest_difficult_day: {
		name: 'Алғашқы шынайы қиын күн',
		description:
			'Кемінде бір күн қиын болғанын, бірақ сіз бұл туралы шынайы жазғаныңызды белгілеңіз',
	},
};

async function addTranslations() {
	console.log('🔄 Adding Kazakh translations for achievements...\n');

	let successCount = 0;
	let errorCount = 0;

	for (const [achievementId, translations] of Object.entries(achievementsTranslations)) {
		try {
			// Add name translation
			const { error: nameError } = await supabase.from('translations').upsert(
				{
					lang_code: 'kk',
					translation_key: `achievement.${achievementId}.name`,
					translation_value: translations.name,
				},
				{
					onConflict: 'lang_code,translation_key',
				}
			);

			if (nameError) throw nameError;

			// Add description translation
			const { error: descError } = await supabase.from('translations').upsert(
				{
					lang_code: 'kk',
					translation_key: `achievement.${achievementId}.description`,
					translation_value: translations.description,
				},
				{
					onConflict: 'lang_code,translation_key',
				}
			);

			if (descError) throw descError;

			console.log(`✅ ${achievementId}: ${translations.name}`);
			successCount += 2; // name + description
		} catch (error) {
			console.error(`❌ Error adding translation for ${achievementId}:`, error.message);
			errorCount += 2;
		}
	}

	console.log(`\n📊 Summary:`);
	console.log(`   ✅ Success: ${successCount} translations`);
	console.log(`   ❌ Errors: ${errorCount} translations`);
	console.log(`   📝 Total achievements: ${Object.keys(achievementsTranslations).length}`);
}

addTranslations()
	.then(() => {
		console.log('\n✅ Done!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n❌ Fatal error:', error);
		process.exit(1);
	});
