/**
 * Migration Script: admin_settings.ai_model_configs → ai_operations table
 *
 * Переносит конфигурации AI моделей из JSON в admin_settings в структурированную таблицу ai_operations
 *
 * Маппинг старых operation_type → новые operation IDs:
 * - ai_card → entry_analysis (анализ записи)
 * - ai_summary → weekly_report (недельный отчет)
 * - emotion_analysis → entry_analysis (часть анализа записи)
 * - voice_to_text → voice_to_text (отдельная операция, Whisper)
 * - ai_coach → ai_coach_dialog (AI Coach диалог)
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_SERVICE_KEY =
	process.env.SUPABASE_SERVICE_ROLE_KEY ||
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdXd1enFsd2Rra2RuY2FtcG5jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNjA1ODY5NCwiZXhwIjoyMDQxNjM0Njk0fQ.OnBM1BIQMVgJur2nM4gZGDW-PWWwSR92DpJHhPpqB88';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Маппинг старых operation_type → новые operation IDs
const OPERATION_MAPPING = {
	ai_card: 'entry_analysis',
	ai_summary: 'weekly_report',
	emotion_analysis: 'entry_analysis', // Объединяется с entry_analysis
	voice_to_text: 'voice_to_text',
	ai_coach: 'ai_coach_dialog',
};

async function migrateAIConfigs() {
	console.log('🚀 Starting AI configs migration...\n');

	try {
		// 1. Загрузить текущие конфигурации из admin_settings
		console.log('📥 Loading current configs from admin_settings...');
		const { data: settings, error: loadError } = await supabase
			.from('admin_settings')
			.select('key, value')
			.eq('key', 'ai_model_configs')
			.single();

		if (loadError) {
			console.error('❌ Error loading admin_settings:', loadError.message);
			return;
		}

		if (!settings || !settings.value) {
			console.log('⚠️  No ai_model_configs found in admin_settings');
			return;
		}

		const modelConfigs = JSON.parse(settings.value);
		console.log(`✅ Loaded ${modelConfigs.length} model configs\n`);

		// 2. Для каждой конфигурации обновить соответствующую запись в ai_operations
		console.log('🔄 Updating ai_operations table...\n');

		for (const config of modelConfigs) {
			const { operation_type, model, max_tokens, temperature } = config;
			const newOperationId = OPERATION_MAPPING[operation_type];

			if (!newOperationId) {
				console.log(`⚠️  Skipping unknown operation_type: ${operation_type}`);
				continue;
			}

			console.log(`  📝 ${operation_type} → ${newOperationId}`);
			console.log(`     Model: ${model}, Tokens: ${max_tokens}, Temp: ${temperature}`);

			// Обновить только model, max_tokens, temperature
			// НЕ трогать system_prompt и user_prompt_template (они уже есть из seed)
			const { error: updateError } = await supabase
				.from('ai_operations')
				.update({
					model,
					max_tokens,
					temperature,
					updated_at: new Date().toISOString(),
				})
				.eq('id', newOperationId);

			if (updateError) {
				console.error(`     ❌ Error updating ${newOperationId}:`, updateError.message);
			} else {
				console.log(`     ✅ Updated successfully\n`);
			}
		}

		// 3. Проверить результат
		console.log('\n📊 Verification: Current ai_operations state\n');
		const { data: operations, error: verifyError } = await supabase
			.from('ai_operations')
			.select('id, display_name, model, max_tokens, temperature')
			.order('group_name, id');

		if (verifyError) {
			console.error('❌ Error verifying:', verifyError.message);
			return;
		}

		console.table(operations);

		console.log('\n✅ Migration completed successfully!');
		console.log('\n📝 Next steps:');
		console.log('1. Verify the data in Supabase dashboard');
		console.log('2. Update AISettingsTab.tsx to read from ai_operations');
		console.log('3. Test in admin panel: http://localhost:3001/?view=admin');
		console.log('4. Keep admin_settings.ai_budget_config (separate concern)');
	} catch (error) {
		console.error('❌ Migration failed:', error);
	}
}

// Run migration
migrateAIConfigs();
