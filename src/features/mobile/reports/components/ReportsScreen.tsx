import {
	BarChart3,
	BookOpen,
	Brain,
	Crown,
	Download,
	Heart,
	Sparkles,
	Star,
	Target,
	TrendingUp,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useTranslation } from '@/shared/lib/i18n';
import { BookCreationWizard } from './BookCreationWizard';
import { BookDraftEditor } from './BookDraftEditor';
import { BooksLibraryScreen } from './BooksLibraryScreen';
import { ReportsArchiveScreen } from './ReportsArchiveScreen';

type ReportsPeriod = 'week' | 'month' | 'quarter';

type AiReport = {
	title?: string;
	summary?: string;
	highlights?: string[];
	insights?: string | string[];
	key_achievements?: string[];
	next_week_focus?: string;
	transformations?: string;
	next_month_strategy?: string;
	[key: string]: unknown;
};

type ReportStatsEntrySummary = {
	date: string;
	entries_count: number;
	achievements_count: number;
	top_category: string | null;
};

type ReportStatsMoodTrend = {
	date: string;
	positive: number;
	neutral: number;
	negative: number;
	mood_score: number;
};

type ReportStatsCategory = {
	name: string;
	count: number;
};

type ReportStatsMonthly = {
	year: number;
	month: number;
	entries_count: number;
	achievements_count: number;
	avg_mood: number | null;
	top_categories: unknown;
} | null;

type ReportStatsMoodDistributionItem = {
	mood: string;
	label: string;
	count: number;
	percentage: number;
};

type ReportStatsSnapshot = {
	period: string;
	period_key: string;
	start_date: string;
	end_date: string;
	total_entries: number;
	entries_summary: ReportStatsEntrySummary[];
	categories: ReportStatsCategory[];
	mood_trends: ReportStatsMoodTrend[];
	mood_distribution?: ReportStatsMoodDistributionItem[];
	achievements: unknown[];
	monthly: ReportStatsMonthly;
};

type ReportsUserData = {
	id?: string;
	user?: {
		id?: string;
	} | null;
};

