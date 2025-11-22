#!/usr/bin/env node

/**
 * Execute SQL file to add achievements translations
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('node:fs');
const path = require('node:path');

// Read SQL file
const sqlFile = path.join(__dirname, 'add-achievements-translations-kk.sql');
const sql = fs.readFileSync(sqlFile, 'utf8');

// Create Supabase client with service role key
const supabase = createClient(
	'https://ecuwuzqlwdkkdncampnc.supabase.co',
	process.env.SUPABASE_SERVICE_ROLE_KEY || 'sbp_f074a7f31380ee22d963995ee889291985c7ba57'
);

async function executeSql() {
	console.log('🔄 Executing SQL to add achievements translations...\n');

	try {
		// Execute SQL using rpc
		const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

		if (error) {
			console.error('❌ Error executing SQL:', error);
			process.exit(1);
		}

		console.log('✅ SQL executed successfully!');
		console.log('📊 Result:', data);
	} catch (error) {
		console.error('❌ Fatal error:', error);
		process.exit(1);
	}
}

executeSql();
