/**
 * Book PDF Document Component
 *
 * Client-side PDF generation using @react-pdf/renderer
 * Full Unicode support with Google Fonts (Noto Sans/Serif)
 *
 * @author UNITY Team
 * @date 2025-11-25
 */

import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

// ✅ ИСПРАВЛЕНО: Используем переменную окружения вместо захардкоженного URL
// ✅ ИСПРАВЛЕНО: Используем SemiBold (600) вместо Bold (700), так как Bold отсутствует в Storage
const FONT_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/assets/fonts`;

Font.register({
	family: 'Noto Sans',
	fonts: [
		{
			src: `${FONT_BASE_URL}/noto-sans/NotoSans-Regular.woff2`,
			fontWeight: 400,
		},
		{
			src: `${FONT_BASE_URL}/noto-sans/NotoSans-Medium.woff2`,
			fontWeight: 500,
		},
		{
			src: `${FONT_BASE_URL}/noto-sans/NotoSans-SemiBold.woff2`,
			fontWeight: 600,
		},
	],
});

Font.register({
	family: 'Noto Serif',
	fonts: [
		{
			src: `${FONT_BASE_URL}/noto-serif/NotoSerif-Regular.woff2`,
			fontWeight: 400,
		},
		{
			src: `${FONT_BASE_URL}/noto-serif/NotoSerif-SemiBold.woff2`,
			fontWeight: 600,
		},
	],
});

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
};

type BookMetadata = {
	diaryEmoji?: string;
};

interface BookPDFDocumentProps {
	story: BookStory;
	metadata?: BookMetadata;
	style?: string;
	theme?: string;
}

const styles = StyleSheet.create({
	page: {
		padding: 40,
		fontFamily: 'Noto Sans',
		fontSize: 11,
		lineHeight: 1.6,
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
		fontFamily: 'Noto Serif',
		fontSize: 28,
		fontWeight: 600,
		marginBottom: 10,
		textAlign: 'center',
	},
	subtitle: {
		fontSize: 14,
		color: '#666',
		marginBottom: 20,
		textAlign: 'center',
	},
	dedication: {
		fontSize: 12,
		color: '#666',
		marginTop: 20,
		textAlign: 'center',
	},
	sectionTitle: {
		fontFamily: 'Noto Serif',
		fontSize: 18,
		fontWeight: 600,
		marginTop: 20,
		marginBottom: 10,
		paddingBottom: 5,
		borderBottom: '2px solid #9333ea',
	},
	paragraph: {
		marginBottom: 10,
		textAlign: 'justify',
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
		fontSize: 16,
		fontWeight: 600,
		marginBottom: 10,
		color: '#9333ea',
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
		fontStyle: 'italic',
		maxWidth: '80%',
	},
});

export function BookPDFDocument({ story, metadata = {} }: BookPDFDocumentProps) {
	const { title = 'Моя книга', subtitle, prologue, epilogue, dedication, chapters = [] } = story;
	const { diaryEmoji = '📖' } = metadata;

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.titlePage}>
					<Text style={styles.emoji}>{diaryEmoji}</Text>
					<Text style={styles.title}>{title}</Text>
					{subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
					{dedication && <Text style={styles.dedication}>{dedication}</Text>}
				</View>
			</Page>

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
		</Document>
	);
}
