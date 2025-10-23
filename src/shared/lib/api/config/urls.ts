import { projectId } from '../supabase/info';

/**
 * Microservices base URLs configuration
 * All Edge Functions are deployed to Supabase
 */
export const API_URLS = {
  PROFILES: `https://${projectId}.supabase.co/functions/v1/profiles`,
  ENTRIES: `https://${projectId}.supabase.co/functions/v1/entries`,
  AI_ANALYSIS: `https://${projectId}.supabase.co/functions/v1/ai-analysis/analyze`,
  MOTIVATIONS: `https://${projectId}.supabase.co/functions/v1/motivations`,
  MEDIA: `https://${projectId}.supabase.co/functions/v1/media`,
  TRANSCRIPTION: `https://${projectId}.supabase.co/functions/v1/transcription-api`,
  ADMIN: `https://${projectId}.supabase.co/functions/v1/admin-api`,
  TRANSLATIONS: `https://${projectId}.supabase.co/functions/v1/translations-api`,
} as const;

/**
 * Legacy API URL (deprecated, kept for backward compatibility)
 * @deprecated Use specific microservice URLs instead
 */
export const LEGACY_API_URL = '';

