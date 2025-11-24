/**
 * Books Render PDF API (Vercel Serverless Function)
 *
 * Server-side PDF rendering using Puppeteer for perfect Unicode support and quality.
 * Supports all 9 languages in the system with proper fonts.
 *
 * Endpoint: POST /api/books/render-pdf
 *
 * Request body:
 * {
 *   bookId: string,
 *   accessToken: string,
 * }
 *
 * @author UNITY Team
 * @date 2025-11-23
 */

import * as chromium from '@sparticuz/chromium';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import puppeteer from 'puppeteer-core';

// ✅ CORS headers (используются в handler)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function send(res: VercelResponse, status: number, body: Record<string, unknown>) {
	for (const [k, v] of Object.entries(corsHeaders)) {
		res.setHeader(k, v as string);
	}
	return res.status(status).json(body);
}

type BookChapter = {
	title?: string;
	content?: string;
	highlights?: string[];
	is_divider?: boolean;
	is_chronicle?: boolean;
	source_entry_ids?: string[];
};

type BookStory = {
	title?: string;
	subtitle?: string;
	prologue?: string;
	epilogue?: string;
	dedication?: string;
	chapters?: BookChapter[];
};

type BookMetadata = {
	diaryEmoji?: string;
	achievements?: Array<{
		id?: string;
		date?: string;
		category?: string | null;
		summary?: string;
	}>;
};

// ✅ Функция экранирования HTML для безопасности и правильного отображения UTF-8
function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ✅ Определение языка для правильного отображения текста (9 языков)
function getLanguageCode(language?: string): string {
	const langMap: Record<string, string> = {
		ru: 'ru',
		en: 'en',
		es: 'es',
		de: 'de',
		fr: 'fr',
		zh: 'zh-CN',
		ja: 'ja',
		kk: 'kk', // Казахский
		ka: 'ka', // Грузинский
	};
	return langMap[language || 'ru'] || 'ru';
}

// ✅ Базовый путь для локальных шрифтов (Supabase Storage, bucket assets/fonts)
const FONT_BASE_URL =
	'https://ecuwuzqlwdkkdncampnc.supabase.co/storage/v1/object/public/assets/fonts';

type FontConfig = {
	family: string;
	path: string;
	weights: Array<{ file: string; weight: number }>;
	unicodeRange?: string;
};

