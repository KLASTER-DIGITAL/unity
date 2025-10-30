import { StyleSheet, Text, View } from 'react-native';

interface Milestone {
	id: number;
	title: string;
	completed: boolean;
	reward: string;
	progress?: number;
	total?: number;
}

interface MilestoneCardProps {
	milestone: Milestone;
}

/**
 * Milestone Card Component - React Native
 * Displays a milestone with progress
 */
export function MilestoneCard({ milestone }: MilestoneCardProps) {
	const progressPercentage =
		milestone.progress && milestone.total ? (milestone.progress / milestone.total) * 100 : 0;

	return (
		<View style={[styles.card, milestone.completed && styles.cardCompleted]}>
			{/* Header */}
			<View style={styles.header}>
				<View style={styles.iconContainer}>
					<Text style={styles.icon}>{milestone.completed ? '✅' : '🎯'}</Text>
				</View>
				<View style={styles.content}>
					<Text style={styles.title}>{milestone.title}</Text>
					<Text style={styles.reward}>🎁 {milestone.reward}</Text>
				</View>
			</View>

			{/* Progress Bar */}
			{!milestone.completed &&
				milestone.progress !== undefined &&
				milestone.total !== undefined && (
					<View style={styles.progressContainer}>
						<View style={styles.progressBar}>
							<View
								style={[styles.progressFill, { width: `${Math.min(progressPercentage, 100)}%` }]}
							/>
						</View>
						<Text style={styles.progressText}>
							{milestone.progress} / {milestone.total}
						</Text>
					</View>
				)}

			{/* Completed Badge */}
			{milestone.completed && (
				<View style={styles.completedBadge}>
					<Text style={styles.completedText}>Выполнено!</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: '#E5E7EB',
		marginBottom: 12,
	},
	cardCompleted: {
		backgroundColor: '#F0FDF4',
		borderColor: '#10B981',
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: '#F3F4F6',
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	icon: {
		fontSize: 24,
	},
	content: {
		flex: 1,
	},
	title: {
		fontSize: 16,
		fontWeight: '600',
		color: '#111827',
		marginBottom: 4,
	},
	reward: {
		fontSize: 14,
		color: '#6B7280',
	},
	progressContainer: {
		marginTop: 8,
	},
	progressBar: {
		height: 8,
		backgroundColor: '#E5E7EB',
		borderRadius: 4,
		overflow: 'hidden',
		marginBottom: 8,
	},
	progressFill: {
		height: '100%',
		backgroundColor: '#3B82F6',
		borderRadius: 4,
	},
	progressText: {
		fontSize: 12,
		color: '#6B7280',
		textAlign: 'right',
	},
	completedBadge: {
		marginTop: 8,
		paddingVertical: 6,
		paddingHorizontal: 12,
		backgroundColor: '#10B981',
		borderRadius: 8,
		alignSelf: 'flex-start',
	},
	completedText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#FFFFFF',
	},
});
