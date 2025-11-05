import { useCallback, useEffect, useRef, useState } from 'react';
import { speech } from '../lib/platform/speech';

type SpeechRecognitionHook = {
	isListening: boolean;
	transcript: string;
	startListening: () => void;
	stopListening: () => void;
	abortListening: () => void;
	isSupported: boolean;
};

export function useSpeechRecognition(): SpeechRecognitionHook {
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState('');
	const isManualStopRef = useRef(false); // ✅ FIX: Гард для предотвращения зацикливания

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
			// Это предотвращает зацикливание на мобильных
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
				console.log('[useSpeechRecognition] setTranscript called (interim from onEnd)');
			} else if (hasFinalResult) {
				console.log('[useSpeechRecognition] Final result already set, no action needed');
			} else {
				console.warn('[useSpeechRecognition] No result at all!');
			}

			// ✅ КРИТИЧНО для мобильных: ВСЕГДА останавливаем распознавание после onEnd
			// Это предотвращает автоматический перезапуск на мобильных браузерах
			// На десктопе это не нужно, но на мобильных Web Speech API может перезапуститься
			console.log(
				'[useSpeechRecognition] Calling speech.abort() to prevent auto-restart on mobile'
			);
			try {
				speech.abort();
			} catch (e) {
				console.warn('[useSpeechRecognition] Failed to abort after onEnd:', e);
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

	// ✅ FIX: Используем useCallback чтобы функция была стабильной
	// Это предотвращает повторные вызовы useEffect в VoicePoweredOrb
	const startListening = useCallback(() => {
		if (!isSupported) {
			console.warn('[useSpeechRecognition] startListening called but not supported');
			return;
		}

		console.log('[useSpeechRecognition] startListening called');

		// ⚠️ КРИТИЧНО: НЕ сбрасываем transcript здесь!
		// Это вызывало проблемы с useEffect в VoicePoweredOrb
		// setTranscript(''); // ❌ УБРАНО - сброс перенесен в VoicePoweredOrb при открытии

		// ✅ FIX: Сбрасываем флаг ручной остановки при старте
		isManualStopRef.current = false;

		// ✅ ВСЕГДА используем continuous=false чтобы избежать циклов на мобильных
		speech.startListening({
			language: 'ru-RU',
			continuous: false, // ✅ ВСЕГДА false - предотвращает зацикливание
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

	return {
		isListening,
		transcript,
		startListening,
		stopListening,
		abortListening,
		isSupported,
	};
}
