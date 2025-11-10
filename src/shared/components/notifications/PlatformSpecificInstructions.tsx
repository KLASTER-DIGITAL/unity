/**
 * Platform-Specific Instructions for Push Notifications
 *
 * Показывает инструкции для пользователя в зависимости от платформы
 */

import { AlertCircle, Chrome, MessageCircle, Smartphone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Button } from '@/shared/components/ui/button';
import { getPushPlatformInfo } from '@/shared/lib/notifications/platformDetection';

interface PlatformSpecificInstructionsProps {
	onClose?: () => void;
}

export function PlatformSpecificInstructions({ onClose }: PlatformSpecificInstructionsProps) {
	const platformInfo = getPushPlatformInfo();

	// Если поддерживается - не показываем инструкции
	if (platformInfo.pushSupported) {
		return null;
	}

	// iOS - требует установки PWA
	if (platformInfo.device === 'ios' && !platformInfo.isPWA) {
		return (
			<Alert className="border-orange-500/50 bg-orange-500/10">
				<Smartphone className="h-4 w-4 text-orange-500" />
				<AlertTitle className="text-orange-500">Установите приложение на iPhone</AlertTitle>
				<AlertDescription className="space-y-3 text-sm">
					<p>Для получения уведомлений на iOS необходимо установить приложение на Home Screen:</p>
					<ol className="ml-4 list-decimal space-y-2">
						<li>
							Нажмите кнопку <strong>"Поделиться"</strong> (квадрат со стрелкой вверх) внизу экрана
						</li>
						<li>
							Прокрутите вниз и выберите <strong>"На экран Домой"</strong>
						</li>
						<li>
							Нажмите <strong>"Добавить"</strong> в правом верхнем углу
						</li>
						<li>Откройте приложение через иконку на Home Screen</li>
					</ol>
					<p className="text-xs text-muted-foreground">
						После установки вернитесь в настройки и включите уведомления
					</p>
					{onClose && (
						<Button onClick={onClose} size="sm" variant="outline">
							Понятно
						</Button>
					)}
				</AlertDescription>
			</Alert>
		);
	}

	// iOS - старая версия
	if (platformInfo.pushSupportReason === 'ios_version_too_old') {
		return (
			<Alert className="border-red-500/50 bg-red-500/10">
				<AlertCircle className="h-4 w-4 text-red-500" />
				<AlertTitle className="text-red-500">Обновите iOS</AlertTitle>
				<AlertDescription className="space-y-3 text-sm">
					<p>Для поддержки уведомлений требуется iOS 16.4 или выше.</p>
					<p className="text-xs text-muted-foreground">
						Перейдите в Настройки → Основные → Обновление ПО
					</p>
					{onClose && (
						<Button onClick={onClose} size="sm" variant="outline">
							Понятно
						</Button>
					)}
				</AlertDescription>
			</Alert>
		);
	}

	// Telegram - используем Telegram Bot
	if (platformInfo.isTelegram) {
		return (
			<Alert className="border-blue-500/50 bg-blue-500/10">
				<MessageCircle className="h-4 w-4 text-blue-500" />
				<AlertTitle className="text-blue-500">Уведомления через Telegram</AlertTitle>
				<AlertDescription className="space-y-3 text-sm">
					<p>
						Вы открыли приложение в Telegram. Уведомления будут отправляться через Telegram Bot.
					</p>
					<p className="text-xs text-muted-foreground">
						Нажмите кнопку ниже чтобы подписаться на уведомления через бота
					</p>
					<Button size="sm" variant="default">
						<MessageCircle className="mr-2 h-4 w-4" />
						Подписаться через Telegram Bot
					</Button>
					{onClose && (
						<Button onClick={onClose} size="sm" variant="outline" className="ml-2">
							Позже
						</Button>
					)}
				</AlertDescription>
			</Alert>
		);
	}

	// Браузер не поддерживает
	if (
		platformInfo.pushSupportReason === 'service_worker_not_supported' ||
		platformInfo.pushSupportReason === 'push_manager_not_supported'
	) {
		return (
			<Alert className="border-red-500/50 bg-red-500/10">
				<Chrome className="h-4 w-4 text-red-500" />
				<AlertTitle className="text-red-500">Браузер не поддерживается</AlertTitle>
				<AlertDescription className="space-y-3 text-sm">
					<p>Ваш браузер не поддерживает push уведомления.</p>
					<p className="text-xs text-muted-foreground">
						Рекомендуем использовать Chrome, Firefox или Edge для получения уведомлений
					</p>
					{onClose && (
						<Button onClick={onClose} size="sm" variant="outline">
							Понятно
						</Button>
					)}
				</AlertDescription>
			</Alert>
		);
	}

	// Неизвестная ошибка
	return (
		<Alert className="border-yellow-500/50 bg-yellow-500/10">
			<AlertCircle className="h-4 w-4 text-yellow-500" />
			<AlertTitle className="text-yellow-500">Уведомления недоступны</AlertTitle>
			<AlertDescription className="space-y-3 text-sm">
				<p>К сожалению, push уведомления недоступны на вашем устройстве.</p>
				<p className="text-xs text-muted-foreground">Причина: {platformInfo.pushSupportReason}</p>
				{platformInfo.instructions && (
					<p className="text-xs text-muted-foreground">{platformInfo.instructions}</p>
				)}
				{onClose && (
					<Button onClick={onClose} size="sm" variant="outline">
						Понятно
					</Button>
				)}
			</AlertDescription>
		</Alert>
	);
}
