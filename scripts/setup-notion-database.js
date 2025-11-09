#!/usr/bin/env node

/**
 * Setup Notion database schema for Unity — Tasks
 */

const { Client } = require('@notionhq/client');

const notion = new Client({
	auth: process.env.NOTION_API_KEY,
});

const TASKS_DB_ID = process.env.NOTION_TASKS_DB_ID || '33d47291493f43b988a331ca975521d7';

async function setupDatabase() {
	try {
		console.log('🔧 Setting up Notion database schema...\n');
		console.log(`Database ID: ${TASKS_DB_ID}\n`);

		// Update database with properties
		const _response = await notion.databases.update({
			database_id: TASKS_DB_ID,
			properties: {
				// Title property (required, already exists)
				Task: {
					title: {},
				},

				// Status property (status type)
				Status: {
					status: {
						options: [
							{ name: 'Planned', color: 'gray' },
							{ name: 'In Progress', color: 'blue' },
							{ name: 'Completed', color: 'green' },
							{ name: 'Blocked', color: 'red' },
						],
					},
				},

				// Priority property (select)
				Priority: {
					select: {
						options: [
							{ name: 'Critical', color: 'red' },
							{ name: 'High', color: 'orange' },
							{ name: 'Medium', color: 'yellow' },
							{ name: 'Low', color: 'gray' },
						],
					},
				},

				// Category property (select)
				Category: {
					select: {
						options: [
							{ name: 'Security', color: 'red' },
							{ name: 'Performance', color: 'blue' },
							{ name: 'UX', color: 'purple' },
							{ name: 'Bugs', color: 'orange' },
							{ name: 'General', color: 'gray' },
						],
					},
				},

				// Team property (select)
				Team: {
					select: {
						options: [
							{ name: 'Platform', color: 'blue' },
							{ name: 'Mobile', color: 'green' },
							{ name: 'AI', color: 'purple' },
						],
					},
				},

				// Effort property (select)
				Effort: {
					select: {
						options: [
							{ name: 'S', color: 'gray' },
							{ name: 'M', color: 'yellow' },
							{ name: 'L', color: 'orange' },
							{ name: 'XL', color: 'red' },
						],
					},
				},

				// UUID property (rich text)
				UUID: {
					rich_text: {},
				},

				// Time Estimate property (rich text)
				'Time Estimate': {
					rich_text: {},
				},

				// Due Date property (date)
				'Due Date': {
					date: {},
				},
			},
		});

		console.log('✅ Database schema updated successfully!\n');
		console.log('📋 Properties added:');
		console.log('  - Task (title)');
		console.log('  - Status (status)');
		console.log('  - Priority (select)');
		console.log('  - Category (select)');
		console.log('  - Team (select)');
		console.log('  - Effort (select)');
		console.log('  - UUID (rich_text)');
		console.log('  - Time Estimate (rich_text)');
		console.log('  - Due Date (date)');
	} catch (error) {
		console.error('❌ Error:', error.message);
		if (error.body) {
			console.error('   Details:', JSON.stringify(error.body, null, 2));
		}
	}
}

setupDatabase();
