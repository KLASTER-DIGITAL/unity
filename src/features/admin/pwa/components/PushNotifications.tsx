import { Bell, FileText, History, Send, TestTube } from 'lucide-react';
import { useState } from 'react';
import { PushNotificationManager } from '@/components/screens/admin/settings/PushNotificationManager';
import { PushNotificationTester } from '@/components/screens/admin/settings/PushNotificationTester';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

export function PushNotifications() {
	const [activeTab, setActiveTab] = useState('send');

	return (
		<div className="space-y-6">
			{/* Заголовок */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="flex items-center gap-2 font-bold text-2xl">
						<Bell className="h-6 w-6" />
						Push Notifications
					</h2>
					<p className="mt-1 text-muted-foreground text-sm">
						Управление push уведомлениями для пользователей
					</p>
				</div>
			</div>

			{/* Tabs */}
			<Tabs className="space-y-6" onValueChange={setActiveTab} value={activeTab}>
				<TabsList className="grid w-full max-w-2xl grid-cols-4">
					<TabsTrigger className="flex items-center gap-2" value="send">
						<Send className="h-4 w-4" />
						Отправить
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="test">
						<TestTube className="h-4 w-4" />
						Тестирование
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="history">
						<History className="h-4 w-4" />
						История
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="templates">
						<FileText className="h-4 w-4" />
						Шаблоны
					</TabsTrigger>
				</TabsList>

				{/* Send Push */}
				<TabsContent className="space-y-6" value="send">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Send className="h-5 w-5" />
								Отправка Push Уведомлений
							</CardTitle>
							<CardDescription>
								Отправить уведомление всем пользователям или выбранным сегментам
							</CardDescription>
						</CardHeader>
						<CardContent>
							<PushNotificationManager />
						</CardContent>
					</Card>
				</TabsContent>

				{/* Test Push */}
				<TabsContent className="space-y-6" value="test">
					<PushNotificationTester />
				</TabsContent>

				{/* History */}
				<TabsContent className="space-y-6" value="history">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<History className="h-5 w-5" />
								История отправок
							</CardTitle>
							<CardDescription>Все отправленные push уведомления</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="py-12 text-center text-muted-foreground">
								<History className="mx-auto mb-4 h-12 w-12 opacity-50" />
								<p>История отправок будет реализована в следующей версии</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Templates */}
				<TabsContent className="space-y-6" value="templates">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<FileText className="h-5 w-5" />
								Шаблоны уведомлений
							</CardTitle>
							<CardDescription>Мультиязычные шаблоны для разных типов уведомлений</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="py-12 text-center text-muted-foreground">
								<FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
								<p>Управление шаблонами будет реализовано в следующей версии</p>
								<p className="mt-2 text-sm">Сейчас используются встроенные шаблоны для 7 языков</p>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
