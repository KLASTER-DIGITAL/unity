/**
 * Push Notification Onboarding Modal
 *
 * Shows after user completes main onboarding (step 4)
 * Asks user to enable push notifications with time preferences
 *
 * Features:
 * - iOS-style design
 * - Time picker for notification preferences
 * - Permission request
 * - Auto-save to database
 */

import { Bell, Clock, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { useTranslation } from '@/shared/lib/i18n';
import { subscribeToPush } from '@/shared/lib/notifications/pushAdapter';
import { createClient } from '@/utils/supabase/client';

type PushNotificationOnboardingModalProps = {
	isOpen: boolean;
	onClose: () => void;
	userId: string;
	onComplete?: () => void;
};

export function PushNotificationOnboardingModal({
	isOpen,
	onClose,
	userId,
	onComplete,
}: PushNotificationOnboardingModalProps) {
	const { t } = useTranslation();

	// Checkbox state - user can select morning, evening, or both
	const [morningEnabled, setMorningEnabled] = useState(true);
	const [eveningEnabled, setEveningEnabled] = useState(true);
	const [morningTime, setMorningTime] = useState('08:00');
	const [eveningTime, setEveningTime] = useState('21:00');
	const [isLoading, setIsLoading] = useState(false);

	const handleEnableNotifications = async () => {
		setIsLoading(true);

		try {
			console.log('[PushOnboardingModal] Starting push subscription for user:', userId);

			// 1. Subscribe to push notifications using Platform Adapter
			// This will:
			// - Request permission
			// - Create push subscription
			// - Save to push_subscriptions table
			const result = await subscribeToPush(userId);

			if (result.success && result.subscription) {
				console.log('[PushOnboardingModal] Push subscription successful');

				// 2. Update user profile with notification preferences
				const supabase = createClient();

				// Build selectedTimes array based on checkboxes
				const selectedTimes: string[] = [];
				if (morningEnabled) selectedTimes.push('morning');
				if (eveningEnabled) selectedTimes.push('evening');

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

				if (error) {
					console.error('[PushOnboardingModal] Error updating profile:', error);
					throw error;
				}

				console.log('[PushOnboardingModal] Profile updated successfully');
				toast.success('Уведомления включены!');
				onComplete?.();
				onClose();
			} else {
				// Push subscription failed
				console.error('[PushOnboardingModal] Push subscription failed:', result.error);

				if (result.error === 'permission_denied') {
					toast.error(
						t('notifications.errors.permissionDenied', 'Разрешение на уведомления отклонено')
					);
				} else if (result.error === 'not_supported') {
					toast.error(
						t('notifications.errors.notSupported', 'Ваш браузер не поддерживает уведомления')
					);
				} else if (result.error === 'vapid_key_missing') {
					toast.error(t('notifications.errors.serverConfig', 'Ошибка конфигурации сервера'));
				} else {
					toast.error(t('notifications.errors.enableFailed', 'Ошибка при включении уведомлений'));
				}
			}
		} catch (error) {
			console.error('[PushOnboardingModal] Error enabling notifications:', error);
			toast.error(t('notifications.errors.enableFailed', 'Ошибка при включении уведомлений'));
		} finally {
			setIsLoading(false);
		}
	};

	const handleSkip = async () => {
		try {
			const supabase = createClient();

			// Mark onboarding as complete even if skipped
			// User can enable notifications later from Settings
			const { error } = await supabase
				.from('profiles')
				.update({
					has_completed_onboarding: true,
				})
				.eq('id', userId);

			if (error) throw error;

			onComplete?.();
			onClose();
		} catch (error) {
			console.error('Error skipping notifications:', error);
			toast.error(t('notifications.errors.skipFailed', 'Ошибка при пропуске'));
		}
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						animate={{ opacity: 1 }}
						className="fixed inset-0 z-modal-backdrop bg-black/40 backdrop-blur-sm"
						exit={{ opacity: 0 }}
						initial={{ opacity: 0 }}
						onClick={handleSkip}
					/>

					{/* Modal */}
					<motion.div
						animate={{ opacity: 1, scale: 1 }}
						className="fixed top-1/2 left-1/2 z-modal w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-card p-6 shadow-xl"
						exit={{ opacity: 0, scale: 0.95 }}
						initial={{ opacity: 0, scale: 0.95 }}
					>
						{/* Close button */}
						<button
							className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
							onClick={handleSkip}
							type="button"
						>
							<X className="h-5 w-5" />
						</button>

						{/* Content */}
						<div className="space-y-6">
							{/* Icon */}
							<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
								<Bell className="h-8 w-8 text-primary" />
							</div>

							{/* Title */}
							<div className="text-center">
								<h2 className="text-xl font-semibold text-foreground">
									{t('notifications.modal.title', 'Включить уведомления?')}
								</h2>
								<p className="mt-2 text-sm text-muted-foreground">
									{t(
										'notifications.modal.description',
										'Получайте напоминания о записях и мотивационные сообщения'
									)}
								</p>
							</div>

							{/* Time Selection */}
							<div className="space-y-3">
								<label className="text-sm font-medium text-foreground">
									{t('notifications.modal.whenRemind', 'Когда напоминать?')}
								</label>

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
												<span className="text-sm font-medium">
													{t('notifications.time.morning', 'Утром')}
												</span>
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
												<span className="text-sm font-medium">
													{t('notifications.time.evening', 'Вечером')}
												</span>
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
								<Button
									className="flex-1"
									disabled={isLoading}
									onClick={handleEnableNotifications}
									variant="default"
								>
									{isLoading
										? t('notifications.button.enabling', 'Включение...')
										: t('notifications.button.enable', 'Включить')}
								</Button>
								<Button className="flex-1" onClick={handleSkip} variant="outline">
									{t('notifications.button.later', 'Позже')}
								</Button>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
