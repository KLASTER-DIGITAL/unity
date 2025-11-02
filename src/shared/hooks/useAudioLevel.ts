import { useEffect, useRef, useState } from 'react';

/**
 * Hook для получения реального уровня звука через Web Audio API
 * Используется для синхронизации WebGL орба с голосом пользователя
 */
export function useAudioLevel(isListening: boolean) {
	const [audioLevel, setAudioLevel] = useState(0);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const streamRef = useRef<MediaStream | null>(null);

	useEffect(() => {
		if (!isListening) {
			// Остановить анализ и очистить ресурсы
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}

			if (microphoneRef.current) {
				microphoneRef.current.disconnect();
				microphoneRef.current = null;
			}

			if (streamRef.current) {
				for (const track of streamRef.current.getTracks()) {
					track.stop();
				}
				streamRef.current = null;
			}

			if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
				audioContextRef.current.close();
				audioContextRef.current = null;
			}

			setAudioLevel(0);
			return;
		}

		// Инициализация Web Audio API
		const initAudio = async () => {
			try {
				// Получить доступ к микрофону
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				streamRef.current = stream;

				// Создать AudioContext
				const audioContext = new (
					window.AudioContext ||
					(window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
				)();
				audioContextRef.current = audioContext;

				// Создать AnalyserNode
				const analyser = audioContext.createAnalyser();
				analyser.fftSize = 256;
				analyser.smoothingTimeConstant = 0.8;
				analyserRef.current = analyser;

				// Подключить микрофон к analyser
				const microphone = audioContext.createMediaStreamSource(stream);
				microphoneRef.current = microphone;
				microphone.connect(analyser);

				// Буфер для данных
				const dataArray = new Uint8Array(analyser.frequencyBinCount);

				// Функция для обновления audioLevel
				const updateAudioLevel = () => {
					if (!analyserRef.current) return;

					analyser.getByteFrequencyData(dataArray);

					// Вычислить средний уровень
					let sum = 0;
					for (let i = 0; i < dataArray.length; i++) {
						sum += dataArray[i];
					}
					const average = sum / dataArray.length;

					// Нормализовать к диапазону 0-1
					const normalized = average / 255;

					// Плавная интерполяция (lerp) для smooth transitions
					setAudioLevel((prev) => {
						const lerp = 0.3; // Коэффициент сглаживания
						return prev + (normalized - prev) * lerp;
					});

					animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
				};

				updateAudioLevel();
			} catch (error) {
				console.error('[useAudioLevel] Failed to initialize audio:', error);
			}
		};

		initAudio();

		// Cleanup
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}

			if (microphoneRef.current) {
				microphoneRef.current.disconnect();
			}

			if (streamRef.current) {
				for (const track of streamRef.current.getTracks()) {
					track.stop();
				}
			}

			if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
				audioContextRef.current.close();
			}
		};
	}, [isListening]);

	return audioLevel;
}
