import { useEffect, useRef, useState } from 'react';
import { MediaLightbox, PermissionGuide, useVoiceRecorder } from '@/features/mobile/media';
import { AIVoiceInput } from '@/shared/components/ui/ai-voice-input.tsx';
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
	handleVoiceInput as voiceInput,
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
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [lightboxOpen, setLightboxOpen] = useState(false);
	const [lightboxIndex, setLightboxIndex] = useState(0);
	const [showPermissionGuide, setShowPermissionGuide] = useState<'microphone' | 'camera' | null>(
		null
	);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [showAiHint, setShowAiHint] = useState(false); // ✅ СКРЫТО: AI hint по умолчанию выключен
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Голосовой рекордер
	const {
		isRecording,
		startRecording,
		stopRecording,
		isSupported: isVoiceSupported,
	} = useVoiceRecorder();

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

	// Обработка отправки сообщения
	const handleSendMessage = () =>
		sendMessage({
			inputText,
			uploadedMedia,
			selectedCategory,
			userName,
			userId,
			setShowSuccessModal,
			setInputText,
			setIsProcessing: _setIsProcessing,
			clearMedia,
			onMessageSent,
			onEntrySaved,
		});

	// Обработка голосового ввода
	const handleVoiceInput = () =>
		voiceInput({
			isRecording,
			isVoiceSupported,
			stopRecording,
			startRecording,
			setIsTranscribing,
			setInputText,
			setShowPermissionGuide,
		});

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
				{/* AI Voice Input - показывается когда идет запись */}
				{isRecording && (
					<div className="absolute -top-32 left-0 right-0 z-10 pointer-events-none">
						<AIVoiceInput />
					</div>
				)}

				{/* Main Input Area */}
				<InputArea
					inputText={inputText}
					isRecording={isRecording}
					isTranscribing={isTranscribing}
					isUploading={isUploading}
					onCategoryToggle={toggleCategory}
					onFilesDropped={handleFilesDropped}
					onInputChange={setInputText}
					onKeyPress={handleKeyPress}
					onMediaClick={handleMediaClick}
					onMediaUpload={handleMediaUpload}
					onRemoveMedia={removeMedia}
					onSendMessage={handleSendMessage}
					onVoiceClick={handleVoiceInput}
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

			{/* Success Modal - СТАРЫЙ дизайн с конфетти */}
			<SuccessModal isOpen={showSuccessModal} userName={userName} />
		</div>
	);
}
