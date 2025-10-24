import { transcribeAudio } from "@/shared/lib/api";
import { toast } from "sonner";
import { checkMicrophonePermission, triggerHapticFeedback } from "./PermissionUtils";

interface VoiceHandlerParams {
  isRecording: boolean;
  isVoiceSupported: boolean;
  stopRecording: () => Promise<Blob | null>;
  startRecording: () => Promise<void>;
  setIsTranscribing: (transcribing: boolean) => void;
  setInputText: (updater: (prev: string) => string) => void;
  setShowPermissionGuide: (type: 'microphone' | 'camera' | null) => void;
}

/**
 * Handle voice input - start/stop recording and transcribe
 */
export async function handleVoiceInput({
  isRecording,
  isVoiceSupported,
  stopRecording,
  startRecording,
  setIsTranscribing,
  setInputText,
  setShowPermissionGuide
}: VoiceHandlerParams) {
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
}

