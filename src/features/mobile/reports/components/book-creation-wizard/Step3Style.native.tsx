import { Heart, Lock, Rocket, Sparkles, User } from 'lucide-react-native';

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BookConfig, BookStyle } from './types';

type Step3StyleProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
	isPremium?: boolean;
	onUpgrade?: () => void;
};

const STYLES: { id: BookStyle; title: string; description: string; icon: any }[] = [
	{
		id: 'warm_family',
		title: 'Семейная история',
		description: 'Теплое повествование о моментах единения, любви и совместного роста',
		icon: Heart,
	},
	{
		id: 'biographical',
		title: 'Биография',
		description: 'Фокус на личном развитии и ключевых моментах жизни',
		icon: User,
	},
	{
		id: 'motivational',
		title: 'Мотивация',
		description: 'История успеха с акцентом на достижения и преодоление трудностей',
		icon: Rocket,
	},
];

export function Step3Style({
	config,
	onConfigChange,
	isPremium = false,
	onUpgrade,
}: Step3StyleProps) {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Выберите стиль</Text>
			<Text style={styles.subtitle}>В каком стиле AI должен написать вашу книгу?</Text>

			<ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
				{STYLES.map((style) => {
					const isSelected = config.style === style.id;
					// Lock all styles for free users, or maybe allow one default?
					// Plan says "stop skipping... show Premium Only overlay or lock interactions"
					// Let's lock all interactions for free users and show overlay
					const isLocked = !isPremium;

					return (
						<TouchableOpacity
							key={style.id}
							style={[
								styles.card,
								isSelected && styles.cardSelected,
								isLocked && styles.cardLocked,
							]}
							onPress={() => {
								if (isLocked) {
									onUpgrade?.();
								} else {
									onConfigChange({ style: style.id });
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
										<style.icon size={24} color={isSelected ? '#fff' : '#007AFF'} />
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
											{style.title}
										</Text>
										{isLocked && (
											<View style={styles.premiumBadge}>
												<Sparkles size={12} color="#fff" />
												<Text style={styles.premiumBadgeText}>Premium</Text>
											</View>
										)}
									</View>
									<Text style={[styles.cardDescription, isLocked && styles.textLocked]}>
										{style.description}
									</Text>
								</View>
							</View>
						</TouchableOpacity>
					);
				})}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
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
		flex: 1,
	},
	listContent: {
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
