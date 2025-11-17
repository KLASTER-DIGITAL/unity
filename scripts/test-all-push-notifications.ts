/**
 * Скрипт для тестирования ВСЕХ типов push уведомлений
 *
 * Отправляет все 4 типа уведомлений последовательно с задержкой 5 секунд между ними
 *
 * Использование:
 * export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
 * npx tsx scripts/test-all-push-notifications.ts [userEmail]
 *
 * Примеры:
 * npx tsx scripts/test-all-push-notifications.ts
 * npx tsx scripts/test-all-push-notifications.ts rustam@leadshunter.biz
 */

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DELAY_BETWEEN_NOTIFICATIONS = 5000; // 5 секунд

type PushType = 'daily_reminder' | 'weekly_report' | 'weekly_motivation' | 'achievement';

const PUSH_TYPES: { type: PushType; name: string; emoji: string }[] = [
	{ type: 'daily_reminder', name: 'Ежедневное напоминание', emoji: '📝' },
	{ type: 'weekly_report', name: 'Еженедельный отчет', emoji: '📊' },
	{ type: 'weekly_motivation', name: 'Мотивационное сообщение', emoji: '💪' },
	{ type: 'achievement', name: 'Достижение', emoji: '🎉' },
];

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function testAllPushNotifications(userEmail?: string) {
	console.log('\n🚀 ТЕСТИРОВАНИЕ ВСЕХ ТИПОВ PUSH УВЕДОМЛЕНИЙ');
	console.log('═'.repeat(60));

	if (!SUPABASE_SERVICE_ROLE_KEY) {
		console.error('\n❌ SUPABASE_SERVICE_ROLE_KEY не установлен!');
		console.log('Установите переменную окружения:');
		console.log('export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"');
		process.exit(1);
	}

	console.log(`\n📱 Получатель: ${userEmail || 'все подписанные пользователи'}`);
	console.log(`⏱️  Задержка между уведомлениями: ${DELAY_BETWEEN_NOTIFICATIONS / 1000} секунд`);
	console.log('\n' + '─'.repeat(60));

	let successCount = 0;
	let failCount = 0;

	for (let i = 0; i < PUSH_TYPES.length; i++) {
		const { type, name, emoji } = PUSH_TYPES[i];

		console.log(`\n${emoji} [${i + 1}/${PUSH_TYPES.length}] ${name}`);
		console.log('─'.repeat(60));

		try {
			if (type === 'achievement') {
				await testAchievementPush(userEmail);
			} else {
				await testScheduledPush(type);
			}

			successCount++;
			console.log(`✅ ${name} отправлено успешно!`);

			// Задержка перед следующим уведомлением (кроме последнего)
			if (i < PUSH_TYPES.length - 1) {
				console.log(`\n⏳ Ожидание ${DELAY_BETWEEN_NOTIFICATIONS / 1000} секунд...`);
				await sleep(DELAY_BETWEEN_NOTIFICATIONS);
			}
		} catch (error) {
			failCount++;
			console.error(`❌ Ошибка при отправке ${name}:`, error);
		}
	}

	// Итоговая статистика
	console.log('\n' + '═'.repeat(60));
	console.log('📊 ИТОГОВАЯ СТАТИСТИКА');
	console.log('═'.repeat(60));
	console.log(`✅ Успешно отправлено: ${successCount}/${PUSH_TYPES.length}`);
	console.log(`❌ Ошибок: ${failCount}/${PUSH_TYPES.length}`);
	console.log('\n💡 Проверьте ваш телефон/браузер - push уведомления должны прийти!');
	console.log('═'.repeat(60) + '\n');
}

async function testScheduledPush(type: PushType) {
	const url = `${SUPABASE_URL}/functions/v1/push-scheduled?type=${type}`;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
			'Content-Type': 'application/json',
		},
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
	}

	if (data.result) {
		console.log(`   📤 Отправлено: ${data.result.sent || 0} пользователям`);
	}
}

async function testAchievementPush(userEmail?: string) {
	// Получаем user_id
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
	} else {
		// Используем тестового пользователя rustam@leadshunter.biz
		userId = '726a9369-8c28-4134-b03f-3c29ad1235f4';
	}

	// Создаем тестовое достижение
	const achievementData = {
		user_id: userId,
		title: '🧪 Тестовое достижение',
		description: 'Это тестовое достижение для проверки push уведомлений',
		icon: '🎉',
		category: 'test',
		unlocked_at: new Date().toISOString(),
	};

	const response = await fetch(`${SUPABASE_URL}/rest/v1/user_achievements`, {
		method: 'POST',
		headers: {
			apikey: SUPABASE_SERVICE_ROLE_KEY,
			Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
			'Content-Type': 'application/json',
			Prefer: 'return=representation',
		},
		body: JSON.stringify(achievementData),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(`Ошибка создания достижения: ${JSON.stringify(error)}`);
	}

	console.log(`   🎯 Создано тестовое достижение для пользователя`);
}

// Запуск скрипта
const userEmail = process.argv[2];
testAllPushNotifications(userEmail).catch((error) => {
	console.error('\n❌ Критическая ошибка:', error);
	process.exit(1);
});
