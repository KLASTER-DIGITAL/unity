import { apiRequest, getAuthHeaders } from '../core/request';
import { API_URLS } from '../config/urls';
import type { UserProfile } from '../types';

/**
 * Profiles API request helper
 * @param endpoint - Endpoint path (e.g., '/create', '/:userId')
 * @param options - Request options
 * @returns Parsed JSON response
 */
async function profilesApiRequest<T = any>(endpoint: string, options: any = {}): Promise<T> {
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
    console.log(`[PROFILES API] ${method} ${API_URLS.PROFILES}${endpoint}`, body ? { body } : '');

    const response = await fetch(`${API_URLS.PROFILES}${endpoint}`, config);
    const responseText = await response.text();
    
    console.log(`[PROFILES API Response] ${endpoint}:`, responseText);

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
    console.error(`PROFILES API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Create a new user profile
 * @param profile - Partial user profile data
 * @returns Created user profile
 */
export async function createUserProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  console.log('[PROFILES] Creating user profile:', profile);

  const response = await profilesApiRequest<{ success: boolean; profile: UserProfile; error?: string }>('/create', {
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

/**
 * Get user profile by ID
 * @param userId - User ID
 * @returns User profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log('[PROFILES] Fetching profile for user:', userId);

    const response = await profilesApiRequest<{ success: boolean; profile: UserProfile }>(`/${userId}`);

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

/**
 * Update user profile
 * @param userId - User ID
 * @param updates - Partial user profile updates
 * @returns Updated user profile
 */
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  console.log('[PROFILES] Updating user profile:', userId, updates);

  const response = await profilesApiRequest<{ success: boolean; profile: UserProfile }>(`/${userId}`, {
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

