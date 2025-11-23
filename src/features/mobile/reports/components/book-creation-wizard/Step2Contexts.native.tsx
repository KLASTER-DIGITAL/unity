import { Check } from 'lucide-react-native';

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { BookConfig } from './types';

type Step2ContextsProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
	availableCategories: string[];
};

export function Step2Contexts({ config, onConfigChange, availableCategories }: Step2ContextsProps) {
	const toggleContext = (context: string) => {
		const currentContexts = config.contexts || [];
		const newContexts = currentContexts.includes(context)
			? currentContexts.filter((c) => c !== context)
			: [...currentContexts, context];
		onConfigChange({ contexts: newContexts });
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Выберите контексты</Text>
			<Text style={styles.subtitle}>Какие категории записей вы хотите включить в книгу?</Text>

			{availableCategories.length === 0 ? (
				<View style={styles.emptyState}>
					<Text style={styles.emptyText}>
						У вас пока нет категорий в записях. Все записи за выбранный период будут включены в
						книгу.
					</Text>
				</View>
			) : (
				<ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
					{availableCategories.map((category) => {
						const isSelected = config.contexts.includes(category);
						return (
							<TouchableOpacity
								key={category}
								style={[styles.item, isSelected && styles.itemSelected]}
								onPress={() => toggleContext(category)}
								activeOpacity={0.7}
							>
								<View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
									{isSelected && <Check size={14} color="#fff" />}
								</View>
								<Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
									{category}
								</Text>
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			)}

			<View style={styles.hintContainer}>
				<Text style={styles.hint}>Если ничего не выбрано, будут включены все категории.</Text>
			</View>
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
	emptyState: {
		padding: 20,
		backgroundColor: '#F2F2F7',
		borderRadius: 12,
		alignItems: 'center',
	},
	emptyText: {
		fontSize: 14,
		color: '#666',
		textAlign: 'center',
		lineHeight: 20,
	},
	list: {
		flex: 1,
	},
	listContent: {
		gap: 10,
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		backgroundColor: '#fff',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#E5E5EA',
		gap: 12,
	},
	itemSelected: {
		borderColor: '#007AFF',
		backgroundColor: '#F2F8FF',
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 6,
		borderWidth: 2,
		borderColor: '#C7C7CC',
		alignItems: 'center',
		justifyContent: 'center',
	},
	checkboxSelected: {
		backgroundColor: '#007AFF',
		borderColor: '#007AFF',
	},
	itemText: {
		fontSize: 16,
		color: '#000',
	},
	itemTextSelected: {
		color: '#007AFF',
		fontWeight: '500',
	},
	hintContainer: {
		marginTop: 20,
		padding: 12,
		backgroundColor: '#F2F2F7',
		borderRadius: 8,
	},
	hint: {
		fontSize: 13,
		color: '#666',
		lineHeight: 18,
	},
});
