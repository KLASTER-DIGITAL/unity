import { Heart, Rocket, User } from 'lucide-react-native';

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BookConfig, BookStyle } from './types';

type Step3StyleProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
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

export function Step3Style({ config, onConfigChange }: Step3StyleProps) {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Выберите стиль</Text>
			<Text style={styles.subtitle}>В каком стиле AI должен написать вашу книгу?</Text>

			<ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
				{STYLES.map((style) => {
					const isSelected = config.style === style.id;
					return (
						<TouchableOpacity
							key={style.id}
							style={[styles.card, isSelected && styles.cardSelected]}
							onPress={() => onConfigChange({ style: style.id })}
							activeOpacity={0.7}
						>
							<View style={styles.cardHeader}>
								<View
									style={[
										styles.iconContainer,
										isSelected ? styles.iconContainerSelected : styles.iconContainerDefault,
									]}
								>
									<style.icon size={24} color={isSelected ? '#fff' : '#007AFF'} />
								</View>
								<View style={styles.textContainer}>
									<Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
										{style.title}
									</Text>
									<Text style={styles.cardDescription}>{style.description}</Text>
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
});
