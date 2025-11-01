import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import {
	checkPushSupport,
	getPushRecommendations,
	type PushSupportInfo,
	sendTestNotification,
} from '@/shared/lib/pwa/pushNotificationSupport';
import { BrowserInfo } from './BrowserInfo';
import { SupportStatus } from './SupportStatus';
import { TestForm } from './TestForm';

export function PushNotificationTester() {
	const [supportInfo, setSupportInfo] = useState<PushSupportInfo | null>(null);
	const [recommendations, setRecommendations] = useState<string[]>([]);
	const [testTitle, setTestTitle] = useState('🎉 UNITY Diary');
	const [testBody, setTestBody] = useState('Это тестовое уведомление из админ-панели!');
	const [isSending, setIsSending] = useState(false);
	const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);

	useEffect(() => {
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
		} catch (error) {
			setLastResult('error');
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
				<BrowserInfo supportInfo={supportInfo} />
				<SupportStatus supportInfo={supportInfo} recommendations={recommendations} />
				<TestForm
					testTitle={testTitle}
					testBody={testBody}
					isSending={isSending}
					lastResult={lastResult}
					isSupported={supportInfo.isSupported}
					onTitleChange={setTestTitle}
					onBodyChange={setTestBody}
					onSendTest={handleSendTest}
				/>
			</CardContent>
		</Card>
	);
}
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