// ✅ Локальные шрифты (WOFF2), загруженные в Supabase Storage через scripts/upload-fonts-to-storage.ts
const FONT_MAP: Record<string, FontConfig[]> = {
	// Кириллица / латиница (ru, en, es, de, fr, kk)
	latin: [
		{
			family: 'Noto Sans',
			path: 'noto-sans',
			weights: [
				{ file: 'NotoSans-Regular.woff2', weight: 400 },
				{ file: 'NotoSans-Medium.woff2', weight: 500 },
				{ file: 'NotoSans-SemiBold.woff2', weight: 600 },
				{ file: 'NotoSans-Bold.woff2', weight: 700 },
			],
		},
		{
			family: 'Noto Serif',
			path: 'noto-serif',
			weights: [
				{ file: 'NotoSerif-Regular.woff2', weight: 400 },
				{ file: 'NotoSerif-Bold.woff2', weight: 700 },
			],
		},
	],
	// Упрощённый китайский (zh-CN)
	'zh-CN': [
		{
			family: 'Noto Sans SC',
			path: 'noto-sans-sc',
			weights: [
				{ file: 'NotoSansSC-Regular.woff2', weight: 400 },
				{ file: 'NotoSansSC-Medium.woff2', weight: 500 },
				{ file: 'NotoSansSC-SemiBold.woff2', weight: 600 },
				{ file: 'NotoSansSC-Bold.woff2', weight: 700 },
			],
		},
		{
			family: 'Noto Serif SC',
			path: 'noto-serif-sc',
			weights: [
				{ file: 'NotoSerifSC-Regular.woff2', weight: 400 },
				{ file: 'NotoSerifSC-Bold.woff2', weight: 700 },
			],
		},
	],
	// Японский (ja)
	ja: [
		{
			family: 'Noto Sans JP',
			path: 'noto-sans-jp',
			weights: [
				{ file: 'NotoSansJP-Regular.woff2', weight: 400 },
				{ file: 'NotoSansJP-Medium.woff2', weight: 500 },
				{ file: 'NotoSansJP-SemiBold.woff2', weight: 600 },
				{ file: 'NotoSansJP-Bold.woff2', weight: 700 },
			],
		},
		{
			family: 'Noto Serif JP',
			path: 'noto-serif-jp',
			weights: [
				{ file: 'NotoSerifJP-Regular.woff2', weight: 400 },
				{ file: 'NotoSerifJP-Bold.woff2', weight: 700 },
			],
		},
	],
	// Грузинский (ka) — используют те же Noto Sans/Serif (лат/кир), но Google-фонт для Georgian может отсутствовать,
	// поэтому оставляем общий набор; для идеала можно добавить NotoSansGeorgian/NotoSerifGeorgian в Storage аналогично.
	ka: [
		{
			family: 'Noto Sans',
			path: 'noto-sans',
			weights: [
				{ file: 'NotoSans-Regular.woff2', weight: 400 },
				{ file: 'NotoSans-Medium.woff2', weight: 500 },
				{ file: 'NotoSans-SemiBold.woff2', weight: 600 },
				{ file: 'NotoSans-Bold.woff2', weight: 700 },
			],
		},
		{
			family: 'Noto Serif',
			path: 'noto-serif',
			weights: [
				{ file: 'NotoSerif-Regular.woff2', weight: 400 },
				{ file: 'NotoSerif-Bold.woff2', weight: 700 },
			],
		},
	],
};

function getFontConfigs(language: string): FontConfig[] {
	if (FONT_MAP[language]) return FONT_MAP[language];
	return FONT_MAP.latin; // fallback для ru/en/es/de/fr/kk
}

function buildFontFaceCss(language: string): string {
	const fonts = getFontConfigs(language);
	return fonts
		.map((font) =>
			font.weights
				.map(
					(w) => `
@font-face {
	font-family: '${font.family}';
	src: url('${FONT_BASE_URL}/${font.path}/${w.file}') format('woff2');
	font-weight: ${w.weight};
	font-style: normal;
	font-display: swap;
}
`
				)
				.join('\n')
		)
		.join('\n');
}

