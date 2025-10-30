import {
	AlertCircle,
	BarChart3,
	CheckCircle,
	FileText,
	Languages,
	Loader2,
	TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/shared/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { createClient } from "@/utils/supabase/client";

type Language = {
	code: string;
	name: string;
	native_name: string;
	is_active: boolean;
	translation_count?: number;
	total_keys?: number;
	progress?: number;
};

type TranslationStats = {
	totalKeys: number;
	totalTranslations: number;
	missingCount: number;
	completeness: number;
	languageStats: Array<{
		code: string;
		name: string;
		native_name: string;
		count: number;
		progress: number;
	}>;
};

export function TranslationsStatisticsContent() {
	const [stats, setStats] = useState<TranslationStats>({
		totalKeys: 0,
		totalTranslations: 0,
		missingCount: 0,
		completeness: 0,
		languageStats: [],
	});
	const [isLoading, setIsLoading] = useState(false);

	const supabase = createClient();

	useEffect(() => {
		loadStatistics();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const loadStatistics = async () => {
		setIsLoading(true);
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				toast.error("Ошибка авторизации");
				return;
			}

			// Load languages
			const languagesResponse = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management/languages`,
				{
					headers: {
						Authorization: `Bearer ${session.access_token}`,
						"Content-Type": "application/json",
					},
				},
			);

			if (!languagesResponse.ok) {
				throw new Error("Failed to load languages");
			}

			const languagesData = await languagesResponse.json();
			const languages: Language[] = languagesData.languages || [];

			// Load translations
			const translationsResponse = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translations-management`,
				{
					headers: {
						Authorization: `Bearer ${session.access_token}`,
						"Content-Type": "application/json",
					},
				},
			);

			if (!translationsResponse.ok) {
				throw new Error("Failed to load translations");
			}

			const translationsData = await translationsResponse.json();
			const translations = translationsData.translations || [];

			// Calculate statistics
			const uniqueKeys = [
				...new Set(translations.map((t: any) => t.translation_key)),
			];
			const totalKeys = uniqueKeys.length;
			const totalTranslations = translations.length;
			const activeLanguages = languages.filter((l) => l.is_active);
			const expectedTranslations = totalKeys * activeLanguages.length;
			const missingCount = expectedTranslations - totalTranslations;
			const completeness =
				expectedTranslations > 0
					? Math.round((totalTranslations / expectedTranslations) * 100)
					: 0;

			// Calculate per-language statistics
			const languageStats = activeLanguages
				.map((lang) => {
					const langTranslations = translations.filter(
						(t: any) => t.lang_code === lang.code,
					);
					const count = langTranslations.length;
					const progress =
						totalKeys > 0 ? Math.round((count / totalKeys) * 100) : 0;

					return {
						code: lang.code,
						name: lang.name,
						native_name: lang.native_name,
						count,
						progress,
					};
				})
				.sort((a, b) => b.progress - a.progress);

			setStats({
				totalKeys,
				totalTranslations,
				missingCount,
				completeness,
				languageStats,
			});
		} catch (error) {
			console.error("Error loading statistics:", error);
			toast.error("Ошибка загрузки статистики");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Overview Stats */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="font-medium text-muted-foreground text-sm">
							Всего ключей
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className="font-bold text-2xl">{stats.totalKeys}</div>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
								<FileText className="h-5 w-5 text-blue-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="font-medium text-muted-foreground text-sm">
							Всего переводов
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className="font-bold text-2xl">
								{stats.totalTranslations}
							</div>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
								<Languages className="h-5 w-5 text-green-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="font-medium text-muted-foreground text-sm">
							Пропущено
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className="font-bold text-2xl">{stats.missingCount}</div>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
								<AlertCircle className="h-5 w-5 text-orange-500" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="font-medium text-muted-foreground text-sm">
							Полнота
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between">
							<div className="font-bold text-2xl">{stats.completeness}%</div>
							<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
								<TrendingUp className="h-5 w-5 text-purple-500" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Language Progress */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<BarChart3 className="h-5 w-5" />
						Прогресс по языкам
					</CardTitle>
					<CardDescription>
						Процент заполненности переводов для каждого языка
					</CardDescription>
				</CardHeader>
				<CardContent>
					{stats.languageStats.length === 0 ? (
						<div className="py-8 text-center text-muted-foreground">
							<AlertCircle className="mx-auto mb-2 h-12 w-12" />
							<p className="font-medium">Нет данных</p>
							<p className="text-sm">Добавьте языки и переводы</p>
						</div>
					) : (
						<div className="space-y-4">
							{stats.languageStats.map((lang) => (
								<div className="space-y-2" key={lang.code}>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="font-medium">{lang.native_name}</span>
											<Badge className="text-xs" variant="outline">
												{lang.code}
											</Badge>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-muted-foreground text-sm">
												{lang.count} / {stats.totalKeys}
											</span>
											<Badge
												variant={
													lang.progress === 100
														? "default"
														: lang.progress >= 80
															? "secondary"
															: "destructive"
												}
											>
												{lang.progress}%
											</Badge>
										</div>
									</div>
									<Progress className="h-2" value={lang.progress} />
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Completion Status */}
			<Card
				className={
					stats.completeness === 100
						? "border-green-200 bg-green-50/50"
						: "border-orange-200 bg-orange-50/50"
				}
			>
				<CardContent className="pt-6">
					<div className="flex gap-3">
						{stats.completeness === 100 ? (
							<>
								<CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
								<div className="space-y-1">
									<p className="font-medium text-green-900 text-sm">
										Все переводы заполнены!
									</p>
									<p className="text-green-700 text-xs">
										Все ключи переведены на все активные языки. Отличная работа!
									</p>
								</div>
							</>
						) : (
							<>
								<AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
								<div className="space-y-1">
									<p className="font-medium text-orange-900 text-sm">
										Требуется внимание
									</p>
									<p className="text-orange-700 text-xs">
										Осталось заполнить {stats.missingCount} переводов для
										достижения 100% полноты. Используйте вкладку "Переводы" для
										редактирования или "Автоперевод AI" для автоматического
										заполнения.
									</p>
								</div>
							</>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
