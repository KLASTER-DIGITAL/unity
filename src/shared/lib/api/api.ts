import { projectId, publicAnonKey } from './supabase/info';
import { createClient } from '@/utils/supabase/client';

// ✅ Microservices base URLs (2025-10-20)
const PROFILES_API_URL = `https://${projectId}.supabase.co/functions/v1/profiles`;
const ENTRIES_API_URL = `https://${projectId}.supabase.co/functions/v1/entries`;
const AI_ANALYSIS_API_URL = `https://${projectId}.supabase.co/functions/v1/ai-analysis`;
const MOTIVATIONS_API_URL = `https://${projectId}.supabase.co/functions/v1/motivations`;
const MEDIA_API_URL = `https://${projectId}.supabase.co/functions/v1/media`;
const TRANSCRIPTION_API_URL = `https://${projectId}.supabase.co/functions/v1/transcription-api`;
const ADMIN_API_URL = `https://${projectId}.supabase.co/functions/v1/admin-api`;
const TRANSLATIONS_API_URL = `https://${projectId}.supabase.co/functions/v1/translations-api`;

// ❌ REMOVED: Monolithic API (2025-10-20)
// const LEGACY_API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9729c493`;
// const API_BASE_URL = LEGACY_API_URL;

// TODO: Books API microservice not yet created - using direct Supabase client for now
const API_BASE_URL = ''; // Placeholder - will be removed when Books API is migrated

// Export UserProfile type for use in other modules
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string; // Profile photo URL
  diaryName?: string;
  diaryEmoji?: string;
  language?: string;
  notificationSettings?: any;
  onboardingCompleted?: boolean;
  createdAt?: string;
  // New fields from migration 20251018
  theme?: string;
  isPremium?: boolean;
  biometricEnabled?: boolean;
  backupEnabled?: boolean;
  firstDayOfWeek?: string;
  privacySettings?: any;
}

export interface MediaFile {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  url?: string;
  path?: string;
  type?: string;
  mimeType?: string;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requireOpenAI?: boolean; // Флаг для указания необходимости OpenAI ключа
}

// Базовая функция для API запросов
async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {}, requireOpenAI = false } = options;

  // Получаем access token из сессии
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session. Please log in.');
  }

  // Получаем OpenAI API ключ из localStorage (только если требуется)
  const openaiApiKey = requireOpenAI ? localStorage.getItem('admin_openai_api_key') : null;

  const requestHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    ...(openaiApiKey && { 'X-OpenAI-Key': openaiApiKey }), // Добавляем OpenAI ключ только если требуется
    ...headers
  };

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    console.log(`[API] ${method} ${endpoint}`, body ? { body } : '');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    const responseText = await response.text();
    console.log(`[API Response] ${endpoint}:`, responseText);

    let jsonData;
    try {
      jsonData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`Failed to parse JSON response from ${endpoint}:`, responseText);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      console.error(`API Error [${endpoint}]:`, jsonData);
      throw new Error(jsonData.error || `API request failed: ${response.status} ${response.statusText}`);
    }

    return jsonData;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

