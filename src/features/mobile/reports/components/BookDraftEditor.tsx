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

import { BlobProvider, Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Download, Eye, Save, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
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
	}>;
	epilogue: string;
	dedication?: string;
};

type BookMetadata = {
	diaryEmoji?: string;
	[key: string]: unknown;
};

// PDF Styles
const pdfStyles = StyleSheet.create({
	page: {
		padding: 40,
		backgroundColor: '#FFFFFF',
	},
	title: {
		fontSize: 24,
		marginBottom: 10,
		textAlign: 'center',
		fontWeight: 'bold',
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
	},
	text: {
		fontSize: 12,
		lineHeight: 1.6,
		textAlign: 'justify',
	},
});

// PDF Document Component
function BookPDF({ story, metadata }: { story: StoryJson; metadata: BookMetadata }) {
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

				{/* Prologue */}
				{story.prologue && (
					<View style={pdfStyles.section}>
						<Text style={pdfStyles.sectionTitle}>Вступление</Text>
						<Text style={pdfStyles.text}>{story.prologue}</Text>
					</View>
				)}

				{/* Chapters */}
				{story.chapters.map((chapter, index) => (
					<View key={chapter.title || `${index}`} style={pdfStyles.section}>
						<Text style={pdfStyles.sectionTitle}>
							Глава {index + 1}: {chapter.title}
						</Text>
						<Text style={pdfStyles.text}>{chapter.content}</Text>
					</View>
				))}

				{/* Epilogue */}
				{story.epilogue && (
					<View style={pdfStyles.section}>
						<Text style={pdfStyles.sectionTitle}>Заключение</Text>
						<Text style={pdfStyles.text}>{story.epilogue}</Text>
					</View>
				)}

				{/* Dedication */}
				{story.dedication && (
					<View style={pdfStyles.section}>
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
	const [isRendering, setIsRendering] = useState(false);
	const [draft, setDraft] = useState<{ metadata?: BookMetadata | null } | null>(null);
	const [story, setStory] = useState<StoryJson | null>(null);
	const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
	const [userId, setUserId] = useState<string | null>(null);

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

				setDraft((data as { metadata?: BookMetadata | null }) || null);
				setStory((data as { story_json: StoryJson }).story_json);
			} catch (error) {
				console.error('[DRAFT-EDITOR] Error:', error);
				toast.error(t('books.editor.error', 'Произошла ошибка'));
			} finally {
				setIsLoading(false);
			}
		};
		void loadDraft();
	}, [draftId, userId]);

	// Save draft
	const handleSave = async () => {
		if (!story) return;

		try {
			setIsSaving(true);
			const supabase = createClient();

			const { error } = await supabase
				.from('books_archive')
				.update({
					story_json: story,
					updated_at: new Date().toISOString(),
				})
				.eq('id', draftId);

			if (error) {
				console.error('[DRAFT-EDITOR] Error saving:', error);
				toast.error(t('books.editor.save_error', 'Не удалось сохранить изменения'));
				return;
			}

			toast.success(t('books.editor.save_success', 'Изменения сохранены'));
		} catch (error) {
			console.error('[DRAFT-EDITOR] Error:', error);
			toast.error(t('books.editor.error', 'Произошла ошибка'));
		} finally {
			setIsSaving(false);
		}
	};

	// Render PDF and upload
	const handleRenderPDF = async (blob: Blob) => {
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

			// Upload PDF to Supabase Storage via Edge Function
			const formData = new FormData();
			formData.append('pdf', blob, `book-${draftId}.pdf`);

			const response = await fetch(`${API_URLS.BOOKS_RENDER_PDF}/${draftId}/upload`, {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${session.access_token}`,
				},
				body: formData,
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || 'Не удалось загрузить PDF');
			}

			toast.success('PDF книга создана!');
			onComplete?.();
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
							<p className="text-muted-foreground text-sm sm:text-base">Черновик не найден</p>
							{onCancel && (
								<Button
									className="mt-4"
									onClick={onCancel}
									style={{ minHeight: '44px' }}
									variant="outline"
								>
									<span className="text-sm sm:text-base">Назад</span>
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
			<div className="bg-linear-to-r from-purple-600 to-blue-600 p-4 text-white sm:p-6">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-card/20 backdrop-blur-sm sm:h-12 sm:w-12">
						<Sparkles className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
					</div>
					<div>
						<h2 className="text-lg sm:text-xl">Редактор книги</h2>
						<p className="text-muted-foreground text-xs opacity-90 sm:text-sm">Черновик</p>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="max-h-[calc(100vh-120px)] overflow-y-auto p-4 sm:p-6">
				<Tabs onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')} value={activeTab}>
					<TabsList className="mb-4 grid w-full grid-cols-2">
						<TabsTrigger className="text-xs sm:text-sm" value="edit">
							<Save className="mr-1 h-4 w-4 sm:mr-2" strokeWidth={2} />
							<span className="hidden sm:inline">Редактировать</span>
							<span className="sm:hidden">Правка</span>
						</TabsTrigger>
						<TabsTrigger className="text-xs sm:text-sm" value="preview">
							<Eye className="mr-1 h-4 w-4 sm:mr-2" strokeWidth={2} />
							<span className="hidden sm:inline">Предпросмотр</span>
							<span className="sm:hidden">Просмотр</span>
						</TabsTrigger>
					</TabsList>

					{/* Edit Tab */}
					<TabsContent className="space-y-4" value="edit">
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
								<div>
									<Label className="text-sm sm:text-base" htmlFor="prologue">
										Вступление
									</Label>
									<textarea
										className="mt-2 w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm transition-colors duration-300 sm:text-base"
										id="prologue"
										onChange={(e) => setStory({ ...story, prologue: e.target.value })}
										rows={4}
										value={story.prologue}
									/>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Главы ({story.chapters.length})</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{story.chapters.map((chapter, index) => (
									<div className="rounded-lg border p-4" key={chapter.title || `${index}`}>
										<Label>Глава {index + 1}</Label>
										<input
											className="mt-2 w-full rounded-lg border bg-background px-3 py-2 transition-colors duration-300"
											onChange={(e) => {
												const newChapters = [...story.chapters];
												newChapters[index] = { ...chapter, title: e.target.value };
												setStory({ ...story, chapters: newChapters });
											}}
											placeholder="Название главы"
											value={chapter.title}
										/>
										<textarea
											className="mt-2 w-full resize-none rounded-lg border bg-background px-3 py-2 transition-colors duration-300"
											onChange={(e) => {
												const newChapters = [...story.chapters];
												newChapters[index] = { ...chapter, content: e.target.value };
												setStory({ ...story, chapters: newChapters });
											}}
											placeholder="Содержание главы"
											rows={4}
											value={chapter.content}
										/>
									</div>
								))}
							</CardContent>
						</Card>

						<div className="flex gap-2">
							<Button className="flex-1" disabled={isSaving} onClick={handleSave}>
								<Save className="mr-2 h-4 w-4" strokeWidth={2} />
								{isSaving ? 'Сохранение...' : 'Сохранить'}
							</Button>
							{onCancel && (
								<Button onClick={onCancel} variant="outline">
									Отмена
								</Button>
							)}
						</div>
					</TabsContent>

					{/* Preview Tab */}
					<TabsContent value="preview">
						<Card>
							<CardHeader>
								<CardTitle>Предпросмотр PDF</CardTitle>
							</CardHeader>
							<CardContent>
								<BlobProvider document={<BookPDF metadata={draft?.metadata ?? {}} story={story} />}>
									{({ blob, url, loading }) => {
										if (loading) {
											return (
												<div className="py-12 text-center">
													<Sparkles
														className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-500"
														strokeWidth={2}
													/>
													<p className="text-muted-foreground">Генерация предпросмотра...</p>
												</div>
											);
										}

										return (
											<div className="space-y-3 sm:space-y-4">
												<iframe
													className="h-[400px] w-full rounded-lg border sm:h-[600px]"
													src={url || ''}
													title="PDF Preview"
												/>
												<div className="flex gap-2">
													<Button
														className="flex-1"
														disabled={isRendering}
														onClick={() => blob && handleRenderPDF(blob)}
														style={{ minHeight: '44px' }}
													>
														<Download className="mr-1 h-4 w-4 sm:mr-2" strokeWidth={2} />
														<span className="text-sm sm:text-base">
															{isRendering ? 'Создание PDF...' : 'Создать финальную версию'}
														</span>
													</Button>
												</div>
											</div>
										);
									}}
								</BlobProvider>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
