// 🚀 MEDIA MICROSERVICE v7 - FIXED SIGNED URL
// Purpose: Handle media file uploads with thumbnail generation and metadata extraction
// Architecture: Pure Deno.serve() + Supabase Storage + PostgreSQL
// Features: Thumbnail support, image dimensions, video metadata, full signed URLs
// Status: PRODUCTION - Fixed signed URL to return full URL instead of relative path
// Date: 2025-10-16

console.log('[MEDIA v7] 🚀 Starting microservice (Pure Deno + Storage + DB + Thumbnails)...');

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

console.log('[MEDIA v7] ✅ Environment ready');

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
// HELPER FUNCTIONS
// ======================

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// ======================
// MAIN REQUEST HANDLER
// ======================

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const method = req.method;

  console.log(`[MEDIA v6] ${method} ${url.pathname}`);
  console.log(`[MEDIA v6] Full URL: ${req.url}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    console.log('[MEDIA v6] ✅ OPTIONS handled');
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  try {
    // Route: GET /media/health (Supabase does NOT strip function name from path)
    if (method === 'GET' && (url.pathname === '/media/health' || url.pathname === '/health')) {
      console.log('[MEDIA v6] ✅ Health check called');
      return new Response(
        JSON.stringify({
          success: true,
          version: 'v6-debug-routing',
          message: 'Media microservice is running (Pure Deno + Storage + DB + Thumbnails)',
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    // Route: POST /media/upload (Supabase does NOT strip function name from path)
    if (method === 'POST' && (url.pathname === '/media/upload' || url.pathname === '/upload')) {
      const body = await req.json();
      const { file, fileName, mimeType, userId, entryId, thumbnail, width, height, duration } = body;

      if (!file || !fileName || !userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'file, fileName, and userId are required' }),
          {
            status: 400,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          }
        );
      }

      console.log(`[MEDIA v6] 📤 Uploading media for user ${userId}: ${fileName}`);

      const { supabaseUrl, supabaseServiceKey } = getEnvVars();

      // Убираем префикс data:image/...;base64, если есть
      const base64Data = file.includes(',') ? file.split(',')[1] : file;
      console.log(`[MEDIA v7] 📊 Base64 data length: ${base64Data.length} chars`);

      // Конвертируем base64 в Uint8Array
      const fileBuffer = base64ToUint8Array(base64Data);
      const fileSize = fileBuffer.length;
      console.log(`[MEDIA v7] 📦 File buffer size: ${fileSize} bytes`);

      // Генерируем уникальное имя файла
      const timestamp = Date.now();
      const uniqueFileName = `${userId}/${timestamp}_${fileName}`;
      console.log(`[MEDIA v7] 📝 Storage path: ${uniqueFileName}`);

      // ШАГ 1: Загружаем файл в Supabase Storage через REST API
      console.log(`[MEDIA v7] ⬆️ Step 1: Uploading main file to Storage...`);
      const uploadResponse = await fetch(
        `${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET_NAME}/${uniqueFileName}`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': mimeType || 'application/octet-stream',
            'x-upsert': 'false'
          },
          body: fileBuffer
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error(`[MEDIA v7] ❌ Storage upload failed: ${uploadResponse.status}`, errorText);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to upload to Storage: ${uploadResponse.status} ${errorText}`
          }),
          {
            status: 500,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          }
        );
      }

      console.log(`[MEDIA v7] ✅ Step 1 complete: Main file uploaded to Storage`);

      // ШАГ 1.5: Загружаем thumbnail (если есть)
      let thumbnailPath = '';
      if (thumbnail) {
        console.log(`[MEDIA v7] 🖼️ Step 1.5: Uploading thumbnail...`);
        const thumbnailBase64 = thumbnail.includes(',') ? thumbnail.split(',')[1] : thumbnail;
        const thumbnailBuffer = base64ToUint8Array(thumbnailBase64);
        const thumbnailFileName = `${userId}/thumbnails/${timestamp}_thumb_${fileName}`;

        const thumbnailUploadResponse = await fetch(
          `${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET_NAME}/${thumbnailFileName}`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'image/jpeg',
              'x-upsert': 'false'
            },
            body: thumbnailBuffer
          }
        );

        if (thumbnailUploadResponse.ok) {
          thumbnailPath = thumbnailFileName;
          console.log(`[MEDIA v7] ✅ Step 1.5 complete: Thumbnail uploaded (${thumbnailBuffer.length} bytes)`);
        } else {
          console.warn(`[MEDIA v7] ⚠️ Step 1.5 warning: Thumbnail upload failed, continuing...`);
        }
      }

      // ШАГ 2: Создаем signed URL (действителен 1 год = 31536000 секунд)
      console.log(`[MEDIA v7] 🔗 Step 2: Creating signed URL...`);
      const signedUrlResponse = await fetch(
        `${supabaseUrl}/storage/v1/object/sign/${MEDIA_BUCKET_NAME}/${uniqueFileName}`,
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

      let signedUrl = '';
      if (signedUrlResponse.ok) {
        const signedUrlData = await signedUrlResponse.json();
        console.log(`[MEDIA v7] 📋 Signed URL response:`, signedUrlData);

        // Try different possible field names for the signed URL
        const relativePath = signedUrlData.signedURL || signedUrlData.signed_url || signedUrlData.url || '';

        // Convert relative path to full URL
        if (relativePath) {
          // If it's already a full URL, use it as-is
          if (relativePath.startsWith('http')) {
            signedUrl = relativePath;
          } else {
            // Otherwise, prepend the Supabase URL
            signedUrl = `${supabaseUrl}/storage/v1${relativePath}`;
          }
        }

        console.log(`[MEDIA v7] ✅ Step 2 complete: Signed URL created`);
        console.log(`[MEDIA v7] 🔗 Full URL: ${signedUrl}`);
      } else {
        const errorText = await signedUrlResponse.text();
        console.warn(`[MEDIA v7] ⚠️ Step 2 warning: Signed URL creation failed (${signedUrlResponse.status}):`, errorText);
        // Fallback: Create a public URL directly
        signedUrl = `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET_NAME}/${uniqueFileName}`;
        console.log(`[MEDIA v7] 🔗 Using fallback public URL: ${signedUrl}`);
      }

      // ШАГ 3: Сохраняем метаданные в PostgreSQL
      console.log(`[MEDIA v7] 💾 Step 3: Saving metadata to database...`);
      const insertResponse = await fetch(
        `${supabaseUrl}/rest/v1/media_files`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            user_id: userId,
            entry_id: entryId || null,
            storage_path: uniqueFileName,
            thumbnail_path: thumbnailPath || null,
            width: width || null,
            height: height || null,
            duration: duration || null,
            file_name: fileName,
            mime_type: mimeType || 'application/octet-stream',
            file_size: fileSize
          })
        }
      );

      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        console.error(`[MEDIA v7] ⚠️ Database insert failed: ${insertResponse.status}`, errorText);
        // Продолжаем даже если БД запись не создалась (файл уже в Storage)
      } else {
        const dbRecord = await insertResponse.json();
        console.log(`[MEDIA v7] ✅ Step 3 complete: Metadata saved (ID: ${dbRecord[0]?.id})`);
      }

      console.log(`[MEDIA v7] 🎉 Upload complete: ${uniqueFileName}`);

      return new Response(
        JSON.stringify({
          success: true,
          path: uniqueFileName,
          thumbnailPath: thumbnailPath,
          url: signedUrl,
          mimeType: mimeType || 'application/octet-stream',
          width: width || null,
          height: height || null,
          duration: duration || null
        }),
        {
          status: 200,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    // Route: POST /media/signed-url
    if (method === 'POST' && url.pathname === '/media/signed-url') {
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

      console.log(`[MEDIA v7] Creating signed URL for: ${path}`);

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
        console.error('[MEDIA v7] Signed URL error:', errorText);
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

      console.log('[MEDIA v7] ✅ Signed URL created');

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

    // Route: DELETE /media/:path
    if (method === 'DELETE' && url.pathname.startsWith('/media/')) {
      const path = decodeURIComponent(url.pathname.substring(7)); // Remove '/media/'

      if (!path) {
        return new Response(
          JSON.stringify({ success: false, error: 'path is required' }),
          {
            status: 400,
            headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
          }
        );
      }

      console.log(`[MEDIA v7] Deleting media: ${path}`);

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
        console.error('[MEDIA v7] Delete error:', errorText);
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

      console.log('[MEDIA v7] ✅ Media deleted');

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
    console.error('[MEDIA v7] ❌ Error:', error.message);
    console.error('[MEDIA v7] ❌ Stack:', error.stack);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }
}

// ======================
// START SERVER
// ======================

console.log('[MEDIA v7] ✅ Microservice configured (Pure Deno + Storage + DB)');
console.log('[MEDIA v7] ✅ Starting Deno server...');

Deno.serve(handleRequest);

console.log('[MEDIA v7] ✅ Server started successfully!');

