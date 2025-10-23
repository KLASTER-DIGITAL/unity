import { createClient } from '@/utils/supabase/client';

/**
 * Options for API requests
 */
export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requireOpenAI?: boolean; // Flag to indicate OpenAI key is required
}

/**
 * Get authorization headers with access token
 * @param requireOpenAI - Whether to include OpenAI API key
 * @returns Headers object with Authorization and optional X-OpenAI-Key
 */
export async function getAuthHeaders(requireOpenAI: boolean = false): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session. Please log in.');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`,
  };

  // Add OpenAI API key if required
  if (requireOpenAI) {
    const openaiApiKey = localStorage.getItem('admin_openai_api_key');
    if (openaiApiKey) {
      headers['X-OpenAI-Key'] = openaiApiKey;
    }
  }

  return headers;
}

/**
 * Base function for API requests
 * @param endpoint - API endpoint (relative or absolute URL)
 * @param options - Request options
 * @returns Parsed JSON response
 */
export async function apiRequest<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers: customHeaders = {}, requireOpenAI = false } = options;

  const headers = {
    ...(await getAuthHeaders(requireOpenAI)),
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
    console.log(`[API] ${method} ${endpoint}`, body ? { body } : '');

    const response = await fetch(endpoint, config);
    const responseText = await response.text();
    
    console.log(`[API Response] ${endpoint}:`, responseText);

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

    // Handle empty responses
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
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Helper to convert Blob to base64 string
 * @param blob - Blob to convert
 * @returns Base64 encoded string
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (e.g., "data:audio/webm;base64,")
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

