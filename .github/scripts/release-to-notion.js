const { Client } = require('@notionhq/client');
const { execSync } = require('node:child_process');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const releasesDbId = process.env.NOTION_RELEASES_DB_ID;
const tasksDbId = process.env.NOTION_TASKS_DB_ID;

async function createReleaseInNotion() {
	const event = JSON.parse(
		process.env.GITHUB_EVENT_PATH
			? require('node:fs').readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')
			: '{}'
	);

	const release = event.release;

	if (!release) {
		console.log('No release found in event');
		return;
	}

	// Получить commit SHA
	const commitSha = execSync('git rev-parse HEAD').toString().trim();

	// Получить список закрытых Issues/PRs с момента последнего релиза
	let previousTag = '';
	try {
		previousTag = execSync('git describe --tags --abbrev=0 HEAD^').toString().trim();
	} catch (_e) {
		console.log('No previous tag found');
	}

	// Получить коммиты между тегами
	let commits = [];
	if (previousTag) {
		const commitLog = execSync(`git log ${previousTag}..HEAD --oneline`).toString();
		commits = commitLog.split('\n').filter(Boolean);
	}

	// Извлечь Issue/PR номера из коммитов
	const issueNumbers = new Set();
	commits.forEach((commit) => {
		const matches = commit.match(/#(\d+)/g);
		if (matches) {
			for (const match of matches) {
				issueNumbers.add(match.replace('#', ''));
			}
		}
	});

	// Найти связанные задачи в Notion
	const linkedTasks = [];
	for (const issueNum of issueNumbers) {
		const issueUrl = `https://github.com/${process.env.GITHUB_REPOSITORY}/issues/${issueNum}`;
		const pages = await notion.databases.query({
			database_id: tasksDbId,
			filter: {
				property: 'GitHub Issue URL',
				url: {
					equals: issueUrl,
				},
			},
		});

		if (pages.results.length > 0) {
			linkedTasks.push(pages.results[0].id);

			// Обновить статус задачи на Released
			await notion.pages.update({
				page_id: pages.results[0].id,
				properties: {
					Status: {
						select: { name: 'Done' },
					},
				},
			});
		}
	}

	// Извлечь Highlights и Breaking Changes из release notes
	const body = release.body || '';
	const highlights = [];
	const breakingChanges = [];

	// Парсинг release notes
	const lines = body.split('\n');
	let currentSection = '';
	lines.forEach((line) => {
		if (line.includes('## ✨') || line.includes('## 🐛') || line.includes('## ⚡')) {
			currentSection = 'highlights';
		} else if (line.includes('## 🚨') || line.includes('Breaking')) {
			currentSection = 'breaking';
		} else if (line.startsWith('- ')) {
			if (currentSection === 'highlights') {
				highlights.push(line.substring(2));
			} else if (currentSection === 'breaking') {
				breakingChanges.push(line.substring(2));
			}
		}
	});

	// Создать Release в Notion
	await notion.pages.create({
		parent: { database_id: releasesDbId },
		properties: {
			Version: {
				title: [{ text: { content: release.tag_name } }],
			},
			Date: {
				date: { start: release.published_at },
			},
			Environment: {
				select: { name: 'Production' },
			},
			Summary: {
				rich_text: [{ text: { content: release.name || release.tag_name } }],
			},
			'Git Commit SHA': {
				rich_text: [{ text: { content: commitSha } }],
			},
			'Linked Tasks': {
				relation: linkedTasks.map((id) => ({ id })),
			},
		},
	});

	console.log(`✅ Created Notion release for ${release.tag_name}`);
	console.log(`   Linked ${linkedTasks.length} tasks`);
	console.log(`   Highlights: ${highlights.length}`);
	console.log(`   Breaking changes: ${breakingChanges.length}`);
}

createReleaseInNotion().catch(console.error);
