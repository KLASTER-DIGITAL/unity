/**
 * Book Draft Editor
 *
 * Editor for AI-generated book drafts with PDF preview and rendering.
 *
 * Features:
 * - Edit title, prologue, chapters, epilogue
 * - Photo upload and management
 * - PDF preview using @react-pdf/renderer
 * - Save draft and render final PDF
 *
 * @author UNITY Team
 * @date 2025-11-07
 */

import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Eye, Image as ImageIcon, Save, Sparkles, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { API_URLS } from '@/shared/lib/api/config/urls';
import { useTranslation } from '@/shared/lib/i18n';
import { createClient } from '@/utils/supabase/client';

type BookDraftEditorProps = {
	draftId: string;
	onComplete?: () => void;
	onCancel?: () => void;
};

type StoryJson = {
	title: string;
	subtitle: string;
	prologue: string;
	chapters: Array<{
		title: string;
		content: string;
		highlights: string[];
		is_divider?: boolean;
		is_chronicle?: boolean;
		source_entry_ids?: string[];
	}>;
	epilogue: string;
	dedication?: string;
};

type BookMetadata = {
	diaryEmoji?: string;
	achievements?: Array<{
		id?: string;
		date?: string;
		category?: string | null;
		summary?: string;
	}>;
	[key: string]: unknown;
};

type BookSettings = {
	layout: 'photo_text' | 'text_only' | 'minimal';
	style: 'warm_family' | 'biographical' | 'motivational';
	theme: 'light' | 'dark';
};

type BookPhoto = {
	id: string;
	bookId: string;
	chapterIndex: number;
	photoUrl: string;
	caption?: string;
};

// PDF Styles Factory - создает стили в зависимости от настроек
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: PDF styles require multiple theme/style combinations (35 > 15)
function createPDFStyles(settings: BookSettings) {
	const isDark = settings.theme === 'dark';
	const bgColor = isDark ? '#1a1a1a' : '#FFFFFF';
	const textColor = isDark ? '#E5E5E5' : '#333333';
	const subtitleColor = isDark ? '#999999' : '#666666';
	const borderColor = isDark ? '#333333' : '#E5E5E5';

	// Цвета в зависимости от стиля
	let accentColor = '#4B0082'; // По умолчанию фиолетовый
	let sectionBgColor = isDark ? '#252525' : '#FAFAFA';

	if (settings.style === 'warm_family') {
		accentColor = isDark ? '#FF6B6B' : '#E63946'; // Теплый красный
		sectionBgColor = isDark ? '#2a1f1f' : '#FFF5F5'; // Теплый фон
	} else if (settings.style === 'biographical') {
		accentColor = isDark ? '#4A90E2' : '#1E88E5'; // Синий
		sectionBgColor = isDark ? '#1f252a' : '#F5F9FF'; // Холодный фон
	} else if (settings.style === 'motivational') {
		accentColor = isDark ? '#FFA726' : '#FF9800'; // Оранжевый
		sectionBgColor = isDark ? '#2a241f' : '#FFF8F0'; // Энергичный фон
	}

	// Базовые стили
	const baseStyles = {
		page: {
			padding: settings.layout === 'minimal' ? 30 : 40,
			backgroundColor: bgColor,
		},
		title: {
			fontSize: settings.layout === 'minimal' ? 20 : 24,
			marginBottom: 10,
			textAlign: 'center' as const,
			fontWeight: 'bold' as const,
			color: settings.style === 'warm_family' ? accentColor : textColor,
		},
		subtitle: {
			fontSize: settings.layout === 'minimal' ? 12 : 14,
			marginBottom: settings.layout === 'minimal' ? 20 : 30,
			textAlign: 'center' as const,
			color: subtitleColor,
			fontStyle: settings.style === 'warm_family' ? ('italic' as const) : ('normal' as const),
		},
		section: {
			marginBottom: settings.layout === 'minimal' ? 15 : 20,
		},
		sectionTitle: {
			fontSize: settings.layout === 'minimal' ? 14 : 16,
			marginBottom: settings.layout === 'minimal' ? 8 : 10,
			fontWeight: 'bold' as const,
			color: accentColor,
		},
		text: {
			fontSize: settings.layout === 'minimal' ? 11 : 12,
			lineHeight:
				settings.layout === 'minimal' ? 1.5 : settings.style === 'warm_family' ? 1.8 : 1.6,
			textAlign: 'justify' as const,
			color: textColor,
		},
		// Divider Styles
		dividerPage: {
			padding: 40,
			backgroundColor: bgColor,
			justifyContent: 'center' as const,
			alignItems: 'center' as const,
			height: '100%',
		},
		dividerTitle: {
			fontSize: 32,
			marginBottom: 20,
			textAlign: 'center' as const,
			fontWeight: 'bold' as const,
			color: accentColor,
		},
		dividerContent: {
			fontSize: 14,
			textAlign: 'center' as const,
			color: subtitleColor,
			fontStyle: 'italic' as const,
		},
		// Chronicle Styles
		chronicleDate: {
			fontSize: 12,
			fontWeight: 'bold' as const,
			color: settings.style === 'warm_family' ? accentColor : subtitleColor,
			marginTop: 15,
			marginBottom: 5,
		},
	};

	// Стили для photo_text layout
	if (settings.layout === 'photo_text') {
		return StyleSheet.create({
			...baseStyles,
			section: {
				...baseStyles.section,
				padding: 15,
				backgroundColor: sectionBgColor,
				borderRadius: 5,
				border: `1px solid ${borderColor}`,
			},
		});
	}

	// Стили для text_only layout
	if (settings.layout === 'text_only') {
		return StyleSheet.create({
			...baseStyles,
			section: {
				...baseStyles.section,
				borderLeft: `3px solid ${accentColor}`,
				paddingLeft: 15,
			},
		});
	}

	// Стили для minimal layout
	return StyleSheet.create({
		...baseStyles,
		section: {
			...baseStyles.section,
			paddingBottom: 10,
			borderBottom: `1px solid ${borderColor}`,
		},
	});
}

