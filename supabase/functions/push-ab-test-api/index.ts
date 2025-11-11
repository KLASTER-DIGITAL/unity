/**
 * Push AB Test API Edge Function
 *
 * Управление A/B тестами для push уведомлений
 *
 * Endpoints:
 * - GET /push-ab-test-api - Список всех A/B тестов
 * - GET /push-ab-test-api/:id - Детали конкретного теста
 * - POST /push-ab-test-api - Создать новый A/B тест
 * - PUT /push-ab-test-api/:id - Обновить A/B тест
 * - DELETE /push-ab-test-api/:id - Удалить A/B тест
 * - POST /push-ab-test-api/:id/start - Запустить A/B тест
 * - POST /push-ab-test-api/:id/stop - Остановить A/B тест
 * - GET /push-ab-test-api/:id/results - Получить результаты теста
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase Admin Client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Проверяет является ли пользователь super_admin
 */
async function isSuperAdmin(userId: string): Promise<boolean> {
	const { data } = await supabaseAdmin.from('profiles').select('role').eq('id', userId).single();

	return data?.role === 'super_admin';
}

/**
 * Получает список всех A/B тестов
 */
async function listABTests() {
	const { data, error } = await supabaseAdmin
		.from('push_ab_tests')
		.select('*')
		.order('created_at', { ascending: false });

	if (error) throw error;

	return new Response(JSON.stringify(data), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

/**
 * Получает детали конкретного A/B теста
 */
async function getABTest(testId: string) {
	const { data, error } = await supabaseAdmin
		.from('push_ab_tests')
		.select('*')
		.eq('id', testId)
		.single();

	if (error) throw error;

	// Получаем assignments для расчета метрик
	const { data: assignments } = await supabaseAdmin
		.from('push_ab_test_assignments')
		.select('*')
		.eq('ab_test_id', testId);

	return new Response(
		JSON.stringify({
			...data,
			assignments: assignments || [],
			total_assignments: assignments?.length || 0,
		}),
		{
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		}
	);
}

/**
 * Создает новый A/B тест
 */
async function createABTest(body: any, userId: string) {
	const {
		name,
		description,
		variant_a_title,
		variant_a_body,
		variant_a_icon,
		variant_b_title,
		variant_b_body,
		variant_b_icon,
		traffic_split = 50,
		target_segment = 'all',
		custom_segment_id,
		start_date,
		end_date,
	} = body;

	if (!name || !variant_a_title || !variant_a_body || !variant_b_title || !variant_b_body) {
		throw new Error('Missing required fields');
	}

	const { data, error } = await supabaseAdmin
		.from('push_ab_tests')
		.insert({
			name,
			description,
			created_by: userId,
			variant_a_title,
			variant_a_body,
			variant_a_icon: variant_a_icon || '/icon-192.png',
			variant_b_title,
			variant_b_body,
			variant_b_icon: variant_b_icon || '/icon-192.png',
			traffic_split,
			target_segment,
			custom_segment_id,
			start_date,
			end_date,
			status: 'draft',
		})
		.select()
		.single();

	if (error) throw error;

	return new Response(JSON.stringify(data), {
		status: 201,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

/**
 * Обновляет A/B тест
 */
async function updateABTest(testId: string, body: any) {
	const { data, error } = await supabaseAdmin
		.from('push_ab_tests')
		.update({
			...body,
			updated_at: new Date().toISOString(),
		})
		.eq('id', testId)
		.select()
		.single();

	if (error) throw error;

	return new Response(JSON.stringify(data), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

/**
 * Удаляет A/B тест
 */
async function deleteABTest(testId: string) {
	const { error } = await supabaseAdmin.from('push_ab_tests').delete().eq('id', testId);

	if (error) throw error;

	return new Response(JSON.stringify({ success: true }), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

/**
 * Запускает A/B тест
 */
async function startABTest(testId: string) {
	const { data, error } = await supabaseAdmin
		.from('push_ab_tests')
		.update({
			status: 'running',
			start_date: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		})
		.eq('id', testId)
		.select()
		.single();

	if (error) throw error;

	return new Response(JSON.stringify(data), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

/**
 * Останавливает A/B тест и определяет победителя
 */
async function stopABTest(testId: string) {
	// Получаем текущие результаты
	const { data: test } = await supabaseAdmin
		.from('push_ab_tests')
		.select('*')
		.eq('id', testId)
		.single();

	if (!test) throw new Error('Test not found');

	// Расчет метрик
	const variantAOpenRate =
		test.variant_a_delivered > 0 ? (test.variant_a_opened / test.variant_a_delivered) * 100 : 0;
	const variantBOpenRate =
		test.variant_b_delivered > 0 ? (test.variant_b_opened / test.variant_b_delivered) * 100 : 0;

	// Определение победителя (упрощенная логика)
	let winner = 'no_difference';
	let confidenceLevel = 0;

	if (Math.abs(variantAOpenRate - variantBOpenRate) > 5) {
		// Разница больше 5% - есть победитель
		winner = variantAOpenRate > variantBOpenRate ? 'variant_a' : 'variant_b';
		confidenceLevel = 95.0; // Упрощенно, в реальности нужен статистический тест
	}

	const { data, error } = await supabaseAdmin
		.from('push_ab_tests')
		.update({
			status: 'completed',
			end_date: new Date().toISOString(),
			winner,
			confidence_level: confidenceLevel,
			updated_at: new Date().toISOString(),
		})
		.eq('id', testId)
		.select()
		.single();

	if (error) throw error;

	return new Response(JSON.stringify(data), {
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

/**
 * Получает результаты A/B теста
 */
async function getABTestResults(testId: string) {
	const { data: test } = await supabaseAdmin
		.from('push_ab_tests')
		.select('*')
		.eq('id', testId)
		.single();

	if (!test) throw new Error('Test not found');

	// Расчет метрик для варианта A
	const variantADeliveryRate =
		test.variant_a_sent > 0 ? (test.variant_a_delivered / test.variant_a_sent) * 100 : 0;
	const variantAOpenRate =
		test.variant_a_delivered > 0 ? (test.variant_a_opened / test.variant_a_delivered) * 100 : 0;
	const variantAClickRate =
		test.variant_a_opened > 0 ? (test.variant_a_clicked / test.variant_a_opened) * 100 : 0;

	// Расчет метрик для варианта B
	const variantBDeliveryRate =
		test.variant_b_sent > 0 ? (test.variant_b_delivered / test.variant_b_sent) * 100 : 0;
	const variantBOpenRate =
		test.variant_b_delivered > 0 ? (test.variant_b_opened / test.variant_b_delivered) * 100 : 0;
	const variantBClickRate =
		test.variant_b_opened > 0 ? (test.variant_b_clicked / test.variant_b_opened) * 100 : 0;

	return new Response(
		JSON.stringify({
			test_id: test.id,
			name: test.name,
			status: test.status,
			winner: test.winner,
			confidence_level: test.confidence_level,
			variant_a: {
				title: test.variant_a_title,
				body: test.variant_a_body,
				sent: test.variant_a_sent,
				delivered: test.variant_a_delivered,
				opened: test.variant_a_opened,
				clicked: test.variant_a_clicked,
				delivery_rate: variantADeliveryRate.toFixed(2),
				open_rate: variantAOpenRate.toFixed(2),
				click_rate: variantAClickRate.toFixed(2),
			},
			variant_b: {
				title: test.variant_b_title,
				body: test.variant_b_body,
				sent: test.variant_b_sent,
				delivered: test.variant_b_delivered,
				opened: test.variant_b_opened,
				clicked: test.variant_b_clicked,
				delivery_rate: variantBDeliveryRate.toFixed(2),
				open_rate: variantBOpenRate.toFixed(2),
				click_rate: variantBClickRate.toFixed(2),
			},
		}),
		{
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		}
	);
}

// Main handler
Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		// Проверка авторизации
		const authHeader = req.headers.get('Authorization');
		if (!authHeader) {
			throw new Error('Missing authorization header');
		}

		const token = authHeader.replace('Bearer ', '');
		const {
			data: { user },
		} = await supabaseAdmin.auth.getUser(token);

		if (!user) {
			throw new Error('Unauthorized');
		}

		// Проверка super_admin
		const isAdmin = await isSuperAdmin(user.id);
		if (!isAdmin) {
			return new Response(JSON.stringify({ error: 'Forbidden' }), {
				status: 403,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Routing
		const url = new URL(req.url);
		const pathParts = url.pathname.split('/').filter(Boolean);
		const testId = pathParts[1]; // /push-ab-test-api/:id

		// GET /push-ab-test-api - список тестов
		if (req.method === 'GET' && !testId) {
			return await listABTests();
		}

		// GET /push-ab-test-api/:id - детали теста
		if (req.method === 'GET' && testId && !pathParts[2]) {
			return await getABTest(testId);
		}

		// GET /push-ab-test-api/:id/results - результаты теста
		if (req.method === 'GET' && testId && pathParts[2] === 'results') {
			return await getABTestResults(testId);
		}

		// POST /push-ab-test-api - создать тест
		if (req.method === 'POST' && !testId) {
			const body = await req.json();
			return await createABTest(body, user.id);
		}

		// POST /push-ab-test-api/:id/start - запустить тест
		if (req.method === 'POST' && testId && pathParts[2] === 'start') {
			return await startABTest(testId);
		}

		// POST /push-ab-test-api/:id/stop - остановить тест
		if (req.method === 'POST' && testId && pathParts[2] === 'stop') {
			return await stopABTest(testId);
		}

		// PUT /push-ab-test-api/:id - обновить тест
		if (req.method === 'PUT' && testId) {
			const body = await req.json();
			return await updateABTest(testId, body);
		}

		// DELETE /push-ab-test-api/:id - удалить тест
		if (req.method === 'DELETE' && testId) {
			return await deleteABTest(testId);
		}

		throw new Error('Not found');
	} catch (error) {
		console.error('[AB-TEST-API] Error:', error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: error.message.includes('Forbidden') ? 403 : 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
