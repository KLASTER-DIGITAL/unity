import { useCallback, useEffect, useState } from 'react';
import { speech } from '../lib/platform/speech';

type SpeechRecognitionHook = {
	isListening: boolean;
	transcript: string;
	startListening: () => void;
	stopListening: () => void;
	isSupported: boolean;
	debugInfo: string; // ✅ DEBUG: информация для отладки
};

export function useSpeechRecognition(): SpeechRecognitionHook {
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState('');
	const [debugInfo, setDebugInfo] = useState(''); // ✅ DEBUG

	const isSupported = speech.isSupported();

	useEffect(() => {
		if (!isSupported) {
			return;
		}

		// ✅ FIX: Используем флаг для отслеживания финального результата
		// На мобильных браузерах Web Speech API может НЕ отправлять isFinal=true
		let lastTranscript = '';
		let hasFinalResult = false;
		let interimDebounceId: number | null = null; // ✅ Дебаунс для стабильного interim

		// Set up callbacks
		speech.onStart(() => {
			console.log('[useSpeechRecognition] Speech started');
			setDebugInfo('🎤 Запись началась'); // ✅ DEBUG
			lastTranscript = ''; // Сбрасываем при старте
			hasFinalResult = false; // Сбрасываем флаг
			if (interimDebounceId) {
				clearTimeout(interimDebounceId);
				interimDebounceId = null;
			}
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

			// ✅ DEBUG: показываем что получили
			setDebugInfo(
				`📝 ${result.isFinal ? 'FINAL' : 'interim'}: "${result.transcript.substring(0, 30)}..."`
			);

			// Если финальный результат - сразу устанавливаем
			if (result.isFinal) {
				console.log(
					'[useSpeechRecognition] Final result, calling setTranscript with:',
					result.transcript
				);
				hasFinalResult = true;
				setTranscript(result.transcript);
				console.log('[useSpeechRecognition] setTranscript called (final)');
				if (interimDebounceId) {
					clearTimeout(interimDebounceId);
					interimDebounceId = null;
				}
			} else {
				console.log('[useSpeechRecognition] Interim result, scheduling debounce setTranscript');
				// ✅ Мобильный кейс: если финал не приходит — берем стабильный interim через дебаунс
				if (interimDebounceId) {
					clearTimeout(interimDebounceId);
				}
				interimDebounceId = window.setTimeout(() => {
					if (!hasFinalResult && lastTranscript) {
						console.log('[useSpeechRecognition] Debounced interim, setTranscript');
						setDebugInfo(`✅ Debounced interim: "${lastTranscript.substring(0, 30)}..."`);
						setTranscript(lastTranscript);
					}
				}, 800);
			}
		});

		speech.onEnd(() => {
			console.log(
				'[useSpeechRecognition] Speech ended, hasFinalResult:',
				hasFinalResult,
				'lastTranscript:',
				lastTranscript
			);
			setIsListening(false);

			// ✅ FIX: Если НЕ было финального результата но есть последний - используем его
			if (!hasFinalResult && lastTranscript) {
				console.log(
					'[useSpeechRecognition] No final result, calling setTranscript with last interim:',
					lastTranscript
				);
				setDebugInfo(`✅ Используем interim: "${lastTranscript.substring(0, 30)}..."`); // ✅ DEBUG
				setTranscript(lastTranscript);
				console.log('[useSpeechRecognition] setTranscript called (interim from onEnd)');
			} else if (hasFinalResult) {
				console.log('[useSpeechRecognition] Final result already set, no action needed');
				setDebugInfo('✅ Получен финальный результат'); // ✅ DEBUG
			} else {
				console.warn('[useSpeechRecognition] No result at all!');
				setDebugInfo('❌ Нет результата'); // ✅ DEBUG
			}

			if (interimDebounceId) {
				clearTimeout(interimDebounceId);
				interimDebounceId = null;
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
			// Очистим возможный дебаунс при размонтаже
			if (interimDebounceId) {
				clearTimeout(interimDebounceId);
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

		speech.startListening({
			language: 'ru-RU',
			continuous: true, // ✅ ИЗМЕНЕНО: true для мобильных браузеров (дольше слушает)
			interimResults: true, // ✅ ВКЛЮЧАЕМ interim results для мобильных браузеров!
		});
	}, [isSupported]);

	const stopListening = useCallback(() => {
		console.log('[useSpeechRecognition] stopListening called');
		speech.stopListening();
	}, []);

	return {
		isListening,
		transcript,
		startListening,
		stopListening,
		isSupported,
		debugInfo, // ✅ DEBUG
	};
}
