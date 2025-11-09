#!/usr/bin/env node

/**
 * Test creating a task with actual Notion schema
 */

const { Client } = require('@notionhq/client');

const notion = new Client({
	auth: process.env.NOTION_API_KEY,
});

const TASKS_DB_ID = process.env.NOTION_TASKS_DB_ID || '33d47291493f43b988a331ca975521d7';

async function testCreateTask() {
	try {
		console.log('🧪 Testing task creation...\n');

		// Based on screenshot, the properties are:
		// - Title (default)
		// - Assignee
		// - Due
		// - Epic
		// - Estimate (h)
		// - GitHub Issue URL
		// - Labels
		// - PR URL
		// - Priority (P0, P1, P2, P3)
		// - Sprint
		// - Status (In progress, etc.)
		// - Vercel Preview URL

		const response = await notion.pages.create({
			parent: { database_id: TASKS_DB_ID },
			properties: {
				// Title is required
				title: {
					title: [
						{
							text: {
								content: 'API Test Task - Rate Limiting для Admin Login',
							},
						},
					],
				},

				// Priority (select)
				Priority: {
					select: {
						name: 'P0',
					},
				},

				// Status (status)
				Status: {
					status: {
						name: 'In progress',
					},
				},

				// Estimate (h) - number
				'Estimate (h)': {
					number: 3,
				},
			},
		});

		console.log('✅ Task created successfully!');
		console.log(`   ID: ${response.id}`);
		console.log(`   URL: ${response.url}`);
	} catch (error) {
		console.error('❌ Error:', error.message);
		if (error.body) {
			console.error('   Details:', JSON.stringify(error.body, null, 2));
		}
	}
}

testCreateTask();