// PDF Document Component
function _BookPDF({
	story,
	metadata,
	translations,
	settings,
	photos,
}: {
	story: StoryJson;
	metadata: BookMetadata;
	translations: {
		prologue: string;
		chapter: string;
		epilogue: string;
		achievements: string;
		table_of_contents: string;
	};
	settings: BookSettings;
	photos: BookPhoto[];
}) {
	const pdfStyles = createPDFStyles(settings);

	return (
		<Document>
			<Page size="A4" style={pdfStyles.page}>
				{/* Title Page */}
				<View style={pdfStyles.section}>
					<Text style={pdfStyles.title}>
						{metadata.diaryEmoji || '📖'} {story.title}
					</Text>
					<Text style={pdfStyles.subtitle}>{story.subtitle}</Text>
				</View>

				{/* Table of Contents */}
				<View break style={pdfStyles.section}>
					<Text style={pdfStyles.sectionTitle}>{translations.table_of_contents}</Text>
					<View style={{ marginTop: 10 }}>
						{(story.chapters || []).map((chapter, index) => (
							<Text
								key={`chapter-${index}-${chapter.title}`}
								style={{ ...pdfStyles.text, marginBottom: 5 }}
							>
								{index + 1}. {chapter.title}
							</Text>
						))}
						{Array.isArray(metadata.achievements) && metadata.achievements.length > 0 && (
							<Text style={{ ...pdfStyles.text, marginBottom: 5 }}>
								{story.chapters?.length + 1}. {translations.achievements}
							</Text>
						)}
					</View>
				</View>

				{/* Prologue */}
				{story.prologue && (
					<View break style={pdfStyles.section}>
						<Text style={pdfStyles.sectionTitle}>{translations.prologue}</Text>
						<Text style={pdfStyles.text}>{story.prologue}</Text>
					</View>
				)}

				{/* Chapters */}
				{(story.chapters || []).map((chapter, index) => {
					// ✅ 1. Divider Page
					if (chapter.is_divider) {
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: static list
							<View break key={`divider-${index}`} style={pdfStyles.dividerPage}>
								<Text style={pdfStyles.dividerTitle}>{chapter.title}</Text>
								<Text style={pdfStyles.dividerContent}>{chapter.content}</Text>
							</View>
						);
					}

					// ✅ 2. Chronicle Chapter
					if (chapter.is_chronicle) {
						return (
							// biome-ignore lint/suspicious/noArrayIndexKey: static list
							<View break key={`chronicle-${index}`} style={pdfStyles.section}>
								<Text style={pdfStyles.sectionTitle}>{chapter.title}</Text>
								{(chapter.content || '').split('\n').map((line, lineIndex) => {
									// Check if line is a date header (starts with **)
									if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
										return (
											// biome-ignore lint/suspicious/noArrayIndexKey: static list
											<Text key={lineIndex} style={pdfStyles.chronicleDate}>
												{line.replace(/\*\*/g, '')}
											</Text>
										);
									}
									return (
										// biome-ignore lint/suspicious/noArrayIndexKey: static list
										<Text key={lineIndex} style={pdfStyles.text}>
											{line}
										</Text>
									);
								})}
							</View>
						);
					}

					// ✅ 3. Standard Story Chapter
					return (
						<View break key={chapter.title || `${index}`} style={pdfStyles.section}>
							<Text style={pdfStyles.sectionTitle}>
								{translations.chapter} {index + 1}: {chapter.title}
							</Text>

							{/* Photos for this chapter */}
							{photos
								.filter((p) => p.chapterIndex === index)
								.map((photo) => (
									<View key={photo.id} style={{ marginBottom: 10, alignItems: 'center' }}>
										<Image
											src={photo.photoUrl}
											style={{
												width: '100%',
												height: 200,
												objectFit: 'contain',
												marginBottom: 5,
											}}
										/>
										{photo.caption && (
											<Text
												style={{
													fontSize: 10,
													color: '#666',
													textAlign: 'center',
													fontStyle: 'italic',
												}}
											>
												{photo.caption}
											</Text>
										)}
									</View>
								))}

							<Text style={pdfStyles.text}>{chapter.content}</Text>
						</View>
					);
				})}

				{/* Achievements Chapter */}
				{Array.isArray(metadata.achievements) && metadata.achievements.length > 0 && (
					<View break style={pdfStyles.section}>
						<Text style={pdfStyles.sectionTitle}>{translations.achievements}</Text>
						{metadata.achievements.map((achievement, index) => (
							<View key={achievement.id || `${index}`} style={{ marginBottom: 6 }}>
								{achievement.summary && <Text style={pdfStyles.text}>• {achievement.summary}</Text>}
							</View>
						))}
					</View>
				)}

				{/* Epilogue */}
				{story.epilogue && (
					<View break style={pdfStyles.section}>
						<Text style={pdfStyles.sectionTitle}>{translations.epilogue}</Text>
						<Text style={pdfStyles.text}>{story.epilogue}</Text>
					</View>
				)}

				{/* Dedication */}
				{story.dedication && (
					<View break style={pdfStyles.section}>
						<Text style={pdfStyles.text}>{story.dedication}</Text>
					</View>
				)}
			</Page>
		</Document>
	);
}

