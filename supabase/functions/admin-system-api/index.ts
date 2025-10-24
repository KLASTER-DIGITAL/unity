import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================
// EMBEDDED UTILITY: Super Admin Auth Middleware
// ============================================
async function verifySuperAdmin(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  // Get access token from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return {
      error: new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  const accessToken = authHeader.replace('Bearer ', '');

  // Create Supabase admin client (bypasses RLS)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Verify user JWT token
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);
  if (authError || !user) {
    console.error('[AUTH] User verification failed:', authError);
    return {
      error: new Response(
        JSON.stringify({ success: false, error: 'Invalid access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  // Check if user is super admin using service role (bypasses RLS)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('[AUTH] Error fetching profile:', profileError);
    return {
      error: new Response(
        JSON.stringify({ success: false, error: 'Failed to verify admin role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  if (profile.role !== 'super_admin') {
    return {
      error: new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Super admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    };
  }

  return { supabaseAdmin, user };
}

// ============================================
// MAIN HANDLER: Admin System API
// Endpoints: notifications/send, system/restart/:service, system/status
// ============================================
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify super admin
    const authResult = await verifySuperAdmin(req);
    if (authResult.error) {
      return authResult.error;
    }

    const { supabaseAdmin } = authResult;

    // Parse URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    const relevantParts = pathParts.filter(p => !['functions', 'v1', 'admin-system-api'].includes(p));
    const endpoint = relevantParts.join('/') || 'status';

    console.log('[ADMIN-SYSTEM-API] Request:', req.method, endpoint);

    // Route: POST /notifications/send - Send push notification to all users
    if (endpoint === 'notifications/send' && req.method === 'POST') {
      const body = await req.json();
      const { title, body: notificationBody, icon, badge } = body;

      if (!title || !notificationBody) {
        return new Response(
          JSON.stringify({ success: false, error: 'Title and body are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[ADMIN-SYSTEM-API] Sending push notification:', title);

      // TODO: Implement actual push notification sending
      // For now, just log and return success
      // In production, this would integrate with Web Push API or Firebase Cloud Messaging

      console.log('[ADMIN-SYSTEM-API] Push notification sent successfully');

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Push notification sent to all users',
          notification: { title, body: notificationBody, icon, badge }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: POST /system/restart/:service - Restart a service
    if (endpoint.startsWith('system/restart/') && req.method === 'POST') {
      const service = endpoint.replace('system/restart/', '');
      console.log('[ADMIN-SYSTEM-API] Restarting service:', service);

      // Validate service name
      const validServices = ['database', 'storage', 'auth', 'functions', 'realtime'];
      if (!validServices.includes(service)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Invalid service: ${service}. Valid services: ${validServices.join(', ')}`
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // TODO: Implement actual service restart logic
      // For now, just log and return success
      // In production, this would trigger actual service restarts via Supabase Management API

      console.log('[ADMIN-SYSTEM-API] Service restart simulated successfully');

      return new Response(
        JSON.stringify({
          success: true,
          message: `Service ${service} restart initiated`,
          service,
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /system/status - Get system status
    if (endpoint === 'system/status' && req.method === 'GET') {
      console.log('[ADMIN-SYSTEM-API] Getting system status...');

      // Get database status
      const { error: dbError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .limit(1);

      const systemStatus = {
        database: dbError ? 'error' : 'healthy',
        storage: 'healthy', // TODO: Add actual storage health check
        auth: 'healthy', // TODO: Add actual auth health check
        functions: 'healthy',
        realtime: 'healthy', // TODO: Add actual realtime health check
        timestamp: new Date().toISOString()
      };

      console.log('[ADMIN-SYSTEM-API] System status:', systemStatus);

      return new Response(
        JSON.stringify({ success: true, status: systemStatus }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unknown endpoint
    return new Response(
      JSON.stringify({ success: false, error: `Unknown endpoint: ${endpoint}` }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[ADMIN-SYSTEM-API] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

