#!/usr/bin/env node

/**
 * Check AI Operations Table
 * Проверяет что таблица ai_operations создана и содержит seed данные
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
// Используем service_role key из Supabase Dashboard → Settings → API
const supabaseServiceKey =
	process.env.SUPABASE_SERVICE_KEY ||
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA1ODY5NCwiZXhwIjoyMDc1NjM0Njk0fQ.Ql_Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0Ql0';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
	auth: {
		autoRefreshToken: false,
		persistSession: false,
	},
});

async function checkAIOperations() {
	console.log('🔍 Checking ai_operations table...\n');

	try {
		// 1. Check if table exists and get all operations
		const { data, error } = await supabase
			.from('ai_operations')
			.select('id, group_name, display_name, model, max_tokens, temperature, is_enabled')
			.order('group_name', { ascending: true })
			.order('id', { ascending: true });

		if (error) {
			console.error('❌ Error querying ai_operations:', error.message);
			process.exit(1);
		}

		if (!data || data.length === 0) {
			console.error('❌ No data found in ai_operations table!');
			console.log('\n💡 Run migrations to seed the table:');
			console.log('   npx supabase db push');
			process.exit(1);
		}

		console.log(`✅ Found ${data.length} AI operations:\n`);

		// 2. Group by group_name
		const groups = {};
		data.forEach((op) => {
			if (!groups[op.group_name]) {
				groups[op.group_name] = [];
			}
			groups[op.group_name].push(op);
		});

		// 3. Display grouped operations
		Object.keys(groups).forEach((groupName) => {
			console.log(`📁 Group: ${groupName}`);
			groups[groupName].forEach((op) => {
				const status = op.is_enabled ? '✅' : '❌';
				console.log(`   ${status} ${op.id}`);
				console.log(`      Display: ${op.display_name}`);
				console.log(
					`      Model: ${op.model} (max_tokens: ${op.max_tokens}, temp: ${op.temperature})`
				);
			});
			console.log('');
		});

		// 4. Check expected operations
		const expectedOps = [
			'entry_analysis',
			'card_from_entry',
			'progress_card',
			'push_text',
			'weekly_report',
			'monthly_report',
		];

		const foundIds = data.map((op) => op.id);
		const missing = expectedOps.filter((id) => !foundIds.includes(id));

		if (missing.length > 0) {
			console.log('⚠️  Missing operations:');
			for (const id of missing) {
				console.log(`   - ${id}`);
			}
			console.log('');
		} else {
			console.log('✅ All expected operations are present!\n');
		}

		// 5. Summary
		console.log('📊 Summary:');
		console.log(`   Total operations: ${data.length}`);
		console.log(`   Enabled: ${data.filter((op) => op.is_enabled).length}`);
		console.log(`   Disabled: ${data.filter((op) => !op.is_enabled).length}`);
		console.log('');

		console.log('✅ AI Operations table is ready!');
		process.exit(0);
	} catch (err) {
		console.error('❌ Unexpected error:', err);
		process.exit(1);
	}
}

checkAIOperations();
