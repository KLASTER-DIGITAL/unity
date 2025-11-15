#!/usr/bin/env node

/**
 * Seed AI Operations Data ONLY
 * Применяет ТОЛЬКО seed данные (миграция 3) для ai_operations таблицы
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SUPABASE_PROJECT_ID = 'ecuwuzqlwdkkdncampnc';
const SUPABASE_ACCESS_TOKEN = 'sbp_f074a7f31380ee22d963995ee889291985c7ba57';

async function executeSql(sql, description) {
	console.log(`\n📋 ${description}...`);

	const response = await fetch(
		`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/database/query`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
			},
			body: JSON.stringify({ query: sql }),
		}
	);

	if (!response.ok) {
		const error = await response.text();
		console.error(`❌ Error: ${error}`);
		throw new Error(`Failed to execute SQL: ${response.statusText}`);
	}

	const result = await response.json();
	console.log(`✅ Success!`);
	return result;
}

async function seedAiOperations() {
	console.log('🚀 Seeding AI Operations data...\n');

	try {
		// Seed ai_operations data
		const migration3 = readFileSync(
			join(process.cwd(), 'supabase/migrations/20251115000003_seed_ai_operations.sql'),
			'utf-8'
		);
		await executeSql(migration3, 'Seeding ai_operations data');

		console.log('\n✅ Seed completed successfully!');
		console.log('\n📊 Verifying...');

		// Verify data
		const verifyQuery = `
      SELECT id, group_name, display_name, model, max_tokens, temperature
      FROM ai_operations
      ORDER BY group_name, id;
    `;

		const result = await executeSql(verifyQuery, 'Fetching ai_operations');
		console.log('\n📋 AI Operations in database:');
		console.table(result);

		console.log('\n🎉 All done!');
		console.log('\n📝 Next steps:');
		console.log('1. Update AISettingsTab.tsx to read from ai_operations');
		console.log('2. Test in admin panel: http://localhost:3001/?view=admin');
		console.log('3. Add prompts section to AISettingsTab');
	} catch (error) {
		console.error('❌ Seed failed:', error);
		process.exit(1);
	}
}

// Run seed
seedAiOperations();
