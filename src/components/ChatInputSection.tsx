import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import svgPaths from "../imports/svg-7dtbhv9t1o";
import { Mic, Send, Camera, Sparkles, AlertCircle, X, Image as ImageIcon, Info } from "lucide-react";
import { analyzeTextWithAI, createEntry, transcribeAudio, type DiaryEntry } from "../utils/api";
import { toast } from "sonner";
import { useVoiceRecorder } from "./hooks/useVoiceRecorder";
import { useMediaUploader } from "./hooks/useMediaUploader";
import { MediaPreview } from "./MediaPreview";
import { MediaLightbox } from "./MediaLightbox";
import { PermissionGuide } from "./PermissionGuide";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
  category?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  entryId?: string;
}

interface ChatInputSectionProps {
  onMessageSent?: (message: ChatMessage) => void;
  onEntrySaved?: (entry: DiaryEntry) => void;
  userName?: string;
  userId?: string;
}

// Категории для быстрого выбора
const CATEGORIES = [
  { id: 'Семья', label: 'Семья', icon: '👨‍👩‍👧', color: '#92BFFF' },
  { id: 'Работа', label: 'Работа', icon: '💼', color: '#92BFFF' },
  { id: 'Финансы', label: 'финансы', icon: '💰', color: '#92BFFF' },
  { id: 'Благодарность', label: 'Благодарность', icon: '🙏', color: '#92BFFF' }
];

