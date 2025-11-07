/**
 * Profile Edit Modal - React Native Implementation
 *
 * Simplified version for React Native (avatar upload not implemented yet)
 * Focuses on editing diary_name and diary_emoji
 *
 * @module features/mobile/settings/components/ProfileEditModal.native
 */

import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { toast } from '@/shared/components/ui/universal/Toast';
import { DesignTokens } from '@/shared/design-system/tokens';
import { updateUserProfile } from '@/shared/lib/api/services/profiles';

// Предустановленные эмодзи для дневника
const DIARY_EMOJIS = ['🏆', '📔', '✨', '💪', '🎯', '📝', '🌟', '❤️', '🔥', '📖'];

type ProfileEditModalProps = {
	isOpen: boolean;
	onClose: () => void;
	profile: {
		id: string;
		name?: string;
		email?: string;
		avatar?: string;
		diaryName?: string;
		diaryEmoji?: string;
	};
	onProfileUpdated?: (updatedProfile: any) => void;
};

export function ProfileEditModal({
	isOpen,
	onClose,
	profile,
	onProfileUpdated,
}: ProfileEditModalProps) {
	const [name, setName] = useState(profile?.name || '');
	const [email, setEmail] = useState(profile?.email || '');
	const [diaryName, setDiaryName] = useState(profile?.diaryName || 'Мой дневник');
	const [diaryEmoji, setDiaryEmoji] = useState(profile?.diaryEmoji || '📝');
	const [isSaving, setIsSaving] = useState(false);

	// Handle save
	const handleSave = async () => {
		// Validate name
		if (!name.trim()) {
			toast.error('Введите имя', {
				description: 'Имя не может быть пустым',
			});
			return;
		}

		// Validate email
		if (!(email.trim() && email.includes('@'))) {
			toast.error('Неверный email', {
				description: 'Введите корректный email адрес',
			});
			return;
		}

		// Validate diary name
		if (!diaryName.trim()) {
			toast.error('Введите название дневника', {
				description: 'Название не может быть пустым',
			});
			return;
		}

		try {
			setIsSaving(true);

			// Update profile in database
			const updatedProfile = await updateUserProfile(profile.id, {
				name: name.trim(),
				email: email.trim(),
				diaryName: diaryName.trim(),
				diaryEmoji: diaryEmoji,
			});

			toast.success('Профиль обновлен', {
				description: 'Изменения успешно сохранены',
			});

			onProfileUpdated?.(updatedProfile);
			onClose();
		} catch (error: any) {
			console.error('[PROFILE] Save error:', error);
			toast.error('Ошибка сохранения', {
				description: error.message || 'Не удалось сохранить изменения',
			});
		} finally {
			setIsSaving(false);
		}
	};

	// Handle cancel
	const handleCancel = () => {
		// Reset to original values
		setName(profile?.name || '');
		setEmail(profile?.email || '');
		setDiaryName(profile?.diaryName || 'Мой дневник');
		setDiaryEmoji(profile?.diaryEmoji || '📝');
		onClose();
	};

	return (
		<Modal animationType="slide" onRequestClose={handleCancel} transparent={true} visible={isOpen}>
			<View style={styles.overlay}>
				<View style={styles.modal}>
					{/* Header */}
					<View style={styles.header}>
						<Text style={styles.title}>Редактировать профиль</Text>
						<Pressable onPress={handleCancel} style={styles.closeButton}>
							<Text style={styles.closeButtonText}>✕</Text>
						</Pressable>
					</View>

					{/* Content */}
					<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
						{/* Name Input */}
						<View style={styles.field}>
							<Text style={styles.label}>Имя</Text>
							<TextInput
								editable={!isSaving}
								maxLength={50}
								onChangeText={setName}
								placeholder="Ваше имя"
								placeholderTextColor={DesignTokens.colors.textTertiary}
								style={styles.input}
								value={name}
							/>
							<Text style={styles.hint}>{name.length}/50 символов</Text>
						</View>

						{/* Email Input */}
						<View style={styles.field}>
							<Text style={styles.label}>Email</Text>
							<TextInput
								autoCapitalize="none"
								editable={!isSaving}
								keyboardType="email-address"
								maxLength={100}
								onChangeText={setEmail}
								placeholder="your@email.com"
								placeholderTextColor={DesignTokens.colors.textTertiary}
								style={styles.input}
								value={email}
							/>
							<Text style={styles.hint}>
								{email !== profile?.email
									? 'После смены email потребуется подтверждение'
									: 'Введите новый email для изменения'}
							</Text>
						</View>

						{/* Diary Name Input */}
						<View style={styles.field}>
							<Text style={styles.label}>Название дневника</Text>
							<TextInput
								editable={!isSaving}
								maxLength={50}
								onChangeText={setDiaryName}
								placeholder="Мой дневник достижений"
								placeholderTextColor={DesignTokens.colors.textTertiary}
								style={styles.input}
								value={diaryName}
							/>
							<Text style={styles.hint}>
								{diaryName.length}/50 символов • Используется в PDF книгах
							</Text>
						</View>

						{/* Diary Emoji Picker */}
						<View style={styles.field}>
							<Text style={styles.label}>Эмодзи дневника</Text>
							<View style={styles.emojiGrid}>
								{DIARY_EMOJIS.map((emoji) => (
									<Pressable
										disabled={isSaving}
										key={emoji}
										onPress={() => setDiaryEmoji(emoji)}
										style={({ pressed }) => [
											styles.emojiButton,
											diaryEmoji === emoji && styles.emojiButtonSelected,
											pressed && styles.emojiButtonPressed,
										]}
									>
										<Text style={styles.emojiText}>{emoji}</Text>
									</Pressable>
								))}
							</View>
							<Text style={styles.hint}>Выбранный эмодзи: {diaryEmoji}</Text>
						</View>
					</ScrollView>

					{/* Footer */}
					<View style={styles.footer}>
						<Pressable
							disabled={isSaving}
							onPress={handleCancel}
							style={({ pressed }) => [
								styles.button,
								styles.buttonSecondary,
								pressed && styles.buttonPressed,
							]}
						>
							<Text style={styles.buttonSecondaryText}>Отмена</Text>
						</Pressable>

						<Pressable
							disabled={isSaving || !name.trim() || !diaryName.trim()}
							onPress={handleSave}
							style={({ pressed }) => [
								styles.button,
								styles.buttonPrimary,
								(isSaving || !name.trim() || !diaryName.trim()) && styles.buttonDisabled,
								pressed && styles.buttonPressed,
							]}
						>
							<Text style={styles.buttonPrimaryText}>
								{isSaving ? 'Сохранение...' : 'Сохранить'}
							</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'flex-end',
	},
	modal: {
		backgroundColor: DesignTokens.colors.background,
		borderTopLeftRadius: DesignTokens.borderRadius.xl,
		borderTopRightRadius: DesignTokens.borderRadius.xl,
		maxHeight: '90%',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: DesignTokens.spacing.lg,
		paddingVertical: DesignTokens.spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: DesignTokens.colors.border,
	},
	title: {
		fontSize: DesignTokens.fontSizes.h3,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.text,
	},
	closeButton: {
		padding: DesignTokens.spacing.sm,
	},
	closeButtonText: {
		fontSize: 24,
		color: DesignTokens.colors.textSecondary,
	},
	content: {
		paddingHorizontal: DesignTokens.spacing.lg,
		paddingVertical: DesignTokens.spacing.md,
		gap: DesignTokens.spacing.lg,
	},
	field: {
		gap: DesignTokens.spacing.sm,
	},
	label: {
		fontSize: DesignTokens.fontSizes.bodySmall,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.text,
	},
	input: {
		backgroundColor: DesignTokens.colors.gray50,
		borderRadius: DesignTokens.borderRadius.lg,
		borderWidth: 1,
		borderColor: DesignTokens.colors.border,
		paddingHorizontal: DesignTokens.spacing.md,
		paddingVertical: DesignTokens.spacing.sm + 2,
		fontSize: DesignTokens.fontSizes.body,
		color: DesignTokens.colors.text,
	},
	hint: {
		fontSize: DesignTokens.fontSizes.caption,
		color: DesignTokens.colors.textSecondary,
	},
	emojiGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: DesignTokens.spacing.sm,
	},
	emojiButton: {
		width: 56,
		height: 56,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: DesignTokens.borderRadius.lg,
		borderWidth: 2,
		borderColor: DesignTokens.colors.border,
		backgroundColor: DesignTokens.colors.card,
	},
	emojiButtonSelected: {
		borderColor: DesignTokens.colors.primary,
		backgroundColor: `${DesignTokens.colors.primary}10`,
		transform: [{ scale: 1.1 }],
	},
	emojiButtonPressed: {
		opacity: 0.7,
	},
	emojiText: {
		fontSize: 28,
	},
	footer: {
		flexDirection: 'row',
		gap: DesignTokens.spacing.md,
		paddingHorizontal: DesignTokens.spacing.lg,
		paddingVertical: DesignTokens.spacing.md,
		borderTopWidth: 1,
		borderTopColor: DesignTokens.colors.border,
	},
	button: {
		flex: 1,
		paddingVertical: DesignTokens.spacing.md,
		borderRadius: DesignTokens.borderRadius.lg,
		alignItems: 'center',
		justifyContent: 'center',
	},
	buttonPrimary: {
		backgroundColor: DesignTokens.colors.primary,
	},
	buttonSecondary: {
		backgroundColor: DesignTokens.colors.gray100,
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	buttonPressed: {
		opacity: 0.8,
	},
	buttonPrimaryText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.background,
	},
	buttonSecondaryText: {
		fontSize: DesignTokens.fontSizes.body,
		fontWeight: DesignTokens.fontWeights.semibold,
		color: DesignTokens.colors.text,
	},
});
