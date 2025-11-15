#!/usr/bin/env node

/**
 * Quick check AI Operations - using anon key (read-only)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const supabaseAnonKey =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAIOperations() {
	console.log('🔍 Checking ai_operations table...\n');

	try {
		const { data, error } = await supabase
			.from('ai_operations')
			.select(
				'id, group_name, display_name, model, max_tokens, temperature, is_enabled, system_prompt, user_prompt_template'
			)
			.order('group_name', { ascending: true })
			.order('id', { ascending: true });

		if (error) {
			console.error('❌ Error:', error.message);
			process.exit(1);
		}

		if (!data || data.length === 0) {
			console.error('❌ No data found!');
			process.exit(1);
		}

		console.log(`✅ Found ${data.length} AI operations:\n`);

		// Group by group_name
		const groups = {};
		data.forEach((op) => {
			if (!groups[op.group_name]) {
				groups[op.group_name] = [];
			}
			groups[op.group_name].push(op);
		});

		// Display grouped operations
		Object.keys(groups).forEach((groupName) => {
			console.log(`\n📁 Group: ${groupName}`);
			console.log('='.repeat(80));
			groups[groupName].forEach((op) => {
				const status = op.is_enabled ? '✅ ENABLED' : '❌ DISABLED';
				console.log(`\n${status} ${op.id}`);
				console.log(`   Display: ${op.display_name}`);
				console.log(
					`   Model: ${op.model} (max_tokens: ${op.max_tokens}, temp: ${op.temperature})`
				);
				console.log(`   System Prompt: ${op.system_prompt.substring(0, 100)}...`);
				console.log(`   User Prompt: ${op.user_prompt_template.substring(0, 100)}...`);
			});
		});

		// Summary
		console.log('\n\n📊 Summary:');
		console.log('='.repeat(80));
		console.log(`   Total operations: ${data.length}`);
		console.log(`   Enabled: ${data.filter((op) => op.is_enabled).length}`);
		console.log(`   Disabled: ${data.filter((op) => !op.is_enabled).length}`);

		// Check which operations are used in Edge Functions
		console.log('\n\n🔧 Edge Functions Integration:');
		console.log('='.repeat(80));
		const integratedOps = ['entry_analysis', 'push_text'];
		integratedOps.forEach((opId) => {
			const op = data.find((o) => o.id === opId);
			if (op) {
				const status = op.is_enabled ? '✅ READY' : '❌ DISABLED';
				console.log(`   ${status} ${opId} - ${op.display_name}`);
			} else {
				console.log(`   ❌ MISSING ${opId}`);
			}
		});

		console.log('\n✅ Check complete!');
		process.exit(0);
	} catch (err) {
		console.error('❌ Unexpected error:', err);
		process.exit(1);
	}
}

checkAIOperations();
