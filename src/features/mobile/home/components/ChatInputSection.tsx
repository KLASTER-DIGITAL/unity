import { useState, useRef, useEffect } from "react";
import { AnimatedView, AnimatedPresence } from "@/shared/lib/platform/animation";
import { toast } from "sonner";
import { useVoiceRecorder, MediaLightbox, PermissionGuide } from "@/features/mobile/media";
import { useMediaUploader } from "@/shared/hooks/useMediaUploader";

// Import modular components, handlers and types
import {
  RecordingIndicator,
  SuccessModal,
  AIHintSection,
  InputArea,
  handleSendMessage as sendMessage,
  handleVoiceInput as voiceInput,
  handleMediaUpload as mediaUpload,
  handleFilesDropped as filesDropped
} from "./chat-input";
import type { ChatMessage, ChatInputSectionProps } from "./chat-input";

// Re-export types for backward compatibility
export type { ChatMessage, ChatInputSectionProps };

export function ChatInputSection({
  onMessageSent,
  onEntrySaved,
  userName = "Анна",
  userId = "anonymous"
}: ChatInputSectionProps) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showPermissionGuide, setShowPermissionGuide] = useState<'microphone' | 'camera' | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAiHint, setShowAiHint] = useState(true); // ✅ NEW: AI hint visibility
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Голосовой рекордер
  const {
    isRecording,
    audioLevel,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    isSupported: isVoiceSupported
  } = useVoiceRecorder();

  // Медиа загрузчик
  const {
    uploadedMedia,
    isUploading,
    uploadProgress,
    selectAndUploadMedia,
    removeMedia,
    clearMedia
  } = useMediaUploader();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputText]);

  // Обработка отправки сообщения
  const handleSendMessage = () => sendMessage({
    inputText,
    uploadedMedia,
    selectedCategory,
    userName,
    userId,
    setShowSuccessModal,
    setInputText,
    setIsProcessing,
    clearMedia,
    onMessageSent,
    onEntrySaved
  });



  // Обработка голосового ввода
  const handleVoiceInput = () => voiceInput({
    isRecording,
    isVoiceSupported,
    stopRecording,
    startRecording,
    setIsTranscribing,
    setInputText,
    setShowPermissionGuide
  });

  // Отменить запись
  const handleCancelRecording = () => {
    cancelRecording();
    toast.info("Запись отменена");
  };

  // Обработка загрузки медиа
  const handleMediaUpload = () => mediaUpload({
    userId,
    selectAndUploadMedia,
    uploadedMedia
  });

  // Обработка drag & drop
  const handleFilesDropped = (files: File[]) => filesDropped({
    userId,
    files
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
    setSelectedCategory(prev => prev === categoryId ? null : categoryId);
  };

  return (
    <div className="p-section pb-24">
      {/* Question Header */}
      <div className="mb-6">
        <h2 className="text-center text-[20px]! font-semibold! text-black leading-[26px]">
          Что сегодня получилось<br />лучше всего?
        </h2>
      </div>

      {/* ✅ FIX #4: Скрыли Messages Area - больше не нужна история чата */}
      {/* Messages Area */}
      {false && messages.length > 0 && (
        <div className="mb-6 space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
          <AnimatedPresence>
            {messages.map((message) => (
              <AnimatedView
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-[16px] px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-accent text-white'
                      : 'bg-card text-card-foreground'
                  }`}
                >
                  <p className="text-[15px]! font-normal! leading-[20px]">
                    {message.text}
                  </p>
                  {message.category && (
                    <span className="text-[12px]! opacity-70 mt-1 block">
                      #{message.category}
                    </span>
                  )}
                </div>
              </AnimatedView>
            ))}
          </AnimatedPresence>

          {/* AI Processing Indicator */}
          {isProcessing && (
            <AnimatedView
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-[16px] px-4 py-3 flex items-center gap-2 transition-colors duration-300">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-[pulse_0.6s_ease-in-out_0.2s_infinite]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-[pulse_0.6s_ease-in-out_0.4s_infinite]" />
                </div>
              </div>
            </AnimatedView>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="relative">
        {/* Recording Indicator */}
        <RecordingIndicator
          isRecording={isRecording}
          recordingTime={recordingTime}
          audioLevel={audioLevel}
          onStop={handleVoiceInput}
          onCancel={handleCancelRecording}
        />

        {/* Main Input Area */}
        <InputArea
          inputText={inputText}
          selectedCategory={selectedCategory}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          uploadedMedia={uploadedMedia}
          userId={userId}
          textareaRef={textareaRef}
          onInputChange={setInputText}
          onKeyPress={handleKeyPress}
          onVoiceClick={handleVoiceInput}
          onMediaUpload={handleMediaUpload}
          onSendMessage={handleSendMessage}
          onFilesDropped={handleFilesDropped}
          onRemoveMedia={removeMedia}
          onMediaClick={handleMediaClick}
          onCategoryToggle={toggleCategory}
        />
      </div>

      {/* AI Hint Section */}
      <AIHintSection
        showHint={showAiHint}
        messagesCount={messages.length}
        onClose={() => setShowAiHint(false)}
      />

      {/* Media Lightbox */}
      <MediaLightbox
        media={uploadedMedia}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Permission Guide */}
      <AnimatedPresence>
        {showPermissionGuide && (
          <PermissionGuide
            type={showPermissionGuide}
            isOpen={!!showPermissionGuide}
            onClose={() => setShowPermissionGuide(null)}
          />
        )}
      </AnimatedPresence>

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccessModal} userName={userName} />
    </div>
  );
}
