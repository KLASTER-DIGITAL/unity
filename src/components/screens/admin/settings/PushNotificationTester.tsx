import { AlertCircle, Bell, CheckCircle, Monitor, Smartphone, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
	checkPushSupport,
	getPushRecommendations,
	type PushSupportInfo,
	sendTestNotification,
} from '@/shared/lib/pwa/pushNotificationSupport';

/**
 * Компонент для тестирования Push Notifications
 * Показывает поддержку браузера и позволяет отправить тестовое уведомление
 */
export function PushNotificationTester() {
	const [supportInfo, setSupportInfo] = useState<PushSupportInfo | null>(null);
	const [recommendations, setRecommendations] = useState<string[]>([]);
	const [testTitle, setTestTitle] = useState('🎉 UNITY Diary');
	const [testBody, setTestBody] = useState('Это тестовое уведомление из админ-панели!');
	const [isSending, setIsSending] = useState(false);
	const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);

	useEffect(() => {
		// Проверяем поддержку при монтировании
		const info = checkPushSupport();
		setSupportInfo(info);
		setRecommendations(getPushRecommendations());
	}, []);

	const handleSendTest = async () => {
		setIsSending(true);
		setLastResult(null);

		try {
			await sendTestNotification(testTitle, testBody);
			setLastResult('success');
			console.log('[PushTester] Test notification sent successfully');
		} catch (error) {
			setLastResult('error');
			console.error('[PushTester] Failed to send test notification:', error);
			alert(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
		} finally {
			setIsSending(false);
		}
	};

	if (!supportInfo) {
		return (
			<Card>
				<CardContent className="p-6">
					<div className="text-center text-muted-foreground">Загрузка информации о браузере...</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card
			className={
				supportInfo.isSupported
					? 'border-green-200 dark:border-green-800'
					: 'border-red-200 dark:border-red-800'
			}
		>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Bell className="h-5 w-5" />
					Тестирование Push Notifications
				</CardTitle>
				<CardDescription>
					Проверка поддержки браузера и отправка тестовых уведомлений
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Информация о браузере */}
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
							<span className="text-muted-foreground">Тип:</span>
							<div className="font-medium">
								{supportInfo.browserInfo.isMobile ? 'Мобильный' : 'Десктоп'}
							</div>
						</div>
						<div>
							<span className="text-muted-foreground">Поддержка:</span>
							<div
								className={`font-medium ${supportInfo.isSupported ? 'text-green-600' : 'text-red-600'}`}
							>
								{supportInfo.isSupported ? '✅ Поддерживается' : '❌ Не поддерживается'}
							</div>
						</div>
					</div>
				</div>

				{/* Детали поддержки API */}
				<div className="space-y-2">
					<div className="font-medium text-sm">Поддержка API:</div>
					<div className="grid grid-cols-2 gap-2 text-sm">
						<div className="flex items-center gap-2">
							{supportInfo.features.serviceWorker ? (
								<CheckCircle className="h-4 w-4 text-green-600" />
							) : (
								<XCircle className="h-4 w-4 text-red-600" />
							)}
							Service Worker
						</div>
						<div className="flex items-center gap-2">
							{supportInfo.features.pushManager ? (
								<CheckCircle className="h-4 w-4 text-green-600" />
							) : (
								<XCircle className="h-4 w-4 text-red-600" />
							)}
							Push Manager
						</div>
						<div className="flex items-center gap-2">
							{supportInfo.features.notifications ? (
								<CheckCircle className="h-4 w-4 text-green-600" />
							) : (
								<XCircle className="h-4 w-4 text-red-600" />
							)}
							Notifications API
						</div>
						<div className="flex items-center gap-2">
							{supportInfo.features.permissions ? (
								<CheckCircle className="h-4 w-4 text-green-600" />
							) : (
								<XCircle className="h-4 w-4 text-red-600" />
							)}
							Permissions API
						</div>
					</div>
				</div>

				{/* Рекомендации */}
				{recommendations.length > 0 && (
					<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
						<div className="mb-2 flex items-start gap-2">
							<AlertCircle className="mt-0.5 h-5 w-5 text-blue-600" />
							<div className="font-medium text-blue-900 text-sm dark:text-blue-100">
								Рекомендации:
							</div>
						</div>
						<ul className="space-y-1 text-blue-800 text-sm dark:text-blue-200">
							{recommendations.map((rec) => (
								<li key={rec}>{rec}</li>
							))}
						</ul>
					</div>
				)}

				{/* Причина неподдержки */}
				{!supportInfo.isSupported && supportInfo.reason && (
					<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
						<div className="flex items-start gap-2">
							<XCircle className="mt-0.5 h-5 w-5 text-red-600" />
							<div className="text-red-800 text-sm dark:text-red-200">{supportInfo.reason}</div>
						</div>
					</div>
				)}

				{/* Форма тестового уведомления */}
				{supportInfo.isSupported && (
					<div className="space-y-4 border-t pt-4">
						<div className="font-medium text-sm">Отправить тестовое уведомление:</div>

						<div className="space-y-3">
							<div>
								<Label htmlFor="test-title">Заголовок</Label>
								<Input
									id="test-title"
									onChange={(e) => setTestTitle(e.target.value)}
									placeholder="Заголовок уведомления"
									value={testTitle}
								/>
							</div>

							<div>
								<Label htmlFor="test-body">Текст</Label>
								<Input
									id="test-body"
									onChange={(e) => setTestBody(e.target.value)}
									placeholder="Текст уведомления"
									value={testBody}
								/>
							</div>

							<Button
								className="w-full"
								disabled={isSending || !testTitle || !testBody}
								onClick={handleSendTest}
							>
								{isSending ? 'Отправка...' : '📤 Отправить тестовое уведомление'}
							</Button>

							{lastResult === 'success' && (
								<div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
									<div className="flex items-center gap-2 text-green-800 text-sm dark:text-green-200">
										<CheckCircle className="h-4 w-4" />
										Уведомление успешно отправлено!
									</div>
								</div>
							)}

							{lastResult === 'error' && (
								<div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
									<div className="flex items-center gap-2 text-red-800 text-sm dark:text-red-200">
										<XCircle className="h-4 w-4" />
										Ошибка при отправке уведомления
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Превью уведомления */}
				{supportInfo.isSupported && (
					<div className="rounded-lg border bg-muted p-4">
						<div className="mb-3 font-medium text-sm">📱 Превью уведомления:</div>
						<div className="max-w-sm rounded-lg bg-background p-4 shadow-lg">
							<div className="flex items-start gap-3">
								<img
									alt="App icon"
									className="h-10 w-10 rounded"
									onError={(e) => {
										(e.target as HTMLImageElement).src =
											'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%234F46E5"/></svg>';
									}}
									src="/icon-96x96.png"
								/>
								<div className="min-w-0 flex-1">
									<div className="truncate font-medium text-sm">{testTitle || 'Заголовок'}</div>
									<div className="mt-1 text-muted-foreground text-sm">
										{testBody || 'Текст уведомления'}
									</div>
									<div className="mt-2 text-muted-foreground text-xs">Сейчас</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