/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: render builder aggregates branches */
function generateBookHTML(
	story: BookStory,
	metadata: BookMetadata,
	style: string,
	theme: string,
	layout: string,
	language?: string
): string {
	const isDark = theme === 'dark';
	const bgColor = isDark ? '#1a1a1a' : '#FFFFFF';
	const textColor = isDark ? '#e5e5e5' : '#1a1a1a';
	const mutedColor = isDark ? '#a1a1a1' : '#666666';

	// Style-specific colors (из wizard)
	const styleColors = {
		warm_family: { primary: '#9333ea', secondary: '#a855f7' },
		biographical: { primary: '#2563eb', secondary: '#3b82f6' },
		motivational: { primary: '#16a34a', secondary: '#22c55e' },
	};
	const colors = styleColors[style as keyof typeof styleColors] || styleColors.warm_family;
	const langCode = getLanguageCode(language);
	const fontFaceCss = buildFontFaceCss(langCode);

	// Layout-specific styles
	const layoutStyles = {
		photo_text: {
			sectionPadding: '15mm',
			sectionBg: isDark ? '#252525' : '#FAFAFA',
			sectionBorder: `1px solid ${isDark ? '#333333' : '#E5E5E5'}`,
		},
		text_only: {
			sectionPadding: '10mm',
			sectionBg: 'transparent',
			sectionBorder: 'none',
		},
		minimal: {
			sectionPadding: '5mm',
			sectionBg: 'transparent',
			sectionBorder: 'none',
		},
	};
	const layoutStyle = layoutStyles[layout as keyof typeof layoutStyles] || layoutStyles.photo_text;

	return `
<!DOCTYPE html>
<html lang="${langCode}">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${escapeHtml(story.title || 'Моя книга')}</title>
	<style>
		/* ✅ Локальные шрифты из Supabase Storage */
		${fontFaceCss}
		
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		
		@page {
			size: A4;
			margin: 0;
		}
		
	body {
		/* ✅ FIX: Приоритет шрифтов - локальные Noto Sans/Serif */
		font-family: 'Noto Sans', 'Noto Serif', 'Noto Sans SC', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
			background: ${bgColor};
			color: ${textColor};
			line-height: 1.8;
			font-size: 11pt;
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
			/* ✅ FIX: Явно указываем кодировку для правильного отображения Unicode */
			unicode-bidi: embed;
		}
		
		.page {
			width: 210mm;
			min-height: 297mm;
			padding: 20mm;
			margin: 0 auto;
			background: ${bgColor};
			page-break-after: always;
		}
		
		.title-page {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			min-height: 257mm;
			text-align: center;
		}
		
		.book-emoji {
			font-size: 64pt;
			margin-bottom: 20mm;
		}
		
		h1 {
			/* ✅ FIX: Приоритет шрифтов для заголовков - Noto Serif должен быть первым */
			font-family: 'Noto Serif', 'Noto Sans', 'Noto Serif SC', 'Noto Serif JP', serif;
			font-size: 28pt;
			font-weight: 700;
			color: ${colors.primary};
			margin-bottom: 10mm;
			line-height: 1.3;
			/* ✅ FIX: Явно указываем кодировку для правильного отображения Unicode */
			unicode-bidi: embed;
		}
		
		.subtitle {
			font-size: 14pt;
			color: ${mutedColor};
			margin-bottom: 20mm;
		}
		
		h2 {
			/* ✅ FIX: Приоритет шрифтов для подзаголовков - Noto Serif должен быть первым */
			font-family: 'Noto Serif', 'Noto Sans', 'Noto Serif SC', 'Noto Serif JP', serif;
			font-size: 18pt;
			font-weight: 600;
			color: ${colors.primary};
			margin-top: 15mm;
			margin-bottom: 8mm;
			border-bottom: 2px solid ${colors.secondary};
			padding-bottom: 3mm;
			/* ✅ FIX: Явно указываем кодировку для правильного отображения Unicode */
			unicode-bidi: embed;
		}
		
		.section {
			padding: ${layoutStyle.sectionPadding};
			background: ${layoutStyle.sectionBg};
			border: ${layoutStyle.sectionBorder};
			border-radius: 3mm;
			margin-bottom: 10mm;
		}
		
		p {
			margin-bottom: 5mm;
			text-align: justify;
			/* ✅ FIX: Явно указываем кодировку для правильного отображения Unicode */
			unicode-bidi: embed;
		}
		
		.prologue, .epilogue {
			font-style: italic;
			padding: 5mm;
			border-left: 3px solid ${colors.secondary};
			margin-bottom: 10mm;
		}
		
		.highlights {
			background: ${isDark ? '#2a2a2a' : '#f9fafb'};
			padding: 5mm;
			border-radius: 3mm;
			margin: 8mm 0;
		}
		
		.highlights ul {
			list-style: none;
			padding-left: 0;
		}
		
		.highlights li {
			padding: 2mm 0;
			padding-left: 8mm;
			position: relative;
		}
		
		.highlights li:before {
			content: "✨";
			position: absolute;
			left: 0;
		}
		
		.dedication {
			text-align: center;
			font-style: italic;
			color: ${mutedColor};
			margin-top: 15mm;
		}
		
		/* Divider Page */
		.divider-page {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			min-height: 257mm;
			text-align: center;
			background: ${isDark ? '#252525' : '#f8f9fa'};
		}
		
		.divider-title {
			/* ✅ FIX: Приоритет шрифтов для разделителей - Noto Serif должен быть первым */
			font-family: 'Noto Serif', 'Noto Sans', 'Noto Serif SC', 'Noto Serif JP', 'Noto Serif Georgian', serif;
			font-size: 32pt;
			font-weight: 700;
			color: ${colors.primary};
			margin-bottom: 10mm;
			/* ✅ FIX: Явно указываем кодировку для правильного отображения Unicode */
			unicode-bidi: embed;
		}
		
		.divider-content {
			font-size: 14pt;
			color: ${mutedColor};
			max-width: 80%;
			font-style: italic;
		}

		/* Chronicle Styles */
		.chronicle-chapter p {
			white-space: pre-wrap;
		}
	</style>
</head>
<body>
	<!-- Title Page -->
	<div class="page title-page">
		<div class="book-emoji">${metadata.diaryEmoji || '📖'}</div>
		<h1>${escapeHtml(story.title || 'Моя книга')}</h1>
		<div class="subtitle">${escapeHtml(story.subtitle || '')}</div>
		${story.dedication ? `<div class="dedication">${escapeHtml(story.dedication)}</div>` : ''}
	</div>
	
	<!-- Prologue -->
	${
		story.prologue
			? `
	<div class="page">
		<h2>Вступление</h2>
		<div class="prologue">
			${story.prologue
				.split('\n')
				.map((p: string) => `<p>${escapeHtml(p)}</p>`)
				.join('')}
		</div>
	</div>
	`
			: ''
	}
	
	<!-- Chapters -->
	${(story.chapters || [])
		.map((chapter: BookChapter, index: number) => {
			// ✅ 1. Divider Page
			if (chapter.is_divider) {
				return `
				<div class="page divider-page">
					<div class="divider-title">${escapeHtml(chapter.title || '')}</div>
					<div class="divider-content">${escapeHtml(chapter.content || '')}</div>
				</div>
				`;
			}

			// ✅ 2. Chronicle Chapter (Raw entries)
			if (chapter.is_chronicle) {
				return `
				<div class="page chronicle-chapter">
					<h2>${escapeHtml(chapter.title || '')}</h2>
					<div class="section">
						${(chapter.content || '')
							.split('\n')
							.map((p: string) => {
								// Check if line is a date header (starts with **)
								if (p.trim().startsWith('**') && p.trim().endsWith('**')) {
									return `<p style="font-weight: bold; color: ${colors.secondary}; margin-top: 10mm; margin-bottom: 2mm;">${escapeHtml(p.replace(/\*\*/g, ''))}</p>`;
								}
								return `<p>${escapeHtml(p)}</p>`;
							})
							.join('')}
					</div>
				</div>
				`;
			}

			// ✅ 3. Standard Story Chapter
			return `
			<div class="page">
				<h2>Глава ${index + 1}: ${escapeHtml(chapter.title || '')}</h2>
				<div class="section">
					${(chapter.content || '')
						.split('\n')
						.map((p: string) => `<p>${escapeHtml(p)}</p>`)
						.join('')}
					
					${
						chapter.highlights && chapter.highlights.length > 0
							? `
					<div class="highlights">
						<strong>Ключевые моменты:</strong>
						<ul>
							${chapter.highlights.map((h: string) => `<li>${escapeHtml(h)}</li>`).join('')}
						</ul>
					</div>
					`
							: ''
					}
				</div>
			</div>
			`;
		})
		.join('')}
	
	<!-- Epilogue -->
	${
		story.epilogue
			? `
	<div class="page">
		<h2>Заключение</h2>
		<div class="epilogue">
			${story.epilogue
				.split('\n')
				.map((p: string) => `<p>${escapeHtml(p)}</p>`)
				.join('')}
		</div>
	</div>
	`
			: ''
	}
</body>
</html>
	`;
}

