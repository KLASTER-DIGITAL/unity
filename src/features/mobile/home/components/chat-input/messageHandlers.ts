import { toast } from 'sonner';
import { analyzeTextWithAI, createEntry } from '@/shared/lib/api';
import { canUseOfflineMode, saveEntryOffline, shouldShowPremiumModal } from '@/shared/lib/offline';
import type { UserDataForOfflineCheck } from '@/shared/lib/offline/helpers';
import { triggerHapticFeedback } from './PermissionUtils';
import type { ChatMessage } from './types';

type MessageHandlerParams = {
	inputText: string;
	uploadedMedia: any[];
	selectedCategory: string | null;
	userName: string;
	userId: string;
	userData?: UserDataForOfflineCheck | null;
	setShowSuccessModal: (show: boolean) => void;
	setShowPremiumModal?: (show: boolean) => void;
	setInputText: (text: string) => void;
	setIsProcessing: (processing: boolean) => void;
	clearMedia: () => void;
	onMessageSent?: (message: ChatMessage) => void;
	onEntrySaved?: (entry: any) => void;
};

/**
 * Handle sending a message
 * Analyzes text with AI, saves entry to database, and handles offline mode
 */
export async function handleSendMessage({
	inputText,
	uploadedMedia,
	selectedCategory,
	userName,
	userId,
	userData,
	setShowSuccessModal,
	setShowPremiumModal,
	setInputText,
	setIsProcessing,
	clearMedia,
	onMessageSent,
	onEntrySaved,
}: MessageHandlerParams) {
	if (!inputText.trim() && uploadedMedia.length === 0) {
		return;
	}

	const userText = inputText.trim();
	const userMessage: ChatMessage = {
		id: Date.now().toString(),
		type: 'user',
		text: userText || '📷 Медиа',
		timestamp: new Date(),
		category: selectedCategory || undefined,
	};

	// ✅ FIX: Очищаем input СРАЗУ, но НЕ показываем modal (чтобы не зависало)
	setInputText('');
	setIsProcessing(true);

	// Haptic feedback
	triggerHapticFeedback(50);

	try {
		// Запрос к AI для анализа текста
		console.log('Analyzing text with AI...');
		const analysis = await analyzeTextWithAI(userText, userName, userId);

		console.log('AI Analysis result:', analysis);

		// Сохраняем запись в БД
		const entryData = {
			userId,
			text: userText,
			sentiment: analysis.sentiment,
			category: selectedCategory || analysis.category,
			tags: analysis.tags,
			aiReply: analysis.reply,
			aiResponse: analysis.reply,
			aiSummary: analysis.summary,
			aiInsight: analysis.insight,
			isAchievement: analysis.isAchievement,
			mood: analysis.mood,
			media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
			streakDay: 1, // TODO: Calculate actual streak
			focusArea: analysis.category,
		};

		console.log('Creating entry in database with', uploadedMedia.length, 'media files...');

		// Check if online
		if (!navigator.onLine) {
			console.log('App is offline, checking offline mode access...');

			// ✅ PREMIUM CHECK: Verify user can use offline mode
			const offlineCheck = canUseOfflineMode(userData);

			if (!offlineCheck.allowed) {
				console.log('Offline mode access denied:', offlineCheck.reason);

				// Show appropriate UI based on reason
				if (shouldShowPremiumModal(offlineCheck)) {
					// Show premium modal for non-premium users
					setShowPremiumModal?.(true);
					toast.error(offlineCheck.message || 'Offline режим доступен только для Premium', {
						description: 'Обновитесь до Premium для работы без интернета',
						duration: 5000,
						action: {
							label: 'Узнать больше',
							onClick: () => setShowPremiumModal?.(true),
						},
					});
				} else {
					// Show info toast for other reasons (disabled, not authenticated)
					toast.info(offlineCheck.message || 'Offline режим недоступен', {
						description:
							offlineCheck.reason === 'disabled'
								? 'Включите Offline режим в настройках'
								: 'Войдите в систему для использования offline режима',
						duration: 4000,
					});
				}

				// Hide success modal and stop processing
				setShowSuccessModal(false);
				setIsProcessing(false);
				return;
			}

			// User has access to offline mode - save entry
			console.log('Offline mode access granted, saving entry for later sync...');

			const pendingEntry = await saveEntryOffline(userId, userText, {
				sentiment: analysis.sentiment,
				category: selectedCategory || analysis.category,
				mood: analysis.mood,
				media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
				tags: analysis.tags,
			});

			console.log('Entry saved offline:', pendingEntry);

			// ✅ Показываем success modal ТОЛЬКО после успешного сохранения offline
			setShowSuccessModal(true);

			// Show offline toast
			toast.success('Сохранено offline', {
				description: 'Запись будет синхронизирована когда появится интернет',
				duration: 4000,
				icon: '📴',
			});

			// Callbacks with pending entry
			onMessageSent?.(userMessage);

			// ✅ Modal автоматически закроется через 3 секунды (autoCloseDuration в SuccessModal)
		} else {
			// Save online
			const savedEntry = await createEntry(entryData);

			console.log('Entry saved successfully:', savedEntry);

			// ✅ Показываем success modal ТОЛЬКО после успешного сохранения
			setShowSuccessModal(true);

			// Обновляем сообщение пользователя с ID записи
			userMessage.entryId = savedEntry.id;

			// Callbacks
			onMessageSent?.(userMessage);
			onEntrySaved?.(savedEntry);

			// ✅ Modal автоматически закроется через 3 секунды (autoCloseDuration в SuccessModal)
			// ✅ UI обновится автоматически через Supabase Realtime (useEntries hook)
		}
	} catch (error) {
		console.error('[MESSAGE HANDLER] ❌ Error processing message:', error);
		console.error('[MESSAGE HANDLER] Error details:', {
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
			userText: userText.substring(0, 100),
			userId,
		});

		// Hide success modal on error
		setShowSuccessModal(false);

		// Detailed error message
		let errorMessage = 'Не удалось сохранить запись. Попробуйте снова.';
		if (error instanceof Error) {
			if (error.message.includes('OpenAI')) {
				errorMessage = 'Ошибка AI анализа. Попробуйте позже.';
			} else if (error.message.includes('network')) {
				errorMessage = 'Проблема с интернетом. Проверьте подключение.';
			} else if (error.message.includes('auth')) {
				errorMessage = 'Ошибка авторизации. Перезагрузите приложение.';
			}
		}

		// Error toast
		toast.error('Ошибка обработки', {
			description: errorMessage,
			duration: 5000,
		});

		// ✅ FIX #4: НЕ добавляем fallback ответ в чат
	} finally {
		setIsProcessing(false);
		clearMedia(); // Очищаем загруженные медиа после отправки
	}
}
