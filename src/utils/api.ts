import { projectId, publicAnonKey } from './supabase/info';

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

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

// Базовая функция для API запросов
async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;
  
  const requestHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
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
  sentiment: 'positive' | 'neutral' | 'negative';
  category: string;
  tags: string[];
  confidence: number;
}

export async function analyzeTextWithAI(text: string, userName?: string): Promise<AIAnalysisResult> {
  try {
    const response = await apiRequest('/chat/analyze', {
      method: 'POST',
      body: { text, userName }
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
  const response = await apiRequest(`/entries/list?userId=${userId}&limit=${limit}`);

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
    }
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

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await apiRequest('/health');
    return response.status === 'ok';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
