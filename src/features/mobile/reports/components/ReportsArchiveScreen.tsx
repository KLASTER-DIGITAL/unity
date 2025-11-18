import { ArrowLeft, BarChart3, CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
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
					toast.error('Не удалось загрузить отчеты');
					return;
				}

				const mapped: ArchivedReport[] = (data || []).map((row: any) => {
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
				toast.error('Произошла ошибка');
			} finally {
				setIsLoading(false);
			}
		};

		void loadReports();
	}, []);

	const filteredReports = reports.filter((report) => {
		if (filter === 'all') return true;
		return report.periodType === (filter === 'weekly' ? 'weekly' : 'monthly');
	});

	const formatPeriod = (start?: string, end?: string) => {
		if (!start || !end) return '';
		const startDate = new Date(start);
		const endDate = new Date(end);
		const startStr = startDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
		const endStr = endDate.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
		});
		return `${startStr}  ${endStr}`;
	};

	const getSummaryPreview = (text: string | null) => {
		if (!text) return 'AI еще не сгенерировал описание для этого отчета.';
		const trimmed = text.trim();
		if (trimmed.length <= 180) return trimmed;
		return `${trimmed.slice(0, 177)}...`;
	};

	return (
		<div className="scrollbar-hide fixed inset-0 z-50 overflow-y-auto bg-(--ios-bg-primary)">
			{/* Header */}
			<div className="bg-linear-to-r from-purple-600 to-blue-600 p-4 text-white sm:p-6">
				<div className="mb-4 flex items-center gap-3">
					<Button
						className="h-10 w-10 rounded-full bg-card/20 p-0 text-white hover:bg-card/30"
						onClick={onBack}
						variant="ghost"
					>
						<ArrowLeft className="h-5 w-5" strokeWidth={2} />
					</Button>
					<div>
						<h2 className="text-lg sm:text-xl">AI-отчеты</h2>
						<p className="text-muted-foreground text-xs opacity-90 sm:text-sm">
							Сохраненные недельные и месячные обзоры
						</p>
					</div>
				</div>

				<div className="flex gap-2">
					{(
						[
							{ key: 'all', label: 'Все' },
							{ key: 'weekly', label: 'Неделя' },
							{ key: 'monthly', label: 'Месяц' },
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
								У тебя пока нет сохраненных AI-отчетов.
							</p>
							<p className="text-muted-foreground text-xs">
								Создай новый отчет на экране статистики, чтобы он появился здесь.
							</p>
						</CardContent>
					</Card>
				) : (
					filteredReports.map((report) => {
						const title = report.periodType === 'weekly' ? 'Недельный отчет' : 'Месячный отчет';
						const periodText = formatPeriod(report.startDate, report.endDate);
						return (
							<Card className="border-border bg-card shadow-sm" key={report.id}>
								<CardHeader>
									<CardTitle className="flex items-center justify-between gap-2 text-sm sm:text-base">
										<span className="flex items-center gap-2">
											<BarChart3 className="h-4 w-4 text-(--ios-purple)" strokeWidth={2} />
											{title}
										</span>
										<Badge variant="outline">
											{report.periodType === 'weekly' ? 'Неделя' : 'Месяц'}
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
											Всего записей за период: {report.stats.total_entries}
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
