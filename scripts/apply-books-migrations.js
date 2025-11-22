#!/usr/bin/env node

/**
 * Apply Books System Migrations
 * Применяет 4 миграции для системы книг через Supabase Management API
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
	console.log(`✅ Success`);

	return result;
}

async function applyMigrations() {
	console.log('🚀 Applying Books System migrations...\n');

	try {
		// Migration 1: Add plan_type, type, language to books_archive
		const migration1 = readFileSync(
			join(
				process.cwd(),
				'supabase/migrations/20251122000001_add_books_plan_type_and_versioning.sql'
			),
			'utf-8'
		);
		await executeSql(migration1, 'Step 1/4: Adding plan_type, type, language to books_archive');

		// Migration 2: Create monthly_snapshots table
		const migration2 = readFileSync(
			join(process.cwd(), 'supabase/migrations/20251122000002_create_monthly_snapshots.sql'),
			'utf-8'
		);
		await executeSql(migration2, 'Step 2/4: Creating monthly_snapshots table');

		// Migration 3: Create entry_summaries table
		const migration3 = readFileSync(
			join(process.cwd(), 'supabase/migrations/20251122000003_create_entry_summaries.sql'),
			'utf-8'
		);
		await executeSql(migration3, 'Step 3/4: Creating entry_summaries table');

		// Migration 4: Add person_tags to entries
		const migration4 = readFileSync(
			join(process.cwd(), 'supabase/migrations/20251122000004_add_person_tags_to_entries.sql'),
			'utf-8'
		);
		await executeSql(migration4, 'Step 4/4: Adding person_tags to entries');

		// Verify
		console.log('\n📊 Verifying migrations...');

		const verifyBooks = await executeSql(
			`SELECT column_name, data_type 
			 FROM information_schema.columns 
			 WHERE table_name = 'books_archive' 
			 AND column_name IN ('plan_type', 'type', 'language', 'parent_book_id', 'version');`,
			'Verifying books_archive columns'
		);

		const verifyTables = await executeSql(
			`SELECT tablename 
			 FROM pg_tables 
			 WHERE schemaname = 'public' 
			 AND tablename IN ('monthly_snapshots', 'entry_summaries');`,
			'Verifying new tables'
		);

		console.log('\n✅ All migrations applied successfully!\n');
		console.log('📋 New columns in books_archive:', verifyBooks.length);
		console.log('📋 New tables:', verifyTables.length);
		console.log('\n🎉 Books System database is ready!');
		process.exit(0);
	} catch (error) {
		console.error('\n❌ Migration failed:', error.message);
		process.exit(1);
	}
}

applyMigrations();
