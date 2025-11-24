/**
 * Books Render Puppeteer API
 *
 * Server-side PDF rendering using Puppeteer for better Unicode support and stability.
 *
 * Endpoint:
 * - POST /books-render-puppeteer - Render PDF from HTML
 *
 * Request body:
 * {
 *   bookId: string,
 *   style: 'warm_family' | 'biographical' | 'motivational',
 * }
 *
 * @author UNITY Team
 * @date 2025-11-22
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import puppeteer from 'https://deno.land/x/puppeteer@16.2.0/mod.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
	language?: string;
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

// ✅ Определение языка для правильного отображения текста
function getLanguageCode(language?: string): string {
	const langMap: Record<string, string> = {
		ru: 'ru',
		en: 'en',
		es: 'es',
		de: 'de',
		fr: 'fr',
		kk: 'kk',
		ka: 'ka',
		'zh-CN': 'zh-CN',
		ja: 'ja',
	};
	return langMap[language || 'ru'] || 'ru';
}

// ✅ Получение правильных шрифтов для языка (путь в Storage)
function getFontPathForLanguage(language: string): { sans: string; serif: string } {
	const fontMap: Record<string, { sans: string; serif: string }> = {
		ru: { sans: 'noto-sans', serif: 'noto-serif' },
		en: { sans: 'noto-sans', serif: 'noto-serif' },
		es: { sans: 'noto-sans', serif: 'noto-serif' },
		de: { sans: 'noto-sans', serif: 'noto-serif' },
		fr: { sans: 'noto-sans', serif: 'noto-serif' },
		kk: { sans: 'noto-sans', serif: 'noto-serif' },
		ka: { sans: 'noto-sans', serif: 'noto-serif' },
		'zh-CN': { sans: 'noto-sans-sc', serif: 'noto-serif-sc' },
		ja: { sans: 'noto-sans-jp', serif: 'noto-serif-jp' },
	};
	return fontMap[language] || fontMap.ru;
}

// ✅ Генерация @font-face правил для локальных шрифтов
function getFontFacesForLanguage(language: string, fontBaseUrl: string): string {
	const fonts = getFontPathForLanguage(language);

	// Определяем префикс имени файла на основе пути
	const getFontFileName = (weight: string, isSerif: boolean): string => {
		const weightName =
			weight === '400'
				? 'Regular'
				: weight === '500'
					? 'Medium'
					: weight === '600'
						? 'SemiBold'
						: 'Bold';
		const familyName = isSerif ? 'NotoSerif' : 'NotoSans';

		// Для SC и JP вариантов имя файла будет NotoSansSC, NotoSansJP и т.д.
		if (fonts.sans === 'noto-sans-sc') {
			return isSerif ? `NotoSerifSC-${weightName}.woff2` : `NotoSansSC-${weightName}.woff2`;
		}
		if (fonts.sans === 'noto-sans-jp') {
			return isSerif ? `NotoSerifJP-${weightName}.woff2` : `NotoSansJP-${weightName}.woff2`;
		}
		// Базовые варианты (ru, en, es, de, fr, kk, ka)
		return `${familyName}-${weightName}.woff2`;
	};

	return `
		@font-face {
			font-family: 'Noto Sans';
			src: url('${fontBaseUrl}/${fonts.sans}/${getFontFileName('400', false)}') format('woff2');
			font-weight: 400;
			font-style: normal;
			font-display: swap;
		}
		@font-face {
			font-family: 'Noto Sans';
			src: url('${fontBaseUrl}/${fonts.sans}/${getFontFileName('500', false)}') format('woff2');
			font-weight: 500;
			font-style: normal;
			font-display: swap;
		}
		@font-face {
			font-family: 'Noto Sans';
			src: url('${fontBaseUrl}/${fonts.sans}/${getFontFileName('600', false)}') format('woff2');
			font-weight: 600;
			font-style: normal;
			font-display: swap;
		}
		@font-face {
			font-family: 'Noto Sans';
			src: url('${fontBaseUrl}/${fonts.sans}/${getFontFileName('700', false)}') format('woff2');
			font-weight: 700;
			font-style: normal;
			font-display: swap;
		}
		@font-face {
			font-family: 'Noto Serif';
			src: url('${fontBaseUrl}/${fonts.serif}/${getFontFileName('400', true)}') format('woff2');
			font-weight: 400;
			font-style: normal;
			font-display: swap;
		}
		@font-face {
			font-family: 'Noto Serif';
			src: url('${fontBaseUrl}/${fonts.serif}/${getFontFileName('600', true)}') format('woff2');
			font-weight: 600;
			font-style: normal;
			font-display: swap;
		}
	`;
}

function generateBookHTML(
	story: BookStory,
	metadata: BookMetadata,
	style: string,
	theme: string,
	language?: string
): string {
	const isDark = theme === 'dark';
	const bgColor = isDark ? '#1a1a1a' : '#FFFFFF';
	const textColor = isDark ? '#e5e5e5' : '#1a1a1a';
	const mutedColor = isDark ? '#a1a1a1' : '#666666';

	// Style-specific colors
	const styleColors = {
		warm_family: { primary: '#9333ea', secondary: '#a855f7' },
		biographical: { primary: '#2563eb', secondary: '#3b82f6' },
		motivational: { primary: '#16a34a', secondary: '#22c55e' },
	};
	const colors = styleColors[style as keyof typeof styleColors] || styleColors.warm_family;
	const langCode = getLanguageCode(language);

	// ✅ Получаем базовый URL для шрифтов из Storage
	const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
	const fontBaseUrl = `${supabaseUrl}/storage/v1/object/public/assets/fonts`;
	const fontFaces = getFontFacesForLanguage(langCode, fontBaseUrl);

	return `
<!DOCTYPE html>
<html lang="${langCode}">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${escapeHtml(story.title || 'Моя книга')}</title>
	<style>
		${fontFaces}
		
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		
		body {
			font-family: 'Noto Sans', 'Noto Sans SC', 'Noto Sans JP', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
			background: ${bgColor};
			color: ${textColor};
			line-height: 1.8;
			font-size: 11pt;
			-webkit-font-smoothing: antialiased;
			-moz-osx-font-smoothing: grayscale;
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
			font-family: 'Noto Serif', serif;
			font-size: 28pt;
			font-weight: 700;
			color: ${colors.primary};
			margin-bottom: 10mm;
			line-height: 1.3;
		}
		
		.subtitle {
			font-size: 14pt;
			color: ${mutedColor};
			margin-bottom: 20mm;
		}
		
		h2 {
			font-family: 'Noto Serif', serif;
			font-size: 18pt;
			font-weight: 600;
			color: ${colors.primary};
			margin-top: 15mm;
			margin-bottom: 8mm;
			border-bottom: 2px solid ${colors.secondary};
			padding-bottom: 3mm;
		}
		
		p {
			margin-bottom: 5mm;
			text-align: justify;
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
		
		@media print {
			.page {
				margin: 0;
				page-break-after: always;
			}
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
			font-family: 'Noto Serif', serif;
			font-size: 32pt;
			font-weight: 700;
			color: ${colors.primary};
			margin-bottom: 10mm;
		}
		
		.divider-content {
			font-size: 14pt;
			color: ${mutedColor};
			max-width: 80%;
			font-style: italic;
		}

		/* Chronicle Styles */
		.chronicle-chapter p {
			white-space: pre-wrap; /* Preserve line breaks in raw entries */
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
				`;
			}

			// ✅ 3. Standard Story Chapter
			return `
			<div class="page">
				<h2>Глава ${index + 1}: ${escapeHtml(chapter.title || '')}</h2>
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

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Edge function requires multiple branches for auth, validation and rendering
Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

		// Auth check
		const authHeader = req.headers.get('Authorization');
		if (!authHeader) {
			return new Response(
				JSON.stringify({ success: false, error: 'Missing authorization header' }),
				{ status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		const token = authHeader.replace('Bearer ', '');
		const {
			data: { user },
			error: authError,
		} = await supabaseAdmin.auth.getUser(token);

		if (authError || !user) {
			return new Response(JSON.stringify({ success: false, error: 'Invalid access token' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const body = await req.json();
		const { bookId } = body;

		if (!bookId) {
			return new Response(JSON.stringify({ success: false, error: 'bookId is required' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Load book from database
		const { data: book, error: bookError } = await supabaseAdmin
			.from('books_archive')
			.select('*')
			.eq('id', bookId)
			.eq('user_id', user.id)
			.single();

		if (bookError || !book) {
			console.error('[PUPPETEER] Book not found:', { bookId, userId: user.id, bookError });
			return new Response(
				JSON.stringify({
					success: false,
					error: `Книга не найдена: ${bookError?.message || 'Неизвестная ошибка'}`,
				}),
				{
					status: 404,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		const story = book.story_json;
		const metadata = book.metadata || {};
		const style = book.style || 'warm_family';
		const theme = book.theme || 'light';
		const language = book.language || metadata.language || book?.metadata?.language || 'ru';

		// ✅ Получаем код языка для правильного отображения
		const langCode = getLanguageCode(language);

		// Generate HTML
		const html = generateBookHTML(story, metadata, style, theme, language);

		// Launch Puppeteer
		console.log('[PUPPETEER] Launching browser...');
		const browser = await puppeteer.launch({
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-dev-shm-usage',
				'--disable-gpu',
				'--disable-software-rasterizer',
			],
			// ✅ FIX: Отключаем использование файловой системы для кэширования
			// Это предотвращает использование lstatSync, который заблокирован в Deno Deploy
			headless: true,
			ignoreHTTPSErrors: true,
		});

		const page = await browser.newPage();

		// ✅ Устанавливаем правильную кодировку и язык для страницы
		await page.setContent(html, {
			waitUntil: 'networkidle0',
		});

		// ✅ Устанавливаем язык страницы для правильного отображения текста
		await page.evaluate((lang) => {
			document.documentElement.lang = lang;
		}, langCode);

		// ✅ Wait for fonts to load (Google Fonts can be slow)
		console.log('[PUPPETEER] Waiting for fonts to load...');
		await page.evaluateHandle('document.fonts.ready');
		await new Promise((resolve) => setTimeout(resolve, 2000)); // Увеличено до 2s для надежности

		// Generate PDF
		console.log('[PUPPETEER] Generating PDF...');
		const pdfBuffer = await page.pdf({
			format: 'A4',
			printBackground: true,
			preferCSSPageSize: true, // ✅ Use CSS page size from @page rules
			margin: {
				top: '0mm',
				right: '0mm',
				bottom: '0mm',
				left: '0mm',
			},
			waitForFonts: true, // ✅ Ждем загрузки всех шрифтов для правильного отображения текста
			tagged: true, // ✅ Создаем доступный PDF с тегами
		});

		await browser.close();
		console.log('[PUPPETEER] PDF generated, size:', pdfBuffer.length, 'bytes');

		// Upload to Supabase Storage
		const fileName = `${user.id}/${bookId}.pdf`;
		const { error: uploadError } = await supabaseAdmin.storage
			.from('books')
			.upload(fileName, pdfBuffer, {
				contentType: 'application/pdf',
				upsert: true,
			});

		if (uploadError) {
			console.error('[PUPPETEER] Upload error:', uploadError);
			return new Response(
				JSON.stringify({
					success: false,
					error: `Ошибка загрузки PDF в Storage: ${uploadError.message || 'Неизвестная ошибка'}`,
				}),
				{
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				}
			);
		}

		// Get public URL
		const { data: urlData } = supabaseAdmin.storage.from('books').getPublicUrl(fileName);
		const pdfUrl = urlData.publicUrl;

		// Update book with PDF URL and mark as final (also set is_draft to false)
		await supabaseAdmin
			.from('books_archive')
			.update({
				pdf_url: pdfUrl,
				is_final: true,
				is_draft: false, // ✅ Mark as not draft when final PDF is generated
			})
			.eq('id', bookId);

		console.log('[PUPPETEER] PDF saved:', pdfUrl);

		return new Response(
			JSON.stringify({
				success: true,
				pdfUrl,
				size: pdfBuffer.length,
			}),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	} catch (error: unknown) {
		console.error('[PUPPETEER] Error:', error);
		const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
		const errorStack = error instanceof Error ? error.stack : undefined;
		console.error('[PUPPETEER] Error details:', { errorMessage, errorStack });

		return new Response(
			JSON.stringify({
				success: false,
				error: `Ошибка создания PDF: ${errorMessage}`,
			}),
			{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	}
});
