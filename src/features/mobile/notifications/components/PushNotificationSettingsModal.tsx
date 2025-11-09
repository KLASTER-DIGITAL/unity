/**
 * Push Notification Settings Modal
 *
 * Модальное окно для настройки времени уведомлений в Settings
 * Используется в PushSubscriptionManager
 */

import { Clock, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

type PushNotificationSettingsModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onEnableNotifications: () => Promise<void>;
	userId: string;
};

export function PushNotificationSettingsModal({
	isOpen,
	onClose,
	onEnableNotifications,
	userId,
}: PushNotificationSettingsModalProps) {
	const [morningEnabled, setMorningEnabled] = useState(true);
	const [eveningEnabled, setEveningEnabled] = useState(true);
	const [morningTime, setMorningTime] = useState('08:00');
	const [eveningTime, setEveningTime] = useState('21:00');
	const [isLoading, setIsLoading] = useState(false);

	const handleEnableNotifications = async () => {
		setIsLoading(true);

		try {
			// Build selectedTimes array based on checkboxes
			const selectedTimes: string[] = [];
			if (morningEnabled) selectedTimes.push('morning');
			if (eveningEnabled) selectedTimes.push('evening');

			// Save time preferences to database
			const supabase = createClient();
			const { error } = await supabase
				.from('profiles')
				.update({
					has_completed_onboarding: true,
					notification_time_preferences: {
						morningTime,
						eveningTime,
						selectedTimes,
					},
					notification_settings: {
						dailyReminder: selectedTimes.length > 0,
						weeklyReport: true,
						achievements: true,
						motivational: true,
					},
				})
				.eq('id', userId);

			if (error) throw error;

			// Call parent's onEnableNotifications (subscribes to push)
			// ✅ FIX: Removed duplicate toast.success - parent already shows it
			await onEnableNotifications();

			onClose();
		} catch (error) {
			console.error('Error enabling notifications:', error);
			toast.error('Ошибка при включении уведомлений');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={onClose}
					/>

					{/* Modal */}
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-4 shadow-xl transition-colors duration-300 sm:w-[calc(100%-3rem)] sm:p-6"
						exit={{ opacity: 0, scale: 0.95 }}
						initial={{ opacity: 0, scale: 0.95 }}
					>
						{/* Header */}
						<div className="mb-6 flex items-start justify-between">
							<div>
								<h2 className="text-xl font-bold text-foreground">Настройка уведомлений</h2>
								<p className="mt-1 text-sm text-muted-foreground">
									Выберите когда вы хотите получать напоминания
								</p>
							</div>
							<button
								className="rounded-lg p-1 transition-colors hover:bg-muted"
								onClick={onClose}
								type="button"
							>
								<X className="h-5 w-5 text-muted-foreground" />
							</button>
						</div>

						{/* Time Selection */}
						<div className="mb-6 space-y-3">
							<label className="text-sm font-medium text-foreground">Когда напоминать?</label>

							<div className="space-y-2">
								{/* Morning Checkbox */}
								<label
									className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 transition-all ${
										morningEnabled
											? 'border-primary bg-primary/5'
											: 'border-border bg-card hover:bg-muted'
									}`}
								>
									<div className="flex items-center gap-3">
										<input
											checked={morningEnabled}
											className="h-4 w-4 cursor-pointer rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
											onChange={(e) => setMorningEnabled(e.target.checked)}
											type="checkbox"
										/>
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm font-medium">Утром</span>
										</div>
									</div>
									<input
										className="rounded border border-border bg-background px-2 py-1 text-sm disabled:opacity-50"
										disabled={!morningEnabled}
										onChange={(e) => setMorningTime(e.target.value)}
										onClick={(e) => e.stopPropagation()}
										type="time"
										value={morningTime}
									/>
								</label>

								{/* Evening Checkbox */}
								<label
									className={`flex w-full cursor-pointer items-center justify-between rounded-lg border p-3 transition-all ${
										eveningEnabled
											? 'border-primary bg-primary/5'
											: 'border-border bg-card hover:bg-muted'
									}`}
								>
									<div className="flex items-center gap-3">
										<input
											checked={eveningEnabled}
											className="h-4 w-4 cursor-pointer rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
											onChange={(e) => setEveningEnabled(e.target.checked)}
											type="checkbox"
										/>
										<div className="flex items-center gap-2">
											<Clock className="h-4 w-4 text-muted-foreground" />
											<span className="text-sm font-medium">Вечером</span>
										</div>
									</div>
									<input
										className="rounded border border-border bg-background px-2 py-1 text-sm disabled:opacity-50"
										disabled={!eveningEnabled}
										onChange={(e) => setEveningTime(e.target.value)}
										onClick={(e) => e.stopPropagation()}
										type="time"
										value={eveningTime}
									/>
								</label>
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-3">
							<button
								className="flex-1 rounded-xl border border-border bg-card px-4 py-3 font-medium text-foreground transition-all duration-200 hover:bg-muted"
								onClick={onClose}
								type="button"
							>
								Отменить
							</button>
							<button
								className="flex-1 rounded-xl bg-primary px-4 py-3 font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={isLoading || (!morningEnabled && !eveningEnabled)}
								onClick={handleEnableNotifications}
								type="button"
							>
								{isLoading ? 'Включение...' : 'Включить'}
							</button>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
