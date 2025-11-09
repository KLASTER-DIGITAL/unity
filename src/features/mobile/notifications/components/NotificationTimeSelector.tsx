/**
 * Notification Time Selector Component
 *
 * iOS-style time picker for notification preferences
 * Features:
 * - Morning/Evening/Both time selection
 * - Time picker modal
 * - Auto-save to database
 * - Integration with Settings screen
 */

import { Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { TimePickerModal } from '@/features/mobile/media/components/TimePickerModal';
import { SettingsRow } from '@/features/mobile/settings/components/SettingsRow';
import { createClient } from '@/utils/supabase/client';

type NotificationTimeSelectorProps = {
	userId: string;
	initialMorningTime?: string;
	initialEveningTime?: string;
	initialSelectedTimes?: ('morning' | 'evening')[];
	onUpdate?: (preferences: NotificationTimePreferences) => void;
};

export type NotificationTimePreferences = {
	morningTime: string;
	eveningTime: string;
	selectedTimes: ('morning' | 'evening')[];
};

export function NotificationTimeSelector({
	userId,
	initialMorningTime = '08:00',
	initialEveningTime = '21:00',
	initialSelectedTimes = [],
	onUpdate,
}: NotificationTimeSelectorProps) {
	const [morningTime, setMorningTime] = useState(initialMorningTime);
	const [eveningTime, setEveningTime] = useState(initialEveningTime);
	const [selectedTimes, setSelectedTimes] =
		useState<('morning' | 'evening')[]>(initialSelectedTimes);
	const [showTimePicker, setShowTimePicker] = useState<{
		show: boolean;
		type: 'morning' | 'evening';
		title: string;
	}>({
		show: false,
		type: 'morning',
		title: '',
	});

	const handleTimeClick = (type: 'morning' | 'evening') => {
		setShowTimePicker({
			show: true,
			type,
			title: type === 'morning' ? 'Утреннее напоминание' : 'Вечернее напоминание',
		});
	};

	const handleTimeSelect = async (time: string) => {
		const newMorningTime = showTimePicker.type === 'morning' ? time : morningTime;
		const newEveningTime = showTimePicker.type === 'evening' ? time : eveningTime;

		// Update local state
		if (showTimePicker.type === 'morning') {
			setMorningTime(time);
		} else {
			setEveningTime(time);
		}

		// Save to database
		try {
			const supabase = createClient();
			const { error } = await supabase
				.from('profiles')
				.update({
					notification_time_preferences: {
						morningTime: newMorningTime,
						eveningTime: newEveningTime,
						selectedTimes,
					},
				})
				.eq('id', userId);

			if (error) throw error;

			toast.success('Время обновлено');
			onUpdate?.({
				morningTime: newMorningTime,
				eveningTime: newEveningTime,
				selectedTimes,
			});
		} catch (error) {
			console.error('Error updating time:', error);
			toast.error('Ошибка при обновлении времени');
		}
	};

	const handleToggleTime = async (type: 'morning' | 'evening', enabled: boolean) => {
		const newSelectedTimes = enabled
			? [...selectedTimes, type]
			: selectedTimes.filter((t) => t !== type);

		setSelectedTimes(newSelectedTimes);

		// Save to database
		try {
			const supabase = createClient();
			const { error } = await supabase
				.from('profiles')
				.update({
					notification_time_preferences: {
						morningTime,
						eveningTime,
						selectedTimes: newSelectedTimes,
					},
				})
				.eq('id', userId);

			if (error) throw error;

			onUpdate?.({
				morningTime,
				eveningTime,
				selectedTimes: newSelectedTimes,
			});
		} catch (error) {
			console.error('Error updating time preferences:', error);
			toast.error('Ошибка при обновлении настроек');
		}
	};

	return (
		<>
			{/* Morning Time */}
			<SettingsRow
				customRightElement={
					<button
						className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm transition-colors hover:bg-muted/80"
						onClick={() => handleTimeClick('morning')}
						type="button"
					>
						<Clock className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium">{morningTime}</span>
					</button>
				}
				description="Напоминание утром"
				icon={Clock}
				iconBgColor="bg-(--ios-blue)/10"
				iconColor="text-(--ios-blue)"
				onSwitchChange={(checked) => handleToggleTime('morning', checked)}
				rightElement="custom"
				switchChecked={selectedTimes.includes('morning')}
				title="Утреннее напоминание"
			/>

			{/* Evening Time */}
			<SettingsRow
				customRightElement={
					<button
						className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm transition-colors hover:bg-muted/80"
						onClick={() => handleTimeClick('evening')}
						type="button"
					>
						<Clock className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium">{eveningTime}</span>
					</button>
				}
				description="Напоминание вечером"
				icon={Clock}
				iconBgColor="bg-(--ios-purple)/10"
				iconColor="text-(--ios-purple)"
				onSwitchChange={(checked) => handleToggleTime('evening', checked)}
				rightElement="custom"
				switchChecked={selectedTimes.includes('evening')}
				title="Вечернее напоминание"
			/>

			{/* Time Picker Modal */}
			<TimePickerModal
				initialTime={showTimePicker.type === 'morning' ? morningTime : eveningTime}
				isOpen={showTimePicker.show}
				onClose={() => setShowTimePicker({ ...showTimePicker, show: false })}
				onTimeSelect={handleTimeSelect}
				title={showTimePicker.title}
			/>
		</>
	);
}
