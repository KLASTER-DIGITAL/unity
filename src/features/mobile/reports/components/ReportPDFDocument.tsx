/**
 * Report PDF Document Component
 *
 * Generates PDF document for monthly/weekly reports using @react-pdf/renderer
 * Similar to BookPDF but for reports
 *
 * @author UNITY Team
 * @date 2025-11-21
 */

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { PDFReportData } from '@/shared/types/reports';

type PDFTranslations = {
	title: string;
	user: string;
	statistics: string;
	entries: string;
	per_day: string;
	achievements: string;
	mood: string;
	ai_analysis: string;
	entries_period: string;
	achievement_badge: string;
	more_entries: string;
	generated_by: string;
	weekly_report: string;
	monthly_report: string;
};

// PDF Styles
const pdfStyles = StyleSheet.create({
	page: {
		padding: 40,
		backgroundColor: '#FFFFFF',
		fontFamily: 'Helvetica',
	},
	title: {
		fontSize: 24,
		marginBottom: 10,
		textAlign: 'center',
		fontWeight: 'bold',
		color: '#4B0082',
	},
	subtitle: {
		fontSize: 14,
		marginBottom: 30,
		textAlign: 'center',
		color: '#666',
	},
	section: {
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 16,
		marginBottom: 10,
		fontWeight: 'bold',
		color: '#333',
	},
	text: {
		fontSize: 12,
		lineHeight: 1.6,
		textAlign: 'justify',
		color: '#333',
	},
	statsGrid: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 20,
		padding: 15,
		backgroundColor: '#F5F5F5',
		borderRadius: 5,
	},
	statItem: {
		textAlign: 'center',
	},
	statValue: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#4B0082',
		marginBottom: 5,
	},
	statLabel: {
		fontSize: 10,
		color: '#666',
	},
	entry: {
		marginBottom: 15,
		padding: 10,
		backgroundColor: '#FAFAFA',
		borderLeft: '3px solid #4B0082',
	},
	entryDate: {
		fontSize: 10,
		color: '#666',
		marginBottom: 5,
	},
	entryText: {
		fontSize: 11,
		lineHeight: 1.5,
		color: '#333',
	},
	entryMeta: {
		fontSize: 9,
		color: '#999',
		marginTop: 5,
	},
	aiSummary: {
		marginTop: 20,
		padding: 15,
		backgroundColor: '#F0F0FF',
		borderRadius: 5,
	},
	aiSummaryTitle: {
		fontSize: 14,
		fontWeight: 'bold',
		marginBottom: 10,
		color: '#4B0082',
	},
});

type ReportPDFProps = {
	reportData: PDFReportData;
	translations: PDFTranslations;
};

export function ReportPDFDocument({ reportData, translations }: ReportPDFProps) {
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const localeMap: Record<string, string> = {
			ru: 'ru-RU',
			en: 'en-US',
			es: 'es-ES',
			de: 'de-DE',
			fr: 'fr-FR',
			zh: 'zh-CN',
			ja: 'ja-JP',
			kk: 'kk-KZ',
			ka: 'ka-GE',
		};
		const locale = localeMap[reportData.userLanguage] || 'en-US';
		return date.toLocaleDateString(locale, {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});
	};

	const periodTitle =
		reportData.periodType === 'weekly'
			? `${translations.weekly_report} ${reportData.periodKey}`
			: `${translations.monthly_report} ${formatDate(reportData.periodStart)}`;

	return (
		<Document>
			<Page size="A4" style={pdfStyles.page}>
				{/* Title Page */}
				<View style={pdfStyles.section}>
					<Text style={pdfStyles.title}>{translations.title}</Text>
					<Text style={pdfStyles.subtitle}>{periodTitle}</Text>
					<Text style={pdfStyles.subtitle}>
						{translations.user}: {reportData.userName}
					</Text>
				</View>

				{/* Statistics */}
				<View style={pdfStyles.section}>
					<Text style={pdfStyles.sectionTitle}>{translations.statistics}</Text>
					<View style={pdfStyles.statsGrid}>
						<View style={pdfStyles.statItem}>
							<Text style={pdfStyles.statValue}>{reportData.stats.totalEntries}</Text>
							<Text style={pdfStyles.statLabel}>{translations.entries}</Text>
						</View>
						<View style={pdfStyles.statItem}>
							<Text style={pdfStyles.statValue}>
								{reportData.stats.avgEntriesPerDay.toFixed(1)}
							</Text>
							<Text style={pdfStyles.statLabel}>{translations.per_day}</Text>
						</View>
						<View style={pdfStyles.statItem}>
							<Text style={pdfStyles.statValue}>{reportData.stats.achievements}</Text>
							<Text style={pdfStyles.statLabel}>{translations.achievements}</Text>
						</View>
						<View style={pdfStyles.statItem}>
							<Text style={pdfStyles.statValue}>{reportData.stats.topMood}</Text>
							<Text style={pdfStyles.statLabel}>{translations.mood}</Text>
						</View>
					</View>
				</View>

				{/* AI Summary (Premium only) */}
				{reportData.isPremium && (reportData.aiWeeklySummary || reportData.aiMonthlySummary) && (
					<View style={pdfStyles.section}>
						<View style={pdfStyles.aiSummary}>
							<Text style={pdfStyles.aiSummaryTitle}>{translations.ai_analysis}</Text>
							<Text style={pdfStyles.text}>
								{reportData.aiWeeklySummary || reportData.aiMonthlySummary || ''}
							</Text>
						</View>
					</View>
				)}

				{/* Entries */}
				<View style={pdfStyles.section}>
					<Text style={pdfStyles.sectionTitle}>{translations.entries_period}</Text>
					{reportData.entries.slice(0, 20).map((entry) => (
						<View key={entry.id} style={pdfStyles.entry}>
							<Text style={pdfStyles.entryDate}>{formatDate(entry.date)}</Text>
							<Text style={pdfStyles.entryText}>{entry.text}</Text>
							<View style={pdfStyles.entryMeta}>
								<Text>
									{entry.category} • {entry.mood}{' '}
									{entry.isAchievement ? `• ⭐ ${translations.achievement_badge}` : ''}
								</Text>
								{reportData.isPremium && entry.aiSummary && (
									<Text style={{ marginTop: 3, fontStyle: 'italic' }}>{entry.aiSummary}</Text>
								)}
							</View>
						</View>
					))}
					{reportData.entries.length > 20 && (
						<Text style={{ fontSize: 10, color: '#999', textAlign: 'center', marginTop: 10 }}>
							{translations.more_entries.replace('{count}', String(reportData.entries.length - 20))}
						</Text>
					)}
				</View>

				{/* Footer */}
				<View
					style={{ position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center' }}
				>
					<Text style={{ fontSize: 9, color: '#999' }}>
						{translations.generated_by} •{' '}
						{new Date().toLocaleDateString(
							reportData.userLanguage === 'ru'
								? 'ru-RU'
								: reportData.userLanguage === 'en'
									? 'en-US'
									: reportData.userLanguage === 'es'
										? 'es-ES'
										: reportData.userLanguage === 'de'
											? 'de-DE'
											: reportData.userLanguage === 'fr'
												? 'fr-FR'
												: reportData.userLanguage === 'zh'
													? 'zh-CN'
													: reportData.userLanguage === 'ja'
														? 'ja-JP'
														: reportData.userLanguage === 'kk'
															? 'kk-KZ'
															: reportData.userLanguage === 'ka'
																? 'ka-GE'
																: 'en-US'
						)}
					</Text>
				</View>
			</Page>
		</Document>
	);
}
