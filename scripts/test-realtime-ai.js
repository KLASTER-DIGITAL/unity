/**
 * Test script для проверки Realtime и AI анализа
 *
 * Проверяет:
 * 1. Что возвращает home-screen-data API
 * 2. Есть ли ai_reply в записях
 * 3. Работает ли Realtime subscription
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_ANON_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88';

// Test credentials
const TEST_EMAIL = 'rustam@leadshunter.biz';
const TEST_PASSWORD = 'demo123';

async function main() {
	console.log('🚀 Starting Realtime + AI Analysis test...\n');

	// 1. Create Supabase client
	const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

	// 2. Login
	console.log('🔐 Logging in as:', TEST_EMAIL);
	const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
		email: TEST_EMAIL,
		password: TEST_PASSWORD,
	});

	if (authError) {
		console.error('❌ Login failed:', authError.message);
		process.exit(1);
	}

	console.log('✅ Logged in successfully');
	console.log('👤 User ID:', authData.user.id);
	console.log('🔑 Access Token:', `${authData.session.access_token.substring(0, 50)}...\n`);

	// 3. Fetch home screen data
	console.log('📊 Fetching home screen data...');
	const response = await fetch(`${SUPABASE_URL}/functions/v1/home-screen-data`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authData.session.access_token}`,
		},
	});

	if (!response.ok) {
		console.error('❌ API call failed:', response.status, response.statusText);
		process.exit(1);
	}

	const data = await response.json();
	console.log('✅ Home screen data fetched');
	console.log('📈 Stats:', data.stats);
	console.log('🎴 Motivation cards:', data.motivationCards?.length || 0);
	console.log('📝 Recent entries:', data.recentEntries?.length || 0);

	// 4. Check AI analysis in entries
	console.log('\n🤖 Checking AI analysis in recent entries:');
	if (data.recentEntries && data.recentEntries.length > 0) {
		data.recentEntries.forEach((entry, index) => {
			console.log(`\n📝 Entry ${index + 1}:`);
			console.log('  ID:', entry.id);
			console.log('  Text:', `${entry.text?.substring(0, 50)}...`);
			console.log(
				'  AI Reply:',
				entry.ai_reply ? `✅ EXISTS (${entry.ai_reply.substring(0, 50)}...)` : '❌ MISSING'
			);
			console.log('  AI Summary:', entry.ai_summary ? '✅ EXISTS' : '❌ MISSING');
			console.log('  AI Insight:', entry.ai_insight ? '✅ EXISTS' : '❌ MISSING');
			console.log('  Created:', entry.created_at);
		});
	} else {
		console.log('❌ No recent entries found');
	}

	// 5. Fetch entries directly from DB
	console.log('\n📊 Fetching entries directly from DB...');
	const { data: dbEntries, error: dbError } = await supabase
		.from('entries')
		.select('id, text, ai_reply, ai_summary, ai_insight, created_at')
		.eq('user_id', authData.user.id)
		.order('created_at', { ascending: false })
		.limit(3);

	if (dbError) {
		console.error('❌ DB query failed:', dbError.message);
	} else {
		console.log('✅ DB entries fetched:', dbEntries.length);
		dbEntries.forEach((entry, index) => {
			console.log(`\n📝 DB Entry ${index + 1}:`);
			console.log('  ID:', entry.id);
			console.log('  Text:', `${entry.text?.substring(0, 50)}...`);
			console.log(
				'  AI Reply:',
				entry.ai_reply ? `✅ EXISTS (${entry.ai_reply.substring(0, 50)}...)` : '❌ MISSING'
			);
			console.log('  AI Summary:', entry.ai_summary ? '✅ EXISTS' : '❌ MISSING');
			console.log('  AI Insight:', entry.ai_insight ? '✅ EXISTS' : '❌ MISSING');
			console.log('  Created:', entry.created_at);
		});
	}

	// 6. Test Realtime subscription
	console.log('\n📡 Setting up Realtime subscription...');
	console.log('⏳ Waiting for events (press Ctrl+C to stop)...\n');

	const channel = supabase
		.channel(`test-entries:${authData.user.id}`)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'entries',
				filter: `user_id=eq.${authData.user.id}`,
			},
			(payload) => {
				console.log('\n🔔 Realtime event received!');
				console.log('  Event type:', payload.eventType);
				console.log('  Table:', payload.table);
				if (payload.new) {
					console.log('  New record ID:', payload.new.id);
					console.log('  Text:', `${payload.new.text?.substring(0, 50)}...`);
					console.log('  AI Reply:', payload.new.ai_reply ? '✅ EXISTS' : '❌ MISSING');
				}
				if (payload.old) {
					console.log('  Old record ID:', payload.old.id);
				}
			}
		)
		.subscribe((status) => {
			console.log('📡 Subscription status:', status);
			if (status === 'SUBSCRIBED') {
				console.log('✅ Successfully subscribed to Realtime updates');
				console.log('💡 Now create a new entry in the app to test Realtime...');
			}
		});

	// Keep script running
	process.on('SIGINT', () => {
		console.log('\n\n👋 Cleaning up...');
		supabase.removeChannel(channel);
		process.exit(0);
	});
}

main().catch(console.error);
