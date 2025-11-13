/**
 * AuditLogViewer Component
 *
 * Displays audit logs with filtering and pagination.
 *
 * @author UNITY Team
 * @date 2025-11-08
 */

import { Filter, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/shared/components/ui/select';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAuditLog } from '@/shared/hooks/useAuditLog';
import type { AuditLogCategory } from '@/shared/types/auditLog';

export function AuditLogViewer() {
	const [category, setCategory] = useState<AuditLogCategory | undefined>();
	const [limit, setLimit] = useState(50);

	const { logs, isLoading, error, refetch } = useAuditLog({ category, limit });

	// Format date
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat('ru-RU', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(date);
	};

	// Get badge color for category
	const getCategoryColor = (cat: AuditLogCategory) => {
		switch (cat) {
			case 'users':
				return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
			case 'settings':
				return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
			case 'system':
				return 'bg-red-500/10 text-red-500 border-red-500/20';
			case 'translations':
				return 'bg-green-500/10 text-green-500 border-green-500/20';
			case 'content':
				return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
			default:
				return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
		}
	};

	return (
		<Card className="border-border/40 bg-card transition-colors duration-300">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-foreground">Audit Log</CardTitle>
						<CardDescription className="text-muted-foreground">
							История критических действий в системе
						</CardDescription>
					</div>
					<Button onClick={refetch} size="sm" variant="outline">
						<RefreshCw className="mr-2 h-4 w-4" />
						Обновить
					</Button>
				</div>

				{/* Filters */}
				<div className="mt-4 flex gap-4">
					<Select value={category} onValueChange={(v) => setCategory(v as AuditLogCategory)}>
						<SelectTrigger className="w-[200px]">
							<Filter className="mr-2 h-4 w-4" />
							<SelectValue placeholder="Все категории" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Все категории</SelectItem>
							<SelectItem value="users">Пользователи</SelectItem>
							<SelectItem value="settings">Настройки</SelectItem>
							<SelectItem value="system">Система</SelectItem>
							<SelectItem value="translations">Переводы</SelectItem>
							<SelectItem value="content">Контент</SelectItem>
						</SelectContent>
					</Select>

					<Select value={limit.toString()} onValueChange={(v) => setLimit(parseInt(v, 10))}>
						<SelectTrigger className="w-[150px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="25">25 записей</SelectItem>
							<SelectItem value="50">50 записей</SelectItem>
							<SelectItem value="100">100 записей</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</CardHeader>

			<CardContent>
				{/* Loading State */}
				{isLoading && (
					<div className="space-y-3">
						{[...Array(5)].map((_, i) => (
							<Skeleton key={i} className="h-20 w-full" />
						))}
					</div>
				)}

				{/* Error State */}
				{error && (
					<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-500">
						<p className="font-medium">Ошибка загрузки</p>
						<p className="text-sm">{error}</p>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && !error && logs.length === 0 && (
					<div className="py-12 text-center text-muted-foreground">
						<p>Нет записей в журнале аудита</p>
					</div>
				)}

				{/* Logs List */}
				{!isLoading && !error && logs.length > 0 && (
					<div className="space-y-3">
						{logs.map((log) => (
							<div
								key={log.id}
								className="rounded-lg border border-border/40 bg-card/50 p-4 transition-colors duration-300 hover:bg-card"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										{/* Header */}
										<div className="mb-2 flex items-center gap-2">
											<Badge className={getCategoryColor(log.category)}>{log.category}</Badge>
											<span className="font-mono text-sm text-foreground">{log.action}</span>
										</div>

										{/* User Info */}
										<p className="text-sm text-muted-foreground">
											<span className="font-medium text-foreground">{log.user_email}</span>
											{log.ip_address && <span className="ml-2">• {log.ip_address}</span>}
										</p>

										{/* Details */}
										{log.details && Object.keys(log.details).length > 0 && (
											<div className="mt-2 rounded bg-muted/50 p-2">
												<pre className="text-xs text-muted-foreground">
													{JSON.stringify(log.details, null, 2)}
												</pre>
											</div>
										)}
									</div>

									{/* Timestamp */}
									<div className="ml-4 text-right">
										<p className="text-xs text-muted-foreground">{formatDate(log.created_at)}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
