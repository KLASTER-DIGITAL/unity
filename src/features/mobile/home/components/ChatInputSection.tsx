import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { analyzeTextWithAI, createEntry, transcribeAudio } from "@/shared/lib/api";
import { toast } from "sonner";
import { useVoiceRecorder, MediaLightbox, PermissionGuide } from "@/features/mobile/media";
import { useMediaUploader } from "@/shared/hooks/useMediaUploader";
import { saveEntryOffline } from "@/shared/lib/offline";

// Import modular components and types
import {
  RecordingIndicator,
  SuccessModal,
  AIHintSection,
  InputArea,
  checkMicrophonePermission,
  triggerHapticFeedback
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
  const handleSendMessage = async () => {
    if (!inputText.trim() && uploadedMedia.length === 0) return;

    const userText = inputText.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: userText || '📷 Медиа',
      timestamp: new Date(),
      category: selectedCategory || undefined
    };

    // ✅ FIX: Показываем success modal СРАЗУ (до отправки на сервер)
    setShowSuccessModal(true);
    setInputText("");
    setIsProcessing(true);

    // Haptic feedback
    triggerHapticFeedback(50);

    try {
      // Запрос к AI для анализа текста
      console.log("Analyzing text with AI...");
      const analysis = await analyzeTextWithAI(userText, userName, userId);

      console.log("AI Analysis result:", analysis);

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
        focusArea: analysis.category
      };

      console.log("Creating entry in database with", uploadedMedia.length, "media files...");

      // Check if online
      if (!navigator.onLine) {
        console.log("App is offline, saving entry for later sync...");

        // Save offline
        const pendingEntry = await saveEntryOffline(userId, userText, {
          sentiment: analysis.sentiment,
          category: selectedCategory || analysis.category,
          mood: analysis.mood,
          media: uploadedMedia.length > 0 ? uploadedMedia : undefined,
          tags: analysis.tags,
        });

        console.log("Entry saved offline:", pendingEntry);

        // Show offline toast
        toast.info("Сохранено офлайн", {
          description: "Запись будет синхронизирована когда появится интернет",
          duration: 4000
        });

        // Callbacks with pending entry
        onMessageSent?.(userMessage);

        // Автоматически скрываем modal через 2 секунды
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      } else {
        // Save online
        const savedEntry = await createEntry(entryData);

        console.log("Entry saved successfully:", savedEntry);

        // Обновляем сообщение пользователя с ID записи
        userMessage.entryId = savedEntry.id;

        // Callbacks
        onMessageSent?.(userMessage);
        onEntrySaved?.(savedEntry);

        // Автоматически скрываем modal через 2 секунды после успешного сохранения
        setTimeout(() => {
          setShowSuccessModal(false);
        }, 2000);
      }

    } catch (error) {
      console.error("Error processing message:", error);

      // Error toast
      toast.error("Ошибка обработки", {
        description: "Не удалось сохранить запись. Попробуйте снова.",
        duration: 4000
      });

      // ✅ FIX #4: НЕ добавляем fallback ответ в чат
      // const fallbackAiResponse: ChatMessage = {
      //   id: (Date.now() + 1).toString(),
      //   type: 'ai',
      //   text: "Записано! 💪 Продолжай отмечать свои достижения!",
      //   timestamp: new Date(),
      //   sentiment: 'positive'
      // };

      // setMessages(prev => [...prev, fallbackAiResponse]);
    } finally {
      setIsProcessing(false);
      clearMedia(); // Очищаем загруженные медиа после отправки
    }
  };



  // Обработка голосового ввода
  const handleVoiceInput = async () => {
    if (!isVoiceSupported) {
      toast.error("Голосовой ввод недоступен", {
        description: "Ваш браузер не поддерживает запись голоса"
      });
      return;
    }

    if (isRecording) {
      // Останавливаем запись и транскрибируем
      setIsTranscribing(true);
      
      try {
        const audioBlob = await stopRecording();
        
        if (!audioBlob) {
          toast.error("Не удалось записать аудио");
          return;
        }

        console.log('Audio recorded, size:', audioBlob.size, 'type:', audioBlob.type);

        // Отправляем на транскрибацию
        toast.loading("Распознаю речь...", { id: 'transcribing' });
        
        const transcribedText = await transcribeAudio(audioBlob);
        
        toast.success("Готово! ✨", { id: 'transcribing' });

        // Добавляем текст в input
        setInputText(prev => {
          const newText = prev ? `${prev} ${transcribedText}` : transcribedText;
          return newText;
        });

        // Haptic feedback
        triggerHapticFeedback([50, 100, 50]);

      } catch (error: any) {
        console.error('Transcription error:', error);

        // Более информативные сообщения об ошибках
        let errorMessage = "Ошибка распознавания";
        let errorDescription = error.message;

        if (error.message?.includes('OpenAI API key')) {
          errorMessage = "Сервис недоступен";
          errorDescription = "Администратор не настроил OpenAI API. Попробуйте позже.";
        } else if (error.message?.includes('Transcription failed')) {
          errorMessage = "Ошибка распознавания";
          errorDescription = "Не удалось распознать речь. Попробуйте еще раз.";
        } else if (error.message?.includes('No active session')) {
          errorMessage = "Ошибка авторизации";
          errorDescription = "Пожалуйста, перезагрузите приложение.";
        }

        toast.error(errorMessage, {
          id: 'transcribing',
          description: errorDescription
        });
      } finally {
        setIsTranscribing(false);
      }
    } else {
      // Проверяем статус разрешения ПЕРЕД попыткой записи
      const permissionStatus = await checkMicrophonePermission();
      
      if (permissionStatus === 'denied') {
        // Разрешение уже отклонено - показываем гайд сразу
        toast.info("Доступ к микрофону заблокирован", {
          description: "Нажмите для получения инструкций",
          duration: 6000,
          action: {
            label: "Помощь",
            onClick: () => setShowPermissionGuide('microphone')
          }
        });
        return;
      }
      
      if (permissionStatus === 'prompt') {
        // Первый раз - показываем информационное сообщение
        toast.info("🎤 Разрешите доступ к микрофону", {
          description: "Нажмите 'Разрешить' в диалоге браузера",
          duration: 3000
        });
      }
      
      // Начинаем запись
      try {
        await startRecording();
        toast.success("Говорите...", { duration: 1000 });

        // Haptic feedback
        triggerHapticFeedback(50);
      } catch (error: any) {
        console.error('Recording error:', error);
        
        // Показываем понятное сообщение об ошибке
        if (error.message.includes('Доступ к микрофону запрещен')) {
          // Пользователь отклонил разрешение
          setShowPermissionGuide('microphone');
          toast.info("Доступ к микрофону необходим", {
            description: "Следуйте инструкциям для настройки",
            duration: 5000
          });
        } else if (error.message.includes('Микрофон не найден')) {
          toast.error("Микрофон не найден", {
            description: "Подключите микрофон и попробуйте снова",
            duration: 5000
          });
        } else if (error.message.includes('используется другим приложением')) {
          toast.error("Микрофон занят", {
            description: "Закройте другие приложения, использующие микрофон",
            duration: 5000
          });
        } else {
          toast.error("Не удалось начать запись", {
            description: error.message,
            duration: 5000
          });
        }
      }
    }
  };

  // Отменить запись
  const handleCancelRecording = () => {
    cancelRecording();
    toast.info("Запись отменена");
  };

  // Обработка загрузки медиа
  const handleMediaUpload = async () => {
    if (!userId || userId === 'anonymous') {
      toast.error("Необходимо авторизоваться", {
        description: "Войдите в аккаунт для загрузки медиа"
      });
      return;
    }

    try {
      await selectAndUploadMedia(userId);
      
      if (uploadedMedia.length > 0) {
        toast.success("Медиа загружено!");

        // Haptic feedback
        triggerHapticFeedback(50);
      }
    } catch (error: any) {
      console.error('Media upload error:', error);
      
      const errorMessage = error.message || 'Неизвестная ошибка';
      
      // Показываем понятное сообщение
      if (errorMessage.includes('Файл слишком большой')) {
        toast.error("Файл слишком большой", {
          description: "Максимальный размер файла - 10 MB",
          duration: 5000
        });
      } else if (errorMessage.includes('Неподдерживаемый формат')) {
        toast.error("Неподдерживаемый формат", {
          description: "Поддерживаются только изображения и видео",
          duration: 5000
        });
      } else if (errorMessage.includes('Failed to load image') || errorMessage.includes('Не удалось загрузить')) {
        toast.error("Ошибка загрузки изображения", {
          description: "Файл может быть поврежден. Попробуйте другой файл.",
          duration: 5000
        });
      } else {
        toast.error("Ошибка загрузки", {
          description: errorMessage,
          duration: 5000
        });
      }
    }
  };

  // Обработка drag & drop
  const handleFilesDropped = async (files: File[]) => {
    if (!userId || userId === 'anonymous') {
      toast.error("Необходимо авторизоваться", {
        description: "Войдите в аккаунт для загрузки медиа"
      });
      return;
    }

    try {
      // TODO: Implement batch upload for drag & drop
      toast.info("Drag & drop загрузка в разработке");

      // Haptic feedback
      triggerHapticFeedback(50);
    } catch (error: any) {
      console.error('Drag & drop upload error:', error);
      toast.error("Ошибка загрузки", {
        description: error.message || 'Попробуйте еще раз'
      });
    }
  };

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
        <h2 className="text-center !text-[20px] !font-semibold text-black leading-[26px]">
          Что сегодня получилось<br />лучше всего?
        </h2>
      </div>

      {/* ✅ FIX #4: Скрыли Messages Area - больше не нужна история чата */}
      {/* Messages Area */}
      {false && messages.length > 0 && (
        <div className="mb-6 space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
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
                  <p className="!text-[15px] !font-normal leading-[20px]">
                    {message.text}
                  </p>
                  {message.category && (
                    <span className="!text-[12px] opacity-70 mt-1 block">
                      #{message.category}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* AI Processing Indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-[16px] px-4 py-3 flex items-center gap-2 transition-colors duration-300">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-2 h-2 bg-muted-foreground rounded-full"
                  />
                </div>
              </div>
            </motion.div>
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
      <AnimatePresence>
        {showPermissionGuide && (
          <PermissionGuide
            type={showPermissionGuide}
            isOpen={!!showPermissionGuide}
            onClose={() => setShowPermissionGuide(null)}
          />
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <SuccessModal isOpen={showSuccessModal} userName={userName} />
    </div>
  );
}
