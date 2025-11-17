/**
 * Push Subscription Manager
 *
 * Компонент для управления push подписками в PWA (для пользователей)
 * - Запрос разрешения на уведомления
 * - Подписка/отписка от push
 * - Отображение статуса подписки
 */

import { Bell } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PushNotificationSettingsModal } from '@/features/mobile/notifications';
import { PlatformSpecificInstructions } from '@/shared/components/notifications/PlatformSpecificInstructions';
import { PushDevicesList } from '@/shared/components/pwa/PushDevicesList';
import {
	trackPushDenied,
	trackPushSubscribed,
	trackPushUnsubscribed,
} from '@/shared/lib/analytics/pwa-tracking';
import {
	type PushSubscriptionResult,
	subscribeToPush,
} from '@/shared/lib/notifications/pushAdapter';
import {
	getNotificationPermission,
	getPushSubscription,
	initWebPush,
	isPushSubscribed,
	isPushSupported,
	unsubscribeFromPush,
} from '@/shared/lib/notifications/webPush';

type PushSubscriptionManagerProps = {
	userId: string;
	onSubscriptionChange?: (isSubscribed: boolean) => void;
};

export function PushSubscriptionManager({
	userId,
	onSubscriptionChange,
}: PushSubscriptionManagerProps) {
	const [isSupported, setIsSupported] = useState(false);
	const [permission, setPermission] = useState<NotificationPermission>('default');
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const [showInstructions, setShowInstructions] = useState(false);
	const [subscriptionError, setSubscriptionError] = useState<PushSubscriptionResult | null>(null);
	const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
	const [devicesKey, setDevicesKey] = useState(0); // For forcing re-render of devices list

	/**
	 * Проверяет поддержку Web Push API
	 */
	// ✅ FIX: Define function BEFORE useEffect with useCallback
	const checkSupport = useCallback(() => {
		const supported = isPushSupported();
		setIsSupported(supported);

		if (supported) {
			const currentPermission = getNotificationPermission();
			setPermission(currentPermission);
		}
	}, []);

	/**
	 * Проверяет текущую подписку
	 * ✅ FIX: Проверяем подписку в БД, а не только в Service Worker
	 */
	// ✅ FIX: Define function BEFORE useEffect with useCallback
	const checkSubscription = useCallback(async () => {
		try {
			// 1. Проверяем локальную подписку в Service Worker
			const localSubscribed = await isPushSubscribed();

			if (!localSubscribed) {
				// Нет локальной подписки → точно не подписан
				setIsSubscribed(false);
				setCurrentEndpoint(null);
				onSubscriptionChange?.(false);
				return;
			}

			// 2. Получаем endpoint из Service Worker
			const subscription = await getPushSubscription();
			if (!subscription) {
				setIsSubscribed(false);
				setCurrentEndpoint(null);
				onSubscriptionChange?.(false);
				return;
			}

			// 3. Проверяем есть ли подписка в БД
			const { createClient } = await import('@/utils/supabase/client');
			const supabase = createClient();

			const { data, error } = await supabase
				.from('push_subscriptions')
				.select('endpoint, is_active')
				.eq('user_id', userId)
				.eq('endpoint', subscription.endpoint)
				.eq('is_active', true)
				.maybeSingle();

			if (error) {
				console.error('[PushSubscriptionManager] Error checking subscription in DB:', error);
				// Если ошибка БД, считаем что подписка есть (локально точно есть)
				setIsSubscribed(true);
				setCurrentEndpoint(subscription.endpoint);
				onSubscriptionChange?.(true);
				return;
			}

			// 4. Подписка есть в БД и активна
			const isActiveInDB = !!data;
			setIsSubscribed(isActiveInDB);
			setCurrentEndpoint(isActiveInDB ? subscription.endpoint : null);
			onSubscriptionChange?.(isActiveInDB);

			// 5. Если локально есть, но в БД нет → удаляем локальную подписку
			if (!isActiveInDB) {
				console.warn(
					'[PushSubscriptionManager] Local subscription exists but not in DB, unsubscribing...'
				);
				await unsubscribeFromPush(userId);
			}
		} catch (error) {
			console.error('[PushSubscriptionManager] Error checking subscription:', error);
			setIsSubscribed(false);
			setCurrentEndpoint(null);
			onSubscriptionChange?.(false);
		}
	}, [userId, onSubscriptionChange]);

	// ✅ FIX: useEffect AFTER function definitions
	useEffect(() => {
		checkSupport();
		checkSubscription();
		initWebPush(userId);
	}, [userId, checkSubscription, checkSupport]);

	/**
	 * Открывает модалку настроек
	 */
	const handleOpenSettings = () => {
		setShowSettingsModal(true);
	};

	/**
	 * Подписывается на push уведомления (вызывается из модалки)
	 */
	const handleSubscribe = async () => {
		setIsLoading(true);
		setSubscriptionError(null);
		try {
			console.log('[PushSubscriptionManager] Starting subscription for user:', userId);
			const result = await subscribeToPush(userId);

			if (result.success && result.subscription) {
				console.log('[PushSubscriptionManager] Subscription successful:', result.subscription);
				setIsSubscribed(true);
				setPermission('granted');
				setCurrentEndpoint(result.subscription.endpoint);
				setDevicesKey((prev) => prev + 1); // Refresh devices list
				trackPushSubscribed(userId);
				onSubscriptionChange?.(true);
				setShowSettingsModal(false);
				toast.success('✅ Уведомления включены!');
			} else {
				// Ошибка подписки
				console.error('[PushSubscriptionManager] Subscription failed:', result.error);
				setSubscriptionError(result);

				// Показываем инструкции если платформа не поддерживается
				if (result.instructions) {
					setShowInstructions(true);
				}

				const currentPermission = getNotificationPermission();
				setPermission(currentPermission);

				if (currentPermission === 'denied') {
					console.warn('[PushSubscriptionManager] Permission denied by user');
					trackPushDenied(userId);
					toast.error('❌ Вы запретили уведомления. Разрешите их в настройках браузера.');
				} else {
					console.error(
						'[PushSubscriptionManager] Subscription failed, permission:',
						currentPermission
					);
					toast.error('❌ Не удалось подписаться на уведомления');
				}
			}
		} catch (error) {
			console.error('[PushSubscriptionManager] Error subscribing to push:', error);
			toast.error('❌ Ошибка при подписке на уведомления');
		} finally {
			setIsLoading(false);
		}
	};

	/**
	 * Отписывается от push уведомлений
	 */
	const handleUnsubscribe = async () => {
		setIsLoading(true);
		try {
			console.log('[PushSubscriptionManager] Unsubscribing user:', userId);
			const success = await unsubscribeFromPush(userId);

			if (success) {
				console.log('[PushSubscriptionManager] Unsubscribe successful');
				setIsSubscribed(false);
				trackPushUnsubscribed(userId);
				onSubscriptionChange?.(false);
				toast.success('✅ Вы отписались от уведомлений');
			} else {
				console.error('[PushSubscriptionManager] Unsubscribe failed');
				toast.error('❌ Не удалось отписаться от уведомлений');
			}
		} catch (error) {
			console.error('[PushSubscriptionManager] Error unsubscribing from push:', error);
			toast.error('❌ Ошибка при отписке от уведомлений');
		} finally {
			setIsLoading(false);
		}
	};

	// Если не поддерживается, показываем информационное сообщение
	if (!isSupported) {
		return (
			<div className="rounded-xl border border-border bg-card p-4 transition-colors duration-300">
				<div className="flex items-start gap-3">
					<div className="shrink-0 rounded-full bg-muted p-2">
						<Bell className="h-5 w-5 text-muted-foreground" />
					</div>
					<div className="flex-1">
						<h3 className="mb-2 font-semibold text-callout text-foreground">🔔 Push Уведомления</h3>
						<div className="mb-3 rounded-lg border border-warning/20 bg-warning/10 p-3">
							<p className="mb-2 font-medium text-footnote text-warning">
								⚠️ Ваш браузер не поддерживает push уведомления
							</p>
							<p className="text-footnote text-muted-foreground">
								Для получения уведомлений используйте:
							</p>
							<ul className="mt-2 list-inside list-disc space-y-1 text-footnote text-muted-foreground">
								<li>Chrome, Edge, Firefox (Desktop & Android)</li>
								<li>Safari 16+ (macOS Ventura или новее)</li>
								<li>Opera, Samsung Internet</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-border bg-card p-4 transition-colors duration-300">
			<div className="flex items-start justify-between">
				<div className="flex-1">
					<h3 className="mb-2 font-semibold text-callout text-foreground">🔔 Push Уведомления</h3>

					{permission === 'denied' && (
						<div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 transition-colors duration-300">
							<p className="text-destructive text-footnote">
								❌ Уведомления запрещены. Разрешите их в настройках браузера.
							</p>
						</div>
					)}

					{permission === 'granted' && isSubscribed && (
						<div className="mb-3 rounded-lg border border-(--ios-green)/20 bg-(--ios-green)/10 p-3 transition-colors duration-300">
							<p className="text-(--ios-green) text-footnote">✅ Вы подписаны на уведомления</p>
						</div>
					)}

					{permission === 'default' && (
						<p className="mb-3 text-footnote text-muted-foreground">
							Получайте уведомления о новых достижениях и напоминания
						</p>
					)}

					{permission === 'granted' && !isSubscribed && (
						<p className="mb-3 text-footnote text-muted-foreground">
							Подпишитесь на уведомления, чтобы не пропустить важные события
						</p>
					)}
				</div>
			</div>

			<div className="flex gap-2">
				{!isSubscribed ? (
					<button
						className="flex-1 rounded-xl bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isLoading || permission === 'denied'}
						onClick={handleOpenSettings}
						type="button"
					>
						🔔 Включить уведомления
					</button>
				) : (
					<button
						className="flex-1 rounded-xl bg-muted px-4 py-2.5 font-medium text-foreground transition-all duration-200 hover:bg-muted/80 disabled:opacity-50"
						disabled={isLoading}
						onClick={handleUnsubscribe}
						type="button"
					>
						{isLoading ? 'Отписка...' : '🔕 Отписаться на этом устройстве'}
					</button>
				)}
			</div>

			{/* Multi-Device List */}
			{isSubscribed && (
				<div className="mt-4">
					<PushDevicesList
						key={devicesKey}
						currentEndpoint={currentEndpoint}
						onDeviceRemoved={() => {
							setDevicesKey((prev) => prev + 1);
							checkSubscription();
						}}
						userId={userId}
					/>
				</div>
			)}

			{/* Platform-Specific Instructions */}
			{showInstructions && subscriptionError && (
				<div className="mt-4">
					<PlatformSpecificInstructions onClose={() => setShowInstructions(false)} />
				</div>
			)}

			{/* Settings Modal */}
			<PushNotificationSettingsModal
				isOpen={showSettingsModal}
				onClose={() => setShowSettingsModal(false)}
				onEnableNotifications={handleSubscribe}
				userId={userId}
			/>

			{permission === 'denied' && (
				<div className="mt-3 text-caption-2 text-muted-foreground">
					<p className="mb-1 font-semibold">Как разрешить уведомления:</p>
					<ul className="list-inside list-disc space-y-1">
						<li>Chrome: Настройки → Конфиденциальность → Уведомления</li>
						<li>Firefox: Настройки → Приватность → Разрешения</li>
						<li>Safari: Настройки → Веб-сайты → Уведомления</li>
					</ul>
				</div>
			)}
		</div>
	);
}
