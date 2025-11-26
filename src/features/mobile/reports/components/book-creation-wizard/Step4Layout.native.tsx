import { AlignLeft, Image, Lock, Minus, Moon, Sparkles, Sun } from 'lucide-react-native';

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BookConfig, BookLayout } from './types';

type Step4LayoutProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
	isPremium?: boolean;
	onUpgrade?: () => void;
};

const LAYOUTS: { id: BookLayout; title: string; description: string; icon: any }[] = [
	{
		id: 'photo_text',
		title: 'Фото + Текст',
		description: 'Фотографии с текстовым описанием на каждой странице',
		icon: Image,
	},
	{
		id: 'text_only',
		title: 'Только текст',
		description: 'Классический текстовый формат без изображений',
		icon: AlignLeft,
	},
	{
		id: 'minimal',
		title: 'Минимализм',
		description: 'Минималистичный дизайн с акцентом на содержание',
		icon: Minus,
	},
];

export function Step4Layout({
	config,
	onConfigChange,
	isPremium = false,
	onUpgrade,
}: Step4LayoutProps) {
	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<View>
				<Text style={styles.title}>Выберите макет</Text>
				<Text style={styles.subtitle}>Как должна выглядеть ваша книга?</Text>

				<View style={styles.list}>
					{LAYOUTS.map((layout) => {
						const isSelected = config.layout === layout.id;
						// Lock all layouts for free users
						const isLocked = !isPremium;

						return (
							<TouchableOpacity
								key={layout.id}
								style={[
									styles.card,
									isSelected && styles.cardSelected,
									isLocked && styles.cardLocked,
								]}
								onPress={() => {
									if (isLocked) {
										onUpgrade?.();
									} else {
										onConfigChange({ layout: layout.id });
									}
								}}
								activeOpacity={0.7}
							>
								<View style={styles.cardHeader}>
									<View
										style={[
											styles.iconContainer,
											isSelected ? styles.iconContainerSelected : styles.iconContainerDefault,
											isLocked && styles.iconContainerLocked,
										]}
									>
										{isLocked ? (
											<Lock size={20} color="#999" />
										) : (
											<layout.icon size={24} color={isSelected ? '#fff' : '#007AFF'} />
										)}
									</View>
									<View style={styles.textContainer}>
										<View style={styles.titleRow}>
											<Text
												style={[
													styles.cardTitle,
													isSelected && styles.cardTitleSelected,
													isLocked && styles.textLocked,
												]}
											>
												{layout.title}
											</Text>
											{isLocked && (
												<View style={styles.premiumBadge}>
													<Sparkles size={12} color="#fff" />
													<Text style={styles.premiumBadgeText}>Premium</Text>
												</View>
											)}
										</View>
										<Text style={[styles.cardDescription, isLocked && styles.textLocked]}>
											{layout.description}
										</Text>
									</View>
								</View>
							</TouchableOpacity>
						);
					})}
				</View>
			</View>

			<View style={styles.section}>
				<Text style={styles.title}>Тема оформления</Text>
				<Text style={styles.subtitle}>Выберите цветовую схему</Text>

				<View style={styles.themeContainer}>
					<TouchableOpacity
						style={[styles.themeButton, config.theme === 'light' && styles.themeButtonSelected]}
						onPress={() => onConfigChange({ theme: 'light' })}
					>
						<Sun size={20} color={config.theme === 'light' ? '#007AFF' : '#666'} />
						<Text style={[styles.themeText, config.theme === 'light' && styles.themeTextSelected]}>
							Светлая
						</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.themeButton, config.theme === 'dark' && styles.themeButtonSelected]}
						onPress={() => onConfigChange({ theme: 'dark' })}
					>
						<Moon size={20} color={config.theme === 'dark' ? '#007AFF' : '#666'} />
						<Text style={[styles.themeText, config.theme === 'dark' && styles.themeTextSelected]}>
							Темная
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		paddingBottom: 40,
		gap: 32,
	},
	title: {
		fontSize: 20,
		fontWeight: '600',
		color: '#000',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 14,
		color: '#666',
		marginBottom: 20,
	},
	list: {
		gap: 16,
	},
	card: {
		backgroundColor: '#fff',
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: '#E5E5EA',
	},
	cardSelected: {
		borderColor: '#007AFF',
		backgroundColor: '#F2F8FF',
	},
	cardHeader: {
		flexDirection: 'row',
		gap: 16,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconContainerDefault: {
		backgroundColor: '#F2F2F7',
	},
	iconContainerSelected: {
		backgroundColor: '#007AFF',
	},
	textContainer: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 17,
		fontWeight: '600',
		color: '#000',
		marginBottom: 4,
	},
	cardTitleSelected: {
		color: '#007AFF',
	},
	cardDescription: {
		fontSize: 14,
		color: '#666',
		lineHeight: 20,
	},
	section: {
		marginTop: 10,
	},
	themeContainer: {
		flexDirection: 'row',
		gap: 16,
	},
	themeButton: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		padding: 16,
		borderRadius: 12,
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#E5E5EA',
	},
	themeButtonSelected: {
		borderColor: '#007AFF',
		backgroundColor: '#F2F8FF',
	},
	themeText: {
		fontSize: 16,
		fontWeight: '500',
		color: '#666',
	},
	themeTextSelected: {
		color: '#007AFF',
	},
	cardLocked: {
		opacity: 0.8,
		backgroundColor: '#F9F9F9',
		borderColor: '#E5E5EA',
	},
	iconContainerLocked: {
		backgroundColor: '#E5E5EA',
	},
	textLocked: {
		color: '#999',
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 4,
	},
	premiumBadge: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		backgroundColor: '#FFD700', // Gold
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	premiumBadgeText: {
		fontSize: 10,
		fontWeight: '700',
		color: '#fff',
	},
});
