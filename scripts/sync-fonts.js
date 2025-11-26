/**
 * Font sync script for Supabase Storage
 * Downloads missing Noto Sans/Serif fonts from Google Fonts and uploads to Supabase
 */

// Load .env file
require('dotenv').config();

const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const { createClient } = require('@supabase/supabase-js');

// Supabase config
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('❌ Missing Supabase credentials!');
	console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Required fonts for PDF generation
const REQUIRED_FONTS = {
	'noto-sans': [
		{ weight: 400, style: 'normal', filename: 'NotoSans-Regular.woff2' },
		{ weight: 400, style: 'italic', filename: 'NotoSans-Italic.woff2' },
		{ weight: 500, style: 'normal', filename: 'NotoSans-Medium.woff2' },
		{ weight: 600, style: 'normal', filename: 'NotoSans-SemiBold.woff2' },
		{ weight: 700, style: 'normal', filename: 'NotoSans-Bold.woff2' },
	],
	'noto-serif': [
		{ weight: 400, style: 'normal', filename: 'NotoSerif-Regular.woff2' },
		{ weight: 400, style: 'italic', filename: 'NotoSerif-Italic.woff2' },
		{ weight: 600, style: 'normal', filename: 'NotoSerif-SemiBold.woff2' },
		{ weight: 700, style: 'normal', filename: 'NotoSerif-Bold.woff2' },
	],
};

// Google Fonts API URLs (static CDN)
const FONT_URLS = {
	'noto-sans': {
		400: {
			normal:
				'https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A-9a6Vc.woff2',
			italic:
				'https://fonts.gstatic.com/s/notosans/v36/o-0kIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjc5a7dp6vmZbK_uvM.woff2',
		},
		500: {
			normal:
				'https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyDNA-9a6Vc.woff2',
		},
		600: {
			normal:
				'https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyAJBO9a6Vc.woff2',
		},
		700: {
			normal:
				'https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyAQBO9a6Vc.woff2',
		},
	},
	'noto-serif': {
		400: {
			normal:
				'https://fonts.gstatic.com/s/notoserif/v24/ga6iaw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTa32J4wsL2JAlAhZqFGjwM0Lhf5TeMk.woff2',
			italic:
				'https://fonts.gstatic.com/s/notoserif/v24/ga6saw1J5X9T9RW6j9bNfFIMZhhWnFTyNZIQD1-_7q4.woff2',
		},
		600: {
			normal:
				'https://fonts.gstatic.com/s/notoserif/v24/ga6iaw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTa32J4wsL2JAlAhZqFGjwM1vgv5TeMk.woff2',
		},
		700: {
			normal:
				'https://fonts.gstatic.com/s/notoserif/v24/ga6iaw1J5X9T9RW6j9bNVls-hfgvz8JcMofYTa32J4wsL2JAlAhZqFGjwM1Wgv5TeMk.woff2',
		},
	},
};

async function downloadFont(url, filepath) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(filepath);
		https
			.get(url, (response) => {
				response.pipe(file);
				file.on('finish', () => {
					file.close();
					resolve();
				});
			})
			.on('error', (err) => {
				fs.unlink(filepath, () => {}); // Delete partial file
				reject(err);
			});
	});
}

async function checkExistingFonts() {
	console.log('🔍 Checking existing fonts in Supabase Storage...\n');

	const { data, error } = await supabase.storage.from('assets').list('fonts');

	if (error) {
		console.error('❌ Error listing fonts:', error);
		return new Set();
	}

	const existing = new Set();
	for (const item of data || []) {
		if (item.name.endsWith('.woff2')) {
			existing.add(item.name);
		}
	}

	console.log(`Found ${existing.size} existing font files\n`);
	return existing;
}

async function uploadFont(family, filename, filepath) {
	const storagePath = `fonts/${family}/${filename}`;

	console.log(`📤 Uploading ${storagePath}...`);

	const fileBuffer = fs.readFileSync(filepath);

	const { error } = await supabase.storage.from('assets').upload(storagePath, fileBuffer, {
		contentType: 'font/woff2',
		upsert: true,
	});

	if (error) {
		console.error(`  ❌ Upload failed:`, error.message);
		return false;
	}

	console.log(`  ✅ Uploaded successfully`);
	return true;
}

async function main() {
	console.log('🚀 Starting font sync...\n');

	// Create temp directory
	const tempDir = path.join(process.cwd(), '.fonts-temp');
	if (!fs.existsSync(tempDir)) {
		fs.mkdirSync(tempDir, { recursive: true });
	}

	// Check existing fonts
	const existing = await checkExistingFonts();

	let downloadedCount = 0;
	let uploadedCount = 0;
	let skippedCount = 0;

	for (const [family, fonts] of Object.entries(REQUIRED_FONTS)) {
		console.log(`\n📚 Processing ${family}...`);

		for (const font of fonts) {
			const storagePath = `${family}/${font.filename}`;

			// Check if already exists
			if (existing.has(storagePath)) {
				console.log(`⏭️  Skipping ${font.filename} (already exists)`);
				skippedCount++;
				continue;
			}

			// Get download URL
			const url = FONT_URLS[family]?.[font.weight]?.[font.style];
			if (!url) {
				console.warn(`⚠️  No URL for ${font.filename}`);
				continue;
			}

			// Download
			const filepath = path.join(tempDir, font.filename);
			console.log(`⬇️  Downloading ${font.filename}...`);

			try {
				await downloadFont(url, filepath);
				console.log(`  ✅ Downloaded`);
				downloadedCount++;

				// Upload to Supabase
				const success = await uploadFont(family, font.filename, filepath);
				if (success) {
					uploadedCount++;
				}

				// Cleanup
				fs.unlinkSync(filepath);
			} catch (err) {
				console.error(`  ❌ Error:`, err.message);
			}
		}
	}

	// Cleanup temp directory
	try {
		fs.rmdirSync(tempDir);
	} catch (_err) {
		// Ignore
	}

	console.log('\n✨ Font sync complete!');
	console.log(`📊 Summary:`);
	console.log(`   Downloaded: ${downloadedCount}`);
	console.log(`   Uploaded: ${uploadedCount}`);
	console.log(`   Skipped: ${skippedCount}`);
}

main().catch((err) => {
	console.error('❌ Fatal error:', err);
	process.exit(1);
});
