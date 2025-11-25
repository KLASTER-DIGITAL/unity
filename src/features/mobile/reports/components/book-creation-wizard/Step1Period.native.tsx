import { Calendar, Clock } from 'lucide-react-native';

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import type { BookConfig } from './types';

type Step1PeriodProps = {
	config: BookConfig;
	onConfigChange: (updates: Partial<BookConfig>) => void;
};

const PERIOD_TYPES = [
	{ id: 'month', label: 'Месяц', icon: Calendar },
	{ id: 'quarter', label: 'Квартал', icon: Clock },
	{ id: 'year', label: 'Год', icon: Calendar },
	{ id: 'custom', label: 'Свой', icon: Calendar },
] as const;

export function Step1Period({ config, onConfigChange }: Step1PeriodProps) {
	const handleTypeSelect = (type: BookConfig['type']) => {
		onConfigChange({ type });
		// Logic to auto-set dates based on type could go here or in the hook
		// For now, we just switch the UI mode
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Выберите период</Text>
			<Text style={styles.subtitle}>За какой период вы хотите создать книгу?</Text>

			{/* Period Types */}
			<View style={styles.typesContainer}>
				{PERIOD_TYPES.map((type) => (
					<TouchableOpacity
						key={type.id}
						style={[styles.typeButton, config.type === type.id && styles.typeButtonSelected]}
						onPress={() => handleTypeSelect(type.id as BookConfig['type'])}
					>
						<type.icon size={20} color={config.type === type.id ? '#fff' : '#666'} />
						<Text
							style={[
								styles.typeButtonText,
								config.type === type.id && styles.typeButtonTextSelected,
							]}
						>
							{type.label}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Date Inputs */}
			<View style={styles.inputsContainer}>
				<View style={styles.inputGroup}>
					<Text style={styles.label}>Начало (YYYY-MM-DD)</Text>
					<TextInput
						style={styles.input}
						value={config.periodStart}
						onChangeText={(text) => onConfigChange({ periodStart: text })}
						placeholder="2024-01-01"
						placeholderTextColor="#999"
					/>
				</View>

				<View style={styles.inputGroup}>
					<Text style={styles.label}>Конец (YYYY-MM-DD)</Text>
					<TextInput
						style={styles.input}
						value={config.periodEnd}
						onChangeText={(text) => onConfigChange({ periodEnd: text })}
						placeholder="2024-01-31"
						placeholderTextColor="#999"
					/>
				</View>
			</View>

			<View style={styles.hintContainer}>
				<Text style={styles.hint}>
					Будут использованы все записи из вашего дневника за этот период.
				</Text>
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
	typesContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
		marginBottom: 24,
	},
	typeButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 20,
		backgroundColor: '#F2F2F7',
		borderWidth: 1,
		borderColor: 'transparent',
	},
	typeButtonSelected: {
		backgroundColor: '#007AFF',
	},
	typeButtonText: {
		fontSize: 14,
		fontWeight: '500',
		color: '#666',
	},
	typeButtonTextSelected: {
		color: '#fff',
	},
	inputsContainer: {
		gap: 16,
	},
	inputGroup: {
		gap: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: '500',
		color: '#333',
	},
	input: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#E5E5EA',
		borderRadius: 10,
		padding: 12,
		fontSize: 16,
		color: '#000',
	},
	hintContainer: {
		marginTop: 24,
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
