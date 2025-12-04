/**
 * Book PDF Document Component
 *
 * Client-side PDF generation using @react-pdf/renderer
 * Full Unicode support with Google Fonts (Noto Sans/Serif)
 *
 * @author UNITY Team
 * @date 2025-11-25
 */

import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

// ✅ Fonts are registered by the caller (worker or main thread) to avoid env var issues in worker
// This component just defines the structure

type BookChapter = {
	title?: string;
	content?: string;
	highlights?: string[];
	is_divider?: boolean;
	is_chronicle?: boolean;
};

type BookStory = {
	title?: string;
	subtitle?: string;
	prologue?: string;
	epilogue?: string;
	dedication?: string;
	chapters?: BookChapter[];
	tableOfContents?: {
		title: string;
		items: Array<{ title: string; page: number }>;
	}; // ✅ НОВОЕ: Оглавление
	monthSummary?: {
		title: string;
		topWins: string[];
		focusNextMonth?: string;
	}; // ✅ НОВОЕ: Итоги месяца для PREMIUM
};

type BookMetadata = {
	diaryEmoji?: string;
	period?: string; // ✅ НОВОЕ: Период для отображения на обложке
	insight?: string; // ✅ НОВОЕ: Инсайт/цитата для обложки (опционально)
};

interface BookPDFDocumentProps {
	story: BookStory;
	metadata?: BookMetadata;
	bookStyle?: string; // ✅ Renamed from style to bookStyle to avoid conflict
	theme?: string;
}

const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontFamily: 'Noto Sans', // Will fallback to Helvetica if Noto Sans not registered
		fontSize: 12, // ✅ Увеличено с 11 до 12pt для лучшей читабельности
		lineHeight: 1.4, // ✅ Улучшено с 1.6 до 1.4 (более компактно, но читаемо)
	},
	titlePage: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100%',
		textAlign: 'center',
	},
	emoji: {
		fontSize: 48,
		marginBottom: 20,
	},
	title: {
		fontFamily: 'Noto Serif', // Will fallback to Times-Roman if Noto Serif not registered
		fontSize: 32, // ✅ Увеличено с 28 до 32pt для лучшей читабельности
		fontWeight: 700, // ✅ Увеличено с 600 до 700 для более выразительного заголовка
		marginBottom: 12,
		textAlign: 'center',
		color: '#1a1a1a', // ✅ Более контрастный цвет для лучшей читабельности
	},
	subtitle: {
		fontSize: 18, // ✅ Увеличено с 14 до 18pt для лучшей читабельности
		color: '#4a5568', // ✅ Более читаемый цвет вместо #666
		marginBottom: 24,
		textAlign: 'center',
		// ✅ FIX: Убираем fontStyle: 'italic' если шрифт не зарегистрирован
		// Используем fontStyle только если italic шрифт доступен
		// fontStyle: 'italic', // Временно отключено до исправления URL шрифта
		fontFamily: 'Noto Sans',
	},
	dedication: {
		fontSize: 12,
		color: '#666',
		marginTop: 20,
		textAlign: 'center',
	},
	sectionTitle: {
		fontFamily: 'Noto Serif', // Will fallback to Times-Roman if Noto Serif not registered
		fontSize: 18,
		fontWeight: 600,
		marginTop: 20,
		marginBottom: 10,
		paddingBottom: 5,
		borderBottom: '2px solid #9333ea',
	},
	paragraph: {
		marginBottom: 12, // ✅ Увеличено с 10 до 12 для лучшего визуального разделения
		textAlign: 'justify',
		fontSize: 12, // ✅ Явно указан размер для консистентности
		lineHeight: 1.4, // ✅ Явно указан lineHeight для консистентности
	},
	prologue: {
		padding: 10,
		borderLeft: '3px solid #a855f7',
		marginBottom: 15,
	},
	epilogue: {
		padding: 10,
		borderLeft: '3px solid #a855f7',
		marginBottom: 15,
	},
	chapter: {
		marginBottom: 20,
	},
	chapterTitle: {
		fontFamily: 'Noto Serif',
		fontSize: 20, // ✅ Увеличено с 16 до 20pt для лучшей видимости
		fontWeight: 700, // ✅ Увеличено с 600 до 700 для более выразительного заголовка
		marginTop: 24, // ✅ Добавлен отступ сверху для визуального разделения
		marginBottom: 16, // ✅ Увеличен отступ снизу
		color: '#9333ea',
		paddingBottom: 8, // ✅ Добавлен отступ для разделителя
		borderBottom: '1px solid #e2e8f0', // ✅ Добавлен тонкий разделитель для визуального разделения глав
	},
	highlights: {
		backgroundColor: '#f9fafb',
		padding: 10,
		borderRadius: 3,
		marginTop: 15,
		marginBottom: 15,
	},
	highlightTitle: {
		fontWeight: 600,
		marginBottom: 5,
	},
	highlightItem: {
		marginLeft: 15,
		marginTop: 3,
	},
	dividerPage: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		minHeight: '100%',
		backgroundColor: '#f8f9fa',
		textAlign: 'center',
	},
	dividerTitle: {
		fontFamily: 'Noto Serif',
		fontSize: 24,
		fontWeight: 600,
		color: '#9333ea',
		marginBottom: 10,
	},
	dividerContent: {
		fontSize: 14,
		color: '#666',
		maxWidth: '80%',
	},
	// ✅ НОВОЕ: Стили для структурированного текста на обложке
	period: {
		fontSize: 12,
		color: '#718096',
		marginTop: 16,
		marginBottom: 8,
		textAlign: 'center',
	},
	insight: {
		fontSize: 13,
		color: '#4a5568',
		fontStyle: 'italic',
		fontFamily: 'Noto Sans', // ✅ FIX: Явно указываем семейство шрифта для italic
		marginTop: 24,
		marginBottom: 16,
		textAlign: 'center',
		maxWidth: '80%',
		lineHeight: 1.5,
	},
});

