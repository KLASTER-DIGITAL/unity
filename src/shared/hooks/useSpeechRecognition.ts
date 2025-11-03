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

		// ✅ FIX: Сохраняем последний результат (даже если isFinal=false)
		// На мобильных браузерах Web Speech API может НЕ отправлять isFinal=true
		let lastTranscript = '';

		// Set up callbacks
		speech.onStart(() => {
			console.log('[useSpeechRecognition] Speech started');
			lastTranscript = ''; // Сбрасываем при старте
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
				setTranscript(result.transcript);
			}
		});

		speech.onEnd(() => {
			console.log('[useSpeechRecognition] Speech ended');
			setIsListening(false);

			// ✅ FIX: Если есть последний результат но НЕ было финального - используем его
			if (lastTranscript && !transcript) {
				console.log('[useSpeechRecognition] Using last interim result:', lastTranscript);
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
	}, [isSupported, transcript]); // ✅ Добавляем transcript в зависимости

	const startListening = () => {
		if (!isSupported) {
			return;
		}

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
		isSupported,
	};
}
