'use client';

import { RotateCw } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { BackupCard } from './BackupCard';
import { StatusCard } from './StatusCard';
import { SystemInfoCard } from './SystemInfoCard';

interface SystemStatus {
	database: 'online' | 'offline' | 'checking';
	api: 'online' | 'offline' | 'checking';
	storage: 'online' | 'offline' | 'checking';
}

export const SystemSettingsTab: React.FC = () => {
	const [systemStatus, setSystemStatus] = useState<SystemStatus>({
		database: 'checking',
		api: 'checking',
		storage: 'checking',
	});

	const [isCheckingStatus, setIsCheckingStatus] = useState(true);

	const checkSystemStatus = useCallback(async () => {
		setIsCheckingStatus(true);
		try {
			const supabase = createClient();

			const { error: dbError } = await supabase.from('profiles').select('id').limit(1);

			const {
				data: { session },
				error: apiError,
			} = await supabase.auth.getSession();

			const { error: storageError } = await supabase.storage.listBuckets();

			setSystemStatus({
				database: dbError ? 'offline' : 'online',
				api: apiError || !session ? 'offline' : 'online',
				storage: storageError ? 'offline' : 'online',
			});

			toast.success('Статус системы обновлен');
		} catch (error) {
			console.error('Error checking system status:', error);
			toast.error(
				`Ошибка проверки статуса: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
			);
			setSystemStatus({
				database: 'offline',
				api: 'offline',
				storage: 'offline',
			});
		} finally {
			setIsCheckingStatus(false);
		}
	}, []);

	useEffect(() => {
		checkSystemStatus();
	}, [checkSystemStatus]);

	const handleRefreshStatus = () => {
		checkSystemStatus();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="font-semibold text-2xl">Системные настройки</h2>
					<p className="text-muted-foreground text-sm">Управление системными параметрами</p>
				</div>
				<Button onClick={handleRefreshStatus} disabled={isCheckingStatus} variant="outline">
					<RotateCw className={`mr-2 h-4 w-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
					Обновить статус
				</Button>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<StatusCard systemStatus={systemStatus} />
				<BackupCard />
			</div>

			<SystemInfoCard />
		</div>
	);
};
