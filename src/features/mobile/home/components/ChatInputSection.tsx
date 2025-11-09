import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MediaLightbox, PermissionGuide } from '@/features/mobile/media';
import { VoicePoweredOrb } from '@/shared/components/ui/voice-powered-orb';
import { useMediaUploader } from '@/shared/hooks/useMediaUploader';
import { AnimatedPresence } from '@/shared/lib/platform/animation';
import { clearDraft, getDraftAge, loadDraft, saveDraft } from '@/shared/lib/storage/draftStorage';
import { debounce } from '@/shared/lib/utils/debounce';
import type { ChatInputSectionProps, ChatMessage } from './chat-input';
// Import modular components, handlers and types
import {
	AIHintSection,
	handleFilesDropped as filesDropped,
	InputArea,
	handleMediaUpload as mediaUpload,
	handleSendMessage as sendMessage,
} from './chat-input';
// ✅ СТАРЫЙ Success Modal с конфетти (НЕ новый дизайн)
import { SuccessModal } from './chat-input/SuccessModal';

// Re-export types for backward compatibility
export type { ChatMessage, ChatInputSectionProps };

export function ChatInputSection({
	onMessageSent,
	onEntrySaved,
	userName = 'Анна',
	userId = 'anonymous',
}: ChatInputSectionProps) {
	const [inputText, setInputText] = useState('');
	const [messages, _setMessages] = useState<ChatMessage[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
	const [_isProcessing, _setIsProcessing] = useState(false);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [showPermissionGuide, setShowPermissionGuide] = useState<'microphone' | 'camera' | null>(
		null
	);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [showAiHint, setShowAiHint] = useState(false); // ✅ СКРЫТО: AI hint по умолчанию выключен
	const [showVoiceOrb, setShowVoiceOrb] = useState(false); // Voice Powered Orb
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Медиа загрузчик
	const {
		uploadedMedia,
		isUploading,
		uploadProgress,
		selectAndUploadMedia,
		removeMedia,
		clearMedia,
	} = useMediaUploader();

	// ✅ DRAFT AUTO-SAVE: Загрузить черновик при монтировании
	useEffect(() => {
		if (!userId || userId === 'anonymous') {
			return;
		}

		const draft = loadDraft(userId);
		if (draft) {
			const age = getDraftAge(userId);
			console.log(`[DRAFT] Found draft (${age} min old), restoring...`);

			setInputText(draft.text);
			if (draft.category) {
				setSelectedCategory(draft.category);
			}

			// Показать уведомление
			toast.info('Черновик восстановлен', {
				description: `Сохранен ${age} мин назад`,
				duration: 3000,
			});
		}
	}, [userId]);

	// ✅ DRAFT AUTO-SAVE: Автосохранение при изменении текста (debounced)
	useEffect(() => {
		if (!userId || userId === 'anonymous') {
			return;
		}

		// Не сохранять пустой текст
		if (!inputText.trim()) {
			return;
		}

		const timeoutId = setTimeout(() => {
			saveDraft(userId, {
				text: inputText,
				category: selectedCategory,
				mediaUrls: uploadedMedia.map((m) => m.url).filter((url): url is string => !!url),
			});
		}, 1000); // Debounce 1 секунда

		return () => clearTimeout(timeoutId);
	}, [inputText, selectedCategory, uploadedMedia, userId]);

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	// ✅ OPTIMIZATION: Debounced auto-resize textarea для улучшения INP
	const debouncedResizeTextarea = useMemo(
		() =>
			debounce(() => {
				if (textareaRef.current) {
					textareaRef.current.style.height = 'auto';
					textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
				}
			}, 100),
		[]
	);

	// Auto-resize textarea on input change
	useEffect(() => {
		debouncedResizeTextarea();
	}, [debouncedResizeTextarea]);

	// Обработка отправки сообщения - СРАЗУ показать Success Modal
	const handleSendMessage = () => {
		// ✅ НОВОЕ: Проверка авторизации ПЕРЕД отправкой
		if (!userId || userId === 'anonymous') {
			toast.error('Требуется авторизация', {
				description: 'Войдите в систему для создания записей',
				duration: 5000,
				action: {
					label: 'Войти',
					onClick: () => {
						// Перезагрузить страницу для повторной авторизации
						window.location.reload();
					},
				},
			});
			console.error('[CHAT INPUT] User not authenticated - userId:', userId);
			return;
		}

		// ✅ НОВОЕ: Проверка что текст не пустой
		if (!inputText || inputText.trim().length === 0) {
			toast.error('Пустое сообщение', {
				description: 'Введите текст для создания записи',
				duration: 3000,
			});
			console.error('[CHAT INPUT] Empty message - cannot send');
			return;
		}

		// 1. Сразу показать Success Modal (НЕ ждать обработки)
		setShowSuccessModal(true);

		// 2. Очистить черновик (запись успешно отправлена)
		if (userId && userId !== 'anonymous') {
			clearDraft(userId);
		}

		// 3. Обработка в фоновом режиме
		sendMessage({
			inputText,
			uploadedMedia,
			selectedCategory,
			userName,
			userId,
			setShowSuccessModal: () => {
				// Не нужно, Success Modal уже показан
			},
			setInputText,
			setIsProcessing: _setIsProcessing,
			clearMedia,
			onMessageSent,
			onEntrySaved,
		}).catch((error) => {
			console.error('[CHAT INPUT] Error sending message:', error);
			// Скрыть Success Modal при ошибке
			setShowSuccessModal(false);
			toast.error('Не удалось отправить сообщение', {
				description: error.message,
				duration: 5000,
			});
		});
	};

	// Обработка клика на кнопку микрофона - ОТКРЫВАЕТ Voice Powered Orb
	const handleVoiceClick = () => {
		setShowVoiceOrb(true);
	};

	// ✅ FIX: Обработка готового транскрипта из Voice Powered Orb
	// Обернуто в useCallback для стабильности (как в ChatGPTInput)
	const handleTranscriptReady = useCallback((text: string) => {
		console.log('[ChatInputSection] handleTranscriptReady called with:', text);

		if (!text?.trim()) {
			console.warn('[ChatInputSection] Empty transcript, ignoring');
			return;
		}

		setInputText((prev) => {
			const newText = prev?.trim() ? `${prev.trim()} ${text.trim()}` : text.trim();
			console.log('[ChatInputSection] Updated inputText:', newText);
			return newText;
		});
		console.log('[ChatInputSection] handleTranscriptReady completed');
	}, []);

	// Обработка загрузки медиа
	const handleMediaUpload = () =>
		mediaUpload({
			userId,
			selectAndUploadMedia,
			uploadedMedia,
		});

	// Обработка drag & drop
	const handleFilesDropped = (files: File[]) =>
		filesDropped({
			userId,
			files,
		});

	// Открыть лайтбокс
	const handleMediaClick = (index: number) => {
		setLightboxIndex(index);
		setLightboxOpen(true);
	};

	// Обработка Enter (отправка) и Shift+Enter (новая строка)
	const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	const toggleCategory = (categoryId: string) => {
		setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
	};

	return (
		<div className="p-section pb-24">
			{/* Question Header */}
			<div className="mb-6">
				<h2 className="text-center font-semibold! text-[20px]! text-black leading-[26px]">
					Что сегодня получилось
					<br />
					лучше всего?
				</h2>
			</div>

			{/* ✅ FIX #4: Скрыли Messages Area - больше не нужна история чата */}
			{/* Messages Area */}
			{false}

			{/* Input Area */}
			<div className="relative">
				{/* Main Input Area */}
				<InputArea
					inputText={inputText}
					isUploading={isUploading}
					onCategoryToggle={toggleCategory}
					onFilesDropped={handleFilesDropped}
					onInputChange={setInputText}
					onKeyPress={handleKeyPress}
					onMediaClick={handleMediaClick}
					onMediaUpload={handleMediaUpload}
					onRemoveMedia={removeMedia}
					onSendMessage={handleSendMessage}
					onVoiceClick={handleVoiceClick}
					selectedCategory={selectedCategory}
					textareaRef={textareaRef}
					uploadedMedia={uploadedMedia}
					uploadProgress={uploadProgress}
					userId={userId}
				/>
			</div>

			{/* AI Hint Section */}
			<AIHintSection
				messagesCount={messages.length}
				onClose={() => setShowAiHint(false)}
				showHint={showAiHint}
			/>

			{/* Media Lightbox */}
			<MediaLightbox
				initialIndex={lightboxIndex}
				isOpen={lightboxOpen}
				media={uploadedMedia}
				onClose={() => setLightboxOpen(false)}
			/>

			{/* Permission Guide */}
			<AnimatedPresence>
				{showPermissionGuide && (
					<PermissionGuide
						isOpen={!!showPermissionGuide}
						onClose={() => setShowPermissionGuide(null)}
						type={showPermissionGuide}
					/>
				)}
			</AnimatedPresence>

			{/* Success Modal - СТАРЫЙ дизайн с конфетти, автозакрытие через 5 секунд */}
			<SuccessModal
				isOpen={showSuccessModal}
				userName={userName}
				onClose={() => setShowSuccessModal(false)}
			/>

			{/* Voice Powered Orb */}
			<VoicePoweredOrb
				isOpen={showVoiceOrb}
				onClose={() => setShowVoiceOrb(false)}
				onTranscriptReady={handleTranscriptReady}
			/>
		</div>
	);
}
