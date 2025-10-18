import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================
// CREATE ENTRY
// ============================================
app.post('/entries', async (c) => {
  try {
    const entryData = await c.req.json();
    console.log('[ENTRIES] Creating entry:', entryData);

    if (!entryData.userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    if (!entryData.text || !entryData.text.trim()) {
      return c.json({ success: false, error: 'text is required' }, 400);
    }

    // Insert entry into database
    const { data, error } = await supabase
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
      console.error('[ENTRIES] Error creating entry in Supabase:', error);
      return c.json({ success: false, error: error.message }, 500);
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
      createdAt: data.created_at
    };

    console.log('[ENTRIES] Entry created successfully:', entry.id);
    return c.json({ success: true, entry });
  } catch (error) {
    console.error('[ENTRIES] Error creating entry:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// GET USER ENTRIES
// ============================================
app.get('/entries/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    console.log('[ENTRIES] Fetching entries for user:', userId);

    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ENTRIES] Error fetching entries:', error);
      return c.json({ success: false, error: error.message }, 500);
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
      createdAt: entry.created_at
    }));

    console.log(`[ENTRIES] Found ${entries.length} entries for user ${userId}`);
    return c.json({ success: true, entries });
  } catch (error) {
    console.error('[ENTRIES] Error fetching entries:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// UPDATE ENTRY
// ============================================
app.put('/entries/:entryId', async (c) => {
  try {
    const entryId = c.req.param('entryId');
    const updates = await c.req.json();
    console.log('[ENTRIES] Updating entry:', entryId, updates);

    const updateData: any = {};
    
    if (updates.text !== undefined) updateData.text = updates.text;
    if (updates.sentiment !== undefined) updateData.sentiment = updates.sentiment;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.mood !== undefined) updateData.mood = updates.mood;

    const { data, error } = await supabase
      .from('entries')
      .update(updateData)
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      console.error('[ENTRIES] Error updating entry:', error);
      return c.json({ success: false, error: error.message }, 500);
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
      createdAt: data.created_at
    };

    console.log('[ENTRIES] Entry updated successfully:', entry.id);
    return c.json({ success: true, entry });
  } catch (error) {
    console.error('[ENTRIES] Error updating entry:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// DELETE ENTRY
// ============================================
app.delete('/entries/:entryId', async (c) => {
  try {
    const entryId = c.req.param('entryId');
    console.log('[ENTRIES] Deleting entry:', entryId);

    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('[ENTRIES] Error deleting entry:', error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log('[ENTRIES] Entry deleted successfully:', entryId);
    return c.json({ success: true });
  } catch (error) {
    console.error('[ENTRIES] Error deleting entry:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/entries/health', (c) => {
  return c.json({ status: 'ok', service: 'entries' });
});

Deno.serve(app.fetch);

