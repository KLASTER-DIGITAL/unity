import { ArrowLeft, BarChart3, CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useTranslation } from '@/shared/lib/i18n';
import { createClient } from '@/utils/supabase/client';

type ArchiveFilter = 'all' | 'weekly' | 'monthly';

type ArchivedReport = {
	id: string;
	periodType: 'weekly' | 'monthly';
	periodKey: string;
	startDate?: string;
	endDate?: string;
	language: string;
	aiSummary: string | null;
	stats: {
		total_entries?: number;
	} | null;
};

type ReportsArchiveScreenProps = {
	onBack?: () => void;
};

export function ReportsArchiveScreen({ onBack }: ReportsArchiveScreenProps) {
	const { t, currentLanguage } = useTranslation();
	const [reports, setReports] = useState<ArchivedReport[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [filter, setFilter] = useState<ArchiveFilter>('all');

	useEffect(() => {
		const loadReports = async () => {
			try {
				setIsLoading(true);
				const supabase = createClient();
				const { data, error } = await supabase
					.from('user_reports')
					.select('*')
					.order('stats->>start_date', { ascending: false });

				if (error) {
					console.error('[REPORTS-ARCHIVE] Error fetching reports:', error);
					toast.error(t('reports.archive.load_error', 'Не удалось загрузить отчеты'));
					return;
				}

				const mapped: ArchivedReport[] = (data || []).map((row) => {
					const stats = (row.stats || {}) as {
						start_date?: string;
						end_date?: string;
						total_entries?: number;
					};
					return {
						id: row.id,
						periodType: row.period_type,
						periodKey: row.period_key,
						startDate: stats.start_date,
						endDate: stats.end_date,
						language: row.language,
						aiSummary: row.ai_summary ?? null,
						stats: { total_entries: stats.total_entries },
					};
				});

				setReports(mapped);
			} catch (error) {
				console.error('[REPORTS-ARCHIVE] Error:', error);
				toast.error(t('reports.archive.generic_error', 'Произошла ошибка'));
			} finally {
				setIsLoading(false);
			}
		};

		void loadReports();
	}, [t]);

	const filteredReports = reports.filter((report) => {
		if (filter === 'all') return true;
		return report.periodType === (filter === 'weekly' ? 'weekly' : 'monthly');
	});

	const formatPeriod = (start?: string, end?: string) => {
		if (!start || !end) return '';
		const startDate = new Date(start);
		const endDate = new Date(end);

		// ✅ Manual formatting for kk/ka languages (browser doesn't support them properly)
		if (currentLanguage === 'kk') {
			const months = [
				'қаң.',
				'ақп.',
				'нау.',
				'сәу.',
				'мам.',
				'мау.',
				'шіл.',
				'там.',
				'қыр.',
				'қаз.',
				'қар.',
				'жел.',
			];
			const startDay = startDate.getDate();
			const startMonth = months[startDate.getMonth()];
			const endDay = endDate.getDate();
			const endMonth = months[endDate.getMonth()];
			const endYear = endDate.getFullYear();
			return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear} ж.`;
		}

		if (currentLanguage === 'ka') {
			const months = [
				'იან.',
				'თებ.',
				'მარ.',
				'აპრ.',
				'მაი.',
				'ივნ.',
				'ივლ.',
				'აგვ.',
				'სექ.',
				'ოქტ.',
				'ნოე.',
				'დეკ.',
			];
			const startDay = startDate.getDate();
			const startMonth = months[startDate.getMonth()];
			const endDay = endDate.getDate();
			const endMonth = months[endDate.getMonth()];
			const endYear = endDate.getFullYear();
			return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${endYear} წ.`;
		}

		// For other languages use browser's toLocaleDateString
		const locale = `${currentLanguage}-${currentLanguage.toUpperCase()}`;
		const startStr = startDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
		const endStr = endDate.toLocaleDateString(locale, {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
		return `${startStr} – ${endStr}`;
	};

	const getSummaryPreview = (text: string | null) => {
		if (!text)
			return t(
				'reports.archive.summary_not_ready',
				'AI еще не сгенерировал описание для этого отчета.'
			);
		const trimmed = text.trim();
		if (trimmed.length <= 180) return trimmed;
		return `${trimmed.slice(0, 177)}...`;
	};

	return (
		<div className="scrollbar-hide fixed inset-0 z-50 overflow-y-auto bg-[var(--ios-bg-primary)]">
			{/* Header */}
			<div className="bg-[--ios-purple] p-4 text-white sm:p-6">
				<div className="mb-4 flex items-center gap-3">
					<Button
						className="h-10 w-10 rounded-full bg-card/20 p-0 text-foreground hover:bg-card/30"
						onClick={onBack}
						variant="ghost"
					>
						<ArrowLeft className="h-5 w-5" strokeWidth={2} />
					</Button>
					<div>
						<h2 className="text-lg sm:text-xl">{t('reports.archive.title', 'AI-отчеты')}</h2>
						<p className="text-muted-foreground text-xs opacity-90 sm:text-sm">
							{t('reports.archive.subtitle', 'Сохраненные недельные и месячные обзоры')}
						</p>
					</div>
				</div>

				<div className="flex gap-2">
					{(
						[
							{
								key: 'all',
								label: t('reports.archive.filter.all', 'Все'),
							},
							{
								key: 'weekly',
								label: t('reports.archive.filter.weekly', 'Неделя'),
							},
							{
								key: 'monthly',
								label: t('reports.archive.filter.monthly', 'Месяц'),
							},
						] as { key: ArchiveFilter; label: string }[]
					).map((item) => (
						<Button
							className="flex-1"
							key={item.key}
							onClick={() => setFilter(item.key)}
							size="sm"
							variant={filter === item.key ? 'secondary' : 'outline'}
						>
							{item.label}
						</Button>
					))}
				</div>
			</div>

			{/* Content */}
			<div className="space-y-4 p-4">
				{isLoading ? (
					[0, 1, 2].map((item) => (
						<Card className="bg-card" key={`skeleton-${item}`}>
							<CardHeader>
								<Skeleton className="h-5 w-40" />
								<Skeleton className="mt-2 h-4 w-3/4" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-4 w-full" />
							</CardContent>
						</Card>
					))
				) : filteredReports.length === 0 ? (
					<Card className="bg-card">
						<CardContent className="py-10 text-center">
							<p className="mb-2 text-muted-foreground text-sm">
								{t('reports.archive.empty.title', 'У тебя пока нет сохраненных AI-отчетов.')}
							</p>
							<p className="text-muted-foreground text-xs">
								{t(
									'reports.archive.empty.description',
									'Создай новый отчет на экране статистики, чтобы он появился здесь.'
								)}
							</p>
						</CardContent>
					</Card>
				) : (
					filteredReports.map((report) => {
						const title =
							report.periodType === 'weekly'
								? t('reports.archive.weekly', 'Недельный отчет')
								: t('reports.archive.monthly', 'Месячный отчет');
						const periodText = formatPeriod(report.startDate, report.endDate);
						return (
							<Card className="border-border bg-card shadow-sm" key={report.id}>
								<CardHeader>
									<CardTitle className="flex items-center justify-between gap-2 text-sm sm:text-base">
										<span className="flex items-center gap-2">
											<BarChart3 className="h-4 w-4 text-[var(--ios-purple)]" strokeWidth={2} />
											{title}
										</span>
										<Badge variant="outline">
											{report.periodType === 'weekly'
												? t('reports.archive.badge.weekly', 'Неделя')
												: t('reports.archive.badge.monthly', 'Месяц')}
										</Badge>
									</CardTitle>
									{periodText && (
										<p className="mt-1 flex items-center gap-1 text-muted-foreground text-xs sm:text-sm">
											<CalendarDays className="h-3 w-3" strokeWidth={2} />
											<span>{periodText}</span>
										</p>
									)}
								</CardHeader>
								<CardContent>
									<p className="mb-2 text-foreground text-sm">
										{getSummaryPreview(report.aiSummary)}
									</p>
									{typeof report.stats?.total_entries === 'number' && (
										<p className="text-muted-foreground text-xs">
											{t('reports.archive.total_entries', 'Всего записей за период')}:{' '}
											{report.stats.total_entries}
										</p>
									)}
								</CardContent>
							</Card>
						);
					})
				)}
			</div>
		</div>
	);
}
