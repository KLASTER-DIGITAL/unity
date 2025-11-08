/**
 * useAuditLog Hook
 *
 * React hook for fetching and managing audit logs.
 *
 * @author UNITY Team
 * @date 2025-11-08
 */

import { useEffect, useState } from 'react';
import { getAuditLogs } from '@/shared/lib/api/services/auditLog';
import type { AuditLogEntry, AuditLogFilters } from '@/shared/types/auditLog';

interface UseAuditLogResult {
	logs: AuditLogEntry[];
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

export function useAuditLog(filters?: AuditLogFilters): UseAuditLogResult {
	const [logs, setLogs] = useState<AuditLogEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchLogs = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const data = await getAuditLogs(filters);
			setLogs(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchLogs();
	}, [filters?.category, filters?.action, filters?.user_id, filters?.limit, filters?.offset]);

	return {
		logs,
		isLoading,
		error,
		refetch: fetchLogs,
	};
}
