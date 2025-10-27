import { useState, useRef, useCallback, useEffect } from 'react';
import { voice } from '../lib/platform/voice';

interface VoiceRecorderHook {
  isRecording: boolean;
  audioLevel: number;
  recordingTime: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  isSupported: boolean;
}

export function useVoiceRecorder(): VoiceRecorderHook {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  const timerIntervalRef = useRef<number | null>(null);
  const audioLevelIntervalRef = useRef<number | null>(null);

  const isSupported = voice.isSupported();

  // Начать запись
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Запись голоса не поддерживается в вашем браузере');
    }

    try {
      await voice.startRecording({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });

      setIsRecording(true);
      setRecordingTime(0);

      // Запускаем таймер для времени записи
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(voice.getDuration());
      }, 100);

      // Запускаем обновление уровня звука
      audioLevelIntervalRef.current = window.setInterval(() => {
        setAudioLevel(voice.getAudioLevel());
      }, 50);

      console.log('Recording started');
    } catch (error: any) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [isSupported]);

  // Остановить запись
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!isRecording) {
      return null;
    }

    try {
      const result = await voice.stopRecording();
      cleanup();

      if (!result) {
        return null;
      }

      // Return Blob (web) or convert URI to Blob (native)
      if (result.data instanceof Blob) {
        return result.data;
      } else {
        // TODO: Convert native URI to Blob when implementing native
        console.warn('Native audio URI not converted to Blob yet');
        return null;
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      cleanup();
      return null;
    }
  }, [isRecording]);

  // Отменить запись
  const cancelRecording = useCallback(() => {
    voice.cancelRecording();
    cleanup();
  }, []);

  // Очистка ресурсов
  const cleanup = () => {
    setIsRecording(false);
    setAudioLevel(0);
    setRecordingTime(0);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        voice.cancelRecording();
      }
      cleanup();
    };
  }, [isRecording]);

  return {
    isRecording,
    audioLevel,
    recordingTime,
    startRecording,
    stopRecording,
    cancelRecording,
    isSupported
  };
}
