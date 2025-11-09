#!/usr/bin/env node

/**
 * Check Notion database schema
 */

const { Client } = require('@notionhq/client');

const notion = new Client({
	auth: process.env.NOTION_API_KEY,
});

const TASKS_DB_ID = process.env.NOTION_TASKS_DB_ID || '33d47291493f43b988a331ca975521d7';

async function checkSchema() {
	try {
		console.log('🔍 Checking Notion database schema...\n');
		console.log(`Database ID: ${TASKS_DB_ID}\n`);

		const database = await notion.databases.retrieve({
			database_id: TASKS_DB_ID,
		});

		console.log('✅ Database found!');
		console.log(`Title: ${database.title[0]?.plain_text || 'Untitled'}\n`);

		console.log('📋 Properties:');
		console.log('─'.repeat(80));

		const properties = database.properties || {};

		if (Object.keys(properties).length === 0) {
			console.log('\n⚠️  No properties found in database');
		} else {
			for (const [name, prop] of Object.entries(properties)) {
				console.log(`\n${name}:`);
				console.log(`  Type: ${prop.type}`);

				if (prop.type === 'select' && prop.select?.options) {
					console.log(`  Options: ${prop.select.options.map((o) => o.name).join(', ')}`);
				}

				if (prop.type === 'multi_select' && prop.multi_select?.options) {
					console.log(`  Options: ${prop.multi_select.options.map((o) => o.name).join(', ')}`);
				}

				if (prop.type === 'status' && prop.status?.options) {
					console.log(`  Options: ${prop.status.options.map((o) => o.name).join(', ')}`);
				}
			}
		}

		console.log(`\n${'─'.repeat(80)}`);
		console.log('\n✅ Schema check completed!');

		// Print full database object for debugging
		console.log('\n🔍 Full database object:');
		console.log(JSON.stringify(database, null, 2));
	} catch (error) {
		console.error('❌ Error:', error.message);
		if (error.code) {
			console.error(`   Code: ${error.code}`);
		}
	}
}

checkSchema();
