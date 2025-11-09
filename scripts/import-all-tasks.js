#!/usr/bin/env node

/**
 * Import ALL tasks to Notion:
 * 1. PRIORITY_ROADMAP (15 tasks) - DONE
 * 2. Planned tasks (6 tasks)
 * 3. Archived tasks
 */

const { Client } = require('@notionhq/client');
const fs = require('node:fs');
const path = require('node:path');

const notion = new Client({
	auth: process.env.NOTION_API_KEY,
});

const TASKS_DB_ID = process.env.NOTION_TASKS_DB_ID || '33d47291493f43b988a331ca975521d7';

/**
 * Parse planned task files
 */
function parsePlannedTasks() {
	const plannedDir = path.join(__dirname, '..', 'docs', 'plan', 'tasks', 'planned');
	const files = fs.readdirSync(plannedDir).filter((f) => f.endsWith('.md'));

	const tasks = [];

	for (const file of files) {
		const content = fs.readFileSync(path.join(plannedDir, file), 'utf-8');
		const lines = content.split('\n');

		// Extract title from first # header
		const titleLine = lines.find((l) => l.startsWith('# '));
		const title = titleLine ? titleLine.replace('# ', '').trim() : file.replace('.md', '');

		// Extract priority
		let priority = 'P3'; // Default: Low
		const priorityLine = content.match(/приоритет[:\s]+(P\d|низкий|средний|высокий|критический)/i);
		if (priorityLine) {
			const p = priorityLine[1].toLowerCase();
			if (p.includes('p0') || p.includes('критический')) priority = 'P0';
			else if (p.includes('p1') || p.includes('высокий')) priority = 'P1';
			else if (p.includes('p2') || p.includes('средний')) priority = 'P2';
			else priority = 'P3';
		}

		// Extract category from labels
		let category = 'General';
		if (content.includes('Security') || content.includes('безопасность')) category = 'Security';
		else if (content.includes('Performance') || content.includes('производительность'))
			category = 'Performance';
		else if (content.includes('UX') || content.includes('пользовательский')) category = 'UX';

		tasks.push({
			title,
			priority,
			category,
			status: 'In progress',
			source: `planned/${file}`,
		});
	}

	return tasks;
}

/**
 * Create task in Notion
 */
async function createTask(task) {
	try {
		const properties = {
			title: {
				title: [
					{
						text: {
							content: task.title,
						},
					},
				],
			},
			Status: {
				status: {
					name: task.status,
				},
			},
			Priority: {
				select: {
					name: task.priority,
				},
			},
		};

		// Add Labels
		if (task.category) {
			properties.Labels = {
				multi_select: [{ name: task.category }],
			};
		}

		// Add Sprint for planned tasks
		if (task.source?.startsWith('planned/')) {
			properties.Sprint = {
				select: {
					name: 'Future',
				},
			};
		}

		await notion.pages.create({
			parent: { database_id: TASKS_DB_ID },
			properties,
		});

		console.log(`✅ Created: ${task.title} (${task.source || 'PRIORITY_ROADMAP'})`);
	} catch (error) {
		console.error(`❌ Failed to create: ${task.title}`);
		console.error(`   Error: ${error.message}`);
	}
}

/**
 * Main function
 */
async function main() {
	console.log('🚀 Starting FULL import to Notion...\n');

	// Parse planned tasks
	console.log('📖 Parsing planned tasks...');
	const plannedTasks = parsePlannedTasks();
	console.log(`   Found ${plannedTasks.length} planned tasks\n`);

	// Show summary
	console.log('📊 Summary:');
	console.log(`   Planned tasks: ${plannedTasks.length}`);
	console.log('');

	// Import tasks
	console.log('📥 Importing planned tasks to Notion...\n');

	for (const task of plannedTasks) {
		await createTask(task);
		await new Promise((resolve) => setTimeout(resolve, 300));
	}

	console.log(`\n✅ Import completed! Imported ${plannedTasks.length} planned tasks.`);
	console.log(
		`\n📊 Total tasks in Notion: ${15 + plannedTasks.length} (15 from PRIORITY_ROADMAP + ${plannedTasks.length} planned)`
	);
}

main().catch(console.error);
