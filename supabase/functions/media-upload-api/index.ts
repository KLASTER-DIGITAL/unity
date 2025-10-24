// 🚀 MEDIA UPLOAD MICROSERVICE v1
// Purpose: Handle media file uploads with thumbnail generation and metadata extraction
// Split from: media (445 lines) → media-upload-api (250 lines)
// Endpoints: POST /upload, GET /health
// Date: 2025-10-24

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

console.log('[MEDIA-UPLOAD v1] 🚀 Starting microservice...');

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

console.log('[MEDIA-UPLOAD v1] ✅ Environment ready');

// ======================
// CORS HELPER
// ======================

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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

Deno.serve(async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const method = req.method;

  console.log(`[MEDIA-UPLOAD v1] ${method} ${url.pathname}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    console.log('[MEDIA-UPLOAD v1] ✅ OPTIONS handled');
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  try {
    // Route: GET /health
    if (method === 'GET' && url.pathname.includes('/health')) {
      console.log('[MEDIA-UPLOAD v1] ✅ Health check called');
      return new Response(
        JSON.stringify({
          success: true,
          version: 'v1',
          service: 'media-upload-api',
          message: 'Media upload microservice is running',
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    // Route: POST /upload
    if (method === 'POST' && url.pathname.includes('/upload')) {
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

      console.log(`[MEDIA-UPLOAD v1] 📤 Uploading media for user ${userId}: ${fileName}`);

      const { supabaseUrl, supabaseServiceKey } = getEnvVars();

      // Убираем префикс data:image/...;base64, если есть
      const base64Data = file.includes(',') ? file.split(',')[1] : file;
      console.log(`[MEDIA-UPLOAD v1] 📊 Base64 data length: ${base64Data.length} chars`);

      // Конвертируем base64 в Uint8Array
      const fileBuffer = base64ToUint8Array(base64Data);
      const fileSize = fileBuffer.length;
      console.log(`[MEDIA-UPLOAD v1] 📦 File buffer size: ${fileSize} bytes`);

      // Генерируем уникальное имя файла
      const timestamp = Date.now();
      const uniqueFileName = `${userId}/${timestamp}_${fileName}`;
      console.log(`[MEDIA-UPLOAD v1] 📝 Storage path: ${uniqueFileName}`);

      // ШАГ 1: Загружаем файл в Supabase Storage через REST API
      console.log(`[MEDIA-UPLOAD v1] ⬆️ Step 1: Uploading main file to Storage...`);
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
        console.error(`[MEDIA-UPLOAD v1] ❌ Storage upload failed: ${uploadResponse.status}`, errorText);
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

      console.log(`[MEDIA-UPLOAD v1] ✅ Step 1 complete: Main file uploaded to Storage`);

      // ШАГ 1.5: Загружаем thumbnail (если есть)
      let thumbnailPath = '';
      if (thumbnail) {
        console.log(`[MEDIA-UPLOAD v1] 🖼️ Step 1.5: Uploading thumbnail...`);
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
          console.log(`[MEDIA-UPLOAD v1] ✅ Step 1.5 complete: Thumbnail uploaded (${thumbnailBuffer.length} bytes)`);
        } else {
          console.warn(`[MEDIA-UPLOAD v1] ⚠️ Step 1.5 warning: Thumbnail upload failed, continuing...`);
        }
      }

      // ШАГ 2: Создаем signed URL (действителен 1 год = 31536000 секунд)
      console.log(`[MEDIA-UPLOAD v1] 🔗 Step 2: Creating signed URL...`);
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
        const relativePath = signedUrlData.signedURL || signedUrlData.signed_url || signedUrlData.url || '';

        if (relativePath) {
          if (relativePath.startsWith('http')) {
            signedUrl = relativePath;
          } else {
            signedUrl = `${supabaseUrl}/storage/v1${relativePath}`;
          }
        }

        console.log(`[MEDIA-UPLOAD v1] ✅ Step 2 complete: Signed URL created`);
      } else {
        const errorText = await signedUrlResponse.text();
        console.warn(`[MEDIA-UPLOAD v1] ⚠️ Step 2 warning: Signed URL creation failed (${signedUrlResponse.status}):`, errorText);
        signedUrl = `${supabaseUrl}/storage/v1/object/public/${MEDIA_BUCKET_NAME}/${uniqueFileName}`;
        console.log(`[MEDIA-UPLOAD v1] 🔗 Using fallback public URL: ${signedUrl}`);
      }

      // ШАГ 3: Сохраняем метаданные в PostgreSQL
      console.log(`[MEDIA-UPLOAD v1] 💾 Step 3: Saving metadata to database...`);
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
        console.error(`[MEDIA-UPLOAD v1] ⚠️ Database insert failed: ${insertResponse.status}`, errorText);
      } else {
        const dbRecord = await insertResponse.json();
        console.log(`[MEDIA-UPLOAD v1] ✅ Step 3 complete: Metadata saved (ID: ${dbRecord[0]?.id})`);
      }

      console.log(`[MEDIA-UPLOAD v1] 🎉 Upload complete: ${uniqueFileName}`);

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

    // 404 Not Found
    return new Response(
      JSON.stringify({ success: false, error: 'Not Found' }),
      {
        status: 404,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('[MEDIA-UPLOAD v1] ❌ Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }
});

console.log('[MEDIA-UPLOAD v1] ✅ Server started successfully!');

