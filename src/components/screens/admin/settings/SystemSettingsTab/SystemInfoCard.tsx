import { Activity, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';

export function SystemInfoCard() {
	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Activity className="h-5 w-5" />
						Информация о системе
					</CardTitle>
					<CardDescription>Общая информация о системе</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					<div className="flex justify-between">
						<span className="text-muted-foreground">Версия</span>
						<span className="font-medium">1.0.0</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Окружение</span>
						<span className="font-medium">Production</span>
					</div>
					<div className="flex justify-between">
						<span className="text-muted-foreground">Регион</span>
						<span className="font-medium">EU-West</span>
					</div>
				</CardContent>
			</Card>

			<Alert>
				<Info className="h-4 w-4" />
				<AlertTitle>Информация</AlertTitle>
				<AlertDescription>
					Системные настройки позволяют управлять основными параметрами приложения. Будьте осторожны
					при изменении критических настроек.
				</AlertDescription>
			</Alert>
		</>
	);
}
