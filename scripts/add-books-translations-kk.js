#!/usr/bin/env node

/**
 * Add Kazakh translations for BooksLibraryScreen
 *
 * Usage: node scripts/add-books-translations-kk.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_KEY = 'sbp_f074a7f31380ee22d963995ee889291985c7ba57';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const translations = [
	{ key: 'books.delete_success', value: 'Кітап жойылды' },
	{ key: 'books.untitled', value: 'Атаусыз' },
	{ key: 'books.status.ready', value: 'Дайын' },
	{ key: 'books.status.draft', value: 'Жоба' },
	{ key: 'books.entries_count', value: 'жазба' },
	{ key: 'books.pages_count', value: 'бет' },
	{ key: 'books.view', value: 'Қарау' },
	{ key: 'books.download', value: 'Жүктеу' },
	{ key: 'books.edit_draft', value: 'Жобаны өңдеу' },
	{ key: 'books.deleting', value: 'Жою...' },
	{ key: 'books.delete', value: 'Кітапты жою' },
	{ key: 'books.delete_confirm_title', value: 'Кітапты жою керек пе?' },
	{ key: 'books.delete_confirm_final', value: 'Бұл әрекетті болдырмауға болмайды. Кітап' },
	{ key: 'books.delete_confirm_final_pdf', value: 'және PDF файл мәңгілікке жойылады.' },
	{ key: 'books.delete_confirm_draft', value: 'Жоба' },
	{
		key: 'books.delete_confirm_draft_text',
		value: 'жойылады. Сіз кез келген уақытта жаңа кітап жасай аласыз.',
	},
	{ key: 'books.cancel', value: 'Болдырмау' },
	{ key: 'books.delete_action', value: 'Жою' },
];

async function addTranslations() {
	console.log('🔄 Adding Kazakh translations for BooksLibraryScreen...\n');

	let successCount = 0;
	let errorCount = 0;

	for (const translation of translations) {
		const { error } = await supabase
			.from('translations')
			.upsert(
				{
					lang_code: 'kk',
					translation_key: translation.key,
					translation_value: translation.value,
				},
				{
					onConflict: 'lang_code,translation_key',
				}
			)
			.select();

		if (error) {
			console.error(`❌ Error adding ${translation.key}:`, error.message);
			errorCount++;
		} else {
			console.log(`✅ Added: ${translation.key} = "${translation.value}"`);
			successCount++;
		}
	}

	console.log(`\n📊 Summary:`);
	console.log(`✅ Success: ${successCount}`);
	console.log(`❌ Errors: ${errorCount}`);
	console.log(`📝 Total: ${translations.length}`);
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
