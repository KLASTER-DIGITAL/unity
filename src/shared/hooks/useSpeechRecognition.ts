import { useCallback, useEffect, useRef, useState } from 'react';
import { speech } from '../lib/platform/speech';

type SpeechRecognitionHook = {
	isListening: boolean;
	transcript: string;
	startListening: () => void;
	stopListening: () => void;
	abortListening: () => void;
	resetTranscript: () => void;
	isSupported: boolean;
};

export function useSpeechRecognition(): SpeechRecognitionHook {
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState('');
	const isManualStopRef = useRef(false); // ✅ Track manual stops

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

			// ✅ Для мобильных: устанавливаем transcript СРАЗУ при любом результате
			// Не ждём final - на iOS Safari он может не прийти
			if (result.isFinal) {
				console.log(
					'[useSpeechRecognition] Final result, calling setTranscript with:',
					result.transcript
				);
				hasFinalResult = true;
				setTranscript(result.transcript);
				console.log('[useSpeechRecognition] setTranscript called (final)');
			} else if (result.transcript && result.transcript.length > 3) {
				// ✅ Interim с минимальной длиной (избегаем шум/мусор)
				console.log('[useSpeechRecognition] Interim result with length, calling setTranscript');
				setTranscript(result.transcript);
			}
		});

		speech.onEnd(() => {
			console.log(
				'[useSpeechRecognition] Speech ended, hasFinalResult:',
				hasFinalResult,
				'lastTranscript:',
				lastTranscript,
				'isManualStop:',
				isManualStopRef.current
			);
			setIsListening(false);

			// ✅ FIX: Если это ручная остановка - НЕ обрабатываем результаты
			if (isManualStopRef.current) {
				console.log('[useSpeechRecognition] Manual stop detected, skipping result processing');
				isManualStopRef.current = false; // Сбрасываем флаг
				return;
			}

			// ✅ FIX: Если НЕ было финального результата но есть последний - используем его
			if (!hasFinalResult && lastTranscript) {
				console.log(
					'[useSpeechRecognition] No final result, calling setTranscript with last interim:',
					lastTranscript
				);
				setTranscript(lastTranscript);
			}

			// ✅ REMOVED: Auto-restart logic removed for tap-to-record pattern
			// Recognition stops naturally, user taps again to record more
		});

		speech.onError((error) => {
			console.error('[useSpeechRecognition] Speech recognition error:', error);
			setIsListening(false);

			// Some errors (like no-speech) should trigger onEnd and thus restart
			// Others (not-allowed) should NOT restart
			if (error.message === 'Microphone access denied' || error.message === 'Permission denied') {
				isManualStopRef.current = true; // Prevent restart
			}
		});

		return () => {
			if (speech.isListening()) {
				speech.abort();
			}
		};
	}, [isSupported]); // ✅ Убираем transcript из зависимостей (не нужен)

	const startListening = useCallback(() => {
		if (!isSupported) {
			console.warn('[useSpeechRecognition] startListening called but not supported');
			return;
		}

		console.log('[useSpeechRecognition] startListening called');

		// ✅ FIX: Сбрасываем флаг ручной остановки при старте
		isManualStopRef.current = false;

		// ✅ CHANGED: Single-shot mode for reliability on Android/iOS
		// User taps to start, taps again to stop and send
		speech.startListening({
			language: 'ru-RU',
			continuous: false, // ✅ Single-shot mode (stops after one phrase)
			interimResults: true, // ✅ Show text while speaking
		});
	}, [isSupported]);

	const stopListening = useCallback(() => {
		console.log('[useSpeechRecognition] stopListening called');
		isManualStopRef.current = true; // ✅ FIX: Устанавливаем флаг ручной остановки
		speech.stopListening();
	}, []);

	const abortListening = useCallback(() => {
		console.log('[useSpeechRecognition] abortListening called');
		isManualStopRef.current = true; // ✅ FIX: Устанавливаем флаг ручной остановки
		speech.abort();
	}, []);

	const resetTranscript = useCallback(() => {
		console.log('[useSpeechRecognition] resetTranscript called');
		setTranscript('');
	}, []);

	return {
		isListening,
		transcript,
		startListening,
		stopListening,
		abortListening,
		resetTranscript,
		isSupported,
	};
}
