/**
 * Telegram Bot Webhook Handler
 *
 * Обрабатывает webhook события от Telegram Bot API:
 * - /start команда: связывает telegram_chat_id с user_id
 * - Генерирует уникальный код для связывания аккаунта
 * - Сохраняет telegram_chat_id в profiles таблице
 *
 * Webhook URL: https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/telegram-bot-webhook
 *
 * Настройка webhook:
 * curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
 *   -H "Content-Type: application/json" \
 *   -d '{"url": "https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/telegram-bot-webhook"}'
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Telegram Bot API types
type TelegramUpdate = {
	update_id: number;
	message?: {
		message_id: number;
		from: {
			id: number;
			is_bot: boolean;
			first_name: string;
			last_name?: string;
			username?: string;
		};
		chat: {
			id: number;
			type: string;
		};
		text?: string;
		date: number;
	};
};

Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
		const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');

		if (!botToken) {
			console.error('[TELEGRAM-WEBHOOK] TELEGRAM_BOT_TOKEN not configured');
			return new Response(JSON.stringify({ error: 'Bot token not configured' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

		// Parse Telegram webhook update
		const update: TelegramUpdate = await req.json();
		console.log('[TELEGRAM-WEBHOOK] Received update:', JSON.stringify(update));

		// Обрабатываем только текстовые сообщения
		if (!update.message?.text) {
			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const chatId = update.message.chat.id;
		const text = update.message.text;
		const telegramUserId = update.message.from.id;

		// Обработка /start команды
		if (text.startsWith('/start')) {
			// Генерируем уникальный код для связывания (6 цифр) - пока не используется
			// const _linkCode = Math.floor(100000 + Math.random() * 900000).toString();

			// Сохраняем временный код в таблице (можно создать отдельную таблицу telegram_link_codes)
			// Пока сохраним в profiles через telegram_id
			const { data: existingProfile } = await supabaseAdmin
				.from('profiles')
				.select('id, full_name, telegram_chat_id')
				.eq('telegram_id', telegramUserId.toString())
				.single();

			if (existingProfile) {
				// Пользователь уже связан, обновляем chat_id
				const { error: updateError } = await supabaseAdmin
					.from('profiles')
					.update({
						telegram_chat_id: chatId.toString(),
						updated_at: new Date().toISOString(),
					})
					.eq('id', existingProfile.id);

				if (updateError) {
					console.error('[TELEGRAM-WEBHOOK] Error updating chat_id:', updateError);
				}

				// Отправляем приветственное сообщение
				await sendTelegramMessage(
					botToken,
					chatId,
					`✅ Привет, ${existingProfile.full_name || 'друг'}!\n\n` +
						`Ваш аккаунт UNITY уже связан с Telegram.\n` +
						`Теперь вы будете получать уведомления здесь! 🔔\n\n` +
						`Используйте /help для списка команд.`
				);
			} else {
				// Новый пользователь, отправляем инструкцию по связыванию
				await sendTelegramMessage(
					botToken,
					chatId,
					`👋 Добро пожаловать в UNITY Bot!\n\n` +
						`Для получения уведомлений свяжите ваш аккаунт:\n\n` +
						`1. Откройте приложение UNITY\n` +
						`2. Перейдите в Настройки → Telegram\n` +
						`3. Нажмите "Связать Telegram"\n` +
						`4. Войдите через Telegram Login Widget\n\n` +
						`После этого вы будете получать уведомления здесь! 🔔`
				);
			}

			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Обработка /help команды
		if (text === '/help') {
			await sendTelegramMessage(
				botToken,
				chatId,
				`📚 Доступные команды:\n\n` +
					`/start - Начать работу с ботом\n` +
					`/help - Показать эту справку\n` +
					`/status - Проверить статус связывания\n\n` +
					`Бот отправляет уведомления о:\n` +
					`• Новых достижениях 🏆\n` +
					`• Streak milestones 🔥\n` +
					`• Напоминаниях 📝\n` +
					`• AI анализе 🤖`
			);

			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Обработка /status команды
		if (text === '/status') {
			const { data: profile } = await supabaseAdmin
				.from('profiles')
				.select('id, full_name, telegram_chat_id')
				.eq('telegram_id', telegramUserId.toString())
				.single();

			if (profile?.telegram_chat_id) {
				await sendTelegramMessage(
					botToken,
					chatId,
					`✅ Статус: Связан\n\n` +
						`Имя: ${profile.full_name || 'Не указано'}\n` +
						`Chat ID: ${profile.telegram_chat_id}\n\n` +
						`Уведомления активны! 🔔`
				);
			} else {
				await sendTelegramMessage(
					botToken,
					chatId,
					`❌ Статус: Не связан\n\n` + `Используйте /start для инструкций по связыванию.`
				);
			}

			return new Response(JSON.stringify({ ok: true }), {
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Неизвестная команда
		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('[TELEGRAM-WEBHOOK] Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});

/**
 * Отправляет сообщение через Telegram Bot API
 */
async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
	try {
		const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: chatId,
				text,
				parse_mode: 'HTML',
			}),
		});

		if (!response.ok) {
			const error = await response.text();
			console.error('[TELEGRAM-WEBHOOK] Failed to send message:', error);
		}
	} catch (error) {
		console.error('[TELEGRAM-WEBHOOK] Error sending message:', error);
	}
}
