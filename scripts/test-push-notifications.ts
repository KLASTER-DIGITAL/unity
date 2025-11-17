/**
 * Скрипт для тестирования push уведомлений
 *
 * Использование:
 * npx tsx scripts/test-push-notifications.ts <type> [userId]
 *
 * Примеры:
 * npx tsx scripts/test-push-notifications.ts daily_reminder
 * npx tsx scripts/test-push-notifications.ts weekly_report rustam@leadshunter.biz
 * npx tsx scripts/test-push-notifications.ts achievement
 * npx tsx scripts/test-push-notifications.ts motivational
 */

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

type PushType = 'daily_reminder' | 'weekly_report' | 'weekly_motivation' | 'achievement';

async function testPushNotification(type: PushType, userEmail?: string) {
	console.log(`\n🧪 Тестирование push уведомления: ${type}`);
	console.log('━'.repeat(60));

	if (!SUPABASE_SERVICE_ROLE_KEY) {
		console.error('❌ SUPABASE_SERVICE_ROLE_KEY не установлен!');
		console.log('Установите переменную окружения:');
		console.log('export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
		process.exit(1);
	}

	try {
		if (type === 'achievement') {
			// Для достижений создаем тестовое достижение в БД
			await testAchievementPush(userEmail);
		} else {
			// Для scheduled push вызываем Edge Function
			await testScheduledPush(type);
		}
	} catch (error) {
		console.error('❌ Ошибка:', error);
		process.exit(1);
	}
}

async function testScheduledPush(type: PushType) {
	const url = `${SUPABASE_URL}/functions/v1/push-scheduled?type=${type}`;

	console.log(`\n📡 Отправка запроса к Edge Function...`);
	console.log(`URL: ${url}`);

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
			'Content-Type': 'application/json',
		},
	});

	const data = await response.json();

	if (!response.ok) {
		console.error('❌ Ошибка ответа:', data);
		throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
	}

	console.log('\n✅ Успешно!');
	console.log('Результат:', JSON.stringify(data, null, 2));

	if (data.result) {
		console.log(`\n📊 Статистика:`);
		console.log(`   Отправлено: ${data.result.sent || 0}`);
		console.log(`   Всего пользователей: ${data.result.total || 0}`);
	}

	console.log('\n💡 Проверьте браузер - push уведомление должно прийти!');
}

async function testAchievementPush(userEmail?: string) {
	console.log(`\n📝 Создание тестового достижения...`);

	// Получаем user_id по email
	let userId: string;

	if (userEmail) {
		const profileResponse = await fetch(
			`${SUPABASE_URL}/rest/v1/profiles?email=eq.${userEmail}&select=id`,
			{
				headers: {
					apikey: SUPABASE_SERVICE_ROLE_KEY,
					Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
				},
			}
		);

		const profiles = await profileResponse.json();
		if (!profiles || profiles.length === 0) {
			throw new Error(`Пользователь с email ${userEmail} не найден`);
		}

		userId = profiles[0].id;
		console.log(`✅ Найден пользователь: ${userEmail} (${userId})`);
	} else {
		// Используем Rustam по умолчанию
		const defaultEmail = 'rustam@leadshunter.biz';
		const profileResponse = await fetch(
			`${SUPABASE_URL}/rest/v1/profiles?email=eq.${defaultEmail}&select=id`,
			{
				headers: {
					apikey: SUPABASE_SERVICE_ROLE_KEY,
					Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
				},
			}
		);

		const profiles = await profileResponse.json();
		userId = profiles[0].id;
		console.log(`✅ Используем пользователя по умолчанию: ${defaultEmail}`);
	}

	// Создаем тестовое достижение
	const achievement = {
		user_id: userId,
		title: '🧪 Тестовое достижение',
		description: 'Это тестовое достижение для проверки push уведомлений',
		icon: '🔔',
		rarity: 'rare',
		category: 'test',
		points: 100,
	};

	console.log(`\n📤 Создание достижения...`);

	const response = await fetch(`${SUPABASE_URL}/rest/v1/achievements`, {
		method: 'POST',
		headers: {
			apikey: SUPABASE_SERVICE_ROLE_KEY,
			Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
			'Content-Type': 'application/json',
			Prefer: 'return=representation',
		},
		body: JSON.stringify(achievement),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Ошибка создания достижения: ${JSON.stringify(error)}`);
	}

	const created = await response.json();
	console.log('✅ Достижение создано:', created[0]);

	console.log('\n💡 Проверьте браузер - push уведомление должно прийти!');
	console.log('   (Если настройка "Новые достижения" включена)');
}

// Main
const args = process.argv.slice(2);
const type = args[0] as PushType;
const userEmail = args[1];

if (!type) {
	console.log('Использование: npx tsx scripts/test-push-notifications.ts <type> [userId]');
	console.log('\nДоступные типы:');
	console.log('  daily_reminder    - Ежедневные напоминания');
	console.log('  weekly_report     - Еженедельные отчеты');
	console.log('  weekly_motivation - Мотивационные сообщения');
	console.log('  achievement       - Достижения');
	process.exit(1);
}

testPushNotification(type, userEmail);
