import { HardDrive } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { createClient } from '@/utils/supabase/client';

export function BackupCard() {
	const handleBackupDatabase = async () => {
		try {
			const supabase = createClient();

			// Get database stats for backup info
			const { count: usersCount } = await supabase
				.from('profiles')
				.select('*', { count: 'exact', head: true });

			const { count: entriesCount } = await supabase
				.from('entries')
				.select('*', { count: 'exact', head: true });

			toast.success(
				`Информация о базе данных:\n- Пользователей: ${usersCount || 0}\n- Записей: ${entriesCount || 0}`,
				{
					duration: 5000,
				}
			);
		} catch (error) {
			console.error('Error getting backup info:', error);
			toast.error(`Ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<HardDrive className="h-5 w-5" />
					Резервное копирование
				</CardTitle>
				<CardDescription>Управление резервными копиями базы данных</CardDescription>
			</CardHeader>
			<CardContent>
				<Button onClick={handleBackupDatabase} variant="outline" className="w-full">
					Получить информацию о БД
				</Button>
			</CardContent>
		</Card>
	);
}
