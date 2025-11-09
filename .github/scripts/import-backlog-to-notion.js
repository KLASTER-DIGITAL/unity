const { Client } = require('@notionhq/client');
const fs = require('node:fs');
const path = require('node:path');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const tasksDbId = process.env.NOTION_TASKS_DB_ID;
const _roadmapDbId = process.env.NOTION_ROADMAP_DB_ID;

// Парсинг BACKLOG.md
function parseBacklog() {
	const backlogPath = 'docs/plan/BACKLOG.md';

	// Проверить существует ли файл
	if (!fs.existsSync(backlogPath)) {
		console.log('⚠️  BACKLOG.md не найден (возможно уже архивирован)');
		return [];
	}

	const content = fs.readFileSync(backlogPath, 'utf8');
	const tasks = [];

	const lines = content.split('\n');
	let currentTask = null;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Найти начало задачи: ### [TASK-XXX]
		const taskMatch = line.match(/^### \[TASK-(\d+)\] (.+)/);
		if (taskMatch) {
			if (currentTask) {
				tasks.push(currentTask);
			}

			currentTask = {
				id: taskMatch[1],
				title: taskMatch[2],
				status: 'Ready',
				priority: 'P2-Medium',
				estimate: '',
				team: '',
				description: '',
				progress: [],
				source: 'BACKLOG.md',
			};
			continue;
		}

		if (!currentTask) continue;

		// Парсинг полей задачи
		if (line.startsWith('**Статус**:')) {
			const statusMatch = line.match(/✅ Завершено|📅 Готово к старту|🔄 В работе|💡 Идея/);
			if (statusMatch) {
				const statusMap = {
					'✅ Завершено': 'Done',
					'📅 Готово к старту': 'Ready',
					'🔄 В работе': 'In Progress',
					'💡 Идея': 'Backlog',
				};
				currentTask.status = statusMap[statusMatch[0]] || 'Ready';
			}
		}

		if (line.startsWith('**Приоритет**:')) {
			const priorityMatch = line.match(/P0|P1|P2|P3/);
			if (priorityMatch) {
				const priorityMap = {
					P0: 'P0-Critical',
					P1: 'P1-High',
					P2: 'P2-Medium',
					P3: 'P3-Low',
				};
				currentTask.priority = priorityMap[priorityMatch[0]] || 'P2-Medium';
			}
		}

		if (line.startsWith('**Оценка**:')) {
			currentTask.estimate = line.replace('**Оценка**:', '').trim();
		}

		if (line.startsWith('**Команда**:')) {
			currentTask.team = line.replace('**Команда**:', '').trim();
		}

		if (line.startsWith('**Описание**:')) {
			currentTask.description = lines[i + 1] || '';
		}

		// Парсинг прогресса (чекбоксы)
		if (line.match(/^- \[[ x]\]/)) {
			currentTask.progress.push(line);
		}
	}

	if (currentTask) {
		tasks.push(currentTask);
	}

	return tasks;
}

// Парсинг завершенных задач из архивов
function parseCompletedTasks() {
	const tasks = [];
	const archiveDirs = ['docs/archive/2025-10-25/completed', 'docs/plan/tasks/archive'];

	for (const dir of archiveDirs) {
		if (!fs.existsSync(dir)) continue;

		const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

		for (const file of files) {
			const filePath = path.join(dir, file);
			const content = fs.readFileSync(filePath, 'utf8');

			// Извлечь название задачи из заголовка
			const titleMatch = content.match(/^# (.+)/m);
			if (!titleMatch) continue;

			const title = titleMatch[1];

			// Извлечь дату завершения из имени файла
			const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
			const completedDate = dateMatch ? dateMatch[1] : '2025-10-25';

			tasks.push({
				id: `ARCHIVE-${tasks.length + 1}`,
				title: title,
				status: 'Done',
				priority: 'P1-High', // Предполагаем что завершенные задачи были важными
				estimate: '',
				team: 'AI Assistant',
				description: `Завершено: ${completedDate}`,
				progress: [],
				source: file,
				completedDate: completedDate,
			});
		}
	}

	return tasks;
}

async function importToNotion() {
	console.log('📥 Импорт задач в Notion...\n');

	// Импортировать задачи из BACKLOG.md
	const backlogTasks = parseBacklog();
	console.log(`📋 Найдено задач в BACKLOG.md: ${backlogTasks.length}`);

	// Импортировать завершенные задачи из архивов
	const completedTasks = parseCompletedTasks();
	console.log(`📦 Найдено завершенных задач в архивах: ${completedTasks.length}`);

	// Объединить все задачи
	const allTasks = [...backlogTasks, ...completedTasks];
	console.log(`📊 Всего задач для импорта: ${allTasks.length}\n`);

	let imported = 0;
	let skipped = 0;
	let errors = 0;

	for (const task of allTasks) {
		try {
			// Проверить существует ли задача
			const searchQuery = task.id.startsWith('ARCHIVE')
				? task.title.substring(0, 50) // Для архивных задач ищем по названию
				: `TASK-${task.id}`; // Для обычных задач ищем по ID

			const existing = await notion.databases.query({
				database_id: tasksDbId,
				filter: {
					property: 'Title',
					title: {
						contains: searchQuery,
					},
				},
			});

			if (existing.results.length > 0) {
				console.log(`⏭️  ${task.id}: уже существует, пропускаем`);
				skipped++;
				continue;
			}

			// Создать задачу в Notion
			const taskTitle = task.id.startsWith('ARCHIVE')
				? `[${task.id}] ${task.title}`
				: `[TASK-${task.id}] ${task.title}`;

			const properties = {
				Title: {
					title: [{ text: { content: taskTitle } }],
				},
				Status: {
					select: { name: task.status },
				},
				Priority: {
					select: { name: task.priority },
				},
				'Product Area': {
					select: { name: 'Mobile' }, // default
				},
			};

			// Добавить Estimate если есть
			if (task.estimate) {
				properties.Estimate = {
					rich_text: [{ text: { content: task.estimate } }],
				};
			}

			// Добавить Labels для архивных задач
			if (task.id.startsWith('ARCHIVE')) {
				properties.Labels = {
					multi_select: [{ name: 'archived' }, { name: 'completed' }],
				};
			}

			await notion.pages.create({
				parent: { database_id: tasksDbId },
				properties: properties,
			});

			console.log(
				`✅ ${task.id}: импортировано (${task.status}, ${task.priority}) [${task.source}]`
			);
			imported++;
		} catch (error) {
			console.error(`❌ ${task.id}: ошибка - ${error.message}`);
			errors++;
		}
	}

	console.log(`\n📊 Итого:`);
	console.log(`   ✅ Импортировано: ${imported}`);
	console.log(`   ⏭️  Пропущено: ${skipped}`);
	console.log(`   ❌ Ошибок: ${errors}`);
	console.log(`   📋 Всего: ${allTasks.length}`);
	console.log(`\n🎉 Импорт завершен!`);
}

importToNotion().catch(console.error);