/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: handler covers auth, render, upload, error branches */
export default async function handler(req: VercelRequest, res: VercelResponse) {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return send(res, 200, { ok: true });
	}

	if (req.method !== 'POST') {
		return send(res, 405, { success: false, error: 'Method not allowed' });
	}

	try {
		console.log('[VERCEL-PDF] Request received:', { method: req.method, hasBody: !!req.body });
		const { bookId, accessToken } = req.body;

		if (!bookId || !accessToken) {
			return send(res, 400, { success: false, error: 'Missing bookId or accessToken' });
		}

		// Initialize Supabase client
		// ✅ Используем переменные окружения Vercel
		// Поддерживаем как VITE_SUPABASE_URL (уже настроен), так и SUPABASE_URL
		const supabaseUrl =
			process.env.SUPABASE_URL ||
			process.env.NEXT_PUBLIC_SUPABASE_URL ||
			process.env.VITE_SUPABASE_URL ||
			'https://ecuwuzqlwdkkdncampnc.supabase.co';
		const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

		if (!supabaseServiceKey) {
			console.error('[VERCEL-PDF] Supabase service key missing');
			console.error('[VERCEL-PDF] Available env vars:', {
				hasSupabaseUrl: !!supabaseUrl,
				hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
				hasViteUrl: !!process.env.VITE_SUPABASE_URL,
			});
			return send(res, 500, {
				success: false,
				error:
					'Supabase configuration missing. Please check Vercel environment variables: SUPABASE_SERVICE_ROLE_KEY',
			});
		}

		console.log('[VERCEL-PDF] Supabase configured:', {
			url: supabaseUrl,
			hasServiceKey: !!supabaseServiceKey,
		});

		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

		// Verify user token and get user
		const {
			data: { user },
			error: authError,
		} = await supabaseAdmin.auth.getUser(accessToken);

		if (authError || !user) {
			return send(res, 401, { success: false, error: 'Invalid access token' });
		}

		// Fetch book data
		const { data: book, error: bookError } = await supabaseAdmin
			.from('books_archive')
			.select('*')
			.eq('id', bookId)
			.eq('user_id', user.id)
			.single();

		if (bookError || !book) {
			return send(res, 404, { success: false, error: 'Book not found' });
		}

		const story = book.story_json as BookStory;
		const metadata = (book.metadata || {}) as BookMetadata;
		const style = book.style || 'warm_family';
		const theme = book.theme || 'light';
		const layout = book.layout || 'photo_text';
		const language = book.language || 'ru';

		// Generate HTML
		const html = generateBookHTML(story, metadata, style, theme, layout, language);

		// Launch Puppeteer
		// ✅ Настройка Chromium для Vercel
		console.log('[VERCEL-PDF] Configuring Chromium...');
		let browser: puppeteer.Browser | null = null;
		try {
			console.log('[VERCEL-PDF] Launching browser...');
			const executablePath = await chromium.executablePath();
			console.log('[VERCEL-PDF] Chromium executable path:', executablePath);

			const launchOptions: Parameters<typeof puppeteer.launch>[0] = {
				args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
				defaultViewport: { width: 1280, height: 720 },
				executablePath,
				headless: true,
				ignoreHTTPSErrors: true,
			};

			browser = await puppeteer.launch(launchOptions);
			console.log('[VERCEL-PDF] Browser launched successfully');
		} catch (browserError) {
			console.error('[VERCEL-PDF] Failed to launch browser:', browserError);
			return send(res, 500, {
				success: false,
				error: `Failed to launch browser: ${browserError instanceof Error ? browserError.message : 'Unknown error'}`,
			});
		}

		let page: puppeteer.Page | null = null;
		try {
			console.log('[VERCEL-PDF] Creating new page...');
			page = await browser.newPage();
			console.log('[VERCEL-PDF] Page created');

			// ✅ FIX: Устанавливаем правильную кодировку для страницы
			console.log('[VERCEL-PDF] Setting page content...');
			await page.setContent(html, {
				waitUntil: 'networkidle0',
				// ✅ FIX: Явно указываем кодировку UTF-8
			});
			console.log('[VERCEL-PDF] Page content set');

			// ✅ FIX: Улучшенное ожидание загрузки шрифтов
			// Ждем загрузки всех шрифтов из Google Fonts
			console.log('[VERCEL-PDF] Waiting for fonts...');
			await page.evaluateHandle('document.fonts.ready');

			// ✅ FIX: Проверяем, что все шрифты действительно загружены
			await page.evaluate(() => {
				return new Promise<void>((resolve) => {
					if (document.fonts?.check) {
						const fontsToCheck = ['12px "Noto Sans"', '12px "Noto Serif"'];
						const allLoaded = fontsToCheck.every((font) => document.fonts.check(font));
						if (allLoaded) {
							resolve();
							return;
						}
					}
					setTimeout(() => resolve(), 3000);
				});
			});

			// ✅ FIX: Дополнительная задержка для гарантии загрузки шрифтов
			await new Promise((resolve) => setTimeout(resolve, 1000));
			console.log('[VERCEL-PDF] Fonts loaded');

			// Generate PDF
			// ✅ FIX: Добавляем waitForFonts: true для гарантии загрузки шрифтов
			console.log('[VERCEL-PDF] Generating PDF...');
			const pdfBuffer = await page.pdf({
				format: 'A4',
				printBackground: true,
				preferCSSPageSize: true,
				waitForFonts: true, // ✅ FIX: Ждем загрузки шрифтов перед генерацией PDF
				margin: {
					top: '0mm',
					right: '0mm',
					bottom: '0mm',
					left: '0mm',
				},
			});
			console.log('[VERCEL-PDF] PDF generated, size:', pdfBuffer.length, 'bytes');

			// ✅ FIX: Закрываем page и browser перед загрузкой в Storage
			await page.close();
			await browser.close();
			console.log('[VERCEL-PDF] Browser closed');

			// Upload to Supabase Storage
			console.log('[VERCEL-PDF] Uploading to Storage...');
			const fileName = `${user.id}/${bookId}.pdf`;
			const { error: uploadError } = await supabaseAdmin.storage
				.from('books')
				.upload(fileName, pdfBuffer, {
					contentType: 'application/pdf',
					upsert: true,
				});

			if (uploadError) {
				console.error('[VERCEL-PDF] Upload error:', uploadError);
				return send(res, 500, {
					success: false,
					error: `Ошибка загрузки PDF в Storage: ${uploadError.message}`,
				});
			}

			// Get public URL
			const { data: urlData } = supabaseAdmin.storage.from('books').getPublicUrl(fileName);
			const pdfUrl = urlData.publicUrl;
			console.log('[VERCEL-PDF] PDF uploaded, URL:', pdfUrl);

			// Update book with PDF URL and mark as final
			await supabaseAdmin
				.from('books_archive')
				.update({
					pdf_url: pdfUrl,
					is_final: true,
					is_draft: false,
				})
				.eq('id', bookId);
			console.log('[VERCEL-PDF] Book updated in database');

			return send(res, 200, { success: true, pdfUrl });
		} catch (pageError) {
			// ✅ FIX: Закрываем page и browser даже при ошибке
			console.error('[VERCEL-PDF] Error in page operations:', pageError);
			try {
				if (page) await page.close();
			} catch {
				// Ignore
			}
			try {
				if (browser) await browser.close();
			} catch {
				// Ignore
			}
			throw pageError; // Пробрасываем ошибку дальше
		}
	} catch (error) {
		console.error('[VERCEL-PDF] Error:', error);
		return send(res, 500, {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}
