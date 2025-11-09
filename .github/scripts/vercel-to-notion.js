const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_TASKS_DB_ID;

async function updateNotionWithDeployment() {
	const event = JSON.parse(
		process.env.GITHUB_EVENT_PATH
			? require('node:fs').readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
			: '{}'
	);

	const deployment = event.deployment;
	const deploymentStatus = event.deployment_status;

	if (!deployment || !deploymentStatus) {
		console.log('No deployment found in event');
		return;
	}

	const deploymentUrl = deploymentStatus.target_url || deploymentStatus.environment_url;

	if (!deploymentUrl) {
		console.log('No deployment URL found');
		return;
	}

	// Получить PR или commit из deployment
	const ref = deployment.ref;
	const _sha = deployment.sha;

	// Поиск задач связанных с этим PR/commit
	const pages = await notion.databases.query({
		database_id: databaseId,
		filter: {
			or: [
				{
					property: 'GitHub PR URLs',
					rich_text: {
						contains: ref,
					},
				},
				{
					property: 'Status',
					select: {
						equals: 'In Review',
					},
				},
			],
		},
	});

	if (pages.results.length === 0) {
		console.log('No matching tasks found for deployment');
		return;
	}

	// Обновить все найденные задачи с Deployment URL
	for (const page of pages.results) {
		await notion.pages.update({
			page_id: page.id,
			properties: {
				'Vercel Preview URL': {
					url: deploymentUrl,
				},
			},
		});
		console.log(`✅ Updated task with Vercel preview: ${deploymentUrl}`);
	}
}

updateNotionWithDeployment().catch(console.error);
