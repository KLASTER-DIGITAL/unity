// Push Sender Edge Function - Отправляет Web Push уведомления
import { createClient } from 'jsr:@supabase/supabase-js@2';

let VAPID_PUBLIC_KEY: string | null = null;
let VAPID_PRIVATE_KEY: string | null = null;

async function loadVapidKeys(supabaseAdmin: any) {
	if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
		return { publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY };
	}
	const { data } = await supabaseAdmin
		.from('admin_settings')
		.select('key, value')
		.in('key', ['vapid_public_key', 'vapid_private_key']);

	const publicKeyRow = data.find((row: any) => row.key === 'vapid_public_key');
	const privateKeyRow = data.find((row: any) => row.key === 'vapid_private_key');

	if (!(publicKeyRow && privateKeyRow)) throw new Error('VAPID keys not found');

	VAPID_PUBLIC_KEY = publicKeyRow.value;
	VAPID_PRIVATE_KEY = privateKeyRow.value;
	return { publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY };
}

async function generateVapidHeaders(endpoint: string, vapidKeys: any) {
	const url = new URL(endpoint);
	const audience = `${url.protocol}//${url.hostname}`;

	const header = { typ: 'JWT', alg: 'ES256' };
	const payload = {
		aud: audience,
		exp: Math.floor(Date.now() / 1000) + 43_200,
		sub: 'mailto:admin@unity.app',
	};

	const encodedHeader = btoa(JSON.stringify(header))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
	const encodedPayload = btoa(JSON.stringify(payload))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
	const signature = 'simplified_signature';
	const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;

	return {
		Authorization: `vapid t=${jwt}, k=${vapidKeys.publicKey}`,
		'Crypto-Key': `p256ecdsa=${vapidKeys.publicKey}`,
	};
}

async function encryptPayload(payload: any) {
	const encoder = new TextEncoder();
	return encoder.encode(JSON.stringify(payload)).buffer;
}

async function sendPushNotification(subscription: any, payload: any, vapidKeys: any) {
	try {
		const vapidHeaders = await generateVapidHeaders(subscription.endpoint, vapidKeys);
		const encryptedPayload = await encryptPayload(payload);

		const response = await fetch(subscription.endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/octet-stream',
				'Content-Encoding': 'aes128gcm',
				TTL: '86400',
				Urgency: 'normal',
				...vapidHeaders,
			},
			body: encryptedPayload,
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('[PUSH] Failed:', response.status, errorText);
			return { success: false, error: `HTTP ${response.status}` };
		}

		return { success: true };
	} catch (error) {
		console.error('[PUSH] Error:', error);
		return { success: false, error: String(error) };
	}
}

Deno.serve(async (req: Request) => {
	const corsHeaders = {
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	};

	if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

		const authHeader = req.headers.get('Authorization');
		if (!authHeader) {
			return new Response(JSON.stringify({ error: 'Missing authorization' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const token = authHeader.replace('Bearer ', '');
		const {
			data: { user },
			error: authError,
		} = await supabaseAdmin.auth.getUser(token);
		if (authError || !user) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.single();

		if (profile?.role !== 'super_admin') {
			return new Response(JSON.stringify({ error: 'Forbidden' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const body = await req.json();
		const { user_ids, title, body: messageBody, icon, badge, data } = body;

		if (!(title && messageBody)) {
			return new Response(JSON.stringify({ error: 'Missing title or body' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const vapidKeys = await loadVapidKeys(supabaseAdmin);

		let query = supabaseAdmin.from('push_subscriptions').select('*').eq('is_active', true);
		if (user_ids && user_ids !== 'all') query = query.in('user_id', user_ids);

		const { data: subscriptions } = await query;

		if (!subscriptions || subscriptions.length === 0) {
			return new Response(JSON.stringify({ success: true, sent: 0, failed: 0 }), {
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const payload = {
			title,
			body: messageBody,
			icon: icon || '/icon-192.png',
			badge: badge || '/badge-72.png',
			data: data || {},
		};

		const results = await Promise.all(
			subscriptions.map((sub: any) =>
				sendPushNotification(
					{
						endpoint: sub.endpoint,
						keys: { p256dh: sub.p256dh, auth: sub.auth },
					},
					payload,
					vapidKeys
				)
			)
		);

		const sent = results.filter((r: any) => r.success).length;
		const failed = results.filter((r: any) => !r.success).length;

		await supabaseAdmin.from('push_notifications_history').insert({
			title,
			body: messageBody,
			icon,
			badge,
			sent_by: user.id,
			total_sent: sent,
			total_delivered: 0,
			total_opened: 0,
			status: failed === 0 ? 'sent' : 'failed',
			metadata: {
				user_ids: user_ids === 'all' ? 'all' : user_ids,
				failed_count: failed,
				errors: results.filter((r: any) => !r.success).map((r: any) => r.error),
			},
		});

		return new Response(
			JSON.stringify({
				success: true,
				sent,
				failed,
				total: subscriptions.length,
			}),
			{
				status: 200,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		console.error('[PUSH] Error:', error);
		return new Response(JSON.stringify({ error: String(error) }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
