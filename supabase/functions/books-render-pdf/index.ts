/**
 * Books Render PDF API
 *
 * Prepares book data for PDF rendering and uploads to Supabase Storage.
 * Note: Actual PDF generation happens on client-side using @react-pdf/renderer
 * This function handles data preparation and storage upload.
 *
 * Endpoint:
 * - POST /books-render-pdf/:draftId - Prepare book for PDF rendering
 * - PUT /books-render-pdf/:draftId/upload - Upload generated PDF
 *
 * @author UNITY Team
 * @date 2025-11-07
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
	// Handle CORS preflight
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
		const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

		// Verify authentication
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

		// Parse URL path
		const url = new URL(req.url);
		const pathParts = url.pathname.split('/').filter((p) => p);
		const relevantParts = pathParts.filter(
			(p) => !['functions', 'v1', 'books-render-pdf'].includes(p)
		);
		const draftId = relevantParts[0];
		const action = relevantParts[1]; // 'upload' or undefined

		if (!draftId) {
			return new Response(JSON.stringify({ success: false, error: 'Draft ID required' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			});
		}

		// Handle PDF upload
		if (action === 'upload' && req.method === 'PUT') {
			const body = await req.json();
			const { pdfBlob, pages, wordCount } = body;

			if (!pdfBlob) {
				return new Response(JSON.stringify({ success: false, error: 'PDF blob required' }), {
					status: 400,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// Get draft
			const { data: draft, error: draftError } = await supabaseAdmin
				.from('books_archive')
				.select('*')
				.eq('id', draftId)
				.eq('user_id', user.id)
				.single();

			if (draftError || !draft) {
				return new Response(JSON.stringify({ success: false, error: 'Draft not found' }), {
					status: 404,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// Convert base64 to Uint8Array for storage upload
			// pdfBlob is base64 string from client
			const base64Data = pdfBlob.replace(/^data:application\/pdf;base64,/, '');
			const binaryString = atob(base64Data);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			// Upload PDF to Supabase Storage
			const fileName = `${user.id}/${draftId}.pdf`;
			const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
				.from('books')
				.upload(fileName, bytes, {
					contentType: 'application/pdf',
					upsert: true,
				});

			if (uploadError) {
				console.error('[BOOKS-RENDER] Upload error:', uploadError);
				return new Response(JSON.stringify({ success: false, error: 'Failed to upload PDF' }), {
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// Get public URL
			const { data: urlData } = supabaseAdmin.storage.from('books').getPublicUrl(fileName);
			const pdfUrl = urlData.publicUrl;

			// Update draft with PDF URL and mark as final (also set is_draft to false)
			const { error: updateError } = await supabaseAdmin
				.from('books_archive')
				.update({
					pdf_url: pdfUrl,
					is_final: true,
					is_draft: false, // ✅ FIX: Mark as not draft when final PDF is generated
					metadata: {
						...draft.metadata,
						pages,
						wordCount,
						generatedAt: new Date().toISOString(),
					},
				})
				.eq('id', draftId);

			if (updateError) {
				console.error('[BOOKS-RENDER] Update error:', updateError);
				return new Response(JSON.stringify({ success: false, error: 'Failed to update draft' }), {
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			console.log('[BOOKS-RENDER] PDF uploaded:', pdfUrl);

			return new Response(
				JSON.stringify({
					success: true,
					pdfUrl,
					pages,
					wordCount,
				}),
				{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Handle prepare for rendering (POST)
		if (req.method === 'POST') {
			// Get draft
			const { data: draft, error: draftError } = await supabaseAdmin
				.from('books_archive')
				.select('*')
				.eq('id', draftId)
				.eq('user_id', user.id)
				.single();

			if (draftError || !draft) {
				return new Response(JSON.stringify({ success: false, error: 'Draft not found' }), {
					status: 404,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// Fetch entries with media for the period
			const { data: entries, error: entriesError } = await supabaseAdmin
				.from('entries')
				.select('id, text, media, created_at, category')
				.eq('user_id', user.id)
				.gte('created_at', draft.period_start)
				.lte('created_at', draft.period_end)
				.order('created_at', { ascending: true });

			if (entriesError) {
				console.error('[BOOKS-RENDER] Error fetching entries:', entriesError);
				return new Response(JSON.stringify({ success: false, error: 'Failed to fetch entries' }), {
					status: 500,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				});
			}

			// Extract media URLs from entries
			const mediaUrls: string[] = [];
			entries?.forEach((entry) => {
				if (entry.media && Array.isArray(entry.media)) {
					entry.media.forEach((m: any) => {
						if (m.url) mediaUrls.push(m.url);
					});
				}
			});

			// Prepare render data
			const renderData = {
				draft: {
					id: draft.id,
					periodStart: draft.period_start,
					periodEnd: draft.period_end,
					style: draft.style,
					layout: draft.layout,
					theme: draft.theme,
					storyJson: draft.story_json,
					metadata: draft.metadata,
				},
				media: mediaUrls,
				entriesCount: entries?.length || 0,
			};

			console.log('[BOOKS-RENDER] Prepared render data for draft:', draftId);

			return new Response(
				JSON.stringify({
					success: true,
					renderData,
				}),
				{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		return new Response(JSON.stringify({ success: false, error: 'Invalid request method' }), {
			status: 400,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	} catch (error) {
		console.error('[BOOKS-RENDER] Error:', error);
		return new Response(JSON.stringify({ success: false, error: error.message }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		});
	}
});
