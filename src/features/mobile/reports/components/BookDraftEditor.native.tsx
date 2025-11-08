/**
 * Book Draft Editor (React Native)
 *
 * React Native version of BookDraftEditor.
 *
 * Features:
 * - Edit title, prologue, chapters, epilogue
 * - Save draft
 * - Note: PDF rendering will be handled server-side for React Native
 *
 * @author UNITY Team
 * @date 2025-11-07
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { DesignTokens } from '@/app-shared/design-system/tokens';
import { API_URLS } from '@/shared/lib/api/config/urls';
import { supabase } from '@/shared/lib/api/supabase/client';
import { useAuth } from '@/shared/lib/hooks/useAuth';

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

export function BookDraftEditor({ draftId, onComplete, onCancel }: BookDraftEditorProps) {
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isRendering, setIsRendering] = useState(false);
	const [_draft, setDraft] = useState<any>(null);
	const [story, setStory] = useState<StoryJson | null>(null);

	// Load draft on mount
	useEffect(() => {
		const loadDraft = async () => {
			if (!user?.id) return;

			try {
				setIsLoading(true);

				const { data, error } = await supabase
					.from('books_archive')
					.select('*')
					.eq('id', draftId)
					.eq('user_id', user.id)
					.single();

				if (error) {
					console.error('[DRAFT-EDITOR] Error loading draft:', error);
					Alert.alert('Ошибка', 'Не удалось загрузить черновик');
					return;
				}

				setDraft(data);
				setStory(data.story_json);
			} catch (error) {
				console.error('[DRAFT-EDITOR] Error:', error);
				Alert.alert('Ошибка', 'Произошла ошибка');
			} finally {
				setIsLoading(false);
			}
		};

		loadDraft();
	}, [user?.id, draftId]);

	// Save draft
	const handleSave = async () => {
		if (!story) return;

		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

		try {
			setIsSaving(true);

			const { error } = await supabase
				.from('books_archive')
				.update({
					story_json: story,
					updated_at: new Date().toISOString(),
				})
				.eq('id', draftId);

			if (error) {
				console.error('[DRAFT-EDITOR] Error saving:', error);
				Alert.alert('Ошибка', 'Не удалось сохранить изменения');
				return;
			}

			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			Alert.alert('Успех', 'Изменения сохранены');
		} catch (error) {
			console.error('[DRAFT-EDITOR] Error:', error);
			Alert.alert('Ошибка', 'Произошла ошибка');
		} finally {
			setIsSaving(false);
		}
	};

	// Render PDF (server-side for React Native)
	const handleRenderPDF = async () => {
		if (!user?.id) return;

		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

		try {
			setIsRendering(true);

			// Get access token
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session?.access_token) {
				Alert.alert('Ошибка', 'Необходима авторизация');
				return;
			}

			// Call Edge Function to render PDF server-side
			const response = await fetch(`${API_URLS.BOOKS_RENDER_PDF}/${draftId}`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.access_token}`,
					'Content-Type': 'application/json',
				},
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || 'Не удалось создать PDF');
			}

			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			Alert.alert('Успех', 'PDF книга создана!', [
				{
					text: 'OK',
					onPress: () => onComplete?.(),
				},
			]);
		} catch (error) {
			console.error('[DRAFT-EDITOR] Error rendering PDF:', error);
			Alert.alert('Ошибка', 'Произошла ошибка при создании PDF');
		} finally {
			setIsRendering(false);
		}
	};

	if (isLoading) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator color={DesignTokens.colors.purple} size="large" />
					<Text style={styles.loadingText}>Загрузка черновика...</Text>
				</View>
			</View>
		);
	}

	if (!story) {
		return (
			<View style={styles.container}>
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>Черновик не найден</Text>
					{onCancel && (
						<Pressable
							onPress={async () => {
								await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								onCancel();
							}}
							style={({ pressed }) => [
								styles.button,
								styles.buttonOutline,
								pressed && styles.buttonPressed,
							]}
						>
							<Text style={styles.buttonTextOutline}>Назад</Text>
						</Pressable>
					)}
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.headerIcon}>
					<Ionicons color={DesignTokens.colors.card} name="sparkles" size={24} />
				</View>
				<View style={styles.headerText}>
					<Text style={styles.headerTitle}>Редактор книги</Text>
					<Text style={styles.headerSubtitle}>Черновик</Text>
				</View>
			</View>

			{/* Content */}
			<ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
				{/* Basic Info */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Основная информация</Text>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Название книги</Text>
						<TextInput
							onChangeText={(text) => setStory({ ...story, title: text })}
							placeholder="Название книги"
							placeholderTextColor={DesignTokens.colors.textSecondary}
							style={styles.input}
							value={story.title}
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Подзаголовок</Text>
						<TextInput
							onChangeText={(text) => setStory({ ...story, subtitle: text })}
							placeholder="Подзаголовок"
							placeholderTextColor={DesignTokens.colors.textSecondary}
							style={styles.input}
							value={story.subtitle}
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Вступление</Text>
						<TextInput
							multiline
							numberOfLines={4}
							onChangeText={(text) => setStory({ ...story, prologue: text })}
							placeholder="Вступление"
							placeholderTextColor={DesignTokens.colors.textSecondary}
							style={[styles.input, styles.textArea]}
							textAlignVertical="top"
							value={story.prologue}
						/>
					</View>
				</View>

				{/* Chapters */}
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Главы ({story.chapters.length})</Text>

					{story.chapters.map((chapter, index) => (
						<View key={index} style={styles.chapterCard}>
							<Text style={styles.chapterLabel}>Глава {index + 1}</Text>
							<TextInput
								onChangeText={(text) => {
									const newChapters = [...story.chapters];
									newChapters[index] = { ...chapter, title: text };
									setStory({ ...story, chapters: newChapters });
								}}
								placeholder="Название главы"
								placeholderTextColor={DesignTokens.colors.textSecondary}
								style={styles.input}
								value={chapter.title}
							/>
							<TextInput
								multiline
								numberOfLines={4}
								onChangeText={(text) => {
									const newChapters = [...story.chapters];
									newChapters[index] = { ...chapter, content: text };
									setStory({ ...story, chapters: newChapters });
								}}
								placeholder="Содержание главы"
								placeholderTextColor={DesignTokens.colors.textSecondary}
								style={[styles.input, styles.textArea, { marginTop: DesignTokens.spacing.sm }]}
								textAlignVertical="top"
								value={chapter.content}
							/>
						</View>
					))}
				</View>

				{/* Actions */}
				<View style={styles.actions}>
					<Pressable
						disabled={isSaving}
						onPress={handleSave}
						style={({ pressed }) => [
							styles.button,
							styles.buttonPrimary,
							pressed && styles.buttonPressed,
						]}
					>
						<Ionicons color={DesignTokens.colors.card} name="save" size={20} />
						<Text style={styles.buttonText}>{isSaving ? 'Сохранение...' : 'Сохранить'}</Text>
					</Pressable>

					<Pressable
						disabled={isRendering}
						onPress={handleRenderPDF}
						style={({ pressed }) => [
							styles.button,
							styles.buttonPrimary,
							pressed && styles.buttonPressed,
						]}
					>
						<Ionicons color={DesignTokens.colors.card} name="download" size={20} />
						<Text style={styles.buttonText}>{isRendering ? 'Создание PDF...' : 'Создать PDF'}</Text>
					</Pressable>

					{onCancel && (
						<Pressable
							onPress={async () => {
								await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
								onCancel();
							}}
							style={({ pressed }) => [
								styles.button,
								styles.buttonOutline,
								pressed && styles.buttonPressed,
							]}
						>
							<Text style={styles.buttonTextOutline}>Отмена</Text>
						</Pressable>
					)}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: DesignTokens.colors.background,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: DesignTokens.spacing.xl,
	},
	loadingText: {
		marginTop: DesignTokens.spacing.md,
		fontSize: DesignTokens.typography.body.fontSize,
		color: DesignTokens.colors.textSecondary,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: DesignTokens.spacing.xl,
	},
	emptyText: {
		fontSize: DesignTokens.typography.body.fontSize,
		color: DesignTokens.colors.textSecondary,
		marginBottom: DesignTokens.spacing.lg,
	},
	header: {
		backgroundColor: DesignTokens.colors.purple,
		padding: DesignTokens.spacing.lg,
		flexDirection: 'row',
		alignItems: 'center',
		gap: DesignTokens.spacing.md,
	},
	headerIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: 'rgba(255, 255, 255, 0.2)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	headerText: {
		flex: 1,
	},
	headerTitle: {
		fontSize: DesignTokens.typography.h3.fontSize,
		fontWeight: DesignTokens.typography.h3.fontWeight as any,
		color: DesignTokens.colors.card,
	},
	headerSubtitle: {
		fontSize: DesignTokens.typography.caption.fontSize,
		color: DesignTokens.colors.card,
		opacity: 0.9,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: DesignTokens.spacing.md,
		gap: DesignTokens.spacing.md,
	},
	card: {
		backgroundColor: DesignTokens.colors.card,
		borderRadius: DesignTokens.borderRadius.lg,
		padding: DesignTokens.spacing.md,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		gap: DesignTokens.spacing.md,
	},
	cardTitle: {
		fontSize: DesignTokens.typography.h4.fontSize,
		fontWeight: DesignTokens.typography.h4.fontWeight as any,
		color: DesignTokens.colors.text,
		marginBottom: DesignTokens.spacing.sm,
	},
	inputGroup: {
		gap: DesignTokens.spacing.xs,
	},
	label: {
		fontSize: DesignTokens.typography.caption.fontSize,
		fontWeight: '500',
		color: DesignTokens.colors.textSecondary,
	},
	input: {
		backgroundColor: DesignTokens.colors.background,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		borderRadius: DesignTokens.borderRadius.md,
		padding: DesignTokens.spacing.sm,
		fontSize: DesignTokens.typography.body.fontSize,
		color: DesignTokens.colors.text,
	},
	textArea: {
		minHeight: 100,
		paddingTop: DesignTokens.spacing.sm,
	},
	chapterCard: {
		backgroundColor: DesignTokens.colors.background,
		borderRadius: DesignTokens.borderRadius.md,
		padding: DesignTokens.spacing.sm,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		gap: DesignTokens.spacing.xs,
	},
	chapterLabel: {
		fontSize: DesignTokens.typography.caption.fontSize,
		fontWeight: '600',
		color: DesignTokens.colors.text,
	},
	actions: {
		gap: DesignTokens.spacing.sm,
		marginBottom: DesignTokens.spacing.xl,
	},
	button: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: DesignTokens.spacing.xs,
		paddingVertical: DesignTokens.spacing.md,
		paddingHorizontal: DesignTokens.spacing.lg,
		borderRadius: DesignTokens.borderRadius.md,
	},
	buttonPrimary: {
		backgroundColor: DesignTokens.colors.purple,
	},
	buttonOutline: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
	},
	buttonPressed: {
		opacity: 0.7,
	},
	buttonText: {
		fontSize: DesignTokens.typography.body.fontSize,
		fontWeight: '600',
		color: DesignTokens.colors.card,
	},
	buttonTextOutline: {
		fontSize: DesignTokens.typography.body.fontSize,
		fontWeight: '600',
		color: DesignTokens.colors.text,
	},
});
