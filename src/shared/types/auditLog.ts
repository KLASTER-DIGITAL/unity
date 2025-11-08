/**
 * Audit Log Types
 *
 * TypeScript types for admin audit logging system.
 *
 * @author UNITY Team
 * @date 2025-11-08
 */

// ============================================
// Audit Log Entry
// ============================================

export interface AuditLogEntry {
	id: string;
	action: string;
	category: AuditLogCategory;
	user_id: string;
	user_email: string;
	target_id?: string;
	target_type?: string;
	details?: Record<string, any>;
	ip_address?: string;
	user_agent?: string;
	created_at: string;
}

// ============================================
// Audit Log Categories
// ============================================

export type AuditLogCategory = 'users' | 'settings' | 'system' | 'translations' | 'content';

// ============================================
// Audit Log Actions
// ============================================

export type AuditLogAction =
	// User actions
	| 'user.create'
	| 'user.delete'
	| 'user.update'
	| 'user.role.change'
	| 'user.ban'
	| 'user.unban'
	// Settings actions
	| 'settings.update'
	| 'settings.reset'
	// System actions
	| 'system.backup'
	| 'system.restore'
	| 'system.maintenance.start'
	| 'system.maintenance.end'
	// Translation actions
	| 'translation.create'
	| 'translation.update'
	| 'translation.delete'
	| 'language.create'
	| 'language.update'
	| 'language.delete'
	// Content actions
	| 'entry.delete'
	| 'entry.restore'
	| 'achievement.delete'
	| 'achievement.restore';

// ============================================
// Audit Log Filters
// ============================================

export interface AuditLogFilters {
	category?: AuditLogCategory;
	action?: AuditLogAction;
	user_id?: string;
	limit?: number;
	offset?: number;
}

// ============================================
// Audit Log API Response
// ============================================

export interface AuditLogResponse {
	success: boolean;
	logs?: AuditLogEntry[];
	error?: string;
}

// ============================================
// Audit Log Create Request
// ============================================

export interface CreateAuditLogRequest {
	action: AuditLogAction;
	category: AuditLogCategory;
	target_id?: string;
	target_type?: string;
	details?: Record<string, any>;
}
