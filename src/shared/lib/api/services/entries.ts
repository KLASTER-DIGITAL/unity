import { createClient } from '@/utils/supabase/client';
import { getAuthHeaders } from '../core/request';
import { API_URLS } from '../config/urls';
import type { DiaryEntry } from '../types';

/**
 * Entries API request helper
 */
async function entriesApiRequest<T = any>(endpoint: string, options: any = {}): Promise<T> {
  const { method = 'GET', body, headers: customHeaders = {} } = options;

  const headers = {
    ...(await getAuthHeaders()),
    ...customHeaders
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    console.log(`[ENTRIES API] ${method} ${API_URLS.ENTRIES}${endpoint}`, body ? { body } : '');

    const response = await fetch(`${API_URLS.ENTRIES}${endpoint}`, config);
    const responseText = await response.text();
    
    console.log(`[ENTRIES API Response] ${endpoint}:`, responseText);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    if (!responseText || responseText.trim() === '') {
      return {} as T;
    }

    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', responseText);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error(`ENTRIES API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Create a new diary entry
 * TEMPORARY: Uses direct Supabase client until Edge Function routing is fixed
 */
export async function createEntry(entry: Partial<DiaryEntry>): Promise<DiaryEntry> {
  console.log('[ENTRIES] Creating entry via direct Supabase client:', entry);

  const supabase = createClient();

  const { data, error } = await supabase
    .from('entries')
    .insert({
      user_id: entry.userId,
      text: entry.text,
      sentiment: entry.sentiment || 'neutral',
      category: entry.category || 'Другое',
      mood: entry.mood || 'нормальное',
      is_first_entry: (entry as any).isFirstEntry || false,
      media: entry.media || null,
      ai_reply: entry.aiReply || '',
      ai_summary: entry.aiSummary || null,
      ai_insight: entry.aiInsight || null,
      is_achievement: entry.isAchievement || false,
      tags: entry.tags || [],
      streak_day: entry.streakDay || 1,
      focus_area: entry.focusArea || entry.category || 'Другое',
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('[ENTRIES] Failed to create entry:', error);
    throw new Error(error.message || 'Failed to create entry');
  }

  // Convert to camelCase
  const createdEntry: DiaryEntry = {
    id: data.id,
    userId: data.user_id,
    text: data.text,
    sentiment: data.sentiment,
    category: data.category,
    mood: data.mood,
    aiReply: data.ai_reply,
    aiSummary: data.ai_summary,
    aiInsight: data.ai_insight,
    isAchievement: data.is_achievement,
    tags: data.tags,
    streakDay: data.streak_day,
    focusArea: data.focus_area,
    createdAt: data.created_at,
    media: data.media
  };

  console.log('[ENTRIES] Entry created successfully:', createdEntry);
  return createdEntry;
}

/**
 * Get entries for a user
 * TEMPORARY: Uses direct Supabase client until Edge Function routing is fixed
 */
export async function getEntries(userId: string, limit: number = 50): Promise<DiaryEntry[]> {
  console.log('[ENTRIES] Fetching entries for user:', userId);

  const supabase = createClient();

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[ENTRIES] Failed to fetch entries:', error);
    throw new Error(error.message || 'Failed to fetch entries');
  }

  // Convert to camelCase
  const entries: DiaryEntry[] = data.map(entry => ({
    id: entry.id,
    userId: entry.user_id,
    text: entry.text,
    sentiment: entry.sentiment,
    category: entry.category,
    mood: entry.mood,
    aiReply: entry.ai_reply,
    aiSummary: entry.ai_summary,
    aiInsight: entry.ai_insight,
    isAchievement: entry.is_achievement,
    tags: entry.tags,
    streakDay: entry.streak_day,
    focusArea: entry.focus_area,
    createdAt: entry.created_at,
    media: entry.media
  }));

  console.log('[ENTRIES] Fetched entries:', entries.length);
  return entries;
}

/**
 * Get a single entry by ID
 */
export async function getEntry(entryId: string): Promise<DiaryEntry> {
  console.log('[ENTRIES] Fetching entry:', entryId);

  const response = await entriesApiRequest<{ success: boolean; entry: DiaryEntry; error?: string }>(`/${entryId}`);

  if (!response.success) {
    console.error('[ENTRIES] Failed to fetch entry:', response);
    throw new Error(response.error || 'Failed to fetch entry');
  }

  console.log('[ENTRIES] Entry found:', response.entry);
  return response.entry;
}

/**
 * Update an entry
 * TEMPORARY: Uses direct Supabase client until Edge Function routing is fixed
 */
export async function updateEntry(entryId: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry> {
  console.log('[ENTRIES] Updating entry:', entryId, updates);

  const supabase = createClient();

  // Convert camelCase to snake_case for database
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
    console.error('[ENTRIES] Failed to update entry:', error);
    throw new Error(error.message || 'Failed to update entry');
  }

  // Convert to camelCase
  const updatedEntry: DiaryEntry = {
    id: data.id,
    userId: data.user_id,
    text: data.text,
    sentiment: data.sentiment,
    category: data.category,
    mood: data.mood,
    aiReply: data.ai_reply,
    aiSummary: data.ai_summary,
    aiInsight: data.ai_insight,
    isAchievement: data.is_achievement,
    tags: data.tags,
    streakDay: data.streak_day,
    focusArea: data.focus_area,
    createdAt: data.created_at,
    media: data.media
  };

  console.log('[ENTRIES] Entry updated successfully:', updatedEntry);
  return updatedEntry;
}

/**
 * Delete an entry
 * TEMPORARY: Uses direct Supabase client until Edge Function routing is fixed
 */
export async function deleteEntry(entryId: string, userId: string): Promise<void> {
  console.log('[ENTRIES] Deleting entry:', entryId);

  const supabase = createClient();

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', entryId);

  if (error) {
    console.error('[ENTRIES] Failed to delete entry:', error);
    throw new Error(error.message || 'Failed to delete entry');
  }

  console.log('[ENTRIES] Entry deleted successfully');
}

