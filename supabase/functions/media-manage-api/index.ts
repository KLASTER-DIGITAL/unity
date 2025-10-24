// 🚀 MEDIA MANAGE MICROSERVICE v1
// Purpose: Handle media file management (signed URLs, deletion)
// Split from: media (445 lines) → media-manage-api (195 lines)
// Endpoints: POST /signed-url, DELETE /:path, GET /health
// Date: 2025-10-24

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

console.log('[MEDIA-MANAGE v1] 🚀 Starting microservice...');

// ======================
// CONSTANTS
// ======================

const MEDIA_BUCKET_NAME = 'media';

// ======================
// ENVIRONMENT VARIABLES
// ======================

function getEnvVars() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return { supabaseUrl, supabaseServiceKey };
}

console.log('[MEDIA-MANAGE v1] ✅ Environment ready');

// ======================
// CORS HELPER
// ======================

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// ======================
// MAIN REQUEST HANDLER
// ======================

Deno.serve(async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const method = req.method;

  console.log(`[MEDIA-MANAGE v1] ${method} ${url.pathname}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    console.log('[MEDIA-MANAGE v1] ✅ OPTIONS handled');
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  try {
    // Route: GET /health
    if (method === 'GET' && url.pathname.includes('/health')) {
      console.log('[MEDIA-MANAGE v1] ✅ Health check called');
      return new Response(
        JSON.stringify({
          success: true,
          version: 'v1',
          service: 'media-manage-api',
          message: 'Media management microservice is running',
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    // Route: POST /signed-url
    if (method === 'POST' && url.pathname.includes('/signed-url')) {
      const body = await req.json();
      const { path } = body;

      if (!path) {
        return new Response(
          JSON.stringify({ success: false, error: 'path is required' }),
          {
            status: 400,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          }
        );
      }

      console.log(`[MEDIA-MANAGE v1] Creating signed URL for: ${path}`);

      const { supabaseUrl, supabaseServiceKey } = getEnvVars();

      // Создаем signed URL (действителен 1 год)
      const signedUrlResponse = await fetch(
        `${supabaseUrl}/storage/v1/object/sign/${MEDIA_BUCKET_NAME}/${path}`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ expiresIn: 31536000 })
        }
      );

      if (!signedUrlResponse.ok) {
        const errorText = await signedUrlResponse.text();
        console.error('[MEDIA-MANAGE v1] Signed URL error:', errorText);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to create signed URL: ${signedUrlResponse.status}` 
          }),
          {
            status: 500,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          }
        );
      }

      const signedUrlData = await signedUrlResponse.json();

      console.log('[MEDIA-MANAGE v1] ✅ Signed URL created');

      return new Response(
        JSON.stringify({
          success: true,
          url: signedUrlData.signedURL
        }),
        {
          status: 200,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    // Route: DELETE /:path
    if (method === 'DELETE') {
      // Extract path from URL (remove function name prefix)
      const pathParts = url.pathname.split('/').filter(p => p);
      const relevantParts = pathParts.filter(p => !['functions', 'v1', 'media-manage-api'].includes(p));
      const path = decodeURIComponent(relevantParts.join('/'));

      if (!path) {
        return new Response(
          JSON.stringify({ success: false, error: 'path is required' }),
          {
            status: 400,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          }
        );
      }

      console.log(`[MEDIA-MANAGE v1] Deleting media: ${path}`);

      const { supabaseUrl, supabaseServiceKey } = getEnvVars();

      // Удаляем файл из Supabase Storage
      const deleteResponse = await fetch(
        `${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET_NAME}/${path}`,
        {
          method: 'DELETE',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`
          }
        }
      );

      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.error('[MEDIA-MANAGE v1] Delete error:', errorText);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Failed to delete: ${deleteResponse.status}` 
          }),
          {
            status: 500,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          }
        );
      }

      console.log('[MEDIA-MANAGE v1] ✅ Media deleted');

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    // 404 Not Found
    return new Response(
      JSON.stringify({ success: false, error: 'Not Found' }),
      {
        status: 404,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('[MEDIA-MANAGE v1] ❌ Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }
});

console.log('[MEDIA-MANAGE v1] ✅ Server started successfully!');

