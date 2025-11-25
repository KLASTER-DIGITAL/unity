import { BookOpen, Check, Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BookConfig } from './types';

type Step0PlanTypeProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
	isPremium: boolean;
	onUpgrade: () => void;
};

export function Step0PlanType({
	config,
	onConfigChange,
	isPremium,
	onUpgrade,
}: Step0PlanTypeProps) {
	// If user is Premium, auto-select premium and skip this step
	// (This logic is also in the hook, but good to have here for safety)
	if (isPremium) {
		return null;
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Выберите тип книги</Text>
				<Text style={styles.subtitle}>
					Создайте простую книгу-дневник или AI-книгу с глубоким анализом
				</Text>
			</View>

			{/* FREE Option */}
			<TouchableOpacity
				style={[styles.optionCard, config.planType === 'free' && styles.optionCardSelected]}
				onPress={() => onConfigChange({ planType: 'free' })}
				activeOpacity={0.7}
			>
				<View style={styles.optionHeader}>
					<View style={styles.optionIconRow}>
						<View
							style={[
								styles.iconContainer,
								config.planType === 'free'
									? styles.iconContainerSelected
									: styles.iconContainerDefault,
							]}
						>
							<BookOpen size={20} color={config.planType === 'free' ? '#fff' : '#666'} />
						</View>
						<View>
							<Text style={styles.optionTitle}>Простая книга</Text>
							<Text style={styles.optionPrice}>Бесплатно</Text>
						</View>
					</View>
					<View
						style={[styles.radioButton, config.planType === 'free' && styles.radioButtonSelected]}
					>
						{config.planType === 'free' && <View style={styles.radioButtonInner} />}
					</View>
				</View>

				<View style={styles.featuresList}>
					<FeatureItem text="Список всех записей за период" />
					<FeatureItem text="Базовая статистика" />
					<FeatureItem text="Фото-коллаж (до 9 фото)" />
					<FeatureItem text="Быстрая генерация (<5 сек)" />
				</View>
			</TouchableOpacity>

			{/* PREMIUM Option */}
			<TouchableOpacity
				style={[styles.optionCard, config.planType === 'premium' && styles.optionCardSelected]}
				onPress={() => {
					if (!isPremium) {
						onUpgrade();
					} else {
						onConfigChange({ planType: 'premium' });
					}
				}}
				activeOpacity={0.7}
			>
				<View style={styles.optionHeader}>
					<View style={styles.optionIconRow}>
						<View
							style={[
								styles.iconContainer,
								config.planType === 'premium'
									? styles.iconContainerPremium
									: styles.iconContainerDefault,
							]}
						>
							<Sparkles size={20} color={config.planType === 'premium' ? '#fff' : '#666'} />
						</View>
						<View>
							<Text style={styles.optionTitle}>AI-книга</Text>
							<Text style={styles.optionPricePremium}>Premium</Text>
						</View>
					</View>
					<View
						style={[
							styles.radioButton,
							config.planType === 'premium' && styles.radioButtonSelected,
						]}
					>
						{config.planType === 'premium' && <View style={styles.radioButtonInner} />}
					</View>
				</View>

				<View style={styles.featuresList}>
					<FeatureItem text="AI-анализ записей и эмоций" isPremium />
					<FeatureItem text="Главы по людям и сферам жизни" isPremium />
					<FeatureItem text="Эмоциональный обзор периода" isPremium />
					<FeatureItem text="Выводы и инсайты от AI" isPremium />
					<FeatureItem text="Редактор с возможностью изменений" isPremium />
				</View>

				{!isPremium && (
					<View style={styles.premiumBadge}>
						<Text style={styles.premiumBadgeText}>→ Требуется Premium подписка</Text>
					</View>
				)}
			</TouchableOpacity>

			<View style={styles.tipContainer}>
				<Text style={styles.tipText}>
					💡 <Text style={styles.bold}>Совет:</Text> Начните с простой книги, а затем перейдите на
					Premium для полного опыта.
				</Text>
			</View>
		</View>
	);
}

function FeatureItem({ text, isPremium }: { text: string; isPremium?: boolean }) {
	return (
		<View style={styles.featureItem}>
			{isPremium ? (
				<Sparkles size={14} color="#007AFF" style={styles.featureIcon} />
			) : (
				<Check size={14} color="#666" style={styles.featureIcon} />
			)}
			<Text style={styles.featureText}>{text}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	header: {
		marginBottom: 20,
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
		lineHeight: 20,
	},
	optionCard: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#E5E5EA',
	},
	optionCardSelected: {
		borderColor: '#007AFF',
		backgroundColor: '#F2F8FF',
	},
	optionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 12,
	},
	optionIconRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
	},
	iconContainer: {
		width: 40,
		height: 40,
		borderRadius: 20,
		justifyContent: 'center',
		alignItems: 'center',
	},
	iconContainerDefault: {
		backgroundColor: '#F2F2F7',
	},
	iconContainerSelected: {
		backgroundColor: '#007AFF',
	},
	iconContainerPremium: {
		backgroundColor: '#5856D6', // Purple for Premium
	},
	optionTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#000',
	},
	optionPrice: {
		fontSize: 13,
		color: '#666',
	},
	optionPricePremium: {
		fontSize: 13,
		color: '#007AFF',
		fontWeight: '500',
	},
	radioButton: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: '#C7C7CC',
		justifyContent: 'center',
		alignItems: 'center',
	},
	radioButtonSelected: {
		borderColor: '#007AFF',
	},
	radioButtonInner: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: '#007AFF',
	},
	featuresList: {
		marginLeft: 52, // Align with text
		gap: 4,
	},
	featureItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	featureIcon: {
		marginTop: 2,
	},
	featureText: {
		fontSize: 13,
		color: '#333',
		flex: 1,
	},
	premiumBadge: {
		marginTop: 12,
		marginLeft: 52,
		backgroundColor: 'rgba(0, 122, 255, 0.1)',
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 6,
		alignSelf: 'flex-start',
	},
	premiumBadgeText: {
		fontSize: 12,
		color: '#007AFF',
		fontWeight: '500',
	},
	tipContainer: {
		backgroundColor: '#F2F2F7',
		padding: 12,
		borderRadius: 8,
		marginTop: 4,
	},
	tipText: {
		fontSize: 13,
		color: '#666',
		lineHeight: 18,
	},
	bold: {
		fontWeight: '600',
	},
});