export function BookDraftEditor({ draftId, onComplete, onCancel }: BookDraftEditorProps) {
	const { t } = useTranslation();
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [_isRendering, setIsRendering] = useState(false);
	const [draft, setDraft] = useState<{
		metadata?: BookMetadata | null;
		layout?: 'photo_text' | 'text_only' | 'minimal';
		style?: 'warm_family' | 'biographical' | 'motivational';
		theme?: 'light' | 'dark';
		planType?: 'free' | 'premium';
		pdfUrl?: string | null;
		is_draft?: boolean;
		is_final?: boolean;
	} | null>(null);
	const [story, setStory] = useState<StoryJson | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	const [photos, setPhotos] = useState<BookPhoto[]>([]);
	const [uploadingPhotoForChapter, setUploadingPhotoForChapter] = useState<number | null>(null);

	// Get user ID from session
	useEffect(() => {
		const getUserId = async () => {
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (session?.user?.id) {
				setUserId(session.user.id);
			}
		};
		void getUserId();
	}, []);

	// Load draft once userId is known
	useEffect(() => {
		if (!userId) return;
		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: draft loading requires multiple data fetches
		const loadDraft = async () => {
			try {
				setIsLoading(true);
				const supabase = createClient();

				const { data, error } = await supabase
					.from('books_archive')
					.select('*')
					.eq('id', draftId)
					.eq('user_id', userId)
					.single();

				if (error) {
					console.error('[DRAFT-EDITOR] Error loading draft:', error);
					toast.error('Не удалось загрузить черновик');
					return;
				}

				setDraft({
					metadata: (data as { metadata?: BookMetadata | null }).metadata || null,
					layout:
						(data as { layout?: 'photo_text' | 'text_only' | 'minimal' }).layout || 'photo_text',
					style:
						(data as { style?: 'warm_family' | 'biographical' | 'motivational' }).style ||
						'warm_family',
					theme: (data as { theme?: 'light' | 'dark' }).theme || 'light',
					planType: (data as { plan_type?: 'free' | 'premium' }).plan_type || 'premium',
					pdfUrl: (data as { pdf_url?: string | null }).pdf_url || null,
				});
				const storyData = (data as { story_json: StoryJson }).story_json;
				// ✅ FIX: Ensure chapters array exists
				if (storyData && !storyData.chapters) {
					storyData.chapters = [];
				}
				setStory(storyData);

				// Load photos
				const { data: photosData } = await supabase
					.from('book_photos')
					.select('*')
					.eq('book_id', draftId);

				if (photosData) {
					setPhotos(
						photosData.map((p) => ({
							id: p.id,
							bookId: p.book_id,
							chapterIndex: p.chapter_index,
							photoUrl: p.photo_url,
							caption: p.caption,
						}))
					);
				}
			} catch (error) {
				console.error('[DRAFT-EDITOR] Error:', error);
				toast.error(t('books.editor.error', 'Произошла ошибка'));
			} finally {
				setIsLoading(false);
			}
		};
		void loadDraft();
	}, [draftId, userId, t]);

	// Handle photo upload
	const handlePhotoUpload = async (chapterIndex: number, file: File) => {
		if (!userId) return;

		try {
			setUploadingPhotoForChapter(chapterIndex);
			const supabase = createClient();
			const fileExt = file.name.split('.').pop();
			const fileName = `${userId}/${draftId}/${uuidv4()}.${fileExt}`;

			// Upload to storage
			const { error: uploadError } = await supabase.storage
				.from('book-photos')
				.upload(fileName, file);

			if (uploadError) throw uploadError;

			const {
				data: { publicUrl },
			} = supabase.storage.from('book-photos').getPublicUrl(fileName);

			// Save to database
			const { data: photoData, error: dbError } = await supabase
				.from('book_photos')
				.insert({
					book_id: draftId,
					chapter_index: chapterIndex,
					photo_url: publicUrl,
				})
				.select()
				.single();

			if (dbError) throw dbError;

			setPhotos((prev) => [
				...prev,
				{
					id: photoData.id,
					bookId: photoData.book_id,
					chapterIndex: photoData.chapter_index,
					photoUrl: photoData.photo_url,
					caption: photoData.caption,
				},
			]);

			toast.success(t('books.photo_uploaded', 'Фото загружено'));
		} catch (error) {
			console.error('[DRAFT-EDITOR] Error uploading photo:', error);
			toast.error(t('books.photo_upload_error', 'Ошибка загрузки фото'));
		} finally {
			setUploadingPhotoForChapter(null);
		}
	};

	// Handle photo delete
	const handleDeletePhoto = async (photoId: string) => {
		try {
			const supabase = createClient();
			const { error } = await supabase.from('book_photos').delete().eq('id', photoId);

			if (error) throw error;

			setPhotos((prev) => prev.filter((p) => p.id !== photoId));
			toast.success(t('books.photo_deleted', 'Фото удалено'));
		} catch (error) {
			console.error('[DRAFT-EDITOR] Error deleting photo:', error);
			toast.error(t('books.photo_delete_error', 'Ошибка удаления фото'));
		}
	};

	// Save draft
	const handleSave = async () => {
		if (!story) return;

		try {
			setIsSaving(true);
			const supabase = createClient();

			// ✅ Получаем текущий статус книги
			const { data: currentBook } = await supabase
				.from('books_archive')
				.select('is_draft, is_final')
				.eq('id', draftId)
				.single();

			// ✅ Если это черновик - при сохранении делаем его готовой книгой
			// ✅ Если это готовая книга - просто обновляем (сохраняем поверх старой версии)
			const updateData: {
				story_json: StoryJson;
				updated_at: string;
				is_draft?: boolean;
				is_final?: boolean;
			} = {
				story_json: story,
				updated_at: new Date().toISOString(),
			};

			// Если это черновик - меняем статус на "Готово"
			const isDraftToFinal = currentBook?.is_draft;
			if (isDraftToFinal) {
				updateData.is_draft = false;
				updateData.is_final = true;
			}
			// Если это готовая книга - просто обновляем (не меняем статус)

			const { error } = await supabase.from('books_archive').update(updateData).eq('id', draftId);

			if (error) {
				console.error('[DRAFT-EDITOR] Error saving:', error);
				toast.error(t('books.editor.save_error', 'Не удалось сохранить изменения'));
				return;
			}

			// ✅ FIX: Если черновик стал готовой книгой, просто меняем статус
			// PDF создается отдельно через кнопку "Создать PDF" или автоматически при первом просмотре
			if (isDraftToFinal) {
				console.log('[DRAFT-EDITOR] Draft became final, book saved successfully');
				toast.success(t('books.editor.save_success_ready', 'Книга сохранена и готова!'));
			} else {
				toast.success(t('books.editor.save_success', 'Изменения сохранены'));
			}

			// ✅ После сохранения обновляем локальное состояние и НЕ закрываем редактор
			// Пользователь может продолжить редактирование или создать PDF
			setDraft((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					is_draft: !isDraftToFinal,
					is_final: isDraftToFinal,
				};
			});
		} catch (error) {
			console.error('[DRAFT-EDITOR] Error:', error);
			toast.error(t('books.editor.error', 'Произошла ошибка'));
		} finally {
			setIsSaving(false);
		}
	};

	// Render PDF using Puppeteer (server-side)
	const handleRenderPDF = async (_blob?: Blob) => {
		if (!userId) {
			toast.error(t('books.editor.auth_required', 'Необходима авторизация'));
			return;
		}

		try {
			setIsRendering(true);

			// Get access token
			const supabase = createClient();
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				toast.error(t('books.editor.auth_required', 'Необходима авторизация'));
				setIsRendering(false);
				return;
			}

			// ✅ P1: Use Puppeteer for server-side PDF rendering
			// This provides better Unicode support, stability for long books
			const response = await fetch(API_URLS.BOOKS_RENDER_PUPPETEER, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.access_token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					bookId: draftId,
				}),
			});

			if (!response.ok) {
				let errorMessage = `HTTP ${response.status}`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.error || errorMessage;
				} catch {
					const errorText = await response.text();
					errorMessage = errorText || errorMessage;
				}
				console.error('[DRAFT-EDITOR] PDF creation failed:', response.status, errorMessage);
				throw new Error(errorMessage);
			}

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || 'Не удалось создать PDF');
			}

			// ✅ FIX: Обновляем локальное состояние с новым pdfUrl и статусом
			setDraft((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					pdfUrl: result.pdfUrl,
					is_draft: false,
					is_final: true,
				};
			});

			// ✅ FIX: Обновляем книгу в БД для синхронизации (на случай если Edge Function не обновил)
			try {
				const supabase = createClient();
				await supabase
					.from('books_archive')
					.update({
						pdf_url: result.pdfUrl,
						is_final: true,
						is_draft: false,
					})
					.eq('id', draftId);
				console.log('[DRAFT-EDITOR] Book status updated in database');
			} catch (error) {
				console.warn('[DRAFT-EDITOR] Failed to update book status:', error);
				// Не критично, Edge Function уже обновил
			}

			// ✅ FIX: Ждем немного, чтобы PDF успел стать доступным в Storage
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Проверяем доступность PDF с retry (до 3 попыток)
			let isAvailable = false;
			for (let attempt = 0; attempt < 3; attempt++) {
				try {
					const checkResponse = await fetch(result.pdfUrl, { method: 'HEAD' });
					if (checkResponse.ok) {
						isAvailable = true;
						break;
					}
				} catch (error) {
					console.warn(
						`[DRAFT-EDITOR] PDF availability check attempt ${attempt + 1} failed:`,
						error
					);
				}

				if (attempt < 2 && !isAvailable) {
					await new Promise((resolve) => setTimeout(resolve, 1000));
				}
			}

			if (isAvailable) {
				toast.success(t('books.editor.pdf_created', 'PDF книга создана!'));
				console.log('[DRAFT-EDITOR] PDF URL:', result.pdfUrl);

				// ✅ FIX: Вызываем onComplete для обновления списка книг в библиотеке
				// Это обновит список книг, если пользователь вернется в библиотеку
				onComplete?.();
			} else {
				console.warn('[DRAFT-EDITOR] PDF created but not yet available');
				toast.warning(
					t('books.editor.pdf_warning', 'PDF создан, но еще не доступен. Попробуйте позже.')
				);
			}
		} catch (error) {
			console.error('[DRAFT-EDITOR] Error rendering PDF:', error);
			toast.error(t('books.editor.pdf_error', 'Произошла ошибка при создании PDF'));
		} finally {
			setIsRendering(false);
		}
	};

	if (isLoading) {
		return (
			<div className="scrollbar-hide fixed inset-0 z-50 overflow-y-auto bg-background">
				<div className="p-4 sm:p-6">
					<Card>
						<CardHeader>
							<Skeleton className="h-6 w-3/4" />
						</CardHeader>
						<CardContent>
							<Skeleton className="mb-4 h-20 w-full" />
							<Skeleton className="mb-4 h-20 w-full" />
							<Skeleton className="h-20 w-full" />
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	if (!story) {
		return (
			<div className="scrollbar-hide fixed inset-0 z-50 overflow-y-auto bg-background">
				<div className="p-4 sm:p-6">
					<Card>
						<CardContent className="py-12 text-center">
							<p className="text-muted-foreground text-sm sm:text-base">
								{t('books.editor.draft_not_found', 'Черновик не найден')}
							</p>
							{onCancel && (
								<Button
									className="mt-4"
									onClick={onCancel}
									style={{ minHeight: '44px' }}
									variant="outline"
								>
									<span className="text-sm sm:text-base">{t('common.back', 'Назад')}</span>
								</Button>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="scrollbar-hide fixed inset-0 z-50 overflow-y-auto bg-background">
			{/* Header */}
			<div className="border-b border-border bg-[var(--ios-bg-primary)] p-4 text-[var(--ios-text-primary)] sm:p-6">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm sm:h-12 sm:w-12">
						<Sparkles className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
					</div>
					<div>
						<h2 className="text-lg sm:text-xl">
							{t('books.editor.header_title', 'Редактор книги')}
						</h2>
						<p className="text-muted-foreground text-xs opacity-90 sm:text-sm">
							{t('books.editor.header_subtitle', 'Черновик книги')}
						</p>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-h-[calc(100vh-120px)] overflow-y-auto p-4 sm:p-6">
				<div className="space-y-4">
					{/* FREE Book Notice with Upsell */}
					{draft?.planType === 'free' && (
						<Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
							<CardContent className="py-4">
								<div className="flex items-start gap-3">
									<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20">
										<Sparkles className="h-5 w-5 text-primary" strokeWidth={2} />
									</div>
									<div className="flex-1 space-y-2">
										<p className="text-primary text-sm font-semibold">
											📖 FREE книга — упрощенный редактор
										</p>
										<p className="text-muted-foreground text-xs leading-relaxed">
											Вы можете изменить название, подзаголовок и добавить фото. Для редактирования
											текста, AI-глав и персональных историй перейдите на Premium.
										</p>
										<Button
											className="mt-2 h-8 text-xs"
											onClick={() => {
												// Navigate to premium upsell
												window.location.href = '/?view=admin#subscriptions';
											}}
											size="sm"
											variant="default"
										>
											<Sparkles className="mr-1.5 h-3 w-3" />
											Перейти на Premium
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardHeader>
							<CardTitle>{t('books.editor.title', 'Основная информация')}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 sm:space-y-4">
							<div>
								<Label className="text-sm sm:text-base" htmlFor="title">
									{t('books.editor.book_title', 'Название книги')}
								</Label>
								<input
									className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm transition-colors duration-300 sm:text-base"
									id="title"
									onChange={(e) => setStory({ ...story, title: e.target.value })}
									style={{ minHeight: '44px' }}
									value={story.title}
								/>
							</div>
							<div>
								<Label className="text-sm sm:text-base" htmlFor="subtitle">
									{t('books.editor.subtitle', 'Подзаголовок')}
								</Label>
								<input
									className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm transition-colors duration-300 sm:text-base"
									id="subtitle"
									onChange={(e) => setStory({ ...story, subtitle: e.target.value })}
									style={{ minHeight: '44px' }}
									value={story.subtitle}
								/>
							</div>
							{/* Prologue - только для PREMIUM */}
							{draft?.planType !== 'free' && (
								<div>
									<Label className="text-sm sm:text-base" htmlFor="prologue">
										{t('books.pdf.prologue', 'Вступление')}
									</Label>
									<textarea
										className="mt-2 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm transition-colors duration-300 sm:text-base"
										id="prologue"
										onChange={(e) => setStory({ ...story, prologue: e.target.value })}
										rows={4}
										value={story.prologue}
									/>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Chapters - только для PREMIUM */}
					{draft?.planType !== 'free' && (
						<Card>
							<CardHeader>
								<CardTitle>Главы ({story.chapters?.length || 0})</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{(story.chapters || []).map((chapter, index) => (
									<div className="rounded-lg border p-4" key={chapter.title || `${index}`}>
										<Label>
											{t('books.pdf.chapter', 'Глава')} {index + 1}
										</Label>
										<input
											className="mt-2 w-full rounded-lg border bg-background px-3 py-2 transition-colors duration-300"
											onChange={(e) => {
												const newChapters = [...(story.chapters || [])];
												newChapters[index] = { ...chapter, title: e.target.value };
												setStory({ ...story, chapters: newChapters });
											}}
											placeholder="Название главы"
											value={chapter.title}
										/>
										<textarea
											className="mt-2 w-full resize-none rounded-lg border bg-background px-3 py-2 transition-colors duration-300"
											onChange={(e) => {
												const newChapters = [...(story.chapters || [])];
												newChapters[index] = { ...chapter, content: e.target.value };
												setStory({ ...story, chapters: newChapters });
											}}
											placeholder="Содержание главы"
											rows={4}
											value={chapter.content}
										/>

										{/* Photos for chapter */}
										{draft?.layout === 'photo_text' && (
											<div className="mt-4">
												<Label className="mb-2 block text-xs text-muted-foreground">
													{t('books.photos', 'Фотографии')}
												</Label>
												<div className="flex flex-wrap gap-2">
													{photos
														.filter((p) => p.chapterIndex === index)
														.map((photo) => (
															<div className="group relative" key={photo.id}>
																<img
																	alt="Chapter"
																	className="h-20 w-20 rounded-md border border-border object-cover"
																	src={photo.photoUrl}
																/>
																<button
																	className="absolute -top-1 -right-1 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
																	onClick={() => handleDeletePhoto(photo.id)}
																	type="button"
																>
																	<Trash2 className="h-3 w-3" />
																</button>
															</div>
														))}
													<label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-md border border-muted-foreground/50 border-dashed transition-colors hover:bg-accent">
														{uploadingPhotoForChapter === index ? (
															<Sparkles className="h-5 w-5 animate-spin text-muted-foreground" />
														) : (
															<>
																<ImageIcon className="mb-1 h-5 w-5 text-muted-foreground" />
																<span className="text-[10px] text-muted-foreground">
																	{t('books.add_photo', 'Добавить')}
																</span>
															</>
														)}
														<input
															accept="image/*"
															className="hidden"
															disabled={uploadingPhotoForChapter === index}
															onChange={(e) => {
																if (e.target.files?.[0]) {
																	handlePhotoUpload(index, e.target.files[0]);
																}
															}}
															type="file"
														/>
													</label>
												</div>
											</div>
										)}
									</div>
								))}
							</CardContent>
						</Card>
					)}

					{/* FREE Book: Photo Collage */}
					{draft?.planType === 'free' && photos.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle>Фотографии</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-3 gap-2">
									{photos.map((photo) => (
										<div className="group relative" key={photo.id}>
											<img
												alt={photo.caption || 'Book photo'}
												className="h-24 w-full rounded-md border border-border object-cover"
												src={photo.photoUrl}
											/>
											<button
												className="absolute -top-1 -right-1 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
												onClick={() => handleDeletePhoto(photo.id)}
												type="button"
											>
												<Trash2 className="h-3 w-3" />
											</button>
										</div>
									))}
								</div>
								<label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-4 transition-colors duration-300 hover:border-primary">
									<Upload className="mb-2 h-8 w-8 text-muted-foreground" />
									<span className="text-muted-foreground text-sm">Добавить фото</span>
									<input
										accept="image/*"
										className="hidden"
										disabled={uploadingPhotoForChapter !== null}
										onChange={(e) => {
											if (e.target.files?.[0]) {
												handlePhotoUpload(0, e.target.files[0]); // Use chapter 0 for FREE
											}
										}}
										type="file"
									/>
								</label>
							</CardContent>
						</Card>
					)}

					<div className="flex flex-wrap gap-2">
						<Button className="flex-1" disabled={isSaving || _isRendering} onClick={handleSave}>
							<Save className="mr-2 h-4 w-4" strokeWidth={2} />
							{isSaving ? 'Сохранение...' : 'Сохранить'}
						</Button>
						{/* Кнопка создания PDF - показывается если PDF еще не создан */}
						{!draft?.pdfUrl && (
							<Button
								disabled={_isRendering || isSaving}
								onClick={() => {
									void handleRenderPDF();
								}}
								variant="default"
							>
								<Sparkles className="mr-2 h-4 w-4" strokeWidth={2} />
								{_isRendering ? 'Создание PDF...' : 'Создать PDF'}
							</Button>
						)}
						{/* Кнопка просмотра PDF - открывает в новой вкладке */}
						{draft?.pdfUrl && (
							<Button
								onClick={() => {
									window.open(draft.pdfUrl, '_blank');
								}}
								variant="outline"
							>
								<Eye className="mr-2 h-4 w-4" strokeWidth={2} />
								Просмотр
							</Button>
						)}
						{onCancel && (
							<Button onClick={onCancel} variant="outline">
								Отмена
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
