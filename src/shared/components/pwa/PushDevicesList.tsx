/**
 * Push Devices List Component
 * Displays all devices where user is subscribed to push notifications
 * Allows managing subscriptions per device
 */

import { Monitor, Smartphone, Tablet, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

type DeviceSubscription = {
	id: string;
	endpoint: string;
	browser_info: {
		browser: string;
		version?: string;
		os: string;
		deviceType: 'desktop' | 'mobile' | 'tablet';
		isMobile?: boolean;
	};
	is_active: boolean;
	created_at: string;
	last_used_at: string;
};

type PushDevicesListProps = {
	userId: string;
	currentEndpoint?: string | null;
	onDeviceRemoved?: () => void;
};

export function PushDevicesList({
	userId,
	currentEndpoint,
	onDeviceRemoved,
}: PushDevicesListProps) {
	const [devices, setDevices] = useState<DeviceSubscription[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [removingDeviceId, setRemovingDeviceId] = useState<string | null>(null);

	useEffect(() => {
		loadDevices();
	}, [userId]);

	const loadDevices = async () => {
		try {
			const supabase = createClient();
			const { data, error } = await supabase
				.from('push_subscriptions')
				.select('id, endpoint, browser_info, is_active, created_at, last_used_at')
				.eq('user_id', userId)
				.eq('is_active', true)
				.order('last_used_at', { ascending: false });

			if (error) throw error;

			setDevices(data || []);
		} catch (error) {
			console.error('[PushDevicesList] Error loading devices:', error);
			toast.error('Ошибка загрузки устройств');
		} finally {
			setIsLoading(false);
		}
	};

	const removeDevice = async (deviceId: string, endpoint: string) => {
		try {
			setRemovingDeviceId(deviceId);
			const supabase = createClient();

			// Деактивируем подписку в БД
			const { error } = await supabase
				.from('push_subscriptions')
				.update({ is_active: false })
				.eq('id', deviceId);

			if (error) throw error;

			toast.success('Устройство удалено');
			await loadDevices();
			onDeviceRemoved?.();
		} catch (error) {
			console.error('[PushDevicesList] Error removing device:', error);
			toast.error('Ошибка удаления устройства');
		} finally {
			setRemovingDeviceId(null);
		}
	};

	const getDeviceIcon = (deviceType: string) => {
		switch (deviceType) {
			case 'mobile':
				return <Smartphone className="h-5 w-5" />;
			case 'tablet':
				return <Tablet className="h-5 w-5" />;
			default:
				return <Monitor className="h-5 w-5" />;
		}
	};

	const getDeviceName = (device: DeviceSubscription) => {
		const { browser, version, os, deviceType } = device.browser_info;
		const type = deviceType === 'mobile' ? 'Mobile' : deviceType === 'tablet' ? 'Tablet' : 'PC';
		const browserName = browser || 'Unknown';
		const browserVersion = version ? ` ${version}` : '';
		return `${os} ${browserName}${browserVersion} (${type})`;
	};

	const getTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'только что';
		if (diffMins < 60) return `${diffMins} мин назад`;
		if (diffHours < 24) return `${diffHours} ч назад`;
		return `${diffDays} дн назад`;
	};

	const isCurrentDevice = (endpoint: string) => {
		return currentEndpoint && endpoint === currentEndpoint;
	};

	if (isLoading) {
		return (
			<div className="rounded-xl border border-border bg-card p-4">
				<p className="text-center text-muted-foreground text-footnote">Загрузка устройств...</p>
			</div>
		);
	}

	if (devices.length === 0) {
		return null;
	}

	return (
		<div className="space-y-3">
			<h4 className="font-semibold text-callout text-foreground">📱 Ваши устройства</h4>

			{devices.map((device) => (
				<div
					key={device.id}
					className="rounded-xl border border-border bg-card p-3 transition-colors duration-300"
				>
					<div className="flex items-start justify-between gap-3">
						<div className="flex items-start gap-3 flex-1">
							<div className="mt-0.5 text-muted-foreground">
								{getDeviceIcon(device.browser_info.deviceType)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2 flex-wrap">
									<p className="font-medium text-footnote text-foreground">
										{getDeviceName(device)}
									</p>
									{isCurrentDevice(device.endpoint) && (
										<span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary text-caption2">
											Это устройство
										</span>
									)}
								</div>
								<p className="mt-1 text-caption1 text-muted-foreground">
									Последнее использование: {getTimeAgo(device.last_used_at)}
								</p>
							</div>
						</div>

						{!isCurrentDevice(device.endpoint) && (
							<button
								className="rounded-lg p-2 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
								disabled={removingDeviceId === device.id}
								onClick={() => removeDevice(device.id, device.endpoint)}
								type="button"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						)}
					</div>
				</div>
			))}
		</div>
	);
}
