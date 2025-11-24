/**
 * Script to download Noto fonts from Google Fonts CDN and upload to Supabase Storage
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key deno run --allow-net --allow-write --allow-env scripts/upload-fonts-to-storage.ts
 *
 * Or with Node.js:
 *   SUPABASE_SERVICE_ROLE_KEY=your_key npx tsx scripts/upload-fonts-to-storage.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://ecuwuzqlwdkkdncampnc.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
	console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
	console.error('   Set it as environment variable: SUPABASE_SERVICE_ROLE_KEY=your_key');
	Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Font definitions - we'll extract URLs from Google Fonts CSS
const fontFamilies = [
	{ name: 'Noto Sans', variant: 'wght@400;500;600;700', path: 'fonts/noto-sans/' },
	{ name: 'Noto Serif', variant: 'wght@400;600', path: 'fonts/noto-serif/' },
	{ name: 'Noto Sans SC', variant: 'wght@400;500;600;700', path: 'fonts/noto-sans-sc/' },
	{ name: 'Noto Serif SC', variant: 'wght@400;600', path: 'fonts/noto-serif-sc/' },
	{ name: 'Noto Sans JP', variant: 'wght@400;500;600;700', path: 'fonts/noto-sans-jp/' },
	{ name: 'Noto Serif JP', variant: 'wght@400;600', path: 'fonts/noto-serif-jp/' },
];

interface FontFile {
	name: string;
	path: string;
	url: string;
	weight: string;
}

async function extractFontUrls(familyName: string, variant: string): Promise<FontFile[]> {
	const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(familyName)}:${variant}&display=swap`;
	console.log(`📥 Fetching CSS from: ${cssUrl}`);

	const response = await fetch(cssUrl, {
		headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch CSS: ${response.statusText}`);
	}

	const css = await response.text();
	const fontFiles: FontFile[] = [];

	// Extract WOFF2 URLs from CSS
	const urlRegex = /url\(([^)]+\.woff2)\)/g;
	const weightRegex = /font-weight:\s*(\d+)/;

	let match;
	while ((match = urlRegex.exec(css)) !== null) {
		const url = match[1].replace(/['"]/g, '');
		const weightMatch = css.substring(0, match.index).match(weightRegex);
		const weight = weightMatch ? weightMatch[1] : '400';

		// Generate filename - match the format used in Edge Function
		const familySlug = familyName.replace(/\s+/g, '');
		const weightName =
			weight === '400'
				? 'Regular'
				: weight === '500'
					? 'Medium'
					: weight === '600'
						? 'SemiBold'
						: 'Bold';
		// Edge Function expects: NotoSans-Regular.woff2, NotoSerif-Regular.woff2, etc.
		const fileName = `${familySlug}-${weightName}.woff2`;

		fontFiles.push({
			name: fileName,
			path: getPathForFamily(familyName),
			url,
			weight,
		});
	}

	return fontFiles;
}

function getPathForFamily(familyName: string): string {
	const pathMap: Record<string, string> = {
		'Noto Sans': 'fonts/noto-sans/',
		'Noto Serif': 'fonts/noto-serif/',
		'Noto Sans SC': 'fonts/noto-sans-sc/',
		'Noto Serif SC': 'fonts/noto-serif-sc/',
		'Noto Sans JP': 'fonts/noto-sans-jp/',
		'Noto Serif JP': 'fonts/noto-serif-jp/',
	};
	return pathMap[familyName] || 'fonts/';
}

async function downloadFont(url: string): Promise<Uint8Array> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to download ${url}: ${response.statusText}`);
	}
	const arrayBuffer = await response.arrayBuffer();
	return new Uint8Array(arrayBuffer);
}

async function uploadFontToStorage(
	fontName: string,
	fontPath: string,
	fontData: Uint8Array
): Promise<boolean> {
	const storagePath = `${fontPath}${fontName}`;
	console.log(`⬆️  Uploading: ${storagePath} (${(fontData.length / 1024).toFixed(2)} KB)`);

	const { error } = await supabase.storage.from('assets').upload(storagePath, fontData, {
		contentType: 'font/woff2',
		upsert: true,
	});

	if (error) {
		console.error(`❌ Failed to upload ${storagePath}:`, error.message);
		return false;
	}

	console.log(`✅ Uploaded: ${storagePath}`);
	return true;
}

async function ensureBucketExists(): Promise<boolean> {
	// Check if bucket exists
	const { data, error } = await supabase.storage.listBuckets();

	if (error) {
		console.error('❌ Failed to list buckets:', error.message);
		return false;
	}

	const assetsBucket = data?.find((b) => b.name === 'assets');
	if (assetsBucket) {
		console.log('✅ Bucket "assets" exists');
		// Make sure it's public
		if (!assetsBucket.public) {
			console.log('⚠️  Bucket is not public, updating...');
			// Note: Supabase JS client doesn't have updateBucket, need to use REST API
		}
		return true;
	}

	// Create bucket if it doesn't exist
	console.log('📦 Creating bucket "assets"...');
	const { error: createError } = await supabase.storage.createBucket('assets', {
		public: true,
		allowedMimeTypes: ['font/woff2'],
	});

	if (createError) {
		console.error('❌ Failed to create bucket:', createError.message);
		return false;
	}

	console.log('✅ Bucket "assets" created');
	return true;
}

async function main() {
	console.log('🚀 Starting font upload process...\n');

	// Ensure bucket exists
	if (!(await ensureBucketExists())) {
		console.error('❌ Failed to ensure bucket exists');
		Deno.exit(1);
	}

	// Collect all font files
	const allFontFiles: FontFile[] = [];

	for (const family of fontFamilies) {
		try {
			console.log(`\n📚 Processing ${family.name}...`);
			const fonts = await extractFontUrls(family.name, family.variant);
			allFontFiles.push(...fonts);
			console.log(`   Found ${fonts.length} font files`);
		} catch (error) {
			console.error(`❌ Error processing ${family.name}:`, error);
		}
	}

	console.log(`\n📦 Total fonts to upload: ${allFontFiles.length}\n`);

	let successCount = 0;
	let failCount = 0;

	// Download and upload each font
	for (const font of allFontFiles) {
		try {
			const fontData = await downloadFont(font.url);
			const success = await uploadFontToStorage(font.name, font.path, fontData);

			if (success) {
				successCount++;
			} else {
				failCount++;
			}

			// Small delay to avoid rate limiting
			await new Promise((resolve) => setTimeout(resolve, 300));
		} catch (error) {
			console.error(`❌ Error processing ${font.name}:`, error);
			failCount++;
		}
	}

	console.log(`\n📊 Summary:`);
	console.log(`   ✅ Success: ${successCount}`);
	console.log(`   ❌ Failed: ${failCount}`);
	console.log(`   📦 Total: ${allFontFiles.length}`);

	if (failCount === 0) {
		console.log('\n🎉 All fonts uploaded successfully!');
		console.log('\n📝 Next steps:');
		console.log('   1. Update books-render-puppeteer/index.ts to use local fonts');
		console.log('   2. Deploy the updated Edge Function');
	} else {
		console.log(`\n⚠️  ${failCount} fonts failed to upload`);
		Deno.exit(1);
	}
}

if (import.meta.main) {
	main().catch((error) => {
		console.error('❌ Fatal error:', error);
		Deno.exit(1);
	});
}
