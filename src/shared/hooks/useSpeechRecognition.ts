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
	// ✅ FIX: Track restart attempts to prevent infinite loops
	const restartCountRef = useRef(0);
	const lastRestartTimeRef = useRef(0);

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

			// Reset restart count on successful start (if it runs for a bit)
			// But we do it carefully to not reset immediately if it crashes instantly
			setTimeout(() => {
				if (speech.isListening()) {
					restartCountRef.current = 0;
				}
			}, 1000);
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

			// ✅ FIX: Если это ручная остановка - НЕ обрабатываем результаты и НЕ перезапускаем
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

			// ✅ AUTO-RESTART LOGIC (Mobile PWA Support)
			// If not manually stopped, try to restart to simulate continuous listening
			const now = Date.now();
			const timeSinceLastRestart = now - lastRestartTimeRef.current;

			// Safety guard: max 5 restarts in 2 seconds
			if (timeSinceLastRestart < 2000 && restartCountRef.current > 5) {
				console.warn('[useSpeechRecognition] Too many rapid restarts, stopping to prevent loop');
				return;
			}

			if (timeSinceLastRestart > 2000) {
				// Reset count if it's been a while
				restartCountRef.current = 0;
			}

			console.log('[useSpeechRecognition] Auto-restarting speech recognition...');
			restartCountRef.current++;
			lastRestartTimeRef.current = now;

			// Small delay to let the engine cleanup
			setTimeout(() => {
				try {
					// Only restart if we are NOT manually stopped in the meantime
					if (!isManualStopRef.current) {
						speech.startListening({
							language: 'ru-RU',
							continuous: true,
							interimResults: true,
						});
					}
				} catch (e) {
					console.error('[useSpeechRecognition] Failed to auto-restart:', e);
				}
			}, 100);
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

	// ✅ FIX: Используем useCallback чтобы функция была стабильной
	const startListening = useCallback(() => {
		if (!isSupported) {
			console.warn('[useSpeechRecognition] startListening called but not supported');
			return;
		}

		console.log('[useSpeechRecognition] startListening called');

		// ✅ FIX: Сбрасываем флаг ручной остановки при старте
		isManualStopRef.current = false;
		restartCountRef.current = 0; // Reset safety counters

		// ✅ ВСЕГДА используем continuous=true для поддержки пауз (Gemini style)
		speech.startListening({
			language: 'ru-RU',
			continuous: true, // ✅ FIX: true - позволяет делать паузы
			interimResults: true,
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
