#!/usr/bin/env node

/**
 * Import tasks from BACKLOG.md to Notion
 *
 * Usage:
 *   node scripts/import-to-notion.js
 *
 * Environment variables:
 *   NOTION_API_KEY - Notion API key
 *   NOTION_TASKS_DB_ID - Tasks database ID
 */

const { Client } = require('@notionhq/client');
const fs = require('node:fs');
const path = require('node:path');

// Initialize Notion client
const notion = new Client({
	auth: process.env.NOTION_API_KEY,
});

const TASKS_DB_ID = process.env.NOTION_TASKS_DB_ID || '33d47291493f43b988a331ca975521d7';

/**
 * Parse PRIORITY_ROADMAP and extract tasks
 */
function parsePriorityRoadmap() {
	const roadmapPath = path.join(
		__dirname,
		'..',
		'docs',
		'plan',
		'tasks',
		'PRIORITY_ROADMAP_2025-11-08.md'
	);
	const content = fs.readFileSync(roadmapPath, 'utf-8');

	const tasks = [];
	const lines = content.split('\n');

	let currentPriority = 'Medium';
	let currentCategory = 'General';
	let currentTask = null;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Detect priority sections
		if (line.includes('КРИТИЧЕСКИЙ ПРИОРИТЕТ (P0)')) {
			currentPriority = 'Critical';
			continue;
		}
		if (line.includes('ВЫСОКИЙ ПРИОРИТЕТ (P1)')) {
			currentPriority = 'High';
			continue;
		}
		if (line.includes('СРЕДНИЙ ПРИОРИТЕТ (P2)')) {
			currentPriority = 'Medium';
			continue;
		}

		// Detect category sections
		if (line.includes('### 🔒 SECURITY')) {
			currentCategory = 'Security';
			continue;
		}
		if (line.includes('### ⚡ PERFORMANCE')) {
			currentCategory = 'Performance';
			continue;
		}
		if (line.includes('### 💡 UX')) {
			currentCategory = 'UX';
			continue;
		}
		if (line.includes('### 🐛 BUGS')) {
			currentCategory = 'Bugs';
			continue;
		}

		// Detect task headers (#### number. Title)
		const taskHeaderMatch = line.match(/^####\s+\d+\.\s+(.+)$/);
		if (taskHeaderMatch) {
			// Save previous task if exists
			if (currentTask) {
				tasks.push(currentTask);
			}

			// Start new task
			currentTask = {
				title: taskHeaderMatch[1].trim(),
				priority: currentPriority,
				category: currentCategory,
				status: 'In progress', // Default status from Notion
				uuid: null,
				effort: null,
			};
			continue;
		}

		// Extract UUID
		if (currentTask && line.startsWith('**UUID**:')) {
			currentTask.uuid = line.replace('**UUID**:', '').trim();
			continue;
		}

		// Extract effort (time estimate)
		if (currentTask && line.startsWith('**Время**:')) {
			currentTask.effort = line.replace('**Время**:', '').trim();
		}
	}

	// Add last task
	if (currentTask) {
		tasks.push(currentTask);
	}

	return tasks;
}

/**
 * Create task in Notion
 */
async function createTask(task) {
	try {
		const properties = {
			// Title property (required)
			title: {
				title: [
					{
						text: {
							content: task.title,
						},
					},
				],
			},

			// Status (status type)
			Status: {
				status: {
					name: task.status,
				},
			},

			// Priority (select: P0, P1, P2, P3)
			Priority: {
				select: {
					name:
						task.priority === 'Critical'
							? 'P0'
							: task.priority === 'High'
								? 'P1'
								: task.priority === 'Medium'
									? 'P2'
									: 'P3',
				},
			},
		};

		// Add Labels (multi_select) for category
		if (task.category) {
			properties.Labels = {
				multi_select: [{ name: task.category }],
			};
		}

		// Add Estimate (h) if exists
		if (task.effort) {
			// Parse effort string to hours (e.g., "3 часа" -> 3)
			const hoursMatch = task.effort.match(/(\d+(?:\.\d+)?)/);
			if (hoursMatch) {
				properties['Estimate (h)'] = {
					number: parseFloat(hoursMatch[1]),
				};
			}
		}

		await notion.pages.create({
			parent: { database_id: TASKS_DB_ID },
			properties,
		});

		console.log(`✅ Created: ${task.title}`);
	} catch (error) {
		console.error(`❌ Failed to create: ${task.title}`);
		console.error(`   Error: ${error.message}`);
	}
}

/**
 * Main function
 */
async function main() {
	console.log('🚀 Starting import from PRIORITY_ROADMAP to Notion...\n');

	// Parse PRIORITY_ROADMAP
	console.log('📖 Parsing PRIORITY_ROADMAP_2025-11-08.md...');
	const tasks = parsePriorityRoadmap();
	console.log(`   Found ${tasks.length} tasks\n`);

	// Show summary
	const byCat = tasks.reduce((acc, t) => {
		acc[t.category] = (acc[t.category] || 0) + 1;
		return acc;
	}, {});

	const byPri = tasks.reduce((acc, t) => {
		acc[t.priority] = (acc[t.priority] || 0) + 1;
		return acc;
	}, {});

	console.log('📊 Summary:');
	console.log('   By Category:', byCat);
	console.log('   By Priority:', byPri);
	console.log('');

	// Import tasks
	console.log('📥 Importing tasks to Notion...\n');

	for (const task of tasks) {
		await createTask(task);
		// Small delay to avoid rate limiting
		await new Promise((resolve) => setTimeout(resolve, 300));
	}

	console.log(`\n✅ Import completed! Imported ${tasks.length} tasks.`);
}

// Run
main().catch(console.error);
