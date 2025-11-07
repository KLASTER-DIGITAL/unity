/**
 * Push Notification Manager
 *
 * Компонент для управления Web Push уведомлениями в админ-панели:
 * - Генерация VAPID keys
 * - Отправка push уведомлений всем пользователям
 * - Просмотр статистики subscriptions
 * - История отправленных уведомлений
 */

import { ChevronDown, Key } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import { getPushTemplate, type PushTemplateType } from '@/shared/lib/i18n/push-templates';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface PushStats {
	totalSubscriptions: number;
	activeSubscriptions: number;
	totalSent: number;
	totalDelivered: number;
}

export function PushNotificationManager() {
	const [vapidPublicKey, setVapidPublicKey] = useState<string>('');
	const [vapidPrivateKey, setVapidPrivateKey] = useState<string>('');
	const [isGenerating, setIsGenerating] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [stats, setStats] = useState<PushStats | null>(null);
	const [isVapidOpen, setIsVapidOpen] = useState(false);

	// Form state
	const [useTemplate, setUseTemplate] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState<PushTemplateType>('daily_reminder');
	const [selectedLanguage, setSelectedLanguage] = useState('ru');
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [icon, setIcon] = useState('/icon-192.png');

	/**
	 * Загружает VAPID keys из admin_settings
	 */
	const loadVapidKeys = useCallback(async () => {
		try {
			const { data, error } = await supabase
				.from('admin_settings')
				.select('key, value')
				.in('key', ['vapid_public_key', 'vapid_private_key']);

			if (error) {
				console.error('Failed to load VAPID keys:', error);
				return;
			}

			const publicKeyRow = data?.find((row) => row.key === 'vapid_public_key');
			const privateKeyRow = data?.find((row) => row.key === 'vapid_private_key');

			if (publicKeyRow) setVapidPublicKey(publicKeyRow.value);
			if (privateKeyRow) setVapidPrivateKey(privateKeyRow.value);
		} catch (error) {
			console.error('Error loading VAPID keys:', error);
		}
	}, []);

	/**
	 * Загружает статистику subscriptions
	 */
	const loadStats = useCallback(async () => {
		try {
			// Total subscriptions
			const { count: totalCount } = await supabase
				.from('push_subscriptions')
				.select('*', { count: 'exact', head: true });

			// Active subscriptions
			const { count: activeCount } = await supabase
				.from('push_subscriptions')
				.select('*', { count: 'exact', head: true })
				.eq('is_active', true);

			// Total sent from history
			const { data: historyData } = await supabase
				.from('push_notifications_history')
				.select('total_sent, total_delivered');

			const totalSent = historyData?.reduce((sum, row) => sum + (row.total_sent || 0), 0) || 0;
			const totalDelivered =
				historyData?.reduce((sum, row) => sum + (row.total_delivered || 0), 0) || 0;

			setStats({
				totalSubscriptions: totalCount || 0,
				activeSubscriptions: activeCount || 0,
				totalSent,
				totalDelivered,
			});
		} catch (error) {
			console.error('Error loading stats:', error);
		}
	}, []);

	useEffect(() => {
		loadVapidKeys();
		loadStats();
	}, [loadVapidKeys, loadStats]);

	/**
	 * Генерирует новые VAPID keys используя Web Crypto API
	 * Создает ECDSA P-256 ключевую пару для Web Push
	 */
	const generateVapidKeys = async () => {
		setIsGenerating(true);
		try {
			// Генерируем ECDSA P-256 ключевую пару через Web Crypto API
			const keyPair = await crypto.subtle.generateKey(
				{
					name: 'ECDSA',
					namedCurve: 'P-256',
				},
				true, // extractable
				['sign', 'verify']
			);

			// Экспортируем публичный ключ в формате raw
			const publicKeyBuffer = await crypto.subtle.exportKey('raw', keyPair.publicKey);
			const publicKeyArray = new Uint8Array(publicKeyBuffer);

			// Конвертируем в URL-safe base64
			const publicKey = btoa(String.fromCharCode(...publicKeyArray))
				.replace(/\+/g, '-')
				.replace(/\//g, '_')
				.replace(/=/g, '');

			// Экспортируем приватный ключ в формате pkcs8
			const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
			const privateKeyArray = new Uint8Array(privateKeyBuffer);

			// Конвертируем в URL-safe base64
			const privateKey = btoa(String.fromCharCode(...privateKeyArray))
				.replace(/\+/g, '-')
				.replace(/\//g, '_')
				.replace(/=/g, '');

			console.log('[VAPID] Generated keys:', {
				publicKeyLength: publicKey.length,
				privateKeyLength: privateKey.length,
			});

			// Сохраняем в admin_settings
			await supabase.from('admin_settings').upsert(
				[
					{
						key: 'vapid_public_key',
						value: publicKey,
						category: 'push_notifications',
					},
					{
						key: 'vapid_private_key',
						value: privateKey,
						category: 'push_notifications',
					},
				],
				{ onConflict: 'key' }
			);

			setVapidPublicKey(publicKey);
			setVapidPrivateKey(privateKey);

			alert('✅ VAPID keys сгенерированы и сохранены!');
		} catch (error) {
			console.error('Error generating VAPID keys:', error);
			alert('❌ Ошибка при генерации VAPID keys');
		} finally {
			setIsGenerating(false);
		}
	};

	/**
	 * Отправляет push уведомление всем пользователям
	 */
	const sendPushNotification = async () => {
		if (!(title && body)) {
			alert('❌ Заполните заголовок и текст уведомления');
			return;
		}

		if (!(vapidPublicKey && vapidPrivateKey)) {
			alert('❌ Сначала сгенерируйте VAPID keys');
			return;
		}

		setIsSending(true);
		try {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session) {
				alert('❌ Не авторизован');
				return;
			}

			const response = await fetch(
				`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-sender`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${session.access_token}`,
					},
					body: JSON.stringify({
						user_ids: 'all',
						title,
						body,
						icon,
					}),
				}
			);

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to send push notification');
			}

			alert(`✅ Отправлено: ${result.sent} из ${result.total}`);

			// Очищаем форму
			setTitle('');
			setBody('');

			// Обновляем статистику
			loadStats();
		} catch (error) {
			console.error('Error sending push notification:', error);
			alert(`❌ Ошибка: ${error}`);
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* VAPID Keys Section - Collapsible */}
			<div className="rounded-lg bg-card p-4 shadow dark:bg-card">
				<Collapsible onOpenChange={setIsVapidOpen} open={isVapidOpen}>
					<CollapsibleTrigger asChild>
						<Button className="w-full justify-between" size="sm" variant="outline">
							<span className="flex items-center gap-2">
								<Key className="h-4 w-4" />
								VAPID Keys {vapidPublicKey && vapidPrivateKey && '(настроены)'}
							</span>
							<ChevronDown
								className={`h-4 w-4 transition-transform ${isVapidOpen ? 'rotate-180' : ''}`}
							/>
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className="mt-4">
						{!(vapidPublicKey && vapidPrivateKey) ? (
							<div className="space-y-4">
								<p className="text-muted-foreground text-sm dark:text-muted-foreground">
									VAPID keys не настроены. Сгенерируйте их для работы Web Push API.
								</p>
								<button
									className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
									disabled={isGenerating}
									onClick={generateVapidKeys}
								>
									{isGenerating ? 'Генерация...' : 'Сгенерировать VAPID Keys'}
								</button>
							</div>
						) : (
							<div className="space-y-4">
								<div>
									<label htmlFor="vapid-public-key" className="mb-2 block font-medium text-sm">
										Public Key
									</label>
									<input
										id="vapid-public-key"
										className="w-full rounded-lg border bg-muted px-3 py-2 font-mono text-xs dark:bg-muted"
										readOnly
										type="text"
										value={vapidPublicKey}
									/>
								</div>
								<div>
									<label htmlFor="vapid-private-key" className="mb-2 block font-medium text-sm">
										Private Key
									</label>
									<input
										id="vapid-private-key"
										className="w-full rounded-lg border bg-muted px-3 py-2 font-mono text-xs dark:bg-muted"
										readOnly
										type="password"
										value={vapidPrivateKey}
									/>
								</div>
								<button
									className="rounded-lg bg-muted px-4 py-2 text-sm text-white hover:bg-muted disabled:opacity-50"
									disabled={isGenerating}
									onClick={generateVapidKeys}
								>
									Перегенерировать
								</button>
							</div>
						)}
					</CollapsibleContent>
				</Collapsible>
			</div>

			{/* Statistics */}
			{stats && (
				<div className="rounded-lg bg-card p-6 shadow dark:bg-card">
					<h3 className="mb-4 font-semibold text-lg">Статистика</h3>
					<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
						<div className="rounded-lg bg-muted/50 p-3 text-center">
							<div className="font-bold text-3xl text-primary">{stats.totalSubscriptions}</div>
							<p className="mt-1 text-muted-foreground text-xs">Всего подписок</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 text-center">
							<div className="font-bold text-3xl text-green-600">{stats.activeSubscriptions}</div>
							<p className="mt-1 text-muted-foreground text-xs">Активных</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 text-center">
							<div className="font-bold text-3xl text-purple-600">{stats.totalSent}</div>
							<p className="mt-1 text-muted-foreground text-xs">Отправлено</p>
						</div>
						<div className="rounded-lg bg-muted/50 p-3 text-center">
							<div className="font-bold text-3xl text-orange-600">{stats.totalDelivered}</div>
							<p className="mt-1 text-muted-foreground text-xs">Доставлено</p>
						</div>
					</div>
				</div>
			)}

			{/* Send Push Notification */}
			<div className="rounded-lg bg-card p-6 shadow dark:bg-card">
				<h3 className="mb-4 font-semibold text-lg">Отправить уведомление</h3>

				<div className="space-y-4">
					{/* Template Toggle */}
					<div className="flex items-center gap-2">
						<input
							checked={useTemplate}
							className="h-4 w-4"
							id="useTemplate"
							onChange={(e) => {
								setUseTemplate(e.target.checked);
								if (e.target.checked) {
									const template = getPushTemplate(selectedTemplate, selectedLanguage);
									setTitle(template.title);
									setBody(template.body);
									setIcon(template.icon || '/icon-192.png');
								}
							}}
							type="checkbox"
						/>
						<label className="font-medium text-sm" htmlFor="useTemplate">
							Использовать шаблон
						</label>
					</div>

					{/* Template Selection */}
					{useTemplate && (
						<>
							<div>
								<label htmlFor="push-language" className="mb-2 block font-medium text-sm">
									Язык
								</label>
								<select
									id="push-language"
									className="w-full rounded-lg border px-3 py-2 dark:bg-muted"
									onChange={(e) => {
										setSelectedLanguage(e.target.value);
										const template = getPushTemplate(selectedTemplate, e.target.value);
										setTitle(template.title);
										setBody(template.body);
										setIcon(template.icon || '/icon-192.png');
									}}
									value={selectedLanguage}
								>
									<option value="ru">🇷🇺 Русский</option>
									<option value="en">🇬🇧 English</option>
									<option value="es">🇪🇸 Español</option>
									<option value="de">🇩🇪 Deutsch</option>
									<option value="fr">🇫🇷 Français</option>
									<option value="zh">🇨🇳 中文</option>
									<option value="ja">🇯🇵 日本語</option>
								</select>
							</div>

							<div>
								<label htmlFor="push-template" className="mb-2 block font-medium text-sm">
									Шаблон
								</label>
								<select
									id="push-template"
									className="w-full rounded-lg border px-3 py-2 dark:bg-muted"
									onChange={(e) => {
										const newTemplate = e.target.value as PushTemplateType;
										setSelectedTemplate(newTemplate);
										const template = getPushTemplate(newTemplate, selectedLanguage);
										setTitle(template.title);
										setBody(template.body);
										setIcon(template.icon || '/icon-192.png');
									}}
									value={selectedTemplate}
								>
									<option value="daily_reminder">📝 Ежедневное напоминание</option>
									<option value="weekly_report">📊 Еженедельный отчет</option>
									<option value="achievement_unlocked">🏆 Новое достижение</option>
									<option value="motivational">💪 Мотивационное сообщение</option>
									<option value="streak_milestone">🔥 Серия достижений</option>
									<option value="custom">✏️ Пользовательское</option>
								</select>
							</div>
						</>
					)}

					<div>
						<label htmlFor="push-title" className="mb-2 block font-medium text-sm">
							Заголовок
						</label>
						<input
							id="push-title"
							className="w-full rounded-lg border px-3 py-2 dark:bg-muted"
							disabled={useTemplate && selectedTemplate !== 'custom'}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Новое достижение!"
							type="text"
							value={title}
						/>
					</div>

					<div>
						<label className="mb-2 block font-medium text-sm">Текст</label>
						<textarea
							className="w-full rounded-lg border px-3 py-2 dark:bg-muted"
							disabled={useTemplate && selectedTemplate !== 'custom'}
							onChange={(e) => setBody(e.target.value)}
							placeholder="Поздравляем с новым достижением!"
							rows={3}
							value={body}
						/>
					</div>

					<div>
						<label className="mb-2 block font-medium text-sm">Иконка (URL)</label>
						<input
							className="w-full rounded-lg border px-3 py-2 dark:bg-muted"
							onChange={(e) => setIcon(e.target.value)}
							type="text"
							value={icon}
						/>
					</div>

					<button
						className="w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
						disabled={isSending || !vapidPublicKey}
						onClick={sendPushNotification}
					>
						{isSending ? 'Отправка...' : 'Отправить всем пользователям'}
					</button>
				</div>
			</div>
		</div>
	);
}