export function BookPDFDocument({
	story,
	metadata = {},
	bookStyle: _bookStyle,
	theme: _theme,
}: BookPDFDocumentProps) {
	const {
		title = 'Моя книга',
		subtitle,
		prologue,
		epilogue,
		dedication,
		chapters = [],
		tableOfContents,
		monthSummary,
	} = story;
	const { diaryEmoji = '📖' } = metadata;

	// Suppress unused warnings until style implementation is complete
	// console.log('Rendering PDF with style:', bookStyle, 'theme:', theme);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.titlePage}>
					<Text style={styles.emoji}>{diaryEmoji}</Text>
					<Text style={styles.title}>{title}</Text>
					{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

					{/* ✅ НОВОЕ: Период на обложке */}
					{metadata.period && <Text style={styles.period}>Период: {metadata.period}</Text>}

					{/* ✅ НОВОЕ: Инсайт/цитата на обложке (опционально) */}
					{metadata.insight && <Text style={styles.insight}>«{metadata.insight}»</Text>}

					{dedication && <Text style={styles.dedication}>{dedication}</Text>}
				</View>
			</Page>

			{/* ✅ НОВОЕ: Оглавление (после обложки, перед вступлением) */}
			{tableOfContents && tableOfContents.items.length > 0 && (
				<Page size="A4" style={styles.page}>
					<Text style={styles.sectionTitle}>{tableOfContents.title || 'Оглавление'}</Text>
					<View style={styles.toc}>
						{tableOfContents.items.map((item) => (
							<View key={`toc-${item.title}-${item.page}`} style={styles.tocItem}>
								<Text style={styles.tocTitle}>{item.title}</Text>
								<Text style={styles.tocPage}>{item.page}</Text>
							</View>
						))}
					</View>
				</Page>
			)}

			{prologue && (
				<Page size="A4" style={styles.page}>
					<Text style={styles.sectionTitle}>Вступление</Text>
					<View style={styles.prologue}>
						{prologue.split('\n').map((p, i) => (
							<Text key={`prologue-${i}-${p.substring(0, 20)}`} style={styles.paragraph}>
								{p}
							</Text>
						))}
					</View>
				</Page>
			)}

			{chapters.map((chapter, index) => {
				if (chapter.is_divider) {
					return (
						<Page key={`divider-${index}-${chapter.title || index}`} size="A4" style={styles.page}>
							<View style={styles.dividerPage}>
								<Text style={styles.dividerTitle}>{chapter.title}</Text>
								{chapter.content && <Text style={styles.dividerContent}>{chapter.content}</Text>}
							</View>
						</Page>
					);
				}

				if (chapter.is_chronicle) {
					return (
						<Page
							key={`chronicle-${index}-${chapter.title || index}`}
							size="A4"
							style={styles.page}
						>
							<Text style={styles.sectionTitle}>{chapter.title}</Text>
							{chapter.content?.split('\n').map((p, i) => {
								if (p.trim().startsWith('**') && p.trim().endsWith('**')) {
									return (
										<Text
											key={`chronicle-${index}-${i}-${p.substring(0, 15)}`}
											style={{
												...styles.paragraph,
												fontWeight: 600,
												color: '#a855f7',
												marginTop: 10,
											}}
										>
											{p.replace(/\*\*/g, '')}
										</Text>
									);
								}
								return (
									<Text
										key={`chronicle-para-${index}-${i}-${p.substring(0, 15)}`}
										style={styles.paragraph}
									>
										{p}
									</Text>
								);
							})}
						</Page>
					);
				}

				return (
					<Page key={`chapter-${index}-${chapter.title || index}`} size="A4" style={styles.page}>
						<View style={styles.chapter}>
							<Text style={styles.chapterTitle}>
								Глава {index + 1}: {chapter.title}
							</Text>
							{chapter.content?.split('\n').map((p, i) => (
								<Text
									key={`chapter-${index}-para-${i}-${p.substring(0, 15)}`}
									style={styles.paragraph}
								>
									{p}
								</Text>
							))}
							{chapter.highlights && chapter.highlights.length > 0 && (
								<View style={styles.highlights}>
									<Text style={styles.highlightTitle}>Ключевые моменты:</Text>
									{chapter.highlights.map((h, i) => (
										<Text
											key={`highlight-${index}-${i}-${h.substring(0, 20)}`}
											style={styles.highlightItem}
										>
											✨ {h}
										</Text>
									))}
								</View>
							)}
						</View>
					</Page>
				);
			})}

			{epilogue && (
				<Page size="A4" style={styles.page}>
					<Text style={styles.sectionTitle}>Заключение</Text>
					<View style={styles.epilogue}>
						{epilogue.split('\n').map((p, i) => (
							<Text key={`epilogue-${i}-${p.substring(0, 20)}`} style={styles.paragraph}>
								{p}
							</Text>
						))}
					</View>
				</Page>
			)}

			{/* ✅ НОВОЕ: Итоги месяца для PREMIUM */}
			{monthSummary && (
				<Page size="A4" style={styles.page}>
					<Text style={styles.sectionTitle}>{monthSummary.title}</Text>
					<View style={styles.monthSummary}>
						<Text style={styles.summarySubtitle}>Твои 5 главных побед:</Text>
						{monthSummary.topWins.map((win, i) => (
							<Text key={`win-${win.substring(0, 20)}-${i}`} style={styles.winItem}>
								{i + 1}. {win}
							</Text>
						))}
						{monthSummary.focusNextMonth && (
							<Text style={styles.focusNext}>{monthSummary.focusNextMonth}</Text>
						)}
					</View>
				</Page>
			)}
		</Document>
	);
}
