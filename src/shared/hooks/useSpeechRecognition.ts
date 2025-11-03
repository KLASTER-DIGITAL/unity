import { useEffect, useState } from 'react';
import { speech } from '../lib/platform/speech';

type SpeechRecognitionHook = {
	isListening: boolean;
	transcript: string;
	startListening: () => void;
	stopListening: () => void;
	isSupported: boolean;
};

export function useSpeechRecognition(): SpeechRecognitionHook {
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState('');

	const isSupported = speech.isSupported();

	useEffect(() => {
		if (!isSupported) {
			return;
		}

		// ✅ FIX: Используем флаг для отслеживания финального результата
		// На мобильных браузерах Web Speech API может НЕ отправлять isFinal=true
		let lastTranscript = '';
		let hasFinalResult = false;

		// Set up callbacks
		speech.onStart(() => {
			console.log('[useSpeechRecognition] Speech started');
			lastTranscript = ''; // Сбрасываем при старте
			hasFinalResult = false; // Сбрасываем флаг
			setIsListening(true);
		});

		speech.onResult((result) => {
			console.log('[useSpeechRecognition] Result received:', {
				transcript: result.transcript,
				isFinal: result.isFinal,
				confidence: result.confidence,
			});

			// ✅ ВСЕГДА сохраняем последний результат
			lastTranscript = result.transcript;

			// Если финальный результат - сразу устанавливаем
			if (result.isFinal) {
				console.log('[useSpeechRecognition] Final result, setting transcript');
				hasFinalResult = true;
				setTranscript(result.transcript);
			}
		});

		speech.onEnd(() => {
			console.log('[useSpeechRecognition] Speech ended, hasFinalResult:', hasFinalResult, 'lastTranscript:', lastTranscript);
			setIsListening(false);

			// ✅ FIX: Если НЕ было финального результата но есть последний - используем его
			if (!hasFinalResult && lastTranscript) {
				console.log('[useSpeechRecognition] No final result, using last interim result:', lastTranscript);
				setTranscript(lastTranscript);
			}
		});

		speech.onError((error) => {
			console.error('[useSpeechRecognition] Speech recognition error:', error);
			setIsListening(false);
		});

		return () => {
			if (speech.isListening()) {
				speech.abort();
			}
		};
	}, [isSupported]); // ✅ Убираем transcript из зависимостей (не нужен)

	const startListening = () => {
		if (!isSupported) {
			return;
		}

		setTranscript('');
		speech.startListening({
			language: 'ru-RU',
			continuous: false,
			interimResults: true, // ✅ ВКЛЮЧАЕМ interim results для мобильных браузеров!
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
		isSupported,
	};
}