export function ReportsScreen({ userData }: { userData?: ReportsUserData }) {
	// Получаем переводы для языка пользователя
	const { t } = useTranslation();
	const [selectedPeriod, setSelectedPeriod] = useState<ReportsPeriod>('month');
	const [isLoading, setIsLoading] = useState(true);
	const [showBooksLibrary, setShowBooksLibrary] = useState(false);
	const [showBookWizard, setShowBookWizard] = useState(false);
	const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
	const [isPremium, setIsPremium] = useState(false);
	const [aiReport, setAiReport] = useState<AiReport | null>(null);
	const [reportStats, setReportStats] = useState<ReportStatsSnapshot | null>(null);
	const [isLoadingAiReport, setIsLoadingAiReport] = useState(false);
	const [showReportsArchive, setShowReportsArchive] = useState(false);

	// ✅ FIX: Define functions BEFORE useEffect with useCallback
	const loadData = useCallback(() => {
		// Сейчас все числовые показатели для отчетов приходят из Edge Function
		// reports/generate через поле data.stats.
		// Фактическую загрузку/окончание loading обрабатываем в loadPremiumStatus/loadAiReport,
		// здесь оставляем заглушку на будущее для возможной предзагрузки локальных данных.
	}, []);

	const loadPremiumStatus = useCallback(async () => {
		try {
			const userId = userData?.user?.id || userData?.id;
			if (!userId) {
				console.log('[REPORTS] No user ID, skipping premium check');
				setIsLoading(false);
				return;
			}

			// Import createClient dynamically to avoid circular dependencies
			const { createClient } = await import('@/utils/supabase/client');
			const supabase = createClient();

			const { data: profile, error } = await supabase
				.from('profiles')
				.select('is_premium')
				.eq('id', userId)
				.single();

			if (error) {
				console.error('[REPORTS] Error loading premium status:', error);
				setIsLoading(false);
				return;
			}

			const isUserPremium = !!profile?.is_premium;
			console.log('[REPORTS] Premium status loaded:', isUserPremium);
			setIsPremium(isUserPremium);

			if (!isUserPremium) {
				// Для бесплатных пользователей числовые показатели пока недоступны,
				// поэтому просто снимаем состояние загрузки.
				setIsLoading(false);
			}
		} catch (error) {
			console.error('[REPORTS] Error in loadPremiumStatus:', error);
			setIsLoading(false);
		}
	}, [userData]);

	const loadLastSavedReport = useCallback(
		async (period: ReportsPeriod) => {
			try {
				const userId = userData?.user?.id || userData?.id;
				if (!userId) {
					console.log('[REPORTS] No user ID, skipping existing AI report load');
					setIsLoading(false);
					return;
				}

				const { createClient } = await import('@/utils/supabase/client');
				const supabase = createClient();

				const apiPeriod = period === 'week' ? 'weekly' : 'monthly';

				const { data, error } = await supabase
					.from('user_reports')
					.select('ai_insights, stats')
					.eq('user_id', userId)
					.eq('period_type', apiPeriod)
					.order('stats->>start_date', { ascending: false })
					.limit(1)
					.maybeSingle();

				if (error) {
					console.error('[REPORTS] Error loading saved AI report:', error);
					return;
				}

				if (!data) {
					console.log('[REPORTS] No saved AI report found for period:', apiPeriod);
					setAiReport(null);
					setReportStats(null);
					return;
				}

				const typedData = data as {
					ai_insights: AiReport | null;
					stats: ReportStatsSnapshot | null;
				};

				setReportStats(typedData.stats ?? null);
				setAiReport(typedData.ai_insights ?? null);
			} catch (error) {
				console.error('[REPORTS] Error in loadLastSavedReport:', error);
			} finally {
				setIsLoading(false);
			}
		},
		[userData]
	);

	const loadAiReport = useCallback(
		async (period: ReportsPeriod) => {
			try {
				if (!isPremium) {
					toast.error(
						t('reports_ai_premium_only', 'AI-обзоры доступны только в Premium-подписке.')
					);
					return;
				}

				const { createClient } = await import('@/utils/supabase/client');
				const supabase = createClient();

				const {
					data: { session },
					error: sessionError,
				} = await supabase.auth.getSession();

				if (sessionError || !session?.access_token) {
					console.error('[REPORTS] No session for AI report:', sessionError);
					toast.error(t('auth_error', 'Ошибка авторизации'));
					return;
				}

				setIsLoadingAiReport(true);

				const apiPeriod = period === 'week' ? 'weekly' : 'monthly';

				const response = await fetch(`${supabase.supabaseUrl}/functions/v1/reports/generate`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${session.access_token}`,
					},
					body: JSON.stringify({ period: apiPeriod }),
				});

				const data = await response.json().catch(() => null);

				if (!response.ok || !data?.success) {
					console.error('[REPORTS] Failed to generate AI report:', data);
					toast.error(
						data?.message ||
							t('reports_ai_failed', 'Не удалось сгенерировать AI отчет. Попробуй позже.')
					);
					return;
				}

				setAiReport(data.report as AiReport);
				setReportStats(data.stats as ReportStatsSnapshot);
				toast.success(t('reports_ai_ready', 'AI отчет обновлен'));
			} catch (error) {
				console.error('[REPORTS] Error in loadAiReport:', error);
				toast.error(t('reports_ai_failed', 'Не удалось сгенерировать AI отчет. Попробуй позже.'));
			} finally {
				setIsLoadingAiReport(false);
				setIsLoading(false);
			}
		},
		[isPremium, t]
	);

	// ✅ FIX: useEffect AFTER function definitions
	useEffect(() => {
		loadData();
		loadPremiumStatus();
	}, [loadData, loadPremiumStatus]);

	useEffect(() => {
		if (!isPremium) {
			return;
		}

		void loadLastSavedReport(selectedPeriod);
	}, [isPremium, selectedPeriod, loadLastSavedReport]);

	// Получить текущий месяц и год
	const currentPeriod = new Date().toLocaleDateString('ru-RU', {
		year: 'numeric',
		month: 'long',
	});

	const monthlyReport = (() => {
		const totalEntries = reportStats?.total_entries ?? 0;
		const entriesSummary = reportStats?.entries_summary ?? [];
		const activeDays = entriesSummary.filter((day) => (day.entries_count ?? 0) > 0).length;

		const serverMoodDistribution = reportStats?.mood_distribution;

		let moodDistribution: { mood: string; label: string; count: number; percentage: number }[] = [];

		if (serverMoodDistribution && serverMoodDistribution.length > 0) {
			moodDistribution = serverMoodDistribution.map((item) => {
				let label = item.label;
				if (item.label === 'positive') {
					label = t('reports_mood_positive', 'Позитивное');
				} else if (item.label === 'neutral') {
					label = t('reports_mood_neutral', 'Нейтральное');
				} else if (item.label === 'negative') {
					label = t('reports_mood_negative', 'Негативное');
				}
				return {
					mood: item.mood,
					label,
					count: item.count,
					percentage: item.percentage,
				};
			});
		} else {
			const moodTotals = (reportStats?.mood_trends ?? []).reduce(
				(acc, item) => ({
					positive: acc.positive + (item.positive ?? 0),
					neutral: acc.neutral + (item.neutral ?? 0),
					negative: acc.negative + (item.negative ?? 0),
				}),
				{ positive: 0, neutral: 0, negative: 0 }
			);

			const moodTotalCount = moodTotals.positive + moodTotals.neutral + moodTotals.negative;

			moodDistribution =
				moodTotalCount > 0
					? [
							{
								mood: '😊',
								label: t('reports_mood_positive', 'Позитивное'),
								count: moodTotals.positive,
								percentage: Math.round((moodTotals.positive / moodTotalCount) * 100),
							},
							{
								mood: '😐',
								label: t('reports_mood_neutral', 'Нейтральное'),
								count: moodTotals.neutral,
								percentage: Math.round((moodTotals.neutral / moodTotalCount) * 100),
							},
							{
								mood: '☁️',
								label: t('reports_mood_negative', 'Негативное'),
								count: moodTotals.negative,
								percentage: Math.round((moodTotals.negative / moodTotalCount) * 100),
							},
						].filter((item) => item.count > 0)
					: [];
		}

		const topCategories = (reportStats?.categories ?? []).map((category) => ({
			name: category.name,
			count: category.count,
			// Пока что тренд категорий не агрегируется на бэкенде, показываем нейтральное значение
			trend: '—',
		}));

		const personalInsights: string[] = (() => {
			if (!aiReport) return [];
			if (Array.isArray(aiReport.insights)) {
				return aiReport.insights
					.map((value) => (typeof value === 'string' ? value : String(value)))
					.filter(Boolean);
			}
			if (typeof aiReport.insights === 'string') {
				return [aiReport.insights];
			}
			if (Array.isArray(aiReport.key_achievements)) {
				return aiReport.key_achievements.filter(
					(value): value is string => typeof value === 'string'
				);
			}
			return [];
		})();

		return {
			period: currentPeriod,
			totalEntries,
			activeDays,
			moodDistribution,
			topCategories,
			personalInsights,
		};
	})();
	const extraAiInsights: string[] = (() => {
		if (!aiReport) return [];

		const raw: string[] = [];

		if (Array.isArray(aiReport?.highlights)) {
			raw.push(
				...aiReport.highlights
					.map((value) => (typeof value === 'string' ? value : String(value)))
					.filter(Boolean)
			);
		} else if (typeof aiReport?.highlights === 'string') {
			raw.push(aiReport.highlights);
		}

		if (Array.isArray(aiReport?.key_achievements)) {
			raw.push(
				...aiReport.key_achievements
					.filter((value): value is string => typeof value === 'string')
					.filter(Boolean)
			);
		}

		const unique = raw.filter((value, index, self) => value && self.indexOf(value) === index);

		if (!monthlyReport.personalInsights.length) {
			return unique;
		}

		const personalSet = new Set(monthlyReport.personalInsights);
		return unique.filter((item) => !personalSet.has(item));
	})();

	const _aiSummaryText =
		aiReport?.summary ??
		'В этом месяце преобладали позитивные эмоции. Особенно заметен рост записей с восторгом - это говорит о том, что ты активнее достигаешь своих целей! 🎉';

	const _aiCategoriesObservation =
		aiReport?.transformations ??
		'Твой фокус на спорте значительно усилился. Это отличная тенденция для здоровья и дисциплины! 💪';

	const _aiNextMonthStrategy =
		aiReport?.next_month_strategy ??
		'Продолжай бегать и фиксировать небольшие рабочие победы, а также добавь больше творчества в свой распорядок.';

	const aiQuotes = extraAiInsights;

	// Weekly stats (currently unused but kept for future use)
	// const weeklyStats = [
	//   { week: "1 неделя", entries: 6, mood: 4.2 },
	//   { week: "2 неделя", entries: 5, mood: 4.5 },
	//   { week: "3 неделя", entries: 7, mood: 4.8 },
	//   { week: "4 неделя", entries: 5, mood: 4.3 }
	// ];

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background pb-20 transition-colors duration-300">
				{/* Skeleton for reports header */}
				<div className="space-y-4 p-4">
					{/* Period selector skeleton */}
					<div className="flex gap-2">
						{['reports-period-1', 'reports-period-2', 'reports-period-3'].map((key) => (
							<Skeleton className="h-10 flex-1 rounded-[12px]" key={key} />
						))}
					</div>

					{/* AI Report card skeleton */}
					<Card className="bg-card transition-colors duration-300">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex-1 space-y-2">
									<Skeleton className="h-6 w-48" />
									<Skeleton className="h-4 w-40" />
								</div>
								<Skeleton className="h-6 w-20 rounded-full" />
							</div>
						</CardHeader>
						<CardContent>
							{/* Stats grid skeleton */}
							<div className="mb-6 grid grid-cols-2 gap-4">
								{['reports-stats-1', 'reports-stats-2'].map((key) => (
									<div className="space-y-1 text-center" key={key}>
										<Skeleton className="mx-auto h-8 w-16" />
										<Skeleton className="mx-auto h-4 w-20" />
									</div>
								))}
							</div>

							{/* AI insights skeleton */}
							<div className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-5/6" />
								<Skeleton className="h-4 w-4/6" />
							</div>
						</CardContent>
					</Card>

					{/* Stats cards skeleton */}
					{['summary-card-1', 'summary-card-2'].map((key) => (
						<Card className="bg-card transition-colors duration-300" key={key}>
							<CardHeader>
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent className="space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-4/5" />
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<>
			<div className="scrollbar-hide min-h-screen overflow-x-hidden bg-(--ios-bg-primary) pb-20">
				{/* Заголовок */}
				<div className="bg-linear-to-r from-purple-600 to-blue-600 p-6 text-white">
					<div className="mb-4 flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm">
							<Brain className="h-6 w-6" strokeWidth={2} />
						</div>
						<div>
							<h2 className="text-xl">{t('ai_reviews', 'AI Обзоры')}</h2>
							<p className="text-muted-foreground opacity-90">
								{t('analysis_achievements', 'Анализ твоих достижений')}
							</p>
						</div>
					</div>

					{/* ✅ FIX: Improved period buttons with better visual feedback */}
					<div className="scrollbar-hide flex gap-2 overflow-x-auto">
						{['week', 'month', 'quarter'].map((period) => (
							<Button
								className={
									selectedPeriod === period
										? 'transition-all duration-300'
										: 'border-card/30 text-white transition-all duration-300 hover:bg-card/10'
								}
								key={period}
								onClick={() => setSelectedPeriod(period)}
								size="sm"
								variant={selectedPeriod === period ? 'secondary' : 'outline'}
							>
								{period === 'week'
									? t('week', 'Неделя')
									: period === 'month'
										? t('month', 'Месяц')
										: t('quarter', 'Квартал')}
							</Button>
						))}
					</div>
					<div className="mt-3 flex justify-end gap-2">
						{isPremium && (
							<Button
								className="h-9 rounded-full bg-card/20 px-4 text-xs font-medium text-white hover:bg-card/30"
								onClick={() => void loadAiReport(selectedPeriod)}
								disabled={isLoadingAiReport}
								size="sm"
								variant="ghost"
							>
								{isLoadingAiReport
									? t('reports_ai_generating_short', 'AI готовит обзор...')
									: t('reports_ai_generate_button', 'Обновить AI-обзор')}
							</Button>
						)}
						<Button
							className="h-9 rounded-full bg-card/20 px-4 text-xs font-medium text-white hover:bg-card/30"
							onClick={() => setShowReportsArchive(true)}
							size="sm"
							variant="ghost"
						>
							Открыть отчёты
						</Button>
					</div>
				</div>

				{/* Основной отчет */}
				<div className="space-y-4 p-4">
					<Card className="border border-(--ios-purple)/40 bg-card shadow-sm">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="flex items-center gap-2">
										<Sparkles className="h-5 w-5 text-(--action-ai)" strokeWidth={2} />
										Отчет за {monthlyReport.period}
									</CardTitle>
									<p className="text-muted-foreground text-sm">Персональный анализ от AI</p>
								</div>
								<Badge className="bg-(--ios-bg-secondary) text-(--ios-purple)">
									<Crown className="mr-1 h-3 w-3" strokeWidth={2} />
									Премиум
								</Badge>
							</div>
						</CardHeader>
						<CardContent>
							<div className="mb-6 grid grid-cols-2 gap-4">
								<div className="text-center">
									<div className="mb-1 text-2xl text-(--ios-purple)">
										{monthlyReport.totalEntries}
									</div>
									<div className="text-muted-foreground text-sm">
										{t('entries_count', 'Записей')}
									</div>
								</div>
								<div className="text-center">
									<div className="mb-1 text-2xl text-(--ios-green)">{monthlyReport.activeDays}</div>
									<div className="text-muted-foreground text-sm">Активных дней</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="p-4 pt-0">
					<Card className="border-border bg-card shadow-sm">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BookOpen className="h-5 w-5 text-(--ios-purple)" strokeWidth={2} />
								{t('reports_books_title', 'PDF книги и полка')}
							</CardTitle>
							<p className="text-muted-foreground text-sm">
								{t(
									'reports_books_description',
									'Создавай книги на основе дневника и возвращайся к ним в любой момент на своей полке.'
								)}
							</p>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<Button
									className="w-full bg-(--ios-purple) hover:bg-(--ios-purple)/90"
									onClick={() => setShowBooksLibrary(true)}
								>
									<Download className="mr-2 h-5 w-5" strokeWidth={2} />
									{t('reports_books_shelf', 'Открыть полку книг')}
								</Button>
								<Button
									className="w-full"
									variant="outline"
									onClick={() => setShowBookWizard(true)}
								>
									<Sparkles className="mr-2 h-5 w-5" strokeWidth={2} />
									{t('reports_books_create', 'Создать новую книгу')}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Вкладки с деталями */}
				<div className="px-4">
					<Tabs data-testid="stats-tab" defaultValue="mood">
						<TabsList className="inline-flex h-auto w-full items-center justify-between rounded-lg bg-muted p-1">
							<TabsTrigger className="flex-1 rounded-md px-3 py-2.5 text-sm font-medium" value="ai">
								{t('ai_overview', 'AI Обзор')}
							</TabsTrigger>
							<TabsTrigger
								className="flex-1 rounded-md px-3 py-2.5 text-sm font-medium"
								value="mood"
							>
								{t('mood', 'Настроение')}
							</TabsTrigger>
							<TabsTrigger
								className="flex-1 rounded-md px-3 py-2.5 text-sm font-medium"
								value="categories"
							>
								Категории
							</TabsTrigger>
						</TabsList>

						<TabsContent className="mt-4" value="mood">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Heart className="h-5 w-5 text-pink-500" strokeWidth={2} />
										Анализ настроения
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{monthlyReport.moodDistribution.map((item, index) => (
											<div className="flex items-center gap-3" key={`${item.label}-${index}`}>
												<div className="text-2xl">{item.mood}</div>
												<div className="flex-1">
													<div className="mb-1 flex justify-between">
														<span>{item.label}</span>
														<span className="text-muted-foreground text-sm">
															{item.count} записей
														</span>
													</div>
													<Progress className="h-2" value={item.percentage} />
												</div>
												<div className="text-muted-foreground text-sm">{item.percentage}%</div>
											</div>
										))}
									</div>

									<div className="mt-6 rounded-lg bg-(--ios-bg-secondary) p-4">
										<p className="text-(--ios-text-secondary) text-sm">
											<strong>Вывод:</strong> В этом месяце преобладали позитивные эмоции. Особенно
											заметен рост записей с восторгом - это говорит о том, что ты активнее
											достигаешь своих целей! 🎉
										</p>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent className="mt-4" value="categories">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<BarChart3 className="h-5 w-5 text-blue-500" strokeWidth={2} />
										Категории активности
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{monthlyReport.topCategories.map((category, index) => (
											<div className="flex items-center justify-between" key={category.name}>
												<div className="flex items-center gap-3">
													<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
														<span className="text-sm">{index + 1}</span>
													</div>
													<div>
														<h4>{category.name}</h4>
														<p className="text-muted-foreground text-sm">
															{category.count} записей
														</p>
													</div>
												</div>
												<Badge
													variant={
														category.trend.startsWith('+')
															? 'default'
															: category.trend.startsWith('-')
																? 'destructive'
																: 'secondary'
													}
												>
													{category.trend.startsWith('+') && (
														<TrendingUp className="mr-1 h-3 w-3" strokeWidth={2} />
													)}
													{category.trend}
												</Badge>
											</div>
										))}
									</div>

									<div className="mt-6 rounded-lg bg-(--ios-bg-secondary) p-4">
										<p className="text-(--ios-text-secondary) text-sm">
											<strong>Наблюдение:</strong> Твой фокус на спорте значительно усилился. Это
											отличная тенденция для здоровья и дисциплины! 💪
										</p>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent className="mt-4" value="ai">
							<div className="space-y-4">
								{!isPremium ? (
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<Crown className="h-5 w-5 text-(--ios-purple)" strokeWidth={2} />
												{t('reports_ai_premium_title', 'AI обзоры доступны в Premium')}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<p className="text-muted-foreground text-sm">
												{t(
													'reports_ai_premium_description',
													'Базовые отчёты и книги доступны на бесплатном тарифе. AI-инсайты и умные рекомендации доступны после перехода на Premium.'
												)}
											</p>
										</CardContent>
									</Card>
								) : isLoadingAiReport ? (
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<Sparkles className="h-5 w-5 text-(--ios-purple)" strokeWidth={2} />
												{t('reports_ai_loading', 'Готовим AI-обзор за период...')}
											</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="space-y-3">
												<Skeleton className="h-4 w-full" />
												<Skeleton className="h-4 w-5/6" />
												<Skeleton className="h-4 w-4/6" />
											</div>
										</CardContent>
									</Card>
								) : (
									<>
										<Card>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Brain className="h-5 w-5 text-(--ios-purple)" strokeWidth={2} />
													{t('reports_ai_summary_title', 'Персональный AI-обзор')}
												</CardTitle>
											</CardHeader>
											<CardContent>
												<p className="mb-3 text-foreground text-sm">
													{aiReport?.summary || _aiSummaryText}
												</p>
												{monthlyReport.personalInsights.length > 0 && (
													<div className="space-y-3">
														{monthlyReport.personalInsights.map((insight) => (
															<div
																className="flex items-start gap-3 rounded-lg bg-(--ios-bg-secondary) p-3"
																key={insight}
															>
																<Star
																	className="mt-0.5 h-5 w-5 shrink-0 text-(--ios-purple)"
																	strokeWidth={2}
																/>
																<p className="text-foreground text-sm">{insight}</p>
															</div>
														))}
													</div>
												)}
											</CardContent>
										</Card>
										<Card>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<TrendingUp className="h-5 w-5 text-(--ios-green)" strokeWidth={2} />
													{t('reports_ai_changes_title', 'Твои изменения за период')}
												</CardTitle>
											</CardHeader>
											<CardContent>
												<p className="text-foreground text-sm">{_aiCategoriesObservation}</p>
											</CardContent>
										</Card>

										<Card>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Sparkles className="h-5 w-5 text-yellow-500" strokeWidth={2} />
													{t('reports_ai_quotes_title', 'Дополнительный вывод AI')}
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="space-y-3">
													{aiQuotes.map((quote) => (
														<div
															className="rounded-lg border-yellow-400 border-l-4 bg-linear-to-r from-yellow-50 to-orange-50 p-4"
															key={quote}
														>
															<p className="text-foreground text-sm italic">"{quote}"</p>
														</div>
													))}
												</div>
											</CardContent>
										</Card>
										<Card>
											<CardHeader>
												<CardTitle className="flex items-center gap-2">
													<Target className="h-5 w-5 text-(--ios-green)" strokeWidth={2} />
													{t('reports_ai_next_month_title', 'Рекомендации на следующий месяц')}
												</CardTitle>
											</CardHeader>
											<CardContent>
												<p className="text-foreground text-sm">
													{aiReport?.next_month_strategy || _aiNextMonthStrategy}
												</p>
											</CardContent>
										</Card>
									</>
								)}
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</div>
			{showReportsArchive && (
				<div className="fixed inset-0 z-50 bg-background">
					<ReportsArchiveScreen onBack={() => setShowReportsArchive(false)} />
				</div>
			)}

			{showBooksLibrary && !editingDraftId && (
				<div className="fixed inset-0 z-50 bg-background">
					<BooksLibraryScreen
						onBack={() => setShowBooksLibrary(false)}
						onCreateBook={() => {
							setShowBooksLibrary(false);
							setShowBookWizard(true);
						}}
						onEditDraft={(draftId) => {
							setShowBooksLibrary(false);
							setEditingDraftId(draftId);
						}}
					/>
				</div>
			)}

			{showBookWizard && (
				<div className="fixed inset-0 z-50 bg-background">
					<BookCreationWizard
						onCancel={() => setShowBookWizard(false)}
						onComplete={() => {
							setShowBookWizard(false);
							setShowBooksLibrary(true);
						}}
					/>
				</div>
			)}

			{editingDraftId && (
				<div className="fixed inset-0 z-50 bg-background">
					<BookDraftEditor
						draftId={editingDraftId}
						onComplete={() => {
							setEditingDraftId(null);
							setShowBooksLibrary(true);
						}}
					/>
				</div>
			)}
		</>
	);
}
export default ReportsScreen;
