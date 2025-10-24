import { projectId } from '../supabase/info';

/**
 * Microservices base URLs configuration
 * All Edge Functions are deployed to Supabase
 *
 * NOTE: admin-api was split into 4 microservices (2025-10-24):
 * - admin-stats-api: /stats endpoint
 * - admin-users-api: /users endpoint
 * - admin-settings-api: /languages, /translations, /settings endpoints
 * - admin-system-api: /notifications, /system endpoints
 *
 * NOTE: media was split into 2 microservices (2025-10-24):
 * - media-upload-api: POST /upload, GET /health
 * - media-manage-api: POST /signed-url, DELETE /:path, GET /health
 */
export const API_URLS = {
  PROFILES: `https://${projectId}.supabase.co/functions/v1/profiles`,
  ENTRIES: `https://${projectId}.supabase.co/functions/v1/entries`,
  AI_ANALYSIS: `https://${projectId}.supabase.co/functions/v1/ai-analysis/analyze`,
  MOTIVATIONS: `https://${projectId}.supabase.co/functions/v1/motivations`,

  // Media microservices (split from media)
  MEDIA_UPLOAD: `https://${projectId}.supabase.co/functions/v1/media-upload-api`,
  MEDIA_MANAGE: `https://${projectId}.supabase.co/functions/v1/media-manage-api`,
  // Legacy (deprecated, use MEDIA_UPLOAD and MEDIA_MANAGE above)
  MEDIA: `https://${projectId}.supabase.co/functions/v1/media`,
  TRANSCRIPTION: `https://${projectId}.supabase.co/functions/v1/transcription-api`,
  // Admin microservices (split from admin-api)
  ADMIN_STATS: `https://${projectId}.supabase.co/functions/v1/admin-stats-api`,
  ADMIN_USERS: `https://${projectId}.supabase.co/functions/v1/admin-users-api`,
  ADMIN_SETTINGS: `https://${projectId}.supabase.co/functions/v1/admin-settings-api`,
  ADMIN_SYSTEM: `https://${projectId}.supabase.co/functions/v1/admin-system-api`,
  // Legacy (deprecated, use specific admin microservices above)
  ADMIN: `https://${projectId}.supabase.co/functions/v1/admin-api`,
  TRANSLATIONS: `https://${projectId}.supabase.co/functions/v1/translations-api`,
} as const;

/**
 * Legacy API URL (deprecated, kept for backward compatibility)
 * @deprecated Use specific microservice URLs instead
 */
export const LEGACY_API_URL = '';

