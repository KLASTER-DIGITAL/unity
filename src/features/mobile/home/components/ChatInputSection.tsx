import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { MediaLightbox, PermissionGuide } from '@/features/mobile/media';
import { VoicePoweredOrb } from '@/shared/components/ui/voice-powered-orb';
import { useMediaUploader } from '@/shared/hooks/useMediaUploader';
import { AnimatedPresence } from '@/shared/lib/platform/animation';
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

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	// Auto-resize textarea
	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto';
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, []);

	// Обработка отправки сообщения - СРАЗУ показать Success Modal
	const handleSendMessage = () => {
		// 1. Сразу показать Success Modal (НЕ ждать обработки)
		setShowSuccessModal(true);

		// 2. Обработка в фоновом режиме
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
			console.error('Error sending message:', error);
			toast.error('Не удалось отправить сообщение', {
				description: error.message,
			});
		});
	};

	// Обработка клика на кнопку микрофона - ОТКРЫВАЕТ Voice Powered Orb
	const handleVoiceClick = () => {
		setShowVoiceOrb(true);
	};

	// Обработка готового транскрипта из Voice Powered Orb
	const handleTranscriptReady = (text: string) => {
		console.log('[ChatInputSection] handleTranscriptReady called with:', text);

		// 🚨 ВИЗУАЛЬНЫЙ DEBUG для мобильных
		toast.success(`💬 Текст добавлен в чат: "${text.substring(0, 20)}..."`, {
			duration: 2000,
			position: 'top-center',
		});

		setInputText((prev) => {
			const newText = prev ? `${prev} ${text}` : text;
			console.log('[ChatInputSection] Updated inputText:', newText);

			// 🚨 ВИЗУАЛЬНЫЙ DEBUG: Показываем новое значение inputText
			toast.info(`📝 inputText обновлен: "${newText.substring(0, 20)}..."`, {
				duration: 1500,
				position: 'top-center',
			});

			return newText;
		});
		console.log('[ChatInputSection] handleTranscriptReady completed');
	};

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
