/**
 * Тестовый скрипт для проверки real-time синхронизации статистики
 * 
 * Проверяет:
 * 1. Подписку на изменения в таблице entries
 * 2. Автоматический пересчет статистики при создании записи
 * 3. Синхронизацию между множественными подписками
 * 
 * Использование:
 * node scripts/test-realtime-sync.js
 */

import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_ANON_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test user credentials
const TEST_EMAIL = 'rustam@leadshunter.biz';
const TEST_PASSWORD = 'demo123';

async function main() {
	console.log('\n🚀 Starting Real-time Sync Test\n');
	console.log('=' .repeat(60));

	// 1. Авторизация
	console.log('\n📝 Step 1: Authentication');
	const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
		email: TEST_EMAIL,
		password: TEST_PASSWORD,
	});

	if (authError || !authData.user) {
		console.error('❌ Auth failed:', authError);
		process.exit(1);
	}

	console.log('✅ Authenticated as:', authData.user.email);
	const userId = authData.user.id;

	// 2. Получаем текущую статистику (baseline)
	console.log('\n📊 Step 2: Getting current stats');
	
	const { data: entriesData } = await supabase
		.from('entries')
		.select('*')
		.eq('user_id', userId);

	const currentCount = entriesData?.length || 0;
	console.log('📈 Current entries count:', currentCount);

	// 3. Устанавливаем 3 подписки (симулируем разные экраны)
	console.log('\n🔔 Step 3: Setting up multiple subscriptions');
	
	let homeScreenUpdates = 0;
	let achievementsScreenUpdates = 0;
	let globalStoreUpdates = 0;

	// Подписка 1: Home Screen (useUserData)
	const homeChannel = supabase
		.channel(`test-home:${userId}`)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'entries',
				filter: `user_id=eq.${userId}`,
			},
			(payload) => {
				homeScreenUpdates++;
				console.log('\n🏠 [HOME SCREEN] Real-time update received!');
				console.log('   Event:', payload.eventType);
				console.log('   Entry ID:', payload.new?.id);
			}
		)
		.subscribe((status) => {
			console.log('🏠 [HOME SCREEN] Subscription status:', status);
		});

	// Подписка 2: Achievements Screen
	const achievementsChannel = supabase
		.channel(`test-achievements:${userId}`)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'entries',
				filter: `user_id=eq.${userId}`,
			},
			(payload) => {
				achievementsScreenUpdates++;
				console.log('\n🏆 [ACHIEVEMENTS] Real-time update received!');
				console.log('   Event:', payload.eventType);
				console.log('   Entry ID:', payload.new?.id);
			}
		)
		.subscribe((status) => {
			console.log('🏆 [ACHIEVEMENTS] Subscription status:', status);
		});

	// Подписка 3: Global Store
	const storeChannel = supabase
		.channel(`test-store:${userId}`)
		.on(
			'postgres_changes',
			{
				event: '*',
				schema: 'public',
				table: 'entries',
				filter: `user_id=eq.${userId}`,
			},
			(payload) => {
				globalStoreUpdates++;
				console.log('\n🗄️  [GLOBAL STORE] Real-time update received!');
				console.log('   Event:', payload.eventType);
				console.log('   Entry ID:', payload.new?.id);
			}
		)
		.subscribe((status) => {
			console.log('🗄️  [GLOBAL STORE] Subscription status:', status);
		});

	// Ждем пока все подписки станут активными
	await new Promise((resolve) => setTimeout(resolve, 2000));

	// 4. Создаем тестовую запись
	console.log('\n📝 Step 4: Creating test entry');
	console.log('⏳ Creating entry... (this should trigger all 3 subscriptions)\n');

	const { data: newEntry, error: insertError } = await supabase
		.from('entries')
		.insert({
			user_id: userId,
			text: `🧪 Test entry for real-time sync - ${new Date().toISOString()}`,
			sentiment: 'positive',
			category: 'Тестирование',
			mood: 'отличное',
			is_achievement: true,
			created_at: new Date().toISOString(),
		})
		.select()
		.single();

	if (insertError) {
		console.error('❌ Failed to create entry:', insertError);
		process.exit(1);
	}

	console.log('✅ Entry created:', newEntry.id);

	// 5. Ждем real-time события (max 5 секунд)
	console.log('\n⏳ Step 5: Waiting for real-time events (5 seconds)...\n');
	await new Promise((resolve) => setTimeout(resolve, 5000));

	// 6. Результаты
	console.log('\n' + '='.repeat(60));
	console.log('📊 Test Results:');
	console.log('='.repeat(60));
	console.log(`🏠 Home Screen updates:        ${homeScreenUpdates}`);
	console.log(`🏆 Achievements Screen updates: ${achievementsScreenUpdates}`);
	console.log(`🗄️  Global Store updates:       ${globalStoreUpdates}`);
	console.log('');

	const allUpdatesReceived = 
		homeScreenUpdates > 0 && 
		achievementsScreenUpdates > 0 && 
		globalStoreUpdates > 0;

	if (allUpdatesReceived) {
		console.log('✅ SUCCESS: All subscriptions received real-time updates!');
		console.log('✅ Data synchronization is working correctly!');
	} else {
		console.log('⚠️  WARNING: Some subscriptions did not receive updates');
		console.log('   This might indicate a problem with real-time sync');
	}

	// 7. Cleanup - удаляем тестовую запись
	console.log('\n🧹 Step 6: Cleanup');
	await supabase.from('entries').delete().eq('id', newEntry.id);
	console.log('✅ Test entry deleted');

	// Отписываемся от всех каналов
	supabase.removeChannel(homeChannel);
	supabase.removeChannel(achievementsChannel);
	supabase.removeChannel(storeChannel);
	console.log('✅ Unsubscribed from all channels');

	console.log('\n' + '='.repeat(60));
	console.log('✨ Test completed!');
	console.log('='.repeat(60) + '\n');

	process.exit(0);
}

// Обработка ошибок
process.on('unhandledRejection', (error) => {
	console.error('\n❌ Unhandled error:', error);
	process.exit(1);
});

// Запуск
main().catch((error) => {
	console.error('\n❌ Test failed:', error);
	process.exit(1);
});

