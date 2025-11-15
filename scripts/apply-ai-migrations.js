#!/usr/bin/env node

/**
 * Apply AI Operations Migrations
 * Применяет 3 миграции для AI Control Center через Supabase Management API
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

async function applyMigrations() {
	console.log('🚀 Applying AI Operations migrations...\n');

	try {
		// Migration 1: Create ai_operations table
		const migration1 = readFileSync(
			join(process.cwd(), 'supabase/migrations/20251115000001_create_ai_operations.sql'),
			'utf-8'
		);
		await executeSql(migration1, 'Step 1/3: Creating ai_operations table');

		// Migration 2: Create ai_operations_history table
		const migration2 = readFileSync(
			join(process.cwd(), 'supabase/migrations/20251115000002_create_ai_operations_history.sql'),
			'utf-8'
		);
		await executeSql(migration2, 'Step 2/3: Creating ai_operations_history table');

		// Migration 3: Seed ai_operations data
		const migration3 = readFileSync(
			join(process.cwd(), 'supabase/migrations/20251115000003_seed_ai_operations.sql'),
			'utf-8'
		);
		await executeSql(migration3, 'Step 3/3: Seeding ai_operations data');

		// Verify
		console.log('\n📊 Verifying...');
		const verifyResult = await executeSql(
			'SELECT id, group_name, display_name, model FROM ai_operations ORDER BY group_name, id;',
			'Fetching ai_operations'
		);

		console.log('\n✅ All migrations applied successfully!\n');
		console.log('📋 AI Operations:');
		if (verifyResult && verifyResult.length > 0) {
			verifyResult.forEach((row) => {
				console.log(`   - ${row.id} (${row.group_name}): ${row.display_name} [${row.model}]`);
			});
		}

		console.log('\n🎉 AI Control Center is ready!');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Migration failed:', error.message);
		process.exit(1);
	}
}

applyMigrations();
