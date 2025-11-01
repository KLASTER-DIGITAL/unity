import { Monitor, Smartphone } from 'lucide-react';
import type { PushSupportInfo } from '@/shared/lib/pwa/pushNotificationSupport';

interface BrowserInfoProps {
	supportInfo: PushSupportInfo;
}

export function BrowserInfo({ supportInfo }: BrowserInfoProps) {
	return (
		<div className="space-y-3 rounded-lg bg-muted p-4">
			<div className="flex items-center gap-2 font-medium text-sm">
				{supportInfo.browserInfo.isMobile ? (
					<Smartphone className="h-4 w-4" />
				) : (
					<Monitor className="h-4 w-4" />
				)}
				Информация о браузере
			</div>

			<div className="grid grid-cols-2 gap-3 text-sm">
				<div>
					<span className="text-muted-foreground">Браузер:</span>
					<div className="font-medium">
						{supportInfo.browserInfo.name} {supportInfo.browserInfo.version}
					</div>
				</div>
				<div>
					<span className="text-muted-foreground">ОС:</span>
					<div className="font-medium">{supportInfo.browserInfo.os}</div>
				</div>
				<div>
					<span className="text-muted-foreground">Устройство:</span>
					<div className="font-medium">
						{supportInfo.browserInfo.isMobile ? 'Мобильное' : 'Десктоп'}
					</div>
				</div>
				<div>
					<span className="text-muted-foreground">PWA:</span>
					<div className="font-medium">{supportInfo.browserInfo.isPWA ? 'Да' : 'Нет'}</div>
				</div>
			</div>
		</div>
	);
}
