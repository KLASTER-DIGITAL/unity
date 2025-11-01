import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { PushSupportInfo } from '@/shared/lib/pwa/pushNotificationSupport';

interface SupportStatusProps {
	supportInfo: PushSupportInfo;
	recommendations: string[];
}

export function SupportStatus({ supportInfo, recommendations }: SupportStatusProps) {
	return (
		<div
			className={`rounded-lg p-4 ${
				supportInfo.isSupported
					? 'bg-green-50 dark:bg-green-950/20'
					: 'bg-red-50 dark:bg-red-950/20'
			}`}
		>
			<div className="flex items-start gap-3">
				{supportInfo.isSupported ? (
					<CheckCircle className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
				) : (
					<XCircle className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-400" />
				)}
				<div className="flex-1 space-y-2">
					<div className="font-medium text-sm">
						{supportInfo.isSupported
							? '✅ Push Notifications поддерживаются'
							: '❌ Push Notifications не поддерживаются'}
					</div>

					<div className="space-y-1 text-xs">
						<div className="flex items-center gap-2">
							{supportInfo.features.serviceWorker ? (
								<CheckCircle className="h-3 w-3 text-green-600" />
							) : (
								<XCircle className="h-3 w-3 text-red-600" />
							)}
							<span>Service Worker API</span>
						</div>
						<div className="flex items-center gap-2">
							{supportInfo.features.pushManager ? (
								<CheckCircle className="h-3 w-3 text-green-600" />
							) : (
								<XCircle className="h-3 w-3 text-red-600" />
							)}
							<span>Push Manager API</span>
						</div>
						<div className="flex items-center gap-2">
							{supportInfo.features.notification ? (
								<CheckCircle className="h-3 w-3 text-green-600" />
							) : (
								<XCircle className="h-3 w-3 text-red-600" />
							)}
							<span>Notification API</span>
						</div>
					</div>

					{recommendations.length > 0 && (
						<div className="mt-3 space-y-1 rounded border border-blue-200 bg-blue-50 p-2 dark:border-blue-800 dark:bg-blue-950/20">
							<div className="flex items-center gap-1 font-medium text-xs text-blue-800 dark:text-blue-200">
								<AlertCircle className="h-3 w-3" />
								Рекомендации:
							</div>
							<ul className="space-y-1 text-blue-800 text-sm dark:text-blue-200">
								{recommendations.map((rec) => (
									<li key={rec}>{rec}</li>
								))}
							</ul>
						</div>
					)}

					{!supportInfo.isSupported && supportInfo.reason && (
						<div className="mt-2 text-red-700 text-xs dark:text-red-300">
							<strong>Причина:</strong> {supportInfo.reason}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
