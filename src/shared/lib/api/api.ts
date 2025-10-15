import { projectId, publicAnonKey } from './supabase/info';
import { createClient } from './supabase/client';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9729c493`;

// Export UserProfile type for use in other modules
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  diaryName?: string;
  diaryEmoji?: string;
  language?: string;
  notificationSettings?: any;
  onboardingCompleted?: boolean;
  createdAt?: string;
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
  const response = await apiRequest('/analyze', {
    method: 'POST',
    body: { text, userName, userId },
    requireOpenAI: true
  });

    if (!response.success) {
      console.error('AI analysis failed:', response);
      throw new Error(response.error || 'AI analysis failed');
    }

    return response.analysis;
  } catch (error) {
    console.error('Error in analyzeTextWithAI:', error);
    throw error;
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
  const response = await apiRequest('/entries/create', {
    method: 'POST',
    body: entry
  });

  if (!response.success) {
    throw new Error('Failed to create entry');
  }

  return response.entry;
}

export async function getEntries(userId: string, limit: number = 50): Promise<DiaryEntry[]> {
  const response = await apiRequest(`/entries/${userId}?limit=${limit}`);

  if (!response.success) {
    throw new Error('Failed to fetch entries');
  }

  return response.entries;
}

export async function getEntry(entryId: string): Promise<DiaryEntry> {
  const response = await apiRequest(`/entries/${entryId}`);

  if (!response.success) {
    throw new Error('Failed to fetch entry');
  }

  return response.entry;
}

export async function deleteEntry(entryId: string, userId: string): Promise<void> {
  const response = await apiRequest(`/entries/${entryId}?userId=${userId}`, {
    method: 'DELETE'
  });

  if (!response.success) {
    throw new Error('Failed to delete entry');
  }
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
  const response = await apiRequest(`/stats/${userId}`);

  if (!response.success) {
    throw new Error('Failed to fetch stats');
  }

  return response.stats;
}

// ==========================================
// USER PROFILES
// ==========================================

export async function createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  console.log('Creating user profile:', profile);
  
  const response = await apiRequest('/profiles/create', {
    method: 'POST',
    body: profile
  });

  if (!response.success) {
    console.error('Profile creation failed:', response);
    throw new Error(response.error || 'Failed to create profile');
  }

  console.log('Profile created successfully:', response.profile);
  return response.profile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('Fetching profile for user:', userId);
    
    const response = await apiRequest(`/profiles/${userId}`);

    if (!response.success) {
      console.log('Profile not found for user:', userId);
      return null;
    }

    console.log('Profile found:', response.profile);
    return response.profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const response = await apiRequest(`/profiles/${userId}`, {
    method: 'PUT',
    body: updates
  });

  if (!response.success) {
    throw new Error('Failed to update profile');
  }

  return response.profile;
}

// ==========================================
// VOICE TRANSCRIPTION (Whisper API)
// ==========================================

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  console.log('Transcribing audio with Whisper API...');
  
  // Конвертируем Blob в base64
  const base64Audio = await blobToBase64(audioBlob);
  
  const response = await apiRequest('/transcribe', {
    method: 'POST',
    body: {
      audio: base64Audio,
      mimeType: audioBlob.type
    },
    requireOpenAI: true
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to transcribe audio');
  }

  console.log('Transcription successful:', response.text);
  return response.text;
}

// ==========================================
// MEDIA UPLOAD
// ==========================================

export async function uploadMedia(
  file: File, 
  userId: string
): Promise<MediaFile> {
  console.log('Uploading media:', file.name, file.type);
  
  // Конвертируем File в base64
  const base64File = await blobToBase64(file);
  
  const response = await apiRequest('/media/upload', {
    method: 'POST',
    body: {
      file: base64File,
      fileName: file.name,
      mimeType: file.type,
      userId
    }
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to upload media');
  }

  const mediaType = file.type.startsWith('image/') ? 'image' : 'video';

  console.log('Media uploaded successfully:', response.path);
  
  return {
    id: response.id || '',
    userId: userId,
    fileName: file.name,
    filePath: response.path,
    fileType: mediaType,
    fileSize: file.size,
    createdAt: new Date().toISOString(),
    url: response.url,
    path: response.path,
    type: mediaType,
    mimeType: response.mimeType
  };
}

export async function getSignedUrl(path: string): Promise<string> {
  const response = await apiRequest('/media/signed-url', {
    method: 'POST',
    body: { path }
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to get signed URL');
  }

  return response.url;
}

export async function deleteMedia(path: string): Promise<void> {
  const response = await apiRequest(`/media/${encodeURIComponent(path)}`, {
    method: 'DELETE'
  });

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete media');
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
  try {
    const response = await apiRequest(`/motivations/cards/${userId}`);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to get motivation cards');
    }

    return response.cards || [];
  } catch (error) {
    console.error('Error in getMotivationCards:', error);
    throw error;
  }
}

export async function markCardAsRead(userId: string, cardId: string): Promise<void> {
  try {
    const response = await apiRequest('/motivations/mark-read', {
      method: 'POST',
      body: { userId, cardId }
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to mark card as read');
    }
  } catch (error) {
    console.error('Error in markCardAsRead:', error);
    throw error;
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
