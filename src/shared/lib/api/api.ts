import { createClient } from '@/utils/supabase/client';

// ✅ NEW: Import from modular API structure (2025-10-23)
import { API_URLS } from './config/urls';
import { apiRequest as coreApiRequest, blobToBase64, getAuthHeaders } from './core/request';
import type { ApiOptions } from './core/request';

// Re-export types for backward compatibility
export type {
  UserProfile,
  MediaFile,
  AIAnalysisResult,
  DiaryEntry,
  UserStats,
  UploadMediaOptions,
  MotivationCard,
  BookDraft,
  BookGenerationRequest,
} from './types';

// NOTE: Profile functions are now in ./services/profiles
// They are re-exported from ./index.ts for backward compatibility
// DO NOT re-export them here to avoid duplicate exports

// ✅ Microservices base URLs (backward compatibility)
const PROFILES_API_URL = API_URLS.PROFILES;
const ENTRIES_API_URL = API_URLS.ENTRIES;
const AI_ANALYSIS_API_URL = API_URLS.AI_ANALYSIS;
const MOTIVATIONS_API_URL = API_URLS.MOTIVATIONS;
const MEDIA_API_URL = API_URLS.MEDIA;
const TRANSCRIPTION_API_URL = API_URLS.TRANSCRIPTION;
const ADMIN_API_URL = API_URLS.ADMIN;
const TRANSLATIONS_API_URL = API_URLS.TRANSLATIONS;

// TODO: Books API microservice not yet created - using direct Supabase client for now
const API_BASE_URL = ''; // Placeholder - will be removed when Books API is migrated

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

// NOTE: AI Analysis function moved to ./services/ai-analysis.ts
// It is re-exported from ./index.ts for backward compatibility
// See ./services/ai-analysis.ts for implementation

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

// NOTE: Entry functions moved to ./services/entries.ts
// They are re-exported from ./index.ts for backward compatibility
// See ./services/entries.ts for implementation

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

// NOTE: Profile functions moved to ./services/profiles.ts
// They are re-exported from ./index.ts for backward compatibility
// See ./services/profiles.ts for implementation

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

// NOTE: Media functions moved to ./services/media.ts
// They are re-exported from ./index.ts for backward compatibility
// See ./services/media.ts for implementation

// NOTE: getSignedUrl, deleteMedia, and blobToBase64 moved to ./services/media.ts and ./core/request.ts
// They are re-exported from ./index.ts for backward compatibility

// ==========================================
// HEALTH CHECK
// ==========================================

// ==========================================
// CARDS MODULE API
// ==========================================

// NOTE: Motivation functions moved to ./services/motivations.ts
// They are re-exported from ./index.ts for backward compatibility
// See ./services/motivations.ts for implementation

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
