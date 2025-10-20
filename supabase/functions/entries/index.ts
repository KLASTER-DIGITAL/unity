import { createClient } from 'jsr:@supabase/supabase-js@2';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user with JWT token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !user) {
      console.error('[ENTRIES] Auth error:', authError);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid access token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[ENTRIES] Authenticated user:', user.id);

    // Parse URL path
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    const relevantParts = pathParts.filter(p => !['functions', 'v1', 'entries'].includes(p));
    const endpoint = relevantParts.join('/');

    console.log('[ENTRIES] Endpoint:', endpoint || 'root', 'Method:', req.method);

    // Route: POST / - Create entry
    if (!endpoint && req.method === 'POST') {
      const entryData = await req.json();
      console.log('[ENTRIES] Creating entry:', entryData);

      if (!entryData.userId) {
        return new Response(
          JSON.stringify({ success: false, error: 'userId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!entryData.text || !entryData.text.trim()) {
        return new Response(
          JSON.stringify({ success: false, error: 'text is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Insert entry into database
      const { data, error } = await supabaseAdmin
        .from('entries')
        .insert({
          user_id: entryData.userId,
          text: entryData.text.trim(),
          sentiment: entryData.sentiment || 'neutral',
          category: entryData.category || 'Другое',
          mood: entryData.mood || 'нормальное',
          is_first_entry: entryData.isFirstEntry || false,
          media: entryData.media || null,
          ai_reply: entryData.aiReply || '',
          ai_summary: entryData.aiSummary || null,
          ai_insight: entryData.aiInsight || null,
          is_achievement: entryData.isAchievement || false,
          tags: entryData.tags || [],
          streak_day: entryData.streakDay || 1,
          focus_area: entryData.focusArea || entryData.category || 'Другое',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('[ENTRIES] Error creating entry:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Convert to camelCase for frontend
      const entry = {
        id: data.id,
        userId: data.user_id,
        text: data.text,
        sentiment: data.sentiment,
        category: data.category,
        mood: data.mood,
        isFirstEntry: data.is_first_entry,
        media: data.media,
        aiReply: data.ai_reply,
        aiSummary: data.ai_summary,
        aiInsight: data.ai_insight,
        isAchievement: data.is_achievement,
        tags: data.tags,
        streakDay: data.streak_day,
        focusArea: data.focus_area,
        createdAt: data.created_at,
        voiceUrl: data.voice_url,
        mediaUrl: data.media_url
      };

      console.log('[ENTRIES] Entry created successfully:', entry.id);
      return new Response(
        JSON.stringify({ success: true, entry }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /:userId - Get user entries
    if (endpoint && req.method === 'GET' && !endpoint.includes('/')) {
      const userId = endpoint;
      console.log('[ENTRIES] Fetching entries for user:', userId);

      const { data, error } = await supabaseAdmin
        .from('entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ENTRIES] Error fetching entries:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Convert to camelCase
      const entries = data.map(entry => ({
        id: entry.id,
        userId: entry.user_id,
        text: entry.text,
        sentiment: entry.sentiment,
        category: entry.category,
        mood: entry.mood,
        isFirstEntry: entry.is_first_entry,
        media: entry.media,
        aiReply: entry.ai_reply,
        aiSummary: entry.ai_summary,
        aiInsight: entry.ai_insight,
        isAchievement: entry.is_achievement,
        tags: entry.tags,
        streakDay: entry.streak_day,
        focusArea: entry.focus_area,
        createdAt: entry.created_at,
        voiceUrl: entry.voice_url,
        mediaUrl: entry.media_url
      }));

      console.log(`[ENTRIES] Found ${entries.length} entries for user ${userId}`);
      return new Response(
        JSON.stringify({ success: true, entries }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: PUT /:entryId - Update entry
    if (endpoint && req.method === 'PUT' && !endpoint.includes('/')) {
      const entryId = endpoint;
      const updates = await req.json();
      console.log('[ENTRIES] Updating entry:', entryId, updates);

      const updateData: any = {};

      if (updates.text !== undefined) updateData.text = updates.text;
      if (updates.sentiment !== undefined) updateData.sentiment = updates.sentiment;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.mood !== undefined) updateData.mood = updates.mood;

      const { data, error } = await supabaseAdmin
        .from('entries')
        .update(updateData)
        .eq('id', entryId)
        .select()
        .single();

      if (error) {
        console.error('[ENTRIES] Error updating entry:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Convert to camelCase
      const entry = {
        id: data.id,
        userId: data.user_id,
        text: data.text,
        sentiment: data.sentiment,
        category: data.category,
        mood: data.mood,
        isFirstEntry: data.is_first_entry,
        media: data.media,
        aiReply: data.ai_reply,
        aiSummary: data.ai_summary,
        aiInsight: data.ai_insight,
        isAchievement: data.is_achievement,
        tags: data.tags,
        streakDay: data.streak_day,
        focusArea: data.focus_area,
        createdAt: data.created_at,
        voiceUrl: data.voice_url,
        mediaUrl: data.media_url
      };

      console.log('[ENTRIES] Entry updated successfully:', entry.id);
      return new Response(
        JSON.stringify({ success: true, entry }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: DELETE /:entryId - Delete entry
    if (endpoint && req.method === 'DELETE' && !endpoint.includes('/')) {
      const entryId = endpoint;
      console.log('[ENTRIES] Deleting entry:', entryId);

      const { error } = await supabaseAdmin
        .from('entries')
        .delete()
        .eq('id', entryId);

      if (error) {
        console.error('[ENTRIES] Error deleting entry:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[ENTRIES] Entry deleted successfully:', entryId);
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Route: GET /health - Health check
    if (endpoint === 'health' && req.method === 'GET') {
      return new Response(
        JSON.stringify({ success: true, status: 'healthy', service: 'entries' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Unknown endpoint
    return new Response(
      JSON.stringify({ success: false, error: 'Unknown endpoint' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[ENTRIES] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

