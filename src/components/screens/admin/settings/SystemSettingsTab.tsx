"use client";

import {
	Activity,
	AlertCircle,
	Database,
	HardDrive,
	Info,
	Monitor,
	RotateCw,
	Server,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { createClient } from "@/utils/supabase/client";

interface SystemStatus {
	database: "online" | "offline" | "checking";
	api: "online" | "offline" | "checking";
	storage: "online" | "offline" | "checking";
}

export const SystemSettingsTab: React.FC = () => {
	const [systemStatus, setSystemStatus] = useState<SystemStatus>({
		database: "checking",
		api: "checking",
		storage: "checking",
	});

	const [isCheckingStatus, setIsCheckingStatus] = useState(true);

	useEffect(() => {
		checkSystemStatus();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const checkSystemStatus = async () => {
		setIsCheckingStatus(true);
		try {
			const supabase = createClient();

			// Check database status by trying to query
			const { error: dbError } = await supabase
				.from("profiles")
				.select("id")
				.limit(1);

			// Check API status by checking session
			const {
				data: { session },
				error: apiError,
			} = await supabase.auth.getSession();

			// Check storage status by trying to list buckets
			const { error: storageError } = await supabase.storage.listBuckets();

			setSystemStatus({
				database: dbError ? "offline" : "online",
				api: apiError || !session ? "offline" : "online",
				storage: storageError ? "offline" : "online",
			});

			toast.success("Статус системы обновлен");
		} catch (error: any) {
			console.error("Error checking system status:", error);
			toast.error(`Ошибка проверки статуса: ${error.message}`);
			setSystemStatus({
				database: "offline",
				api: "offline",
				storage: "offline",
			});
		} finally {
			setIsCheckingStatus(false);
		}
	};

	const handleRefreshStatus = () => {
		checkSystemStatus();
	};

	const handleBackupDatabase = async () => {
		try {
			const supabase = createClient();

			// Get database stats for backup info
			const { count: usersCount } = await supabase
				.from("profiles")
				.select("*", { count: "exact", head: true });

			const { count: entriesCount } = await supabase
				.from("entries")
				.select("*", { count: "exact", head: true });

			toast.info(
				`База данных содержит ${usersCount} пользователей и ${entriesCount} записей. Резервное копирование доступно через Supabase Dashboard.`,
				{
					duration: 5000,
				},
			);
		} catch (error: any) {
			console.error("Error getting backup info:", error);
			toast.error(`Ошибка: ${error.message}`);
		}
	};

	return (
		<div className="space-y-8">
			{/* Заголовок раздела */}
			<div className="flex items-center justify-between border-b pb-4">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-primary/10 p-2">
						<Monitor className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h2 className="font-bold text-2xl">Системные настройки</h2>
						<p className="text-muted-foreground text-sm">
							Мониторинг и управление системными ресурсами
						</p>
					</div>
				</div>
				<Button
					disabled={isCheckingStatus}
					onClick={handleRefreshStatus}
					size="sm"
					variant="outline"
				>
					<RotateCw
						className={`mr-2 h-4 w-4 ${isCheckingStatus ? "animate-spin" : ""}`}
					/>
					Обновить статус
				</Button>
			</div>

			{/* Info Alert */}
			<Alert>
				<Info className="h-4 w-4" />
				<AlertTitle>Информация о системных метриках</AlertTitle>
				<AlertDescription>
					Детальные метрики производительности (CPU, Memory, Disk) доступны
					через Supabase Dashboard. Здесь отображается статус основных сервисов
					и информация о базе данных.
				</AlertDescription>
			</Alert>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Статус системы */}
				<div className="space-y-6 lg:col-span-2">
					{/* Статус сервисов */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5" />
								Статус системы
							</CardTitle>
							<CardDescription>
								Мониторинг состояния основных сервисов
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
								<div
									className={`relative overflow-hidden rounded-lg border p-6 ${
										systemStatus.database === "online"
											? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
											: systemStatus.database === "checking"
												? "border-border bg-muted dark:border-gray-800 dark:bg-gray-950/20"
												: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
									}`}
								>
									<div className="absolute top-2 right-2">
										<div
											className={`h-3 w-3 rounded-full ${
												systemStatus.database === "online"
													? "bg-green-500"
													: systemStatus.database === "checking"
														? "animate-pulse bg-muted0"
														: "bg-red-500"
											}`}
										/>
									</div>
									<div className="text-center">
										<Database
											className={`mx-auto mb-2 h-12 w-12 ${
												systemStatus.database === "online"
													? "text-green-600 dark:text-green-500"
													: systemStatus.database === "checking"
														? "text-muted-foreground dark:text-muted-foreground"
														: "text-red-600 dark:text-red-500"
											}`}
										/>
										<div className="mb-1 font-medium">База данных</div>
										<div className="mb-3 text-muted-foreground text-sm">
											PostgreSQL
										</div>
										<Badge
											variant={
												systemStatus.database === "online"
													? "success"
													: systemStatus.database === "checking"
														? "outline"
														: "destructive"
											}
										>
											{systemStatus.database === "online"
												? "Работает"
												: systemStatus.database === "checking"
													? "Проверка..."
													: "Недоступна"}
										</Badge>
									</div>
								</div>

								<div
									className={`relative overflow-hidden rounded-lg border p-6 ${
										systemStatus.api === "online"
											? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
											: systemStatus.api === "checking"
												? "border-border bg-muted dark:border-gray-800 dark:bg-gray-950/20"
												: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
									}`}
								>
									<div className="absolute top-2 right-2">
										<div
											className={`h-3 w-3 rounded-full ${
												systemStatus.api === "online"
													? "bg-blue-500"
													: systemStatus.api === "checking"
														? "animate-pulse bg-muted0"
														: "bg-red-500"
											}`}
										/>
									</div>
									<div className="text-center">
										<Server
											className={`mx-auto mb-2 h-12 w-12 ${
												systemStatus.api === "online"
													? "text-blue-600 dark:text-blue-500"
													: systemStatus.api === "checking"
														? "text-muted-foreground dark:text-muted-foreground"
														: "text-red-600 dark:text-red-500"
											}`}
										/>
										<div className="mb-1 font-medium">API</div>
										<div className="mb-3 text-muted-foreground text-sm">
											Edge Functions
										</div>
										<Badge
											variant={
												systemStatus.api === "online"
													? "default"
													: systemStatus.api === "checking"
														? "outline"
														: "destructive"
											}
										>
											{systemStatus.api === "online"
												? "Работает"
												: systemStatus.api === "checking"
													? "Проверка..."
													: "Недоступен"}
										</Badge>
									</div>
								</div>

								<div
									className={`relative overflow-hidden rounded-lg border p-6 ${
										systemStatus.storage === "online"
											? "border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20"
											: systemStatus.storage === "checking"
												? "border-border bg-muted dark:border-gray-800 dark:bg-gray-950/20"
												: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
									}`}
								>
									<div className="absolute top-2 right-2">
										<div
											className={`h-3 w-3 rounded-full ${
												systemStatus.storage === "online"
													? "bg-purple-500"
													: systemStatus.storage === "checking"
														? "animate-pulse bg-muted0"
														: "bg-red-500"
											}`}
										/>
									</div>
									<div className="text-center">
										<HardDrive
											className={`mx-auto mb-2 h-12 w-12 ${
												systemStatus.storage === "online"
													? "text-purple-600 dark:text-purple-500"
													: systemStatus.storage === "checking"
														? "text-muted-foreground dark:text-muted-foreground"
														: "text-red-600 dark:text-red-500"
											}`}
										/>
										<div className="mb-1 font-medium">Хранилище</div>
										<div className="mb-3 text-muted-foreground text-sm">
											Supabase Storage
										</div>
										<Badge
											variant={
												systemStatus.storage === "online"
													? "default"
													: systemStatus.storage === "checking"
														? "outline"
														: "destructive"
											}
										>
											{systemStatus.storage === "online"
												? "Работает"
												: systemStatus.storage === "checking"
													? "Проверка..."
													: "Недоступно"}
										</Badge>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Управление базой данных */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								Управление базой данных
							</CardTitle>
							<CardDescription>
								Резервное копирование и восстановление
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<Button
								className="w-full"
								onClick={handleBackupDatabase}
								variant="default"
							>
								<Database className="mr-2 h-4 w-4" />
								Информация о резервном копировании
							</Button>

							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Резервное копирование</AlertTitle>
								<AlertDescription className="text-sm">
									Автоматическое резервное копирование настроено через Supabase.
									Для ручного создания резервной копии используйте Supabase
									Dashboard.
								</AlertDescription>
							</Alert>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Дополнительная информация */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="h-5 w-5" />
						Дополнительная информация
					</CardTitle>
					<CardDescription>Полезные ссылки и ресурсы</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="rounded-lg bg-muted p-4">
							<div className="mb-2 font-medium">Supabase Dashboard</div>
							<p className="mb-3 text-muted-foreground text-sm">
								Для доступа к детальным метрикам производительности, логам и
								настройкам используйте Supabase Dashboard.
							</p>
							<Button
								onClick={() =>
									window.open(
										"https://supabase.com/dashboard/project/ecuwuzqlwdkkdncampnc",
										"_blank",
									)
								}
								size="sm"
								variant="outline"
							>
								Открыть Dashboard
							</Button>
						</div>

						<div className="rounded-lg bg-muted p-4">
							<div className="mb-2 font-medium">Документация</div>
							<p className="mb-3 text-muted-foreground text-sm">
								Подробная документация по управлению проектом и настройке
								системы.
							</p>
							<Button
								onClick={() =>
									window.open("https://supabase.com/docs", "_blank")
								}
								size="sm"
								variant="outline"
							>
								Открыть документацию
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Управление сервисами - УДАЛЕНО */}
			{/* Перезапуск сервисов недоступен через API */}
			<Card className="hidden">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Server className="h-5 w-5" />
						Управление сервисами
					</CardTitle>
					<CardDescription>
						Перезапуск и обслуживание системных компонентов
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
						<Button disabled={true} onClick={() => {}} variant="default">
							Disabled
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Старая секция резервного копирования - УДАЛЕНО */}
			<Card className="hidden">
				<CardHeader>
					<CardTitle>Резервное копирование</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="rounded-lg border bg-muted p-4">
						<div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
							<div>
								<div className="mb-1 font-medium">Последняя копия</div>
								<div className="text-muted-foreground text-sm">Недоступно</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};