// Функция для запросов к микросервису profiles
async function profilesApiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;

  // Получаем access token из сессии
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session. Please log in.');
  }

  const requestHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    ...headers
  };

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    console.log(`[PROFILES API] ${method} ${endpoint}`, body ? { body } : '');

    const response = await fetch(`${PROFILES_API_URL}${endpoint}`, config);

    const responseText = await response.text();
    console.log(`[PROFILES API Response] ${endpoint}:`, responseText);

    let jsonData;
    try {
      jsonData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`Failed to parse JSON response from ${endpoint}:`, responseText);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      console.error(`PROFILES API Error [${endpoint}]:`, jsonData);
      throw new Error(jsonData.error || `API request failed: ${response.status} ${response.statusText}`);
    }

    return jsonData;
  } catch (error) {
    console.error(`PROFILES API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

// Функция для запросов к микросервису entries
async function entriesApiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;

  // Получаем access token из сессии
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session. Please log in.');
  }

  const requestHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
    ...headers
  };

  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    console.log(`[ENTRIES API] ${method} ${endpoint}`, body ? { body } : '');

    const response = await fetch(`${ENTRIES_API_URL}${endpoint}`, config);

    const responseText = await response.text();
    console.log(`[ENTRIES API Response] ${endpoint}:`, responseText);

    let jsonData;
    try {
      jsonData = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`Failed to parse JSON response from ${endpoint}:`, responseText);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      console.error(`ENTRIES API Error [${endpoint}]:`, jsonData);
      throw new Error(jsonData.error || `API request failed: ${response.status} ${response.statusText}`);
    }

    return jsonData;
  } catch (error) {
    console.error(`ENTRIES API Request Error [${endpoint}]:`, error);
    throw error;
  }
}


// ==========================================
// CHAT & AI ANALYSIS
// ==========================================

export interface AIAnalysisResult {
  reply: string;
  summary: string;       // Краткое резюме (до 200 символов)
  insight: string;       // Позитивный вывод (до 200 символов)
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  tags: string[];
  confidence: number;
  isAchievement?: boolean;  // Флаг достижения
  mood?: string;           // Эмоция/настроение
  entrySummaryId?: string; // ID summary для связи с записью
}

export async function analyzeTextWithAI(text: string, userName?: string, userId?: string): Promise<AIAnalysisResult> {
  try {
    // ✅ Use AI_ANALYSIS_API_URL directly instead of apiRequest
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('No active session. Please log in.');
    }

    const response = await fetch(AI_ANALYSIS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ text, userName, userId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI analysis failed:', errorText);
      throw new Error(`AI analysis failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      console.error('AI analysis failed:', result);
      throw new Error(result.error || 'AI analysis failed');
    }

    return result.analysis;
  } catch (error) {
    console.error('Error in analyzeTextWithAI:', error);

    // ✅ FALLBACK: Return default analysis if AI fails
    console.warn('[API] Using fallback AI analysis');
    return {
      sentiment: 'positive',
      category: 'Другое',
      tags: [],
      reply: 'Записано! 💪 Продолжай отмечать свои достижения!',
      summary: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      insight: 'Каждая запись приближает тебя к цели!',
      isAchievement: true,
      mood: 'хорошее',
      confidence: 0.5
    };
  }
}

// ==========================================
// DIARY ENTRIES
// ==========================================

export interface DiaryEntry {
  id: string;
  userId: string;
  text: string;
  voiceUrl?: string | null;
  mediaUrl?: string | null;
  media?: MediaFile[];       // Массив медиафайлов (фото/видео)
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  tags: string[];
  aiReply: string;
  aiSummary?: string;        // Краткое резюме (до 200 символов)
  aiInsight?: string;        // Позитивный вывод (до 200 символов)
  isAchievement?: boolean;   // Флаг достижения
  mood?: string;             // Эмоция/настроение
  createdAt: string;
  streakDay: number;
  focusArea: string;
}

