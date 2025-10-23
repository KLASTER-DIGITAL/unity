/**
 * Unified API exports
 *
 * This file provides a single entry point for all API functionality.
 * It combines the new modular structure (2025-10-23) with backward compatibility.
 *
 * Migration strategy:
 * 1. New code should import from specific modules (e.g., './services/profiles')
 * 2. Existing code can continue using './api' or './index'
 * 3. Gradually migrate functions from api.ts to specific service modules
 */

// ==========================================
// CORE & CONFIGURATION
// ==========================================

export { apiRequest, getAuthHeaders, blobToBase64 } from './core/request';
export type { ApiOptions } from './core/request';
export { API_URLS } from './config/urls';

// ==========================================
// TYPES
// ==========================================

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

// ==========================================
// SERVICES
// ==========================================

// Profiles API
export {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
} from './services/profiles';

// ==========================================
// LEGACY API (from api.ts)
// ==========================================

// Re-export everything from the legacy api.ts file
// This ensures backward compatibility while we migrate
export * from './api';

