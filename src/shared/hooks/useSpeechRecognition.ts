import { useState, useEffect } from 'react';
import { speech } from '../lib/platform/speech';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const isSupported = speech.isSupported();

  useEffect(() => {
    if (!isSupported) return;

    // Set up callbacks
    speech.onStart(() => {
      setIsListening(true);
    });

    speech.onResult((result) => {
      if (result.isFinal) {
        setTranscript(result.transcript);
      }
    });

    speech.onEnd(() => {
      setIsListening(false);
    });

    speech.onError((error) => {
      console.error('Speech recognition error:', error);
      setIsListening(false);
    });

    return () => {
      if (speech.isListening()) {
        speech.abort();
      }
    };
  }, [isSupported]);

  const startListening = () => {
    if (!isSupported) return;

    setTranscript('');
    speech.startListening({
      language: 'ru-RU',
      continuous: false,
      interimResults: false,
    });
  };

  const stopListening = () => {
    speech.stopListening();
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported
  };
}