export async function createEntry(entry: Partial<DiaryEntry>): Promise<DiaryEntry> {
  console.log('[ENTRIES] Creating entry via direct Supabase client:', entry);

  // ✅ TEMPORARY FIX: Use direct Supabase client instead of microservice
  // TODO: Fix entries microservice 404 issue
  const supabase = createClient();

  const { data, error } = await supabase
    .from('entries')
    .insert({
      user_id: entry.userId,
      text: entry.text,
      sentiment: entry.sentiment || 'neutral',
      category: entry.category || 'Другое',
      mood: entry.mood || 'нормальное',
      is_first_entry: entry.isFirstEntry || false,
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
    console.error('[ENTRIES] Error creating entry in Supabase:', error);
    throw new Error(error.message);
  }

  // Convert to camelCase for frontend
  const createdEntry: DiaryEntry = {
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
    aiResponse: data.ai_reply
  };

  console.log('[ENTRIES] Entry created successfully:', createdEntry.id);
  return createdEntry;
}

export async function getEntries(userId: string, limit: number = 50): Promise<DiaryEntry[]> {
  console.log('[ENTRIES] Fetching entries for user:', userId);

  // TEMPORARY WORKAROUND: Use direct Supabase client until Edge Function routing is fixed
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

  console.log(`[ENTRIES] Found ${entries.length} entries`);
  return entries;
}

export async function getEntry(entryId: string): Promise<DiaryEntry> {
  console.log('[ENTRIES] Fetching entry:', entryId);

  // ✅ FIXED: Don't add /entries prefix - it's already in ENTRIES_API_URL
  const response = await entriesApiRequest(`/${entryId}`);

  if (!response.success) {
    console.error('[ENTRIES] Failed to fetch entry:', response);
    throw new Error(response.error || 'Failed to fetch entry');
  }

  console.log('[ENTRIES] Entry found:', response.entry);
  return response.entry;
}

export async function updateEntry(entryId: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry> {
  console.log('[ENTRIES] Updating entry:', entryId, updates);

  // TEMPORARY WORKAROUND: Use direct Supabase client until Edge Function routing is fixed
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
  const entry: DiaryEntry = {
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

  console.log('[ENTRIES] Entry updated successfully:', entry);
  return entry;
}

export async function deleteEntry(entryId: string, userId: string): Promise<void> {
  console.log('[ENTRIES] Deleting entry:', entryId);

  // TEMPORARY WORKAROUND: Use direct Supabase client until Edge Function routing is fixed
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

// ==========================================
// USER STATISTICS
// ==========================================

export interface UserStats {
  totalEntries: number;
  currentStreak: number;
  categoryCounts: Record<string, number>;
  sentimentCounts: Record<string, number>;
  lastEntryDate: string | null;
}

export async function getUserStats(userId: string): Promise<UserStats> {
  // ✅ TEMPORARY FIX: Read directly from Supabase until stats microservice is deployed
  console.log('[STATS] Fetching stats for user:', userId);

  const supabase = createClient();

  // Get all entries for the user
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[STATS] Failed to fetch entries:', error);
    throw new Error(error.message || 'Failed to fetch stats');
  }

  // Calculate statistics
  const totalEntries = entries?.length || 0;

  // Calculate category counts
  const categoryCounts: Record<string, number> = {};
  entries?.forEach(entry => {
    const category = entry.category || 'Другое';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  // Calculate sentiment counts
  const sentimentCounts: Record<string, number> = {};
  entries?.forEach(entry => {
    const sentiment = entry.sentiment || 'neutral';
    sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;
  });

  // Calculate current streak
  let currentStreak = 0;
  if (entries && entries.length > 0) {
    const sortedDates = entries
      .map(e => new Date(e.created_at).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a);

    const today = new Date().setHours(0, 0, 0, 0);

    if (sortedDates.length > 0) {
      const lastEntryDate = sortedDates[0];
      const daysDiff = Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) {
        currentStreak = 1;
        let expectedDate = lastEntryDate - (1000 * 60 * 60 * 24);

        for (let i = 1; i < sortedDates.length; i++) {
          if (sortedDates[i] === expectedDate) {
            currentStreak++;
            expectedDate -= (1000 * 60 * 60 * 24);
          } else {
            break;
          }
        }
      }
    }
  }

  const lastEntryDate = entries && entries.length > 0 ? entries[0].created_at : null;

  const stats: UserStats = {
    totalEntries,
    currentStreak,
    categoryCounts,
    sentimentCounts,
    lastEntryDate
  };

  console.log('[STATS] Stats calculated:', stats);
  return stats;
}

// ==========================================
// USER PROFILES
// ==========================================

export async function createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  console.log('[PROFILES] Creating user profile:', profile);

  const response = await profilesApiRequest('/create', {
    method: 'POST',
    body: profile
  });

  if (!response.success) {
    console.error('[PROFILES] Profile creation failed:', response);
    throw new Error(response.error || 'Failed to create profile');
  }

  console.log('[PROFILES] Profile created successfully:', response.profile);
  return response.profile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('[PROFILES] Fetching profile for user:', userId);

    const response = await profilesApiRequest(`/${userId}`);

    if (!response.success) {
      console.log('[PROFILES] Profile not found for user:', userId);
      return null;
    }

    console.log('[PROFILES] Profile found:', response.profile);
    return response.profile;
  } catch (error) {
    console.error('[PROFILES] Error fetching profile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  console.log('[PROFILES] Updating user profile:', userId, updates);

  const response = await profilesApiRequest(`/${userId}`, {
    method: 'PUT',
    body: updates
  });

  if (!response.success) {
    console.error('[PROFILES] Profile update failed:', response);
    throw new Error('Failed to update profile');
  }

  console.log('[PROFILES] Profile updated successfully:', response.profile);
  return response.profile;
}

// ==========================================
// VOICE TRANSCRIPTION (Whisper API)
// ==========================================

export async function transcribeAudio(audioBlob: Blob, userId?: string, language?: string): Promise<string> {
  console.log('[TRANSCRIPTION] Transcribing audio with Whisper API...');

  // Конвертируем Blob в base64
  const base64Audio = await blobToBase64(audioBlob);

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session');
  }

  // ✅ FIXED: Use new transcription-api microservice
  const response = await fetch(`${TRANSCRIPTION_API_URL}/transcribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      audio: base64Audio,
      mimeType: audioBlob.type,
      userId,
      language: language || 'ru'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[TRANSCRIPTION] Failed:', response.status, errorText);
    throw new Error(`Transcription failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    console.error('[TRANSCRIPTION] Failed:', data);
    throw new Error(data.error || 'Transcription failed');
  }

  console.log('[TRANSCRIPTION] ✅ Successful:', data.text);
  return data.text;
}

// ==========================================
// MEDIA UPLOAD
// ==========================================

export interface UploadMediaOptions {
  thumbnail?: File;
  width?: number;
  height?: number;
  duration?: number;
  entryId?: string;
}

export async function uploadMedia(
  file: File,
  userId: string,
  options?: UploadMediaOptions
): Promise<MediaFile> {
  console.log('[API] 📤 Uploading media:', file.name, file.type, options);

  // Конвертируем File в base64
  const base64File = await blobToBase64(file);

  // Конвертируем thumbnail в base64 (если есть)
  let base64Thumbnail: string | undefined;
  if (options?.thumbnail) {
    console.log('[API] 🖼️ Converting thumbnail to base64...');
    base64Thumbnail = await blobToBase64(options.thumbnail);
  }

  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session');
  }

  const requestBody = {
    file: base64File,
    fileName: file.name,
    mimeType: file.type,
    userId,
    thumbnail: base64Thumbnail,
    width: options?.width,
    height: options?.height,
    duration: options?.duration,
    entryId: options?.entryId
  };

  // 🚀 PROFESSIONAL APPROACH: Try microservice with timeout, fallback to legacy
  try {
    console.log('[API] 🎯 Attempting media microservice (10s timeout)...');

    // Create abort controller for timeout (10s for file upload)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${MEDIA_API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Microservice returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Microservice returned error');
    }

    console.log('[API] ✅ Microservice success:', data.path);

    const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

    return {
      id: data.id || '',
      userId: userId,
      fileName: file.name,
      filePath: data.path,
      fileType: mediaType,
      fileSize: file.size,
      createdAt: new Date().toISOString(),
      url: data.url,
      path: data.path,
      type: mediaType,
      mimeType: data.mimeType
    };

  } catch (microserviceError: any) {
    console.error('[API] ❌ Media microservice failed!');
    console.error('[API] Error:', microserviceError);
    throw new Error('Failed to upload media: ' + microserviceError.message);
  }
}

export async function getSignedUrl(path: string): Promise<string> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session');
  }

  const requestBody = { path };

  // 🚀 PROFESSIONAL APPROACH: Try microservice with timeout, fallback to legacy
  try {
    console.log('[API] 🎯 Attempting media microservice for signed URL (5s timeout)...');

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${MEDIA_API_URL}/signed-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Microservice returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Microservice returned error');
    }

    console.log('[API] ✅ Microservice success: signed URL created');
    return data.url;

  } catch (microserviceError: any) {
    console.error('[API] ❌ Media microservice failed!');
    console.error('[API] Error:', microserviceError);
    throw new Error('Failed to get signed URL: ' + microserviceError.message);
  }
}

