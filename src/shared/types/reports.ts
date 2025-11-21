/**
 * Reports Types
 *
 * Unified types for reports system including PDF generation and books
 */

/**
 * PDF Report Entry
 */
export type PDFReportEntry = {
	id: string;
	date: string;
	text: string;
	category: string;
	sentiment: string;
	mood: string;
	isAchievement: boolean;
	aiSummary: string | null; // ТОЛЬКО для Premium
	aiInsight: string | null; // ТОЛЬКО для Premium
};

/**
 * PDF Report Statistics
 */
export type PDFReportStats = {
	totalEntries: number;
	avgEntriesPerDay: number;
	achievements: number;
	positiveEntries: number;
	neutralEntries: number;
	negativeEntries: number;
	categories: string[];
	topCategory: string;
	topMood: string;
};

/**
 * PDF Report Data
 *
 * Unified structure for PDF report generation
 * Combines structures from reports-generate-pdf and REPORTS_SYSTEM.md
 */
export type PDFReportData = {
	userName: string;
	userLanguage: string;
	isPremium: boolean;
	periodStart: string; // ISO date
	periodEnd: string; // ISO date
	periodType: 'weekly' | 'monthly'; // Тип периода
	periodKey: string; // e.g. '2025-11', '2025-W47'
	stats: PDFReportStats;
	entries: PDFReportEntry[];
	aiWeeklySummary?: string | null; // AI summary для weekly отчетов
	aiMonthlySummary?: string | null; // AI summary для monthly отчетов
	aiInsights?: string[] | null; // AI инсайты
	achievements?: Array<{
		id: string;
		name: string;
		description: string;
		icon: string;
		rarity: string;
		earned_at: string;
	}>; // Достижения за период
};

/**
 * Monthly Report (from user_reports)
 */
export type MonthlyReport = {
	id: string;
	user_id: string;
	period_type: 'weekly' | 'monthly';
	period_key: string;
	language: string;
	is_premium: boolean;
	stats: {
		period: string;
		period_key: string;
		start_date: string;
		end_date: string;
		total_entries: number;
		entries_summary: Array<{
			date: string;
			entries_count: number;
			achievements_count: number;
			top_category: string | null;
		}>;
		categories: Array<{
			name: string;
			count: number;
		}>;
		mood_trends: Array<{
			date: string;
			positive: number;
			neutral: number;
			negative: number;
			mood_score: number;
		}>;
		mood_distribution?: Array<{
			mood: string;
			label: string;
			count: number;
			percentage: number;
		}>;
		achievements: Array<{
			id: string;
			name: string;
			description: string;
			icon: string;
			rarity: string;
			earned_at: string;
		}>;
		monthly?: {
			year: number;
			month: number;
			entries_count: number;
			achievements_count: number;
			avg_mood: number | null;
			top_categories: unknown;
		} | null;
	};
	ai_summary: string | null;
	ai_insights: {
		title?: string;
		summary?: string;
		highlights?: string[];
		insights?: string | string[];
		key_achievements?: string[];
		next_week_focus?: string;
		transformations?: string;
		next_month_strategy?: string;
	} | null;
	pdf_url: string | null;
	created_at: string;
	updated_at: string;
};

/**
 * Annual Book Data
 *
 * Structure for annual book generation from 12 MonthlyReport
 */
export type AnnualBookData = {
	year: number;
	user_id: string;
	user_name: string;
	user_language: string;
	monthly_reports: MonthlyReport[];
	total_entries: number;
	total_achievements: number;
	summary: {
		year_summary: string;
		key_achievements: string[];
		transformations: string;
		insights: string[];
	};
};