export function ChatInputSection({
  onMessageSent,
  onEntrySaved,
  userName = "Пользователь",
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

    // Добавляем сообщение пользователя
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    try {
      // Запрос к AI для анализа текста
      console.log("Analyzing text with AI...");
      const analysis = await analyzeTextWithAI(userText, userName, userId);
      
      console.log("AI Analysis result:", analysis);

      // Создаем AI ответ
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: analysis.reply,
        timestamp: new Date(),
        sentiment: analysis.sentiment,
        category: analysis.category
      };

      setMessages(prev => [...prev, aiResponse]);

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
      const savedEntry = await createEntry(entryData);
      
      console.log("Entry saved successfully:", savedEntry);

      // Обновляем сообщение пользователя с ID записи
      userMessage.entryId = savedEntry.id;
      
      // Callbacks
      onMessageSent?.(userMessage);
      onEntrySaved?.(savedEntry);

      // Success toast
      toast.success("Достижение сохранено! 🎉", {
        description: `Категория: ${savedEntry.category}`,
        duration: 3000
      });

    } catch (error) {
      console.error("Error processing message:", error);
      
      // Error toast
      toast.error("Ошибка обработки", {
        description: "Не удалось сохранить запись. Попробуйте снова.",
        duration: 4000
      });

      // Fallback AI response
      const fallbackAiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: "Записано! 💪 Продолжай отмечать свои достижения!",
        timestamp: new Date(),
        sentiment: 'positive'
      };

      setMessages(prev => [...prev, fallbackAiResponse]);
    } finally {
      setIsProcessing(false);
      clearMedia(); // Очищаем загруженные медиа после отправки
    }
  };

  // Проверка статуса разрешений микрофона
  const checkMicrophonePermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
    try {
      // Проверяем Permissions API
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        return result.state as 'granted' | 'denied' | 'prompt';
      }
    } catch (error) {
      console.log('Permissions API not available:', error);
    }
    
    // Fallback - пробуем получить доступ
    return 'prompt';
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
        if (navigator.vibrate) {
          navigator.vibrate([50, 100, 50]);
        }

      } catch (error: any) {
        console.error('Transcription error:', error);
        toast.error("Ошибка распознавания", { 
          id: 'transcribing',
          description: error.message 
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
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
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
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
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
    <div className="px-6 pb-24 pt-2">
      {/* Question Header */}
      <div className="mb-5">
        <h2 className="text-center !text-[20px] !font-semibold text-black leading-[26px]">
          Что сегодня получилось<br />лучше всего?
        </h2>
      </div>

      {/* Messages Area */}
      {messages.length > 0 && (
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
                      : 'bg-gray-100 text-black'
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
              <div className="bg-gray-100 rounded-[16px] px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
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
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-16 left-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-[16px] p-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-3 h-3 bg-white rounded-full"
                  />
                  <div>
                    <p className="!text-[13px] text-white !font-semibold">
                      Идет запись...
                    </p>
                    <p className="!text-[11px] text-white/80">
                      {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </p>
                  </div>
                </div>

                {/* Audio Level Visualizer */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-white rounded-full"
                      animate={{
                        height: audioLevel * 20 * (1 + i * 0.2)
                      }}
                      transition={{ duration: 0.1 }}
                      style={{ minHeight: '4px' }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleCancelRecording}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Input Container */}
        <div className="relative bg-white/80 rounded-[16px] border border-[rgba(0,0,0,0.2)] backdrop-blur-sm">
          <div className="flex items-end gap-2 p-2">
            {/* Voice Button */}
            <button
              onClick={handleVoiceInput}
              disabled={isTranscribing}
              className={`flex-shrink-0 w-[28px] h-[28px] rounded-[16px] flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-red-500'
                  : isTranscribing
                  ? 'bg-blue-500'
                  : 'hover:bg-gray-100 active:scale-95'
              } ${isTranscribing ? 'opacity-50' : ''}`}
            >
              {isTranscribing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <Mic className="w-4 h-4" color={isRecording ? "white" : "black"} />
              )}
            </button>

            {/* Text Input */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Опиши главную мысль, момент, благодарность"
                rows={1}
                className="w-full resize-none border-none outline-none bg-transparent !text-[14px] !font-normal leading-[20px] text-black placeholder:text-[rgba(0,0,0,0.2)] max-h-[100px]"
                style={{ 
                  fontFamily: 'Inter, sans-serif'
                }}
              />
            </div>

            {/* Media Upload Button */}
            <button
              onClick={handleMediaUpload}
              disabled={isUploading}
              className={`flex-shrink-0 w-[28px] h-[28px] rounded-[16px] flex items-center justify-center transition-all ${
                isUploading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-100 active:scale-95'
              }`}
            >
              {isUploading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
                />
              ) : (
                <ImageIcon className="w-4 h-4" color="rgba(0,0,0,0.4)" />
              )}
            </button>

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() && uploadedMedia.length === 0}
              className={`flex-shrink-0 w-[28px] h-[28px] rounded-[16px] flex items-center justify-center transition-all ${
                inputText.trim() || uploadedMedia.length > 0
                  ? 'hover:bg-gray-100 active:scale-95'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" color="rgba(0,0,0,0.4)" />
            </button>
          </div>

          {/* Media Preview */}
          {uploadedMedia.length > 0 && (
            <div className="mt-2 px-2">
              <MediaPreview
                media={uploadedMedia}
                onRemove={removeMedia}
                onImageClick={handleMediaClick}
              />
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && uploadProgress > 0 && (
            <div className="mt-2 px-2">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="!text-[11px] text-gray-500 mt-1 text-center">
                Загрузка... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-[#9d9d9d] transition-all ${
                selectedCategory === category.id
                  ? 'bg-accent/10 border-accent'
                  : 'bg-transparent hover:bg-gray-50 active:scale-95'
              }`}
            >
              <span className="text-[10px]">{category.icon}</span>
              <span className="!text-[12px] !font-light text-black" style={{ fontVariationSettings: "'wdth' 100" }}>
                {category.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-[16px] p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="!text-[14px] !font-semibold text-black mb-1">
                  AI подскажет
                </h4>
                <p className="!text-[13px] !font-normal text-gray-600 leading-[18px]">
                  Опиши своё достижение, и я помогу структурировать запись, выбрать категорию и отметить прогресс
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Connection Info */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-3 flex items-center justify-center gap-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <p className="!text-[11px] !font-normal text-gray-400">
            Подключено к AI
          </p>
        </motion.div>
      )}

      {/* Quick Actions (опционально) */}
      {messages.length === 0 && (
        <div className="mt-4 flex gap-2">
          <button 
            onClick={handleMediaUpload}
            disabled={isUploading}
            className="flex-1 bg-white border border-border rounded-[12px] p-3 flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
          >
            <Camera className="w-4 h-4 text-accent" />
            <span className="!text-[13px] !font-normal text-black">Добавить фото</span>
          </button>
        </div>
      )}

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
    </div>
  );
}
