import { Activity, AlertCircle, CheckCircle, Clock, RefreshCw, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { toast } from '@/shared/components/ui/universal/Toast';

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

type HealthCheck = {
	status: 'ok' | 'error';
	message: string;
	jobs?: Array<{ name: string; schedule: string; active: boolean }>;
	webhooks?: Array<{ name: string; table: string }>;
};

type HealthCheckResponse = {
	status: HealthStatus;
	checks: {
		vapid_keys?: HealthCheck;
		service_role_key?: HealthCheck;
		cron_jobs?: HealthCheck;
		webhooks?: HealthCheck;
	};
	timestamp: string;
};

export function PushMonitoringTab() {
	const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [lastChecked, setLastChecked] = useState<Date | null>(null);

	const checkHealth = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await fetch(
				'https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/push-health-check'
			);

			if (!response.ok) {
				throw new Error('Failed to fetch health status');
			}

			const data: HealthCheckResponse = await response.json();
			setHealthData(data);
			setLastChecked(new Date());
			toast.success('Статус обновлен');
		} catch (error) {
			console.error('Error checking health:', error);
			toast.error('Ошибка проверки статуса');
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		checkHealth();
	}, [checkHealth]);

	const getStatusIcon = (status: 'ok' | 'error') => {
		return status === 'ok' ? (
			<CheckCircle className="h-5 w-5 text-green-500" />
		) : (
			<XCircle className="h-5 w-5 text-red-500" />
		);
	};

	const getOverallStatusColor = (status: HealthStatus) => {
		switch (status) {
			case 'healthy':
				return 'text-green-500';
			case 'degraded':
				return 'text-yellow-500';
			case 'unhealthy':
				return 'text-red-500';
			default:
				return 'text-gray-500';
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold">Push System Monitoring</h2>
					<p className="text-muted-foreground">Мониторинг состояния push-уведомлений и cron jobs</p>
				</div>
				<Button onClick={checkHealth} disabled={isLoading} size="sm">
					<RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
					Обновить
				</Button>
			</div>

			{/* Overall Status */}
			{healthData && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Activity className="h-6 w-6" />
								<div>
									<CardTitle>Общий статус</CardTitle>
									<CardDescription>
										{lastChecked &&
											`Последняя проверка: ${lastChecked.toLocaleTimeString('ru-RU')}`}
									</CardDescription>
								</div>
							</div>
							<div className={`text-2xl font-bold ${getOverallStatusColor(healthData.status)}`}>
								{healthData.status.toUpperCase()}
							</div>
						</div>
					</CardHeader>
				</Card>
			)}

			{/* Health Checks */}
			{healthData && (
				<div className="grid gap-4 md:grid-cols-2">
					{/* VAPID Keys */}
					{healthData.checks.vapid_keys && (
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">VAPID Keys</CardTitle>
									{getStatusIcon(healthData.checks.vapid_keys.status)}
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									{healthData.checks.vapid_keys.message}
								</p>
							</CardContent>
						</Card>
					)}

					{/* Service Role Key */}
					{healthData.checks.service_role_key && (
						<Card>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="text-base">Service Role Key</CardTitle>
									{getStatusIcon(healthData.checks.service_role_key.status)}
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									{healthData.checks.service_role_key.message}
								</p>
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{/* Cron Jobs */}
			{healthData?.checks.cron_jobs && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Clock className="h-5 w-5" />
								<div>
									<CardTitle>Cron Jobs</CardTitle>
									<CardDescription>{healthData.checks.cron_jobs.message}</CardDescription>
								</div>
							</div>
							{getStatusIcon(healthData.checks.cron_jobs.status)}
						</div>
					</CardHeader>
					<CardContent>
						{healthData.checks.cron_jobs.jobs && healthData.checks.cron_jobs.jobs.length > 0 ? (
							<div className="space-y-2">
								{healthData.checks.cron_jobs.jobs.map((job) => (
									<div
										key={job.name}
										className="flex items-center justify-between rounded-lg border p-3"
									>
										<div>
											<p className="font-medium">{job.name}</p>
											<p className="text-sm text-muted-foreground">{job.schedule}</p>
										</div>
										{job.active ? (
											<CheckCircle className="h-4 w-4 text-green-500" />
										) : (
											<XCircle className="h-4 w-4 text-red-500" />
										)}
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">Нет активных cron jobs</p>
						)}
					</CardContent>
				</Card>
			)}

			{/* Webhooks */}
			{healthData?.checks.webhooks && (
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<AlertCircle className="h-5 w-5" />
								<div>
									<CardTitle>Database Webhooks</CardTitle>
									<CardDescription>{healthData.checks.webhooks.message}</CardDescription>
								</div>
							</div>
							{getStatusIcon(healthData.checks.webhooks.status)}
						</div>
					</CardHeader>
					<CardContent>
						{healthData.checks.webhooks.webhooks &&
						healthData.checks.webhooks.webhooks.length > 0 ? (
							<div className="space-y-2">
								{healthData.checks.webhooks.webhooks.map((webhook, index) => (
									<div
										key={`${webhook.name}-${index}`}
										className="flex items-center justify-between rounded-lg border p-3"
									>
										<div>
											<p className="font-medium">{webhook.name}</p>
											<p className="text-sm text-muted-foreground">Table: {webhook.table}</p>
										</div>
										<CheckCircle className="h-4 w-4 text-green-500" />
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">Нет активных webhooks</p>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
