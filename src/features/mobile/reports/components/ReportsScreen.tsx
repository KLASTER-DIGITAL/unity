import { BlobProvider } from '@react-pdf/renderer';
import {
	BarChart3,
	BookOpen,
	Brain,
	Crown,
	Download,
	FileText,
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
import { API_URLS } from '@/shared/lib/api/config/urls';
import { useTranslation } from '@/shared/lib/i18n';
import type { PDFReportData } from '@/shared/types/reports';
import { createClient } from '@/utils/supabase/client';
import { BookCreationWizard } from './BookCreationWizard';
import { BookDraftEditor } from './BookDraftEditor';
import { BooksLibraryScreen } from './BooksLibraryScreen';
import { ReportPDFDocument } from './ReportPDFDocument';
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
	const { t, currentLanguage } = useTranslation();
	const [selectedPeriod, setSelectedPeriod] = useState<ReportsPeriod>('month');
	const [isLoading, setIsLoading] = useState(true);
	const [showBooksLibrary, setShowBooksLibrary] = useState(false);
	const [showBookWizard, setShowBookWizard] = useState(false);
	const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
	const [booksLibraryRefreshKey, setBooksLibraryRefreshKey] = useState(0); // Key для обновления списка книг
	const [isPremium, setIsPremium] = useState(false);
	const [aiReport, setAiReport] = useState<AiReport | null>(null);
	const [reportStats, setReportStats] = useState<ReportStatsSnapshot | null>(null);
	const [isLoadingAiReport, setIsLoadingAiReport] = useState(false);
	const [showReportsArchive, setShowReportsArchive] = useState(false);
	const [isExportingPDF, setIsExportingPDF] = useState(false);
	const [reportPDFUrl, setReportPDFUrl] = useState<string | null>(null);
	const [reportPDFData, setReportPDFData] = useState<PDFReportData | null>(null);
	const [currentReportId, setCurrentReportId] = useState<string | null>(null);

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
					.select('id, ai_insights, stats, pdf_url')
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
					id: string;
					ai_insights: AiReport | null;
					stats: ReportStatsSnapshot | null;
					pdf_url: string | null;
				};

				setCurrentReportId(typedData.id);
				setReportStats(typedData.stats ?? null);
				setAiReport(typedData.ai_insights ?? null);
				setReportPDFUrl(typedData.pdf_url);
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

	// ✅ NEW: Export PDF function
	const exportReportPDF = useCallback(async () => {
		if (!isPremium || !reportStats || !aiReport) {
			toast.error(t('reports.pdf.premium_required', 'Экспорт PDF доступен только для Premium'));
			return;
		}

		try {
			setIsExportingPDF(true);

			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				toast.error(t('reports.pdf.auth_required', 'Необходима авторизация'));
				return;
			}

			// Get period key
			const periodType = selectedPeriod === 'week' ? 'weekly' : 'monthly';
			const now = new Date();
			const periodKey =
				periodType === 'monthly'
					? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
					: `2025-W${Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 7))}`;

			// Load report data from API
			const response = await fetch(`${API_URLS.REPORTS}/export-pdf`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.access_token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					period: periodType,
					periodKey,
				}),
			});

			const result = await response.json();

			if (!result.success || !result.report) {
				throw new Error(result.error || 'Не удалось загрузить данные отчета');
			}

			// Save report ID for PDF saving
			if (result.report.reportId) {
				setCurrentReportId(result.report.reportId);
			}

			// Load entries for PDF (limit to 50 for performance)
			const userId = userData?.user?.id || userData?.id;
			let entries: PDFReportData['entries'] = [];

			if (userId) {
				const supabaseClient = createClient();
				const { data: entriesData, error: entriesError } = await supabaseClient
					.from('entries')
					.select(
						'id, text, sentiment, category, mood, is_achievement, created_at, ai_summary, ai_insight'
					)
					.eq('user_id', userId)
					.gte('created_at', reportStats.start_date)
					.lte('created_at', reportStats.end_date)
					.order('created_at', { ascending: true })
					.limit(50);

				if (!entriesError && entriesData) {
					entries = entriesData.map((entry: any) => ({
						id: entry.id,
						date: entry.created_at,
						text: entry.text || '',
						category: entry.category || '',
						sentiment: entry.sentiment || 'neutral',
						mood: entry.mood || '',
						isAchievement: entry.is_achievement || false,
						aiSummary: result.report.isPremium ? entry.ai_summary : null,
						aiInsight: result.report.isPremium ? entry.ai_insight : null,
					}));
				}
			}

			// Calculate stats from entries if available
			const positiveEntries = entries.filter((e) => e.sentiment === 'positive').length;
			const neutralEntries = entries.filter((e) => e.sentiment === 'neutral').length;
			const negativeEntries = entries.filter((e) => e.sentiment === 'negative').length;

			// Prepare PDF data
			const pdfData: PDFReportData = {
				userName: result.report.userName,
				userLanguage: result.report.userLanguage,
				isPremium: result.report.isPremium,
				periodStart: reportStats.start_date,
				periodEnd: reportStats.end_date,
				periodType: result.report.periodType,
				periodKey: result.report.periodKey,
				stats: {
					totalEntries: reportStats.total_entries,
					avgEntriesPerDay:
						reportStats.total_entries /
						Math.max(
							1,
							Math.ceil(
								(new Date(reportStats.end_date).getTime() -
									new Date(reportStats.start_date).getTime()) /
									(1000 * 60 * 60 * 24)
							)
						),
					achievements: reportStats.achievements?.length || 0,
					positiveEntries,
					neutralEntries,
					negativeEntries,
					categories: reportStats.categories?.map((c: any) => c.name) || [],
					topCategory: reportStats.categories?.[0]?.name || '',
					topMood: reportStats.mood_distribution?.[0]?.mood || '',
				},
				entries,
				aiMonthlySummary: result.report.aiSummary || null,
				aiInsights: result.report.aiInsights
					? Array.isArray(result.report.aiInsights.insights)
						? result.report.aiInsights.insights
						: [result.report.aiInsights.insights]
					: null,
				achievements: reportStats.achievements || [],
			};

			setReportPDFData(pdfData);

			toast.success(t('reports.pdf.generating', 'Генерация PDF...'));
		} catch (error) {
			console.error('[REPORTS] Error exporting PDF:', error);
			toast.error(t('reports.pdf.error', 'Произошла ошибка при экспорте PDF'));
		} finally {
			setIsExportingPDF(false);
		}
	}, [isPremium, reportStats, aiReport, selectedPeriod, t]);

	// ✅ NEW: Save PDF function
	const handleSavePDF = useCallback(
		async (blob: Blob, reportId: string) => {
			try {
				setIsExportingPDF(true);

				const supabase = createClient();
				const {
					data: { session },
				} = await supabase.auth.getSession();

				if (!session?.access_token) {
					toast.error(t('reports.pdf.auth_required', 'Необходима авторизация'));
					return;
				}

				// Convert blob to base64
				const reader = new FileReader();
				reader.readAsDataURL(blob);
				reader.onloadend = async () => {
					const base64data = reader.result as string;

					// Save PDF via API
					const response = await fetch(`${API_URLS.REPORTS}/save-pdf`, {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${session.access_token}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							reportId,
							pdfBlob: base64data,
						}),
					});

					const result = await response.json();

					if (!result.success) {
						throw new Error(result.error || 'Не удалось сохранить PDF');
					}

					setReportPDFUrl(result.pdfUrl);
					toast.success(t('reports.pdf.saved', 'PDF сохранен успешно!'));
				};
			} catch (error) {
				console.error('[REPORTS] Error saving PDF:', error);
				toast.error(t('reports.pdf.save_error', 'Произошла ошибка при сохранении PDF'));
			} finally {
				setIsExportingPDF(false);
			}
		},
		[t]
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
	const currentPeriod = (() => {
		const now = new Date();
		const year = now.getFullYear();
		const monthIndex = now.getMonth();

		// ✅ Manual formatting for kk/ka languages (browser doesn't support them properly)
		if (currentLanguage === 'kk') {
			const months = [
				'қаңтар',
				'ақпан',
				'наурыз',
				'сәуір',
				'мамыр',
				'маусым',
				'шілде',
				'тамыз',
				'қыркүйек',
				'қазан',
				'қараша',
				'желтоқсан',
			];
			return `${months[monthIndex]} ${year} ж.`;
		}

		if (currentLanguage === 'ka') {
			const months = [
				'იანვარი',
				'თებერვალი',
				'მარტი',
				'აპრილი',
				'მაისი',
				'ივნისი',
				'ივლისი',
				'აგვისტო',
				'სექტემბერი',
				'ოქტომბერი',
				'ნოემბერი',
				'დეკემბერი',
			];
			return `${months[monthIndex]} ${year} წ.`;
		}

		// For other languages use browser's toLocaleDateString
		const locale = `${currentLanguage}-${currentLanguage.toUpperCase()}`;
		return now.toLocaleDateString(locale, {
			year: 'numeric',
			month: 'long',
		});
	})();

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
		t(
			'reports.mood.default_summary',
			'В этом месяце преобладали позитивные эмоции. Особенно заметен рост записей с восторгом - это говорит о том, что ты активнее достигаешь своих целей! 🎉'
		);

	const _aiCategoriesObservation =
		aiReport?.transformations ??
		t(
			'reports.ai.categories_observation',
			'Твой фокус на спорте значительно усилился. Это отличная тенденция для здоровья и дисциплины! 💪'
		);

	const _aiNextMonthStrategy =
		aiReport?.next_month_strategy ??
		t(
			'reports.ai.next_month_strategy',
			'Продолжай бегать и фиксировать небольшие рабочие победы, а также добавь больше творчества в свой распорядок.'
		);

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
				<div className="border-b border-border bg-(--ios-bg-primary) p-6 text-(--ios-text-primary)">
					<div className="mb-4 flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm">
							<Brain className="h-6 w-6" strokeWidth={2} />
						</div>
						<div>
							<h2 className="text-lg transition-colors duration-300 sm:text-xl">
								{t('ai_reviews', 'AI Обзоры')}
							</h2>
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
							<>
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
								{reportPDFUrl ? (
									<Button
										className="h-9 rounded-full bg-card/20 px-4 text-xs font-medium text-white hover:bg-card/30"
										onClick={() => window.open(reportPDFUrl, '_blank')}
										size="sm"
										variant="ghost"
									>
										<FileText className="mr-1 h-3 w-3" strokeWidth={2} />
										{t('reports.pdf.download', 'Скачать PDF')}
									</Button>
								) : (
									<Button
										className="h-9 rounded-full bg-card/20 px-4 text-xs font-medium text-white hover:bg-card/30"
										onClick={() => void exportReportPDF()}
										disabled={isExportingPDF || !reportStats || !aiReport}
										size="sm"
										variant="ghost"
									>
										<Download className="mr-1 h-3 w-3" strokeWidth={2} />
										{isExportingPDF
											? t('reports.pdf.generating', 'Генерация...')
											: t('reports.pdf.export', 'Экспорт PDF')}
									</Button>
								)}
							</>
						)}
						<Button
							className="h-9 rounded-full bg-card/20 px-4 text-xs font-medium text-white hover:bg-card/30"
							onClick={() => setShowReportsArchive(true)}
							size="sm"
							variant="ghost"
						>
							{t('reports.open_reports', 'Открыть отчёты')}
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
										{t('reports.report_for', 'Отчет за')} {monthlyReport.period}
									</CardTitle>
									<p className="text-muted-foreground text-sm">
										{t('reports.personal_analysis', 'Персональный анализ от AI')}
									</p>
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
									<div className="mb-1 text-xl text-(--ios-purple) transition-colors duration-300 sm:text-2xl">
										{monthlyReport.totalEntries}
									</div>
									<div className="text-muted-foreground text-sm">
										{t('entries_count', 'Записей')}
									</div>
								</div>
								<div className="text-center">
									<div className="mb-1 text-xl text-(--ios-green) transition-colors duration-300 sm:text-2xl">
										{monthlyReport.activeDays}
									</div>
									<div className="text-muted-foreground text-sm">
										{t('reports.stats.active_days', 'Активных дней')}
									</div>
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

				{/* ✅ NEW: PDF Export Preview */}
				{reportPDFData && (
					<div className="px-4">
						<Card className="border-border bg-card shadow-sm">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5 text-(--ios-purple)" strokeWidth={2} />
									{t('reports.pdf.preview', 'Предпросмотр PDF')}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<BlobProvider
									document={
										<ReportPDFDocument
											reportData={reportPDFData}
											translations={{
												title: t('reports.pdf.title', 'Отчет UNITY'),
												user: t('reports.pdf.user', 'Пользователь'),
												statistics: t('reports.pdf.statistics', 'Статистика'),
												entries: t('reports.pdf.entries', 'Записей'),
												per_day: t('reports.pdf.per_day', 'В день'),
												achievements: t('reports.pdf.achievements', 'Достижений'),
												mood: t('reports.pdf.mood', 'Настроение'),
												ai_analysis: t('reports.pdf.ai_analysis', 'AI Анализ'),
												entries_period: t('reports.pdf.entries_period', 'Записи за период'),
												achievement_badge: t('reports.pdf.achievement_badge', 'Достижение'),
												more_entries: t('reports.pdf.more_entries', '... и еще {count} записей'),
												generated_by: t('reports.pdf.generated_by', 'Сгенерировано UNITY'),
												weekly_report: t('reports.pdf.weekly_report', 'Недельный отчет за'),
												monthly_report: t('reports.pdf.monthly_report', 'Месячный отчет за'),
											}}
										/>
									}
								>
									{({ blob, url, loading }) => {
										if (loading) {
											return (
												<div className="py-12 text-center">
													<Sparkles
														className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-500"
														strokeWidth={2}
													/>
													<p className="text-muted-foreground">
														{t('reports.pdf.generating', 'Генерация предпросмотра...')}
													</p>
												</div>
											);
										}

										return (
											<div className="space-y-3">
												<iframe
													className="h-[400px] w-full rounded-lg border sm:h-[600px]"
													src={url || ''}
													title="PDF Preview"
												/>
												<div className="flex gap-2">
													<Button
														className="flex-1"
														disabled={isExportingPDF}
														onClick={() => {
															if (blob && currentReportId) {
																void handleSavePDF(blob, currentReportId);
															} else {
																toast.error(
																	t(
																		'reports.pdf.no_report',
																		'Отчет не найден. Сначала создайте отчет.'
																	)
																);
															}
														}}
													>
														<Download className="mr-2 h-4 w-4" strokeWidth={2} />
														{isExportingPDF
															? t('reports.pdf.saving', 'Сохранение...')
															: t('reports.pdf.save', 'Сохранить PDF')}
													</Button>
												</div>
											</div>
										);
									}}
								</BlobProvider>
							</CardContent>
						</Card>
					</div>
				)}

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
								{t('reports.tabs.categories', 'Категории')}
							</TabsTrigger>
						</TabsList>

						<TabsContent className="mt-4" value="mood">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Heart className="h-5 w-5 text-pink-500" strokeWidth={2} />
										{t('reports.mood.analysis_title', 'Анализ настроения')}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{monthlyReport.moodDistribution.map((item, index) => (
											<div className="flex items-center gap-3" key={`${item.label}-${index}`}>
												<div className="text-xl transition-colors duration-300 sm:text-2xl">
													{item.mood}
												</div>
												<div className="flex-1">
													<div className="mb-1 flex justify-between">
														<span>{item.label}</span>
														<span className="text-muted-foreground text-sm">
															{item.count} {t('reports.mood.entries_count', 'записей')}
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
											<strong>{t('reports.mood.conclusion', 'Вывод:')}</strong>{' '}
											{t(
												'reports.mood.default_summary',
												'В этом месяце преобладали позитивные эмоции. Особенно заметен рост записей с восторгом - это говорит о том, что ты активнее достигаешь своих целей! 🎉'
											)}
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
										{t('reports.categories.title', 'Категории активности')}
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
															{category.count} {t('reports.categories.entries', 'записей')}
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
						key={booksLibraryRefreshKey} // ✅ Перемонтирование компонента для обновления списка
						onBack={() => setShowBooksLibrary(false)}
						onCreateBook={() => {
							setShowBooksLibrary(false);
							setShowBookWizard(true);
						}}
						onEditDraft={(draftId) => {
							setShowBooksLibrary(false);
							setEditingDraftId(draftId);
						}}
						refreshKey={booksLibraryRefreshKey}
					/>
				</div>
			)}

			{showBookWizard && (
				<div className="fixed inset-0 z-50 bg-background">
					<BookCreationWizard
						onCancel={() => setShowBookWizard(false)}
						onComplete={(draftId) => {
							// После успешного визарда по умолчанию открываем редактор книги
							setShowBookWizard(false);
							setEditingDraftId(draftId);
						}}
						onGoToLibrary={() => {
							// Альтернативный путь из модалки успеха → сразу полка книг
							setShowBookWizard(false);
							setBooksLibraryRefreshKey((prev) => prev + 1);
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
							// ✅ Обновить refreshKey для принудительного обновления списка книг
							setBooksLibraryRefreshKey((prev) => prev + 1);
							setShowBooksLibrary(true);
						}}
						onCancel={() => {
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
