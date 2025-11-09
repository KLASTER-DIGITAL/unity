const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_TASKS_DB_ID;

async function syncIssueToNotion() {
	const issue = JSON.parse(
		process.env.GITHUB_EVENT_PATH
			? require('node:fs').readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
			: '{}'
	).issue;

	if (!issue) {
		console.log('No issue found in event');
		return;
	}

	// Маппинг статусов GitHub → Notion
	const statusMap = {
		open: 'Ready',
		closed: 'Done',
	};

	// Маппинг приоритетов из labels
	const priorityMap = {
		'P0-Critical': 'P0-Critical',
		'P1-High': 'P1-High',
		'P2-Medium': 'P2-Medium',
		'P3-Low': 'P3-Low',
	};

	// Извлечь приоритет из labels
	let priority = 'P2-Medium'; // default
	const labels = issue.labels || [];
	for (const label of labels) {
		if (priorityMap[label.name]) {
			priority = priorityMap[label.name];
			break;
		}
	}

	// Извлечь Product Area из labels
	const productAreaMap = {
		PWA: 'Mobile',
		'React Native': 'Mobile',
		Backend: 'Backend',
		Database: 'Backend',
		Admin: 'Admin',
		Infrastructure: 'Infrastructure',
	};

	let productArea = 'Mobile'; // default
	for (const label of labels) {
		if (productAreaMap[label.name]) {
			productArea = productAreaMap[label.name];
			break;
		}
	}

	// Поиск существующей задачи в Notion
	const existingPages = await notion.databases.query({
		database_id: databaseId,
		filter: {
			property: 'GitHub Issue URL',
			url: {
				equals: issue.html_url,
			},
		},
	});

	const properties = {
		Title: {
			title: [{ text: { content: issue.title } }],
		},
		Status: {
			select: { name: statusMap[issue.state] || 'Ready' },
		},
		Priority: {
			select: { name: priority },
		},
		'Product Area': {
			select: { name: productArea },
		},
		'GitHub Issue URL': {
			url: issue.html_url,
		},
		Labels: {
			multi_select: labels.map((l) => ({ name: l.name })),
		},
	};

	// Добавить Assignee если есть
	if (issue.assignee) {
		// Notion требует user ID, здесь можно добавить маппинг GitHub username → Notion user ID
		// properties['Assignee'] = { people: [{ id: 'notion-user-id' }] };
	}

	if (existingPages.results.length > 0) {
		// Обновить существующую задачу
		const pageId = existingPages.results[0].id;
		await notion.pages.update({
			page_id: pageId,
			properties,
		});
		console.log(`✅ Updated Notion task for issue #${issue.number}`);
	} else {
		// Создать новую задачу
		await notion.pages.create({
			parent: { database_id: databaseId },
			properties,
		});
		console.log(`✅ Created Notion task for issue #${issue.number}`);
	}
}

syncIssueToNotion().catch(console.error);
