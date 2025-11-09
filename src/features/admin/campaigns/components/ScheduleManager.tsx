/**
 * Schedule Manager Component
 *
 * UI for scheduling push campaigns
 * Features:
 * - Send now or schedule for later
 * - Date/time picker
 */

import { useState } from 'react';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';

interface ScheduleManagerProps {
	scheduledAt?: string;
	onChange: (scheduledAt?: string) => void;
}

export function ScheduleManager({ scheduledAt, onChange }: ScheduleManagerProps) {
	const [scheduleType, setScheduleType] = useState<'now' | 'later'>(scheduledAt ? 'later' : 'now');

	const handleScheduleTypeChange = (type: 'now' | 'later') => {
		setScheduleType(type);
		if (type === 'now') {
			onChange(undefined);
		} else {
			// Set default to 1 hour from now
			const defaultDate = new Date();
			defaultDate.setHours(defaultDate.getHours() + 1);
			onChange(defaultDate.toISOString());
		}
	};

	const handleDateTimeChange = (value: string) => {
		if (value) {
			const date = new Date(value);
			onChange(date.toISOString());
		}
	};

	// Convert ISO string to datetime-local format
	const getDateTimeLocalValue = () => {
		if (!scheduledAt) return '';
		const date = new Date(scheduledAt);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Расписание отправки</CardTitle>
				<CardDescription>Выберите когда отправить уведомление</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<RadioGroup
					value={scheduleType}
					onValueChange={(value) => handleScheduleTypeChange(value as 'now' | 'later')}
				>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="now" id="now" />
						<Label htmlFor="now" className="cursor-pointer">
							<div>
								<p className="font-medium">Отправить сейчас</p>
								<p className="text-sm text-muted-foreground">
									Уведомление будет отправлено немедленно
								</p>
							</div>
						</Label>
					</div>

					<div className="flex items-center space-x-2">
						<RadioGroupItem value="later" id="later" />
						<Label htmlFor="later" className="cursor-pointer">
							<div>
								<p className="font-medium">Запланировать</p>
								<p className="text-sm text-muted-foreground">Выберите дату и время отправки</p>
							</div>
						</Label>
					</div>
				</RadioGroup>

				{scheduleType === 'later' && (
					<div className="space-y-2">
						<Label htmlFor="scheduled-time">Дата и время</Label>
						<Input
							id="scheduled-time"
							type="datetime-local"
							value={getDateTimeLocalValue()}
							onChange={(e) => handleDateTimeChange(e.target.value)}
							min={new Date().toISOString().slice(0, 16)}
						/>
						<p className="text-sm text-muted-foreground">
							Уведомление будет отправлено автоматически в указанное время
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