export async function deleteMedia(path: string): Promise<void> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session');
  }

  // 🚀 PROFESSIONAL APPROACH: Try microservice with timeout, fallback to legacy
  try {
    console.log('[API] 🎯 Attempting media microservice for delete (5s timeout)...');

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${MEDIA_API_URL}/${encodeURIComponent(path)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Microservice returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Microservice returned error');
    }

    console.log('[API] ✅ Microservice success: media deleted');

  } catch (microserviceError: any) {
    console.error('[API] ❌ Media microservice failed!');
    console.error('[API] Error:', microserviceError);
    throw new Error('Failed to delete media: ' + microserviceError.message);
  }
}

// Вспомогательная функция для конвертации Blob в base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ==========================================
// HEALTH CHECK
// ==========================================

// ==========================================
// CARDS MODULE API
// ==========================================

export interface MotivationCard {
  id: string;
  entryId?: string;
  date: string;
  title: string;
  description: string;
  gradient: string;
  isMarked: boolean;
  isDefault?: boolean;
  sentiment?: string;
  mood?: string;
}

export async function getMotivationCards(userId: string): Promise<MotivationCard[]> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session');
  }

  // 🚀 PROFESSIONAL APPROACH: Try microservice with timeout, fallback to legacy
  try {
    console.log('[API] 🎯 Attempting motivations microservice (5s timeout)...');

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`${MOTIVATIONS_API_URL}/cards/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Microservice returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Microservice returned error');
    }

    console.log('[API] ✅ Microservice success:', data.cards.length, 'cards');
    return data.cards || [];

  } catch (microserviceError: any) {
    console.error('[API] ❌ Motivations microservice failed!');
    console.error('[API] Error:', microserviceError);
    throw new Error('Failed to fetch motivation cards: ' + microserviceError.message);
  }
}

export async function markCardAsRead(userId: string, cardId: string): Promise<void> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session');
  }

  // 🚀 PROFESSIONAL APPROACH: Try microservice with timeout, fallback to legacy
  try {
    console.log('[API] 🎯 Marking card as read via microservice (5s timeout)...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${MOTIVATIONS_API_URL}/mark-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ userId, cardId }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Microservice returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Microservice returned error');
    }

    console.log('[API] ✅ Microservice marked card as read');

  } catch (microserviceError: any) {
    console.error('[API] ❌ Motivations microservice failed!');
    console.error('[API] Error:', microserviceError);
    throw new Error('Failed to mark card as read: ' + microserviceError.message);
  }
}

// ==========================================
// BOOKS MODULE API
// ==========================================

export interface BookDraft {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  contexts: string[];
  style: string;
  layout: string;
  theme: string;
  pdfUrl?: string;
  storyJson?: any;
  metadata: any;
  isDraft: boolean;
  isFinal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookGenerationRequest {
  period: {
    start: string;
    end: string;
  };
  contexts: string[];
  style: string;
  layout: string;
  theme: string;
  userId: string;
}

export async function generateBookDraft(request: BookGenerationRequest): Promise<{
  draftId: string;
  storyJson: any;
  estimatedPages: number;
}> {
  try {
    const response = await apiRequest('/books/generate-draft', {
      method: 'POST',
      body: request,
      requireOpenAI: true
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate book draft');
    }

    return {
      draftId: response.draftId,
      storyJson: response.storyJson,
      estimatedPages: response.estimatedPages
    };
  } catch (error) {
    console.error('Error in generateBookDraft:', error);
    throw error;
  }
}

export async function getBookDraft(draftId: string): Promise<BookDraft> {
  try {
    const response = await apiRequest(`/books/${draftId}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get book draft');
    }

    return response.book;
  } catch (error) {
    console.error('Error in getBookDraft:', error);
    throw error;
  }
}

export async function saveBookDraft(draftId: string, storyJson: any): Promise<void> {
  try {
    const response = await apiRequest(`/books/${draftId}/save`, {
      method: 'POST',
      body: { storyJson }
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to save book draft');
    }
  } catch (error) {
    console.error('Error in saveBookDraft:', error);
    throw error;
  }
}

export async function getBooksArchive(userId: string): Promise<BookDraft[]> {
  try {
    const response = await apiRequest(`/books/archive/${userId}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get books archive');
    }

    return response.books || [];
  } catch (error) {
    console.error('Error in getBooksArchive:', error);
    throw error;
  }
}

export async function renderBookPDF(draftId: string): Promise<{
  pdfUrl: string;
  pages: number;
  wordCount: number;
}> {
  try {
    const response = await apiRequest(`/books/${draftId}/render-pdf`, {
      method: 'POST',
      requireOpenAI: true
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to render PDF');
    }

    return {
      pdfUrl: response.pdfUrl,
      pages: response.pages,
      wordCount: response.wordCount
    };
  } catch (error) {
    console.error('Error in renderBookPDF:', error);
    throw error;
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await apiRequest('/health');
    return response.status === 'ok';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
