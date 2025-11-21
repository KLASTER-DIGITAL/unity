#!/usr/bin/env node
/**
 * Script to run auto-translate for missing translation keys
 * Usage: node scripts/run-auto-translate.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

// Super admin credentials
const SUPER_ADMIN_EMAIL = 'diary@leadshunter.biz';
const SUPER_ADMIN_PASSWORD = 'admin123';

async function runAutoTranslate() {
	console.log('🚀 Starting auto-translate...\n');

	// Create Supabase client
	const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

	// Sign in as super admin
	console.log('📝 Signing in as super admin...');
	const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
		email: SUPER_ADMIN_EMAIL,
		password: SUPER_ADMIN_PASSWORD,
	});

	if (authError || !authData.session) {
		console.error('❌ Auth error:', authError);
		process.exit(1);
	}

	console.log('✅ Signed in successfully\n');

	const session = authData.session;
	const accessToken = session.access_token;

	// Function to call auto-translate Edge Function
	async function callAutoTranslate(sourceLanguage, targetLanguages) {
		console.log(`🔄 Translating from ${sourceLanguage} to ${targetLanguages.join(', ')}...`);

		try {
			const response = await fetch(`${SUPABASE_URL}/functions/v1/auto-translate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({
					sourceLanguage,
					targetLanguages,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`);
			}

			const result = await response.json();
			console.log(`✅ Success: ${result.message || 'Translated successfully'}`);
			console.log(`   Total translated: ${result.totalTranslated || 0} keys`);
			console.log(`   Total cost: $${result.totalCost || '0.0000'}\n`);
			return result;
		} catch (error) {
			console.error(`❌ Error translating to ${targetLanguages.join(', ')}:`, error.message);
			throw error;
		}
	}

	try {
		// 1. Translate missing keys for Georgian (ka)
		console.log('📋 Task 1: Translating missing keys for Georgian language...');
		await callAutoTranslate('ru', ['ka']);
		console.log('✅ Georgian translation completed\n');

		// 2. Translate Settings Screen keys for all languages
		console.log('📋 Task 2: Translating Settings Screen keys for all languages...');

		// Settings Screen keys are now handled automatically by auto-translate
		// No need to specify them manually

		// Translate to all languages except Russian (source) and Georgian (already done)
		const targetLanguages = ['en', 'es', 'de', 'fr', 'zh', 'ja', 'kk'];

		// Translate in batches to avoid timeout
		for (const targetLang of targetLanguages) {
			console.log(`📝 Translating Settings keys to ${targetLang}...`);
			await callAutoTranslate('ru', [targetLang]);

			// Small delay to avoid rate limiting
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		console.log('✅ Settings Screen translation completed\n');

		console.log('🎉 All translations completed successfully!');
	} catch (error) {
		console.error('❌ Fatal error:', error);
		process.exit(1);
	}
}

// Run the script
runAutoTranslate().catch(console.error);
