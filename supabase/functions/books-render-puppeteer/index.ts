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

function generateBookHTML(story: any, metadata: any, style: string, theme: string): string {
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

	return `
<!DOCTYPE html>
<html lang="ru">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${story.title || 'Моя книга'}</title>
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&family=Noto+Serif:wght@400;600&display=swap');
		
		* {
			margin: 0;
			padding: 0;
			box-sizing: border-box;
		}
		
		body {
			font-family: 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
			background: ${bgColor};
			color: ${textColor};
			line-height: 1.8;
			font-size: 11pt;
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
	</style>
</head>
<body>
	<!-- Title Page -->
	<div class="page title-page">
		<div class="book-emoji">${metadata.diaryEmoji || '📖'}</div>
		<h1>${story.title || 'Моя книга'}</h1>
		<div class="subtitle">${story.subtitle || ''}</div>
		${story.dedication ? `<div class="dedication">${story.dedication}</div>` : ''}
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
				.map((p: string) => `<p>${p}</p>`)
				.join('')}
		</div>
	</div>
	`
			: ''
	}
	
	<!-- Chapters -->
	${(story.chapters || [])
		.map(
			(chapter: any, index: number) => `
	<div class="page">
		<h2>Глава ${index + 1}: ${chapter.title}</h2>
		${chapter.content
			.split('\n')
			.map((p: string) => `<p>${p}</p>`)
			.join('')}
		
		${
			chapter.highlights && chapter.highlights.length > 0
				? `
		<div class="highlights">
			<strong>Ключевые моменты:</strong>
			<ul>
				${chapter.highlights.map((h: string) => `<li>${h}</li>`).join('')}
			</ul>
		</div>
		`
				: ''
		}
	</div>
	`
		)
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
				.map((p: string) => `<p>${p}</p>`)
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
			return new Response(JSON.stringify({ success: false, error: 'Book not found' }), {
				status: 404,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		const story = book.story_json;
		const metadata = book.metadata || {};
		const style = book.style || 'warm_family';
		const theme = book.theme || 'light';

		// Generate HTML
		const html = generateBookHTML(story, metadata, style, theme);

		// Launch Puppeteer
		console.log('[PUPPETEER] Launching browser...');
		const browser = await puppeteer.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});

		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: 'networkidle0' });

		// Generate PDF
		console.log('[PUPPETEER] Generating PDF...');
		const pdfBuffer = await page.pdf({
			format: 'A4',
			printBackground: true,
			margin: {
				top: '0mm',
				right: '0mm',
				bottom: '0mm',
				left: '0mm',
			},
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
			return new Response(JSON.stringify({ success: false, error: 'Failed to upload PDF' }), {
				status: 500,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Get public URL
		const { data: urlData } = supabaseAdmin.storage.from('books').getPublicUrl(fileName);
		const pdfUrl = urlData.publicUrl;

		// Update book with PDF URL
		await supabaseAdmin
			.from('books_archive')
			.update({ pdf_url: pdfUrl, is_final: true })
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
	} catch (error: any) {
		console.error('[PUPPETEER] Error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: error?.message || 'Unknown error',
			}),
			{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	}
});
