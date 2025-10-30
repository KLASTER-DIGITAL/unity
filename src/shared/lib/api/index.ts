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

export { API_URLS } from "./config/urls";
export type { ApiOptions } from "./core/request";
export { apiRequest, blobToBase64, getAuthHeaders } from "./core/request";

// ==========================================
// TYPES
// ==========================================

export type {
	AIAnalysisResult,
	BookDraft,
	BookGenerationRequest,
	DiaryEntry,
	MediaFile,
	MotivationCard,
	UploadMediaOptions,
	UserProfile,
	UserStats,
} from "./types";

// ==========================================
// SERVICES
// ==========================================

// AI Analysis API
export { analyzeTextWithAI } from "./services/ai-analysis";
export type {
	CreateCategoryInput,
	UpdateCategoryInput,
	UserCategory,
} from "./services/categories";
// Categories API
export {
	createCategory,
	deleteCategory,
	getCategoryByName,
	getUserCategories,
	updateCategory,
} from "./services/categories";
// Entries API
export {
	createEntry,
	deleteEntry,
	getEntries,
	getEntry,
	updateEntry,
} from "./services/entries";
// Media API
export {
	deleteMedia,
	getSignedUrl,
	uploadMedia,
} from "./services/media";
// Motivations API
export {
	getMotivationCards,
	markCardAsRead,
} from "./services/motivations";
// Profiles API
export {
	createUserProfile,
	getUserProfile,
	updateUserProfile,
} from "./services/profiles";

// ==========================================
// LEGACY API (from api.ts)
// ==========================================

// Re-export everything from the legacy api.ts file
// This ensures backward compatibility while we migrate
export * from "./api";
