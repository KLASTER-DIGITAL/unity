#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const colors = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	cyan: '\x1b[36m',
};

console.log(`${colors.cyan}🎨 Updating Tailwind CSS v4 syntax...${colors.reset}\n`);

// Patterns to replace
const patterns = [
	{
		regex: /text-\[var\(--([^)]+)\)\]/g,
		replacement: 'text-($1)',
		name: 'text-[var(...)]',
	},
	{
		regex: /bg-\[var\(--([^)]+)\)\]/g,
		replacement: 'bg-($1)',
		name: 'bg-[var(...)]',
	},
	{
		regex: /border-\[var\(--([^)]+)\)\]/g,
		replacement: 'border-($1)',
		name: 'border-[var(...)]',
	},
	{
		regex: /z-\[var\(--([^)]+)\)\]/g,
		replacement: 'z-($1)',
		name: 'z-[var(...)]',
	},
	{
		regex: /from-\[var\(--([^)]+)\)\]/g,
		replacement: 'from-($1)',
		name: 'from-[var(...)]',
	},
	{
		regex: /to-\[var\(--([^)]+)\)\]/g,
		replacement: 'to-($1)',
		name: 'to-[var(...)]',
	},
];

function findFiles(dir, extensions = ['.tsx', '.ts', '.css']) {
	let results = [];
	const list = fs.readdirSync(dir);

	list.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat?.isDirectory()) {
			if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(file)) {
				results = results.concat(findFiles(filePath, extensions));
			}
		} else if (extensions.some((ext) => file.endsWith(ext))) {
			results.push(filePath);
		}
	});

	return results;
}

function updateFile(filePath) {
	let content = fs.readFileSync(filePath, 'utf-8');
	let updated = false;
	let changes = 0;

	patterns.forEach(({ regex, replacement }) => {
		const matches = content.match(regex);
		if (matches) {
			content = content.replace(regex, replacement);
			changes += matches.length;
			updated = true;
		}
	});

	if (updated) {
		fs.writeFileSync(filePath, content, 'utf-8');
		return changes;
	}

	return 0;
}

const srcDir = path.join(process.cwd(), 'src');
const files = findFiles(srcDir);

let totalChanges = 0;
let filesUpdated = 0;

files.forEach((file) => {
	const changes = updateFile(file);
	if (changes > 0) {
		filesUpdated++;
		totalChanges += changes;
		console.log(
			`${colors.green}✓${colors.reset} ${file.replace(process.cwd(), '.')}: ${changes} changes`
		);
	}
});

console.log(`\n${colors.cyan}📊 Summary:${colors.reset}`);
console.log(`${colors.green}✓${colors.reset} Files updated: ${filesUpdated}`);
console.log(`${colors.green}✓${colors.reset} Total changes: ${totalChanges}`);
console.log(`\n${colors.yellow}⚠️  Run 'npm run lint:fix' to format the code${colors.reset}\n`);
