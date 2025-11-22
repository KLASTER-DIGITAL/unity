/**
 * Простой скрипт для тестирования push уведомлений
 * Отправляет уведомления напрямую через unified-notification-sender
 *
 * Использование:
 * export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
 * npx tsx scripts/test-push-simple.ts
 */

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_ANON_KEY =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwNTg2OTQsImV4cCI6MjA3NTYzNDY5NH0.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88';
const SUPER_ADMIN_EMAIL = 'diary@leadshunter.biz';
const SUPER_ADMIN_PASSWORD = 'admin123';
const USER_ID = '726a9369-8c28-4134-b03f-3c29ad1235f4'; // rustam@leadshunter.biz
const DELAY_BETWEEN_NOTIFICATIONS = 5000; // 5 секунд

type NotificationData = {
	title: string;
	body: string;
	icon?: string;
	badge?: string;
	data?: Record<string, unknown>;
};

const NOTIFICATIONS: { name: string; emoji: string; data: NotificationData }[] = [
	{
		name: 'Ежедневное напоминание',
		emoji: '📝',
		data: {
			title: '📝 Время для записи!',
			body: 'Как прошел ваш день? Поделитесь своими мыслями и достижениями',
			icon: '/icons/icon-192x192.png',
			badge: '/icons/badge-72x72.png',
			data: {
				type: 'daily_reminder',
				url: '/',
			},
		},
	},
	{
		name: 'Еженедельный отчет',
		emoji: '📊',
		data: {
			title: '📊 Ваш недельный отчет готов!',
			body: '7 записей • 5 дней подряд • Топ категория: Работа',
			icon: '/icons/icon-192x192.png',
			badge: '/icons/badge-72x72.png',
			data: {
				type: 'weekly_report',
				url: '/stats',
			},
		},
	},
	{
		name: 'Мотивационное сообщение',
		emoji: '💪',
		data: {
			title: '💪 Вы на правильном пути!',
			body: 'Каждый день - это новая возможность стать лучше. Продолжайте в том же духе!',
			icon: '/icons/icon-192x192.png',
			badge: '/icons/badge-72x72.png',
			data: {
				type: 'motivational',
				url: '/',
			},
		},
	},
	{
		name: 'Достижение',
		emoji: '🎉',
		data: {
			title: '🎉 Новое достижение!',
			body: 'Вы разблокировали достижение "Первая неделя" - 7 дней подряд!',
			icon: '/icons/icon-192x192.png',
			badge: '/icons/badge-72x72.png',
			data: {
				type: 'achievement',
				achievementId: 'test-achievement',
				url: '/achievements',
			},
		},
	},
];

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getSuperAdminToken(): Promise<string> {
	const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
		method: 'POST',
		headers: {
			apikey: SUPABASE_ANON_KEY,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			email: SUPER_ADMIN_EMAIL,
			password: SUPER_ADMIN_PASSWORD,
		}),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(`Failed to login: ${JSON.stringify(data)}`);
	}

	return data.access_token;
}

async function sendPushNotification(
	userToken: string,
	userId: string,
	notification: NotificationData
) {
	const url = `${SUPABASE_URL}/functions/v1/push-sender`;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${userToken}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			user_ids: [userId],
			title: notification.title,
			body: notification.body,
			icon: notification.icon,
			badge: notification.badge,
			data: notification.data,
		}),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
	}

	return data;
}

async function testAllPushNotifications() {
	console.log('\n🚀 ТЕСТИРОВАНИЕ ВСЕХ ТИПОВ PUSH УВЕДОМЛЕНИЙ');
	console.log('═'.repeat(60));

	console.log('\n🔐 Авторизация super_admin...');
	const userToken = await getSuperAdminToken();
	console.log('✅ Авторизация успешна!');

	console.log(`\n📱 Получатель: rustam@leadshunter.biz (${USER_ID})`);
	console.log(`⏱️  Задержка между уведомлениями: ${DELAY_BETWEEN_NOTIFICATIONS / 1000} секунд`);
	console.log(`\n${'─'.repeat(60)}`);

	let successCount = 0;
	let failCount = 0;

	for (let i = 0; i < NOTIFICATIONS.length; i++) {
		const { name, emoji, data } = NOTIFICATIONS[i];

		console.log(`\n${emoji} [${i + 1}/${NOTIFICATIONS.length}] ${name}`);
		console.log('─'.repeat(60));
		console.log(`📤 Отправка: "${data.title}"`);
		console.log(`   ${data.body}`);

		try {
			const result = await sendPushNotification(userToken, USER_ID, data);

			successCount++;
			console.log(`✅ ${name} отправлено успешно!`);
			console.log(`   Результат:`, JSON.stringify(result, null, 2));

			// Задержка перед следующим уведомлением (кроме последнего)
			if (i < NOTIFICATIONS.length - 1) {
				console.log(`\n⏳ Ожидание ${DELAY_BETWEEN_NOTIFICATIONS / 1000} секунд...`);
				await sleep(DELAY_BETWEEN_NOTIFICATIONS);
			}
		} catch (error) {
			failCount++;
			console.error(`❌ Ошибка при отправке ${name}:`, error);
		}
	}

	// Итоговая статистика
	console.log(`\n${'═'.repeat(60)}`);
	console.log('📊 ИТОГОВАЯ СТАТИСТИКА');
	console.log('═'.repeat(60));
	console.log(`✅ Успешно отправлено: ${successCount}/${NOTIFICATIONS.length}`);
	console.log(`❌ Ошибок: ${failCount}/${NOTIFICATIONS.length}`);
	console.log('\n💡 Проверьте ваш телефон/браузер - push уведомления должны прийти!');
	console.log(`${'═'.repeat(60)}\n`);
}

// Запуск скрипта
testAllPushNotifications().catch((error) => {
	console.error('\n❌ Критическая ошибка:', error);
	process.exit(1);
});
