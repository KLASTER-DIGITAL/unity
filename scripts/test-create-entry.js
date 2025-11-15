#!/usr/bin/env node

/**
 * Test Create Entry - Verify AI reply field works
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_ANON_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88';

const TEST_EMAIL = 'rustam@leadshunter.biz';
const TEST_PASSWORD = 'demo123';

async function main() {
	console.log('🧪 Testing AI reply field with new entry...\n');

	const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

	// Login
	const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
		email: TEST_EMAIL,
		password: TEST_PASSWORD,
	});

	if (authError) {
		console.error('❌ Login failed:', authError.message);
		process.exit(1);
	}

	console.log('✅ Logged in as:', authData.user.email);

	// Create test entry
	const testText = 'Сегодня отличный день! Закончил важный проект на работе.';

	console.log('\n📝 Creating test entry...');
	console.log('Text:', testText);

	// Call AI analysis
	console.log('\n🤖 Calling AI analysis...');
	const aiResponse = await fetch(`${SUPABASE_URL}/functions/v1/ai-analysis/analyze`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authData.session.access_token}`,
		},
		body: JSON.stringify({
			text: testText,
			userName: 'Rustam',
			userId: authData.user.id,
			userLanguage: 'ru',
		}),
	});

	if (!aiResponse.ok) {
		const error = await aiResponse.text();
		console.error('❌ AI analysis failed:', error);
		process.exit(1);
	}

	const aiResult = await aiResponse.json();
	console.log('\n✅ AI analysis result:');
	console.log(JSON.stringify(aiResult, null, 2));

	const analysis = aiResult.analysis || aiResult;

	console.log('\n📊 Checking fields:');
	console.log('  reply:', analysis.reply ? `✅ "${analysis.reply}"` : '❌ MISSING');
	console.log('  summary:', analysis.summary ? `✅ "${analysis.summary}"` : '❌ MISSING');
	console.log('  insight:', analysis.insight ? `✅ "${analysis.insight}"` : '❌ MISSING');
	console.log('  sentiment:', analysis.sentiment);
	console.log('  category:', analysis.category);

	// Save entry to DB
	console.log('\n💾 Saving entry to database...');
	const { data: entry, error: entryError } = await supabase
		.from('entries')
		.insert({
			user_id: authData.user.id,
			text: testText,
			sentiment: analysis.sentiment || 'neutral',
			category: analysis.category || 'Другое',
			mood: analysis.mood || 'нормальное',
			ai_reply: analysis.reply || '',
			ai_summary: analysis.summary || null,
			ai_insight: analysis.insight || null,
			is_achievement: analysis.isAchievement || false,
			tags: analysis.tags || [],
			streak_day: 1,
			focus_area: analysis.category || 'Другое',
		})
		.select()
		.single();

	if (entryError) {
		console.error('❌ Failed to save entry:', entryError.message);
		process.exit(1);
	}

	console.log('\n✅ Entry saved successfully!');
	console.log('  ID:', entry.id);
	console.log('  ai_reply:', entry.ai_reply ? `✅ "${entry.ai_reply}"` : '❌ EMPTY');
	console.log('  ai_summary:', entry.ai_summary ? '✅ EXISTS' : '❌ EMPTY');
	console.log('  ai_insight:', entry.ai_insight ? '✅ EXISTS' : '❌ EMPTY');

	console.log('\n🎉 Test complete!');
	console.log('\n📝 Next steps:');
	console.log('1. Refresh the app');
	console.log('2. Check that AI analysis appears in the feed');
	console.log('3. Entry ID:', entry.id);
}

main().catch(console.error);
