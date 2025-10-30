"use client";

import {
	Activity,
	AlertCircle,
	CheckCircle,
	Info,
	MessageCircle,
	RotateCcw,
	Users,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { createClient } from "@/utils/supabase/client";

interface TelegramStats {
	totalUsers: number;
	telegramUsers: number;
	lastActivity: string | null;
}

interface BotInfo {
	username: string;
	domain: string;
	tokenMasked: string;
}

export function TelegramSettingsTab() {
	const [isConfigured, setIsConfigured] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingStats, setIsLoadingStats] = useState(true);
	const [telegramStats, setTelegramStats] = useState<TelegramStats>({
		totalUsers: 0,
		telegramUsers: 0,
		lastActivity: null,
	});
	const [botInfo, setBotInfo] = useState<BotInfo>({
		username: "@diary_bookai_bot",
		domain: "unity-wine.vercel.app",
		tokenMasked: "8297834785:******AQbo",
	});

	useEffect(() => {
		loadTelegramSettings();
		loadTelegramStats();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadTelegramSettings = async () => {
		try {
			const supabase = createClient();

			// Check if telegram-auth Edge Function exists by trying to call it
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				setIsConfigured(false);
				return;
			}

			// Try to check Telegram integration status
			// Note: This requires telegram-auth Edge Function to be deployed
			const response = await fetch(
				"https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/telegram-auth",
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${session.access_token}`,
					},
				},
			);

			if (response.ok) {
				const data = await response.json();
				setIsConfigured(data.connected);
				if (data.botUsername)
					setBotInfo((prev) => ({ ...prev, username: data.botUsername }));
				if (data.domain)
					setBotInfo((prev) => ({ ...prev, domain: data.domain }));
			} else {
				// Edge Function not available or not configured
				setIsConfigured(false);
			}
		} catch (error) {
			console.error("Error loading Telegram settings:", error);
			setIsConfigured(false);
		}
	};

	const loadTelegramStats = async () => {
		setIsLoadingStats(true);
		try {
			const supabase = createClient();

			const { data: profiles, error } = await supabase
				.from("profiles")
				.select("id, telegram_id, created_at, updated_at");

			if (error) throw error;

			if (profiles) {
				const telegramUsers = profiles.filter((p) => p.telegram_id).length;
				const lastActivity = profiles
					.filter((p) => p.telegram_id)
					.sort(
						(a, b) =>
							new Date(b.updated_at).getTime() -
							new Date(a.updated_at).getTime(),
					)[0];

				setTelegramStats({
					totalUsers: profiles.length,
					telegramUsers,
					lastActivity: lastActivity?.updated_at || null,
				});
			}
		} catch (error: any) {
			console.error("Error loading Telegram stats:", error);
			toast.error(`Ошибка загрузки статистики: ${error.message}`);
		} finally {
			setIsLoadingStats(false);
		}
	};

	const testTelegramIntegration = async () => {
		setIsLoading(true);
		try {
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				toast.error("Необходимо войти в систему");
				return;
			}

			// Try to check Telegram integration
			const response = await fetch(
				"https://ecuwuzqlwdkkdncampnc.supabase.co/functions/v1/telegram-auth",
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${session.access_token}`,
					},
				},
			);

			if (response.ok) {
				const data = await response.json();
				if (data.connected) {
					toast.success("Интеграция с Telegram активна ✅");
					setIsConfigured(true);
				} else {
					toast.warning(
						"Интеграция с Telegram не настроена. Проверьте переменные окружения.",
					);
					setIsConfigured(false);
				}
			} else {
				toast.error(
					"Edge Function telegram-auth не найдена. Разверните её для работы с Telegram.",
				);
				setIsConfigured(false);
			}
		} catch (error: any) {
			console.error("Error testing Telegram integration:", error);
			toast.error(`Ошибка тестирования: ${error.message}`);
			setIsConfigured(false);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-8">
			{/* Заголовок раздела */}
			<div className="flex items-center justify-between border-b pb-4">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-primary/10 p-2">
						<MessageCircle className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h2 className="font-bold text-2xl">Настройки Telegram</h2>
						<p className="text-muted-foreground text-sm">
							Интеграция с Telegram Mini App
						</p>
					</div>
				</div>
				<Button
					disabled={isLoading}
					onClick={testTelegramIntegration}
					size="sm"
					variant="outline"
				>
					<RotateCcw
						className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
					/>
					Проверить интеграцию
				</Button>
			</div>

			{/* Info Alert */}
			<Alert>
				<Info className="h-4 w-4" />
				<AlertTitle>Информация о Telegram интеграции</AlertTitle>
				<AlertDescription>
					UNITY-v2 - это PWA приложение, НЕ Telegram Mini App. Telegram
					интеграция используется только для авторизации через Telegram. Для
					полноценной работы требуется развернуть Edge Function telegram-auth.
				</AlertDescription>
			</Alert>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Статус интеграции */}
				<div className="space-y-6 lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Activity className="h-5 w-5" />
								Статус интеграции
							</CardTitle>
							<CardDescription>
								Текущее состояние Telegram интеграции
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="flex items-center gap-3 rounded-lg bg-muted p-4">
								{isConfigured ? (
									<CheckCircle className="h-6 w-6 text-green-500" />
								) : (
									<XCircle className="h-6 w-6 text-red-500" />
								)}
								<div>
									<div className="font-medium">
										{isConfigured
											? "Интеграция активна"
											: "Требуется настройка"}
									</div>
									<div className="text-muted-foreground text-sm">
										{isConfigured
											? "Telegram бот настроен и работает корректно"
											: "Необходимо настроить переменные окружения и развернуть Edge Function"}
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Статистика пользователей */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5" />
								Статистика пользователей
							</CardTitle>
							<CardDescription>
								Количество пользователей с Telegram авторизацией
							</CardDescription>
						</CardHeader>
						<CardContent>
							{isLoadingStats ? (
								<div className="flex items-center justify-center py-12">
									<RotateCcw className="h-6 w-6 animate-spin text-muted-foreground" />
								</div>
							) : (
								<>
									<div className="mb-4 grid grid-cols-2 gap-4">
										<div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center dark:border-blue-800 dark:bg-blue-950/20">
											<div className="mb-2 font-bold text-3xl text-blue-600 dark:text-blue-500">
												{telegramStats.totalUsers}
											</div>
											<div className="text-muted-foreground text-sm">
												Всего пользователей
											</div>
										</div>
										<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center dark:border-green-800 dark:bg-green-950/20">
											<div className="mb-2 font-bold text-3xl text-green-600 dark:text-green-500">
												{telegramStats.telegramUsers}
											</div>
											<div className="text-muted-foreground text-sm">
												Через Telegram
											</div>
										</div>
									</div>
									{telegramStats.lastActivity && (
										<div className="rounded-lg bg-muted p-3 text-center text-muted-foreground text-sm">
											Последняя активность:{" "}
											{new Date(telegramStats.lastActivity).toLocaleString(
												"ru-RU",
											)}
										</div>
									)}
								</>
							)}
						</CardContent>
					</Card>
				</div>

				{/* Настройки бота */}
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MessageCircle className="h-5 w-5" />
								Настройки бота
							</CardTitle>
							<CardDescription>Информация о Telegram боте</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="bot-username">Bot Username</Label>
								<Input
									className="bg-muted"
									disabled
									id="bot-username"
									type="text"
									value={botInfo.username}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="bot-token">Bot Token (замаскирован)</Label>
								<Input
									className="bg-muted font-mono"
									disabled
									id="bot-token"
									type="text"
									value={botInfo.tokenMasked}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="bot-domain">Домен приложения</Label>
								<Input
									className="bg-muted"
									disabled
									id="bot-domain"
									type="text"
									value={botInfo.domain}
								/>
							</div>

							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>Важно</AlertTitle>
								<AlertDescription className="text-sm">
									Токен бота хранится в переменных окружения Supabase Edge
									Functions. Для изменения используйте Supabase Dashboard → Edge
									Functions → Secrets.
								</AlertDescription>
							</Alert>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Инструкции по настройке */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Info className="h-5 w-5" />
						Инструкции по настройке
					</CardTitle>
					<CardDescription>
						Пошаговое руководство по настройке Telegram интеграции
					</CardDescription>
				</CardHeader>
				<CardContent>
					<ol className="list-inside list-decimal space-y-4">
						<li className="text-sm">
							<strong className="font-semibold">
								Создайте бота в Telegram
							</strong>
							<p className="mt-1 ml-5 text-muted-foreground">
								Используйте @BotFather для создания нового бота. Отправьте
								команду /newbot и следуйте инструкциям.
							</p>
						</li>
						<li className="text-sm">
							<strong className="font-semibold">Получите токен бота</strong>
							<p className="mt-1 ml-5 text-muted-foreground">
								Скопируйте токен из сообщения BotFather. Он будет в формате:
								123456789:ABCdefGHIjklMNOpqrsTUVwxyz
							</p>
						</li>
						<li className="text-sm">
							<strong className="font-semibold">Настройте домены</strong>
							<p className="mt-1 ml-5 text-muted-foreground">
								Добавьте ваш домен в настройки бота через BotFather командой
								/setdomain
							</p>
						</li>
						<li className="text-sm">
							<strong className="font-semibold">
								Добавьте токен в переменные окружения Supabase
							</strong>
							<p className="mt-1 ml-5 text-muted-foreground">
								В Supabase Dashboard → Edge Functions → Secrets добавьте
								TELEGRAM_BOT_TOKEN
							</p>
						</li>
						<li className="text-sm">
							<strong className="font-semibold">
								Разверните Edge Function telegram-auth
							</strong>
							<p className="mt-1 ml-5 text-muted-foreground">
								Используйте Supabase CLI для развертывания Edge Function
								telegram-auth
							</p>
						</li>
					</ol>

					<div className="mt-6 flex gap-3">
						<Button
							onClick={() =>
								window.open("https://core.telegram.org/bots", "_blank")
							}
							size="sm"
							variant="outline"
						>
							Документация Telegram Bots
						</Button>
						<Button
							onClick={() =>
								window.open(
									"https://supabase.com/docs/guides/functions",
									"_blank",
								)
							}
							size="sm"
							variant="outline"
						>
							Документация Edge Functions
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
