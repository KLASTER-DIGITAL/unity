const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_TASKS_DB_ID;

async function syncPRToNotion() {
	const event = JSON.parse(
		process.env.GITHUB_EVENT_PATH
			? require('node:fs').readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
			: '{}'
	);

	const pr = event.pull_request;

	if (!pr) {
		console.log('No PR found in event');
		return;
	}

	// Маппинг статусов PR → Notion
	let status = 'Ready';
	if (pr.draft) {
		status = 'In Progress';
	} else if (pr.state === 'open') {
		status = 'In Review';
	} else if (pr.merged) {
		status = 'Done';
	} else if (pr.state === 'closed') {
		status = 'Blocked';
	}

	// Извлечь Issue ID из PR title или body
	const issueMatch = pr.title.match(/#(\d+)/) || pr.body?.match(/#(\d+)/);
	let issueUrl = null;
	if (issueMatch) {
		const issueNumber = issueMatch[1];
		issueUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${issueNumber}`;
	}

	// Поиск задачи по Issue URL или PR URL
	const filter = {
		or: [
			{
				property: 'GitHub PR URLs',
				rich_text: {
					contains: pr.html_url,
				},
			},
		],
	};

	if (issueUrl) {
		filter.or.push({
			property: 'GitHub Issue URL',
			url: {
				equals: issueUrl,
			},
		});
	}

	const existingPages = await notion.databases.query({
		database_id: databaseId,
		filter,
	});

	if (existingPages.results.length > 0) {
		// Обновить существующую задачу
		const pageId = existingPages.results[0].id;

		const properties = {
			Status: {
				select: { name: status },
			},
			'GitHub PR URLs': {
				rich_text: [{ text: { content: pr.html_url } }],
			},
		};

		await notion.pages.update({
			page_id: pageId,
			properties,
		});
		console.log(`✅ Updated Notion task for PR #${pr.number} → Status: ${status}`);
	} else if (issueUrl) {
		// Создать новую задачу если есть связанный Issue
		await notion.pages.create({
			parent: { database_id: databaseId },
			properties: {
				Title: {
					title: [{ text: { content: pr.title } }],
				},
				Status: {
					select: { name: status },
				},
				'GitHub Issue URL': {
					url: issueUrl,
				},
				'GitHub PR URLs': {
					rich_text: [{ text: { content: pr.html_url } }],
				},
			},
		});
		console.log(`✅ Created Notion task for PR #${pr.number}`);
	} else {
		console.log(`⚠️ No linked issue found for PR #${pr.number}, skipping`);
	}
}

syncPRToNotion().catch(console.error);
