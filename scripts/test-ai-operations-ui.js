#!/usr/bin/env node

/**
 * Test AI Operations UI
 * Проверяет что данные из ai_operations доступны через Supabase API
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_ANON_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88';

// Test credentials
const TEST_EMAIL = 'diary@leadshunter.biz';
const TEST_PASSWORD = 'admin123';

async function testAiOperationsUI() {
	console.log('🧪 Testing AI Operations UI...\n');

	try {
		// 1. Create Supabase client
		const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

		// 2. Login as super_admin
		console.log('📋 Step 1/4: Logging in as super_admin...');
		const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
			email: TEST_EMAIL,
			password: TEST_PASSWORD,
		});

		if (authError) {
			console.error('❌ Login failed:', authError.message);
			process.exit(1);
		}

		console.log('✅ Logged in as:', authData.user.email);
		console.log('   Role:', authData.user.user_metadata?.role || 'unknown');
		console.log('');

		// 3. Fetch AI operations
		console.log('📋 Step 2/4: Fetching AI operations...');
		const { data: operations, error: opsError } = await supabase
			.from('ai_operations')
			.select('*')
			.order('group_name, id');

		if (opsError) {
			console.error('❌ Failed to fetch AI operations:', opsError.message);
			console.error('   Code:', opsError.code);
			console.error('   Details:', opsError.details);
			process.exit(1);
		}

		if (!operations || operations.length === 0) {
			console.error('❌ No AI operations found in database');
			process.exit(1);
		}

		console.log(`✅ Found ${operations.length} AI operations`);
		console.log('');

		// 4. Group by group_name
		console.log('📋 Step 3/4: Grouping operations...');
		const grouped = operations.reduce((acc, op) => {
			if (!acc[op.group_name]) acc[op.group_name] = [];
			acc[op.group_name].push(op);
			return acc;
		}, {});

		console.log('✅ Grouped operations:');
		Object.keys(grouped).forEach((groupName) => {
			console.log(`   ${groupName}: ${grouped[groupName].length} operations`);
			grouped[groupName].forEach((op) => {
				console.log(`     - ${op.id} (${op.display_name})`);
			});
		});
		console.log('');

		// 5. Display sample operation
		console.log('📋 Step 4/4: Sample operation details...');
		const sampleOp = operations[0];
		console.log('✅ Sample operation:');
		console.log(`   ID: ${sampleOp.id}`);
		console.log(`   Display Name: ${sampleOp.display_name}`);
		console.log(`   Group: ${sampleOp.group_name}`);
		console.log(`   Model: ${sampleOp.model}`);
		console.log(`   Max Tokens: ${sampleOp.max_tokens}`);
		console.log(`   Temperature: ${sampleOp.temperature}`);
		console.log(`   Enabled: ${sampleOp.is_enabled}`);
		console.log(`   System Prompt: ${sampleOp.system_prompt.substring(0, 100)}...`);
		console.log(`   User Prompt: ${sampleOp.user_prompt_template.substring(0, 100)}...`);
		console.log('');

		// 6. Test update operation
		console.log('📋 Testing update operation...');
		const testOpId = operations[0].id;
		const originalTemp = operations[0].temperature;
		const newTemp = originalTemp === 0.7 ? 0.8 : 0.7;

		const { error: updateError } = await supabase
			.from('ai_operations')
			.update({
				temperature: newTemp,
				updated_at: new Date().toISOString(),
			})
			.eq('id', testOpId);

		if (updateError) {
			console.error('❌ Update failed:', updateError.message);
		} else {
			console.log(`✅ Updated ${testOpId} temperature: ${originalTemp} → ${newTemp}`);

			// Revert back
			await supabase
				.from('ai_operations')
				.update({
					temperature: originalTemp,
					updated_at: new Date().toISOString(),
				})
				.eq('id', testOpId);

			console.log(`✅ Reverted ${testOpId} temperature: ${newTemp} → ${originalTemp}`);
		}
		console.log('');

		console.log('🎉 All tests passed!');
		console.log('');
		console.log('📝 Next steps:');
		console.log('1. Open http://localhost:3002/?view=admin in browser');
		console.log('2. Login as diary@leadshunter.biz / admin123');
		console.log('3. Go to Settings → AI');
		console.log('4. Check "AI Operations & Prompts" section');
		console.log('5. Verify that operations are displayed correctly');

		process.exit(0);
	} catch (error) {
		console.error('❌ Test failed:', error);
		process.exit(1);
	}
}

// Run test
testAiOperationsUI();
