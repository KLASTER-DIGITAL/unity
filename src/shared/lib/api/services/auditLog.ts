/**
 * Audit Log API Service
 *
 * Service for interacting with admin audit log API.
 *
 * @author UNITY Team
 * @date 2025-11-08
 */

import type {
	AuditLogEntry,
	AuditLogFilters,
	AuditLogResponse,
	CreateAuditLogRequest,
} from '@/shared/types/auditLog';
import { createClient } from '@/utils/supabase/client';

const AUDIT_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-audit-api`;

// ============================================
// Create Audit Log Entry
// ============================================

export async function createAuditLog(request: CreateAuditLogRequest): Promise<void> {
	const supabase = createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('Not authenticated');
	}

	const response = await fetch(`${AUDIT_API_URL}/log`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${session.access_token}`,
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to create audit log');
	}
}

// ============================================
// Get Audit Logs
// ============================================

export async function getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogEntry[]> {
	const supabase = createClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error('Not authenticated');
	}

	// Build query string
	const params = new URLSearchParams();
	if (filters?.category) params.append('category', filters.category);
	if (filters?.action) params.append('action', filters.action);
	if (filters?.user_id) params.append('user_id', filters.user_id);
	if (filters?.limit) params.append('limit', filters.limit.toString());
	if (filters?.offset) params.append('offset', filters.offset.toString());

	const response = await fetch(`${AUDIT_API_URL}/logs?${params.toString()}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${session.access_token}`,
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to fetch audit logs');
	}

	const data: AuditLogResponse = await response.json();
	return data.logs || [];
}

// ============================================
// Helper: Log User Action
// ============================================

export async function logUserAction(
	action: 'create' | 'delete' | 'update' | 'role.change' | 'ban' | 'unban',
	userId: string,
	details?: Record<string, any>
): Promise<void> {
	await createAuditLog({
		action: `user.${action}` as any,
		category: 'users',
		target_id: userId,
		target_type: 'user',
		details,
	});
}

// ============================================
// Helper: Log Settings Action
// ============================================

export async function logSettingsAction(
	action: 'update' | 'reset',
	details?: Record<string, any>
): Promise<void> {
	await createAuditLog({
		action: `settings.${action}` as any,
		category: 'settings',
		details,
	});
}

// ============================================
// Helper: Log Translation Action
// ============================================

export async function logTranslationAction(
	action: 'create' | 'update' | 'delete',
	resourceType: 'translation' | 'language',
	resourceId: string,
	details?: Record<string, any>
): Promise<void> {
	await createAuditLog({
		action: `${resourceType}.${action}` as any,
		category: 'translations',
		target_id: resourceId,
		target_type: resourceType,
		details,
	});
}

// ============================================
// Helper: Log Content Action
// ============================================

export async function logContentAction(
	action: 'delete' | 'restore',
	contentType: 'entry' | 'achievement',
	contentId: string,
	details?: Record<string, any>
): Promise<void> {
	await createAuditLog({
		action: `${contentType}.${action}` as any,
		category: 'content',
		target_id: contentId,
		target_type: contentType,
		details,
	});
}
