/**
 * Entry Types - Shared between PWA and React Native
 * 
 * TRULY shared code - NO platform-specific imports
 */

export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  thumbnail_url?: string;
  duration?: number; // For video/audio
  size?: number; // File size in bytes
  created_at: string;
}

export interface Entry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  emoji?: string;
  category?: string;
  mood?: number; // 1-5 scale
  media?: MediaFile[];
  tags?: string[];
  is_favorite?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  color: string;
  created_at: string;
}

