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
    console.log('[API] Analyzing text with AI (new microservice)...');

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('No active session');
    }

    // ✅ FIXED: Call new ai-analysis microservice
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/ai-analysis/analyze`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ text, userName, userId })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API] AI analysis failed:', response.status, errorText);
      throw new Error(`AI analysis failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      console.error('[API] AI analysis failed:', data);
      throw new Error(data.error || 'AI analysis failed');
    }

    console.log('[API] ✅ AI analysis successful:', data.analysis);
    return data.analysis;
  } catch (error) {
    console.error('[API] Error in analyzeTextWithAI:', error);

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
  console.log('Creating entry:', entry);

  const supabase = createClient();

  const { data, error} = await supabase
    .from('entries')
    .insert({
      user_id: entry.userId,
      text: entry.text,
      sentiment: entry.sentiment || 'neutral',
      category: entry.category || 'Другое',
      tags: entry.tags || [],
      ai_reply: entry.aiReply || '',
      ai_summary: entry.aiSummary || null,
      ai_insight: entry.aiInsight || null,
      is_achievement: entry.isAchievement || false,
      mood: entry.mood || null,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Entry creation failed:', error);
    throw new Error(error.message || 'Failed to create entry');
  }

  // Преобразуем snake_case в camelCase
  const diaryEntry: DiaryEntry = {
    id: data.id,
    userId: data.user_id,
    text: data.text,
    voiceUrl: null, // Не используется в текущей схеме
    mediaUrl: null, // Не используется в текущей схеме
    sentiment: data.sentiment,
    category: data.category,
    tags: data.tags || [],
    aiReply: data.ai_reply || '',
    aiSummary: data.ai_summary,
    aiInsight: data.ai_insight,
    isAchievement: data.is_achievement,
    mood: data.mood,
    createdAt: data.created_at,
    streakDay: 1, // Не используется в текущей схеме
    focusArea: '' // Не используется в текущей схеме
  };

  console.log('Entry created successfully:', diaryEntry);
  return diaryEntry;
}

export async function getEntries(userId: string, limit: number = 50): Promise<DiaryEntry[]> {
  console.log('Fetching entries for user:', userId, 'limit:', limit);

  const supabase = createClient();

  // Get session token
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('No active session');
  }

  // Call entries Edge Function directly
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/entries/${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    }
  );

  if (!response.ok) {
    console.error('Failed to fetch entries:', response.status, response.statusText);
    throw new Error(`Failed to fetch entries: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch entries');
  }

  console.log('Entries fetched successfully:', data.entries?.length || 0);
  return data.entries || [];
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
  console.log('Fetching stats for user:', userId);

  const supabase = createClient();

  // Get all entries for the user
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch entries for stats:', error);
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

  // Calculate streak (consecutive days with entries)
  let currentStreak = 0;
  if (entries && entries.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedDates = entries
      .map(e => {
        const date = new Date(e.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .filter((value, index, self) => self.indexOf(value) === index) // unique dates
      .sort((a, b) => b - a); // descending

    if (sortedDates.length > 0) {
      const lastEntryDate = sortedDates[0];
      const daysDiff = Math.floor((today.getTime() - lastEntryDate) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 1) { // Today or yesterday
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

  console.log('Stats calculated successfully:', stats);
  return stats;
}

// ==========================================
// USER PROFILES
// ==========================================

export async function createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  console.log('Creating user profile:', profile);

  // Используем прямой запрос к Supabase вместо Edge Function
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: profile.id,
      name: profile.name || 'Пользователь',
      email: profile.email,
      language: profile.language || 'ru',
      diary_name: profile.diaryName || 'Мой дневник',
      diary_emoji: profile.diaryEmoji || '📝',
      notification_settings: profile.notificationSettings || {
        selectedTime: 'none',
        morningTime: '08:00',
        eveningTime: '21:00',
        permissionGranted: false
      },
      onboarding_completed: profile.onboardingCompleted || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Profile creation failed:', error);
    throw new Error(error.message || 'Failed to create profile');
  }

  // Преобразуем snake_case в camelCase
  const userProfile: UserProfile = {
    id: data.id,
    name: data.name,
    email: data.email,
    language: data.language,
    diaryName: data.diary_name,
    diaryEmoji: data.diary_emoji,
    notificationSettings: data.notification_settings,
    onboardingCompleted: data.onboarding_completed,
    createdAt: data.created_at
  };

  console.log('Profile created successfully:', userProfile);
  return userProfile;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('Fetching profile for user:', userId);

    const supabase = createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('Profile not found for user:', userId, error);
      return null;
    }

    if (!data) {
      console.log('Profile not found for user:', userId);
      return null;
    }

    // Преобразуем snake_case в camelCase
    const userProfile: UserProfile = {
      id: data.id,
      name: data.name,
      email: data.email,
      language: data.language,
      diaryName: data.diary_name,
      diaryEmoji: data.diary_emoji,
      notificationSettings: data.notification_settings,
      onboardingCompleted: data.onboarding_completed,
      createdAt: data.created_at
    };

    console.log('Profile found:', userProfile);
    return userProfile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const supabase = createClient();

  // Преобразуем camelCase в snake_case для базы данных
  const dbUpdates: any = {
    updated_at: new Date().toISOString()
  };

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.language !== undefined) dbUpdates.language = updates.language;
  if (updates.diaryName !== undefined) dbUpdates.diary_name = updates.diaryName;
  if (updates.diaryEmoji !== undefined) dbUpdates.diary_emoji = updates.diaryEmoji;
  if (updates.notificationSettings !== undefined) dbUpdates.notification_settings = updates.notificationSettings;
  if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;

  const { data, error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Profile update failed:', error);
    throw new Error(error.message || 'Failed to update profile');
  }

  // Преобразуем snake_case в camelCase
  const userProfile: UserProfile = {
    id: data.id,
    name: data.name,
    email: data.email,
    language: data.language,
    diaryName: data.diary_name,
    diaryEmoji: data.diary_emoji,
    notificationSettings: data.notification_settings,
    onboardingCompleted: data.onboarding_completed,
    createdAt: data.created_at
  };

  console.log('Profile updated successfully:', userProfile);
  return userProfile;
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
    console.log('Generating motivation cards for user:', userId);

    const supabase = createClient();
    const cards: MotivationCard[] = [];

    // 1. Get recent entries with AI analysis
    const { data: entries, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userId)
      .not('ai_summary', 'is', null) // Only entries with AI analysis
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching entries for cards:', error);
    }

    // 2. Convert entries to motivation cards
    if (entries && entries.length > 0) {
      entries.forEach((entry, index) => {
        const gradient = getGradientForSentiment(entry.sentiment || 'neutral');

        cards.push({
          id: `entry-${entry.id}`,
          entryId: entry.id,
          date: entry.created_at,
          title: entry.ai_summary || entry.text.substring(0, 50) + '...',
          description: entry.ai_insight || entry.ai_reply || 'Продолжай в том же духе!',
          gradient,
          isMarked: false,
          isDefault: false,
          sentiment: entry.sentiment,
          mood: entry.mood
        });
      });
    }

    // 3. Add default motivation cards if needed (always show 3 cards minimum)
    const defaultCards = getDefaultMotivationCards();
    const cardsNeeded = 3 - cards.length;

    if (cardsNeeded > 0) {
      cards.push(...defaultCards.slice(0, cardsNeeded));
    }

    console.log(`Generated ${cards.length} motivation cards (${entries?.length || 0} from entries, ${cardsNeeded > 0 ? cardsNeeded : 0} default)`);
    return cards;
  } catch (error) {
    console.error('Error in getMotivationCards:', error);

    // Fallback: return default cards
    console.log('Returning default motivation cards as fallback');
    return getDefaultMotivationCards();
  }
}

// Helper: Get gradient based on sentiment
function getGradientForSentiment(sentiment: string): string {
  const gradients: Record<string, string> = {
    'positive': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'neutral': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'negative': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'mixed': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  };

  return gradients[sentiment] || gradients['neutral'];
}

// Helper: Get default motivation cards
function getDefaultMotivationCards(): MotivationCard[] {
  return [
    {
      id: 'default-1',
      date: new Date().toISOString(),
      title: 'Сегодня отличное время',
      description: 'Запиши маленькую победу — это первый шаг к осознанию своих достижений.',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      isMarked: false,
      isDefault: true,
      sentiment: 'positive'
    },
    {
      id: 'default-2',
      date: new Date().toISOString(),
      title: 'Даже одна мысль делает день осмысленным',
      description: 'Не обязательно писать много — одна фраза может изменить твой взгляд на прожитый день.',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      isMarked: false,
      isDefault: true,
      sentiment: 'neutral'
    },
    {
      id: 'default-3',
      date: new Date().toISOString(),
      title: 'Запиши момент благодарности',
      description: 'Почувствуй лёгкость, когда замечаешь хорошее в своей жизни. Это путь к счастью.',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      isMarked: false,
      isDefault: true,
      sentiment: 'positive'
    }
  ];
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
